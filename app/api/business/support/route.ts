import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/brevo-email'

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
    
    const ticketData = {
      ticketId,
      businessId: business.id,
      businessName: business.name,
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      subject,
      urgency,
      category,
      email,
      phone,
      message,
      createdAt: new Date().toISOString()
    }
    
    console.log('Support ticket created:', ticketData)

    // Send notification email to super admin
    try {
      const urgencyColors: Record<string, string> = {
        low: '#10B981',
        medium: '#F59E0B',
        high: '#EF4444',
        urgent: '#DC2626'
      }

      const urgencyColor = urgencyColors[urgency] || '#6B7280'

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .urgency-badge { display: inline-block; padding: 8px 16px; background: ${urgencyColor}; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
            .message-box { background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 New Support Ticket</h1>
              <span class="urgency-badge">${urgency.toUpperCase()} PRIORITY</span>
            </div>
            <div class="content">
              <h2>Ticket #${ticketId}</h2>
              
              <div class="info-box">
                <h3>🎯 Ticket Details</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Urgency:</strong> ${urgency}</p>
                <p><strong>Created:</strong> ${new Date().toLocaleString('en-GB')}</p>
              </div>

              <div class="info-box">
                <h3>🏪 Business Information</h3>
                <p><strong>Business:</strong> ${business.name}</p>
                <p><strong>Business ID:</strong> ${business.id}</p>
                <p><strong>Plan:</strong> ${business.plan || 'free'}</p>
              </div>

              <div class="info-box">
                <h3>👤 Customer Contact</h3>
                <p><strong>Name:</strong> ${ticketData.userName || 'N/A'}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              </div>

              <div class="message-box">
                <h3>💬 Message</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="http://admin.localhost:3000/super-admin" class="button">View in Admin Dashboard →</a>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                ${urgency === 'urgent' ? '⚠️ <strong>URGENT:</strong> Respond within 2 hours during business hours' : ''}
                ${urgency === 'high' ? '⚠️ <strong>HIGH PRIORITY:</strong> Respond within 4 hours during business hours' : ''}
                ${urgency === 'medium' ? '🔔 Respond within 24 hours' : ''}
                ${urgency === 'low' ? '✅ Respond within 48 hours' : ''}
              </p>
            </div>
            <div class="footer">
              <p>This is an automated notification from GlamBooking Support System</p>
            </div>
          </div>
        </body>
        </html>
      `

      await sendEmail({
        to: 'kristiyan@tsvweb.com',
        subject: `🎫 [${urgency.toUpperCase()}] Support Ticket #${ticketId}: ${subject}`,
        html: emailHtml
      })

      console.log('Support notification email sent to admin')
    } catch (emailError) {
      console.error('Error sending support notification email:', emailError)
      // Don't fail the request if email fails
    }

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
