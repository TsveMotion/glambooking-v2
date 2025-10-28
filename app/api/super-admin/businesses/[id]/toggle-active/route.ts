import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Toggle business active status
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { id } = params
    const { isActive } = await req.json()

    const business = await prisma.business.update({
      where: { id },
      data: { isActive },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    console.log(`✅ Business ${isActive ? 'activated' : 'deactivated'}:`, business.id)

    return NextResponse.json({ business })
  } catch (error) {
    console.error('Error toggling business active status:', error)
    return NextResponse.json(
      { error: 'Error toggling business active status' },
      { status: 500 }
    )
  }
}
