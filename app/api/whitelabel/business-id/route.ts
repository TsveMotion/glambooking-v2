import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * Get business ID from subdomain or custom domain
 */
export async function GET(req: NextRequest) {
  try {
    const hostname = req.headers.get('host') || ''
    
    console.log('Getting business ID for hostname:', hostname)
    
    // Skip for localhost without subdomain and main domain
    if (hostname === 'localhost:3000' || hostname.startsWith('glambooking.co.uk')) {
      return NextResponse.json({ businessId: null })
    }

    // Check if subdomain or custom domain
    const isSubdomain = hostname.includes('.localhost:3000') || (hostname.includes('.glambooking.co.uk') && !hostname.startsWith('www.'))
    const subdomain = isSubdomain ? hostname.split('.')[0] : null
    const customDomain = !isSubdomain ? hostname : null

    if (!subdomain && !customDomain) {
      return NextResponse.json({ businessId: null })
    }

    // @ts-ignore
    const config = await prisma.whiteLabelConfig?.findFirst({
      where: {
        OR: [
          subdomain ? { subdomain } : null,
          customDomain ? { customDomain } : null
        ].filter(Boolean)
      },
      select: {
        businessId: true
      }
    }).catch(() => null)

    if (config) {
      console.log('Found business ID:', config.businessId)
      return NextResponse.json({ businessId: config.businessId })
    }

    return NextResponse.json({ businessId: null })
  } catch (error) {
    console.error('Error getting business ID:', error)
    return NextResponse.json({ businessId: null })
  }
}
