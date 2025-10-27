import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Check if user is a business owner
    const isBusinessOwner = user.businesses.length > 0

    // Check if user is a staff member
    const staffRecord = await prisma.staff.findFirst({
      where: { 
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const isStaffMember = !!staffRecord

    // Determine primary role and dashboard route
    let role = 'user'
    let dashboardRoute = '/business/dashboard'
    let businessInfo = null

    if (isBusinessOwner && isStaffMember) {
      // User is both owner and staff - prioritize business owner
      role = 'business_owner'
      dashboardRoute = '/business/dashboard'
      businessInfo = user.businesses[0]
    } else if (isBusinessOwner) {
      role = 'business_owner'
      dashboardRoute = '/business/dashboard'
      businessInfo = user.businesses[0]
    } else if (isStaffMember) {
      role = 'staff_member'
      dashboardRoute = '/staff/dashboard'
      businessInfo = staffRecord.business
    }

    return NextResponse.json({
      role,
      dashboardRoute,
      isBusinessOwner,
      isStaffMember,
      businessInfo,
      staffInfo: staffRecord ? {
        id: staffRecord.id,
        role: staffRecord.role,
        businessName: staffRecord.business.name
      } : null
    })

  } catch (error) {
    console.error('Error determining user role:', error)
    return NextResponse.json(
      { error: 'Error determining user role' },
      { status: 500 }
    )
  }
}
