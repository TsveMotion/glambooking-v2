'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  X, Building2, Mail, Phone, MapPin, Globe, Calendar, 
  DollarSign, Users, ShoppingBag, CheckCircle, XCircle,
  Edit, Trash2, Ban, CheckSquare
} from 'lucide-react'

interface BusinessDetailModalProps {
  business: any
  onClose: () => void
  onUpdate: (businessId: string, updates: any) => Promise<void>
  onDelete: (businessId: string) => Promise<void>
  onToggleActive: (businessId: string, isActive: boolean) => Promise<void>
}

export function BusinessDetailModal({ 
  business, 
  onClose, 
  onUpdate, 
  onDelete, 
  onToggleActive 
}: BusinessDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({
    name: business.name,
    description: business.description || '',
    email: business.email || '',
    phone: business.phone || '',
    address: business.address || '',
    website: business.website || '',
    bookingFeePercentage: business.bookingFeePercentage,
    plan: business.plan || 'free'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onUpdate(business.id, editedData)
      setIsEditing(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      setIsLoading(true)
      try {
        await onDelete(business.id)
        onClose()
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleToggleActive = async () => {
    setIsLoading(true)
    try {
      await onToggleActive(business.id, !business.isActive)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  business.isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'
                }`}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{business.name}</CardTitle>
                  <CardDescription>Business ID: {business.id.slice(0, 8)}...</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {business.isActive ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Inactive
                  </span>
                )}
                {business.isWhiteLabel && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                    White-Label
                  </span>
                )}
                {business.stripeOnboarded && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    Stripe Connected
                  </span>
                )}
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full capitalize">
                  {business.plan} Plan
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-medium">Services</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{business.serviceCount || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Staff</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{business.staffCount || 0}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Bookings</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{business.bookingCount || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">£{business.totalRevenue?.toFixed(0) || 0}</p>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                Business Information
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Business Name</label>
                  {isEditing ? (
                    <Input
                      value={editedData.name}
                      onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{business.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  {isEditing ? (
                    <Input
                      value={editedData.email}
                      onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {business.email || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  {isEditing ? (
                    <Input
                      value={editedData.phone}
                      onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {business.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Website</label>
                  {isEditing ? (
                    <Input
                      value={editedData.website}
                      onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      {business.website || 'Not provided'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  {isEditing ? (
                    <Input
                      value={editedData.address}
                      onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {business.address || 'Not provided'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  {isEditing ? (
                    <textarea
                      value={editedData.description}
                      onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border rounded-lg"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{business.description || 'No description'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Platform Fee (%)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editedData.bookingFeePercentage}
                      onChange={(e) => setEditedData({ ...editedData, bookingFeePercentage: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{business.bookingFeePercentage}%</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Subscription Plan</label>
                  {isEditing ? (
                    <select
                      value={editedData.plan}
                      onChange={(e) => setEditedData({ ...editedData, plan: e.target.value })}
                      className="mt-1 w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 mt-1 capitalize">{business.plan}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSave} disabled={isLoading}>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Owner Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{business.owner?.firstName} {business.owner?.lastName}</p>
                <p className="text-sm text-gray-600 mt-2">Email</p>
                <p className="font-medium">{business.owner?.email}</p>
                <p className="text-sm text-gray-600 mt-2">Created</p>
                <p className="font-medium">{new Date(business.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Whitelabel Association */}
            {business.whitelabelAssociation && (
              <div>
                <h3 className="text-lg font-semibold mb-4">White-Label Association</h3>
                <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
                  <p className="text-sm text-pink-700">Subdomain</p>
                  <p className="font-medium text-pink-900">{business.whitelabelAssociation.subdomain}</p>
                  <p className="text-sm text-pink-700 mt-2">Brand Name</p>
                  <p className="font-medium text-pink-900">{business.whitelabelAssociation.brandName}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="flex gap-3">
                <Button
                  variant={business.isActive ? 'destructive' : 'default'}
                  onClick={handleToggleActive}
                  disabled={isLoading}
                >
                  {business.isActive ? (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Deactivate Business
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate Business
                    </>
                  )}
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Business
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
