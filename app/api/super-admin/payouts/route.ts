import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const payouts = await prisma.payout.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const totalPayouts = await prisma.payout.aggregate({
      _sum: {
        amount: true
      }
    })

    return NextResponse.json({
      payouts,
      total: payouts.length,
      totalAmount: Number(totalPayouts._sum.amount || 0)
    })
  } catch (error) {
    console.error('❌ Payouts API: Error:', error)
    return NextResponse.json({ error: 'Error fetching payouts' }, { status: 500 })
  }
}
