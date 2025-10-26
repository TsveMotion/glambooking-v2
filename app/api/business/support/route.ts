import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { subject, urgency, category, message, email, phone } = body

    // Validate required fields
    if (!subject || !message || !email || !urgency || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Find user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ 
        error: 'No business found for user' 
      }, { status: 404 })
    }

    const business = user.businesses[0]

    // For now, just log the support request (until supportTicket table is created)
    const ticketId = `TICKET_${Date.now()}`
    
    console.log('Support ticket created:', {
      ticketId,
      businessId: business.id,
      userId: user.id,
      subject,
      urgency,
      category,
      email,
      phone,
      message,
      createdAt: new Date().toISOString()
    })

    // Send notification email (you can implement this later)
    // await sendSupportNotificationEmail(supportTicket)

    return NextResponse.json({ 
      success: true,
      ticketId,
      message: 'Support request submitted successfully'
    })

  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json(
      { error: 'Error submitting support request' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user's business
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        businesses: true
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ 
        error: 'No business found for user' 
      }, { status: 404 })
    }

    const business = user.businesses[0]

    // Mock support tickets for now (until supportTicket table is created)
    const mockTickets = [
      {
        id: 'TICKET_1',
        subject: 'Billing Question',
        status: 'open',
        urgency: 'medium',
        category: 'billing',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    return NextResponse.json({ tickets: mockTickets })

  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json(
      { error: 'Error fetching support tickets' },
      { status: 500 }
    )
  }
}
