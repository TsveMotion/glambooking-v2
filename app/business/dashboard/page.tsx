'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AddServiceModal } from '@/components/add-service-modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  BarChart3, 
  TrendingUp,
  DollarSign,
  Settings,
  ArrowUp,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

function BusinessDashboard() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false)
  
  
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    
    if (isLoaded && userId) {
      fetchDashboardData()
    }
  }, [isLoaded, userId, router])
  

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/business/dashboard')
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/business/onboarding')
          return
        }
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      setDashboardData(data)
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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    )
  }
  
  if (!dashboardData) {
    return null
  }

  const { business, metrics, upcomingBookings, recentBookings } = dashboardData

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.todayBookings || 0}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+5%</span>
                  <span className="text-sm text-gray-500 ml-1">than last week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Today's Income</p>
                <p className="text-3xl font-bold text-gray-900">£{metrics?.todayRevenue || 0}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+3%</span>
                  <span className="text-sm text-gray-500 ml-1">than yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">£{metrics?.weeklyRevenue || 0}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+1%</span>
                  <span className="text-sm text-gray-500 ml-1">than yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-glam-pink rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Followers</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">Just updated</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-glam-gold rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 text-lg">Website Views</CardTitle>
                <CardDescription className="text-gray-500">Last Campaign Performance</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-500">No data available</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center p-4">
              <div className="text-white text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">Chart Data</p>
              </div>
            </div>
          </CardContent>
        </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900 text-lg">Daily Sales</CardTitle>
                    <CardDescription className="text-gray-500">(+15%) increase in today sales</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">£{metrics?.todayRevenue || 0}</p>
                    <p className="text-sm text-gray-500">Real sales data</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-48 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center p-4">
                  <div className="text-white text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Sales Trend</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900 text-lg">Completed Tasks</CardTitle>
                    <CardDescription className="text-gray-500">Last Campaign Performance</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">{metrics?.todayBookings || 0}</p>
                    <p className="text-sm text-gray-500">Real booking data</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-48 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center p-4">
                  <div className="text-white text-center">
                    <Activity className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Task Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects and Orders Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">Services</CardTitle>
                  <span className="text-sm text-gray-500">{business?.services?.length || 0} services</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {business?.services?.slice(0, 4).map((service: any, index: number) => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-glam-pink rounded-lg flex items-center justify-center">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex -space-x-1">
                              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                              <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <span className="text-sm text-gray-500">Members</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">£{service.price}</p>
                        <p className="text-sm text-gray-500 mt-1">{service.duration} min</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No services found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">Recent Bookings</CardTitle>
                  <span className="text-sm text-gray-500">{upcomingBookings?.length || 0} upcoming</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingBookings?.slice(0, 4).map((booking: any, index: number) => (
                    <div key={booking.id} className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-green-100' : 
                        index === 1 ? 'bg-red-100' :
                        index === 2 ? 'bg-blue-100' : 'bg-yellow-100'
                      }`}>
                        {index === 0 ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                         index === 1 ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                         index === 2 ? <Activity className="w-5 h-5 text-blue-600" /> :
                         <Clock className="w-5 h-5 text-yellow-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {booking.clientName} - {booking.serviceName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          £{booking.totalAmount}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent orders</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        onServiceAdded={() => {
          fetchDashboardData()
        }}
      />

      {/* Subscription modal removed - user has paid */}
    </div>
  )
}

export default function ProtectedDashboard() {
  return <BusinessDashboard />
}
