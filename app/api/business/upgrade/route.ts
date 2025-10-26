import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, currentPlan } = await req.json()

    if (!planId || !['starter', 'professional', 'enterprise'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (planId === currentPlan) {
      return NextResponse.json({ error: 'Already on this plan' }, { status: 400 })
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || !user.businesses.length) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]

    // Plan pricing
    const planPricing = {
      starter: { price: 3000, name: 'Starter Plan' }, // £30.00 in pence
      professional: { price: 5000, name: 'Professional Plan' }, // £50.00 in pence
      enterprise: { price: 10000, name: 'Enterprise Plan' } // £100.00 in pence
    }

    const selectedPlan = planPricing[planId as keyof typeof planPricing]

    // In a real app, you would:
    // 1. Cancel the existing subscription immediately
    // 2. Create a new subscription with the new plan
    // 3. Prorate the billing

    // For now, we'll create a checkout session that represents the upgrade
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: selectedPlan.name,
              description: `GlamBooking ${selectedPlan.name} - Upgrade from ${currentPlan}`,
            },
            unit_amount: selectedPlan.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        businessId: business.id,
        planId: planId,
        userId: userId,
        upgradeFrom: currentPlan,
        isUpgrade: 'true'
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/manage-plan?upgrade=success&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/pricing?upgrade=cancelled`,
      subscription_data: {
        metadata: {
          businessId: business.id,
          planId: planId,
          currentPlan: currentPlan,
          upgradeFrom: currentPlan
        }
      }
    })

    // In a real implementation, you would also:
    // 1. Store the pending upgrade in your database
    // 2. Set up webhooks to handle successful payment
    // 3. Cancel the old subscription when the new one is confirmed
    console.log(`Upgrade initiated: ${currentPlan} -> ${planId} for business ${business.id}`)

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error) {
    console.error('Upgrade API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
