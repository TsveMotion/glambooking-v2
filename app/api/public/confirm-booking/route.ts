import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ 
        error: 'Session ID is required' 
      }, { status: 400 })
    }

    // Get the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ 
        error: 'Payment not confirmed' 
      }, { status: 400 })
    }

    // Find the booking by payment intent
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentId: session.payment_intent as string
      },
      include: {
        booking: {
          include: {
            service: true,
            staff: true,
            business: true
          }
        }
      }
    })

    if (!payment || !payment.booking) {
      return NextResponse.json({ 
        error: 'Booking not found' 
      }, { status: 404 })
    }

    const booking = payment.booking

    // Format the response
    const bookingDetails = {
      id: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status,
      totalAmount: Number(booking.totalAmount),
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      service: {
        name: booking.service.name,
        duration: booking.service.duration,
        price: Number(booking.service.price)
      },
      staff: {
        firstName: booking.staff.firstName,
        lastName: booking.staff.lastName
      },
      business: {
        id: booking.business.id,
        name: booking.business.name,
        address: booking.business.address,
        phone: booking.business.phone,
        email: booking.business.email
      }
    }

    return NextResponse.json({ 
      booking: bookingDetails
    })
  } catch (error) {
    console.error('Error confirming booking:', error)
    return NextResponse.json(
      { error: 'Error confirming booking' },
      { status: 500 }
    )
  }
}
