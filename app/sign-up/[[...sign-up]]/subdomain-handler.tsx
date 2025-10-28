'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function SubdomainHandler() {
  const { userId, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn && userId) {
      // Extract subdomain from hostname
      const hostname = window.location.hostname
      const parts = hostname.split('.')
      
      // Check if we're on a subdomain (not localhost or main domain)
      if (parts.length >= 2 && parts[0] !== 'localhost' && parts[0] !== 'www') {
        const subdomain = parts[0]
        
        // Associate user with this subdomain
        fetch('/api/user/associate-subdomain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subdomain })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              console.log('User associated with subdomain:', subdomain)
              // Redirect to business dashboard on the subdomain
              window.location.href = data.redirectUrl
            }
          })
          .catch(err => console.error('Error associating subdomain:', err))
      }
    }
  }, [isSignedIn, userId, router])

  return null
}
