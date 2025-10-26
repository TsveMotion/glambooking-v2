'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, DollarSign, User, Mail, Phone, ArrowLeft, Share2, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CustomizationSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headingFont: string
  bodyFont: string
  logoUrl: string
  businessName: string
  tagline: string
  headerText: string
  footerText: string
}

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  isActive: boolean
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  imageUrl: string
  isActive: boolean
}

interface Business {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  imageUrl: string
  customization: CustomizationSettings | null
}

export default function PublicBookingPage() {
  const params = useParams()
  const businessId = params.businessId as string
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [customization, setCustomization] = useState<CustomizationSettings>({
    primaryColor: '#ec4899',
    secondaryColor: '#f59e0b',
    accentColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    logoUrl: '',
    businessName: 'GlamBooking',
    tagline: 'Book your beauty services',
    headerText: 'Choose Your Perfect Service',
    footerText: 'Book now and transform your look!'
  })
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    if (businessId) {
      fetchBusinessData()
    }
  }, [businessId])

  // Listen for real-time customization changes
  useEffect(() => {
    const handleCustomizationChange = (event: any) => {
      if (event.detail) {
        setCustomization(event.detail)
        setIsPreviewMode(true)
      }
    }

    const handleStorageChange = () => {
      const previewCustomization = localStorage.getItem('glambooking_preview_customization')
      if (previewCustomization) {
        try {
          const parsedCustomization = JSON.parse(previewCustomization)
          setCustomization((prev: CustomizationSettings) => ({ ...prev, ...parsedCustomization }))
          setIsPreviewMode(true)
        } catch (error) {
          console.error('Error parsing preview customization:', error)
        }
      }
    }

    // Listen for custom events (same window)
    window.addEventListener('customizationChange', handleCustomizationChange)
    
    // Listen for storage changes (cross-tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'glambooking_customization_timestamp') {
        handleStorageChange()
      }
    })

    // Check for existing preview customization on load
    handleStorageChange()

    return () => {
      window.removeEventListener('customizationChange', handleCustomizationChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const fetchBusinessData = async () => {
    try {
      setLoading(true)
      
      // Fetch business info and customization
      const businessResponse = await fetch(`/api/public/business/${businessId}`)
      if (!businessResponse.ok) {
        throw new Error('Business not found')
      }
      const businessData = await businessResponse.json()
      setBusiness(businessData.business)
      
      if (businessData.business.customization) {
        setCustomization({ ...customization, ...businessData.business.customization })
      }

      // Fetch services
      const servicesResponse = await fetch(`/api/public/business/${businessId}/services`)
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData.services?.filter((s: Service) => s.isActive) || [])
      }

      // Fetch staff
      const staffResponse = await fetch(`/api/public/business/${businessId}/staff`)
      if (staffResponse.ok) {
        const staffData = await staffResponse.json()
        setStaff(staffData.staff?.filter((s: Staff) => s.isActive) || [])
      }
    } catch (error) {
      console.error('Error fetching business data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const handleBooking = async () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime || !clientInfo.name || !clientInfo.email) {
      alert('Please fill in all required fields')
      return
    }

    setIsProcessingPayment(true)

    try {
      // Create booking and payment intent
      const response = await fetch('/api/public/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          serviceId: selectedService.id,
          staffId: selectedStaff.id,
          date: selectedDate,
          time: selectedTime,
          clientInfo,
          totalAmount: selectedService.price
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const { clientSecret, bookingId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: clientSecret
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error processing booking:', error)
      alert('Failed to process booking. Please try again.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const shareBookingPage = () => {
    setShowShareModal(true)
  }

  const copyBookingLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: customization.backgroundColor }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: customization.primaryColor }}
          ></div>
          <p style={{ color: customization.textColor }}>Loading booking page...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: customization.backgroundColor }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: customization.textColor }}>
            Business Not Found
          </h1>
          <p style={{ color: customization.textColor }}>
            The booking page you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ 
        backgroundColor: customization.backgroundColor,
        fontFamily: customization.bodyFont
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Preview Mode Indicator */}
          {isPreviewMode && (
            <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p className="text-blue-800 text-sm font-medium">
                🎨 <strong>Preview Mode:</strong> You're seeing real-time customization changes! 
                <button
                  onClick={() => {
                    localStorage.removeItem('glambooking_preview_customization')
                    setIsPreviewMode(false)
                    window.location.reload()
                  }}
                  className="ml-2 underline hover:no-underline"
                >
                  Exit Preview
                </button>
              </p>
            </div>
          )}
          
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ 
                borderColor: customization.primaryColor,
                color: customization.primaryColor
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <button
              onClick={shareBookingPage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ 
                borderColor: customization.secondaryColor,
                color: customization.secondaryColor
              }}
            >
              <Share2 className="w-4 h-4" />
              Share Page
            </button>
          </div>
          
          {customization.logoUrl && (
            <img 
              src={customization.logoUrl} 
              alt="Logo" 
              className="h-16 mx-auto mb-4 object-contain"
            />
          )}
          
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ 
              color: customization.primaryColor,
              fontFamily: customization.headingFont
            }}
          >
            {business.name}
          </h1>
          
          <p 
            className="text-xl mb-4"
            style={{ color: customization.textColor }}
          >
            {business.description || customization.tagline}
          </p>
          
          <h2 
            className="text-2xl font-semibold"
            style={{ 
              color: customization.textColor,
              fontFamily: customization.headingFont
            }}
          >
            {customization.headerText}
          </h2>
          
          <div 
            className="w-24 h-1 mx-auto mt-4 rounded"
            style={{ backgroundColor: customization.secondaryColor }}
          ></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Services Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle 
                className="flex items-center gap-2"
                style={{ 
                  color: customization.textColor,
                  fontFamily: customization.headingFont
                }}
              >
                <Calendar className="w-5 h-5" />
                Select Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedService?.id === service.id
                        ? 'shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: selectedService?.id === service.id 
                        ? customization.primaryColor 
                        : undefined,
                      backgroundColor: selectedService?.id === service.id 
                        ? `${customization.primaryColor}10` 
                        : undefined
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 
                          className="font-semibold text-lg"
                          style={{ color: customization.textColor }}
                        >
                          {service.name}
                        </h3>
                        {service.description && (
                          <p 
                            className="text-sm mt-1 opacity-80"
                            style={{ color: customization.textColor }}
                          >
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm opacity-70">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration} min
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            £{service.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle 
                className="flex items-center gap-2"
                style={{ 
                  color: customization.textColor,
                  fontFamily: customization.headingFont
                }}
              >
                <User className="w-5 h-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Staff Selection */}
              {selectedService && (
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: customization.textColor }}
                  >
                    Select Staff Member
                  </label>
                  <div className="space-y-2">
                    {staff.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedStaff(member)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedStaff?.id === member.id
                            ? 'shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          borderColor: selectedStaff?.id === member.id 
                            ? customization.primaryColor 
                            : undefined,
                          backgroundColor: selectedStaff?.id === member.id 
                            ? `${customization.primaryColor}10` 
                            : undefined
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {member.imageUrl && (
                            <img 
                              src={member.imageUrl} 
                              alt={`${member.firstName} ${member.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p 
                              className="font-medium"
                              style={{ color: customization.textColor }}
                            >
                              {member.firstName} {member.lastName}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Selection */}
              {selectedStaff && (
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: customization.textColor }}
                  >
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ 
                      color: customization.textColor
                    }}
                  />
                </div>
              )}

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: customization.textColor }}
                  >
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {generateTimeSlots().map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          selectedTime === time
                            ? 'text-white shadow-md'
                            : 'hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: selectedTime === time 
                            ? customization.primaryColor 
                            : 'transparent',
                          borderColor: selectedTime === time 
                            ? customization.primaryColor 
                            : '#d1d5db',
                          color: selectedTime === time 
                            ? 'white' 
                            : customization.textColor
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Information */}
              {selectedTime && (
                <div className="space-y-4">
                  <h3 
                    className="font-medium"
                    style={{ 
                      color: customization.textColor,
                      fontFamily: customization.headingFont
                    }}
                  >
                    Your Information
                  </h3>
                  
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: customization.textColor }}
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="Enter your full name"
                      style={{ color: customization.textColor }}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: customization.textColor }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="Enter your email"
                      style={{ color: customization.textColor }}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: customization.textColor }}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      placeholder="Enter your phone number"
                      style={{ color: customization.textColor }}
                    />
                  </div>

                  {/* Booking Summary */}
                  {selectedService && selectedStaff && selectedDate && selectedTime && (
                    <div 
                      className="p-4 rounded-lg border-2"
                      style={{ 
                        borderColor: customization.accentColor,
                        backgroundColor: `${customization.accentColor}10`
                      }}
                    >
                      <h4 
                        className="font-semibold mb-2"
                        style={{ 
                          color: customization.textColor,
                          fontFamily: customization.headingFont
                        }}
                      >
                        Booking Summary
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p style={{ color: customization.textColor }}>
                          <strong>Service:</strong> {selectedService.name}
                        </p>
                        <p style={{ color: customization.textColor }}>
                          <strong>Staff:</strong> {selectedStaff.firstName} {selectedStaff.lastName}
                        </p>
                        <p style={{ color: customization.textColor }}>
                          <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}
                        </p>
                        <p style={{ color: customization.textColor }}>
                          <strong>Time:</strong> {selectedTime}
                        </p>
                        <p style={{ color: customization.textColor }}>
                          <strong>Duration:</strong> {selectedService.duration} minutes
                        </p>
                        <p 
                          className="text-lg font-bold mt-2"
                          style={{ color: customization.primaryColor }}
                        >
                          Total: £{selectedService.price}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={!selectedService || !selectedStaff || !selectedDate || !selectedTime || !clientInfo.name || !clientInfo.email || isProcessingPayment}
                    className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: customization.primaryColor,
                      fontFamily: customization.headingFont
                    }}
                  >
                    {isProcessingPayment ? 'Processing...' : 'Book & Pay Now'}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p 
            className="text-lg font-medium"
            style={{ 
              color: customization.primaryColor,
              fontFamily: customization.headingFont
            }}
          >
            {customization.footerText}
          </p>
          <div 
            className="w-16 h-1 mx-auto mt-2 rounded"
            style={{ backgroundColor: customization.secondaryColor }}
          ></div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Share Booking Page</h3>
              <p className="text-gray-600 mb-4">
                Share this link with your customers so they can book directly:
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={copyBookingLink}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
