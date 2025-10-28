import { headers } from 'next/headers'

export interface WhiteLabelBranding {
  id: string
  businessId: string
  brandName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logoUrl?: string
  faviconUrl?: string
}

/**
 * Get white-label branding from request headers (set by middleware)
 * Returns null if not a white-label request
 */
export function getWhiteLabelBranding(): WhiteLabelBranding | null {
  try {
    const headersList = headers()
    const whitelabelId = headersList.get('x-whitelabel-id')
    
    if (!whitelabelId) {
      return null
    }

    return {
      id: whitelabelId,
      businessId: headersList.get('x-whitelabel-business-id') || '',
      brandName: headersList.get('x-whitelabel-brand-name') || '',
      primaryColor: headersList.get('x-whitelabel-primary-color') || '#E91E63',
      secondaryColor: headersList.get('x-whitelabel-secondary-color') || '#FFD700',
      accentColor: headersList.get('x-whitelabel-accent-color') || '#333333',
      logoUrl: headersList.get('x-whitelabel-logo-url') || undefined,
      faviconUrl: headersList.get('x-whitelabel-favicon-url') || undefined,
    }
  } catch (error) {
    return null
  }
}

/**
 * Get CSS variables for white-label branding
 */
export function getWhiteLabelCSSVariables(branding: WhiteLabelBranding | null): string {
  if (!branding) {
    return ''
  }

  return `
    :root {
      --whitelabel-primary: ${branding.primaryColor};
      --whitelabel-secondary: ${branding.secondaryColor};
      --whitelabel-accent: ${branding.accentColor};
    }
  `
}

/**
 * Check if current request is from a white-label domain
 */
export function isWhiteLabelRequest(): boolean {
  return getWhiteLabelBranding() !== null
}
