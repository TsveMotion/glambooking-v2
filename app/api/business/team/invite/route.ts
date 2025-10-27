import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { brevoEmailService } from '@/lib/brevo-email'
import { canAddStaff } from '@/lib/plan-limits'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { firstName, lastName, email, phone, role } = await req.json()

    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: firstName, lastName, email, role' 
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

    const business = user.businesses[0] as any // Temporary type assertion until Prisma client updates

    // Get current staff count to check plan limits
    const currentStaffCount = await prisma.staff.count({
      where: { businessId: business.id }
    })

    // Check if business can add more staff based on their plan
    if (!canAddStaff(currentStaffCount, business.plan || 'free')) {
      return NextResponse.json({ 
        error: `You've reached the staff limit for your ${business.plan || 'free'} plan. Please upgrade to add more team members.`,
        upgradeRequired: true,
        currentPlan: business.plan || 'free'
      }, { status: 403 })
    }

    // Check if email already exists in this business as a staff member
    const existingMember = await prisma.staff.findFirst({
      where: {
        email,
        businessId: business.id
      }
    })

    if (existingMember) {
      return NextResponse.json({ 
        error: 'A team member with this email already exists' 
      }, { status: 400 })
    }

    // Check for ANY existing invitation for this email and business combination
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        email,
        businessId: business.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('Checking for existing invitation:', { email, businessId: business.id })
    console.log('Found existing invitation:', existingInvitation ? { id: existingInvitation.id, status: existingInvitation.status, expiresAt: existingInvitation.expiresAt } : 'none')

    if (existingInvitation) {
      if (existingInvitation.status === 'PENDING' || existingInvitation.expiresAt < new Date()) {
        // Update the existing invitation with new details and extend expiry
        console.log('Updating existing invitation:', existingInvitation.id)
        const updatedInvitation = await prisma.teamInvitation.update({
          where: { id: existingInvitation.id },
          data: {
            firstName,
            lastName,
            phone: phone || null,
            role,
            status: 'PENDING', // Reset to pending if it was expired
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Extend by 7 days
          }
        })

        // Generate new invitation link
        const inviteToken = Buffer.from(JSON.stringify({
          invitationId: updatedInvitation.id,
          email,
          businessId: business.id
        })).toString('base64')

        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${inviteToken}`

        // Resend invitation email
        const emailSent = await brevoEmailService.sendTeamInvitation({
          to: email,
          name: `${firstName} ${lastName}`,
          businessName: business.name,
          role,
          inviteLink
        })

        if (!emailSent) {
          return NextResponse.json({ 
            error: 'Failed to resend invitation email' 
          }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true,
          message: 'Invitation updated and resent successfully',
          type: 'resent',
          invitation: {
            id: updatedInvitation.id,
            email: updatedInvitation.email,
            name: `${firstName} ${lastName}`,
            role,
            status: 'PENDING',
            expiresAt: updatedInvitation.expiresAt
          }
        })
      } else {
        return NextResponse.json({ 
          error: 'This person has already accepted an invitation to your team' 
        }, { status: 400 })
      }
    }

    // Create pending team member invitation
    const invitation = await prisma.teamInvitation.create({
      data: {
        email,
        firstName,
        lastName,
        phone: phone || null,
        role,
        businessId: business.id,
        invitedBy: user.id,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    // Generate invitation link
    const inviteToken = Buffer.from(JSON.stringify({
      invitationId: invitation.id,
      email,
      businessId: business.id
    })).toString('base64')

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${inviteToken}`

    // Send invitation email
    const emailSent = await brevoEmailService.sendTeamInvitation({
      to: email,
      name: `${firstName} ${lastName}`,
      businessName: business.name,
      role,
      inviteLink
    })

    if (!emailSent) {
      // Delete the invitation if email failed
      await prisma.teamInvitation.delete({
        where: { id: invitation.id }
      })
      
      return NextResponse.json({ 
        error: 'Failed to send invitation email' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Invitation sent successfully',
      type: 'new',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: `${firstName} ${lastName}`,
        role,
        status: 'PENDING',
        expiresAt: invitation.expiresAt
      }
    })

  } catch (error) {
    console.error('Error sending team invitation:', error)
    return NextResponse.json(
      { error: 'Error sending invitation' },
      { status: 500 }
    )
  }
}
