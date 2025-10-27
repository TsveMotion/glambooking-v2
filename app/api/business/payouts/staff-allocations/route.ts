import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { calculatePayoutDistribution } from '@/lib/payouts/calculate-payout-distribution'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ 
        error: 'No business found for user' 
      }, { status: 404 })
    }

    const business = user.businesses[0]

    // Get business owner
    const owner = await prisma.user.findUnique({
      where: { id: business.ownerId }
    })

    const { allocations } = await calculatePayoutDistribution({
      businessId: business.id,
      owner: {
        id: owner?.id || user.id,
        firstName: owner?.firstName || user.firstName,
        lastName: owner?.lastName || user.lastName,
        email: owner?.email || user.email
      }
    })

    return NextResponse.json({ staffAllocations: allocations })
  } catch (error) {
    console.error('Error fetching staff allocations:', error)
    return NextResponse.json(
      { error: 'Error fetching staff allocations' },
      { status: 500 }
    )
  }
}

// Update staff payout settings
export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { staffId, payoutSettings } = body

    // Find user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ 
        error: 'No business found for user' 
      }, { status: 404 })
    }

    const business = user.businesses[0]

    // Verify staff belongs to business
    const staff = await prisma.staff.findFirst({
      where: {
        id: staffId,
        businessId: business.id
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    // For now, we'll store payout settings in business customization
    // In a real app, you'd want a separate table for staff payout settings
    const existingCustomization = await prisma.businessCustomization.findUnique({
      where: { businessId: business.id }
    })

    const currentSettings = (existingCustomization?.settings as any)?.staffPayoutSettings || {}

    const updatedSettings = {
      ...currentSettings,
      [staffId]: payoutSettings
    }

    await prisma.businessCustomization.upsert({
      where: { businessId: business.id },
      create: {
        businessId: business.id,
        settings: {
          staffPayoutSettings: updatedSettings
        }
      },
      update: {
        settings: {
          staffPayoutSettings: updatedSettings
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating staff payout settings:', error)
    return NextResponse.json(
      { error: 'Error updating payout settings' },
      { status: 500 }
    )
  }
}
