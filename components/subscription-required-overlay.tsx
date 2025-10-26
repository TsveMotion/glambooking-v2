'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Crown, Check, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SubscriptionRequiredOverlayProps {
  isVisible: boolean
  onClose?: () => void
  allowClose?: boolean
}

export default function SubscriptionRequiredOverlay({ 
  isVisible, 
  onClose, 
  allowClose = false 
}: SubscriptionRequiredOverlayProps) {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string>('free')

  useEffect(() => {
    if (isVisible) {
      // Prevent scrolling when overlay is visible
      document.body.style.overflow = 'hidden'
      
      // Fetch current plan
      fetchCurrentPlan()
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch('/api/business/plan-status')
      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data.plan || 'free')
      }
    } catch (error) {
      console.error('Error fetching plan status:', error)
    }
  }

  const handleUpgrade = () => {
    router.push('/business/pricing')
  }

  const handleManageSubscription = () => {
    router.push('/business/manage-plan')
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-glam-pink to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Subscription Required</h2>
          <p className="text-center text-white/90">
            Access to the business dashboard requires an active subscription plan.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Plan Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Current Plan</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {currentPlan === 'free' ? 'No Active Plan' : currentPlan}
                </p>
              </div>
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Starter Plan Features */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Starter Plan - £30/month</h3>
            <div className="space-y-2">
              {[
                'Up to 3 team members',
                'Unlimited bookings',
                'Email notifications',
                'Custom booking page',
                'Basic analytics'
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-glam-pink to-purple-600 hover:from-glam-pink/90 hover:to-purple-600/90 text-white"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Choose Your Plan
            </Button>

            {currentPlan !== 'free' && (
              <Button 
                onClick={handleManageSubscription}
                variant="outline"
                className="w-full"
              >
                Manage Subscription
              </Button>
            )}

            {allowClose && onClose && (
              <Button 
                onClick={onClose}
                variant="ghost"
                className="w-full text-gray-600"
              >
                Continue without subscription
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> Contact our support team if you have any questions about plans or billing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
