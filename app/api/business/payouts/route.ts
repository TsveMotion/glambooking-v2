import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

interface PayoutData {
  availableBalance: number
  pendingBalance: number
  totalEarnings: number
  platformFees: number
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

    // Get business settings for commission calculation
    const customization = await prisma.businessCustomization.findUnique({
      where: { businessId: business.id }
    })

    const settings = customization?.settings as any || {}
    const staffCommissionRate = settings.staffCommissionRate || 60

    // Get all completed payments for this business
    const completedPayments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        booking: {
          businessId: business.id
        }
      },
      include: {
        booking: {
          include: {
            service: true,
            staff: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate balances
    let totalRevenue = 0
    let totalPlatformFees = 0
    let totalBusinessEarnings = 0

    for (const payment of completedPayments) {
      const amount = parseFloat(payment.amount.toString())
      const platformFee = parseFloat(payment.platformFee.toString())
      const businessAmount = parseFloat(payment.businessAmount.toString())
      
      totalRevenue += amount
      totalPlatformFees += platformFee
      
      // Calculate business earnings after staff commission
      const staffEarnings = (businessAmount * staffCommissionRate) / 100
      const businessEarnings = businessAmount - staffEarnings
      totalBusinessEarnings += businessEarnings
    }

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

    // Calculate pending balance (recent unpaid earnings)
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)
    
    const recentPayments = completedPayments.filter(p => 
      p.createdAt >= thisWeek
    )

    const pendingBalance = recentPayments.reduce((sum, payment) => {
      const businessAmount = parseFloat(payment.businessAmount.toString())
      const staffEarnings = (businessAmount * staffCommissionRate) / 100
      const businessEarnings = businessAmount - staffEarnings
      return sum + businessEarnings
    }, 0)

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

    const availableBalance = totalBusinessEarnings - pendingBalance

    const payoutData: PayoutData = {
      availableBalance: Math.max(0, availableBalance),
      pendingBalance,
      totalEarnings: totalBusinessEarnings,
      platformFees: totalPlatformFees,
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
