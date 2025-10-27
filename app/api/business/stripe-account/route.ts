import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

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

    if (!business.stripeAccountId) {
      return NextResponse.json({
        isConnected: false,
        isVerified: false,
        requiresAction: false
      })
    }

    // Get Stripe account details
    const account = await stripe.accounts.retrieve(business.stripeAccountId)

    const isVerified = account.details_submitted && 
                      account.charges_enabled && 
                      account.payouts_enabled

    const requiresAction = account.details_submitted === false || 
                          !account.charges_enabled || 
                          !account.payouts_enabled

    let actionUrl = null
    if (requiresAction) {
      const accountLink = await stripe.accountLinks.create({
        account: business.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/payouts?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/payouts?success=true`,
        type: 'account_onboarding',
      })
      actionUrl = accountLink.url
    }

    return NextResponse.json({
      id: business.stripeAccountId,
      isConnected: true,
      isVerified,
      requiresAction,
      actionUrl,
      accountDetails: {
        country: account.country,
        defaultCurrency: account.default_currency,
        email: account.email,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        businessName: account.company?.name || account.individual?.first_name
      }
    })

  } catch (error) {
    console.error('Business Stripe account check error:', error)
    return NextResponse.json(
      { error: 'Failed to check Stripe account' },
      { status: 500 }
    )
  }
}
