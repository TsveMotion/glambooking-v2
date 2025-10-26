'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Calendar, Clock, User, Mail, Phone, MapPin, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'

interface BookingDetails {
  id: string
  startTime: string
  endTime: string
  status: string
  totalAmount: number
  clientName: string
  clientEmail: string
  clientPhone: string
  service: {
    name: string
    duration: number
    price: number
  }
  staff: {
    firstName: string
    lastName: string
  }
  business: {
    id: string
    name: string
    address: string
    phone: string
    email: string
  }
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      confirmBooking()
    } else {
      setError('No session ID provided')
      setLoading(false)
    }
  }, [sessionId])

  const confirmBooking = async () => {
    try {
      const response = await fetch('/api/public/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        throw new Error('Failed to confirm booking')
      }

      const data = await response.json()
      setBooking(data.booking)
    } catch (error) {
      console.error('Error confirming booking:', error)
      setError('Failed to confirm booking')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your booking...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Booking Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Go Home
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No booking details found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const bookingDate = new Date(booking.startTime)
  const bookingTime = bookingDate.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your appointment has been successfully booked and paid for.
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">{booking.service.name}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{booking.service.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">£{booking.service.price}</span>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{bookingDate.toLocaleDateString('en-GB', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium">{bookingTime}</p>
                </div>
              </div>
            </div>

            {/* Staff */}
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Staff Member</p>
                <p className="font-medium">{booking.staff.firstName} {booking.staff.lastName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Info Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              {booking.business.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {booking.business.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-gray-900">{booking.business.address}</p>
                </div>
              </div>
            )}
            
            {booking.business.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a href={`tel:${booking.business.phone}`} className="text-blue-600 hover:underline">
                    {booking.business.phone}
                  </a>
                </div>
              </div>
            )}

            {booking.business.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a href={`mailto:${booking.business.email}`} className="text-blue-600 hover:underline">
                    {booking.business.email}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-600">Payment Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Paid</span>
              <span className="text-2xl font-bold text-green-600">£{booking.totalAmount}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Payment processed securely via Stripe
            </p>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-sm text-gray-600">
                    A confirmation email has been sent to {booking.clientEmail}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Prepare for Your Appointment</p>
                  <p className="text-sm text-gray-600">
                    Arrive 5-10 minutes early and bring any specific requirements
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Need to Reschedule?</p>
                  <p className="text-sm text-gray-600">
                    Contact {booking.business.name} at least 24 hours in advance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href={`/book/${booking.business.id}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Book Another Service
          </Link>
          
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Print Confirmation
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Booking ID: {booking.id}
          </p>
          <p className="text-xs mt-2">
            Powered by GlamBooking
          </p>
        </div>
      </div>
    </div>
  )
}
