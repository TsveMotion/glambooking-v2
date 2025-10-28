import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getPlanLimits } from '@/lib/plan-limits'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, address, phone, email, website, services, staff } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Business name and email are required' }, { status: 400 })
    }

    // Get user email from Clerk using the function syntax (not deprecated)
    const clerk = clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const userEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    // Find or create user with robust error handling
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      // Check if user exists with this email
      user = await prisma.user.findUnique({
        where: { email: userEmail }
      })

      if (user) {
        // User exists with email but not clerkId - update it
        if (user.clerkId !== userId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              clerkId: userId,
              firstName: clerkUser.firstName || user.firstName,
              lastName: clerkUser.lastName || user.lastName,
            }
          })
        }
      } else {
        // Create new user - wrap in try-catch for race conditions
        try {
          user = await prisma.user.create({
            data: {
              clerkId: userId,
              email: userEmail,
              firstName: clerkUser.firstName || staff[0]?.name?.split(' ')[0] || '',
              lastName: clerkUser.lastName || staff[0]?.name?.split(' ').slice(1).join(' ') || '',
            }
          })
        } catch (createError: any) {
          // If unique constraint error, try to find the user that was just created
          if (createError.code === 'P2002') {
            console.log('⚠️ Race condition detected, fetching existing user...')
            user = await prisma.user.findUnique({ where: { email: userEmail } }) ||
                   await prisma.user.findUnique({ where: { clerkId: userId } })
            
            if (!user) {
              throw new Error('Failed to create or find user after race condition')
            }
          } else {
            throw createError
          }
        }
      }
    }

    // Get default plan limits (Free plan)
    const freePlanLimits = getPlanLimits('free')

    // Detect if this is a whitelabel subdomain
    const host = req.headers.get('host') || ''
    const subdomain = host.split('.')[0]
    
    // Check if subdomain has a whitelabel config
    let whitelabelConfig = null
    let isWhitelabel = false
    
    if (subdomain && subdomain !== 'admin' && subdomain !== 'localhost:3000' && !host.startsWith('localhost:3000')) {
      whitelabelConfig = await prisma.whiteLabelConfig.findUnique({
        where: { subdomain },
        include: { business: true }
      })
      
      if (whitelabelConfig) {
        isWhitelabel = true
        console.log('🏷️ Creating business under whitelabel:', subdomain)
      }
    }

    // Create business
    const business = await prisma.business.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        website,
        ownerId: user.id,
        plan: 'free',
        maxStaff: freePlanLimits.maxStaff,
        bookingFeePercentage: freePlanLimits.bookingFeePercentage,
        isWhiteLabel: isWhitelabel,
        services: {
          create: services.map((service: any) => ({
            name: service.name,
            duration: service.duration,
            price: service.price,
            category: 'General'
          }))
        },
        staff: {
          create: {
            firstName: staff[0]?.name?.split(' ')[0] || 'Owner',
            lastName: staff[0]?.name?.split(' ').slice(1).join(' ') || '',
            email: staff[0]?.email || email,
            role: 'owner'
          }
        }
      },
      include: {
        services: true,
        staff: true
      }
    })

    return NextResponse.json({ business })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: 'Error creating business' },
      { status: 500 }
    )
  }
}
