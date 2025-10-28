'use client'

import { useAuth, UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Activity,
  Crown,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  ShoppingBag,
  UserCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

interface WhitelabelBusiness {
  id: string
  name: string
  subdomain: string
  brandName: string
  isActive: boolean
  createdAt: string
  platformFeePercentage: number
  monthlyFee: number
  totalBookings: number
  monthlyRevenue: number
  ownerEmail: string
}

interface PlatformStats {
  totalUsers: number
  totalBusinesses: number
  activeBusinesses: number
  totalBookings: number
  completedBookings: number
  totalRevenue: number
  platformRevenue: number
  whitelabelBusinesses: number
  activeWhitelabels: number
  recentSignups: number
  monthlyBookings: number
  averageBookingValue: number
  completionRate: number
}

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  createdAt: string
  businessCount: number
  bookingCount: number
  totalSpent: number
  isBusinessOwner: boolean
  hasWhitelabel: boolean
}

interface Business {
  id: string
  name: string
  email: string | null
  isActive: boolean
  isWhiteLabel: boolean
  stripeOnboarded: boolean
  plan: string
  createdAt: string
  owner: {
    email: string
    firstName: string | null
    lastName: string | null
  }
  bookingCount: number
  serviceCount: number
  staffCount: number
  totalRevenue: number
  monthlyRevenue: number
  platformRevenue: number
}

interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: string
  amount?: number
  metadata: any
}

