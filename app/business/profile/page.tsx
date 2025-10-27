'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  Calendar,
  Users,
  Settings,
  Save,
  Edit,
  Camera,
  Star,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock
} from 'lucide-react'

interface ProfileData {
  user: {
    id: string
    clerkId: string
    email: string
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
    createdAt: string
    updatedAt: string
  }
  clerkUser: {
    id: string
    firstName: string | null
    lastName: string | null
    emailAddresses: any[]
    phoneNumbers: any[]
    imageUrl: string | null
    username: string | null
    createdAt: number
    updatedAt: number
    lastSignInAt: number | null
    twoFactorEnabled: boolean
    banned: boolean
    locked: boolean
    externalAccounts: any[]
  }
  business: {
    id: string
    name: string
    description: string | null
    address: string | null
    phone: string | null
    email: string | null
    website: string | null
    imageUrl: string | null
    isActive: boolean
    stripeOnboarded: boolean
    createdAt: string
    updatedAt: string
    servicesCount: number
    staffCount: number
  }
  subscription: any
  stats: {
    totalBookings: number
    completedBookings: number
    totalRevenue: number
    completionRate: number
  }
}

export default function ProfilePage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    user: {
      firstName: '',
      lastName: '',
      email: ''
    },
    business: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: ''
    }
  })

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
      return
    }
    fetchProfileData()
  }, [isLoaded, userId, router])

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/business/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
        setFormData({
          user: {
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            email: data.user.email || ''
          },
          business: {
            name: data.business.name || '',
            description: data.business.description || '',
            address: data.business.address || '',
            phone: data.business.phone || '',
            email: data.business.email || '',
            website: data.business.website || ''
          }
        })
      } else {
        console.error('Failed to fetch profile data:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setEditing(false)
        fetchProfileData() // Refresh data
      } else {
        alert('Failed to update profile. Please try again.')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (section: 'user' | 'business', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getPlanName = (subscription: any) => {
    if (!subscription) return 'No Plan'
    return subscription.plan === 'STARTER' ? 'User Plan' : 
           subscription.plan === 'PROFESSIONAL' ? 'Professional Plan' : 
           subscription.plan === 'ENTERPRISE' ? 'Enterprise Plan' : 'Unknown Plan'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">Unable to load your profile data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <User className="w-8 h-8 mr-3" />
            Profile
          </h1>
          <p className="text-gray-600">Manage your personal and business information</p>
        </div>
        <div className="flex space-x-3">
          {editing ? (
            <>
              <Button 
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-glam-pink hover:bg-glam-pink/90"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setEditing(true)}
              className="bg-glam-pink hover:bg-glam-pink/90"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your personal account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-glam-pink to-glam-gold rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.user.imageUrl ? (
                    <img 
                      src={profileData.user.imageUrl} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    `${profileData.user.firstName?.[0] || 'U'}${profileData.user.lastName?.[0] || ''}`
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {profileData.user.firstName} {profileData.user.lastName}
                  </h3>
                  <p className="text-gray-600">{profileData.user.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since {formatDate(profileData.user.createdAt)}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.user.firstName}
                      onChange={(e) => handleInputChange('user', 'firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.user.firstName || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.user.lastName}
                      onChange={(e) => handleInputChange('user', 'lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.user.lastName || 'Not set'}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.user.email}
                      onChange={(e) => handleInputChange('user', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.user.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clerk Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Clerk Account Information
              </CardTitle>
              <CardDescription>
                Your authentication and security details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clerk User ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm">{profileData.clerkUser.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <p className="text-gray-900">{profileData.clerkUser.username || 'Not set'}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Addresses
                  </label>
                  <div className="space-y-1">
                    {profileData.clerkUser.emailAddresses.map((email: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-900">{email.emailAddress}</span>
                        {email.verification?.status === 'verified' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Numbers
                  </label>
                  <div className="space-y-1">
                    {profileData.clerkUser.phoneNumbers.length > 0 ? (
                      profileData.clerkUser.phoneNumbers.map((phone: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-900">{phone.phoneNumber}</span>
                          {phone.verification?.status === 'verified' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No phone numbers</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Sign In
                  </label>
                  <p className="text-gray-900">
                    {profileData.clerkUser.lastSignInAt 
                      ? new Date(profileData.clerkUser.lastSignInAt).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Created
                  </label>
                  <p className="text-gray-900">
                    {new Date(profileData.clerkUser.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Two-Factor Auth</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profileData.clerkUser.twoFactorEnabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profileData.clerkUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profileData.clerkUser.banned || profileData.clerkUser.locked
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {profileData.clerkUser.banned ? 'Banned' : 
                     profileData.clerkUser.locked ? 'Locked' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">External Accounts</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profileData.clerkUser.externalAccounts.length}
                  </span>
                </div>
              </div>

              {profileData.clerkUser.externalAccounts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connected Accounts
                  </label>
                  <div className="space-y-2">
                    {profileData.clerkUser.externalAccounts.map((account: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">
                              {account.provider?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{account.provider}</p>
                            <p className="text-sm text-gray-600">{account.emailAddress || account.username}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          account.verification?.status === 'verified'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {account.verification?.status || 'Unverified'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Business Information
              </CardTitle>
              <CardDescription>
                Your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.business.name}
                    onChange={(e) => handleInputChange('business', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.business.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                {editing ? (
                  <textarea
                    value={formData.business.description}
                    onChange={(e) => handleInputChange('business', 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    placeholder="Describe your business..."
                  />
                ) : (
                  <p className="text-gray-900">{profileData.business.description || 'No description set'}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.business.phone}
                      onChange={(e) => handleInputChange('business', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                      placeholder="+44 20 1234 5678"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.business.phone || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Business Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.business.email}
                      onChange={(e) => handleInputChange('business', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                      placeholder="business@example.com"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.business.email || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.business.address}
                    onChange={(e) => handleInputChange('business', 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    placeholder="123 Beauty Street, London, UK"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.business.address || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={formData.business.website}
                    onChange={(e) => handleInputChange('business', 'website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    placeholder="https://www.yourbusiness.com"
                  />
                ) : (
                  <p className="text-gray-900">
                    {profileData.business.website ? (
                      <a 
                        href={profileData.business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profileData.business.website}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Business Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profileData.business.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profileData.business.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stripe Connected</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profileData.business.stripeOnboarded 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profileData.business.stripeOnboarded ? 'Connected' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Plan</span>
                <span className="text-sm font-medium text-gray-900">
                  {getPlanName(profileData.subscription)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Business Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Bookings</span>
                </div>
                <span className="font-semibold text-blue-600">
                  {profileData.stats.totalBookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="font-semibold text-green-600">
                  {profileData.stats.completedBookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Revenue</span>
                </div>
                <span className="font-semibold text-purple-600">
                  £{profileData.stats.totalRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-orange-500 mr-2" />
                  <span className="text-sm text-gray-600">Completion Rate</span>
                </div>
                <span className="font-semibold text-orange-600">
                  {profileData.stats.completionRate}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/business/manage-plan')}
              >
                <Star className="w-4 h-4 mr-2" />
                Manage Plan
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/business/services')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Services
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/business/team')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Team
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="text-center">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Business created on
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(profileData.business.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
