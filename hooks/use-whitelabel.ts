'use client'

import { useEffect, useState } from 'react'

interface WhiteLabelConfig {
  id: string
  businessId: string
  brandName: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
}

export function useWhiteLabel() {
  const [config, setConfig] = useState<WhiteLabelConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/whitelabel/config')
        const data = await response.json()
        setConfig(data.whitelabel)
      } catch (error) {
        console.error('Error fetching white-label config:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { config, loading, isWhiteLabel: config !== null }
}
