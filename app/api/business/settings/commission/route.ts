import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            customization: true
          }
        }
      }
    })

    if (!user || !user.businesses.length) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]
    const settings = business.customization?.settings as any || {}

    return NextResponse.json({
      staffCommissionRate: settings.staffCommissionRate || 60,
      payoutFrequency: settings.payoutFrequency || 'weekly',
      payoutDay: settings.payoutDay || 'friday',
      minimumPayoutAmount: settings.minimumPayoutAmount || 10.00
    })

  } catch (error) {
    console.error('Get commission settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commission settings' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { staffCommissionRate, payoutFrequency, payoutDay, minimumPayoutAmount } = await req.json()

    // Validate inputs
    if (staffCommissionRate < 0 || staffCommissionRate > 100) {
      return NextResponse.json({ error: 'Commission rate must be between 0 and 100' }, { status: 400 })
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            customization: true
          }
        }
      }
    })

    if (!user || !user.businesses.length) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]

    // Update or create customization settings
    const currentSettings = business.customization?.settings as any || {}
    const newSettings = {
      ...currentSettings,
      staffCommissionRate: parseFloat(staffCommissionRate),
      payoutFrequency: payoutFrequency || 'weekly',
      payoutDay: payoutDay || 'friday',
      minimumPayoutAmount: parseFloat(minimumPayoutAmount) || 10.00,
      updatedAt: new Date().toISOString()
    }

    if (business.customization) {
      // Update existing customization
      await prisma.businessCustomization.update({
        where: { businessId: business.id },
        data: {
          settings: newSettings
        }
      })
    } else {
      // Create new customization
      await prisma.businessCustomization.create({
        data: {
          businessId: business.id,
          settings: newSettings
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Commission settings updated successfully',
      settings: newSettings
    })

  } catch (error) {
    console.error('Update commission settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update commission settings' },
      { status: 500 }
    )
  }
}
