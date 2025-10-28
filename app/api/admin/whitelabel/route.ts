import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check
    // For now, allow any authenticated user to access
    
    // Fetch all white-label businesses
    const businesses = await prisma.business.findMany({
      where: {
        isWhiteLabel: true
      },
      include: {
        whitelabelConfig: true,
        bookings: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats for each business
    const businessesWithStats = businesses.map(business => {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const monthlyBookings = business.bookings.filter(
        b => new Date(b.createdAt) >= monthStart
      )
      
      const monthlyRevenue = monthlyBookings.reduce(
        (sum, b) => sum + Number(b.totalAmount), 0
      )
      
      // Calculate platform revenue (1% of bookings)
      const platformFeePercentage = business.whitelabelConfig?.platformFeePercentage || 1.0
      const platformRevenue = monthlyRevenue * (Number(platformFeePercentage) / 100)

      return {
        id: business.id,
        name: business.name,
        customDomain: business.whitelabelConfig?.customDomain,
        subdomain: business.whitelabelConfig?.subdomain,
        isActive: business.whitelabelConfig?.isActive || false,
        platformFeePercentage: Number(business.whitelabelConfig?.platformFeePercentage || 1.0),
        monthlyFee: Number(business.whitelabelConfig?.monthlyFee || 200),
        subscriptionStatus: business.whitelabelConfig?.subscriptionStatus || 'inactive',
        totalBookings: business.bookings.length,
        monthlyRevenue: platformRevenue,
        createdAt: business.createdAt.toISOString()
      }
    })

    return NextResponse.json({
      businesses: businessesWithStats,
      total: businesses.length,
      active: businessesWithStats.filter(b => b.isActive).length
    })
  } catch (error) {
    console.error('Error fetching white-label businesses:', error)
    return NextResponse.json(
      { error: 'Error fetching white-label businesses' },
      { status: 500 }
    )
  }
}
