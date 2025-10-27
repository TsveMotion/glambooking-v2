'use client'

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Upload, Palette, Type, Image, ExternalLink } from 'lucide-react'
import CloudinaryUpload from './cloudinary-upload'

interface CustomizationSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headingFont: string
  bodyFont: string
  logoUrl: string
  backgroundImageUrl: string
  businessName: string
  tagline: string
  headerText: string
  footerText: string
}

interface PageCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

// Using Inter as the single, readable font for consistency

export default function PageCustomizationModal({ 
  isOpen, 
  onClose, 
  onSaved 
}: PageCustomizationModalProps) {
  const [settings, setSettings] = useState<CustomizationSettings>({
    primaryColor: '#ec4899',
    secondaryColor: '#f59e0b',
    accentColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    logoUrl: '',
    backgroundImageUrl: '',
    businessName: 'GlamBooking',
    tagline: 'Book your beauty services',
    headerText: 'Choose Your Perfect Service',
    footerText: 'Book now and transform your look!'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'colors' | 'content' | 'fonts'>('colors')
  const [currentPlan, setCurrentPlan] = useState<string>('free')

  useEffect(() => {
    if (isOpen) {
      fetchSettings()
      fetchPlan()
    }
  }, [isOpen])

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/business/plan-status')
      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data.plan || 'free')
      }
    } catch (error) {
      console.error('Error fetching plan:', error)
    }
  }

  const hasProFeatures = () => {
    return currentPlan === 'professional' || currentPlan === 'enterprise'
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/business/customization')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings({ ...settings, ...data.settings })
        }
      }
    } catch (error) {
      console.error('Error fetching customization settings:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/business/customization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save customization')
      }

      onSaved()
      onClose()
    } catch (error) {
      console.error('Error saving customization:', error)
      setError(error instanceof Error ? error.message : 'Failed to save customization')
    } finally {
      setIsLoading(false)
    }
  }

  const handleColorChange = (key: keyof CustomizationSettings, value: string) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    // Broadcast changes to booking page in real-time
    broadcastCustomizationChange(newSettings)
  }

  const handleSettingChange = (key: keyof CustomizationSettings, value: string) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    // Broadcast changes to booking page in real-time
    broadcastCustomizationChange(newSettings)
  }

  const broadcastCustomizationChange = (newSettings: CustomizationSettings) => {
    // Store in localStorage for persistence
    localStorage.setItem('glambooking_preview_customization', JSON.stringify(newSettings))
    
    // Broadcast to other windows/tabs
    window.dispatchEvent(new CustomEvent('customizationChange', {
      detail: newSettings
    }))
    
    // Also use storage event for cross-tab communication
    localStorage.setItem('glambooking_customization_timestamp', Date.now().toString())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Customize Booking Page</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b px-6">
          {[
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'fonts', label: 'Fonts', icon: Type },
            { id: 'content', label: 'Content', icon: Image }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-glam-pink text-glam-pink'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Color Scheme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => handleColorChange('accentColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => handleColorChange('accentColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.textColor}
                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.textColor}
                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="mt-8 p-6 rounded-lg border-2 border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Preview</h4>
                <div 
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}
                >
                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{ color: settings.primaryColor }}
                  >
                    {settings.businessName}
                  </h3>
                  <p className="mb-4">{settings.tagline}</p>
                  <button 
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Book Now
                  </button>
                  <button 
                    className="ml-3 px-4 py-2 rounded-lg font-medium"
                    style={{ 
                      backgroundColor: settings.secondaryColor,
                      color: settings.backgroundColor 
                    }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Fonts Tab */}
          {activeTab === 'fonts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Typography</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading Font
                  </label>
                  <select
                    value={settings.headingFont}
                    onChange={(e) => handleSettingChange('headingFont', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                  >
                    <option value="Inter">Inter (Default - Clean & Modern)</option>
                    <option value="Playfair Display">Playfair Display (Elegant)</option>
                    <option value="Montserrat">Montserrat (Bold & Professional)</option>
                    <option value="Lora">Lora (Classic Serif)</option>
                    <option value="Poppins">Poppins (Friendly & Round)</option>
                    <option value="Raleway">Raleway (Sophisticated)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Font
                  </label>
                  <select
                    value={settings.bodyFont}
                    onChange={(e) => handleSettingChange('bodyFont', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                  >
                    <option value="Inter">Inter (Default - Clean & Readable)</option>
                    <option value="Open Sans">Open Sans (Friendly)</option>
                    <option value="Roboto">Roboto (Modern)</option>
                    <option value="Lato">Lato (Professional)</option>
                    <option value="Source Sans Pro">Source Sans Pro (Clean)</option>
                  </select>
                </div>

                {/* Font Preview */}
                <div className="mt-6 p-6 rounded-lg border-2 border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Font Preview</h4>
                  <div className="space-y-4">
                    <h2 
                      className="text-3xl font-bold"
                      style={{ fontFamily: settings.headingFont, color: settings.primaryColor }}
                    >
                      This is a Heading
                    </h2>
                    <p 
                      className="text-base"
                      style={{ fontFamily: settings.bodyFont, color: settings.textColor }}
                    >
                      This is body text. It should be easy to read and comfortable for your customers. 
                      The right font choice can make your booking page look more professional and trustworthy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Page Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => handleSettingChange('businessName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                    placeholder="Your Business Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => handleSettingChange('tagline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                    placeholder="Your business tagline"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Text
                  </label>
                  <input
                    type="text"
                    value={settings.headerText}
                    onChange={(e) => handleSettingChange('headerText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                    placeholder="Main heading on booking page"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Footer Text
                  </label>
                  <textarea
                    value={settings.footerText}
                    onChange={(e) => handleSettingChange('footerText', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glam-pink focus:border-transparent"
                    placeholder="Call-to-action or footer message"
                  />
                </div>

                {/* Logo Upload - Professional/Enterprise Only */}
                <div className={!hasProFeatures() ? 'opacity-50 pointer-events-none' : ''}>
                  <div className="flex items-center justify-between mb-2">
                    {!hasProFeatures() && (
                      <span className="text-xs text-purple-600 font-medium">Pro Feature</span>
                    )}
                  </div>
                  {hasProFeatures() ? (
                    <CloudinaryUpload
                      label="Logo"
                      currentImage={settings.logoUrl}
                      onUploadComplete={(url) => handleSettingChange('logoUrl', url)}
                      maxSize={5}
                      aspectRatio="Logo"
                    />
                  ) : (
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Logo Upload</p>
                      <p className="text-xs text-gray-500">
                        Upgrade to Professional or Enterprise to add your custom logo
                      </p>
                    </div>
                  )}
                </div>

                {/* Background Image - Professional/Enterprise Only */}
                <div className={!hasProFeatures() ? 'opacity-50 pointer-events-none' : ''}>
                  <div className="flex items-center justify-between mb-2">
                    {!hasProFeatures() && (
                      <span className="text-xs text-purple-600 font-medium">Pro Feature</span>
                    )}
                  </div>
                  {hasProFeatures() ? (
                    <CloudinaryUpload
                      label="Background Image"
                      currentImage={settings.backgroundImageUrl}
                      onUploadComplete={(url) => handleSettingChange('backgroundImageUrl', url)}
                      maxSize={5}
                      aspectRatio="16:9 or 1920x1080"
                    />
                  ) : (
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Background Image Upload</p>
                      <p className="text-xs text-gray-500">
                        Upgrade to Professional or Enterprise to add a custom background image
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              // Get current business ID from the services page
              fetch('/api/business/info')
                .then(res => res.json())
                .then(data => {
                  if (data.business?.id) {
                    window.open(`/book/${data.business.id}`, '_blank')
                  }
                })
                .catch(console.error)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Live Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-glam-pink text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
