import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Get subdomain from host header
    const host = req.headers.get('host') || ''
    const subdomain = host.split('.')[0]
    
    // Skip if localhost without subdomain or admin subdomain
    if (host.startsWith('localhost:3000') || subdomain === 'admin' || subdomain === 'localhost:3000') {
      return NextResponse.json({ theme: null })
    }

    // Find whitelabel config by subdomain
    const whitelabelConfig = await prisma.whiteLabelConfig.findUnique({
      where: { subdomain },
      select: {
        brandName: true,
        logoUrl: true,
        faviconUrl: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        fontFamily: true,
        subdomain: true,
        isActive: true
      }
    })

    if (!whitelabelConfig || !whitelabelConfig.isActive) {
      return NextResponse.json({ theme: null })
    }

    return NextResponse.json({ theme: whitelabelConfig })
  } catch (error) {
    console.error('Error fetching whitelabel theme:', error)
    return NextResponse.json({ theme: null })
  }
}
