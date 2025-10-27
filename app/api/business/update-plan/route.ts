import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getPlanLimits, validatePlanDowngrade } from '@/lib/plan-limits'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await req.json()

    if (!planId || !['free', 'starter', 'professional', 'enterprise'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: {
          include: {
            staff: true
          }
        }
      }
    })

    if (!user || !user.businesses.length) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = user.businesses[0]
    const currentStaffCount = business.staff.length

    // Validate plan downgrade
    const validation = validatePlanDowngrade(currentStaffCount, planId)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 })
    }

    // Get new plan limits
    const planLimits = getPlanLimits(planId)

    // Update business plan (with type assertion until Prisma client updates)
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        plan: planId,
        maxStaff: planLimits.maxStaff,
        bookingFeePercentage: planLimits.bookingFeePercentage,
      } as any
    })

    console.log(`Business plan updated: ${business.id} -> ${planId}`)

    return NextResponse.json({ 
      success: true,
      business: updatedBusiness,
      message: `Successfully updated to ${planId} plan`
    })
  } catch (error) {
    console.error('Update plan API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
