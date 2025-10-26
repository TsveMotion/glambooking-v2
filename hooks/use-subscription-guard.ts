'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

interface PlanStatus {
  hasActiveSubscription: boolean
  plan: string
  isLoading: boolean
  error: string | null
}

export function useSubscriptionGuard() {
  const { isLoaded, userId } = useAuth()
  const [planStatus, setPlanStatus] = useState<PlanStatus>({
    hasActiveSubscription: false,
    plan: 'free',
    isLoading: true,
    error: null
  })

  useEffect(() => {
    if (isLoaded && userId) {
      checkSubscriptionStatus()
    } else if (isLoaded && !userId) {
      setPlanStatus({
        hasActiveSubscription: false,
        plan: 'free',
        isLoading: false,
        error: 'Not authenticated'
      })
    }
  }, [isLoaded, userId])

  const checkSubscriptionStatus = async () => {
    try {
      setPlanStatus(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/business/plan-status')
      
      if (response.ok) {
        const data = await response.json()
        setPlanStatus({
          hasActiveSubscription: data.hasActiveSubscription || false,
          plan: data.plan || 'free',
          isLoading: false,
          error: null
        })
      } else if (response.status === 404) {
        // No business found - user needs to create one first
        setPlanStatus({
          hasActiveSubscription: false,
          plan: 'free',
          isLoading: false,
          error: 'No business found'
        })
      } else {
        throw new Error('Failed to fetch plan status')
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      setPlanStatus({
        hasActiveSubscription: false,
        plan: 'free',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const refreshStatus = () => {
    if (userId) {
      checkSubscriptionStatus()
    }
  }

  return {
    ...planStatus,
    refreshStatus
  }
}
