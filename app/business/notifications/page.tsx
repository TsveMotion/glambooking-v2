'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  Check, 
  X, 
  Calendar,
  Users,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Settings,
  Filter,
  MoreVertical
} from 'lucide-react'

interface Notification {
  id: string
  type: 'booking' | 'payment' | 'system' | 'team' | 'reminder'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
}

export default function NotificationsPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'payment' | 'system'>('all')

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    fetchNotifications()
  }, [isLoaded, userId, router])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/business/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        console.error('Failed to fetch notifications:', response.statusText)
        setNotifications([])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/business/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, action: 'mark_read' })
      })
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/business/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' })
      })
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar
      case 'payment': return CreditCard
      case 'team': return Users
      case 'reminder': return Clock
      case 'system': return Settings
      default: return Bell
    }
  }

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-200 bg-red-50'
    switch (type) {
      case 'booking': return 'border-blue-200 bg-blue-50'
      case 'payment': return 'border-green-200 bg-green-50'
      case 'team': return 'border-purple-200 bg-purple-50'
      case 'reminder': return 'border-yellow-200 bg-yellow-50'
      case 'system': return 'border-gray-200 bg-gray-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    return notification.type === filter
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="w-8 h-8 mr-3" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600">Stay updated with your business activities</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button 
            onClick={() => router.push('/business/settings/notifications')}
            className="bg-glam-pink hover:bg-glam-pink/90"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { key: 'all', label: 'All Notifications', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'booking', label: 'Bookings', count: notifications.filter(n => n.type === 'booking').length },
                { key: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
                { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filter === key
                      ? 'bg-glam-pink text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      filter === key
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Bookings</span>
                <span className="font-semibold text-blue-600">
                  {notifications.filter(n => n.type === 'booking' && 
                    new Date(n.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payments</span>
                <span className="font-semibold text-green-600">
                  {notifications.filter(n => n.type === 'payment' && 
                    new Date(n.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reminders</span>
                <span className="font-semibold text-yellow-600">
                  {notifications.filter(n => n.type === 'reminder' && 
                    new Date(n.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {filter === 'all' 
                    ? "You're all caught up! No notifications to show."
                    : `No ${filter} notifications to show.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type)
              return (
                <Card 
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-glam-pink' : ''
                  } ${getNotificationColor(notification.type, notification.priority)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-full ${
                          notification.priority === 'high' 
                            ? 'bg-red-100 text-red-600'
                            : notification.type === 'booking'
                            ? 'bg-blue-100 text-blue-600'
                            : notification.type === 'payment'
                            ? 'bg-green-100 text-green-600'
                            : notification.type === 'team'
                            ? 'bg-purple-100 text-purple-600'
                            : notification.type === 'reminder'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-semibold ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-glam-pink rounded-full"></div>
                            )}
                            {notification.priority === 'high' && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs h-6 px-2"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-xs h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
