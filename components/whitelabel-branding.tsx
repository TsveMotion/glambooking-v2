'use client'

import { useEffect } from 'react'
import { useWhiteLabel } from '@/hooks/use-whitelabel'

export function WhiteLabelBranding() {
  const { config, isWhiteLabel } = useWhiteLabel()

  useEffect(() => {
    if (!isWhiteLabel || !config) return

    const { primaryColor, secondaryColor, accentColor, brandName, logoUrl, faviconUrl } = config

    // Update page title
    if (brandName) {
      document.title = `${brandName} - Booking Platform`
    }

    // Update favicon if provided
    if (faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = faviconUrl
      }
    }

    if (primaryColor || secondaryColor || accentColor) {
      // Inject CSS variables for white-label branding
      const style = document.createElement('style')
      style.id = 'whitelabel-branding'
      style.innerHTML = `
        :root {
          ${primaryColor ? `--whitelabel-primary: ${primaryColor};` : ''}
          ${secondaryColor ? `--whitelabel-secondary: ${secondaryColor};` : ''}
          ${accentColor ? `--whitelabel-accent: ${accentColor};` : ''}
        }
        
        /* Apply white-label colors to main UI elements */
        .whitelabel-primary-bg {
          background-color: ${primaryColor || '#E91E63'} !important;
        }
        
        .whitelabel-primary-text {
          color: ${primaryColor || '#E91E63'} !important;
        }
        
        .whitelabel-primary-border {
          border-color: ${primaryColor || '#E91E63'} !important;
        }
        
        /* Override glam-pink with white-label primary color */
        .bg-glam-pink,
        .hover\\:bg-glam-pink:hover {
          background-color: ${primaryColor || '#E91E63'} !important;
        }
        
        .text-glam-pink {
          color: ${primaryColor || '#E91E63'} !important;
        }
        
        .border-glam-pink {
          border-color: ${primaryColor || '#E91E63'} !important;
        }
        
        .glam-gradient {
          background: linear-gradient(135deg, ${primaryColor || '#E91E63'}, ${secondaryColor || '#FFD700'}) !important;
        }
      `
      document.head.appendChild(style)
      
      return () => {
        const existingStyle = document.getElementById('whitelabel-branding')
        if (existingStyle) {
          existingStyle.remove()
        }
      }
    }
  }, [config, isWhiteLabel])

  return null
}
