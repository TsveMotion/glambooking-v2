'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Mail,
  Phone,
  DollarSign,
  ArrowRight
} from 'lucide-react'

interface StaffData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  business: {
    name: string
    address?: string
    phone?: string
  }
  todayBookings: number
  weekBookings: number
  monthRevenue: number
  upcomingBookings: Array<{
    id: string
    clientName: string
    serviceName: string
    startTime: string
    duration: number
  }>
}

export default function StaffDashboard() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [staffData, setStaffData] = useState<StaffData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      fetchStaffData()
    }
  }, [isLoaded, userId, router])

  const fetchStaffData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff/dashboard')
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff data')
      }
      
      const data = await response.json()
      setStaffData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchStaffData}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!staffData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Staff Access Required</h3>
          <p className="text-gray-600 mb-4">You need to be added as a staff member to access this dashboard.</p>
          <Button onClick={() => router.push('/')}>Go to Homepage</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {staffData.firstName}!
              </h1>
              <p className="text-gray-600">
                {staffData.role} at {staffData.business.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/staff/calendar')}>
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button variant="outline" onClick={() => router.push('/staff/clients')}>
                <Users className="w-4 h-4 mr-2" />
                Clients
              </Button>
              <Button onClick={() => router.push('/staff/payouts')}>
                <DollarSign className="w-4 h-4 mr-2" />
                Payouts
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{staffData.todayBookings}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">{staffData.weekBookings}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Month Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">£{staffData.monthRevenue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-glam-pink" />
                Upcoming Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staffData.upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {staffData.upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{booking.clientName}</h4>
                        <p className="text-sm text-gray-600">{booking.serviceName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.startTime).toLocaleString()} ({booking.duration} min)
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming bookings</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-glam-pink" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{staffData.business.name}</h3>
                <p className="text-sm text-gray-600">Your workplace</p>
              </div>
              
              {staffData.business.address && (
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-gray-400 mt-0.5">📍</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">{staffData.business.address}</p>
                  </div>
                </div>
              )}

              {staffData.business.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{staffData.business.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Your Email</p>
                  <p className="text-sm text-gray-600">{staffData.email}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Update Your Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
