'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  Settings, 
  Star,
  ArrowRight,
  Mail,
  Phone
} from 'lucide-react'

export default function StaffWelcome() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [staffData, setStaffData] = useState<any>(null)

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      checkStaffStatus()
    }
  }, [isLoaded, userId, router])

  const checkStaffStatus = async () => {
    try {
      const response = await fetch('/api/staff/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStaffData(data)
      }
    } catch (error) {
      console.error('Error checking staff status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    )
  }

  if (!staffData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Setup In Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Your staff account is being set up. Please check your email for further instructions.
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-glam-pink rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to {staffData.business.name}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hi {staffData.firstName}, your account is ready! You're now part of the team as a <span className="font-semibold text-glam-pink">{staffData.role}</span>.
          </p>
        </div>

        {/* Quick Setup Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Star className="w-6 h-6 mr-3 text-glam-pink" />
                Your Role & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Account Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-blue-800">
                    <Mail className="w-4 h-4 mr-2" />
                    {staffData.email}
                  </div>
                  {staffData.phone && (
                    <div className="flex items-center text-blue-800">
                      <Phone className="w-4 h-4 mr-2" />
                      {staffData.phone}
                    </div>
                  )}
                  <div className="flex items-center text-blue-800">
                    <Users className="w-4 h-4 mr-2" />
                    Role: {staffData.role}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">What you can do:</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    View and manage your appointments
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Access client information
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Update your availability
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Track your performance
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Settings className="w-6 h-6 mr-3 text-glam-pink" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => router.push('/staff/dashboard')}
                className="w-full bg-glam-pink hover:bg-glam-pink/90 text-white"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button 
                onClick={() => router.push('/staff/calendar')}
                variant="outline"
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
              
              <Button 
                onClick={() => router.push('/staff/profile')}
                variant="outline"
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Tips */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Getting Started Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Check Your Schedule</h3>
                <p className="text-sm text-gray-600">
                  Review your upcoming appointments and set your availability preferences.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Meet Your Clients</h3>
                <p className="text-sm text-gray-600">
                  Familiarize yourself with client preferences and booking history.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Customize Settings</h3>
                <p className="text-sm text-gray-600">
                  Update your profile, notification preferences, and working hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Need help? Contact your business administrator or check out our help center.
          </p>
        </div>
      </div>
    </div>
  )
}
