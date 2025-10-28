import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    // Extract booking data from session metadata
    const {
      businessId,
      serviceId,
      staffId,
      date,
      time,
      clientName,
      clientEmail,
      clientPhone
    } = session.metadata!

    // Get service details for pricing
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Get staff details
    const staff = await prisma.staff.findUnique({
      where: { id: staffId }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // Create or find client
    const client = await prisma.client.upsert({
      where: { 
        businessId_email: {
          businessId: businessId,
          email: clientEmail
        }
      },
      update: {
        firstName: clientName.split(' ')[0],
        lastName: clientName.split(' ').slice(1).join(' '),
        phone: clientPhone,
      },
      create: {
        firstName: clientName.split(' ')[0],
        lastName: clientName.split(' ').slice(1).join(' '),
        email: clientEmail,
        phone: clientPhone,
        businessId: businessId,
      }
    })

    // Create booking datetime
    const startTime = new Date(`${date}T${time}:00`)
    const endTime = new Date(startTime.getTime() + service.duration * 60000)

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        businessId,
        serviceId,
        staffId,
        startTime,
        endTime,
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        totalAmount: service.price,
        status: 'CONFIRMED',
        notes: `Payment processed via Stripe: ${sessionId}`,
      },
      include: {
        service: true,
        staff: true,
        business: true
      }
    })

    // Create payment record
    // Platform fee is 5% which includes covering Stripe transaction fees
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: service.price,
        platformFee: Number(service.price) * 0.05, // 5% platform fee (includes Stripe fees)
        businessAmount: Number(service.price) * 0.95, // 95% to business
        currency: 'GBP',
        status: 'COMPLETED',
        stripePaymentId: session.payment_intent as string,
      }
    })

    const bookingResponse = {
      id: booking.id,
      businessId: booking.businessId,
      serviceName: booking.service.name,
      staffName: `${booking.staff.firstName} ${booking.staff.lastName}`,
      startTime: booking.startTime,
      clientEmail: booking.clientEmail,
      totalAmount: booking.totalAmount
    }

    return NextResponse.json({ booking: bookingResponse })
  } catch (error) {
    console.error('Error confirming booking:', error)
    return NextResponse.json(
      { error: 'Error confirming booking' },
      { status: 500 }
    )
  }
}
