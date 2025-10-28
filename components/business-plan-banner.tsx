'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface BusinessPlanBannerProps {
  plan: string
  platformFee: number
}

export function BusinessPlanBanner({ plan, platformFee }: BusinessPlanBannerProps) {
  // Only show for free plan
  if (plan !== 'free') {
    return null
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Current Plan: Free • Platform Fee: {platformFee}% per booking (plus Stripe fees)
            </h4>
            <p className="text-sm text-blue-800">
              Customers pay the service price only. Platform fee of {platformFee}% + Stripe processing fees (~1.5% + 20p) are deducted from your earnings.
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Example: On a £100 booking, you receive £93.30 (£100 - £5 platform fee - £1.70 Stripe fees)
            </p>
          </div>
        </div>
        <Link href="/business/pricing">
          <Button size="sm" variant="outline" className="border-blue-500 text-blue-700 hover:bg-blue-100 ml-4">
            Upgrade Plan
          </Button>
        </Link>
      </div>
    </div>
  )
}
