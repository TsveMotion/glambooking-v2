import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Get platform-wide analytics for super admin
 */
export async function GET(req: NextRequest) {
  try {
    // Verify super admin authorization
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get last 30 days of data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get bookings for revenue trends
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        },
        status: 'COMPLETED'
      },
      select: {
        createdAt: true,
        totalAmount: true,
        business: {
          select: {
            bookingFeePercentage: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group bookings by date for revenue chart
    const revenueByDate = new Map<string, { revenue: number; platformFee: number }>()
    
    bookings.forEach(booking => {
      const date = booking.createdAt.toISOString().split('T')[0]
      const revenue = Number(booking.totalAmount)
      const platformFee = revenue * (Number(booking.business.bookingFeePercentage) / 100)
      
      if (!revenueByDate.has(date)) {
        revenueByDate.set(date, { revenue: 0, platformFee: 0 })
      }
      
      const current = revenueByDate.get(date)!
      current.revenue += revenue
      current.platformFee += platformFee
    })

    const revenueData = Array.from(revenueByDate.entries()).map(([date, data]) => ({
      date,
      revenue: Number(data.revenue.toFixed(2)),
      platformFee: Number(data.platformFee.toFixed(2))
    }))

    // Get user signups by date
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const usersByDate = new Map<string, number>()
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0]
      usersByDate.set(date, (usersByDate.get(date) || 0) + 1)
    })

    const userSignupData = Array.from(usersByDate.entries()).map(([date, users]) => ({
      date,
      users
    }))

    // Get booking trends by day of week
    const allBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    })

    const bookingsByDay = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    allBookings.forEach(booking => {
      const dayName = dayNames[booking.createdAt.getDay()]
      bookingsByDay[dayName as keyof typeof bookingsByDay]++
    })

    const bookingTrends = Object.entries(bookingsByDay).map(([day, bookings]) => ({
      day,
      bookings
    }))

    // Get business status distribution
    const [activeBusinesses, inactiveBusinesses, whitelabelBusinesses] = await Promise.all([
      prisma.business.count({ where: { isActive: true } }),
      prisma.business.count({ where: { isActive: false } }),
      prisma.business.count({ where: { isWhiteLabel: true } })
    ])

    const businessStatusData = [
      { name: 'Active', value: activeBusinesses, color: '#10b981' },
      { name: 'Inactive', value: inactiveBusinesses, color: '#ef4444' },
      { name: 'White-Label', value: whitelabelBusinesses, color: '#3b82f6' }
    ]

    // Get top businesses by revenue
    const businessesWithRevenue = await prisma.business.findMany({
      include: {
        bookings: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            totalAmount: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      take: 10
    })

    const topBusinesses = businessesWithRevenue
      .map(business => ({
        name: business.name,
        revenue: business.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0),
        bookings: business._count.bookings
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return NextResponse.json({
      revenueData,
      userSignupData,
      bookingTrends,
      businessStatusData,
      topBusinesses
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Error fetching analytics' },
      { status: 500 }
    )
  }
}
