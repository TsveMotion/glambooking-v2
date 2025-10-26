'use client'

import { useSubscriptionGuard } from '@/hooks/use-subscription-guard'
import SubscriptionRequiredOverlay from '@/components/subscription-required-overlay'

interface BusinessLayoutWrapperProps {
  children: React.ReactNode
  requiresSubscription?: boolean
}

export default function BusinessLayoutWrapper({ 
  children, 
  requiresSubscription = true 
}: BusinessLayoutWrapperProps) {
  const { hasActiveSubscription, isLoading: planLoading } = useSubscriptionGuard()

  return (
    <>
      {children}
      {requiresSubscription && (
        <SubscriptionRequiredOverlay
          isVisible={!planLoading && !hasActiveSubscription}
          allowClose={false}
        />
      )}
    </>
  )
}
