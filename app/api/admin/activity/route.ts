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

    // Get real recent activity from database
    const activities: Array<{
      id: string
      type: 'user_signup' | 'business_created' | 'booking_made' | 'payment_processed'
      description: string
      timestamp: string
      amount?: number
    }> = []

    try {
      // Recent user signups (last 5)
      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      })

      recentUsers.forEach(user => {
        activities.push({
          id: `user_${user.id}`,
          type: 'user_signup',
          description: `New user registered: ${user.firstName || 'User'} ${user.lastName || ''}`.trim(),
          timestamp: user.createdAt.toISOString()
        })
      })
    } catch (error) {
      console.log('Error fetching recent users:', error)
    }

    try {
      // Recent business creations (last 5)
      const recentBusinesses = await prisma.business.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      })

      recentBusinesses.forEach(business => {
        activities.push({
          id: `business_${business.id}`,
          type: 'business_created',
          description: `New business created: ${business.name}`,
          timestamp: business.createdAt.toISOString()
        })
      })
    } catch (error) {
      console.log('Error fetching recent businesses:', error)
    }

    try {
      // Recent bookings (last 10)
      const recentBookings = await prisma.booking.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          service: true,
          business: true
        }
      })

      recentBookings.forEach(booking => {
        activities.push({
          id: `booking_${booking.id}`,
          type: 'booking_made',
          description: `New booking: ${booking.service.name} at ${booking.business.name}`,
          timestamp: booking.createdAt.toISOString(),
          amount: Number(booking.totalAmount)
        })
      })
    } catch (error) {
      console.log('Error fetching recent bookings:', error)
    }

    try {
      // Recent payments (last 10)
      const recentPayments = await prisma.payment.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        where: {
          status: 'COMPLETED'
        },
        include: {
          booking: {
            include: {
              business: true
            }
          }
        }
      })

      recentPayments.forEach(payment => {
        activities.push({
          id: `payment_${payment.id}`,
          type: 'payment_processed',
          description: `Payment processed for ${payment.booking.business.name}`,
          timestamp: payment.createdAt.toISOString(),
          amount: Number(payment.amount)
        })
      })
    } catch (error) {
      console.log('Error fetching recent payments:', error)
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return only the most recent 20 activities
    const limitedActivities = activities.slice(0, 20)

    return NextResponse.json({ activities: limitedActivities })
  } catch (error) {
    console.error('Error fetching admin activity:', error)
    return NextResponse.json(
      { error: 'Error fetching admin activity' },
      { status: 500 }
    )
  }
}
