import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Get white-label configuration by domain
 * Used by client-side to fetch branding
 */
export async function GET(req: NextRequest) {
  try {
    const hostname = req.headers.get('host') || ''
    
    // Skip for localhost and main domain
    if (hostname.includes('localhost') || hostname.startsWith('glambooking.com')) {
      return NextResponse.json({ whitelabel: null })
    }

    // Check if subdomain or custom domain
    const isSubdomain = hostname.includes('.glambooking.com') && !hostname.startsWith('www.')
    const subdomain = isSubdomain ? hostname.split('.glambooking.com')[0] : null
    const customDomain = !isSubdomain ? hostname : null

    if (!subdomain && !customDomain) {
      return NextResponse.json({ whitelabel: null })
    }

    // @ts-ignore - Model will exist after migration
    const config = await prisma.whiteLabelConfig?.findFirst({
      where: {
        OR: [
          { subdomain: subdomain },
          { customDomain: customDomain }
        ],
        isActive: true
      },
      select: {
        id: true,
        businessId: true,
        brandName: true,
        logoUrl: true,
        faviconUrl: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        fontFamily: true
      }
    }).catch(() => null)

    if (!config) {
      return NextResponse.json({ whitelabel: null })
    }

    return NextResponse.json({ 
      whitelabel: {
        id: config.id,
        businessId: config.businessId,
        brandName: config.brandName,
        logoUrl: config.logoUrl,
        faviconUrl: config.faviconUrl,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        accentColor: config.accentColor,
        fontFamily: config.fontFamily
      }
    })
  } catch (error) {
    console.error('Error fetching white-label config:', error)
    return NextResponse.json({ whitelabel: null })
  }
}
