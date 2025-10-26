import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'kristiyan@tsvweb.com'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details from Clerk to verify admin access
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 403 })
    }

    const userData = await response.json()
    const userEmail = userData.email_addresses?.find((email: any) => email.id === userData.primary_email_address_id)?.email_address

    if (userEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get analytics data for charts
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Revenue over time (last 30 days)
    const revenueData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

      try {
        const payments = await prisma.payment.findMany({
          where: {
            status: 'COMPLETED',
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        })

        const dayRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
        const platformFee = payments.reduce((sum, payment) => sum + Number(payment.platformFee), 0)

        revenueData.push({
          date: startOfDay.toISOString().split('T')[0],
          revenue: dayRevenue,
          platformFee: platformFee,
          bookings: payments.length
        })
      } catch (error) {
        // If database error, add zero data
        revenueData.push({
          date: startOfDay.toISOString().split('T')[0],
          revenue: 0,
          platformFee: 0,
          bookings: 0
        })
      }
    }

    // User signups over time (last 30 days)
    const userSignupData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

      try {
        const userCount = await prisma.user.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        })

        userSignupData.push({
          date: startOfDay.toISOString().split('T')[0],
          users: userCount
        })
      } catch (error) {
        userSignupData.push({
          date: startOfDay.toISOString().split('T')[0],
          users: 0
        })
      }
    }

    // Business distribution by status
    let businessStatusData = []
    try {
      const activeBusinesses = await prisma.business.count({ where: { isActive: true } })
      const inactiveBusinesses = await prisma.business.count({ where: { isActive: false } })
      
      businessStatusData = [
        { name: 'Active', value: activeBusinesses, color: '#10b981' },
        { name: 'Inactive', value: inactiveBusinesses, color: '#ef4444' }
      ]
    } catch (error) {
      businessStatusData = [
        { name: 'Active', value: 0, color: '#10b981' },
        { name: 'Inactive', value: 0, color: '#ef4444' }
      ]
    }

    // Top businesses by revenue
    let topBusinesses: Array<{
      name: string
      revenue: number
      bookings: number
    }> = []
    try {
      const businesses = await prisma.business.findMany({
        include: {
          _count: {
            select: {
              bookings: true
            }
          }
        }
      })

      const businessesWithRevenue = await Promise.all(
        businesses.map(async (business) => {
          try {
            const payments = await prisma.payment.findMany({
              where: {
                booking: {
                  businessId: business.id
                },
                status: 'COMPLETED'
              }
            })

            const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
            
            return {
              name: business.name,
              revenue: totalRevenue,
              bookings: business._count.bookings
            }
          } catch (error) {
            return {
              name: business.name,
              revenue: 0,
              bookings: business._count.bookings
            }
          }
        })
      )

      topBusinesses = businessesWithRevenue
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
    } catch (error) {
      topBusinesses = []
    }

    // Booking trends (last 7 days)
    const bookingTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

      try {
        const bookingCount = await prisma.booking.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        })

        bookingTrends.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          bookings: bookingCount
        })
      } catch (error) {
        bookingTrends.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          bookings: 0
        })
      }
    }

    return NextResponse.json({
      revenueData,
      userSignupData,
      businessStatusData,
      topBusinesses,
      bookingTrends
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Error fetching analytics' },
      { status: 500 }
    )
  }
}
