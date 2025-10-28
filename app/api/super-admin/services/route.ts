import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  console.log('🔵 Services API: Request received')
  try {
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const services = await prisma.service.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            isWhiteLabel: true
          }
        },
        _count: {
          select: {
            bookings: true,
            staffServices: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('✅ Services API: Returning', services.length, 'services')
    return NextResponse.json({
      services,
      total: services.length
    })
  } catch (error) {
    console.error('❌ Services API: Error:', error)
    return NextResponse.json(
      { error: 'Error fetching services' },
      { status: 500 }
    )
  }
}
