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

    // Find user and their business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({
        hasActivePlan: false,
        hasActiveSubscription: false,
        plan: 'free',
        planName: 'none',
        status: 'none'
      })
    }

    const business = user.businesses[0] as any // Type assertion until Prisma client updates
    
    // Get current plan from business data
    const currentPlan = business.plan || 'free'
    const hasActivePlan = true // All users with businesses have active plans
    
    const getPlanName = (plan: string) => {
      switch (plan) {
        case 'free': return 'Free Plan'
        case 'starter': return 'Starter Plan'
        case 'professional': return 'Professional Plan'
        case 'enterprise': return 'Enterprise Plan'
        default: return 'Free Plan'
      }
    }
    
    // Get platform fee from business or default based on plan
    const platformFee = business.bookingFeePercentage || {
      'free': 5,
      'starter': 4,
      'professional': 3,
      'enterprise': 2,
      'whitelabel': 1
    }[currentPlan] || 5
    
    if (hasActivePlan) {
      return NextResponse.json({
        hasActivePlan: true,
        hasActiveSubscription: currentPlan !== 'free',
        plan: currentPlan,
        planName: getPlanName(currentPlan),
        platformFee: platformFee,
        status: 'active',
        nextBillingDate: currentPlan !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        subscriptionId: currentPlan !== 'free' ? `sub_${business.id.slice(0, 8)}` : null
      })
    }

    return NextResponse.json({
      hasActivePlan: false,
      hasActiveSubscription: false,
      plan: 'free',
      planName: 'none',
      status: 'none'
    })

  } catch (error) {
    console.error('Error checking plan status:', error)
    return NextResponse.json(
      { error: 'Error checking plan status' },
      { status: 500 }
    )
  }
}
