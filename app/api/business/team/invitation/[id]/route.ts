import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invitationId = params.id

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
      return NextResponse.json({ 
        error: 'Invitation not found' 
      }, { status: 404 })
    }

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
      invitation: {
        businessName: invitation.business.name,
        role: invitation.role,
        inviterName: `${invitation.inviter.firstName} ${invitation.inviter.lastName}`,
        email: invitation.email
      }
    })

  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Error fetching invitation' },
      { status: 500 }
    )
  }
}
