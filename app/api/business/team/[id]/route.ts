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

    const business = user.businesses[0]

    // Check if member exists and belongs to this business
    const member = await prisma.staff.findFirst({
      where: {
        id: params.id,
        businessId: business.id
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Don't allow deleting the owner
    if (member.role === 'Owner') {
      return NextResponse.json({ error: 'Cannot delete business owner' }, { status: 403 })
    }

    // Check if staff member has any bookings
    const bookingsCount = await prisma.booking.count({
      where: {
        staffId: params.id
      }
    })

    if (bookingsCount > 0) {
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
