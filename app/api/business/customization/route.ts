import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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

    // Get customization settings
    const customization = await prisma.businessCustomization.findUnique({
      where: {
        businessId: business.id
      }
    })

    return NextResponse.json({ 
      settings: customization?.settings || null 
    })
  } catch (error) {
    console.error('Error fetching customization:', error)
    return NextResponse.json(
      { error: 'Error fetching customization settings' },
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

    const body = await req.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json({ 
        error: 'Settings are required' 
      }, { status: 400 })
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

    // Upsert customization settings
    const customization = await prisma.businessCustomization.upsert({
      where: {
        businessId: business.id
      },
      update: {
        settings: settings
      },
      create: {
        businessId: business.id,
        settings: settings
      }
    })

    return NextResponse.json({ 
      success: true,
      customization: {
        id: customization.id,
        settings: customization.settings
      }
    })
  } catch (error) {
    console.error('Error saving customization:', error)
    return NextResponse.json(
      { error: 'Error saving customization settings' },
      { status: 500 }
    )
  }
}
