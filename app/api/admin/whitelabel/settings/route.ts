import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Update white-label settings for partner
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      businessId,
      brandName,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      platformFeePercentage,
      monthlyFee
    } = await req.json()

    // Verify user owns this business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { whitelabelConfig: true }
    })

    if (!business || business.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update white-label config
    const updatedConfig = await prisma.whiteLabelConfig.update({
      where: { businessId },
      data: {
        brandName,
        logoUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        platformFeePercentage: platformFeePercentage ? parseFloat(platformFeePercentage.toString()) : undefined,
        monthlyFee: monthlyFee ? parseFloat(monthlyFee.toString()) : undefined,
        updatedAt: new Date()
      }
    })

    // Revalidate paths to ensure UI updates immediately
    try {
      revalidatePath(`/admin/${businessId}`)
      revalidatePath('/business/dashboard')
      if (business.whitelabelConfig?.subdomain) {
        revalidatePath('/', 'layout')
      }
    } catch (e) {
      console.error('Error revalidating paths:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedConfig
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Error updating settings' },
      { status: 500 }
    )
  }
}
