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

    // Find user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // If user doesn't have a business, create one
    let business
    if (user.businesses.length === 0) {
      business = await prisma.business.create({
        data: {
          name: `${user.firstName || 'My'} Beauty Business`,
          ownerId: user.id
        }
      })
    } else {
      business = user.businesses[0]
    }

    // Build date filter
    let dateFilter = {}
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 7) // Get week's worth of data
      
      dateFilter = {
        startTime: {
          gte: startDate,
          lt: endDate
        }
      }
    }

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        ...dateFilter
      },
      include: {
        service: true,
        staff: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone || '',
      serviceName: booking.service.name,
      staffName: `${booking.staff.firstName} ${booking.staff.lastName}`,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      totalAmount: Number(booking.totalAmount),
      status: booking.status
    }))

    return NextResponse.json({ bookings: formattedBookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Error fetching bookings' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ 
        error: 'No business found for user' 
      }, { status: 404 })
    }

    const business = user.businesses[0]

    const body = await req.json()
    const {
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      staffId,
      startTime,
      endTime,
      totalAmount,
      notes
    } = body

    // Validate required fields
    if (!clientName || !clientEmail || !serviceId || !staffId || !startTime || !endTime) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Create or find client
    let client = await prisma.client.findFirst({
      where: {
        businessId: business.id,
        email: clientEmail
      }
    })

    if (!client) {
      const [firstName, ...lastNameParts] = clientName.split(' ')
      const lastName = lastNameParts.join(' ') || ''
      
      client = await prisma.client.create({
        data: {
          firstName,
          lastName,
          email: clientEmail,
          phone: clientPhone || null,
          businessId: business.id
        }
      })
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalAmount: totalAmount,
        notes: notes || null,
        status: 'PENDING',
        businessId: business.id,
        serviceId,
        staffId
      },
      include: {
        service: true,
        staff: true
      }
    })

    return NextResponse.json({ 
      booking: {
        id: booking.id,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        serviceName: booking.service.name,
        staffName: `${booking.staff.firstName} ${booking.staff.lastName}`,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        totalAmount: Number(booking.totalAmount),
        status: booking.status,
        notes: booking.notes
      }
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Error creating booking' },
      { status: 500 }
    )
  }
}
