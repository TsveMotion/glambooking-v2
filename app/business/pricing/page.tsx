'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Check,
  Star,
  Users,
  BarChart3,
  Mail,
  MessageSquare,
  Headphones,
  Palette,
  Megaphone,
  MapPin,
  Zap,
  Crown,
  ArrowUp,
  CheckCircle2
} from 'lucide-react'

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  price: number
  description: string
  popular?: boolean
  features: PlanFeature[]
  maxStaff: number
  transactionFee: number
}

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [businessData, setBusinessData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    fetchBusinessData()
  }, [])

  const fetchBusinessData = async () => {
    try {
      // Fetch current plan status
      const planResponse = await fetch('/api/business/plan-status')
      if (planResponse.ok) {
        const planData = await planResponse.json()
        setCurrentPlan(planData.plan || 'free')
      }

      // Fetch business data
      const response = await fetch('/api/business/dashboard')
      if (response.ok) {
        const data = await response.json()
        setBusinessData(data)
        // Only update if we have a valid plan from dashboard
        if (data.business?.plan) {
          setCurrentPlan(data.business.plan)
        }
      }
    } catch (error) {
      console.error('Failed to fetch business data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Perfect for solo practitioners just getting started',
      maxStaff: 1,
      transactionFee: 10,
      features: [
        { text: '1 staff member only', included: true },
        { text: 'Unlimited bookings', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Community support', included: true },
        { text: 'Custom booking page', included: true },
        { text: 'SMS notifications', included: false },
        { text: 'Custom branding', included: false },
        { text: 'Marketing tools', included: false },
        { text: 'Multi-location support', included: false }
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 19,
      description: 'Great for small salons with multiple staff',
      popular: true,
      maxStaff: 5,
      transactionFee: 5,
      features: [
        { text: 'Up to 5 staff members', included: true },
        { text: 'Unlimited bookings', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Priority support', included: true },
        { text: 'Custom booking page', included: true },
        { text: 'Basic branding', included: true },
        { text: 'SMS notifications', included: false },
        { text: 'Marketing tools', included: false },
        { text: 'Multi-location support', included: false }
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 39,
      description: 'Ideal for growing businesses with multiple locations',
      maxStaff: 15,
      transactionFee: 3,
      features: [
        { text: 'Up to 15 staff members', included: true },
        { text: 'Unlimited bookings', included: true },
        { text: 'Premium analytics', included: true },
        { text: 'Email notifications', included: true },
        { text: 'SMS notifications', included: true },
        { text: 'Priority support', included: true },
        { text: 'Full custom branding', included: true },
        { text: 'Marketing tools', included: true },
        { text: 'Multi-location support', included: true },
        { text: 'API access', included: false }
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 79,
      description: 'For large salons and franchise businesses',
      maxStaff: -1,
      transactionFee: 2,
      features: [
        { text: 'Unlimited staff members', included: true },
        { text: 'Unlimited bookings', included: true },
        { text: 'Enterprise analytics', included: true },
        { text: 'Email notifications', included: true },
        { text: 'SMS notifications', included: true },
        { text: 'Dedicated support manager', included: true },
        { text: 'White-label branding', included: true },
        { text: 'Advanced marketing suite', included: true },
        { text: 'Multi-location support', included: true },
        { text: 'API access', included: true },
        { text: 'Custom integrations', included: true }
      ]
    }
  ]

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return
    
    setLoading(planId)
    
    try {
      const response = await fetch('/api/business/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, currentPlan })
      })

      if (response.ok) {
        const { checkoutUrl } = await response.json()
        window.location.href = checkoutUrl
      } else {
        alert('Failed to start upgrade process')
      }
    } catch (error) {
      alert('Failed to start upgrade process')
    } finally {
      setLoading(null)
    }
  }

  const isCurrentPlan = (planId: string) => planId === currentPlan
  const isUpgrade = (planId: string) => {
    const planOrder = { free: 0, starter: 1, professional: 2, enterprise: 3 }
    return planOrder[planId as keyof typeof planOrder] > planOrder[currentPlan as keyof typeof planOrder]
  }
  const isDowngrade = (planId: string) => {
    const planOrder = { free: 0, starter: 1, professional: 2, enterprise: 3 }
    return planOrder[planId as keyof typeof planOrder] < planOrder[currentPlan as keyof typeof planOrder]
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your plan details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Upgrade Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Get more team members, advanced features, and priority support. Upgrade or downgrade anytime with no setup fees.
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="max-w-4xl mx-auto mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Current Plan: {plans.find(p => p.id === currentPlan)?.name}
                  </h3>
                  <p className="text-gray-600">
                    £{plans.find(p => p.id === currentPlan)?.price}/month • 
                    {plans.find(p => p.id === currentPlan)?.maxStaff === -1 ? ' Unlimited' : ` Up to ${plans.find(p => p.id === currentPlan)?.maxStaff}`} team members • 
                    {businessData?.business?.staff?.length || 0} members currently
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Need more team members?</p>
                <p className="text-sm font-medium text-blue-600">Upgrade to add more staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative border-2 ${
              isCurrentPlan(plan.id)
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : plan.popular && !isCurrentPlan(plan.id)
                ? 'border-glam-pink shadow-xl scale-105' 
                : 'border-gray-200 hover:border-gray-300'
            } transition-all duration-200`}
          >
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Current Plan
                </span>
              </div>
            )}
            {plan.popular && !isCurrentPlan(plan.id) && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-glam-pink to-glam-gold text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </span>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {plan.name}
              </CardTitle>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">£{plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="flex justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {plan.maxStaff === -1 ? 'Unlimited' : `Up to ${plan.maxStaff}`} staff
                </div>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  {plan.transactionFee}% fee
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className={`w-5 h-5 mr-3 mt-0.5 ${
                      feature.included ? 'text-green-500' : 'text-gray-300'
                    }`} />
                    <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              {isCurrentPlan(plan.id) ? (
                <Button
                  disabled
                  className="w-full py-3 font-semibold bg-blue-500 text-white cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 font-semibold ${
                    isUpgrade(plan.id)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                      : isDowngrade(plan.id)
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : isUpgrade(plan.id) ? (
                    <>
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Upgrade to {plan.name}
                    </>
                  ) : isDowngrade(plan.id) ? (
                    `Downgrade to ${plan.name}`
                  ) : (
                    `Switch to ${plan.name}`
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">When do plan changes take effect?</h3>
            <p className="text-gray-600 text-sm">
              Plan upgrades take effect immediately, giving you instant access to new features and team member slots. 
              Downgrades take effect at the end of your current billing cycle.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What happens to my team members if I downgrade?</h3>
            <p className="text-gray-600 text-sm">
              If you downgrade to a plan with fewer team member slots, existing members remain active but you won't be able to add new ones until you're within the limit.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How is billing handled for plan changes?</h3>
            <p className="text-gray-600 text-sm">
              We prorate all billing adjustments. If you upgrade mid-cycle, you'll only pay the difference for the remaining days. 
              Downgrades are credited to your next invoice.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my subscription?</h3>
            <p className="text-gray-600 text-sm">
              Yes, you can cancel anytime from your account settings. Your account remains active until the end of your current billing period, 
              and you'll retain access to all features during that time.
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="max-w-4xl mx-auto mt-16">
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardContent className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-glam-gold" />
            <h3 className="text-2xl font-bold mb-4">Need Something Custom?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              For large enterprises, franchises, or businesses with unique requirements, 
              we offer custom solutions tailored to your specific needs.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <Headphones className="w-8 h-8 mx-auto mb-2 text-glam-gold" />
                <h4 className="font-semibold mb-1">Dedicated Support</h4>
                <p className="text-sm text-gray-300">Personal account manager and priority support</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-glam-gold" />
                <h4 className="font-semibold mb-1">Custom Integrations</h4>
                <p className="text-sm text-gray-300">API access and custom integrations with your existing systems</p>
              </div>
              <div className="text-center">
                <Palette className="w-8 h-8 mx-auto mb-2 text-glam-gold" />
                <h4 className="font-semibold mb-1">White Label</h4>
                <p className="text-sm text-gray-300">Fully branded solution with your company's look and feel</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/business/support')}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-gray-900"
            >
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
