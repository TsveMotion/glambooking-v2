'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Palette, 
  Settings,
  Save,
  ArrowLeft,
  Eye,
  RefreshCw,
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  Plus,
  Edit,
  Activity,
  CreditCard,
  CheckCircle,
  Clock
} from 'lucide-react'

interface WhiteLabelSettings {
  brandName: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  subdomain: string | null
  platformFeePercentage: number
  monthlyFee: number
}

interface BusinessStats {
  totalBookings: number
  monthlyBookings: number
  totalRevenue: number
  monthlyRevenue: number
  totalClients: number
  activeStaff: number
  activeServices: number
}

interface SubBusiness {
  id: string
  name: string
  email: string
  createdAt: string
  isActive: boolean
  bookingsCount: number
  revenue: number
}

export default function PartnerAdminPage() {
  const params = useParams()
  const router = useRouter()
  const { userId } = useAuth()
  const businessId = params.businessId as string

  const [settings, setSettings] = useState<WhiteLabelSettings>({
    brandName: '',
    logoUrl: null,
    primaryColor: '#E91E63',
    secondaryColor: '#FFD700',
    accentColor: '#333333',
    subdomain: null,
    platformFeePercentage: 1.0,
    monthlyFee: 200
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'pricing' | 'revenue' | 'analytics' | 'businesses'>('overview')
  const [stats, setStats] = useState<BusinessStats>({
    totalBookings: 0,
    monthlyBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    activeStaff: 0,
    activeServices: 0
  })
  const [subBusinesses, setSubBusinesses] = useState<SubBusiness[]>([])
  const [showCreateBusiness, setShowCreateBusiness] = useState(false)
  const [newBusinessName, setNewBusinessName] = useState('')
  const [newBusinessEmail, setNewBusinessEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchStats()
    fetchSubBusinesses()
  }, [businessId])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/admin/whitelabel/${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setSettings({
          brandName: data.business.brandName,
          logoUrl: data.business.logoUrl,
          primaryColor: data.business.primaryColor,
          secondaryColor: data.business.secondaryColor,
          accentColor: data.business.accentColor,
          subdomain: data.business.subdomain,
          platformFeePercentage: data.business.platformFeePercentage || 1.0,
          monthlyFee: data.business.monthlyFee || 200
        })
        setBusinessName(data.business.name)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/whitelabel/${businessId}`)
      if (response.ok) {
        const data = await response.json()
        // Extract stats from business data
        setStats({
          totalBookings: data.business.totalBookings || 0,
          monthlyBookings: 0,
          totalRevenue: 0,
          monthlyRevenue: data.business.monthlyRevenue || 0,
          totalClients: 0,
          activeStaff: 0,
          activeServices: 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchSubBusinesses = async () => {
    try {
      // For now, use empty array until we implement proper parent-child relationships
      setSubBusinesses([])
    } catch (error) {
      console.error('Error fetching sub-businesses:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/whitelabel/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          ...settings
        })
      })

      if (response.ok) {
        alert('Settings saved successfully! Changes are now live.')
        await fetchSettings() // Refresh to show updates
      } else {
        const errorData = await response.json()
        alert(`Failed to save settings: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateBusiness = async () => {
    if (!newBusinessName || !newBusinessEmail) {
      alert('Please fill in all fields')
      return
    }

    setCreating(true)
    try {
      // For now, show coming soon message
      alert('Business creation feature coming soon! This will allow you to create sub-businesses under your whitelabel platform.')
      setNewBusinessName('')
      setNewBusinessEmail('')
      setShowCreateBusiness(false)
    } catch (error) {
      console.error('Error creating business:', error)
      alert('Error creating business')
    } finally {
      setCreating(false)
    }
  }

  const handlePreview = () => {
    const previewUrl = settings.subdomain
      ? `http://${settings.subdomain}.localhost:3000`
      : window.location.origin
    window.open(previewUrl, '_blank')
  }

  const handleLogoUpload = () => {
    setUploading(true)
    // @ts-ignore
    if (window.cloudinary) {
      // @ts-ignore
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
          sources: ['local', 'url', 'camera'],
          multiple: false,
          maxFileSize: 2000000, // 2MB
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
          theme: 'minimal'
        },
        (error: any, result: any) => {
          setUploading(false)
          if (!error && result && result.event === 'success') {
            setSettings({ ...settings, logoUrl: result.info.secure_url })
            alert('Logo uploaded successfully!')
          } else if (error) {
            console.error('Upload error:', error)
            alert('Error uploading logo. Please try again.')
          }
        }
      )
      widget.open()
    } else {
      setUploading(false)
      alert('Cloudinary widget not loaded. Please refresh the page.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/business/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Management Portal</h1>
              <p className="text-gray-600 mt-1">{businessName}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview Site
              </Button>
              <Button onClick={() => { fetchSettings(); fetchStats(); fetchSubBusinesses(); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'branding'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Branding
              </div>
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pricing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Customer Pricing
              </div>
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'revenue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Revenue
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Analytics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('businesses')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'businesses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Businesses
              </div>
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.monthlyBookings} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">£{stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    £{stats.monthlyRevenue.toFixed(2)} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Clients</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalClients}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Active customers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Staff</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeStaff}</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.activeServices} services
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Platform Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Platform URL</label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1">
                        {settings.subdomain ? `https://${settings.subdomain}.glambooking.co.uk` : 'Not configured'}
                      </code>
                      {settings.subdomain && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://${settings.subdomain}.glambooking.co.uk`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Brand Name</label>
                    <p className="mt-1 text-sm bg-gray-100 px-3 py-2 rounded">
                      {settings.brandName || businessName}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branding */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Brand Identity
                  </CardTitle>
                  <CardDescription>Customize how your brand appears to customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Name
                    </label>
                    <Input
                      value={settings.brandName}
                      onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                      placeholder="Your Brand Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={settings.logoUrl || ''}
                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="flex-1"
                      />
                      <Button 
                        type="button"
                        onClick={handleLogoUpload}
                        disabled={uploading}
                        variant="outline"
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload via Cloudinary or paste a URL
                    </p>
                  </div>

                  {settings.logoUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Preview
                      </label>
                      <img 
                        src={settings.logoUrl} 
                        alt="Logo" 
                        className="h-20 object-contain border rounded p-2 bg-white"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Color Scheme
                  </CardTitle>
                  <CardDescription>Choose your brand colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        placeholder="#E91E63"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Main buttons and accents</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        placeholder="#FFD700"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Secondary buttons and highlights</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        placeholder="#333333"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Text and borders</p>
                  </div>

                  <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Color Preview
                    </label>
                    <div className="flex gap-3">
                      <div 
                        className="w-full h-16 rounded border shadow-sm flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        Primary
                      </div>
                      <div 
                        className="w-full h-16 rounded border shadow-sm flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: settings.secondaryColor }}
                      >
                        Secondary
                      </div>
                      <div 
                        className="w-full h-16 rounded border shadow-sm flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: settings.accentColor }}
                      >
                        Accent
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* GlamBooking Fees - What YOU pay */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  GlamBooking Platform Fees
                </CardTitle>
                <CardDescription>What you pay to GlamBooking for using their infrastructure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Fee to GlamBooking
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.platformFeePercentage}
                        onChange={(e) => setSettings({ ...settings, platformFeePercentage: parseFloat(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600">% per transaction</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Fee you pay to GlamBooking per transaction
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Platform Cost
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">£</span>
                      <Input
                        type="number"
                        value={settings.monthlyFee}
                        onChange={(e) => setSettings({ ...settings, monthlyFee: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="1"
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600">/ month</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Your monthly subscription to GlamBooking platform
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-orange-900">Your Costs</h4>
                      <p className="text-xs text-orange-700 mt-1">
                        These are the fees YOU pay to GlamBooking. To configure what your CUSTOMERS pay, go to the "Customer Pricing" tab.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3 lg:col-span-2">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview Changes
              </Button>
              <Button onClick={handleSave} disabled={saving} size="lg">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Customer Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Subscription Tiers</CardTitle>
                <CardDescription>
                  Configure the pricing plans your customers see on the /pricing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Starter Plan */}
                <div className="p-6 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Starter Plan</h3>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Price</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">£</span>
                        <Input type="number" defaultValue="49" className="w-24" />
                        <span className="text-sm text-gray-600">/ month</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Max Staff</label>
                      <Input type="number" defaultValue="3" className="w-24 mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Booking Fee</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input type="number" defaultValue="5" className="w-20" step="0.1" />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Plan */}
                <div className="p-6 border-2 border-blue-500 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Professional Plan</h3>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Most Popular</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Price</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">£</span>
                        <Input type="number" defaultValue="99" className="w-24" />
                        <span className="text-sm text-gray-600">/ month</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Max Staff</label>
                      <Input type="number" defaultValue="10" className="w-24 mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Booking Fee</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input type="number" defaultValue="3" className="w-20" step="0.1" />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className="p-6 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Enterprise Plan</h3>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Price</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">£</span>
                        <Input type="number" defaultValue="199" className="w-24" />
                        <span className="text-sm text-gray-600">/ month</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Max Staff</label>
                      <Input type="number" defaultValue="50" className="w-24 mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Booking Fee</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input type="number" defaultValue="2" className="w-20" step="0.1" />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button size="lg">
                    <Save className="w-4 h-4 mr-2" />
                    Save Pricing Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue Tab - Stripe Connect */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Stripe Connect Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Stripe Connect Setup
                </CardTitle>
                <CardDescription>
                  Connect your Stripe account to receive payouts automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="text-sm font-medium text-green-900">Stripe Connected</h4>
                        <p className="text-xs text-green-700 mt-1">
                          Your Stripe account is connected and ready to receive payouts
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Stripe Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">£{stats.monthlyRevenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Platform fees collected</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Payout</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">£0.00</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Available in 2 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earned</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">£{stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">All-time revenue</p>
                </CardContent>
              </Card>
            </div>

            {/* Payout History */}
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>Recent payouts from your platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Platform Fees - December 2024</p>
                      <p className="text-xs text-gray-500">Paid on Dec 1, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">£450.00</p>
                      <span className="text-xs text-gray-500">Completed</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Platform Fees - November 2024</p>
                      <p className="text-xs text-gray-500">Paid on Nov 1, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">£380.00</p>
                      <span className="text-xs text-gray-500">Completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600 mt-1">Total Users</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Building2 className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600 mt-1">Active Businesses</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Bookings</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">£{stats.totalRevenue.toFixed(0)}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage users on your platform</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No users yet. Users will appear here when they sign up.</p>
                </div>
              </CardContent>
            </Card>

            {/* Businesses Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Businesses</CardTitle>
                    <CardDescription>Manage businesses using your platform</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No businesses yet. Businesses will appear when they subscribe.</p>
                </div>
              </CardContent>
            </Card>

            {/* Growth Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Chart will appear when you have revenue data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <div className="space-y-6">
            {/* Create Business Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Manage Businesses
                    </CardTitle>
                    <CardDescription>Create and manage businesses under your platform</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateBusiness(!showCreateBusiness)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Business
                  </Button>
                </div>
              </CardHeader>
              {showCreateBusiness && (
                <CardContent>
                  <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <h3 className="font-medium text-gray-900">New Business</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <Input
                          value={newBusinessName}
                          onChange={(e) => setNewBusinessName(e.target.value)}
                          placeholder="e.g., Beauty Salon Downtown"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Email
                        </label>
                        <Input
                          type="email"
                          value={newBusinessEmail}
                          onChange={(e) => setNewBusinessEmail(e.target.value)}
                          placeholder="contact@business.com"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowCreateBusiness(false)
                          setNewBusinessName('')
                          setNewBusinessEmail('')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateBusiness} disabled={creating}>
                        {creating ? 'Creating...' : 'Create Business'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Businesses List */}
            <div className="grid grid-cols-1 gap-4">
              {subBusinesses.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No businesses yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Create your first business to start managing bookings
                    </p>
                    <Button onClick={() => setShowCreateBusiness(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Business
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                subBusinesses.map((business) => (
                  <Card key={business.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              business.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {business.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{business.email}</p>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Bookings</p>
                              <p className="text-lg font-semibold text-gray-900">{business.bookingsCount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Revenue</p>
                              <p className="text-lg font-semibold text-gray-900">£{business.revenue.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Created</p>
                              <p className="text-sm text-gray-900">
                                {new Date(business.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/business/${business.id}/dashboard`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
