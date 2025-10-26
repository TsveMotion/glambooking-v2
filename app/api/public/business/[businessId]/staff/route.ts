import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { businessId } = params

    // Verify business exists and is active
    const business = await prisma.business.findUnique({
      where: { 
        id: businessId,
        isActive: true
      }
    })

    if (!business) {
      return NextResponse.json({ 
        error: 'Business not found' 
      }, { status: 404 })
    }

    // Get active staff for this business
    const staff = await prisma.staff.findMany({
      where: {
        businessId: businessId,
        isActive: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    const formattedStaff = staff.map(member => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      imageUrl: member.imageUrl,
      isActive: member.isActive
    }))

    return NextResponse.json({ 
      staff: formattedStaff
    })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Error fetching staff' },
      { status: 500 }
    )
  }
}
