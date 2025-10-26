'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, MapPin, Phone, Mail, Star, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Service {
  id: string
  name: string
  duration: number
  price: number
  description?: string
  category?: string
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  role: string
}

interface Business {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  website?: string
  imageUrl?: string
  services: Service[]
  staff: Staff[]
}

export default function BookingPage() {
  const params = useParams()
  const businessId = params.businessId as string
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientInfo, setClientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  // Fetch real business data from API
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/business/${businessId}`)
        
        if (!response.ok) {
          throw new Error('Business not found')
        }
        
        const businessData = await response.json()
        setBusiness(businessData)
        setError(null)
      } catch (error) {
        console.error('Error fetching business:', error)
        setError('Business not found or unavailable')
      } finally {
        setIsLoading(false)
      }
    }

    if (businessId) {
      fetchBusinessData()
    }
  }, [businessId])

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
      }
    }

    const handleStorageChange = () => {
      const previewCustomization = localStorage.getItem('glambooking_preview_customization')
      if (previewCustomization) {
        try {
          const parsedCustomization = JSON.parse(previewCustomization)
          setCustomization(prev => ({ ...prev, ...parsedCustomization }))
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

  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-GB', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      })
    }
    return dates
  }

  const handleBooking = async () => {
    setIsLoading(true)
    
    try {
      // Create Stripe checkout session for booking payment
      const response = await fetch('/api/bookings/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          serviceId: selectedService?.id,
          staffId: selectedStaff?.id,
          date: selectedDate,
          time: selectedTime,
          clientInfo,
          serviceName: selectedService?.name,
          servicePrice: selectedService?.price
        })
      })
      
      if (response.ok) {
        const { url } = await response.json()
        // Redirect to Stripe checkout
        window.location.href = url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Error processing payment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glam-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-glam-charcoal mb-4">Business Not Found</h1>
          <p className="text-gray-600">{error || "The booking page you're looking for doesn't exist."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-white via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-glam-charcoal mb-4">
            Book with {business.name}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            {business.description}
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {business.address}
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              {business.phone}
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {business.email}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-glam-pink text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-8 h-0.5 ${
                    currentStep > step ? 'bg-glam-pink' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                {/* Step 1: Select Service */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-glam-charcoal mb-4">Select a Service</h2>
                      <p className="text-gray-600 mb-6">Choose the service you'd like to book.</p>
                    </div>
                    
                    <div className="grid gap-4">
                      {business.services.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedService?.id === service.id
                              ? 'border-glam-pink bg-glam-pink/5'
                              : 'border-gray-200 hover:border-glam-pink/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-glam-charcoal">{service.name}</h3>
                                {service.category && (
                                  <span className="text-xs bg-glam-pink/10 text-glam-pink px-2 py-1 rounded-full">
                                    {service.category}
                                  </span>
                                )}
                              </div>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {service.duration} min
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold text-glam-charcoal">£{service.price}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Select Staff */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-glam-charcoal mb-4">Choose Your Stylist</h2>
                      <p className="text-gray-600 mb-6">Select who you'd like to provide your service.</p>
                    </div>
                    
                    <div className="grid gap-4">
                      {business.staff.map((staff) => (
                        <div
                          key={staff.id}
                          onClick={() => setSelectedStaff(staff)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedStaff?.id === staff.id
                              ? 'border-glam-pink bg-glam-pink/5'
                              : 'border-gray-200 hover:border-glam-pink/50'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-glam-pink rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {staff.firstName[0]}{staff.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-glam-charcoal">
                                {staff.firstName} {staff.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">{staff.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Select Date & Time */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-glam-charcoal mb-4">Pick Date & Time</h2>
                      <p className="text-gray-600 mb-6">Choose when you'd like your appointment.</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-glam-charcoal mb-3">Select Date</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {generateDates().map((date) => (
                            <button
                              key={date.value}
                              onClick={() => setSelectedDate(date.value)}
                              className={`p-3 text-sm border-2 rounded-lg transition-all ${
                                selectedDate === date.value
                                  ? 'border-glam-pink bg-glam-pink text-white'
                                  : 'border-gray-200 hover:border-glam-pink/50'
                              }`}
                            >
                              {date.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {selectedDate && (
                        <div>
                          <h3 className="font-semibold text-glam-charcoal mb-3">Select Time</h3>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {generateTimeSlots().map((time) => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`p-2 text-sm border-2 rounded-lg transition-all ${
                                  selectedTime === time
                                    ? 'border-glam-pink bg-glam-pink text-white'
                                    : 'border-gray-200 hover:border-glam-pink/50'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Client Information */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-glam-charcoal mb-4">Your Information</h2>
                      <p className="text-gray-600 mb-6">Please provide your contact details.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-glam-charcoal">First Name *</label>
                        <input
                          type="text"
                          value={clientInfo.firstName}
                          onChange={(e) => setClientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-glam-pink focus:outline-none"
                          placeholder="John"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-glam-charcoal">Last Name *</label>
                        <input
                          type="text"
                          value={clientInfo.lastName}
                          onChange={(e) => setClientInfo(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-glam-pink focus:outline-none"
                          placeholder="Doe"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-glam-charcoal">Email Address *</label>
                        <input
                          type="email"
                          value={clientInfo.email}
                          onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-glam-pink focus:outline-none"
                          placeholder="john@example.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-glam-charcoal">Phone Number *</label>
                        <input
                          type="tel"
                          value={clientInfo.phone}
                          onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-glam-pink focus:outline-none"
                          placeholder="+44 123 456 7890"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Success */}
                {currentStep === 5 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-glam-charcoal mb-4">Booking Confirmed!</h2>
                      <p className="text-gray-600 mb-6">
                        Your appointment has been successfully booked. You'll receive a confirmation email shortly.
                      </p>
                    </div>
                    
                    <div className="bg-glam-pink/5 border border-glam-pink/20 rounded-lg p-6">
                      <h3 className="font-semibold text-glam-charcoal mb-4">Appointment Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span className="font-medium">{selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stylist:</span>
                          <span className="font-medium">{selectedStaff?.firstName} {selectedStaff?.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Total:</span>
                          <span className="font-bold text-glam-charcoal">£{selectedService?.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                {currentStep < 5 && (
                  <div className="flex justify-between pt-8 border-t border-gray-200">
                    <Button
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      variant="outline"
                      disabled={currentStep === 1}
                      className="px-6"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (currentStep === 4) {
                          handleBooking()
                        } else {
                          setCurrentStep(currentStep + 1)
                        }
                      }}
                      disabled={
                        (currentStep === 1 && !selectedService) ||
                        (currentStep === 2 && !selectedStaff) ||
                        (currentStep === 3 && (!selectedDate || !selectedTime)) ||
                        (currentStep === 4 && (!clientInfo.firstName || !clientInfo.lastName || !clientInfo.email || !clientInfo.phone)) ||
                        isLoading
                      }
                      className="glam-gradient text-white px-6"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : currentStep === 4 ? (
                        'Pay & Confirm Booking'
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl sticky top-8">
              <CardHeader>
                <CardTitle className="text-glam-charcoal">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService && (
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-glam-charcoal">{selectedService.name}</h4>
                    <p className="text-sm text-gray-600">{selectedService.duration} minutes</p>
                    <p className="text-lg font-bold text-glam-charcoal">£{selectedService.price}</p>
                  </div>
                )}
                
                {selectedStaff && (
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-glam-charcoal">Stylist</h4>
                    <p className="text-sm text-gray-600">{selectedStaff.firstName} {selectedStaff.lastName}</p>
                    <p className="text-xs text-gray-500">{selectedStaff.role}</p>
                  </div>
                )}
                
                {selectedDate && selectedTime && (
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-glam-charcoal">Date & Time</h4>
                    <p className="text-sm text-gray-600">{new Date(selectedDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{selectedTime}</p>
                  </div>
                )}
                
                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-glam-charcoal">Total</span>
                    <span className="text-xl font-bold text-glam-charcoal">
                      £{selectedService?.price || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
