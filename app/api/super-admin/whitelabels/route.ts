import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Get all whitelabel businesses for super admin
 */
export async function GET(req: NextRequest) {
  try {
    // Verify super admin authorization
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get all businesses with whitelabel config
    const businesses = await prisma.business.findMany({
      where: {
        whitelabelConfig: {
          isNot: null
        }
      },
      include: {
        whitelabelConfig: true,
        owner: {
          select: {
            email: true,
            clerkId: true
          }
        },
        bookings: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats for each business
    const formattedBusinesses = businesses.map(business => {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const totalBookings = business.bookings?.length || 0
      const monthlyBookings = business.bookings?.filter(b => 
        new Date(b.createdAt) >= monthStart
      ) || []

      const totalRevenue = business.bookings?.reduce((sum, booking) => {
        if (booking.status === 'COMPLETED') {
          return sum + Number(booking.totalAmount)
        }
        return sum
      }, 0) || 0

      const monthlyRevenue = monthlyBookings.reduce((sum, booking) => {
        if (booking.status === 'COMPLETED') {
          return sum + Number(booking.totalAmount)
        }
        return sum
      }, 0)

      // Calculate platform fees earned
      const platformFee = Number(business.whitelabelConfig?.platformFeePercentage || 1.0)
      const platformRevenue = Number(totalRevenue) * (platformFee / 100)

      return {
        id: business.id,
        name: business.name,
        subdomain: business.whitelabelConfig?.subdomain || '',
        brandName: business.whitelabelConfig?.brandName || business.name,
        isActive: business.isActive,
        createdAt: business.createdAt.toISOString(),
        platformFeePercentage: business.whitelabelConfig?.platformFeePercentage || 1.0,
        monthlyFee: business.whitelabelConfig?.monthlyFee || 0,
        totalBookings,
        monthlyRevenue: platformRevenue,
        ownerEmail: business.owner?.email || 'N/A'
      }
    })

    // Calculate platform-wide stats
    const stats = {
      totalWhitelabels: businesses.length,
      activeWhitelabels: businesses.filter(b => b.isActive).length,
      totalRevenue: formattedBusinesses.reduce((sum, b) => sum + b.monthlyRevenue, 0),
      monthlyRevenue: formattedBusinesses.reduce((sum, b) => sum + b.monthlyRevenue, 0),
      totalBookings: formattedBusinesses.reduce((sum, b) => sum + b.totalBookings, 0),
      totalUsers: 0 // TODO: Calculate total users across all platforms
    }

    return NextResponse.json({
      businesses: formattedBusinesses,
      stats
    })
  } catch (error) {
    console.error('Error fetching whitelabel businesses:', error)
    return NextResponse.json(
      { error: 'Error fetching whitelabel businesses' },
      { status: 500 }
    )
  }
}
