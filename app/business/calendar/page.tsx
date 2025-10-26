'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search
} from 'lucide-react'
import { NewBookingForm } from '@/components/new-booking-form'
import { GoogleCalendarSync } from '@/components/google-calendar-sync'

interface Booking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  serviceName: string
  staffName: string
  startTime: string
  endTime: string
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
}

export default function CalendarPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('day')

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      fetchBookings()
    }
  }, [isLoaded, userId, router, selectedDate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/business/bookings?date=${dateStr}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (currentView === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (currentView === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setSelectedDate(newDate)
  }

  const formatDate = (date: Date) => {
    if (currentView === 'day') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } else if (currentView === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-600 text-sm sm:text-base">Manage your appointments and schedule</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Button 
            className="glam-gradient text-white w-full sm:w-auto"
            onClick={() => setShowBookingForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Google Calendar Integration */}
      <div className="mb-6">
        <GoogleCalendarSync onSync={fetchBookings} />
      </div>

      {/* Calendar Controls */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-center sm:justify-start space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <h2 className="text-lg sm:text-xl font-semibold text-glam-charcoal text-center">
                {formatDate(selectedDate)}
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={currentView === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('day')}
                className={currentView === 'day' ? 'glam-gradient text-white' : ''}
              >
                Day
              </Button>
              <Button
                variant={currentView === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('week')}
                className={currentView === 'week' ? 'glam-gradient text-white' : ''}
              >
                Week
              </Button>
              <Button
                variant={currentView === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('month')}
                className={currentView === 'month' ? 'glam-gradient text-white' : ''}
              >
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bookings Display */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-glam-charcoal flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            {currentView === 'day' ? 'Today\'s Appointments' : 
             currentView === 'week' ? 'This Week\'s Appointments' : 
             'This Month\'s Appointments'}
          </CardTitle>
          <CardDescription>
            {bookings.length} appointment{bookings.length !== 1 ? 's' : ''} scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <Card key={booking.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-glam-pink rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-glam-charcoal">{booking.clientName}</h4>
                            <p className="text-sm text-gray-600">{booking.serviceName}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 ml-13">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(booking.startTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })} - {new Date(booking.endTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {booking.clientEmail}
                          </div>
                          {booking.clientPhone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {booking.clientPhone}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <p className="text-lg font-semibold text-glam-charcoal">£{booking.totalAmount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled for this day</p>
                <Button 
                  className="mt-4 glam-gradient text-white"
                  onClick={() => setShowBookingForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Appointment
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Booking Form Modal */}
      <NewBookingForm
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        onSuccess={() => {
          fetchBookings()
          setShowBookingForm(false)
        }}
        selectedDate={selectedDate}
      />
    </div>
  )
}
