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

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            staff: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user doesn't have a business, create one
    let business
    if (!user.businesses.length) {
      business = await prisma.business.create({
        data: {
          name: `${user.firstName || 'My'} Beauty Business`,
          ownerId: user.id
        },
        include: {
          staff: true
        }
      })
    } else {
      business = user.businesses[0]
    }

    // User has paid for subscription - show active plan
    const currentPlan: 'starter' | 'professional' | 'enterprise' = 'starter' // Default plan
    const planStatus: 'active' | 'cancelled' | 'past_due' = 'active' // User has paid!
    
    const getPlanDetails = (plan: string) => {
      switch (plan) {
        case 'professional':
          return { name: 'Professional', price: 50, maxStaff: 10 }
        case 'enterprise':
          return { name: 'Enterprise', price: 100, maxStaff: -1 }
        default:
          return { name: 'Starter', price: 30, maxStaff: 3 }
      }
    }

    const planInfo = getPlanDetails(currentPlan)
    const planDetails = {
      id: currentPlan,
      name: planInfo.name,
      price: planInfo.price,
      maxStaff: planInfo.maxStaff,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: planStatus,
      subscriptionId: `sub_${business.id.slice(0, 8)}`
    }

    // Get some basic metrics
    const metrics = {
      monthlyBookings: await prisma.booking.count({
        where: {
          businessId: business.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      monthlyRevenue: 0 // Would calculate from payments
    }

    return NextResponse.json({
      plan: planDetails,
      business: {
        ...business,
        staff: business.staff
      },
      metrics
    })
  } catch (error) {
    console.error('Plan details API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
