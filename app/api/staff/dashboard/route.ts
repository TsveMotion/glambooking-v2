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

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Find staff record for this user by email
    const staffRecord = await prisma.staff.findFirst({
      where: { 
        email: user.email
      },
      include: {
        business: {
          select: {
            name: true,
            address: true,
            phone: true
          }
        }
      }
    })

    if (!staffRecord) {
      return NextResponse.json({ 
        error: 'Staff record not found' 
      }, { status: 404 })
    }

    // Mock dashboard data for now
    const staffData = {
      id: staffRecord.id,
      firstName: staffRecord.firstName,
      lastName: staffRecord.lastName,
      email: staffRecord.email || user.email,
      phone: staffRecord.phone,
      role: staffRecord.role,
      business: staffRecord.business,
      todayBookings: 0,
      weekBookings: 0,
      monthRevenue: 0,
      upcomingBookings: []
    }

    return NextResponse.json(staffData)
  } catch (error) {
    console.error('Error fetching staff dashboard data:', error)
    return NextResponse.json(
      { error: 'Error fetching dashboard data' },
      { status: 500 }
    )
  }
}

