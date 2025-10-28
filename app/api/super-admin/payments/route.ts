import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  console.log('🔵 Payments API: Request received')
  try {
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const payments = await prisma.payment.findMany({
      include: {
        booking: {
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
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 500
    })

    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED'
      },
      _sum: {
        amount: true,
        platformFee: true,
        businessAmount: true
      }
    })

    console.log('✅ Payments API: Returning', payments.length, 'payments')
    return NextResponse.json({
      payments,
      total: payments.length,
      totalRevenue: {
        total: Number(totalRevenue._sum.amount || 0),
        platformFees: Number(totalRevenue._sum.platformFee || 0),
        businessPayouts: Number(totalRevenue._sum.businessAmount || 0)
      }
    })
  } catch (error) {
    console.error('❌ Payments API: Error:', error)
    return NextResponse.json({ error: 'Error fetching payments' }, { status: 500 })
  }
}
