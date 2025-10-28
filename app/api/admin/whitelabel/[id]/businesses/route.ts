import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Get all businesses under a white-label parent
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parentBusinessId = params.id

    // Verify user owns the parent business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const parentBusiness = await prisma.business.findUnique({
      where: { id: parentBusinessId }
    })

    if (!parentBusiness || parentBusiness.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // For now, return empty array - in a full implementation, 
    // you'd have a parent-child relationship in the schema
    // This is a placeholder for the business management feature
    const businesses = await prisma.business.findMany({
      where: {
        ownerId: user.id,
        id: { not: parentBusinessId }
      },
      include: {
        bookings: {
          select: {
            id: true,
            totalAmount: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedBusinesses = businesses.map(business => {
      const completedBookings = business.bookings?.filter(
        (b: any) => b.status === 'COMPLETED'
      ) || []
      
      const revenue = completedBookings.reduce(
        (sum: number, booking: any) => sum + Number(booking.totalAmount),
        0
      )

      return {
        id: business.id,
        name: business.name,
        email: business.email || '',
        createdAt: business.createdAt.toISOString(),
        isActive: business.isActive,
        bookingsCount: business.bookings?.length || 0,
        revenue
      }
    })

    return NextResponse.json({
      businesses: formattedBusinesses
    })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Error fetching businesses' },
      { status: 500 }
    )
  }
}

/**
 * Create a new business under the white-label parent
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email } = await req.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const parentBusinessId = params.id

    // Verify user owns the parent business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const parentBusiness = await prisma.business.findUnique({
      where: { id: parentBusinessId }
    })

    if (!parentBusiness || parentBusiness.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create new business
    const newBusiness = await prisma.business.create({
      data: {
        name,
        email,
        ownerId: user.id,
        isActive: true,
        plan: 'free',
        bookingFeePercentage: 5.0
      }
    })

    return NextResponse.json({
      success: true,
      business: {
        id: newBusiness.id,
        name: newBusiness.name,
        email: newBusiness.email,
        createdAt: newBusiness.createdAt.toISOString(),
        isActive: newBusiness.isActive,
        bookingsCount: 0,
        revenue: 0
      }
    })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: 'Error creating business' },
      { status: 500 }
    )
  }
}
