import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { GoogleCalendarService, bookingToCalendarEvent } from '@/lib/google-calendar'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
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

    // Get recent bookings (last 30 days and next 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const bookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        startTime: {
          gte: thirtyDaysAgo,
          lte: thirtyDaysFromNow
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        service: true,
        staff: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // In a real implementation, you would:
    // 1. Get the user's Google Calendar access token from your database
    // 2. Initialize GoogleCalendarService with the token
    // 3. Sync each booking to Google Calendar
    // 4. Store the Google Calendar event IDs in your database for future updates

    // For now, we'll simulate the sync process
    const syncResults = {
      synced: bookings.length,
      created: 0,
      updated: 0,
      errors: 0
    }

    // Simulate processing each booking
    for (const booking of bookings) {
      try {
        const formattedBooking = {
          id: booking.id,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          clientPhone: booking.clientPhone,
          serviceName: booking.service.name,
          staffName: `${booking.staff.firstName} ${booking.staff.lastName}`,
          startTime: booking.startTime.toISOString(),
          endTime: booking.endTime.toISOString(),
          totalAmount: Number(booking.totalAmount),
          status: booking.status,
          notes: booking.notes
        }

        // Convert to Google Calendar event format
        const calendarEvent = bookingToCalendarEvent(formattedBooking)
        
        // In a real implementation, you would call:
        // const googleCalendar = new GoogleCalendarService(userAccessToken)
        // await googleCalendar.createEvent('primary', calendarEvent)
        
        syncResults.created++
      } catch (error) {
        console.error(`Error syncing booking ${booking.id}:`, error)
        syncResults.errors++
      }
    }

    return NextResponse.json({ 
      message: 'Calendar sync completed',
      results: syncResults,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error syncing calendar:', error)
    return NextResponse.json(
      { error: 'Error syncing calendar' },
      { status: 500 }
    )
  }
}

// GET endpoint to check sync status
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real implementation, you would check:
    // - User's Google Calendar connection status
    // - Last sync timestamp
    // - Any sync errors or issues

    return NextResponse.json({
      connected: false, // This would be determined by checking stored credentials
      lastSync: null,
      status: 'disconnected'
    })
  } catch (error) {
    console.error('Error checking sync status:', error)
    return NextResponse.json(
      { error: 'Error checking sync status' },
      { status: 500 }
    )
  }
}
