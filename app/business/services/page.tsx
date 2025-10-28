'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Settings, Users, Clock, DollarSign, TrendingUp, ExternalLink, Palette, Share2, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ServiceFormModal from '@/components/service-form-modal'
import PageCustomizationModal from '@/components/page-customization-modal'
import ServiceAddonsModal from '@/components/service-addons-modal'
import { BusinessPlanBanner } from '@/components/business-plan-banner'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    bookings: number
  }
  totalRevenue: number
  completedBookings: number
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [businessPlan, setBusinessPlan] = useState<string>('free')
  const [platformFee, setPlatformFee] = useState<number>(5)
  const [showAddonsModal, setShowAddonsModal] = useState(false)
  const [selectedServiceForAddons, setSelectedServiceForAddons] = useState<Service | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [services, searchTerm, categoryFilter, statusFilter])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/business/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
      
      // Also fetch business info to get the business ID
      const businessResponse = await fetch('/api/business/info')
      if (businessResponse.ok) {
        const businessData = await businessResponse.json()
        setBusinessId(businessData.business?.id || null)
        setBusinessPlan(businessData.business?.plan || 'free')
        setPlatformFee(businessData.business?.bookingFeePercentage || 5)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = services

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => 
        statusFilter === 'active' ? service.isActive : !service.isActive
      )
    }

    setFilteredServices(filtered)
  }

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/business/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error('Error updating service status:', error)
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/business/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Service deleted successfully')
        fetchServices()
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const handleServiceSaved = () => {
    fetchServices()
    setShowAddModal(false)
    setSelectedService(null)
  }

  const copyBookingLink = async () => {
    if (!businessId) return
    
    const url = `${window.location.origin}/book/${businessId}`
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

  const categories = Array.from(new Set(services.map(service => service.category)))
  const totalServices = services.length
  const activeServices = services.filter(s => s.isActive).length
  const totalBookings = services.reduce((sum, service) => sum + service._count.bookings, 0)
  const totalRevenue = services.reduce((sum, service) => sum + (service.totalRevenue || 0), 0)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage your business services and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => businessId && window.open(`/book/${businessId}`, '_blank')}
            disabled={!businessId}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink className="w-4 h-4" />
            Preview Page
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            disabled={!businessId}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
          <button
            onClick={() => setShowCustomizeModal(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Customize
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-glam-pink text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </div>

      {/* Platform Fee Banner - Only for Free Plan */}
      <BusinessPlanBanner plan={businessPlan} platformFee={platformFee} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-gray-900">{activeServices}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">£{totalRevenue.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-white mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Services ({filteredServices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500 mb-4">
                {services.length === 0 
                  ? "Get started by adding your first service"
                  : "Try adjusting your search or filters"
                }
              </p>
              {services.length === 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-glam-pink text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Add Your First Service
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          service.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {service.category}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          £{service.price}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {service._count.bookings} bookings
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          £{service.totalRevenue?.toFixed(0) || 0} revenue
                        </div>
                      </div>
                      {(businessPlan === 'professional' || businessPlan === 'enterprise') && (
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              setSelectedServiceForAddons(service)
                              setShowAddonsModal(true)
                            }}
                            className="text-sm text-glam-pink hover:text-pink-600 font-medium flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Manage Add-ons
                          </button>
                        </div>
                      )}
                      {(businessPlan === 'free' || businessPlan === 'starter') && (
                        <div className="mt-3">
                          <a 
                            href="/business/pricing"
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                          >
                            🔒 Add-ons available on Professional plan • Upgrade
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit service"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleServiceStatus(service.id, service.isActive)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={service.isActive ? 'Deactivate service' : 'Activate service'}
                      >
                        {service.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Form Modal */}
      <ServiceFormModal
        isOpen={showAddModal || selectedService !== null}
        onClose={() => {
          setShowAddModal(false)
          setSelectedService(null)
        }}
        onServiceSaved={handleServiceSaved}
        service={selectedService}
      />

      {/* Page Customization Modal */}
      <PageCustomizationModal
        isOpen={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        onSaved={() => {
          setShowCustomizeModal(false)
          // Optionally refresh data or show success message
        }}
      />

      {/* Service Addons Modal */}
      {selectedServiceForAddons && (
        <ServiceAddonsModal
          isOpen={showAddonsModal}
          onClose={() => {
            setShowAddonsModal(false)
            setSelectedServiceForAddons(null)
          }}
          serviceId={selectedServiceForAddons.id}
          serviceName={selectedServiceForAddons.name}
        />
      )}

      {/* Share Modal */}
      {showShareModal && businessId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Share Your Booking Page</h3>
              <p className="text-gray-600 mb-4">
                Share this link with your customers so they can book your services directly:
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={`${window.location.origin}/book/${businessId}`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={copyBookingLink}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> You can customize the look and feel of your booking page using the "Customize" button above!
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => businessId && window.open(`/book/${businessId}`, '_blank')}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Open Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
