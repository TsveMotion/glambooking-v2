'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 glam-gradient rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold glam-text-gradient">GlamBooking</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-glam-charcoal">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <SignIn 
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
            redirectUrl="/business/dashboard"
            signUpUrl="/register"
          />
        </div>
      </div>
    </div>
  )
}
