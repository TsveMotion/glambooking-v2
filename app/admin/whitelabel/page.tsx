'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Plus,
  Search,
  Globe,
  DollarSign,
  Users,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Trash2
} from 'lucide-react'

interface WhiteLabelBusiness {
  id: string
  name: string
  customDomain?: string
  subdomain?: string
  isActive: boolean
  platformFeePercentage: number
  monthlyFee: number
  subscriptionStatus: string
  totalBookings: number
  monthlyRevenue: number
  createdAt: string
}

export default function WhiteLabelManagementPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<WhiteLabelBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchWhiteLabelBusinesses()
  }, [])

  const fetchWhiteLabelBusinesses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/whitelabel')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses)
      }
    } catch (error) {
      console.error('Error fetching white-label businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.customDomain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.subdomain?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRevenue = businesses.reduce((sum, b) => sum + b.monthlyRevenue, 0)
  const activeBusinesses = businesses.filter(b => b.isActive).length
  const totalMonthlyRecurring = businesses.reduce((sum, b) => 
    b.isActive && b.subscriptionStatus === 'active' ? sum + b.monthlyFee : sum, 0
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading white-label businesses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">White-Label Management</h1>
            <p className="text-gray-600 mt-1">Manage your white-label partners and their configurations</p>
          </div>
          <Button
            onClick={() => router.push('/admin/whitelabel/create')}
            className="bg-glam-pink hover:bg-glam-pink/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create White-Label
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Partners</p>
                <p className="text-3xl font-bold text-gray-900">{businesses.length}</p>
                <p className="text-xs text-green-600 mt-1">{activeBusinesses} active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Recurring</p>
                <p className="text-3xl font-bold text-gray-900">£{totalMonthlyRecurring.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-1">Subscription revenue</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transaction Revenue</p>
                <p className="text-3xl font-bold text-gray-900">£{totalRevenue.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {businesses.reduce((sum, b) => sum + b.totalBookings, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Across all partners</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by business name, domain, or subdomain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Businesses List */}
      <Card>
        <CardHeader>
          <CardTitle>White-Label Partners</CardTitle>
          <CardDescription>
            {filteredBusinesses.length} partner{filteredBusinesses.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-2">No white-label partners yet</p>
              <p className="text-sm text-gray-400 mb-4">Create your first white-label partner to get started</p>
              <Button
                onClick={() => router.push('/admin/whitelabel/create')}
                variant="outline"
                className="border-glam-pink text-glam-pink hover:bg-glam-pink hover:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create White-Label
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-glam-pink transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      business.isActive ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Building2 className={`w-6 h-6 ${
                        business.isActive ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{business.name}</h3>
                        {business.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-1" />
                          {business.customDomain || business.subdomain || 'No domain configured'}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {business.platformFeePercentage}% fee
                        </div>
                        <div>
                          £{business.monthlyFee}/month
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{business.totalBookings} bookings</span>
                        <span>£{business.monthlyRevenue.toFixed(2)} revenue</span>
                        <span>Status: {business.subscriptionStatus}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/whitelabel/${business.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/whitelabel/${business.id}/settings`)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