export default function SuperAdminDashboard() {
  const { userId, isLoaded } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [whitelabelBusinesses, setWhitelabelBusinesses] = useState<WhitelabelBusiness[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalBusinesses: 0,
    activeBusinesses: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    platformRevenue: 0,
    whitelabelBusinesses: 0,
    activeWhitelabels: 0,
    recentSignups: 0,
    monthlyBookings: 0,
    averageBookingValue: 0,
    completionRate: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'whitelabels' | 'users' | 'businesses' | 'activity' | 'analytics' | 'settings'>('overview')

  useEffect(() => {
    // CRITICAL: Check authorization immediately
    if (isLoaded && userLoaded) {
      if (!userId) {
        router.push('/sign-in')
        return
      }

      // Get user's primary email
      const userEmail = user?.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )?.emailAddress

      // ONLY allow kristiyan@tsvweb.com
      if (userEmail?.toLowerCase() !== 'kristiyan@tsvweb.com') {
        alert('ACCESS DENIED: You are not authorized to access the Super Admin panel. This incident will be logged.')
        router.push('/')
        return
      }

      // User is authorized, fetch data
      fetchData()
    }
  }, [isLoaded, userId, userLoaded, user])

  const fetchData = async () => {
    setLoading(true)
    console.log('🔍 Starting data fetch for super admin...')
    
    try {
      // Fetch all data in parallel
      const [statsRes, usersRes, businessesRes, whitelabelsRes, activityRes] = await Promise.all([
        fetch('/api/super-admin/stats'),
        fetch('/api/super-admin/users'),
        fetch('/api/super-admin/businesses'),
        fetch('/api/super-admin/whitelabels'),
        fetch('/api/super-admin/activity')
      ])

      console.log('📊 Response statuses:', {
        stats: statsRes.status,
        users: usersRes.status,
        businesses: businessesRes.status,
        whitelabels: whitelabelsRes.status,
        activity: activityRes.status
      })

      // Check authorization from first response
      if (statsRes.status === 403) {
        setAuthorized(false)
        alert('Access Denied: You are not authorized to access the Super Admin panel. Only the designated super administrator can access this area.')
        router.push('/')
        return
      } else if (statsRes.status === 401) {
        router.push('/sign-in')
        return
      }

      // Parse all successful responses
      if (statsRes.ok) {
        const data = await statsRes.json()
        console.log('✅ Stats data:', data)
        setStats(data)
      } else {
        const error = await statsRes.text()
        console.error('❌ Stats error:', error)
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        console.log('✅ Users data:', data)
        console.log('👥 Number of users:', data.users?.length || 0)
        setUsers(data.users || [])
      } else {
        const error = await usersRes.text()
        console.error('❌ Users error:', error)
      }

      if (businessesRes.ok) {
        const data = await businessesRes.json()
        console.log('✅ Businesses data:', data)
        console.log('🏢 Number of businesses:', data.businesses?.length || 0)
        setBusinesses(data.businesses || [])
      } else {
        const error = await businessesRes.text()
        console.error('❌ Businesses error:', error)
      }

      if (whitelabelsRes.ok) {
        const data = await whitelabelsRes.json()
        console.log('✅ Whitelabels data:', data)
        console.log('👑 Number of whitelabels:', data.businesses?.length || 0)
        setWhitelabelBusinesses(data.businesses || [])
      } else {
        const error = await whitelabelsRes.text()
        console.error('❌ Whitelabels error:', error)
      }

      if (activityRes.ok) {
        const data = await activityRes.json()
        console.log('✅ Activity data:', data)
        console.log('📋 Number of activities:', data.activities?.length || 0)
        setActivities(data.activities || [])
      } else {
        const error = await activityRes.text()
        console.error('❌ Activity error:', error)
      }

      setAuthorized(true)
      console.log('✅ All data fetched successfully')
    } catch (error) {
      console.error('❌ Error fetching super admin data:', error)
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (businessId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/super-admin/whitelabels/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, isActive: !currentStatus })
      })

      if (response.ok) {
        alert('Status updated successfully!')
        fetchData()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Error updating status')
    }
  }

  const filteredWhitelabels = whitelabelBusinesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (business.subdomain || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (business.brandName || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (business.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (business.owner.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Show loading screen while checking authorization OR loading data
  if (!isLoaded || !userLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Verifying authorization...</p>
        </div>
      </div>
    )
  }

  // If not authorized after loading, don't render anything (redirect will happen)
  if (!authorized && (isLoaded && userLoaded)) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Super Admin</h1>
              <p className="text-xs text-gray-600">Platform Control</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-5 h-5" />
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="flex-1 text-left">Users</span>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{users.length}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('businesses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'businesses'
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="flex-1 text-left">Businesses</span>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{businesses.length}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('whitelabels')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'whitelabels'
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Crown className="w-5 h-5" />
            <span className="flex-1 text-left">White-Labels</span>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{whitelabelBusinesses.length}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('activity')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-5 h-5" />
            Activity Feed
          </button>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Super Admin</p>
              <p className="text-xs text-gray-600">kristiyan@tsvweb.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'overview' && 'Platform Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'businesses' && 'Business Management'}
              {activeTab === 'whitelabels' && 'White-Label Management'}
              {activeTab === 'activity' && 'Activity Feed'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {activeTab === 'overview' && 'Monitor platform health and key metrics'}
              {activeTab === 'users' && 'View and manage all registered users'}
              {activeTab === 'businesses' && 'Manage all businesses on the platform'}
              {activeTab === 'whitelabels' && 'Control white-label partner businesses'}
              {activeTab === 'activity' && 'Recent platform activity and events'}
            </p>
          </div>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Search Bar for list views */}
          {(activeTab === 'users' || activeTab === 'businesses' || activeTab === 'whitelabels') && (
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                      <p className="text-xs text-green-600 mt-1">+{stats.recentSignups} this month</p>
                    </div>
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBusinesses}</p>
                      <p className="text-xs text-green-600 mt-1">{stats.activeBusinesses} active</p>
                    </div>
                    <Building2 className="w-10 h-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.completionRate.toFixed(1)}% completed</p>
                    </div>
                    <Calendar className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">£{stats.platformRevenue.toFixed(0)}</p>
                      <p className="text-xs text-gray-500 mt-1">£{stats.totalRevenue.toFixed(0)} total</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">White-Label Businesses</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.whitelabelBusinesses}</p>
                      <p className="text-xs text-green-600 mt-1">{stats.activeWhitelabels} active</p>
                    </div>
                    <Crown className="w-10 h-10 text-pink-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Bookings</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.monthlyBookings}</p>
                      <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Booking Value</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">£{stats.averageBookingValue.toFixed(0)}</p>
                      <p className="text-xs text-gray-500 mt-1">Per booking</p>
                    </div>
                    <ShoppingBag className="w-10 h-10 text-teal-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completionRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-1">Success rate</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="w-full" onClick={() => router.push('/admin/whitelabel/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Whitelabel
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('whitelabels')}>
                    <Building2 className="w-4 h-4 mr-2" />
                    View All Businesses
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab('analytics')}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Platform Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
                <CardDescription>Latest actions across all businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'user_signup' ? 'bg-blue-100' :
                        activity.type === 'business_created' ? 'bg-purple-100' :
                        activity.type === 'booking_made' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {activity.type === 'user_signup' && <Users className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'business_created' && <Building2 className="w-5 h-5 text-purple-600" />}
                        {activity.type === 'booking_made' && <Calendar className="w-5 h-5 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                      {activity.amount && (
                        <p className="text-sm font-bold text-green-600">£{activity.amount.toFixed(2)}</p>
                      )}
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                      {user.firstName?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'No Name'}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Businesses:</span>
                          <span className="font-medium">{user.businessCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Bookings:</span>
                          <span className="font-medium">{user.bookingCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Spent:</span>
                          <span className="font-medium text-green-600">£{user.totalSpent.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {user.isBusinessOwner && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            Business Owner
                          </span>
                        )}
                        {user.hasWhitelabel && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                            White-Label
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredUsers.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            )}
          </div>
        )}

        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <div className="grid grid-cols-1 gap-4">
            {filteredBusinesses.map((business) => (
              <Card key={business.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                        business.isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'
                      }`}>
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                          {business.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                          {business.isWhiteLabel && (
                            <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                              White-Label
                            </span>
                          )}
                          {business.stripeOnboarded && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Stripe Connected
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {business.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {business.email}
                            </span>
                          )}
                          <span>•</span>
                          <span>Owner: {business.owner.email}</span>
                          <span>•</span>
                          <span>Plan: {business.plan.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-sm">
                            <span className="text-gray-600">Bookings: </span>
                            <strong className="text-gray-900">{business.bookingCount}</strong>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Services: </span>
                            <strong className="text-gray-900">{business.serviceCount}</strong>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Staff: </span>
                            <strong className="text-gray-900">{business.staffCount}</strong>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Revenue: </span>
                            <strong className="text-green-600">£{business.totalRevenue.toFixed(2)}</strong>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Created {new Date(business.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No businesses found</p>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'user_signup' ? 'bg-blue-100' :
                      activity.type === 'business_created' ? 'bg-purple-100' :
                      activity.type === 'booking_made' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {activity.type === 'user_signup' && <Users className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'business_created' && <Building2 className="w-5 h-5 text-purple-600" />}
                      {activity.type === 'booking_made' && <Calendar className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                    {activity.amount && (
                      <p className="text-sm font-bold text-green-600">£{activity.amount.toFixed(2)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No recent activity</p>
              </div>
            )}
          </div>
        )}

        {/* Whitelabels Tab */}
        {activeTab === 'whitelabels' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search by name, subdomain, or brand..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => router.push('/admin/whitelabel/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Whitelabel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Whitelabel Businesses List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredWhitelabels.map((business) => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          business.isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'
                        }`}>
                          <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{business.brandName}</h3>
                            {business.isActive ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{business.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Subdomain: <strong>{business.subdomain}</strong></span>
                            <span>•</span>
                            <span>Created: {new Date(business.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Owner: {business.ownerEmail}</span>
                          </div>
                          <div className="flex items-center gap-6 mt-3">
                            <div className="text-sm">
                              <span className="text-gray-600">Platform Fee: </span>
                              <strong className="text-gray-900">{business.platformFeePercentage}%</strong>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Monthly: </span>
                              <strong className="text-gray-900">£{business.monthlyFee}</strong>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Bookings: </span>
                              <strong className="text-gray-900">{business.totalBookings}</strong>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Revenue: </span>
                              <strong className="text-green-600">£{business.monthlyRevenue.toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`http://${business.subdomain}.localhost:3000`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/admin/${business.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={business.isActive ? 'destructive' : 'default'}
                          onClick={() => handleToggleActive(business.id, business.isActive)}
                        >
                          {business.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Detailed insights across all whitelabel businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Advanced Analytics Coming Soon</p>
                    <p className="text-sm">Charts and detailed metrics will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure global platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Platform Configuration</h4>
                        <p className="text-xs text-blue-700 mt-1">
                          Global settings for all whitelabel businesses. Changes here affect the entire platform.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center py-12 text-gray-500">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Platform Settings</p>
                    <p className="text-sm">Configuration options coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
