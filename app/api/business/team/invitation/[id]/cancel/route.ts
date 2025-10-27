import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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
        error: 'Unauthorized to cancel this invitation' 
      }, { status: 403 })
    }

    // Cancel the invitation by updating status
    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { 
        status: 'CANCELLED'
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Invitation cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return NextResponse.json(
      { error: 'Error cancelling invitation' },
      { status: 500 }
    )
  }
}
