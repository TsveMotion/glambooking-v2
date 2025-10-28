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

    const invitations = await prisma.teamInvitation.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        },
        inviter: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const stats = await prisma.teamInvitation.groupBy({
      by: ['status'],
      _count: true
    })

    return NextResponse.json({
      invitations,
      total: invitations.length,
      statusBreakdown: stats
    })
  } catch (error) {
    console.error('❌ Team Invitations API: Error:', error)
    return NextResponse.json({ error: 'Error fetching team invitations' }, { status: 500 })
  }
}
