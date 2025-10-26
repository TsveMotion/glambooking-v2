'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Crown, Check, ArrowRight, X, CreditCard, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SubscriptionModalProps {
  isVisible: boolean
  onClose?: () => void
  allowClose?: boolean
}

export default function SubscriptionModal({ 
  isVisible, 
  onClose, 
  allowClose = false 
}: SubscriptionModalProps) {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isVisible) {
      // Prevent scrolling when modal is visible
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

  const handlePurchase = async (planId: string) => {
    try {
      setLoading(planId)
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: planId,
          planName: planId === 'starter' ? 'Starter' : planId === 'professional' ? 'Professional' : 'Enterprise'
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout process. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  if (!isVisible) return null

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 30,
      description: 'Perfect for solo practitioners and small salons',
      popular: true,
      features: [
        'Up to 3 team members',
        'Unlimited bookings',
        'Email notifications',
        'Custom booking page',
        'Basic analytics'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 50,
      description: 'Ideal for growing businesses with multiple staff',
      popular: false,
      features: [
        'Up to 10 team members',
        'Unlimited bookings',
        'Advanced analytics',
        'Email notifications',
        'SMS notifications',
        'Priority support',
        'Custom branding'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 100,
      description: 'For large salons and multi-location businesses',
      popular: false,
      features: [
        'Unlimited team members',
        'Unlimited bookings',
        'Premium analytics',
        'Email notifications',
        'SMS notifications',
        'Dedicated support',
        'Custom branding',
        'Multi-location support',
        'API access'
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-glam-pink to-purple-600 text-white p-6 rounded-t-lg relative">
          {allowClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">Subscription Required</h2>
          <p className="text-center text-white/90 text-lg">
            Access to the business dashboard requires an active subscription plan.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Plan Status */}
          <div className="mb-8">
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

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-glam-pink' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-glam-pink text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">£{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handlePurchase(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-glam-pink to-purple-600 hover:from-glam-pink/90 hover:to-purple-600/90 text-white' 
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Choose {plan.name}
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security & Support */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🔒 Secure Payment</h3>
              <p className="text-sm text-blue-800">
                All payments are processed securely through Stripe. Your card details are never stored on our servers.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">💬 24/7 Support</h3>
              <p className="text-sm text-green-800">
                Need help? Our support team is available 24/7 to assist you with any questions or issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
