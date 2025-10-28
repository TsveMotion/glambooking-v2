import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Get statistics for a white-label business
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

    const businessId = params.id

    // Verify user owns this business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        bookings: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
            status: true
          }
        },
        clients: {
          select: { id: true }
        },
        staff: {
          where: { isActive: true },
          select: { id: true }
        },
        services: {
          where: { isActive: true },
          select: { id: true }
        }
      }
    })

    if (!business || business.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Calculate statistics
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const totalBookings = business.bookings?.length || 0
    const monthlyBookings = business.bookings?.filter((b: any) => 
      new Date(b.createdAt) >= monthStart
    ) || []
    
    const totalRevenue = business.bookings?.reduce((sum: number, booking: any) => {
      if (booking.status === 'COMPLETED') {
        return sum + Number(booking.totalAmount)
      }
      return sum
    }, 0) || 0

    const monthlyRevenue = monthlyBookings.reduce((sum: number, booking: any) => {
      if (booking.status === 'COMPLETED') {
        return sum + Number(booking.totalAmount)
      }
      return sum
    }, 0)

    return NextResponse.json({
      stats: {
        totalBookings,
        monthlyBookings: monthlyBookings.length,
        totalRevenue,
        monthlyRevenue,
        totalClients: business.clients?.length || 0,
        activeStaff: business.staff?.length || 0,
        activeServices: business.services?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Error fetching statistics' },
      { status: 500 }
    )
  }
}
