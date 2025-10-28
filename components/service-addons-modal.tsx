'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit, Trash2, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ServiceAddon {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  isActive: boolean
}

interface ServiceAddonsModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: string
  serviceName: string
}

export default function ServiceAddonsModal({
  isOpen,
  onClose,
  serviceId,
  serviceName
}: ServiceAddonsModalProps) {
  const [addons, setAddons] = useState<ServiceAddon[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '0'
  })

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchAddons()
    }
  }, [isOpen, serviceId])

  const fetchAddons = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/business/services/${serviceId}/addons`)
      if (response.ok) {
        const data = await response.json()
        setAddons(data.addons || [])
      }
    } catch (error) {
      console.error('Error fetching addons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddon = async () => {
    if (!formData.name || !formData.price) {
      alert('Name and price are required')
      return
    }

    try {
      const response = await fetch(`/api/business/services/${serviceId}/addons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', description: '', price: '', duration: '0' })
        setShowAddForm(false)
        fetchAddons()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create addon')
      }
    } catch (error) {
      alert('Failed to create addon')
    }
  }

  const handleUpdateAddon = async (addonId: string, updates: Partial<ServiceAddon>) => {
    try {
      const response = await fetch(`/api/business/services/addons/${addonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        setEditingId(null)
        fetchAddons()
      } else {
        alert('Failed to update addon')
      }
    } catch (error) {
      alert('Failed to update addon')
    }
  }

  const handleDeleteAddon = async (addonId: string) => {
    if (!confirm('Are you sure you want to delete this addon?')) return

    try {
      const response = await fetch(`/api/business/services/addons/${addonId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAddons()
      } else {
        alert('Failed to delete addon')
      }
    } catch (error) {
      alert('Failed to delete addon')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Service Add-ons</h2>
            <p className="text-sm text-gray-600">{serviceName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-glam-pink" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add New Form */}
              {showAddForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">Add New Add-on</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Hair Treatment"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (£) *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="Any price"
                      />
                      <p className="text-xs text-gray-500 mt-1">No minimum price for add-ons</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extra Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="15"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddAddon} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Add-on
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddForm(false)
                        setFormData({ name: '', description: '', price: '', duration: '0' })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Add Button */}
              {!showAddForm && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="w-full bg-glam-pink hover:bg-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Add-on
                </Button>
              )}

              {/* Addons List */}
              {addons.length === 0 && !showAddForm ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No add-ons yet. Create your first add-on to offer extras with this service.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addons.map((addon) => (
                    <div
                      key={addon.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-glam-pink transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                            <span className="text-lg font-bold text-glam-pink">
                              £{Number(addon.price).toFixed(2)}
                            </span>
                            {addon.duration > 0 && (
                              <span className="text-sm text-gray-500">
                                +{addon.duration} min
                              </span>
                            )}
                          </div>
                          {addon.description && (
                            <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleUpdateAddon(addon.id, { isActive: !addon.isActive })}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              addon.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {addon.isActive ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            onClick={() => handleDeleteAddon(addon.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
