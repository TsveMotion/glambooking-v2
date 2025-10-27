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

    console.log('=== STAFF STRIPE ACCOUNT CHECK ===')
    console.log('User ID:', userId)

    // Get staff record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        staff: true
      }
    })

    console.log('User found:', user?.id)
    console.log('Staff records:', user?.staff?.length)

    if (!user || !user.staff.length) {
      console.log('No staff record found')
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }

    const staff = user.staff[0] as any // Temporary type assertion until Prisma client updates
    console.log('Staff ID:', staff.id)
    console.log('Staff Stripe Account ID:', staff.stripeAccountId)

    if (!staff.stripeAccountId) {
      console.log('No Stripe account connected')
      return NextResponse.json({
        isConnected: false,
        isVerified: false,
        requiresAction: false
      })
    }

    // Get Stripe account details
    const account = await stripe.accounts.retrieve(staff.stripeAccountId)

    const isVerified = account.details_submitted && 
                      account.charges_enabled && 
                      account.payouts_enabled

    const requiresAction = account.details_submitted === false || 
                          !account.charges_enabled || 
                          !account.payouts_enabled

    let actionUrl = null
    if (requiresAction) {
      const accountLink = await stripe.accountLinks.create({
        account: staff.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/staff/payouts?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/staff/payouts?success=true`,
        type: 'account_onboarding',
      })
      actionUrl = accountLink.url
    }

    console.log('Stripe account status:', {
      isVerified,
      requiresAction,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled
    })

    return NextResponse.json({
      id: staff.stripeAccountId,
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
      }
    })

  } catch (error) {
    console.error('Stripe account check error:', error)
    return NextResponse.json(
      { error: 'Failed to check Stripe account' },
      { status: 500 }
    )
  }
}
