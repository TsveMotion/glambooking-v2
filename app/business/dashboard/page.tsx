'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AddServiceModal } from '@/components/add-service-modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WhiteLabelBranding } from '@/components/whitelabel-branding'
import { 
  Calendar, 
  Users, 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Settings,
  ArrowUp,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  CreditCard,
  Target,
  Zap,
  Star,
  Package,
  CalendarDays,
  ArrowRight,
  Plus
} from 'lucide-react'

function BusinessDashboard() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false)
  const [businessPlan, setBusinessPlan] = useState<string>('free')
  
  
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
      // Set business plan from dashboard data
      if (data.business?.plan) {
        setBusinessPlan(data.business.plan)
      }
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

  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'free': return { name: 'Free', fee: '5%' }
      case 'starter': return { name: 'Starter', fee: '5%' }
      case 'professional': return { name: 'Professional', fee: '3%' }
      case 'enterprise': return { name: 'Enterprise', fee: '2%' }
      default: return { name: 'Free', fee: '5%' }
    }
  }

  const planLimits = getPlanLimits(businessPlan)

  const formatCurrency = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value ?? 0) || 0)

  // Calculate real metrics from database data
  const calculateRealMetrics = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    // Yesterday's bookings for comparison
    const yesterdayBookings = recentBookings?.filter(booking => {
      const bookingDate = new Date(booking.startTime)
      return bookingDate >= yesterday && bookingDate < today
    }).length || 0

    // Monthly revenue
    const monthlyRevenue = recentBookings?.filter(booking => {
      const bookingDate = new Date(booking.startTime)
      return bookingDate >= monthStart && booking.status === 'COMPLETED'
    }).reduce((sum, booking) => sum + booking.totalAmount, 0) || 0

    // Booking status counts
    const completedBookings = recentBookings?.filter(booking => 
      booking.status === 'COMPLETED' && 
      new Date(booking.startTime).toDateString() === today.toDateString()
    ).length || 0

    const pendingBookings = recentBookings?.filter(booking => 
      booking.status === 'PENDING' && 
      new Date(booking.startTime).toDateString() === today.toDateString()
    ).length || 0

    const confirmedBookings = recentBookings?.filter(booking => 
      booking.status === 'CONFIRMED' && 
      new Date(booking.startTime).toDateString() === today.toDateString()
    ).length || 0

    // Calculate completion rate
    const totalCompleted = recentBookings?.filter(booking => booking.status === 'COMPLETED').length || 0
    const totalBookings = recentBookings?.length || 1
    const completionRate = Math.round((totalCompleted / totalBookings) * 100)

    return {
      yesterdayBookings,
      monthlyRevenue,
      completedBookings,
      pendingBookings,
      confirmedBookings,
      completionRate
    }
  }

  const realMetrics = calculateRealMetrics()

  return (
    <>
      <WhiteLabelBranding />
      <div className="p-6">
      {/* Transaction Fee Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800">
              <strong>Current Plan: {planLimits.name} • Platform Fee: {planLimits.fee} per booking (includes all transaction costs)</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Customers pay the service price only. Platform fee includes Stripe processing fees.
            </p>
          </div>
          {businessPlan === 'free' && (
            <Button 
              size="sm"
              onClick={() => router.push('/business/pricing')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CalendarDays className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {metrics?.todayBookings > realMetrics.yesterdayBookings ? (
                  <>
                    <ArrowUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">
                      +{realMetrics.yesterdayBookings > 0 ? Math.round(((metrics?.todayBookings - realMetrics.yesterdayBookings) / realMetrics.yesterdayBookings) * 100) : 100}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-600">
                      {realMetrics.yesterdayBookings > 0 ? Math.round(((metrics?.todayBookings - realMetrics.yesterdayBookings) / realMetrics.yesterdayBookings) * 100) : 0}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Today's Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.todayBookings || 0}</p>
              <p className="text-xs text-gray-500 mt-1">vs {realMetrics.yesterdayBookings} yesterday</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {metrics?.todayRevenue > 0 ? (
                  <>
                    <ArrowUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">Active</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-600">No revenue</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics?.todayRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">Gross revenue (before {planLimits.fee} platform fee)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {realMetrics.monthlyRevenue > 0 ? (
                  <>
                    <ArrowUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">Growing</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-600">No revenue</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics?.monthlyRevenue ?? realMetrics.monthlyRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">This month to date</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {realMetrics.completionRate >= 80 ? (
                  <>
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">Excellent</span>
                  </>
                ) : realMetrics.completionRate >= 60 ? (
                  <>
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-600">Good</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-600">Low</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{realMetrics.completionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">{realMetrics.completionRate >= 80 ? 'Excellent performance' : realMetrics.completionRate >= 60 ? 'Good performance' : 'Needs improvement'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 text-lg font-semibold">Revenue Trend</CardTitle>
                <CardDescription className="text-gray-500">Last 7 days performance</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">£{metrics?.weeklyRevenue || 0}</p>
                <div className="flex items-center justify-end mt-1">
                  <BarChart3 className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 font-medium">This week</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-48 bg-gradient-to-br from-green-50 to-white rounded-lg p-4">
              <div className="flex items-end justify-between h-full space-x-2">
                {(() => {
                  // Calculate real daily revenue for the past 7 days
                  const dailyRevenue = []
                  const today = new Date()
                  
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date(today)
                    date.setDate(date.getDate() - i)
                    date.setHours(0, 0, 0, 0)
                    const nextDay = new Date(date)
                    nextDay.setDate(nextDay.getDate() + 1)
                    
                    const dayRevenue = recentBookings?.filter(booking => {
                      const bookingDate = new Date(booking.startTime)
                      return bookingDate >= date && bookingDate < nextDay && booking.status === 'COMPLETED'
                    }).reduce((sum, booking) => sum + booking.totalAmount, 0) || 0
                    
                    dailyRevenue.push(dayRevenue)
                  }
                  
                  const maxRevenue = Math.max(...dailyRevenue, 1)
                  
                  return dailyRevenue.map((revenue, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-300 hover:from-green-600 hover:to-green-500"
                        style={{ height: `${(revenue / maxRevenue) * 100}%` }}
                        title={`£${revenue}`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </span>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 text-lg font-semibold">Service Performance</CardTitle>
                <CardDescription className="text-gray-500">Most popular services</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{business?.services?.length || 0}</p>
                <p className="text-sm text-gray-500">Active services</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-48 bg-gradient-to-br from-blue-50 to-white rounded-lg p-4">
              <div className="space-y-3">
                {business?.services?.slice(0, 4).map((service: any, index: number) => {
                  // Calculate real booking count for this service
                  const serviceBookings = recentBookings?.filter(booking => 
                    booking.serviceName === service.name
                  ).length || 0
                  
                  const maxBookings = Math.max(...(business?.services?.map(s => 
                    recentBookings?.filter(b => b.serviceName === s.name).length || 0
                  ) || [1]), 1)
                  
                  return (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-purple-500' :
                          index === 2 ? 'bg-pink-500' : 'bg-amber-500'
                        }`}>
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                          <p className="text-xs text-gray-500">{serviceBookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">£{service.price}</p>
                        <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                          <div 
                            className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                            style={{ width: `${(serviceBookings / maxBookings) * 100}%` }}
                            title={`${serviceBookings} bookings`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                }) || (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No services yet</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 text-lg font-semibold">Booking Status</CardTitle>
                <CardDescription className="text-gray-500">Today's overview</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{metrics?.todayBookings || 0}</p>
                <p className="text-sm text-gray-500">Total bookings</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-48 bg-gradient-to-br from-purple-50 to-white rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-green-600">{realMetrics.completedBookings}</span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${metrics?.todayBookings > 0 ? (realMetrics.completedBookings / metrics?.todayBookings) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-blue-600">{realMetrics.pendingBookings}</span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${metrics?.todayBookings > 0 ? (realMetrics.pendingBookings / metrics?.todayBookings) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-700">Confirmed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-amber-600">{realMetrics.confirmedBookings}</span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-amber-500 rounded-full"
                        style={{ width: `${metrics?.todayBookings > 0 ? (realMetrics.confirmedBookings / metrics?.todayBookings) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Completion Rate</span>
                    <span className="text-xs font-semibold text-green-600">{realMetrics.completionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-glam-pink/5 to-purple-50 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common tasks to manage your business</p>
            </div>
            <Zap className="w-6 h-6 text-glam-pink" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => setIsAddServiceModalOpen(true)}
              className="bg-glam-pink hover:bg-glam-pink/90 text-white h-16 flex flex-col items-center justify-center space-y-1"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Add Service</span>
            </Button>
            <Button 
              onClick={() => router.push('/business/calendar')}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-1 border-2 border-gray-200 hover:border-glam-pink hover:bg-glam-pink/5"
            >
              <CalendarDays className="w-5 h-5" />
              <span className="text-xs">View Calendar</span>
            </Button>
            <Button 
              onClick={() => router.push('/business/team')}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-1 border-2 border-gray-200 hover:border-glam-pink hover:bg-glam-pink/5"
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">Manage Team</span>
            </Button>
            <Button 
              onClick={() => router.push('/business/analytics')}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-1 border-2 border-gray-200 hover:border-glam-pink hover:bg-glam-pink/5"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

          {/* Enhanced Services & Bookings Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900 text-lg font-semibold">Your Services</CardTitle>
                    <CardDescription className="text-gray-500">Manage your service offerings</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{business?.services?.length || 0} services</span>
                    <Button 
                      size="sm" 
                      onClick={() => setIsAddServiceModalOpen(true)}
                      className="bg-glam-pink hover:bg-glam-pink/90 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {business?.services?.slice(0, 4).map((service: any, index: number) => (
                    <div key={service.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-glam-pink/10 hover:to-white transition-all duration-300 cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow ${
                          index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                          index === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                          index === 2 ? 'bg-gradient-to-r from-pink-500 to-pink-600' : 
                          'bg-gradient-to-r from-amber-500 to-amber-600'
                        }`}>
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-glam-pink transition-colors">{service.name}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-500">{service.duration} min</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-sm text-green-600 font-medium">
                              {recentBookings?.filter(booking => booking.serviceName === service.name).length || 0} total bookings
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">£{service.price}</p>
                        <div className="flex items-center justify-end mt-1">
                          <div className="flex -space-x-1">
                            <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white"></div>
                            <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                            <div className="w-5 h-5 bg-purple-500 rounded-full border-2 border-white"></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">Staff</span>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-500 font-medium mb-2">No services yet</p>
                      <p className="text-sm text-gray-400 mb-4">Add your first service to start accepting bookings</p>
                      <Button 
                        onClick={() => setIsAddServiceModalOpen(true)}
                        className="bg-glam-pink hover:bg-glam-pink/90 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Service
                      </Button>
                    </div>
                  )}
                </div>
                {business?.services?.length > 4 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push('/business/services')}
                    >
                      View All Services
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900 text-lg font-semibold">Recent Bookings</CardTitle>
                    <CardDescription className="text-gray-500">Latest appointment activity</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{upcomingBookings?.length || 0} upcoming</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push('/business/calendar')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingBookings?.slice(0, 4).map((booking: any, index: number) => {
                    const bookingDate = new Date(booking.startTime)
                    const isToday = bookingDate.toDateString() === new Date().toDateString()
                    const isTomorrow = bookingDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
                    const status = booking.status || 'CONFIRMED' // Default status if not provided
                    
                    return (
                      <div key={booking.id} className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-blue-50 hover:to-white transition-all duration-300 cursor-pointer">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow ${
                          status === 'COMPLETED' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          status === 'CONFIRMED' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          status === 'PENDING' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                          'bg-gradient-to-r from-gray-500 to-gray-600'
                        }`}>
                          {status === 'COMPLETED' ? <CheckCircle className="w-6 h-6 text-white" /> :
                           status === 'CONFIRMED' ? <CalendarDays className="w-6 h-6 text-white" /> :
                           status === 'PENDING' ? <Clock className="w-6 h-6 text-white" /> :
                           <AlertCircle className="w-6 h-6 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {booking.clientName}
                          </p>
                          <p className="text-sm text-gray-600 font-medium">{booking.serviceName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : bookingDate.toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {bookingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">£{booking.totalAmount}</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                            status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    )
                  }) || (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CalendarDays className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-500 font-medium mb-2">No bookings yet</p>
                      <p className="text-sm text-gray-400 mb-4">Your upcoming appointments will appear here</p>
                      <Button 
                        onClick={() => router.push('/business/calendar')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        View Calendar
                      </Button>
                    </div>
                  )}
                </div>
                {upcomingBookings?.length > 4 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push('/business/calendar')}
                    >
                      View All Bookings
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
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
    </>
  )
}

export default function ProtectedDashboard() {
  return <BusinessDashboard />
}
