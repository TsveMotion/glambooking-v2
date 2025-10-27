import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get staff record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        staff: true
      }
    })

    if (!user || !user.staff.length) {
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }

    const staff = user.staff[0]

    // Get clients who have bookings with this staff member
    const clientsWithBookings = await prisma.booking.findMany({
      where: {
        staffId: staff.id,
        clientEmail: {
          not: null
        }
      },
      select: {
        clientEmail: true
      },
      distinct: ['clientEmail']
    })

    const clientEmails = clientsWithBookings.map(b => b.clientEmail).filter(Boolean)

    if (clientEmails.length === 0) {
      return NextResponse.json({ clients: [] })
    }

    // Get client records for these emails
    const clients = await prisma.client.findMany({
      where: {
        businessId: staff.businessId,
        email: {
          in: clientEmails
        }
      }
    })

    const formattedClients = await Promise.all(
      clients.map(async (client) => {
        // Get bookings for this specific client with this staff member
        const clientBookings = await prisma.booking.findMany({
          where: {
            staffId: staff.id,
            clientEmail: client.email
          },
          include: {
            service: true,
            payments: {
              where: {
                status: 'COMPLETED'
              }
            }
          },
          orderBy: {
            startTime: 'desc'
          }
        })

        // Calculate statistics
        const totalBookings = clientBookings.length
        const completedBookings = clientBookings.filter(b => b.status === 'COMPLETED')
        const totalSpent = completedBookings.reduce((sum, booking) => {
          const paymentTotal = booking.payments.reduce((paySum, payment) => 
            paySum + parseFloat(payment.amount.toString()), 0)
          return sum + paymentTotal
        }, 0)

        // Get favorite services (most booked services)
        const serviceCount: { [key: string]: number } = {}
        clientBookings.forEach(booking => {
          const serviceName = booking.service.name
          serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1
        })
        
        const favoriteServices = Object.entries(serviceCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([service]) => service)

        // Get last visit and next appointment
        const lastVisit = completedBookings.length > 0 
          ? completedBookings[0].startTime.toISOString().split('T')[0]
          : null

        const upcomingBookings = clientBookings.filter(b => 
          b.startTime > new Date() && ['PENDING', 'CONFIRMED'].includes(b.status)
        )
        const nextAppointment = upcomingBookings.length > 0
          ? upcomingBookings[0].startTime.toISOString().split('T')[0]
          : null

        // Calculate rating (based on completed bookings - simple metric)
        const rating = completedBookings.length >= 5 ? 5 : 
                      completedBookings.length >= 3 ? 4 : 
                      completedBookings.length >= 1 ? 3 : 2

        // Determine status (active if booked in last 3 months)
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        const recentBookings = clientBookings.filter(b => b.startTime > threeMonthsAgo)
        const status = recentBookings.length > 0 ? 'active' : 'inactive'

        return {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
          totalBookings,
          totalSpent,
          lastVisit,
          nextAppointment,
          favoriteServices,
          notes: client.notes,
          rating,
          status,
          joinDate: client.createdAt.toISOString().split('T')[0]
        }
      })
    )

    return NextResponse.json({ clients: formattedClients })

  } catch (error) {
    console.error('Staff clients error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}
