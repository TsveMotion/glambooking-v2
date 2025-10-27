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

    // Get staff record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        staff: {
          include: {
            business: true
          }
        }
      }
    })

    if (!user || !user.staff.length) {
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }

    const staff = user.staff[0] as any // Temporary type assertion until Prisma client updates

    // Check if staff already has a Stripe account
    if (staff.stripeAccountId) {
      // Get existing account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: staff.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/staff/payouts?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/staff/payouts?success=true`,
        type: 'account_onboarding',
      })

      return NextResponse.json({ url: accountLink.url })
    }

    // Create new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'GB', // UK
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        first_name: staff.firstName,
        last_name: staff.lastName,
        email: user.email,
      },
      metadata: {
        staff_id: staff.id,
        user_id: user.id,
        business_id: staff.businessId,
      },
    })

    // Save Stripe account ID to staff record
    await prisma.staff.update({
      where: { id: staff.id },
      data: { stripeAccountId: account.id } as any // Temporary type assertion
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/staff/payouts?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/staff/payouts?success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ 
      url: accountLink.url,
      accountId: account.id
    })

  } catch (error) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    )
  }
}
