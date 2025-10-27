import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, currentPlan } = await req.json()

    if (!planId || !['free', 'starter', 'professional', 'enterprise'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (planId === currentPlan) {
      return NextResponse.json({ error: 'Already on this plan' }, { status: 400 })
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            customization: true
          }
        }
      }
    })

    if (!user || !user.businesses.length) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]
    const businessRecord = business as Prisma.BusinessGetPayload<{ include: { customization: true } }>

    // Plan pricing
    const planPricing = {
      free: { price: 0, name: 'Free Plan', maxStaff: 1 },
      starter: { price: 1900, name: 'Starter Plan', maxStaff: 5 },
      professional: { price: 3900, name: 'Professional Plan', maxStaff: 15 },
      enterprise: { price: 7900, name: 'Enterprise Plan', maxStaff: 50 }
    }

    const selectedPlan = planPricing[planId as keyof typeof planPricing]
    const existingSettings = (businessRecord.customization?.settings as any) || {}
    const previousSubscriptionSettings = (existingSettings.subscription as any) || {}

    // Handle downgrade to Free plan (no Stripe checkout needed)
    if (planId === 'free') {
      await prisma.business.update({
        where: { id: business.id },
        data: {
          plan: 'free',
          maxStaff: selectedPlan.maxStaff,
          planStartDate: new Date(),
          planEndDate: null,
          stripeSubscriptionId: null
        } as Prisma.BusinessUpdateInput
      })

      await prisma.businessCustomization.upsert({
        where: { businessId: business.id },
        update: {
          settings: {
            ...existingSettings,
            subscription: {
              ...previousSubscriptionSettings,
              plan: 'free',
              planName: selectedPlan.name,
              maxStaff: selectedPlan.maxStaff,
              status: 'active',
              updatedAt: new Date().toISOString(),
              nextBillingDate: null
            }
          }
        },
        create: {
          businessId: business.id,
          settings: {
            subscription: {
              ...previousSubscriptionSettings,
              plan: 'free',
              planName: selectedPlan.name,
              maxStaff: selectedPlan.maxStaff,
              status: 'active',
              updatedAt: new Date().toISOString(),
              nextBillingDate: null
            }
          }
        }
      })

      return NextResponse.json({ 
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/business/manage-plan?downgrade=success&plan=free`,
        isFreeDowngrade: true
      })
    }

    // For paid plans, create a checkout session
    // Use a valid email or omit customer_email if user.email is invalid
    const customerEmail = user.email && user.email.includes('@') && !user.email.includes(' ') 
      ? user.email 
      : undefined
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      ...(customerEmail && { customer_email: customerEmail }),
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: selectedPlan.name,
              description: `GlamBooking ${selectedPlan.name} - Upgrade from ${currentPlan}`,
            },
            unit_amount: selectedPlan.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        businessId: business.id,
        planId: planId,
        userId: userId,
        upgradeFrom: currentPlan,
        isUpgrade: 'true'
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/manage-plan?upgrade=success&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/business/pricing?upgrade=cancelled`,
      subscription_data: {
        metadata: {
          businessId: business.id,
          planId: planId,
          currentPlan: currentPlan,
          upgradeFrom: currentPlan
        }
      }
    })

    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null

    const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await prisma.business.update({
      where: { id: business.id },
      data: {
        plan: planId,
        maxStaff: selectedPlan.maxStaff,
        planStartDate: new Date(),
        planEndDate: nextBillingDate,
        stripeSubscriptionId: subscriptionId
      } as Prisma.BusinessUpdateInput
    })

    await prisma.businessCustomization.upsert({
      where: { businessId: business.id },
      update: {
        settings: {
          ...existingSettings,
          subscription: {
            ...previousSubscriptionSettings,
            plan: planId,
            planName: selectedPlan.name,
            maxStaff: selectedPlan.maxStaff,
            status: 'active',
            checkoutSessionId: session.id,
            subscriptionId,
            upgradedFrom: currentPlan,
            updatedAt: new Date().toISOString(),
            nextBillingDate: nextBillingDate.toISOString()
          }
        }
      },
      create: {
        businessId: business.id,
        settings: {
          subscription: {
            ...previousSubscriptionSettings,
            plan: planId,
            planName: selectedPlan.name,
            maxStaff: selectedPlan.maxStaff,
            status: 'active',
            checkoutSessionId: session.id,
            subscriptionId,
            upgradedFrom: currentPlan,
            updatedAt: new Date().toISOString(),
            nextBillingDate: nextBillingDate.toISOString()
          }
        }
      }
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error) {
    console.error('Upgrade API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
