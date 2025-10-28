'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

/**
 * Component that redirects users to their associated whitelabel subdomain
 * Place this in layouts where you want to check for subdomain redirects
 */
export function SubdomainRedirect() {
  const { userId, isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      const checkSubdomain = async () => {
        try {
          // Check if user is already on a subdomain
          const hostname = window.location.hostname
          const parts = hostname.split('.')
          const currentSubdomain = parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'localhost' ? parts[0] : null

          // Get user's associated subdomain
          const response = await fetch('/api/user/associate-subdomain')
          if (response.ok) {
            const data = await response.json()
            
            // If user has an associated subdomain and not already on it
            if (data.subdomain && data.subdomain !== currentSubdomain) {
              console.log('Redirecting user to their subdomain:', data.subdomain)
              window.location.href = data.redirectUrl
            }
          }
        } catch (error) {
          console.error('Error checking subdomain redirect:', error)
        }
      }

      checkSubdomain()
    }
  }, [isLoaded, isSignedIn, userId, router])

  return null
}
