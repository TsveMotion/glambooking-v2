import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Associate a user with a whitelabel subdomain/business
 * Called during signup when user signs up through a subdomain
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subdomain } = await req.json()

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 })
    }

    // Find the business with this subdomain
    const whitelabelConfig = await prisma.whiteLabelConfig.findUnique({
      where: { subdomain },
      include: { business: true }
    })

    if (!whitelabelConfig) {
      return NextResponse.json({ error: 'Subdomain not found' }, { status: 404 })
    }

    // Find or create the user
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: '', // Will be updated by Clerk webhook
      }
    })

    // Store subdomain association in user metadata or separate table
    // For now, we'll add it to a BusinessCustomization settings field
    // In a full implementation, you'd want a UserBusinessAssociation table

    // Store in business customization settings
    await prisma.businessCustomization.upsert({
      where: { businessId: whitelabelConfig.businessId },
      update: {
        settings: {
          // @ts-ignore
          ...(whitelabelConfig.business.customization?.settings || {}),
          associatedUsers: [
            // @ts-ignore
            ...((whitelabelConfig.business.customization?.settings?.associatedUsers || []) as string[]),
            userId
          ]
        }
      },
      create: {
        businessId: whitelabelConfig.businessId,
        settings: {
          associatedUsers: [userId]
        }
      }
    })

    return NextResponse.json({
      success: true,
      businessId: whitelabelConfig.businessId,
      subdomain: subdomain,
      redirectUrl: `http://${subdomain}.localhost:3000/business/dashboard`
    })
  } catch (error) {
    console.error('Error associating user with subdomain:', error)
    return NextResponse.json(
      { error: 'Error associating user with subdomain' },
      { status: 500 }
    )
  }
}

/**
 * Get the subdomain associated with current user
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find businesses where user is associated
    const businesses = await prisma.business.findMany({
      include: {
        whitelabelConfig: true,
        customization: true
      }
    })

    // Find businesses that have this user in their associated users
    const userBusiness = businesses.find(business => {
      const settings = business.customization?.settings as any
      return settings?.associatedUsers?.includes(userId)
    })

    if (userBusiness?.whitelabelConfig?.subdomain) {
      return NextResponse.json({
        subdomain: userBusiness.whitelabelConfig.subdomain,
        businessId: userBusiness.id,
        redirectUrl: `http://${userBusiness.whitelabelConfig.subdomain}.localhost:3000/business/dashboard`
      })
    }

    return NextResponse.json({
      subdomain: null,
      businessId: null,
      redirectUrl: null
    })
  } catch (error) {
    console.error('Error getting user subdomain:', error)
    return NextResponse.json(
      { error: 'Error getting user subdomain' },
      { status: 500 }
    )
  }
}
