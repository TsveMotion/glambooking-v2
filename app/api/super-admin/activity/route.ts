import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Get recent platform activity for super admin
 */
export async function GET(req: NextRequest) {
  try {
    // Verify super admin authorization
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get recent bookings, user signups, and business creations
    const [recentBookings, recentUsers, recentBusinesses] = await Promise.all([
      prisma.booking.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          business: {
            select: { name: true }
          },
          service: {
            select: { name: true }
          }
        }
      }),
      
      prisma.user.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
      }),
      
      prisma.business.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: { email: true, firstName: true, lastName: true }
          }
        }
      })
    ])

    // Combine and sort activities
    const activities: any[] = []

    recentBookings.forEach(booking => {
      activities.push({
        id: `booking-${booking.id}`,
        type: 'booking_made',
        description: `New booking for ${booking.service.name} at ${booking.business.name}`,
        timestamp: booking.createdAt.toISOString(),
        amount: Number(booking.totalAmount),
        metadata: {
          businessName: booking.business.name,
          serviceName: booking.service.name,
          status: booking.status
        }
      })
    })

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_signup',
        description: `New user registered: ${user.email}`,
        timestamp: user.createdAt.toISOString(),
        metadata: {
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }
      })
    })

    recentBusinesses.forEach(business => {
      activities.push({
        id: `business-${business.id}`,
        type: 'business_created',
        description: `New business created: ${business.name}`,
        timestamp: business.createdAt.toISOString(),
        metadata: {
          businessName: business.name,
          ownerEmail: business.owner.email,
          isWhiteLabel: business.isWhiteLabel
        }
      })
    })

    // Sort by timestamp descending and take top 50
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      activities: activities.slice(0, 50)
    })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Error fetching activity' },
      { status: 500 }
    )
  }
}
