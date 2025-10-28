import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  console.log('🔵 Staff API: Request received')
  try {
    console.log('🔵 Staff API: Verifying super admin...')
    const authResult = await verifySuperAdmin()
    console.log('🔵 Staff API: Auth result:', authResult)
    
    if (!authResult.authorized) {
      console.log('🔵 Staff API: Not authorized')
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    console.log('🔵 Staff API: Fetching all staff...')
    const staff = await prisma.staff.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            isWhiteLabel: true
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

    console.log('✅ Staff API: Returning', staff.length, 'staff members')
    return NextResponse.json({
      staff,
      total: staff.length
    })
  } catch (error) {
    console.error('❌ Staff API: Error:', error)
    return NextResponse.json(
      { error: 'Error fetching staff', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
