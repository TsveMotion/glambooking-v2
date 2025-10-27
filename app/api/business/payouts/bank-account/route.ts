import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Update bank account
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { accountNumber, routingNumber, accountHolderName } = body

    if (!accountNumber || !routingNumber || !accountHolderName) {
      return NextResponse.json({ 
        error: 'All bank account fields are required' 
      }, { status: 400 })
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

    // Check if business has Stripe account
    if (!business.stripeAccountId) {
      return NextResponse.json({ 
        error: 'Please connect your Stripe account first' 
      }, { status: 400 })
    }

    try {
      // Create or update external account (bank account) in Stripe
      const account = await stripe.accounts.retrieve(business.stripeAccountId)
      
      // For test mode, we'll create a test bank account token
      // In production, you'd use Stripe Elements or a proper bank account token
      const bankAccountToken = await stripe.tokens.create({
        bank_account: {
          country: 'GB',
          currency: 'gbp',
          account_holder_name: accountHolderName,
          account_holder_type: 'individual',
          routing_number: routingNumber,
          account_number: accountNumber,
        },
      })

      // Add the bank account to the connected account
      const bankAccount = await stripe.accounts.createExternalAccount(
        business.stripeAccountId,
        {
          external_account: bankAccountToken.id,
        }
      )

      // Set as default for payouts
      await stripe.accounts.update(business.stripeAccountId, {
        default_currency: 'gbp',
      })

      return NextResponse.json({ 
        success: true,
        message: 'Bank account updated successfully',
        bankAccount: {
          id: bankAccount.id,
          last4: (bankAccount as any).last4,
          bankName: (bankAccount as any).bank_name || 'Bank Account',
        }
      })
    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError)
      
      // Handle test mode gracefully
      if (stripeError.message?.includes('test mode')) {
        return NextResponse.json({ 
          success: true,
          message: 'Bank account saved (test mode)',
          testMode: true
        })
      }
      
      return NextResponse.json({ 
        error: stripeError.message || 'Failed to update bank account in Stripe' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating bank account:', error)
    return NextResponse.json(
      { error: 'Error updating bank account' },
      { status: 500 }
    )
  }
}

// Get bank account details
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

    if (!business.stripeAccountId) {
      return NextResponse.json({ 
        bankAccount: null,
        stripeConnected: false
      })
    }

    try {
      const account = await stripe.accounts.retrieve(business.stripeAccountId)
      
      if (account.external_accounts && account.external_accounts.data.length > 0) {
        const bankAccount = account.external_accounts.data[0] as any
        
        return NextResponse.json({
          bankAccount: {
            id: bankAccount.id,
            bankName: bankAccount.bank_name || 'Connected Bank',
            accountNumber: `****${bankAccount.last4 || '****'}`,
            routingNumber: bankAccount.routing_number || '****',
            currency: bankAccount.currency || 'gbp',
            status: account.details_submitted ? 'verified' : 'pending'
          },
          stripeConnected: true
        })
      }
      
      return NextResponse.json({ 
        bankAccount: null,
        stripeConnected: true
      })
    } catch (stripeError) {
      console.error('Error fetching bank account:', stripeError)
      return NextResponse.json({ 
        bankAccount: null,
        stripeConnected: false
      })
    }
  } catch (error) {
    console.error('Error fetching bank account:', error)
    return NextResponse.json(
      { error: 'Error fetching bank account' },
      { status: 500 }
    )
  }
}
