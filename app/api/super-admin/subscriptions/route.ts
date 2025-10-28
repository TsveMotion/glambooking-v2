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

    const subscriptions = await prisma.subscription.findMany({
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

    const stats = await prisma.subscription.groupBy({
      by: ['plan', 'status'],
      _count: true
    })

    return NextResponse.json({
      subscriptions,
      total: subscriptions.length,
      breakdown: stats
    })
  } catch (error) {
    console.error('❌ Subscriptions API: Error:', error)
    return NextResponse.json({ error: 'Error fetching subscriptions' }, { status: 500 })
  }
}
