'use client'

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { Sparkles, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Benefits */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 glam-gradient rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold glam-text-gradient">GlamBooking</span>
            </Link>
            <h1 className="mt-6 text-4xl font-bold text-glam-charcoal">
              Start Your Free Trial
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Join thousands of beauty professionals who trust GlamBooking
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">14-day free trial, no credit card required</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Unlimited bookings and clients</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Instant payments with Stripe (5% fee)</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">24/7 customer support</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Custom booking page for your business</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 bg-glam-pink rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">SJ</span>
                </div>
                <div className="w-10 h-10 bg-glam-gold rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">MW</span>
                </div>
                <div className="w-10 h-10 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">LB</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-glam-charcoal">Join 10,000+ beauty professionals</p>
                <p className="text-xs text-gray-500">Already using GlamBooking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-glam-charcoal">Create your account</h2>
            <p className="text-sm text-gray-600 mt-1">Get started in less than 2 minutes</p>
          </div>

          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'glam-gradient hover:opacity-90 text-white',
                card: 'shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-glam-pink',
                formFieldInput: 'border-2 border-gray-200 focus:border-glam-pink',
                footerActionLink: 'text-glam-pink hover:text-glam-pink/80'
              }
            }}
            redirectUrl="/business/onboarding"
            signInUrl="/login"
          />

          <div className="mt-6 text-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/checkout?plan=professional">
                <Button size="lg" variant="glam" className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
