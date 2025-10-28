'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  X, Crown, Mail, Globe, Calendar, DollarSign, Building2,
  CheckCircle, XCircle, Edit, Trash2, Ban, CheckSquare, Palette
} from 'lucide-react'

interface WhitelabelDetailModalProps {
  whitelabel: any
  onClose: () => void
  onUpdate: (whitelabelId: string, updates: any) => Promise<void>
  onDelete: (whitelabelId: string) => Promise<void>
  onToggleActive: (whitelabelId: string, isActive: boolean) => Promise<void>
}

export function WhitelabelDetailModal({ 
  whitelabel, 
  onClose, 
  onUpdate, 
  onDelete, 
  onToggleActive 
}: WhitelabelDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({
    brandName: whitelabel.brandName,
    subdomain: whitelabel.subdomain,
    logoUrl: whitelabel.logoUrl || '',
    faviconUrl: whitelabel.faviconUrl || '',
    primaryColor: whitelabel.primaryColor || '#E91E63',
    secondaryColor: whitelabel.secondaryColor || '#FFD700',
    accentColor: whitelabel.accentColor || '#333333',
    platformFeePercentage: whitelabel.platformFeePercentage,
    monthlyFee: whitelabel.monthlyFee
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onUpdate(whitelabel.id, editedData)
      setIsEditing(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this whitelabel? This will also delete the parent business. This action cannot be undone.')) {
      setIsLoading(true)
      try {
        await onDelete(whitelabel.id)
        onClose()
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleToggleActive = async () => {
    setIsLoading(true)
    try {
      await onToggleActive(whitelabel.id, !whitelabel.isActive)
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
                  whitelabel.isActive ? 'bg-gradient-to-r from-pink-600 to-purple-600' : 'bg-gray-300'
                }`}>
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{whitelabel.brandName}</CardTitle>
                  <CardDescription>{whitelabel.subdomain}.glambooking.co.uk</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {whitelabel.isActive ? (
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
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-medium">Businesses</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{whitelabel.totalBookings || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Monthly Fee</span>
              </div>
              <p className="text-2xl font-bold text-green-900">£{whitelabel.monthlyFee || 0}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Platform Fee</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{whitelabel.platformFeePercentage || 0}%</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">£{whitelabel.monthlyRevenue?.toFixed(0) || 0}</p>
            </div>
          </div>

          {/* Whitelabel Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                Whitelabel Configuration
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Brand Name</label>
                  {isEditing ? (
                    <Input
                      value={editedData.brandName}
                      onChange={(e) => setEditedData({ ...editedData, brandName: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{whitelabel.brandName}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Subdomain</label>
                  {isEditing ? (
                    <Input
                      value={editedData.subdomain}
                      onChange={(e) => setEditedData({ ...editedData, subdomain: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{whitelabel.subdomain}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Logo URL</label>
                  {isEditing ? (
                    <Input
                      value={editedData.logoUrl}
                      onChange={(e) => setEditedData({ ...editedData, logoUrl: e.target.value })}
                      className="mt-1"
                      placeholder="https://..."
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      {whitelabel.logoUrl || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Favicon URL</label>
                  {isEditing ? (
                    <Input
                      value={editedData.faviconUrl}
                      onChange={(e) => setEditedData({ ...editedData, faviconUrl: e.target.value })}
                      className="mt-1"
                      placeholder="https://..."
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      {whitelabel.faviconUrl || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Monthly Fee (£)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editedData.monthlyFee}
                      onChange={(e) => setEditedData({ ...editedData, monthlyFee: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">£{whitelabel.monthlyFee}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Platform Fee (%)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editedData.platformFeePercentage}
                      onChange={(e) => setEditedData({ ...editedData, platformFeePercentage: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{whitelabel.platformFeePercentage}%</p>
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

            {/* Theme Configuration */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Primary Color</label>
                  {isEditing ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={editedData.primaryColor}
                        onChange={(e) => setEditedData({ ...editedData, primaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={editedData.primaryColor}
                        onChange={(e) => setEditedData({ ...editedData, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded border" style={{ backgroundColor: whitelabel.primaryColor }} />
                      <p className="text-gray-900">{whitelabel.primaryColor}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Secondary Color</label>
                  {isEditing ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={editedData.secondaryColor}
                        onChange={(e) => setEditedData({ ...editedData, secondaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={editedData.secondaryColor}
                        onChange={(e) => setEditedData({ ...editedData, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded border" style={{ backgroundColor: whitelabel.secondaryColor }} />
                      <p className="text-gray-900">{whitelabel.secondaryColor}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Accent Color</label>
                  {isEditing ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={editedData.accentColor}
                        onChange={(e) => setEditedData({ ...editedData, accentColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={editedData.accentColor}
                        onChange={(e) => setEditedData({ ...editedData, accentColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded border" style={{ backgroundColor: whitelabel.accentColor }} />
                      <p className="text-gray-900">{whitelabel.accentColor}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{whitelabel.ownerName}</p>
                <p className="text-sm text-gray-600 mt-2">Email</p>
                <p className="font-medium">{whitelabel.ownerEmail}</p>
                <p className="text-sm text-gray-600 mt-2">Created</p>
                <p className="font-medium">{new Date(whitelabel.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="flex gap-3">
                <Button
                  variant={whitelabel.isActive ? 'destructive' : 'default'}
                  onClick={handleToggleActive}
                  disabled={isLoading}
                >
                  {whitelabel.isActive ? (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Deactivate Whitelabel
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate Whitelabel
                    </>
                  )}
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Whitelabel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
