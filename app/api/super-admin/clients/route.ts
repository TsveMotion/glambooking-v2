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

    const clients = await prisma.client.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            isWhiteLabel: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      clients,
      total: clients.length
    })
  } catch (error) {
    console.error('❌ Clients API: Error:', error)
    return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 })
  }
}
