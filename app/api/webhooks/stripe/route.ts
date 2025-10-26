import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata!

      try {
        // Create the booking
        const booking = await prisma.booking.create({
          data: {
            startTime: new Date(metadata.startTime),
            endTime: new Date(metadata.endTime),
            status: 'CONFIRMED',
            totalAmount: session.amount_total! / 100, // Convert from pence to pounds
            clientName: metadata.clientName,
            clientEmail: metadata.clientEmail,
            clientPhone: metadata.clientPhone || null,
            businessId: metadata.businessId,
            serviceId: metadata.serviceId,
            staffId: metadata.staffId,
          }
        })

        // Create payment record
        await prisma.payment.create({
          data: {
            amount: session.amount_total! / 100,
            platformFee: parseInt(metadata.platformFee) / 100,
            businessAmount: parseInt(metadata.businessAmount) / 100,
            currency: 'GBP',
            status: 'COMPLETED',
            stripePaymentId: session.payment_intent as string,
            bookingId: booking.id
          }
        })

        console.log('Booking created successfully:', booking.id)
      } catch (error) {
        console.error('Error creating booking from webhook:', error)
        return NextResponse.json({ error: 'Error processing booking' }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
