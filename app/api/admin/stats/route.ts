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

    // Calculate real statistics from database
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Initialize default values
    let totalUsers = 0
    let totalBusinesses = 0
    let activeBusinesses = 0
    let totalBookings = 0
    let recentSignups = 0
    let lastMonthSignups = 0
    let totalRevenue = 0
    let platformRevenue = 0

    try {
      // Total users count
      totalUsers = await prisma.user.count()
    } catch (error) {
      console.log('Error fetching user count:', error)
    }

    try {
      // Total businesses count
      totalBusinesses = await prisma.business.count()
    } catch (error) {
      console.log('Error fetching business count:', error)
    }

    try {
      // Active businesses (have at least one booking in last 30 days)
      activeBusinesses = await prisma.business.count({
        where: {
          bookings: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          }
        }
      })
    } catch (error) {
      console.log('Error fetching active businesses:', error)
    }

    try {
      // Total bookings
      totalBookings = await prisma.booking.count()
    } catch (error) {
      console.log('Error fetching booking count:', error)
    }

    try {
      // Recent signups (this month)
      recentSignups = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      })
    } catch (error) {
      console.log('Error fetching recent signups:', error)
    }

    try {
      // Last month signups for growth calculation
      lastMonthSignups = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      })
    } catch (error) {
      console.log('Error fetching last month signups:', error)
    }

    // Calculate monthly growth
    const monthlyGrowth = lastMonthSignups > 0 
      ? ((recentSignups - lastMonthSignups) / lastMonthSignups) * 100 
      : 0

    try {
      // Revenue calculations
      const completedPayments = await prisma.payment.findMany({
        where: {
          status: 'COMPLETED'
        }
      })

      totalRevenue = completedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)
      platformRevenue = completedPayments.reduce((sum, payment) => sum + Number(payment.platformFee), 0)
    } catch (error) {
      console.log('Error fetching payments:', error)
    }

    const stats = {
      totalUsers,
      totalBusinesses,
      totalBookings,
      totalRevenue,
      platformRevenue,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      activeUsers: activeBusinesses,
      recentSignups
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Error fetching admin statistics' },
      { status: 500 }
    )
  }
}
