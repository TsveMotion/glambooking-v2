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

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ 
        error: 'No business found for user' 
      }, { status: 404 })
    }

    const business = user.businesses[0]

    // Fetch services with booking counts and revenue
    const services = await prisma.service.findMany({
      where: {
        businessId: business.id
      },
      include: {
        _count: {
          select: {
            bookings: true
          }
        },
        bookings: {
          select: {
            totalAmount: true,
            status: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const formattedServices = services.map(service => {
      const completedBookings = service.bookings.filter(b => b.status === 'COMPLETED')
      const totalRevenue = completedBookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0)
      
      return {
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: Number(service.price),
        category: service.category,
        isActive: service.isActive,
        createdAt: service.createdAt.toISOString(),
        updatedAt: service.updatedAt.toISOString(),
        _count: {
          bookings: service._count.bookings
        },
        totalRevenue,
        completedBookings: completedBookings.length
      }
    })

    return NextResponse.json({ services: formattedServices })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Error fetching services' },
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

    const body = await req.json()
    const { name, description, duration, price, category } = body

    if (!name || !duration || !price) {
      return NextResponse.json({ 
        error: 'Name, duration, and price are required' 
      }, { status: 400 })
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

    // Create service
    const service = await prisma.service.create({
      data: {
        name,
        description: description || '',
        duration: parseInt(duration),
        price: parseFloat(price),
        category: category || 'General',
        businessId: business.id,
        isActive: true
      }
    })

    return NextResponse.json({ 
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: Number(service.price),
        category: service.category,
        isActive: service.isActive,
        createdAt: service.createdAt.toISOString(),
        updatedAt: service.updatedAt.toISOString(),
        _count: { bookings: 0 },
        totalRevenue: 0,
        completedBookings: 0
      }
    })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Error creating service' },
      { status: 500 }
    )
  }
}
