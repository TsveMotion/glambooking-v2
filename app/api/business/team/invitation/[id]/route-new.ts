import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invitationId = params.id
    console.log('=== INVITATION LOOKUP API (NEW) ===')
    console.log('Looking for invitation ID:', invitationId)
    console.log('Params object:', params)

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: {
        business: {
          select: {
            name: true
          }
        },
        inviter: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!invitation) {
      console.log('Invitation not found for ID:', invitationId)
      return NextResponse.json({ 
        error: 'Invitation not found' 
      }, { status: 404 })
    }

    console.log('Found invitation:', invitation.id, invitation.status, invitation.expiresAt)

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ 
        error: 'Invitation has expired' 
      }, { status: 410 })
    }

    // Check if invitation is still pending
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Invitation is no longer valid' 
      }, { status: 410 })
    }

    return NextResponse.json({
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      email: invitation.email,
      role: invitation.role,
      businessName: invitation.business.name,
      inviterName: `${invitation.inviter.firstName} ${invitation.inviter.lastName}`
    })

  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Error fetching invitation' },
      { status: 500 }
    )
  }
}
