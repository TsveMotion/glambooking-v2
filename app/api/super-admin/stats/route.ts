import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Get platform-wide statistics for super admin
 */
export async function GET(req: NextRequest) {
  try {
    // Verify super admin authorization
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get all stats in parallel
    const [
      totalUsers,
      totalBusinesses,
      activeBusinesses,
      totalBookings,
      completedBookings,
      totalRevenue,
      whitelabelBusinesses,
      activeWhitelabels,
      recentSignups,
      monthlyBookings
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total businesses
      prisma.business.count(),
      
      // Active businesses
      prisma.business.count({
        where: { isActive: true }
      }),
      
      // Total bookings
      prisma.booking.count(),
      
      // Completed bookings
      prisma.booking.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Total revenue (sum of completed booking amounts)
      prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true }
      }),
      
      // Whitelabel businesses
      prisma.business.count({
        where: { isWhiteLabel: true }
      }),
      
      // Active whitelabels
      prisma.business.count({
        where: { 
          isWhiteLabel: true,
          isActive: true 
        }
      }),
      
      // Recent signups (last 30 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Monthly bookings (last 30 days)
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Calculate platform revenue (1% of total revenue as example)
    const totalRevenueAmount = Number(totalRevenue._sum.totalAmount || 0)
    const platformRevenue = totalRevenueAmount * 0.01 // 1% platform fee

    return NextResponse.json({
      totalUsers,
      totalBusinesses,
      activeBusinesses,
      totalBookings,
      completedBookings,
      totalRevenue: totalRevenueAmount,
      platformRevenue,
      whitelabelBusinesses,
      activeWhitelabels,
      recentSignups,
      monthlyBookings,
      averageBookingValue: totalBookings > 0 ? totalRevenueAmount / totalBookings : 0,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
    })
  } catch (error) {
    console.error('Error fetching super admin stats:', error)
    return NextResponse.json(
      { error: 'Error fetching statistics' },
      { status: 500 }
    )
  }
}
