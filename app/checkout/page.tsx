'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CreditCard, 
  Shield, 
  Check,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = {
  starter: {
    name: 'Starter',
    price: '£30',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'demo_starter_price',
    features: [
      'Up to 3 staff members',
      'Unlimited bookings',
      'Basic analytics',
      'Email notifications',
      'Standard support',
      'Custom booking page'
    ]
  },
  professional: {
    name: 'Professional',
    price: '£50',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || 'demo_professional_price',
    features: [
      'Up to 10 staff members',
      'Unlimited bookings',
      'Advanced analytics',
      'Email & SMS notifications',
      'Priority support',
      'Custom branding',
      'Marketing tools'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: '£100',
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'demo_enterprise_price',
    features: [
      'Unlimited staff members',
      'Unlimited bookings',
      'Premium analytics',
      'Email & SMS notifications',
      'Dedicated support',
      'Custom branding',
      'Marketing tools',
      'Multi-location support',
      'API access'
    ]
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planType = searchParams.get('plan') || 'starter'
  const [isLoading, setIsLoading] = useState(false)
  
  const selectedPlan = plans[planType as keyof typeof plans] || plans.starter

  const handleStartTrial = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan.priceId,
          planName: selectedPlan.name,
          mode: 'subscription'
        }),
      })

      const { sessionId } = await response.json()
      
      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        })
        
        if (error) {
          console.error('Stripe error:', error)
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 text-glam-pink hover:text-glam-pink/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold text-glam-charcoal mb-4">
            Start Your Free Trial
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with {selectedPlan.name} plan. No charges for 14 days, cancel anytime.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card className="border-2 border-glam-pink shadow-xl">
            <CardHeader className="bg-gradient-to-r from-glam-pink/5 to-glam-gold/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-glam-charcoal">{selectedPlan.name} Plan</CardTitle>
                  <CardDescription className="text-lg">
                    <span className="text-3xl font-bold text-glam-charcoal">{selectedPlan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </CardDescription>
                </div>
                <div className="w-16 h-16 bg-glam-pink rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="font-semibold">14-Day Free Trial</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    No charges until {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-glam-charcoal mb-3">What's included:</h3>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Platform fee per booking</span>
                    <span>5%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>You keep</span>
                    <span className="font-semibold text-glam-charcoal">95%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-glam-charcoal flex items-center">
                <CreditCard className="w-6 h-6 mr-2" />
                Payment Information
              </CardTitle>
              <CardDescription>
                We'll collect your payment details to start your subscription after the trial ends.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">Demo Mode Active</h4>
                    <p className="text-sm text-green-700">
                      This is a demo. Use Stripe test card: 4242 4242 4242 4242, any future date, any CVC.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Secure Payment</h4>
                    <p className="text-sm text-blue-700">
                      Your payment information is encrypted and secure. Powered by Stripe.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-glam-charcoal mb-2">Trial Details:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Free for 14 days</li>
                    <li>• Full access to all {selectedPlan.name} features</li>
                    <li>• Cancel anytime during trial</li>
                    <li>• No charges if cancelled before trial ends</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-glam-charcoal mb-2">After Trial:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Automatically billed {selectedPlan.price}/month</li>
                    <li>• Cancel or change plan anytime</li>
                    <li>• 5% transaction fee on bookings</li>
                    <li>• 95% of booking revenue goes to you</li>
                  </ul>
                </div>
              </div>

              <Button 
                onClick={handleStartTrial}
                disabled={isLoading}
                className="w-full glam-gradient text-white text-lg py-3 hover:opacity-90"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    Start Free Trial
                    <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By clicking "Start Free Trial", you agree to our Terms of Service and Privacy Policy.
                You can cancel anytime during your trial period.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
