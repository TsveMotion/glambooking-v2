import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// PUT - Update an addon
export async function PUT(
  req: NextRequest,
  { params }: { params: { addonId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addonId = params.addonId
    const body = await req.json()
    const { name, description, price, duration, isActive } = body

    // Verify user owns the business that owns this addon's service
    const addon = await prisma.serviceAddon.findUnique({
      where: { id: addonId },
      include: {
        service: {
          include: {
            business: {
              include: {
                owner: true
              }
            }
          }
        }
      }
    })

    if (!addon) {
      return NextResponse.json({ error: 'Addon not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || addon.service.business.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update the addon
    const updatedAddon = await prisma.serviceAddon.update({
      where: { id: addonId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({
      success: true,
      addon: updatedAddon
    })
  } catch (error) {
    console.error('Error updating addon:', error)
    return NextResponse.json(
      { error: 'Failed to update addon' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an addon
export async function DELETE(
  req: NextRequest,
  { params }: { params: { addonId: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addonId = params.addonId

    // Verify user owns the business that owns this addon's service
    const addon = await prisma.serviceAddon.findUnique({
      where: { id: addonId },
      include: {
        service: {
          include: {
            business: {
              include: {
                owner: true
              }
            }
          }
        }
      }
    })

    if (!addon) {
      return NextResponse.json({ error: 'Addon not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || addon.service.business.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the addon
    await prisma.serviceAddon.delete({
      where: { id: addonId }
    })

    return NextResponse.json({
      success: true,
      message: 'Addon deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting addon:', error)
    return NextResponse.json(
      { error: 'Failed to delete addon' },
      { status: 500 }
    )
  }
}
