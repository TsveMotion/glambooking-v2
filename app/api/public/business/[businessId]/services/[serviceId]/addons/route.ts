import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// GET - Public endpoint to fetch addons for a service
export async function GET(
  req: NextRequest,
  { params }: { params: { businessId: string; serviceId: string } }
) {
  try {
    const { serviceId } = params

    // Fetch active addons for this service
    const addons = await prisma.serviceAddon.findMany({
      where: {
        serviceId,
        isActive: true
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        isActive: true
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
