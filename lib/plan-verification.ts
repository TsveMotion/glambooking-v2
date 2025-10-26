import { prisma } from '@/lib/prisma'

export interface PlanStatus {
  hasActivePlan: boolean
  planName: string
  status: 'active' | 'cancelled' | 'past_due' | 'none'
  nextBillingDate?: string
  subscriptionId?: string
}

export async function verifyUserPlan(clerkId: string): Promise<PlanStatus> {
  try {
    // Find user and their business
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        businesses: true
      }
    })

    if (!user || user.businesses.length === 0) {
      return {
        hasActivePlan: false,
        planName: 'none',
        status: 'none'
      }
    }

    const business = user.businesses[0]

    // Check if business has an active subscription
    // For now, we'll use a simple check - if they have a stripeAccountId, they have a plan
    // In a real app, you'd check with Stripe API for subscription status
    
    if (business.stripeAccountId) {
      // Mock plan verification - in reality you'd call Stripe API
      const hasActivePlan = true // Assume active for now
      
      return {
        hasActivePlan,
        planName: 'Starter Plan',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionId: 'sub_mock_123'
      }
    }

    // No subscription found
    return {
      hasActivePlan: false,
      planName: 'none',
      status: 'none'
    }

  } catch (error) {
    console.error('Error verifying user plan:', error)
    return {
      hasActivePlan: false,
      planName: 'none',
      status: 'none'
    }
  }
}

export function requiresActivePlan(pathname: string): boolean {
  // Define which routes require an active plan
  const protectedRoutes = [
    '/business/dashboard',
    '/business/calendar',
    '/business/clients',
    '/business/services',
    '/business/team',
    '/business/analytics',
    '/business/payouts',
    '/business/notifications',
    '/business/profile'
  ]

  return protectedRoutes.some(route => pathname.startsWith(route))
}
