'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Building2,
  Globe,
  Palette,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function CreateWhiteLabelPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Business Details
    businessName: '',
    email: '',
    ownerFirstName: '',
    ownerLastName: '',
    
    // Domain Configuration
    customDomain: '',
    subdomain: '',
    
    // Branding
    brandName: '',
    logoUrl: '',
    primaryColor: '#E91E63',
    secondaryColor: '#FFD700',
    accentColor: '#333333',
    
    // Pricing
    platformFeePercentage: '1.0',
    monthlyFee: '200.00'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/whitelabel/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/whitelabel/${data.businessId}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create white-label business')
      }
    } catch (error) {
      console.error('Error creating white-label:', error)
      alert('Failed to create white-label business')
    } finally {
      setLoading(false)
    }
  }

  const canProceedStep1 = formData.businessName && formData.email && 
    formData.ownerFirstName && formData.ownerLastName
  const canProceedStep2 = formData.subdomain || formData.customDomain
  const canProceedStep3 = formData.brandName && formData.primaryColor

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/whitelabel')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to White-Label Management
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Create White-Label Partner</h1>
        <p className="text-gray-600 mt-1">Set up a new white-label business with custom branding and pricing</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { number: 1, title: 'Business Details', icon: Building2 },
            { number: 2, title: 'Domain Setup', icon: Globe },
            { number: 3, title: 'Branding', icon: Palette },
            { number: 4, title: 'Pricing', icon: DollarSign }
          ].map((s, index) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step >= s.number 
                    ? 'bg-glam-pink text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  step >= s.number ? 'text-glam-pink' : 'text-gray-500'
                }`}>
                  {s.title}
                </span>
              </div>
              {index < 3 && (
                <div className={`flex-1 h-1 mx-4 ${
                  step > s.number ? 'bg-glam-pink' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Business Information'}
            {step === 2 && 'Domain Configuration'}
            {step === 3 && 'Brand Customization'}
            {step === 4 && 'Pricing & Billing'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Enter the basic information for the white-label business'}
            {step === 2 && 'Configure the domain or subdomain for this partner'}
            {step === 3 && 'Customize the branding to match the partner\'s identity'}
            {step === 4 && 'Set the platform fee and monthly subscription amount'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Business Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <Input
                  placeholder="Elegant Beauty Salon"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner First Name *
                  </label>
                  <Input
                    placeholder="John"
                    value={formData.ownerFirstName}
                    onChange={(e) => handleInputChange('ownerFirstName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Last Name *
                  </label>
                  <Input
                    placeholder="Smith"
                    value={formData.ownerLastName}
                    onChange={(e) => handleInputChange('ownerLastName', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="owner@elegantbeauty.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This email will be used for login and billing notifications
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Domain Configuration */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subdomain
                </label>
                <div className="flex items-center">
                  <Input
                    placeholder="elegantbeauty"
                    value={formData.subdomain}
                    onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="rounded-r-none"
                  />
                  <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                    .glambooking.com
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This creates: {formData.subdomain || 'yoursubdomain'}.glambooking.com
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Domain
                </label>
                <Input
                  placeholder="elegantbeauty.com"
                  value={formData.customDomain}
                  onChange={(e) => handleInputChange('customDomain', e.target.value.toLowerCase())}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Partner must configure DNS to point to our servers
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You can configure subdomain now and add custom domain later
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Branding */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name *
                </label>
                <Input
                  placeholder="Elegant Beauty"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This appears in the header and throughout the platform
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color *
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300"
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Preview:</strong>
                </p>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-24 h-24 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Primary
                  </div>
                  <div 
                    className="w-24 h-24 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: formData.secondaryColor }}
                  >
                    Secondary
                  </div>
                  <div 
                    className="w-24 h-24 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: formData.accentColor }}
                  >
                    Accent
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform Transaction Fee (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.platformFeePercentage}
                  onChange={(e) => handleInputChange('platformFeePercentage', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Percentage taken from each booking (default: 1%)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Subscription Fee (£)
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.monthlyFee}
                  onChange={(e) => handleInputChange('monthlyFee', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Fixed monthly fee charged to this partner (default: £200)
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-2">
                  <strong>Revenue Breakdown:</strong>
                </p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Monthly recurring: £{formData.monthlyFee}</li>
                  <li>• Per £100 booking: £{(parseFloat(formData.platformFeePercentage) || 0).toFixed(2)}</li>
                  <li>• Partner keeps: £{(100 - (parseFloat(formData.platformFeePercentage) || 0)).toFixed(2)} per booking</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Stripe subscription will be created automatically. You'll need to send the partner their setup link.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
                className="bg-glam-pink hover:bg-glam-pink/90 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !canProceedStep3}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create White-Label
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
