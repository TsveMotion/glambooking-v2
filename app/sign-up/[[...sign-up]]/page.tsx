'use client'

import { SignUp, useUser } from '@clerk/nextjs'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const email = searchParams.get('email')
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
    // If user just signed up, link their account
    const linkAccount = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // If on a subdomain, associate user with that subdomain
          if (subdomain) {
            console.log('User signed up on subdomain:', subdomain)
            
            const subdomainResponse = await fetch('/api/user/associate-subdomain', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subdomain })
            })

            const subdomainData = await subdomainResponse.json()
            
            if (subdomainData.success && subdomainData.redirectUrl) {
              console.log('User associated with subdomain, redirecting to:', subdomainData.redirectUrl)
              window.location.href = subdomainData.redirectUrl
              return
            }
          }

          // If email param exists, try to link with pending business
          if (email) {
            console.log('User signed up, linking account for:', email)
            
            const response = await fetch('/api/business/link-account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            })

            const data = await response.json()
            
            if (data.success && data.redirectUrl) {
              console.log('Account linked, redirecting to:', data.redirectUrl)
              window.location.href = data.redirectUrl
              return
            }
          }

          // Default redirect
          router.push('/business/dashboard')
        } catch (error) {
          console.error('Error linking account:', error)
          router.push('/business/dashboard')
        }
      }
    }

    linkAccount()
  }, [isLoaded, isSignedIn, email, user, router, subdomain])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-md">
        {subdomain && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <p className="text-sm text-purple-800">
              <strong>Welcome!</strong> You're creating an account on <strong>{subdomain}</strong>
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Your account will be linked to this platform
            </p>
          </div>
        )}
        
        {email && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-800">
              <strong>Welcome!</strong> Create your account to get started.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Your email: {email}
            </p>
          </div>
        )}
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl'
            }
          }}
          afterSignUpUrl={email ? `/business/dashboard?email=${email}` : '/business/dashboard'}
          redirectUrl={email ? `/business/dashboard?email=${email}` : '/business/dashboard'}
        />
        
        {email && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              After creating your account, you'll be taken to your dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
