'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Globe, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  Settings,
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react'

interface WhiteLabelDetail {
  id: string
  name: string
  email: string
  customDomain: string | null
  subdomain: string | null
  brandName: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  platformFeePercentage: number
  monthlyFee: number
  isActive: boolean
  subscriptionStatus: string
  nextBillingDate: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  createdAt: string
  totalBookings: number
  monthlyRevenue: number
}

export default function WhiteLabelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const businessId = params.id as string
  
  const [business, setBusiness] = useState<WhiteLabelDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchBusinessDetails()
  }, [businessId])

  const fetchBusinessDetails = async () => {
    try {
      const response = await fetch(`/api/admin/whitelabel/${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setBusiness(data.business)
      }
    } catch (error) {
      console.error('Error fetching business details:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'past_due': return 'text-yellow-600 bg-yellow-50'
      case 'canceled': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600 mb-6">The white-label business you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/whitelabel')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to White-Label Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const domainUrl = business.customDomain 
    ? `https://${business.customDomain}`
    : business.subdomain 
    ? `https://${business.subdomain}.glambooking.com`
    : null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/whitelabel')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{business.brandName || business.name}</h1>
            <p className="text-gray-600 mt-1">{business.email}</p>
          </div>
          <div className="flex gap-3">
            {domainUrl && (
              <Button variant="outline" onClick={() => window.open(domainUrl, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Site
              </Button>
            )}
            <Button onClick={() => router.push(`/admin/whitelabel/${businessId}/settings`)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {!business.isActive && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">This white-label partner is inactive</p>
            <p className="text-sm text-red-700">Their booking site is not accessible to customers</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Domain Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Domain Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {business.customDomain && (
              <div>
                <label className="text-sm font-medium text-gray-600">Custom Domain</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 px-3 py-2 bg-gray-50 rounded border text-sm">
                    {business.customDomain}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(business.customDomain!)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
            
            {business.subdomain && (
              <div>
                <label className="text-sm font-medium text-gray-600">Subdomain</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 px-3 py-2 bg-gray-50 rounded border text-sm">
                    {business.subdomain}.glambooking.com
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`${business.subdomain}.glambooking.com`)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {domainUrl && (
              <div className="pt-2">
                <a
                  href={domainUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  Visit booking page
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Billing & Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Platform Fee</label>
                <p className="text-2xl font-bold text-gray-900">{business.platformFeePercentage}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Monthly Subscription</label>
                <p className="text-2xl font-bold text-gray-900">£{business.monthlyFee}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Subscription Status</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(business.subscriptionStatus)}`}>
                  {business.subscriptionStatus === 'active' && <CheckCircle className="w-4 h-4" />}
                  {business.subscriptionStatus === 'past_due' && <AlertCircle className="w-4 h-4" />}
                  {business.subscriptionStatus === 'canceled' && <XCircle className="w-4 h-4" />}
                  {business.subscriptionStatus.charAt(0).toUpperCase() + business.subscriptionStatus.slice(1)}
                </span>
              </div>
            </div>

            {business.nextBillingDate && (
              <div>
                <label className="text-sm font-medium text-gray-600">Next Billing Date</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(business.nextBillingDate).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            )}

            {business.stripeSubscriptionId && (
              <div>
                <label className="text-sm font-medium text-gray-600">Stripe Subscription</label>
                <a
                  href={`https://dashboard.stripe.com/subscriptions/${business.stripeSubscriptionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mt-1"
                >
                  View in Stripe
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Brand Name</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{business.brandName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Colors</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div 
                    className="w-full h-12 rounded border shadow-sm"
                    style={{ backgroundColor: business.primaryColor }}
                  />
                  <p className="text-xs text-gray-600 mt-1">Primary</p>
                </div>
                <div>
                  <div 
                    className="w-full h-12 rounded border shadow-sm"
                    style={{ backgroundColor: business.secondaryColor }}
                  />
                  <p className="text-xs text-gray-600 mt-1">Secondary</p>
                </div>
                <div>
                  <div 
                    className="w-full h-12 rounded border shadow-sm"
                    style={{ backgroundColor: business.accentColor }}
                  />
                  <p className="text-xs text-gray-600 mt-1">Accent</p>
                </div>
              </div>
            </div>

            {business.logoUrl && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Logo</label>
                <img 
                  src={business.logoUrl} 
                  alt="Logo" 
                  className="h-16 object-contain border rounded p-2 bg-white"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Total Bookings</label>
                <p className="text-3xl font-bold text-gray-900">{business.totalBookings}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Monthly Revenue</label>
                <p className="text-3xl font-bold text-gray-900">£{business.monthlyRevenue.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Created</label>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(business.createdAt).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                {business.isActive ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-50">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-red-600 bg-red-50">
                    <XCircle className="w-4 h-4" />
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage this white-label partner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.push(`/admin/whitelabel/${businessId}/settings`)}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Settings
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/businesses/${businessId}`)}>
              View Full Business Details
            </Button>
            {business.stripeCustomerId && (
              <Button 
                variant="outline"
                onClick={() => window.open(`https://dashboard.stripe.com/customers/${business.stripeCustomerId}`, '_blank')}
              >
                View in Stripe
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
