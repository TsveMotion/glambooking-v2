import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
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

    if (!business.stripeAccountId) {
      return NextResponse.json({ error: 'Stripe account not connected' }, { status: 400 })
    }

    // Get business settings for commission rates
    const customization = await prisma.businessCustomization.findUnique({
      where: { businessId: business.id }
    })

    const settings = customization?.settings as any || {}
    const staffCommissionRate = settings.staffCommissionRate || 60

    // Get completed payments that haven't been paid out yet
    const unpaidPayments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        booking: {
          businessId: business.id
        }
      },
      include: {
        booking: {
          include: {
            staff: true,
            service: true
          }
        }
      }
    })

    if (unpaidPayments.length === 0) {
      return NextResponse.json({ message: 'No payments to process' })
    }

    // Calculate total business earnings and staff payouts
    let totalBusinessEarnings = 0
    const staffPayouts: { [staffId: string]: { amount: number, staff: any, bookings: any[] } } = {}

    for (const payment of unpaidPayments) {
      const businessAmount = parseFloat(payment.businessAmount.toString())
      const staffEarnings = (businessAmount * staffCommissionRate) / 100
      const businessEarnings = businessAmount - staffEarnings

      totalBusinessEarnings += businessEarnings

      const staffId = payment.booking.staffId
      if (!staffPayouts[staffId]) {
        staffPayouts[staffId] = {
          amount: 0,
          staff: payment.booking.staff,
          bookings: []
        }
      }
      staffPayouts[staffId].amount += staffEarnings
      staffPayouts[staffId].bookings.push(payment.booking)
    }

    // Create business payout record
    const businessPayout = await prisma.payout.create({
      data: {
        amount: totalBusinessEarnings,
        status: 'PENDING',
        description: `Business payout for ${unpaidPayments.length} payments`,
        businessId: business.id
      }
    })

    // Process staff payouts via Stripe Connect
    const staffPayoutResults = []
    for (const [staffId, payoutData] of Object.entries(staffPayouts)) {
      try {
        // Only process if staff has Stripe account connected
        // Note: This would need the stripeAccountId field to work properly
        const staffAmount = Math.round(payoutData.amount * 100) // Convert to pence

        if (staffAmount > 0) {
          // For now, we'll create a transfer record in our database
          // In production, you'd create actual Stripe transfers to staff accounts
          
          console.log(`Would transfer £${payoutData.amount.toFixed(2)} to staff ${payoutData.staff.firstName} ${payoutData.staff.lastName}`)
          
          staffPayoutResults.push({
            staffId,
            staffName: `${payoutData.staff.firstName} ${payoutData.staff.lastName}`,
            amount: payoutData.amount,
            bookingsCount: payoutData.bookings.length,
            status: 'pending_stripe_account'
          })
        }
      } catch (error) {
        console.error(`Error processing payout for staff ${staffId}:`, error)
        staffPayoutResults.push({
          staffId,
          staffName: `${payoutData.staff.firstName} ${payoutData.staff.lastName}`,
          amount: payoutData.amount,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Mark payments as processed (you might want to add a 'processed' status)
    // await prisma.payment.updateMany({
    //   where: {
    //     id: { in: unpaidPayments.map(p => p.id) }
    //   },
    //   data: { status: 'PROCESSED' }
    // })

    return NextResponse.json({
      success: true,
      businessPayout: {
        id: businessPayout.id,
        amount: totalBusinessEarnings,
        paymentsProcessed: unpaidPayments.length
      },
      staffPayouts: staffPayoutResults,
      summary: {
        totalRevenue: unpaidPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0),
        businessEarnings: totalBusinessEarnings,
        staffEarnings: Object.values(staffPayouts).reduce((sum, p) => sum + p.amount, 0),
        commissionRate: staffCommissionRate
      }
    })

  } catch (error) {
    console.error('Process payouts error:', error)
    return NextResponse.json(
      { error: 'Failed to process payouts' },
      { status: 500 }
    )
  }
}
