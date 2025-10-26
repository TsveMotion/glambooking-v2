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

    // Fetch clients
    const clients = await prisma.client.findMany({
      where: {
        businessId: business.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get booking statistics for each client separately
    const formattedClients = await Promise.all(clients.map(async (client) => {
      const bookings = await prisma.booking.findMany({
        where: {
          businessId: business.id,
          clientEmail: client.email
        },
        select: {
          totalAmount: true,
          startTime: true,
          status: true
        },
        orderBy: {
          startTime: 'desc'
        }
      })

      const completedBookings = bookings.filter(b => b.status === 'COMPLETED')
      const totalSpent = completedBookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0)
      const lastBooking = bookings.length > 0 ? bookings[0].startTime : null
      
      return {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone || '',
        totalBookings: bookings.length,
        totalSpent,
        lastBooking: lastBooking?.toISOString() || null,
        status: bookings.length > 0 ? 'ACTIVE' : 'INACTIVE',
        joinDate: client.createdAt.toISOString()
      }
    }))

    return NextResponse.json({ clients: formattedClients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Error fetching clients' },
      { status: 500 }
    )
  }
}
