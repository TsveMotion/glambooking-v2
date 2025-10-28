import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Toggle whitelabel active status (updates the parent business)
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

    // Find the business and update both business and whitelabel config
    const business = await prisma.business.findFirst({
      where: { id },
      include: { whitelabelConfig: true }
    })

    if (!business?.whitelabelConfig) {
      return NextResponse.json(
        { error: 'Whitelabel configuration not found' },
        { status: 404 }
      )
    }

    // Update both the business and whitelabel config active status
    await prisma.$transaction([
      prisma.business.update({
        where: { id },
        data: { isActive }
      }),
      prisma.whiteLabelConfig.update({
        where: { id: business.whitelabelConfig.id },
        data: { isActive }
      })
    ])

    console.log(`✅ Whitelabel ${isActive ? 'activated' : 'deactivated'}:`, id)

    return NextResponse.json({ success: true, isActive })
  } catch (error) {
    console.error('Error toggling whitelabel active status:', error)
    return NextResponse.json(
      { error: 'Error toggling whitelabel active status' },
      { status: 500 }
    )
  }
}
