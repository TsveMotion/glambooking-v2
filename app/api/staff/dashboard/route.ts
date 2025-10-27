import { NextRequest, NextResponse } from 'next/server'
import { auth, createClerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    console.log('=== STAFF DASHBOARD API ===')
    console.log('User ID:', userId)
    
    if (!userId) {
      console.log('No user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    console.log('User found:', user ? user.id : 'not found')

    if (!user) {
      console.log('User not found in database - attempting auto-setup')
      
      try {
        // Get user from Clerk
        const clerkUser = await clerkClient.users.getUser(userId)
        const primaryEmail = clerkUser.emailAddresses.find(email => 
          email.id === clerkUser.primaryEmailAddressId
        )?.emailAddress

        if (!primaryEmail) {
          return NextResponse.json({ error: 'No email found' }, { status: 400 })
        }

        console.log('Creating user record for:', primaryEmail)
        
        // Create user record
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: primaryEmail,
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null,
            imageUrl: clerkUser.imageUrl || null
          }
        })

        console.log('User created:', user.id)

        // Look for any invitation (PENDING or COMPLETED)
        const invitation = await prisma.teamInvitation.findFirst({
          where: {
            email: primaryEmail,
            status: {
              in: ['PENDING', 'COMPLETED']
            }
          }
        })

        if (invitation) {
          console.log('Found invitation, checking if staff record exists')
          
          // Check if staff record already exists
          const existingStaff = await prisma.staff.findFirst({
            where: {
              email: primaryEmail,
              businessId: invitation.businessId
            }
          })

          if (!existingStaff) {
            console.log('Creating staff record')
            
            // Create staff record
            await prisma.staff.create({
              data: {
                firstName: invitation.firstName,
                lastName: invitation.lastName,
                email: invitation.email,
                phone: invitation.phone,
                role: invitation.role,
                isActive: true,
                businessId: invitation.businessId,
                userId: user.id
              }
            })

            console.log('Staff record created')
          } else {
            console.log('Staff record already exists, updating userId')
            
            // Update existing staff record with userId
            await prisma.staff.update({
              where: { id: existingStaff.id },
              data: { userId: user.id }
            })
          }

          // Update invitation status
          if (invitation.status !== 'ACCEPTED') {
            await prisma.teamInvitation.update({
              where: { id: invitation.id },
              data: { status: 'ACCEPTED' }
            })
          }

          console.log('Staff setup completed')
        }

      } catch (setupError) {
        console.error('Auto-setup error:', setupError)
        return NextResponse.json({ 
          error: 'User setup failed' 
        }, { status: 500 })
      }
    }

    // Find staff record for this user by userId first, then by email as fallback
    console.log('Looking for staff record by userId:', user.id)
    let staffRecord = await prisma.staff.findFirst({
      where: { 
        userId: user.id
      },
      include: {
        business: {
          select: {
            name: true,
            address: true,
            phone: true
          }
        }
      }
    })

    console.log('Staff record by userId:', staffRecord ? staffRecord.id : 'not found')

    // Fallback to email lookup if no userId match
    if (!staffRecord) {
      console.log('Looking for staff record by email:', user.email)
      staffRecord = await prisma.staff.findFirst({
        where: { 
          email: user.email
        },
        include: {
          business: {
            select: {
              name: true,
              address: true,
              phone: true
            }
          }
        }
      })

      console.log('Staff record by email:', staffRecord ? staffRecord.id : 'not found')

      // If found by email, update the userId for future lookups
      if (staffRecord) {
        console.log('Updating staff record with userId')
        await prisma.staff.update({
          where: { id: staffRecord.id },
          data: { userId: user.id }
        })
      }
    }

    if (!staffRecord) {
      console.log('No staff record found for user - checking for invitation')
      
      // Try to create staff record from invitation
      try {
        const invitation = await prisma.teamInvitation.findFirst({
          where: {
            email: user.email,
            status: {
              in: ['PENDING', 'COMPLETED']
            }
          }
        })

        if (invitation) {
          console.log('Found invitation, creating staff record')
          
          // Create staff record
          staffRecord = await prisma.staff.create({
            data: {
              firstName: invitation.firstName,
              lastName: invitation.lastName,
              email: invitation.email,
              phone: invitation.phone,
              role: invitation.role,
              isActive: true,
              businessId: invitation.businessId,
              userId: user.id
            },
            include: {
              business: {
                select: {
                  name: true,
                  address: true,
                  phone: true
                }
              }
            }
          })

          // Update invitation status
          if (invitation.status !== 'ACCEPTED') {
            await prisma.teamInvitation.update({
              where: { id: invitation.id },
              data: { status: 'ACCEPTED' }
            })
          }

          console.log('Staff record created from invitation:', staffRecord.id)
        } else {
          console.log('No invitation found for user')
          return NextResponse.json({ 
            error: 'Staff record not found and no invitation available' 
          }, { status: 404 })
        }
      } catch (setupError) {
        console.error('Error creating staff record from invitation:', setupError)
        return NextResponse.json({ 
          error: 'Staff record not found' 
        }, { status: 404 })
      }
    }

    console.log('Staff record found:', staffRecord.id, 'Role:', staffRecord.role)

    // Get real dashboard data
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Today's bookings count
    const todayBookings = await prisma.booking.count({
      where: {
        staffId: staffRecord.id,
        startTime: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // This week's bookings count
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const weekBookings = await prisma.booking.count({
      where: {
        staffId: staffRecord.id,
        startTime: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      }
    })

    // This month's revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    const monthBookings = await prisma.booking.findMany({
      where: {
        staffId: staffRecord.id,
        status: 'COMPLETED',
        startTime: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      },
      include: {
        payments: {
          where: {
            status: 'COMPLETED'
          }
        }
      }
    })

    // Get business commission rate
    const business = await prisma.business.findUnique({
      where: { id: staffRecord.businessId },
      include: {
        customization: true
      }
    })

    const businessSettings = business?.customization?.settings as any
    const commissionRate = businessSettings?.staffCommissionRate || 60

    const monthRevenue = monthBookings.reduce((sum, booking) => {
      const paymentTotal = booking.payments.reduce((paySum, payment) => 
        paySum + parseFloat(payment.amount.toString()), 0)
      return sum + (paymentTotal * commissionRate / 100)
    }, 0)

    // Upcoming bookings (next 7 days)
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        staffId: staffRecord.id,
        startTime: {
          gte: today,
          lte: nextWeek
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      },
      take: 5
    })

    const formattedUpcomingBookings = upcomingBookings.map(booking => ({
      id: booking.id,
      clientName: booking.clientName,
      serviceName: booking.service.name,
      startTime: booking.startTime.toISOString(),
      duration: booking.service.duration
    }))

    const staffData = {
      id: staffRecord.id,
      firstName: staffRecord.firstName,
      lastName: staffRecord.lastName,
      email: staffRecord.email || user.email,
      phone: staffRecord.phone,
      role: staffRecord.role,
      business: staffRecord.business,
      todayBookings,
      weekBookings,
      monthRevenue: parseFloat(monthRevenue.toFixed(2)),
      upcomingBookings: formattedUpcomingBookings
    }

    return NextResponse.json(staffData)
  } catch (error) {
    console.error('Error fetching staff dashboard data:', error)
    return NextResponse.json(
      { error: 'Error fetching dashboard data' },
      { status: 500 }
    )
  }
}

