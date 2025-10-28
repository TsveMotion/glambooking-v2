import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Get all businesses for super admin
 */
export async function GET(req: NextRequest) {
  try {
    // Verify super admin authorization
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const businesses = await prisma.business.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        whitelabelConfig: true,
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

    const formattedBusinesses = businesses.map(business => {
      const totalRevenue = business.bookings.reduce(
        (sum, booking) => sum + Number(booking.totalAmount),
        0
      )
      
      const platformRevenue = totalRevenue * (Number(business.bookingFeePercentage) / 100)
      
      // Calculate monthly revenue (last 30 days)
      const monthStart = new Date()
      monthStart.setDate(monthStart.getDate() - 30)
      
      const monthlyRevenue = business.bookings
        .filter(b => new Date(b.createdAt) >= monthStart)
        .reduce((sum, booking) => sum + Number(booking.totalAmount), 0)

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
        whitelabelConfig: business.whitelabelConfig,
        bookingCount: business._count.bookings,
        serviceCount: business._count.services,
        staffCount: business._count.staff,
        clientCount: business._count.clients,
        totalRevenue,
        monthlyRevenue,
        platformRevenue,
        bookingFeePercentage: Number(business.bookingFeePercentage)
      }
    })

    return NextResponse.json({
      businesses: formattedBusinesses,
      total: formattedBusinesses.length
    })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Error fetching businesses' },
      { status: 500 }
    )
  }
}
