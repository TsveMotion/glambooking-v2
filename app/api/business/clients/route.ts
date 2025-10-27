import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
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

    // Fetch all bookings for this business to get unique clients
    const bookings = await prisma.booking.findMany({
      where: {
        businessId: business.id
      },
      select: {
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        totalAmount: true,
        startTime: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group bookings by client email
    const clientMap = new Map<string, {
      name: string
      email: string
      phone: string
      bookings: typeof bookings
      firstBooking: Date
    }>()

    bookings.forEach(booking => {
      const email = booking.clientEmail.toLowerCase()
      if (!clientMap.has(email)) {
        clientMap.set(email, {
          name: booking.clientName,
          email: booking.clientEmail,
          phone: booking.clientPhone || '',
          bookings: [booking],
          firstBooking: booking.createdAt
        })
      } else {
        const client = clientMap.get(email)!
        client.bookings.push(booking)
        if (booking.createdAt < client.firstBooking) {
          client.firstBooking = booking.createdAt
        }
      }
    })

    // Format clients with statistics
    const formattedClients = Array.from(clientMap.values()).map(client => {
      const completedBookings = client.bookings.filter(b => b.status === 'COMPLETED')
      const totalSpent = completedBookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0)
      const lastBooking = client.bookings.length > 0 ? client.bookings[0].startTime : null
      
      // Split name into first and last
      const nameParts = client.name.split(' ')
      const firstName = nameParts[0] || 'Unknown'
      const lastName = nameParts.slice(1).join(' ') || ''
      
      return {
        id: client.email, // Use email as ID since we don't have a client record
        firstName,
        lastName,
        email: client.email,
        phone: client.phone,
        totalBookings: client.bookings.length,
        totalSpent,
        lastBooking: lastBooking?.toISOString() || null,
        status: client.bookings.some(b => {
          const daysSinceBooking = (Date.now() - new Date(b.startTime).getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceBooking <= 90 // Active if booked in last 90 days
        }) ? 'ACTIVE' : 'INACTIVE',
        joinDate: client.firstBooking.toISOString()
      }
    }).sort((a, b) => b.totalBookings - a.totalBookings) // Sort by most bookings

    return NextResponse.json({ clients: formattedClients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Error fetching clients' },
      { status: 500 }
    )
  }
}
