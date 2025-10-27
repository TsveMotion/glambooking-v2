import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id
    const { status } = await req.json()

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get staff record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        staff: true
      }
    })

    if (!user || !user.staff.length) {
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }

    const staff = user.staff[0]

    // Verify the booking belongs to this staff member
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        staff: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.staffId !== staff.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this booking' }, { status: 403 })
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: status as any,
        updatedAt: new Date()
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        clientName: updatedBooking.clientName,
        serviceName: updatedBooking.service.name,
        startTime: updatedBooking.startTime,
        updatedAt: updatedBooking.updatedAt
      }
    })

  } catch (error) {
    console.error('Update booking status error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}
