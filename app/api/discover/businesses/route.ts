import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Get all active businesses for discover page
 * Returns businesses regardless of whitelabel status
 */
export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      where: {
        isActive: true,
        // Exclude whitelabel parent businesses (those that have a whitelabelConfig)
        whitelabelConfig: null
      },
      include: {
        _count: {
          select: {
            services: true,
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedBusinesses = businesses.map(business => ({
      id: business.id,
      name: business.name,
      description: business.description,
      email: business.email,
      phone: business.phone,
      address: business.address,
      imageUrl: business.imageUrl,
      isActive: business.isActive,
      website: business.website,
      serviceCount: business._count.services,
      bookingCount: business._count.bookings,
      createdAt: business.createdAt.toISOString()
    }))

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
