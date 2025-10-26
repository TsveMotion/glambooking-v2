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

    const business = user.businesses[0]

    // Check if user has completed a successful payment
    // For now, if they have a business, they have an active plan
    const hasActivePlan = true // All users with businesses have active plans
    
    if (hasActivePlan) {
      return NextResponse.json({
        hasActivePlan: true,
        hasActiveSubscription: true,
        plan: 'starter',
        planName: 'Starter Plan',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionId: 'sub_mock_123'
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
