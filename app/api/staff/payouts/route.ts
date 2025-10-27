import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get staff record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        staff: true
      }
    })

    if (!user || !user.staff.length) {
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }

    const staff = user.staff[0]

    // Get business settings for commission rate
    const business = await prisma.business.findUnique({
      where: { id: staff.businessId },
      include: {
        customization: true
      }
    })

    const businessSettings = business?.customization?.settings as any
    const commissionRate = businessSettings?.staffCommissionRate || 60

    // Get business payouts and calculate staff portion
    const businessPayouts = await prisma.payout.findMany({
      where: {
        businessId: staff.businessId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // For each payout period, calculate staff earnings
    const staffPayouts = await Promise.all(
      businessPayouts.map(async (payout) => {
        // Get the date range for this payout (assuming weekly payouts)
        const payoutDate = payout.createdAt
        const weekStart = new Date(payoutDate)
        weekStart.setDate(weekStart.getDate() - 7)
        weekStart.setHours(0, 0, 0, 0)
        
        const weekEnd = new Date(payoutDate)
        weekEnd.setHours(23, 59, 59, 999)

        // Get staff bookings for this period
        const staffBookings = await prisma.booking.findMany({
          where: {
            staffId: staff.id,
            status: 'COMPLETED',
            startTime: {
              gte: weekStart,
              lte: weekEnd
            }
          },
          include: {
            payments: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        })

        // Calculate staff earnings for this period
        const staffRevenue = staffBookings.reduce((sum, booking) => {
          const paymentTotal = booking.payments.reduce((paySum, payment) => 
            paySum + parseFloat(payment.amount.toString()), 0)
          return sum + paymentTotal
        }, 0)

        const staffEarnings = (staffRevenue * commissionRate) / 100

        // Only include if staff had earnings in this period
        if (staffEarnings > 0) {
          return {
            id: payout.id,
            amount: parseFloat(staffEarnings.toFixed(2)),
            currency: 'GBP',
            status: payout.status.toLowerCase(),
            date: payout.createdAt.toISOString().split('T')[0],
            description: `Weekly payout for ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
            stripePayoutId: payout.stripeTransferId,
            businessPayoutId: payout.id,
            bookingsCount: staffBookings.length
          }
        }
        return null
      })
    )

    // Filter out null entries and sort by date
    const validPayouts = staffPayouts
      .filter(payout => payout !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ 
      payouts: validPayouts,
      commissionRate,
      businessName: business?.name || 'Unknown Business'
    })

  } catch (error) {
    console.error('Staff payouts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    )
  }
}
