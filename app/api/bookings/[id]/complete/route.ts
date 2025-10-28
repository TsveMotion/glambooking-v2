import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        businessId: business.id
      },
      include: {
        service: true,
        staff: true,
        payments: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if already completed
    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Booking is already completed' },
        { status: 400 }
      )
    }

    // Prevent manual bookings (no payment) from being marked as complete
    if (!booking.payments || booking.payments.length === 0) {
      return NextResponse.json(
        { error: 'Manual bookings cannot be marked as complete. Only paid bookings can be completed to release funds.' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Calculate when funds will be available (immediately for now, can add delay if needed)
    const fundsAvailableAt = new Date()
    // Optional: Add a delay for funds availability (e.g., 24 hours)
    // fundsAvailableAt.setHours(fundsAvailableAt.getHours() + 24)

    // Update booking to completed
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'COMPLETED',
        completedAt: now,
        completedBy: userId,
        fundsAvailableAt: fundsAvailableAt
      },
      include: {
        service: true,
        staff: true,
        payments: true
      }
    })

    // Update payment status to completed if exists
    if (updatedBooking.payments.length > 0) {
      await prisma.payment.updateMany({
        where: {
          bookingId: params.id,
          status: { not: 'COMPLETED' }
        },
        data: {
          status: 'COMPLETED'
        }
      })
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        completedAt: updatedBooking.completedAt,
        fundsAvailableAt: updatedBooking.fundsAvailableAt,
        totalAmount: updatedBooking.totalAmount,
        clientName: updatedBooking.clientName,
        serviceName: updatedBooking.service.name
      },
      message: 'Booking marked as completed. Funds are now available for withdrawal.'
    })
  } catch (error) {
    console.error('Complete booking error:', error)
    return NextResponse.json(
      { error: 'Failed to complete booking' },
      { status: 500 }
    )
  }
}
