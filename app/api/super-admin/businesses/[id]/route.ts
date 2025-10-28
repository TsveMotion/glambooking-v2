import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Update a business
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

    // Remove fields that shouldn't be updated directly
    const { id: _, createdAt, updatedAt, ownerId, ...safeUpdates } = updates

    const business = await prisma.business.update({
      where: { id },
      data: safeUpdates,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        whitelabelConfig: true
      }
    })

    console.log('✅ Business updated:', business.id)

    return NextResponse.json({ business })
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json(
      { error: 'Error updating business' },
      { status: 500 }
    )
  }
}

/**
 * Delete a business
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

    // Check if this is a whitelabel parent business
    const business = await prisma.business.findUnique({
      where: { id },
      include: { whitelabelConfig: true }
    })

    if (business?.whitelabelConfig) {
      return NextResponse.json(
        { error: 'Cannot delete whitelabel parent business. Delete the whitelabel config first.' },
        { status: 400 }
      )
    }

    // Get all staff IDs for this business first
    const staffMembers = await prisma.staff.findMany({
      where: { businessId: id },
      select: { id: true }
    })
    const staffIds = staffMembers.map(s => s.id)

    // Delete related records first
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
      // Finally delete the business
      prisma.business.delete({ where: { id } })
    ])

    console.log('✅ Business deleted:', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json(
      { error: 'Error deleting business' },
      { status: 500 }
    )
  }
}
