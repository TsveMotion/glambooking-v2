import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { calculatePayoutDistribution } from '@/lib/payouts/calculate-payout-distribution'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

interface PayoutData {
  availableBalance: number
  pendingBalance: number
  totalEarnings: number
  totalRevenueLessFeesOwnerEarnings: number
  platformFees: number
  staffEarnings: number
  payoutHistory: PayoutTransaction[]
  nextPayoutDate: string
  stripeConnected: boolean
  bankAccount?: BankAccount
  stripeAccountId?: string
}

interface PayoutTransaction {
  id: string
  amount: number
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  date: string
  description: string
  stripeTransferId?: string
}

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  routingNumber: string
  currency: string
  status: string
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ 
        error: 'No business found for user' 
      }, { status: 404 })
    }

    const business = user.businesses[0]

    // Get business owner
    const owner = await prisma.user.findUnique({
      where: { id: business.ownerId }
    })

    const { allocations, totals } = await calculatePayoutDistribution({
      businessId: business.id,
      owner: {
        id: owner?.id || user.id,
        firstName: owner?.firstName || user.firstName,
        lastName: owner?.lastName || user.lastName,
        email: owner?.email || user.email
      }
    })

    const ownerAllocation = allocations.find((member) => member.isOwner)

    const totalRevenue = totals.totalGross
    const ownerEarnings = totals.ownerTotal
    const staffEarnings = totals.staffTotal
    const totalPlatformFees = totals.platformFees


    // Get payout history
    const payoutHistory = await prisma.payout.findMany({
      where: {
        businessId: business.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const formattedPayoutHistory: PayoutTransaction[] = payoutHistory.map(payout => ({
      id: payout.id,
      amount: parseFloat(payout.amount.toString()),
      status: payout.status as 'COMPLETED' | 'PENDING' | 'FAILED',
      date: payout.createdAt.toISOString().split('T')[0],
      description: payout.description || `Payout ${payout.id}`,
      stripeTransferId: payout.stripeTransferId || undefined
    }))

    // Pending balance shows owner's total earnings (staff earnings go directly to staff)
    const pendingBalance = totals.ownerTotal

    // Calculate next payout date (weekly on Fridays)
    const nextPayout = new Date()
    const daysUntilFriday = (5 - nextPayout.getDay() + 7) % 7
    nextPayout.setDate(nextPayout.getDate() + (daysUntilFriday || 7))

    // Check Stripe connection status
    let stripeConnected = false
    let bankAccountDetails: BankAccount | undefined

    if (business.stripeAccountId) {
      try {
        const account = await stripe.accounts.retrieve(business.stripeAccountId)
        stripeConnected = account.charges_enabled && account.payouts_enabled
        
        // Get external accounts (bank accounts)
        if (account.external_accounts && account.external_accounts.data.length > 0) {
          const bankAccount = account.external_accounts.data[0] as any
          bankAccountDetails = {
            id: bankAccount.id,
            bankName: bankAccount.bank_name || 'Connected Bank',
            accountNumber: `****${bankAccount.last4 || '****'}`,
            routingNumber: bankAccount.routing_number || '****',
            currency: bankAccount.currency || 'gbp',
            status: account.details_submitted ? 'verified' : 'pending'
          }
        }
      } catch (stripeError) {
        console.error('Error fetching Stripe account details:', stripeError)
      }
    }

    const availableBalance = ownerEarnings - pendingBalance

    const payoutData: PayoutData = {
      availableBalance: Math.max(0, availableBalance),
      pendingBalance,
      totalEarnings: totalRevenue, // Show total revenue, not just owner earnings
      totalRevenueLessFeesOwnerEarnings: ownerEarnings,
      platformFees: totalPlatformFees,
      staffEarnings: staffEarnings,
      payoutHistory: formattedPayoutHistory,
      nextPayoutDate: nextPayout.toISOString().split('T')[0],
      stripeConnected,
      stripeAccountId: business.stripeAccountId || undefined,
      bankAccount: bankAccountDetails
    }

    return NextResponse.json(payoutData)
  } catch (error) {
    console.error('Error fetching payout data:', error)
    return NextResponse.json(
      { error: 'Error fetching payout data' },
      { status: 500 }
    )
  }
}
