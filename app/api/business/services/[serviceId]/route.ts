import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function PUT(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, duration, price, category, isActive } = body

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

    // Check if service belongs to user's business
    const existingService = await prisma.service.findFirst({
      where: {
        id: params.serviceId,
        businessId: business.id
      }
    })

    if (!existingService) {
      return NextResponse.json({ 
        error: 'Service not found' 
      }, { status: 404 })
    }

    // Update service
    const service = await prisma.service.update({
      where: { id: params.serviceId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(duration && { duration: parseInt(duration) }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive })
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
        updatedAt: service.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Error updating service' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
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

    // Check if service belongs to user's business
    const existingService = await prisma.service.findFirst({
      where: {
        id: params.serviceId,
        businessId: business.id
      },
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    if (!existingService) {
      return NextResponse.json({ 
        error: 'Service not found' 
      }, { status: 404 })
    }

    // Check if service has bookings
    if (existingService._count.bookings > 0) {
      // Instead of deleting, deactivate the service
      const service = await prisma.service.update({
        where: { id: params.serviceId },
        data: { isActive: false }
      })

      return NextResponse.json({ 
        message: 'Service deactivated (has existing bookings)',
        service: {
          id: service.id,
          name: service.name,
          isActive: service.isActive
        }
      })
    }

    // Delete service if no bookings
    await prisma.service.delete({
      where: { id: params.serviceId }
    })

    return NextResponse.json({ 
      message: 'Service deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Error deleting service' },
      { status: 500 }
    )
  }
}
