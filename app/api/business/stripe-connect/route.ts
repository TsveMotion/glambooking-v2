import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
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

    try {
      // Create Stripe Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'GB',
        email: user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: 'individual',
        metadata: {
          businessId: business.id,
          userId: user.id
        }
      })

      // Update business with Stripe account ID
      await prisma.business.update({
        where: { id: business.id },
        data: {
          stripeAccountId: account.id,
          updatedAt: new Date()
        }
      })

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/payouts?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/payouts?connected=true`,
        type: 'account_onboarding'
      })

      // In a real app, you would store the account ID in your database
      // await prisma.business.update({
      //   where: { id: business.id },
      //   data: { stripeAccountId: account.id }
      // })

      return NextResponse.json({ 
        accountLinkUrl: accountLink.url,
        accountId: account.id
      })
    } catch (stripeError) {
      console.error('Stripe Connect error:', stripeError)
      return NextResponse.json({ error: 'Failed to create Stripe Connect account' }, { status: 500 })
    }
  } catch (error) {
    console.error('Stripe Connect API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
