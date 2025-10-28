import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Toggle active status for a whitelabel business
 */
export async function POST(req: NextRequest) {
  try {
    // Verify super admin authorization
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { businessId, isActive } = await req.json()

    if (!businessId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Business ID and active status are required' },
        { status: 400 }
      )
    }

    // Update business active status
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: { isActive }
    })

    // Revalidate relevant paths
    try {
      revalidatePath('/super-admin')
      revalidatePath(`/admin/${businessId}`)
    } catch (e) {
      console.error('Error revalidating paths:', e)
    }

    return NextResponse.json({
      success: true,
      business: {
        id: updatedBusiness.id,
        isActive: updatedBusiness.isActive
      }
    })
  } catch (error) {
    console.error('Error toggling business status:', error)
    return NextResponse.json(
      { error: 'Error toggling business status' },
      { status: 500 }
    )
  }
}
