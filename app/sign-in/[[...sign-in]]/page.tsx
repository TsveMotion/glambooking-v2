'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignInPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [subdomain, setSubdomain] = useState<string | null>(null)

  // Detect subdomain on mount
  useEffect(() => {
    const hostname = window.location.hostname
    const parts = hostname.split('.')
    
    // Check if we're on a subdomain (not localhost or main domain)
    if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      setSubdomain(parts[0])
    }
  }, [])

  useEffect(() => {
    // If user just signed in, check for subdomain redirect
    const handleSignIn = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // Check if user has an associated subdomain
          const response = await fetch('/api/user/associate-subdomain')
          if (response.ok) {
            const data = await response.json()
            
            // If user has a subdomain and not currently on it, redirect
            if (data.subdomain && data.subdomain !== subdomain) {
              console.log('Redirecting user to their subdomain:', data.subdomain)
              window.location.href = data.redirectUrl
              return
            }
          }

          // If on a subdomain but no association, create one
          if (subdomain) {
            const associateResponse = await fetch('/api/user/associate-subdomain', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subdomain })
            })

            const associateData = await associateResponse.json()
            if (associateData.success) {
              window.location.href = associateData.redirectUrl
              return
            }
          }

          // Default redirect
          router.push('/business/dashboard')
        } catch (error) {
          console.error('Error handling sign in:', error)
          router.push('/business/dashboard')
        }
      }
    }

    handleSignIn()
  }, [isLoaded, isSignedIn, user, router, subdomain])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-md">
        {subdomain && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <p className="text-sm text-purple-800">
              <strong>Welcome back!</strong> Signing in to <strong>{subdomain}</strong>
            </p>
            <p className="text-xs text-purple-600 mt-1">
              You'll be redirected to your dashboard after signing in
            </p>
          </div>
        )}
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl'
            }
          }}
          afterSignInUrl="/business/dashboard"
          redirectUrl="/business/dashboard"
        />
      </div>
    </div>
  )
}
