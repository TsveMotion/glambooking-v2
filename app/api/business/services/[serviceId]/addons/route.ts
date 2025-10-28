import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// GET - Fetch all addons for a service
export async function GET(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceId = params.serviceId

    // Verify user owns the business that owns this service
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            services: {
              where: { id: serviceId }
            }
          }
        }
      }
    })

    if (!user || !user.businesses.length) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]
    const service = business.services.find(s => s.id === serviceId)

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Fetch addons for this service
    const addons = await prisma.serviceAddon.findMany({
      where: { serviceId },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      addons
    })
  } catch (error) {
    console.error('Error fetching service addons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addons' },
      { status: 500 }
    )
  }
}

// POST - Create a new addon for a service
export async function POST(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceId = params.serviceId
    const body = await req.json()
    const { name, description, price, duration } = body

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    // Verify user owns the business that owns this service
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            services: {
              where: { id: serviceId }
            }
          }
        }
      }
    })

    if (!user || !user.businesses.length) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]
    const service = business.services.find(s => s.id === serviceId)

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Create the addon
    const addon = await prisma.serviceAddon.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        duration: parseInt(duration) || 0,
        serviceId
      }
    })

    return NextResponse.json({
      success: true,
      addon
    })
  } catch (error) {
    console.error('Error creating service addon:', error)
    return NextResponse.json(
      { error: 'Failed to create addon' },
      { status: 500 }
    )
  }
}
