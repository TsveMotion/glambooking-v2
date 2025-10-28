import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      serviceId,
      staffId,
      startTime,
      endTime,
      clientName,
      clientEmail,
      clientPhone
    } = await req.json()

    // Get service and business details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        business: {
          include: {
            whitelabelConfig: true
          },
          select: {
            id: true,
            name: true,
            stripeAccountId: true,
            isWhiteLabel: true
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.business.stripeAccountId) {
      return NextResponse.json({ error: 'Business Stripe account not connected' }, { status: 400 })
    }

    // Calculate fees - customer pays service price only
    // For white-label: Platform takes 1% (white-label absorbs rest)
    // For standard: Platform takes 5% (includes Stripe fees)
    const serviceAmount = parseFloat(service.price.toString())
    const isWhiteLabel = service.business.isWhiteLabel
    const platformFeeRate = isWhiteLabel 
      ? (parseFloat(service.business.whitelabelConfig?.platformFeePercentage?.toString() || '1.0') / 100)
      : 0.05 // 5% for standard, 1% default for white-label
    const platformFee = serviceAmount * platformFeeRate
    const businessAmount = serviceAmount - platformFee

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: service.name,
              description: service.description || `${service.name} service`,
            },
            unit_amount: Math.round(serviceAmount * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel`,
      customer_email: clientEmail,
      metadata: {
        serviceId,
        staffId,
        businessId: service.business.id,
        startTime: startTime,
        endTime: endTime,
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        platformFee: Math.round(platformFee * 100).toString(),
        businessAmount: Math.round(businessAmount * 100).toString(),
      },
      payment_intent_data: {
        application_fee_amount: Math.round(platformFee * 100),
        transfer_data: {
          destination: service.business.stripeAccountId,
        },
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
