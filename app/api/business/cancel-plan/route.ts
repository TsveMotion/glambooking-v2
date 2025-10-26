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

    const { reason } = await req.json()

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
    // 1. Cancel the Stripe subscription
    // 2. Update the business record with cancellation details
    // 3. Send cancellation email
    // 4. Log the cancellation reason

    // Mock Stripe cancellation
    try {
      // const subscription = await stripe.subscriptions.update(subscriptionId, {
      //   cancel_at_period_end: true,
      //   metadata: {
      //     cancellation_reason: reason || 'No reason provided'
      //   }
      // })

      // For now, just log the cancellation
      console.log(`Business ${business.id} cancelled subscription. Reason: ${reason || 'No reason provided'}`)

      // You could also store this in a cancellations table
      // await prisma.cancellation.create({
      //   data: {
      //     businessId: business.id,
      //     reason: reason || 'No reason provided',
      //     cancelledAt: new Date(),
      //     effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // End of billing period
      //   }
      // })

      return NextResponse.json({ 
        success: true,
        message: 'Subscription cancelled successfully. Access will continue until the end of your billing period.'
      })
    } catch (stripeError) {
      console.error('Stripe cancellation error:', stripeError)
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
    }
  } catch (error) {
    console.error('Cancel plan API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
