import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { businessId } = params

    // Verify business exists and is active
    const business = await prisma.business.findUnique({
      where: { 
        id: businessId,
        isActive: true
      }
    })

    if (!business) {
      return NextResponse.json({ 
        error: 'Business not found' 
      }, { status: 404 })
    }

    // Get active services for this business
    const services = await prisma.service.findMany({
      where: {
        businessId: businessId,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    const formattedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: Number(service.price),
      category: service.category,
      isActive: service.isActive
    }))

    return NextResponse.json({ 
      services: formattedServices
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Error fetching services' },
      { status: 500 }
    )
  }
}
