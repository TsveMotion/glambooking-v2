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

    // Default commission rate of 60% if not set in business settings
    const businessSettings = business?.customization?.settings as any
    const commissionRate = businessSettings?.staffCommissionRate || 60

    // Get all completed bookings for this staff member
    const completedBookings = await prisma.booking.findMany({
      where: {
        staffId: staff.id,
        status: 'COMPLETED'
      },
      include: {
        payments: {
          where: {
            status: 'COMPLETED'
          }
        },
        service: true
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    // Calculate total earnings
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      const paymentTotal = booking.payments.reduce((paySum, payment) => 
        paySum + parseFloat(payment.amount.toString()), 0)
      return sum + paymentTotal
    }, 0)

    const totalEarnings = (totalRevenue * commissionRate) / 100

    // Calculate this month's earnings
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const thisMonthBookings = completedBookings.filter(booking => 
      booking.startTime >= thisMonth
    )
    
    const thisMonthRevenue = thisMonthBookings.reduce((sum, booking) => {
      const paymentTotal = booking.payments.reduce((paySum, payment) => 
        paySum + parseFloat(payment.amount.toString()), 0)
      return sum + paymentTotal
    }, 0)

    const thisMonthEarnings = (thisMonthRevenue * commissionRate) / 100

    // Calculate this week's earnings
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()) // Start of week
    thisWeek.setHours(0, 0, 0, 0)

    const thisWeekBookings = completedBookings.filter(booking => 
      booking.startTime >= thisWeek
    )

    const thisWeekRevenue = thisWeekBookings.reduce((sum, booking) => {
      const paymentTotal = booking.payments.reduce((paySum, payment) => 
        paySum + parseFloat(payment.amount.toString()), 0)
      return sum + paymentTotal
    }, 0)

    const thisWeekEarnings = (thisWeekRevenue * commissionRate) / 100

    // Get pending payouts from business payouts table
    const pendingPayouts = await prisma.payout.findMany({
      where: {
        businessId: staff.businessId,
        status: 'PENDING'
      }
    })

    const pendingPayoutAmount = pendingPayouts.reduce((sum, payout) => 
      sum + parseFloat(payout.amount.toString()), 0
    ) * (commissionRate / 100) // Staff gets their commission percentage

    // Get last payout
    const lastPayout = await prisma.payout.findFirst({
      where: {
        businessId: staff.businessId,
        status: 'COMPLETED'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate next payout date (weekly payouts on Fridays)
    const nextPayoutDate = new Date()
    const daysUntilFriday = (5 - nextPayoutDate.getDay() + 7) % 7
    nextPayoutDate.setDate(nextPayoutDate.getDate() + (daysUntilFriday || 7))

    // Calculate average booking value
    const avgBookingValue = completedBookings.length > 0 
      ? totalRevenue / completedBookings.length 
      : 0

    // Calculate monthly growth
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    lastMonth.setDate(1)
    lastMonth.setHours(0, 0, 0, 0)

    const lastMonthEnd = new Date(thisMonth)
    lastMonthEnd.setTime(lastMonthEnd.getTime() - 1)

    const lastMonthBookings = completedBookings.filter(booking => 
      booking.startTime >= lastMonth && booking.startTime <= lastMonthEnd
    )

    const lastMonthRevenue = lastMonthBookings.reduce((sum, booking) => {
      const paymentTotal = booking.payments.reduce((paySum, payment) => 
        paySum + parseFloat(payment.amount.toString()), 0)
      return sum + paymentTotal
    }, 0)

    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0

    const earningsData = {
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      thisMonthEarnings: parseFloat(thisMonthEarnings.toFixed(2)),
      thisWeekEarnings: parseFloat(thisWeekEarnings.toFixed(2)),
      pendingPayouts: parseFloat(pendingPayoutAmount.toFixed(2)),
      lastPayoutDate: lastPayout?.createdAt.toISOString().split('T')[0] || null,
      nextPayoutDate: nextPayoutDate.toISOString().split('T')[0],
      commissionRate,
      avgBookingValue: parseFloat(avgBookingValue.toFixed(2)),
      totalBookings: completedBookings.length,
      monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
      businessName: business?.name || 'Unknown Business'
    }

    return NextResponse.json(earningsData)

  } catch (error) {
    console.error('Staff earnings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}
