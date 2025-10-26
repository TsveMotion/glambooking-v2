'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Crown, 
  Lock, 
  CreditCard,
  ArrowRight,
  CheckCircle,
  X
} from 'lucide-react'

interface PlanGuardProps {
  children: React.ReactNode
  requiredPlan?: 'starter' | 'pro' | 'enterprise'
  fallbackMessage?: string
}

interface PlanStatus {
  hasActivePlan: boolean
  planName: string
  status: 'active' | 'cancelled' | 'past_due' | 'none'
}

export default function PlanGuard({ 
  children, 
  requiredPlan = 'starter',
  fallbackMessage = 'This feature requires an active subscription plan.'
}: PlanGuardProps) {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && userId) {
      checkPlanStatus()
    } else if (isLoaded && !userId) {
      router.push('/login')
    }
  }, [isLoaded, userId, router])

  const checkPlanStatus = async () => {
    try {
      const response = await fetch('/api/business/plan-status')
      if (response.ok) {
        const data = await response.json()
        setPlanStatus(data)
      } else {
        setPlanStatus({
          hasActivePlan: false,
          planName: 'none',
          status: 'none'
        })
      }
    } catch (error) {
      console.error('Error checking plan status:', error)
      setPlanStatus({
        hasActivePlan: false,
        planName: 'none',
        status: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    )
  }

  if (!planStatus?.hasActivePlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-orange-800">Subscription Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-orange-700">
                {fallbackMessage}
              </p>
              
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Crown className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-semibold text-gray-900">Starter Plan</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">£30</span>
                </div>
                <div className="text-left space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Up to 3 team members
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Unlimited bookings
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Email notifications
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Custom booking page
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/business/pricing')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Choose Your Plan
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/business/manage-plan')}
                  className="w-full"
                >
                  Manage Subscription
                </Button>
              </div>

              {planStatus?.status === 'cancelled' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    Your subscription was cancelled. Reactivate to continue using GlamBooking.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // User has active plan, render children
  return <>{children}</>
}
