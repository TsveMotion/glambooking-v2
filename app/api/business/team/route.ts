import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            staff: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user doesn't have a business, create one
    let business
    if (!user.businesses.length) {
      business = await prisma.business.create({
        data: {
          name: `${user.firstName || 'My'} Beauty Business`,
          ownerId: user.id
        },
        include: {
          staff: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })
    } else {
      business = user.businesses[0]
    }

    // Get business plan (you might want to add this to your business model)
    const businessWithPlan = {
      ...business,
      plan: 'starter', // Default plan, you can implement plan detection logic
      teamMembers: business.staff.map(member => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        role: member.role || 'Staff',
        isActive: member.isActive,
        imageUrl: member.imageUrl,
        createdAt: member.createdAt,
        payoutSettings: {
          type: 'percentage_own', // Default to percentage of own bookings
          value: 60 // Default 60%
        },
        totalEarnings: Math.random() * 2000, // Mock earnings
        thisWeekEarnings: Math.random() * 500 // Mock weekly earnings
      }))
    }

    return NextResponse.json({ business: businessWithPlan })
  } catch (error) {
    console.error('Team API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { firstName, lastName, email, phone, role } = await req.json()

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            staff: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user doesn't have a business, create one
    let business
    if (!user.businesses.length) {
      business = await prisma.business.create({
        data: {
          name: `${user.firstName || 'My'} Beauty Business`,
          ownerId: user.id
        },
        include: {
          staff: true
        }
      })
    } else {
      business = user.businesses[0]
    }

    // Check if email already exists in this business
    const existingMember = await prisma.staff.findFirst({
      where: {
        businessId: business.id,
        email: email
      }
    })

    if (existingMember) {
      return NextResponse.json({ error: 'Team member with this email already exists' }, { status: 409 })
    }

    // Create new team member
    const newMember = await prisma.staff.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        role: role || 'Staff',
        businessId: business.id,
        isActive: true
      }
    })

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error) {
    console.error('Add team member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
