// Plan configuration and limits
export const PLAN_LIMITS = {
  free: {
    maxStaff: 1,
    bookingFeePercentage: 5.0, // 5% platform fee + Stripe fees separate
    features: ['Basic analytics', 'Email notifications', 'Community support']
  },
  starter: {
    maxStaff: 5,
    bookingFeePercentage: 4.0, // 4% platform fee + Stripe fees separate
    features: ['Advanced analytics', 'Email notifications', 'Priority support', 'Basic branding']
  },
  professional: {
    maxStaff: 15,
    bookingFeePercentage: 3.0,
    features: ['Premium analytics', 'Email & SMS notifications', 'Priority support', 'Full branding', 'Marketing tools']
  },
  enterprise: {
    maxStaff: -1, // Unlimited
    bookingFeePercentage: 2.0,
    features: ['Enterprise analytics', 'Dedicated support', 'White-label branding', 'Advanced marketing', 'API access']
  }
} as const

export type PlanType = keyof typeof PLAN_LIMITS

// Check if business can add more staff based on their plan
export function canAddStaff(currentStaffCount: number, plan: string): boolean {
  const planLimits = PLAN_LIMITS[plan as PlanType]
  if (!planLimits) return false
  
  // Unlimited staff for enterprise
  if (planLimits.maxStaff === -1) return true
  
  return currentStaffCount < planLimits.maxStaff
}

// Get staff limit for a plan
export function getStaffLimit(plan: string): number {
  const planLimits = PLAN_LIMITS[plan as PlanType]
  return planLimits?.maxStaff || 1
}

// Get booking fee percentage for a plan
export function getBookingFeePercentage(plan: string): number {
  const planLimits = PLAN_LIMITS[plan as PlanType]
  return planLimits?.bookingFeePercentage || 5.0 // Default to 5% if plan not found
}

// Update business plan limits when plan changes
export function getPlanLimits(plan: string) {
  const planLimits = PLAN_LIMITS[plan as PlanType]
  if (!planLimits) {
    return PLAN_LIMITS.free
  }
  return planLimits
}

// Validate if current staff count exceeds new plan limits
export function validatePlanDowngrade(currentStaffCount: number, newPlan: string): {
  valid: boolean
  message?: string
} {
  const newLimits = getPlanLimits(newPlan)
  
  if (newLimits.maxStaff !== -1 && currentStaffCount > newLimits.maxStaff) {
    return {
      valid: false,
      message: `Cannot downgrade to ${newPlan} plan. You have ${currentStaffCount} staff members but this plan only allows ${newLimits.maxStaff}. Please remove staff members first.`
    }
  }
  
  return { valid: true }
}
