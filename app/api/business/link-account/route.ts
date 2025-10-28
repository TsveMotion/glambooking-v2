import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Link a newly created Clerk account to an existing pending business
 * Called after user signs up via the email link
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await req.json()

    console.log('Linking Clerk user to business:', { userId, email })

    // Find user with pending status
    const pendingUser = await prisma.user.findFirst({
      where: {
        email,
        clerkId: {
          startsWith: 'pending_'
        }
      }
    })

    if (!pendingUser) {
      console.log('No pending user found for email:', email)
      return NextResponse.json({ 
        success: false,
        message: 'No pending account found'
      })
    }

    // Update user with real Clerk ID
    await prisma.user.update({
      where: { id: pendingUser.id },
      data: { clerkId: userId }
    })

    console.log('User linked successfully:', pendingUser.id)

    // Find their business
    const business = await prisma.business.findFirst({
      where: { ownerId: pendingUser.id },
      include: {
        // @ts-ignore
        whitelabelConfig: true
      }
    })

    if (business) {
      const redirectUrl = business.whitelabelConfig?.subdomain
        ? `https://${business.whitelabelConfig.subdomain}.glambooking.co.uk/business/dashboard`
        : business.whitelabelConfig?.customDomain
        ? `https://${business.whitelabelConfig.customDomain}/business/dashboard`
        : '/business/dashboard'

      return NextResponse.json({
        success: true,
        businessId: business.id,
        redirectUrl
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Account linked'
    })
  } catch (error) {
    console.error('Error linking account:', error)
    return NextResponse.json(
      { error: 'Error linking account' },
      { status: 500 }
    )
  }
}
