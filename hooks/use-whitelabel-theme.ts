import { useEffect, useState } from 'react'

export interface WhitelabelTheme {
  brandName: string | null
  logoUrl: string | null
  faviconUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  isWhitelabel: boolean
  subdomain: string | null
}

const defaultTheme: WhitelabelTheme = {
  brandName: 'GlamBooking',
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#E91E63',
  secondaryColor: '#FFD700',
  accentColor: '#333333',
  fontFamily: 'Inter',
  isWhitelabel: false,
  subdomain: null
}

export function useWhitelabelTheme() {
  const [theme, setTheme] = useState<WhitelabelTheme>(defaultTheme)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTheme() {
      try {
        // Get current host
        const host = window.location.host
        const subdomain = host.split('.')[0]
        
        // Skip if localhost without subdomain or admin subdomain
        if (host.startsWith('localhost:3000') || subdomain === 'admin') {
          setTheme(defaultTheme)
          setLoading(false)
          return
        }

        // Fetch whitelabel config
        const response = await fetch('/api/whitelabel/theme')
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.theme) {
            setTheme({
              brandName: data.theme.brandName || defaultTheme.brandName,
              logoUrl: data.theme.logoUrl || defaultTheme.logoUrl,
              faviconUrl: data.theme.faviconUrl || defaultTheme.faviconUrl,
              primaryColor: data.theme.primaryColor || defaultTheme.primaryColor,
              secondaryColor: data.theme.secondaryColor || defaultTheme.secondaryColor,
              accentColor: data.theme.accentColor || defaultTheme.accentColor,
              fontFamily: data.theme.fontFamily || defaultTheme.fontFamily,
              isWhitelabel: true,
              subdomain: data.theme.subdomain
            })
          } else {
            setTheme(defaultTheme)
          }
        } else {
          setTheme(defaultTheme)
        }
      } catch (error) {
        console.error('Error fetching whitelabel theme:', error)
        setTheme(defaultTheme)
      } finally {
        setLoading(false)
      }
    }

    fetchTheme()
  }, [])

  // Apply theme CSS variables
  useEffect(() => {
    if (!loading) {
      const root = document.documentElement
      root.style.setProperty('--primary-color', theme.primaryColor)
      root.style.setProperty('--secondary-color', theme.secondaryColor)
      root.style.setProperty('--accent-color', theme.accentColor)
      root.style.setProperty('--font-family', theme.fontFamily)
      
      // Update favicon if provided
      if (theme.faviconUrl) {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link')
        link.type = 'image/x-icon'
        link.rel = 'shortcut icon'
        link.href = theme.faviconUrl
        document.getElementsByTagName('head')[0].appendChild(link)
      }
      
      // Update page title if brand name provided
      if (theme.brandName && theme.isWhitelabel) {
        document.title = theme.brandName
      }
    }
  }, [theme, loading])

  return { theme, loading }
}
