import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { brevoEmailService } from '@/lib/brevo-email'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invitationId = params.id

    // Find the invitation and verify ownership
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            ownerId: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ 
        error: 'Invitation not found' 
      }, { status: 404 })
    }

    // Verify the user owns the business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || invitation.business.ownerId !== user.id) {
      return NextResponse.json({ 
        error: 'Unauthorized to resend this invitation' 
      }, { status: 403 })
    }

    // Check if invitation is still pending
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Can only resend pending invitations' 
      }, { status: 400 })
    }

    // Extend expiry date
    const updatedInvitation = await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { 
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Extend by 7 days
      }
    })

    // Generate invitation link
    const inviteToken = Buffer.from(JSON.stringify({
      invitationId: invitation.id,
      email: invitation.email,
      businessId: invitation.business.id
    })).toString('base64')

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${inviteToken}`

    // Resend invitation email
    const emailSent = await brevoEmailService.sendTeamInvitation({
      to: invitation.email,
      name: `${invitation.firstName} ${invitation.lastName}`,
      businessName: invitation.business.name,
      role: invitation.role,
      inviteLink
    })

    if (!emailSent) {
      return NextResponse.json({ 
        error: 'Failed to resend invitation email' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Invitation resent successfully',
      invitation: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        expiresAt: updatedInvitation.expiresAt
      }
    })

  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json(
      { error: 'Error resending invitation' },
      { status: 500 }
    )
  }
}
