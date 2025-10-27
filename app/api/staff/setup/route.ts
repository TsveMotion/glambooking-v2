import { NextRequest, NextResponse } from 'next/server'
import { auth, createClerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    console.log('=== STAFF SETUP API ===')
    console.log('User ID:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(userId)
    console.log('Clerk user:', clerkUser.emailAddresses[0]?.emailAddress)

    const primaryEmail = clerkUser.emailAddresses.find(email => 
      email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    if (!primaryEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    // Create user if doesn't exist
    if (!user) {
      console.log('Creating user record')
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl || null
        }
      })
      console.log('User created:', user.id)
    }

    // Look for pending invitation for this email
    const invitation = await prisma.teamInvitation.findFirst({
      where: {
        email: primaryEmail,
        status: 'PENDING'
      }
    })

    console.log('Found invitation:', invitation ? invitation.id : 'none')

    if (invitation) {
      // Create staff record
      const staffRecord = await prisma.staff.create({
        data: {
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          email: invitation.email,
          phone: invitation.phone,
          role: invitation.role,
          isActive: true,
          businessId: invitation.businessId,
          userId: user.id
        }
      })

      console.log('Staff record created:', staffRecord.id)

      // Update invitation status
      await prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' }
      })

      console.log('Invitation marked as accepted')
    }

    return NextResponse.json({ 
      success: true,
      message: 'Staff setup completed',
      userId: user.id
    })

  } catch (error) {
    console.error('Error in staff setup:', error)
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    )
  }
}
