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
              Start with the Free Plan
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Perfect for solo practitioners just getting started
            </p>
            <div className="mt-4 inline-block bg-green-50 border border-green-200 rounded-lg px-6 py-3">
              <p className="text-3xl font-bold text-green-700">£0<span className="text-lg font-normal">/month</span></p>
              <p className="text-sm text-green-600">Free Forever</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-glam-charcoal">Free Plan Includes:</h3>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700"><strong>1 staff member only</strong></span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Unlimited bookings</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Basic analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Email notifications</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Community support</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Custom booking page</span>
            </div>
            <div className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-700 font-medium">5% platform fee + Stripe fees</span>
                <p className="text-sm text-gray-600 mt-1">(~1.5% + 20p per transaction)</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm">
            <p className="text-sm font-semibold text-purple-900 mb-2">💡 Want More?</p>
            <p className="text-sm text-gray-700 mb-3">Upgrade anytime to unlock:</p>
            <ul className="text-xs text-gray-600 space-y-1 ml-4">
              <li>• Multiple staff members (Starter: 5, Professional: 15)</li>
              <li>• Service add-ons (Professional+)</li>
              <li>• Lower platform fees (down to 2%)</li>
              <li>• Priority support & more!</li>
            </ul>
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

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Already have an account? <Link href="/login" className="text-glam-pink hover:underline font-medium">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
