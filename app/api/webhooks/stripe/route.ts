import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Handler functions
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
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
    throw error
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status if it exists
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id }
    })

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' }
      })
      console.log('Payment updated to completed:', payment.id)
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  try {
    // Log transfer creation for staff payouts
    console.log('Transfer created:', transfer.id, 'Amount:', transfer.amount / 100)
    
    // You could update staff payout records here if needed
    // This would be for tracking individual staff transfers
  } catch (error) {
    console.error('Error handling transfer created:', error)
  }
}

async function handlePayoutPaid(payout: Stripe.Payout) {
  try {
    // Update business payout status
    const businessPayout = await prisma.payout.findFirst({
      where: { stripeTransferId: payout.id }
    })

    if (businessPayout) {
      await prisma.payout.update({
        where: { id: businessPayout.id },
        data: { status: 'COMPLETED' }
      })
      console.log('Business payout updated to completed:', businessPayout.id)
    } else {
      // Create payout record if it doesn't exist
      const business = await prisma.business.findFirst({
        where: { stripeAccountId: payout.destination as string }
      })

      if (business) {
        await prisma.payout.create({
          data: {
            amount: payout.amount / 100,
            status: 'COMPLETED',
            description: `Stripe payout ${payout.id}`,
            stripeTransferId: payout.id,
            businessId: business.id
          }
        })
        console.log('New payout record created for business:', business.id)
      }
    }
  } catch (error) {
    console.error('Error handling payout paid:', error)
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    // Update business or staff Stripe account status
    const business = await prisma.business.findFirst({
      where: { stripeAccountId: account.id }
    })

    if (business) {
      await prisma.business.update({
        where: { id: business.id },
        data: { 
          stripeOnboarded: account.charges_enabled && account.payouts_enabled,
          updatedAt: new Date()
        }
      })
      console.log('Business Stripe account updated:', business.id)
    }

    // Check for staff account - temporarily disabled until Prisma client is updated
    // const staff = await prisma.staff.findFirst({
    //   where: { stripeAccountId: account.id }
    // })

    // if (staff) {
    //   console.log('Staff Stripe account updated:', staff.id)
    // }
  } catch (error) {
    console.error('Error handling account updated:', error)
  }
}

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

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer)
        break
      
      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout)
        break
      
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
