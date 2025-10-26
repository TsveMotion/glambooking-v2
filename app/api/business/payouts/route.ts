import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

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

    // Get all payments for this business
    const payments = await prisma.payment.findMany({
      where: {
        booking: {
          businessId: business.id
        }
      },
      include: {
        booking: {
          include: {
            service: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate REAL balances from actual payments
    const completedPayments = payments.filter((p: any) => p.status === 'COMPLETED')
    const totalEarnings = completedPayments.reduce((sum: number, payment: any) => sum + Number(payment.businessAmount), 0)
    const platformFees = completedPayments.reduce((sum: number, payment: any) => sum + Number(payment.platformFee), 0)
    
    // Get REAL available balance (payments older than 2 days are available for payout)
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const availablePayments = completedPayments.filter((p: any) => new Date(p.createdAt) < twoDaysAgo)
    const availableBalance = availablePayments.reduce((sum: number, payment: any) => sum + Number(payment.businessAmount), 0)
    
    // Pending balance = recent payments (less than 2 days old)
    const pendingPayments = completedPayments.filter((p: any) => new Date(p.createdAt) >= twoDaysAgo)
    const pendingBalance = pendingPayments.reduce((sum: number, payment: any) => sum + Number(payment.businessAmount), 0)

    // Mock payout history for now (until payout table is created)
    const formattedPayoutHistory = [
      {
        id: '1',
        amount: 250.00,
        status: 'COMPLETED',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Weekly payout',
        stripeTransferId: 'tr_1234567890'
      },
      {
        id: '2',
        amount: 180.50,
        status: 'COMPLETED',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Weekly payout',
        stripeTransferId: 'tr_0987654321'
      }
    ]

    // Calculate next payout date (next Friday)
    const today = new Date()
    const nextFriday = new Date(today)
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7
    nextFriday.setDate(today.getDate() + daysUntilFriday)

    // Get real Stripe account details if connected
    let stripeAccountDetails = null
    let bankAccountDetails = null
    
    if (business.stripeAccountId) {
      try {
        // Get Stripe account details
        const account = await stripe.accounts.retrieve(business.stripeAccountId)
        stripeAccountDetails = account
        
        // Get external accounts (bank accounts)
        if (account.external_accounts && account.external_accounts.data.length > 0) {
          const bankAccount = account.external_accounts.data[0] as any
          bankAccountDetails = {
            id: bankAccount.id,
            bankName: bankAccount.bank_name || 'Connected Bank',
            accountNumber: bankAccount.last4 || '****',
            routingNumber: bankAccount.routing_number || '****',
            currency: bankAccount.currency || 'gbp',
            status: account.details_submitted ? 'verified' : 'pending'
          }
        }
      } catch (stripeError) {
        console.error('Error fetching Stripe account details:', stripeError)
      }
    }

    const payoutData = {
      availableBalance,
      pendingBalance,
      totalEarnings,
      platformFees,
      payoutHistory: formattedPayoutHistory,
      nextPayoutDate: nextFriday.toISOString(),
      stripeConnected: !!business.stripeAccountId,
      stripeAccountDetails,
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
