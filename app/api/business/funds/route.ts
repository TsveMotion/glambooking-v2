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

    // Get all completed bookings with funds available
    const completedBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: 'COMPLETED',
        fundsAvailableAt: {
          lte: new Date() // Funds available now or in the past
        }
      },
      include: {
        service: true,
        staff: true,
        payments: true
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    // Calculate total available funds
    const totalAvailable = completedBookings.reduce((sum, booking) => {
      return sum + Number(booking.totalAmount)
    }, 0)

    // Calculate platform fees (includes Stripe transaction fees)
    // Customer pays service price only, platform fee is deducted from that
    const platformFeePercentage = Number(business.bookingFeePercentage) / 100
    const totalPlatformFees = totalAvailable * platformFeePercentage
    const netAmount = totalAvailable - totalPlatformFees

    // Get pending bookings (not yet completed)
    const pendingBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      },
      include: {
        service: true
      }
    })

    const totalPending = pendingBookings.reduce((sum, booking) => {
      return sum + Number(booking.totalAmount)
    }, 0)

    // Get bookings that can be marked as completed (time has passed)
    const now = new Date()
    const readyToComplete = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        },
        endTime: {
          lte: now
        }
      },
      include: {
        service: true,
        staff: true
      }
    })

    const totalReadyToComplete = readyToComplete.reduce((sum, booking) => {
      return sum + Number(booking.totalAmount)
    }, 0)

    return NextResponse.json({
      availableFunds: {
        total: totalAvailable,
        platformFees: totalPlatformFees,
        netAmount: netAmount,
        bookingsCount: completedBookings.length
      },
      pendingFunds: {
        total: totalPending,
        bookingsCount: pendingBookings.length
      },
      readyToComplete: {
        total: totalReadyToComplete,
        bookingsCount: readyToComplete.length,
        bookings: readyToComplete.map(b => ({
          id: b.id,
          clientName: b.clientName,
          serviceName: b.service.name,
          staffName: `${b.staff.firstName} ${b.staff.lastName}`,
          totalAmount: b.totalAmount,
          endTime: b.endTime
        }))
      },
      completedBookings: completedBookings.map(b => ({
        id: b.id,
        clientName: b.clientName,
        serviceName: b.service.name,
        staffName: `${b.staff.firstName} ${b.staff.lastName}`,
        totalAmount: b.totalAmount,
        completedAt: b.completedAt,
        fundsAvailableAt: b.fundsAvailableAt
      })),
      businessPlan: business.plan,
      feePercentage: business.bookingFeePercentage
    })
  } catch (error) {
    console.error('Error fetching funds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch funds data' },
      { status: 500 }
    )
  }
}
