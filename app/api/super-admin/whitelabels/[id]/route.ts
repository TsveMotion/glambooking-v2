import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Update a whitelabel configuration
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { id } = params
    const updates = await req.json()

    // Find the business that has this whitelabel config
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

    // Update the whitelabel config
    const { id: _, createdAt, updatedAt, businessId, ...safeUpdates } = updates

    const whitelabelConfig = await prisma.whiteLabelConfig.update({
      where: { id: business.whitelabelConfig.id },
      data: safeUpdates
    })

    console.log('✅ Whitelabel config updated:', whitelabelConfig.id)

    return NextResponse.json({ whitelabel: whitelabelConfig })
  } catch (error) {
    console.error('Error updating whitelabel:', error)
    return NextResponse.json(
      { error: 'Error updating whitelabel' },
      { status: 500 }
    )
  }
}

/**
 * Delete a whitelabel (and its parent business)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifySuperAdmin()
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { id } = params

    // Find the business with this ID that has a whitelabel config
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

    // Get all staff IDs for this business first
    const staffMembers = await prisma.staff.findMany({
      where: { businessId: id },
      select: { id: true }
    })
    const staffIds = staffMembers.map(s => s.id)

    // Delete everything in transaction
    await prisma.$transaction([
      // Delete availability for staff
      prisma.availability.deleteMany({ where: { staffId: { in: staffIds } } }),
      // Delete bookings
      prisma.booking.deleteMany({ where: { businessId: id } }),
      // Delete services
      prisma.service.deleteMany({ where: { businessId: id } }),
      // Delete staff
      prisma.staff.deleteMany({ where: { businessId: id } }),
      // Delete clients
      prisma.client.deleteMany({ where: { businessId: id } }),
      // Delete subscriptions
      prisma.subscription.deleteMany({ where: { businessId: id } }),
      // Delete payouts
      prisma.payout.deleteMany({ where: { businessId: id } }),
      // Delete business customization
      prisma.businessCustomization.deleteMany({ where: { businessId: id } }),
      // Delete team invitations
      prisma.teamInvitation.deleteMany({ where: { businessId: id } }),
      // Delete whitelabel config
      prisma.whiteLabelConfig.delete({ where: { id: business.whitelabelConfig.id } }),
      // Delete the business
      prisma.business.delete({ where: { id } })
    ])

    console.log('✅ Whitelabel and business deleted:', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting whitelabel:', error)
    return NextResponse.json(
      { error: 'Error deleting whitelabel' },
      { status: 500 }
    )
  }
}
