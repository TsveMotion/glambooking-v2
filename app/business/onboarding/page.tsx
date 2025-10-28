'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Building, 
  Users,
  Scissors,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import { useWhitelabelTheme } from '@/hooks/use-whitelabel-theme'
import Image from 'next/image'

export default function BusinessOnboarding() {
  const { user } = useUser()
  const router = useRouter()
  const { theme, loading: themeLoading } = useWhitelabelTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [businessData, setBusinessData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    website: '',
    services: [
      { name: 'Hair Cut & Style', duration: 60, price: 45 },
      { name: 'Hair Color', duration: 120, price: 85 },
      { name: 'Facial Treatment', duration: 90, price: 80 }
    ],
    staff: [
      { name: user?.fullName || 'Owner', role: 'Owner', email: user?.emailAddresses[0]?.emailAddress || '' }
    ]
  })

  const handleInputChange = (field: string, value: string) => {
    setBusinessData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceChange = (index: number, field: string, value: string | number) => {
    const updatedServices = [...businessData.services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    setBusinessData(prev => ({ ...prev, services: updatedServices }))
  }

  const addService = () => {
    setBusinessData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', duration: 60, price: 0 }]
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // In a real app, save to database
      const response = await fetch('/api/business/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData)
      })
      
      if (response.ok) {
        router.push('/business/dashboard')
      }
    } catch (error) {
      console.error('Error creating business:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Business Details', icon: Building },
    { number: 2, title: 'Services', icon: Scissors },
    { number: 3, title: 'Team', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Success Banner */}
      <div 
        className="text-white py-3 px-4"
        style={{ 
          background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})` 
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Payment successful! Welcome to {theme.brandName}
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {theme.logoUrl ? (
              <div className="relative w-32 h-32">
                <Image 
                  src={theme.logoUrl} 
                  alt={theme.brandName || 'Logo'} 
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div 
                className="p-3 rounded-full"
                style={{ 
                  background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})` 
                }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Set Up Your Business
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto">
            Let's get your beauty business ready to accept bookings in just a few steps.
          </p>
        </div>

        {/* Progress Steps - Mobile Friendly */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              
              return (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isActive ? 'text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 
                      'bg-gray-200 text-gray-600'
                    }`}
                    style={isActive ? {
                      background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`
                    } : undefined}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span 
                    className={`text-xs sm:text-sm font-medium text-center ${
                      isCompleted ? 'text-green-600' : 
                      'text-gray-500'
                    }`}
                    style={isActive ? { color: theme.primaryColor } : undefined}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`absolute top-5 w-full h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} style={{ left: '50%', width: 'calc(100% / 3)' }} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
            <div 
              className="absolute top-5 left-0 h-0.5 transition-all duration-300"
              style={{ 
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-4 sm:p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-glam-charcoal mb-4">Business Information</h2>
                  <p className="text-gray-600 mb-6">Tell us about your business so clients can find and contact you.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Business Name *</label>
                    <input
                      type="text"
                      value={businessData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="e.g., Glamour Hair Studio"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Email Address *</label>
                    <input
                      type="email"
                      value={businessData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="business@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Phone Number</label>
                    <input
                      type="tel"
                      value={businessData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="+44 123 456 7890"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Website (Optional)</label>
                    <input
                      type="url"
                      value={businessData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Business Address</label>
                  <input
                    type="text"
                    value={businessData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="123 Beauty Street, London, SW1A 1AA"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Business Description</label>
                  <textarea
                    value={businessData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none transition-colors"
                    placeholder="Describe your business, specialties, and what makes you unique..."
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-glam-charcoal mb-4">Your Services</h2>
                  <p className="text-gray-600 mb-6">Add the services you offer. You can always modify these later.</p>
                </div>
                
                <div className="space-y-4">
                  {businessData.services.map((service, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Service Name</label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                          placeholder="e.g., Hair Cut & Style"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">Duration (min)</label>
                          <input
                            type="number"
                            value={service.duration}
                            onChange={(e) => handleServiceChange(index, 'duration', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                            placeholder="60"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-900">Price (£)</label>
                          <input
                            type="number"
                            value={service.price}
                            onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                            placeholder="45"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={addService} variant="outline" className="w-full border-dashed border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 py-3">
                    + Add Another Service
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-glam-charcoal mb-4">Your Team</h2>
                  <p className="text-gray-600 mb-6">You're automatically added as the owner. You can invite team members later.</p>
                </div>
                
                <div className="bg-glam-pink/5 border border-glam-pink/20 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-glam-pink rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-glam-charcoal">{user?.fullName || 'Business Owner'}</h3>
                      <p className="text-sm text-gray-600">{user?.emailAddresses[0]?.emailAddress}</p>
                      <span className="inline-block bg-glam-pink text-white text-xs px-2 py-1 rounded-full mt-1">Owner</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Ready to Launch!</h4>
                  <p className="text-sm text-blue-700">
                    Your business setup is complete. You can start accepting bookings right away and invite team members from your dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-8 border-t border-gray-200">
              {currentStep > 1 && (
                <Button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  variant="outline"
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={currentStep === 1 && !businessData.name}
                  className="text-white px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  style={{
                    background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`
                  }}
                >
                  Next Step
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="text-white px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  style={{
                    background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      Launch My Business
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
