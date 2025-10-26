import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            services: true,
            staff: true,
            bookings: {
              include: {
                service: true,
                staff: true
              },
              orderBy: {
                startTime: 'desc'
              },
              take: 10
            },
            subscriptions: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // If user doesn't have a business, create one
    let business
    if (user.businesses.length === 0) {
      business = await prisma.business.create({
        data: {
          name: `${user.firstName || 'My'} Beauty Business`,
          ownerId: user.id
        },
        include: {
          services: true,
          staff: true,
          bookings: {
            include: {
              service: true,
              staff: true
            },
            orderBy: {
              startTime: 'desc'
            },
            take: 10
          },
          subscriptions: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      })
    } else {
      business = user.businesses[0] // Get first business
    }
    
    // Calculate dashboard metrics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    // Get today's bookings
    const todayBookings = await prisma.booking.count({
      where: {
        businessId: business.id,
        startTime: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Get today's revenue
    const todayRevenue = await prisma.booking.aggregate({
      where: {
        businessId: business.id,
        startTime: {
          gte: today,
          lt: tomorrow
        },
        status: 'COMPLETED'
      },
      _sum: {
        totalAmount: true
      }
    })

    // Get this week's bookings
    const weeklyBookings = await prisma.booking.count({
      where: {
        businessId: business.id,
        startTime: {
          gte: weekStart,
          lt: weekEnd
        }
      }
    })

    // Get this week's revenue
    const weeklyRevenue = await prisma.booking.aggregate({
      where: {
        businessId: business.id,
        startTime: {
          gte: weekStart,
          lt: weekEnd
        },
        status: 'COMPLETED'
      },
      _sum: {
        totalAmount: true
      }
    })

    // Get upcoming bookings
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        startTime: {
          gte: new Date()
        }
      },
      include: {
        service: true,
        staff: true
      },
      orderBy: {
        startTime: 'asc'
      },
      take: 5
    })

    const dashboardData = {
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        phone: business.phone,
        address: business.address,
        servicesCount: business.services.length,
        staffCount: business.staff.length,
        services: business.services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: Number(service.price),
          category: service.category
        }))
      },
      metrics: {
        todayBookings,
        todayRevenue: todayRevenue._sum.totalAmount || 0,
        weeklyBookings,
        weeklyRevenue: weeklyRevenue._sum.totalAmount || 0
      },
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        clientName: booking.clientName,
        serviceName: booking.service.name,
        staffName: `${booking.staff.firstName} ${booking.staff.lastName}`,
        startTime: booking.startTime,
        totalAmount: booking.totalAmount
      })),
      recentBookings: business.bookings.map(booking => ({
        id: booking.id,
        clientName: booking.clientName,
        serviceName: booking.service.name,
        staffName: `${booking.staff.firstName} ${booking.staff.lastName}`,
        startTime: booking.startTime,
        status: booking.status,
        totalAmount: booking.totalAmount
      })),
      subscription: business.subscriptions[0] || null,
      hasBusiness: true
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Error fetching dashboard data' },
      { status: 500 }
    )
  }
}
