'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, Clock, User, Mail, Phone, X } from 'lucide-react'

interface Staff {
  id: string
  firstName: string
  lastName: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface NewBookingFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedDate?: Date
}

export function NewBookingForm({ isOpen, onClose, onSuccess, selectedDate }: NewBookingFormProps) {
  const [loading, setLoading] = useState(false)
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceId: '',
    staffId: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: '',
    notes: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchStaffAndServices()
      if (selectedDate) {
        setFormData(prev => ({
          ...prev,
          date: selectedDate.toISOString().split('T')[0]
        }))
      }
    }
  }, [isOpen, selectedDate])

  const fetchStaffAndServices = async () => {
    try {
      const [staffRes, servicesRes] = await Promise.all([
        fetch('/api/business/staff'),
        fetch('/api/business/services')
      ])

      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaff(staffData.staff || [])
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData.services || [])
      }
    } catch (error) {
      console.error('Error fetching staff and services:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedService = services.find(s => s.id === formData.serviceId)
      if (!selectedService) {
        throw new Error('Service not found')
      }

      const startDateTime = new Date(formData.date + 'T' + formData.startTime)
      const endDateTime = new Date(startDateTime)
      endDateTime.setMinutes(endDateTime.getMinutes() + selectedService.duration)

      const bookingData = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        serviceId: formData.serviceId,
        staffId: formData.staffId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        totalAmount: selectedService.price,
        notes: formData.notes
      }

      const response = await fetch('/api/business/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          serviceId: '',
          staffId: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          notes: ''
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-glam-charcoal">New Booking</CardTitle>
              <CardDescription>Create a new appointment</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-glam-charcoal flex items-center">
                <User className="w-5 h-5 mr-2" />
                Client Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clientName" className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    id="clientName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="clientEmail" className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    id="clientEmail"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="clientPhone" className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  id="clientPhone"
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glam-pink"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                />
              </div>
            </div>

            {/* Service & Staff */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-glam-charcoal">Service Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="service" className="block text-sm font-medium mb-1">Service *</label>
                  <select
                    id="service"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - £{service.price} ({service.duration}min)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="staff" className="block text-sm font-medium mb-1">Staff Member *</label>
                  <select
                    id="staff"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    required
                  >
                    <option value="">Select staff member</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-glam-charcoal flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Date & Time
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    id="date"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium mb-1">Start Time *</label>
                  <select
                    id="startTime"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glam-pink"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  >
                    <option value="">Select time</option>
                    {generateTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                id="notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glam-pink"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requirements or notes..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="glam-gradient text-white">
                {loading ? 'Creating...' : 'Create Booking'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
