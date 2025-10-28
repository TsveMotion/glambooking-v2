import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

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
        businesses: {
          include: {
            bookings: {
              include: {
                service: true,
                staff: true,
                payments: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 50
            },
            staff: true,
            teamInvitations: {
              where: {
                status: 'ACCEPTED',
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ 
        error: 'No business found for user' 
      }, { status: 404 })
    }

    const business = user.businesses[0]
    const notifications: any[] = []

    // Generate notifications from bookings
    business.bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt)
      const now = new Date()
      const diffInHours = Math.abs(now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60)

      // New booking notifications (last 24 hours)
      if (diffInHours <= 24) {
        notifications.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          title: 'New Booking Received',
          message: `${booking.clientName} booked ${booking.service.name} with ${booking.staff.firstName} ${booking.staff.lastName}`,
          timestamp: booking.createdAt.toISOString(),
          read: false,
          priority: 'high',
          actionUrl: `/business/calendar`
        })
      }

      // Payment notifications
      booking.payments.forEach(payment => {
        if (payment.status === 'COMPLETED') {
          const paymentDate = new Date(payment.createdAt)
          const paymentDiffInHours = Math.abs(now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60)
          
          if (paymentDiffInHours <= 48) {
            notifications.push({
              id: `payment-${payment.id}`,
              type: 'payment',
              title: 'Payment Received',
              message: `Payment of £${Number(payment.amount).toFixed(2)} received for booking #${booking.id.slice(-6)}`,
              timestamp: payment.createdAt.toISOString(),
              read: paymentDiffInHours > 2, // Mark as read if older than 2 hours
              priority: 'medium',
              actionUrl: `/business/payouts`
            })
          }
        }
      })

      // Upcoming appointment reminders
      const bookingStart = new Date(booking.startTime)
      const timeUntilBooking = bookingStart.getTime() - now.getTime()
      const hoursUntilBooking = timeUntilBooking / (1000 * 60 * 60)

      if (hoursUntilBooking > 0 && hoursUntilBooking <= 2 && booking.status === 'CONFIRMED') {
        notifications.push({
          id: `reminder-${booking.id}`,
          type: 'reminder',
          title: 'Upcoming Appointment',
          message: `Reminder: ${booking.clientName} has an appointment in ${Math.round(hoursUntilBooking)} hour(s)`,
          timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          read: true,
          priority: 'medium',
          actionUrl: `/business/calendar`
        })
      }
    })

    // Team member notifications
    business.teamInvitations.forEach(invitation => {
      notifications.push({
        id: `team-${invitation.id}`,
        type: 'team',
        title: 'New Team Member',
        message: `${invitation.firstName} ${invitation.lastName} has joined your team as a ${invitation.role}`,
        timestamp: invitation.createdAt.toISOString(),
        read: true,
        priority: 'low',
        actionUrl: `/business/team`
      })
    })

    // System notifications (mock for now - could be stored in database)
    const systemNotifications = [
      {
        id: 'system-1',
        type: 'system',
        title: 'System Update',
        message: 'New features available: Advanced analytics and SMS notifications',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        read: false,
        priority: 'low',
        actionUrl: `/business/analytics`
      }
    ]

    // Combine and sort all notifications
    const allNotifications = [...notifications, ...systemNotifications]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50) // Limit to 50 most recent

    type NotificationReadStatusDelegate = {
      findMany: (args: any) => Promise<Array<{ notificationId: string }>>
    }

    const notificationReadStatus = (prisma as any)
      .notificationReadStatus as NotificationReadStatusDelegate | undefined

    let notificationsWithReadState = allNotifications

    if (notificationReadStatus) {
      const notificationIds = allNotifications.map((n) => n.id)
      const readStatuses = await notificationReadStatus.findMany({
        where: {
          userId: user.id,
          notificationId: {
            in: notificationIds,
          },
        },
      })

      const readMap = new Map(readStatuses.map((status) => [status.notificationId, true]))

      notificationsWithReadState = allNotifications.map((notification) => ({
        ...notification,
        read: readMap.get(notification.id) ?? notification.read ?? false,
      }))
    }

    return NextResponse.json({ 
      notifications: notificationsWithReadState,
      unreadCount: notificationsWithReadState.filter(n => !n.read).length
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error fetching notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, action, notificationIds } = await req.json()

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    type NotificationReadStatusDelegate = {
      upsert: (args: any) => Promise<unknown>
      createMany: (args: any) => Promise<unknown>
      updateMany: (args: any) => Promise<unknown>
    }

    const notificationReadStatus = (prisma as any)
      .notificationReadStatus as NotificationReadStatusDelegate | undefined

    if (!notificationReadStatus) {
      console.warn('NotificationReadStatus delegate unavailable – did you run `prisma migrate` & `prisma generate`?')
      return NextResponse.json({ success: false, requiresMigration: true })
    }

    if (action === 'mark_read') {
      if (!notificationId) {
        return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
      }

      await notificationReadStatus.upsert({
        where: {
          userId_notificationId: {
            userId: user.id,
            notificationId,
          },
        },
        create: {
          userId: user.id,
          notificationId,
          readAt: new Date(),
        },
        update: {
          readAt: new Date(),
        },
      })
    } else if (action === 'mark_all_read') {
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return NextResponse.json({ success: true })
      }

      await Promise.all(
        notificationIds.map((id: string) =>
          notificationReadStatus.upsert({
            where: {
              userId_notificationId: {
                userId: user.id,
                notificationId: id,
              },
            },
            create: {
              userId: user.id,
              notificationId: id,
              readAt: new Date(),
            },
            update: {
              readAt: new Date(),
            },
          })
        )
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Error updating notification' },
      { status: 500 }
    )
  }
}
