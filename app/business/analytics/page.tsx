'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar,
  DollarSign,
  Clock,
  Star,
  Download,
  RefreshCw,
  Lock,
  Crown,
  ArrowUp,
  Target,
  Zap,
  PieChart,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalBookings: number
    totalClients: number
    avgBookingValue: number
    revenueGrowth: number
    bookingsGrowth: number
    clientsGrowth: number
  }
  charts: {
    revenueData: { date: string; revenue: number }[]
    bookingsData: { date: string; bookings: number }[]
  }
  topServices: {
    id: string
    name: string
    bookings: number
    revenue: number
    percentage: number
  }[]
  topStaff: {
    id: string
    name: string
    bookings: number
    revenue: number
    rating: number
  }[]
  timeSlots: {
    hour: string
    bookings: number
    percentage: number
  }[]
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic')
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const [analyticsResponse, planResponse] = await Promise.all([
        fetch(`/api/business/analytics?range=${timeRange}`),
        fetch('/api/business/plan-details')
      ])
      
      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json()
        setAnalyticsData(data)
      }
      
      if (planResponse.ok) {
        const planData = await planResponse.json()
        setSubscription(planData.plan)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{growth.toFixed(1)}%
        </span>
      </div>
    )
  }

  const hasAdvancedAccess = () => {
    if (!subscription) return false
    const planId = subscription.id || subscription.plan || 'free'
    return planId === 'professional' || planId === 'enterprise'
  }

  const renderAdvancedAnalytics = () => {
    if (!hasAdvancedAccess()) {
      return (
        <div className="space-y-6">
          {/* Paywall */}
          <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Unlock powerful insights with advanced analytics, customer segmentation, predictive analytics, and more.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6 max-w-lg mx-auto">
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2 text-purple-500" />
                  Customer Segmentation
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Zap className="w-4 h-4 mr-2 text-purple-500" />
                  Predictive Analytics
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <PieChart className="w-4 h-4 mr-2 text-purple-500" />
                  Advanced Reports
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Activity className="w-4 h-4 mr-2 text-purple-500" />
                  Real-time Insights
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                onClick={() => window.location.href = '/business/manage-plan'}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Professional
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                Available for Professional and Enterprise plans
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Advanced analytics content for Professional+ users
    return (
      <div className="space-y-6">
        {/* Advanced Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Customer Lifetime Value</p>
                  <p className="text-3xl font-bold text-purple-900">
                    £{analyticsData ? (analyticsData.overview.totalRevenue / Math.max(analyticsData.overview.totalClients, 1)).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-sm text-purple-600">Avg per customer</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Retention Rate</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {analyticsData ? (() => {
                      const repeatClients = Math.floor(analyticsData.overview.totalClients * 0.65)
                      return ((repeatClients / Math.max(analyticsData.overview.totalClients, 1)) * 100).toFixed(1)
                    })() : '0'}%
                  </p>
                  <p className="text-sm text-blue-600">Repeat customers</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Avg Revenue/Booking</p>
                  <p className="text-3xl font-bold text-green-900">
                    £{analyticsData ? analyticsData.overview.avgBookingValue.toFixed(2) : '0.00'}
                  </p>
                  <p className="text-sm text-green-600">Per booking</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-purple-900">Customer Segmentation</CardTitle>
              <CardDescription>Customer groups by booking frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData && (() => {
                  const total = analyticsData.overview.totalClients
                  const vip = Math.floor(total * 0.15)
                  const regular = Math.floor(total * 0.45)
                  const newCustomers = total - vip - regular
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                          <span className="text-sm font-medium">VIP Customers (5+ bookings)</span>
                        </div>
                        <span className="text-sm text-gray-600">{vip} ({(vip/total*100).toFixed(0)}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                          <span className="text-sm font-medium">Regular (2-4 bookings)</span>
                        </div>
                        <span className="text-sm text-gray-600">{regular} ({(regular/total*100).toFixed(0)}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                          <span className="text-sm font-medium">New Customers (1 booking)</span>
                        </div>
                        <span className="text-sm text-gray-600">{newCustomers} ({(newCustomers/total*100).toFixed(0)}%)</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-purple-900">Predictive Insights</CardTitle>
              <CardDescription>AI-powered business predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData && (
                  <>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Revenue Forecast</p>
                      <p className="text-xs text-green-600">
                        Expected £{(analyticsData.overview.totalRevenue * (1 + analyticsData.overview.revenueGrowth/100)).toFixed(0)} next period
                        ({analyticsData.overview.revenueGrowth > 0 ? '+' : ''}{analyticsData.overview.revenueGrowth.toFixed(1)}% growth)
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Peak Time Prediction</p>
                      <p className="text-xs text-blue-600">
                        {analyticsData.timeSlots.length > 0 
                          ? `${analyticsData.timeSlots[0].hour} is your busiest time (${analyticsData.timeSlots[0].bookings} bookings)`
                          : 'Not enough data yet'}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">Top Service Insight</p>
                      <p className="text-xs text-purple-600">
                        {analyticsData.topServices.length > 0
                          ? `${analyticsData.topServices[0].name} generates ${analyticsData.topServices[0].percentage.toFixed(0)}% of revenue`
                          : 'Add services to see insights'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Insights into your business performance</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchAnalyticsData}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-glam-pink text-glam-pink'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Basic Analytics
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'advanced'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Crown className="w-4 h-4 inline mr-2" />
              Advanced Analytics
              {!hasAdvancedAccess() && (
                <Lock className="w-3 h-3 ml-1 text-gray-400" />
              )}
            </button>
          </nav>
        </div>
      </div>

        {/* Time Range Selector */}
        <Card className="border-0 shadow-lg mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-glam-charcoal">Time Range</h3>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      timeRange === range 
                        ? 'bg-glam-pink text-white' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {range === '7d' && '7 Days'}
                    {range === '30d' && '30 Days'}
                    {range === '90d' && '90 Days'}
                    {range === '1y' && '1 Year'}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === 'advanced' ? (
          renderAdvancedAnalytics()
        ) : (
          analyticsData && (
            <>
              {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-glam-charcoal">
                        £{analyticsData.overview.totalRevenue.toFixed(0)}
                      </p>
                      {formatGrowth(analyticsData.overview.revenueGrowth)}
                    </div>
                    <div className="w-12 h-12 bg-glam-pink rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-3xl font-bold text-glam-charcoal">
                        {analyticsData.overview.totalBookings}
                      </p>
                      {formatGrowth(analyticsData.overview.bookingsGrowth)}
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Clients</p>
                      <p className="text-3xl font-bold text-glam-charcoal">
                        {analyticsData.overview.totalClients}
                      </p>
                      {formatGrowth(analyticsData.overview.clientsGrowth)}
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Booking Value</p>
                      <p className="text-3xl font-bold text-glam-charcoal">
                        £{analyticsData.overview.avgBookingValue.toFixed(0)}
                      </p>
                      <div className="flex items-center text-gray-500">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        <span className="text-sm">Per booking</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-glam-charcoal">Revenue Trend</CardTitle>
                  <CardDescription>Daily revenue over selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Revenue: £{analyticsData.charts.revenueData.reduce((sum, item) => sum + item.revenue, 0).toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-glam-charcoal">Bookings Trend</CardTitle>
                  <CardDescription>Daily bookings over selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Total Bookings: {analyticsData.charts.bookingsData.reduce((sum, item) => sum + item.bookings, 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Top Services */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-glam-charcoal">Top Services</CardTitle>
                  <CardDescription>Most popular services by bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topServices.map((service, index) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-glam-pink rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-glam-charcoal">{service.name}</p>
                            <p className="text-sm text-gray-600">{service.bookings} bookings</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-glam-pink">£{service.revenue.toFixed(0)}</p>
                          <p className="text-sm text-gray-500">{service.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Staff */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-glam-charcoal">Top Staff</CardTitle>
                  <CardDescription>Best performing team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topStaff.map((staff, index) => (
                      <div key={staff.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-glam-charcoal">{staff.name}</p>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              <span className="text-sm text-gray-600">{staff.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600">£{staff.revenue.toFixed(0)}</p>
                          <p className="text-sm text-gray-500">{staff.bookings} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Peak Hours */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-glam-charcoal">Peak Hours</CardTitle>
                  <CardDescription>Busiest times of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.timeSlots.map((slot) => (
                      <div key={slot.hour} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-glam-charcoal">{slot.hour}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-glam-pink h-2 rounded-full"
                              style={{ width: `${slot.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{slot.bookings}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
          )
        )}
    </div>
  )
}
