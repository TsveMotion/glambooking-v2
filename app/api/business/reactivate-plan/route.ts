import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // In a real app, you would:
    // 1. Reactivate the Stripe subscription
    // 2. Update the business record to active status
    // 3. Send reactivation confirmation email
    // 4. Log the reactivation

    try {
      // Mock Stripe reactivation
      // const subscription = await stripe.subscriptions.update(subscriptionId, {
      //   cancel_at_period_end: false,
      //   metadata: {
      //     reactivated_at: new Date().toISOString()
      //   }
      // })

      // Update business status to active (using isActive field since planStatus doesn't exist)
      await prisma.business.update({
        where: { id: business.id },
        data: {
          isActive: true,
          updatedAt: new Date()
        }
      })

      console.log(`Business ${business.id} reactivated subscription`)

      return NextResponse.json({ 
        success: true,
        message: 'Subscription reactivated successfully. Your plan is now active.',
        status: 'active'
      })
    } catch (stripeError) {
      console.error('Stripe reactivation error:', stripeError)
      return NextResponse.json({ error: 'Failed to reactivate subscription' }, { status: 500 })
    }
  } catch (error) {
    console.error('Reactivate plan API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
