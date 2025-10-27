import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isActive } = await req.json()

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || !user.businesses.length) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]

    // Update team member
    const updatedMember = await prisma.staff.update({
      where: {
        id: params.id,
        businessId: business.id
      },
      data: {
        isActive
      }
    })

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Update team member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || !user.businesses.length) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const now = new Date()

    // Calculate when funds will be available (immediately for now, can add delay if needed)
    const fundsAvailableAt = new Date()

    // Update booking status to completed
    await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'COMPLETED', completedAt: now }
    })

    return NextResponse.json({ success: true, message: 'Booking marked as completed' })
      // Instead of deleting, deactivate the staff member and update bookings
      await prisma.$transaction([
        // Deactivate the staff member
        prisma.staff.update({
          where: { id: params.id },
          data: { 
            isActive: false,
            firstName: `[REMOVED] ${member.firstName}`,
            lastName: member.lastName,
            email: `removed_${Date.now()}@${member.email}`
          }
        }),
        // Update all bookings to remove staff association (set to null or business owner)
        prisma.booking.updateMany({
          where: { staffId: params.id },
          data: { staffId: null }
        })
      ])
      
      return NextResponse.json({ 
        success: true, 
        message: 'Staff member deactivated and removed from future bookings. Past bookings preserved for records.' 
      })
    } else {
      // No bookings, safe to delete
      await prisma.staff.delete({
        where: {
          id: params.id
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Staff member deleted successfully.' 
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete team member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
