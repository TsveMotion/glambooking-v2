import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      businessId, 
      serviceId, 
      staffId, 
      date, 
      time, 
      clientInfo, 
      totalAmount,
      totalDuration,
      addonIds 
    } = body

    if (!businessId || !serviceId || !staffId || !date || !time || !clientInfo || !totalAmount) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Verify business exists and is active
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        services: true,
        whitelabelConfig: true
      }
    })

    if (!business) {
      return NextResponse.json({ 
        error: 'Business not found' 
      }, { status: 404 })
    }

    // Verify service exists and is active
    const service = await prisma.service.findUnique({
      where: { 
        id: serviceId,
        businessId: businessId,
        isActive: true
      }
    })

    if (!service) {
      return NextResponse.json({ 
        error: 'Service not found' 
      }, { status: 404 })
    }

    // Verify staff exists and is active
    const staff = await prisma.staff.findUnique({
      where: { 
        id: staffId,
        businessId: businessId,
        isActive: true
      }
    })

    if (!staff) {
      return NextResponse.json({ 
        error: 'Staff member not found' 
      }, { status: 404 })
    }

    // Create booking date/time with total duration including addons
    const duration = totalDuration || service.duration
    const startTime = new Date(`${date}T${time}:00`)
    const endTime = new Date(startTime.getTime() + duration * 60000)

    // Check for conflicts
    const existingBooking = await prisma.booking.findFirst({
      where: {
        staffId: staffId,
        startTime: {
          lte: endTime
        },
        endTime: {
          gte: startTime
        },
        status: {
          not: 'CANCELLED'
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json({ 
        error: 'Time slot not available' 
      }, { status: 409 })
    }

    // Calculate amounts - customer pays service price only
    // For white-label: Platform takes 1% (white-label absorbs rest)
    // For standard: Platform takes 5% (includes Stripe fees)
    const totalAmountPence = Math.round(Number(totalAmount) * 100)
    const isWhiteLabel = business.isWhiteLabel
    const platformFeeRate = isWhiteLabel
      ? (parseFloat(business.whitelabelConfig?.platformFeePercentage?.toString() || '1.0') / 100)
      : 0.05
    const platformFee = Math.round(totalAmountPence * platformFeeRate)
    const businessAmount = totalAmountPence - platformFee

    // Fetch addon details if provided
    let addonsDescription = ''
    if (addonIds && addonIds.length > 0) {
      const addons = await prisma.serviceAddon.findMany({
        where: {
          id: { in: addonIds },
          serviceId: serviceId
        }
      })
      addonsDescription = addons.length > 0 ? ` + ${addons.map(a => a.name).join(', ')}` : ''
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: service.name + addonsDescription,
              description: `${duration} minutes with ${staff.firstName} ${staff.lastName}`,
            },
            unit_amount: totalAmountPence,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/book/${businessId}`,
      metadata: {
        businessId,
        serviceId,
        staffId,
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone || '',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        platformFee: platformFee.toString(),
        businessAmount: businessAmount.toString(),
        addonIds: addonIds ? JSON.stringify(addonIds) : '[]'
      }
    })

    return NextResponse.json({ 
      clientSecret: session.id,
      sessionUrl: session.url
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Error creating booking' },
      { status: 500 }
    )
  }
}
