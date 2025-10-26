'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Sparkles, 
  Calendar,
  ArrowRight,
  Gift
} from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd verify the session with Stripe
      // For now, we'll simulate success
      setTimeout(() => {
        setSessionData({
          planName: 'Professional',
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
        })
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-glam-charcoal mb-4">
            Welcome to GlamBooking! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your free trial has started successfully. You now have full access to all features.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Trial Information */}
          <Card className="border-2 border-green-200 shadow-xl bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <Gift className="w-6 h-6 mr-2" />
                Your Free Trial
              </CardTitle>
              <CardDescription className="text-green-700">
                Full access to {sessionData?.planName || 'Professional'} features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Trial ends:</span>
                  <span className="font-semibold text-green-800">
                    {sessionData?.trialEnd || 'In 14 days'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Plan:</span>
                  <span className="font-semibold text-green-800">
                    {sessionData?.planName || 'Professional'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Status:</span>
                  <span className="font-semibold text-green-800">Active Trial</span>
                </div>
                <div className="pt-4 border-t border-green-200">
                  <p className="text-sm text-green-700">
                    You won't be charged until your trial ends. Cancel anytime before then.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-glam-charcoal flex items-center">
                <Sparkles className="w-6 h-6 mr-2" />
                Next Steps
              </CardTitle>
              <CardDescription>
                Get started with your new booking system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-glam-pink rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-glam-charcoal">Set up your business</h4>
                    <p className="text-sm text-gray-600">Add your business details and services</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-glam-pink rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-glam-charcoal">Add your team</h4>
                    <p className="text-sm text-gray-600">Invite staff members and set their availability</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-glam-pink rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-glam-charcoal">Start taking bookings</h4>
                    <p className="text-sm text-gray-600">Share your booking page with clients</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Link href="/business/dashboard">
                  <Button className="w-full glam-gradient text-white">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Reminder */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-glam-pink/5 to-glam-gold/5">
          <CardHeader className="text-center">
            <CardTitle className="text-glam-charcoal">
              What's Included in Your Trial
            </CardTitle>
            <CardDescription>
              Full access to all Professional features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-glam-pink rounded-xl flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-glam-charcoal">Smart Scheduling</h4>
                <p className="text-sm text-gray-600">Advanced booking management with conflict prevention</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-glam-gold rounded-xl flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-glam-charcoal">Client Management</h4>
                <p className="text-sm text-gray-600">Detailed client profiles and booking history</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-glam-charcoal">Analytics</h4>
                <p className="text-sm text-gray-600">Advanced insights into your business performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
