import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    // For checkout, we allow both authenticated and unauthenticated users
    // Unauthenticated users can still purchase, but won't have immediate access
    
    const { priceId, planName, mode = 'subscription' } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    // Demo mode - create products and prices on the fly if they don't exist
    let finalPriceId = priceId
    
    try {
      // Try to retrieve the price first
      await stripe.prices.retrieve(priceId)
    } catch (error) {
      // If price doesn't exist, create a demo product and price
      console.log('Price not found, creating demo price for:', planName)
      
      const product = await stripe.products.create({
        name: `GlamBooking ${planName} Plan`,
        description: `${planName} subscription plan for GlamBooking`,
      })

      const priceAmount = planName === 'Starter' ? 3000 : planName === 'Professional' ? 5000 : 10000
      
      const price = await stripe.prices.create({
        unit_amount: priceAmount, // Amount in cents
        currency: 'gbp',
        recurring: {
          interval: 'month',
        },
        product: product.id,
      })
      
      finalPriceId = price.id
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: mode,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      client_reference_id: userId || undefined,
      metadata: {
        userId: userId || 'anonymous',
        planName,
      },
      subscription_data: mode === 'subscription' ? {
        trial_period_days: 14,
        metadata: {
          userId: userId || 'anonymous',
          planName,
        },
      } : undefined,
      customer_email: undefined, // Let Stripe collect email
      allow_promotion_codes: true,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
