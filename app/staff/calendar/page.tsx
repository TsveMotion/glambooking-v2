'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Booking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  serviceName: string
  date: string
  time: string
  duration: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  price: number
  notes?: string
}

interface StaffData {
  id: string
  firstName: string
  lastName: string
  role: string
  business: {
    name: string
  }
}

export default function StaffCalendar() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [staffData, setStaffData] = useState<StaffData | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      fetchStaffData()
      fetchBookings()
    }
  }, [isLoaded, userId, router, selectedDate])

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/api/staff/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStaffData(data)
      } else {
        throw new Error('Failed to fetch staff data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/staff/bookings?date=${dateStr}`)
      
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      } else {
        // Mock data for now
        setBookings([
          {
            id: '1',
            clientName: 'Sarah Johnson',
            clientEmail: 'sarah@example.com',
            clientPhone: '+44 123 456 7890',
            serviceName: 'Hair Cut & Style',
            date: dateStr,
            time: '09:00',
            duration: 60,
            status: 'confirmed',
            price: 45.00,
            notes: 'Regular client, prefers shorter layers'
          },
          {
            id: '2',
            clientName: 'Emma Wilson',
            clientEmail: 'emma@example.com',
            serviceName: 'Color & Highlights',
            date: dateStr,
            time: '11:30',
            duration: 120,
            status: 'pending',
            price: 85.00
          },
          {
            id: '3',
            clientName: 'Lisa Brown',
            clientEmail: 'lisa@example.com',
            clientPhone: '+44 987 654 3210',
            serviceName: 'Manicure',
            date: dateStr,
            time: '14:00',
            duration: 45,
            status: 'confirmed',
            price: 25.00
          }
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/staff/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Failed to update booking:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
          <p className="text-gray-600">
            Manage your appointments and bookings
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-glam-pink" />
              <span>{selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
              <p className="text-gray-600">You have no bookings scheduled for this date.</p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-glam-pink rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {booking.clientName}
                      </h3>
                      <p className="text-glam-pink font-medium">
                        {booking.serviceName}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{booking.time} ({booking.duration} min)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">£{booking.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {booking.clientEmail}
                    </div>
                    {booking.clientPhone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {booking.clientPhone}
                      </div>
                    )}
                  </div>
                  {booking.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    </div>
                  )}
                </div>

                {booking.status === 'pending' && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Complete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
