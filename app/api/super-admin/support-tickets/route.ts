import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySuperAdmin } from '@/lib/super-admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Verify super admin authorization
    const authResult = await verifySuperAdmin()
    
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // For now, return empty array since we're not persisting tickets to database yet
    // In the future, you can query from a SupportTicket table
    return NextResponse.json({
      tickets: [],
      message: 'Support tickets are sent via email to kristiyan@tsvweb.com'
    })

  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json(
      { error: 'Error fetching support tickets' },
      { status: 500 }
    )
  }
}
