import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const { 
      businessId, 
      serviceId, 
      staffId, 
      date, 
      time, 
      clientInfo, 
      serviceName, 
      servicePrice 
    } = await req.json()

    if (!businessId || !serviceId || !staffId || !date || !time || !clientInfo || !serviceName || !servicePrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: serviceName,
              description: `Booking for ${date} at ${time}`,
            },
            unit_amount: Math.round(servicePrice * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${businessId}`,
      metadata: {
        businessId,
        serviceId,
        staffId,
        date,
        time,
        clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone || '',
      },
      customer_email: clientInfo.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
