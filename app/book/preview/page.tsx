'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, DollarSign, User, Mail, Phone, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

export default function PreviewBookingPage() {
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

  useEffect(() => {
    fetchCustomization()
    fetchServices()
    fetchStaff()
  }, [])

  const fetchCustomization = async () => {
    try {
      const response = await fetch('/api/business/customization')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setCustomization({ ...customization, ...data.settings })
        }
      }
    } catch (error) {
      console.error('Error fetching customization:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/business/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services?.filter((s: Service) => s.isActive) || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/business/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data.staff?.filter((s: Staff) => s.isActive) || [])
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
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

    // This is just a preview, so we'll show a success message
    alert('This is a preview! In the live version, your booking would be confirmed.')
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
          <p style={{ color: customization.textColor }}>Loading services...</p>
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
          <div className="mb-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ 
                borderColor: customization.primaryColor,
                color: customization.primaryColor
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Services
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
            {customization.businessName}
          </h1>
          
          <p 
            className="text-xl mb-4"
            style={{ color: customization.textColor }}
          >
            {customization.tagline}
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
                    disabled={!selectedService || !selectedStaff || !selectedDate || !selectedTime || !clientInfo.name || !clientInfo.email}
                    className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: customization.primaryColor,
                      fontFamily: customization.headingFont
                    }}
                  >
                    Book Appointment (Preview Mode)
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
    </div>
  )
}
