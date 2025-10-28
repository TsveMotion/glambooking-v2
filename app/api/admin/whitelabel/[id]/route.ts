import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Get white-label business details by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Check if user is admin
    
    const businessId = params.id

    // @ts-ignore - Prisma types will be correct after generation
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        whitelabelConfig: true,
        bookings: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
            status: true
          }
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Calculate statistics
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const totalBookings = business.bookings?.length || 0
    const monthlyBookings = business.bookings?.filter((b: any) => 
      new Date(b.createdAt) >= monthStart
    ) || []
    
    const monthlyRevenue = monthlyBookings.reduce((sum: number, booking: any) => {
      if (booking.status === 'COMPLETED') {
        return sum + (Number(booking.totalAmount) * 0.01) // 1% platform fee
      }
      return sum
    }, 0)

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        customDomain: business.whitelabelConfig?.customDomain || null,
        subdomain: business.whitelabelConfig?.subdomain || null,
        brandName: business.whitelabelConfig?.brandName || business.name,
        logoUrl: business.whitelabelConfig?.logoUrl || null,
        primaryColor: business.whitelabelConfig?.primaryColor || '#E91E63',
        secondaryColor: business.whitelabelConfig?.secondaryColor || '#FFD700',
        accentColor: business.whitelabelConfig?.accentColor || '#333333',
        platformFeePercentage: business.whitelabelConfig?.platformFeePercentage || 1.0,
        monthlyFee: business.whitelabelConfig?.monthlyFee || 200,
        isActive: business.whitelabelConfig?.isActive ?? true,
        subscriptionStatus: business.whitelabelConfig?.subscriptionStatus || 'active',
        nextBillingDate: business.whitelabelConfig?.nextBillingDate || null,
        stripeCustomerId: business.stripeCustomerId || null,
        stripeSubscriptionId: business.whitelabelConfig?.stripeSubscriptionId || null,
        createdAt: business.createdAt,
        totalBookings,
        monthlyRevenue
      }
    })
  } catch (error) {
    console.error('Error fetching white-label business:', error)
    return NextResponse.json(
      { error: 'Error fetching business details' },
      { status: 500 }
    )
  }
}
