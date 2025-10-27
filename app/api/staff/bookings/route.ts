import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')

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

    // Get real bookings from database
    const targetDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const bookings = await prisma.booking.findMany({
      where: {
        staffId: staff.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      serviceName: booking.service.name,
      date: booking.startTime.toISOString().split('T')[0],
      time: booking.startTime.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      duration: booking.service.duration,
      status: booking.status.toLowerCase(),
      price: parseFloat(booking.totalAmount.toString()),
      notes: booking.notes
    }))

    return NextResponse.json({ bookings: formattedBookings })

  } catch (error) {
    console.error('Staff bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
