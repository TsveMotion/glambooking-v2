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

    // Find the invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      return NextResponse.json({ 
        error: 'Invitation not found' 
      }, { status: 404 })
    }

    // Update invitation status to completed
    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { 
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding completed successfully'
    })

  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Error completing onboarding' },
      { status: 500 }
    )
  }
}
