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
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch Clerk user data
    const clerkUser = await clerkClient.users.getUser(userId)
    
    // Find user and business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            subscriptions: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            },
            bookings: {
              where: {
                createdAt: {
                  gte: new Date(new Date().getFullYear(), 0, 1) // This year
                }
              }
            },
            services: true,
            staff: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    const business = user.businesses[0]
    
    if (!business) {
      return NextResponse.json({ 
        error: 'No business found for user' 
      }, { status: 404 })
    }

    // Calculate business stats
    const totalBookings = business.bookings.length
    const completedBookings = business.bookings.filter(b => b.status === 'COMPLETED').length
    const totalRevenue = business.bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, booking) => sum + Number(booking.totalAmount), 0)

    const profileData = {
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      clerkUser: {
        id: clerkUser.id,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        emailAddresses: clerkUser.emailAddresses,
        phoneNumbers: clerkUser.phoneNumbers,
        imageUrl: clerkUser.imageUrl,
        username: clerkUser.username,
        createdAt: clerkUser.createdAt,
        updatedAt: clerkUser.updatedAt,
        lastSignInAt: clerkUser.lastSignInAt,
        twoFactorEnabled: clerkUser.twoFactorEnabled,
        banned: clerkUser.banned,
        locked: clerkUser.locked,
        externalAccounts: clerkUser.externalAccounts
      },
      business: {
        id: business.id,
        name: business.name,
        description: business.description,
        address: business.address,
        phone: business.phone,
        email: business.email,
        website: business.website,
        imageUrl: business.imageUrl,
        isActive: business.isActive,
        stripeOnboarded: business.stripeOnboarded,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt,
        servicesCount: business.services.length,
        staffCount: business.staff.length + 1 // Include owner as 1 member
      },
      subscription: business.subscriptions[0] || null,
      stats: {
        totalBookings,
        completedBookings,
        totalRevenue,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0
      }
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error('Error fetching profile data:', error)
    return NextResponse.json(
      { error: 'Error fetching profile data' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { business: businessData, user: userData } = await req.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Update user data if provided
    if (userData) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email
        }
      })
    }

    // Update business data if provided
    if (businessData && user.businesses[0]) {
      await prisma.business.update({
        where: { id: user.businesses[0].id },
        data: {
          name: businessData.name,
          description: businessData.description,
          address: businessData.address,
          phone: businessData.phone,
          email: businessData.email,
          website: businessData.website
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    )
  }
}
