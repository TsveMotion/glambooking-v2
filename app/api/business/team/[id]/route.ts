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

    const staffMember = await prisma.staff.findFirst({
      where: {
        id: params.id,
        businessId: business.id
      }
    })

    if (!staffMember) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const now = new Date()

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        staffId: params.id,
        startTime: {
          gte: now
        }
      },
      select: { id: true }
    })

    if (upcomingBookings.length > 0) {
      await prisma.$transaction([
        prisma.staff.update({
          where: { id: params.id },
          data: {
            isActive: false,
            firstName: `[REMOVED] ${staffMember.firstName}`,
            lastName: staffMember.lastName,
            email: `removed_${Date.now()}@${staffMember.email}`
          }
        }),
        prisma.booking.updateMany({
          where: { staffId: params.id },
          data: { staffId: null }
        })
      ])

      return NextResponse.json({
        success: true,
        message: 'Staff member deactivated and removed from upcoming bookings. Past bookings preserved for records.'
      })
    }

    await prisma.staff.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully.'
    })
  } catch (error) {
    console.error('Delete team member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
