import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Get ALL businesses created by users (not whitelabel parent businesses)
 * Shows which whitelabel subdomain each business is associated with
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get all businesses that are marked as whitelabel (created under a subdomain)
    // OR regular businesses not associated with any whitelabel config
    const businesses = await prisma.business.findMany({
      where: {
        // Exclude whitelabel parent businesses (those that HAVE a whitelabelConfig)
        whitelabelConfig: null
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            bookings: true,
            services: true,
            staff: true,
            clients: true
          }
        },
        bookings: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            totalAmount: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // For each business, try to find which whitelabel it belongs to
    // by checking if there's a whitelabel with the same owner or related criteria
    const formattedBusinesses = await Promise.all(businesses.map(async (business) => {
      const totalRevenue = business.bookings.reduce(
        (sum, booking) => sum + Number(booking.totalAmount),
        0
      )
      
      const platformRevenue = totalRevenue * (Number(business.bookingFeePercentage) / 100)
      
      const monthStart = new Date()
      monthStart.setDate(monthStart.getDate() - 30)
      
      const monthlyRevenue = business.bookings
        .filter(b => new Date(b.createdAt) >= monthStart)
        .reduce((sum, booking) => sum + Number(booking.totalAmount), 0)

      // Try to find associated whitelabel
      // Check if owner has a whitelabel business
      let whitelabelAssociation = null
      if (business.isWhiteLabel) {
        const ownerWhitelabel = await prisma.business.findFirst({
          where: {
            ownerId: business.ownerId,
            whitelabelConfig: {
              isNot: null
            }
          },
          include: {
            whitelabelConfig: {
              select: {
                subdomain: true,
                brandName: true,
                platformFeePercentage: true,
                monthlyFee: true
              }
            }
          }
        })

        if (ownerWhitelabel?.whitelabelConfig) {
          whitelabelAssociation = {
            subdomain: ownerWhitelabel.whitelabelConfig.subdomain,
            brandName: ownerWhitelabel.whitelabelConfig.brandName,
            businessId: ownerWhitelabel.id,
            businessName: ownerWhitelabel.name
          }
        }
      }

      return {
        id: business.id,
        name: business.name,
        description: business.description,
        email: business.email,
        phone: business.phone,
        address: business.address,
        imageUrl: business.imageUrl,
        isActive: business.isActive,
        isWhiteLabel: business.isWhiteLabel,
        stripeOnboarded: business.stripeOnboarded,
        plan: business.plan,
        createdAt: business.createdAt.toISOString(),
        owner: business.owner,
        whitelabelAssociation,
        bookingCount: business._count.bookings,
        serviceCount: business._count.services,
        staffCount: business._count.staff,
        clientCount: business._count.clients,
        totalRevenue,
        monthlyRevenue,
        platformRevenue,
        bookingFeePercentage: Number(business.bookingFeePercentage)
      }
    }))

    // Group by whitelabel association
    const grouped = formattedBusinesses.reduce((acc: any, business) => {
      const key = business.whitelabelAssociation?.subdomain || 'direct'
      if (!acc[key]) {
        acc[key] = {
          whitelabel: business.whitelabelAssociation,
          businesses: [],
          count: 0,
          totalRevenue: 0,
          totalPlatformRevenue: 0
        }
      }
      acc[key].businesses.push(business)
      acc[key].count++
      acc[key].totalRevenue += business.totalRevenue
      acc[key].totalPlatformRevenue += business.platformRevenue
      return acc
    }, {})

    return NextResponse.json({
      businesses: formattedBusinesses,
      total: formattedBusinesses.length,
      groupedByWhitelabel: grouped
    })
  } catch (error) {
    console.error('Error fetching sub-businesses:', error)
    return NextResponse.json(
      { error: 'Error fetching sub-businesses' },
      { status: 500 }
    )
  }
}
