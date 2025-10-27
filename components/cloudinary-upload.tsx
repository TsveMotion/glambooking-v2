'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Loader2, Check } from 'lucide-react'

interface CloudinaryUploadProps {
  onUploadComplete: (url: string) => void
  currentImage?: string
  label: string
  accept?: string
  maxSize?: number
  aspectRatio?: string
}

export default function CloudinaryUpload({
  onUploadComplete,
  currentImage,
  label,
  accept = 'image/*',
  maxSize = 5, // MB
  aspectRatio
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    setUploading(true)
    setError('')
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      onUploadComplete(data.url)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 2000)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleUpload(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleRemove = () => {
    onUploadComplete('')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
          isDragging
            ? 'border-glam-pink bg-pink-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id={`upload-${label}`}
        />

        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-glam-pink animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : uploadSuccess ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <Check className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-green-600 font-medium">Upload successful!</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-glam-pink">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to {maxSize}MB
              </p>
              {aspectRatio && (
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: {aspectRatio}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Current Image Preview */}
      {currentImage && !uploading && (
        <div className="relative">
          <img
            src={currentImage}
            alt={label}
            className={`w-full rounded-lg border border-gray-200 ${
              aspectRatio === 'Logo' ? 'h-24 object-contain bg-white p-2' : 'h-48 object-cover'
            }`}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="14"%3EImage%3C/text%3E%3C/svg%3E'
            }}
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
