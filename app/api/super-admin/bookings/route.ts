import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  console.log('🔵 Bookings API: Request received')
  try {
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const bookings = await prisma.booking.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            isWhiteLabel: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true
          }
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 500 // Limit to recent 500 bookings
    })

    const stats = await prisma.booking.groupBy({
      by: ['status'],
      _count: true
    })

    console.log('✅ Bookings API: Returning', bookings.length, 'bookings')
    return NextResponse.json({
      bookings,
      total: bookings.length,
      statusBreakdown: stats
    })
  } catch (error) {
    console.error('❌ Bookings API: Error:', error)
    return NextResponse.json(
      { error: 'Error fetching bookings' },
      { status: 500 }
    )
  }
}
