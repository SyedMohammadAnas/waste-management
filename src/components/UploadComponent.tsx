'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, MapPin, Upload, X, CheckCircle, AlertCircle, Info, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentLocation } from '@/utils/geolocation'
import { CreateWasteReport } from '@/lib/types'

interface UploadComponentProps {
  onUploadSuccess: () => void
}

/**
 * Component for uploading waste report photos with automatic location capture
 * Handles photo selection, location detection, and data submission to Supabase
 */
export default function UploadComponent({ onUploadSuccess }: UploadComponentProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Handles file selection and creates preview
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type (only images)
      if (!file.type.startsWith('image/')) {
        setUploadStatus('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setUploadStatus('')
    }
  }

  /**
   * Handles the complete upload process: location capture, photo upload, and data submission
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a photo first')
      return
    }

    setIsUploading(true)
    setUploadStatus('Getting your location...')

    try {
      // Step 1: Get current location
      const location = await getCurrentLocation()
      setUploadStatus('Uploading photo...')

      // Step 2: Upload photo to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('waste-photos')
        .upload(filePath, selectedFile)

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Step 3: Get public URL for the uploaded photo
      const { data: urlData } = supabase.storage
        .from('waste-photos')
        .getPublicUrl(filePath)

      setUploadStatus('Saving report...')

      // Step 4: Save report data to database
      const reportData: CreateWasteReport = {
        latitude: location.latitude,
        longitude: location.longitude,
        photo_url: urlData.publicUrl,
      }

      const { error: dbError } = await supabase
        .from('reports')
        .insert([reportData])

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }

      // Success! Clear form and notify parent
      setUploadStatus('Report submitted successfully!')
      setSelectedFile(null)
      setPreviewUrl('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Notify parent component to refresh data
      onUploadSuccess()

      // Clear success message after 3 seconds
      setTimeout(() => setUploadStatus(''), 3000)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Clears selected file and preview
   */
  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setUploadStatus('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <MapPin size={20} className="text-emerald-600" />
        Report Waste Issue
      </h3>

      {/* File input - mobile optimized */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment" /* Use rear camera on mobile */
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="photo-upload"
          className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl
                     text-center cursor-pointer hover:border-emerald-400 active:border-emerald-500
                     transition-colors touch-target select-none
                     focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-200"
        >
          {selectedFile ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <ImageIcon size={24} />
              <span className="font-medium truncate max-w-[200px]">{selectedFile.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <Camera size={32} />
              <span className="font-medium">Tap to take photo</span>
              <span className="text-xs text-gray-500">or select from gallery</span>
            </div>
          )}
        </label>
      </div>

      {/* Photo preview */}
      {previewUrl && (
        <div className="mb-4">
          <Image
            src={previewUrl}
            alt="Preview"
            width={400}
            height={128}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Action buttons - mobile optimized */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     hover:bg-emerald-700 active:bg-emerald-800
                     transition-all duration-200 touch-target select-none
                     shadow-lg disabled:shadow-none
                     focus:ring-2 focus:ring-emerald-300"
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Upload size={18} />
              <span>Submit Report</span>
            </div>
          )}
        </button>

        {selectedFile && (
          <button
            onClick={clearSelection}
            disabled={isUploading}
            className="px-4 py-3 text-gray-600 hover:text-gray-800 active:text-gray-900
                       hover:bg-gray-100 active:bg-gray-200 rounded-xl
                       transition-all duration-200 touch-target select-none
                       focus:ring-2 focus:ring-gray-300"
            aria-label="Clear selection"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Status message - mobile optimized */}
      {uploadStatus && (
        <div className={`text-sm p-3 rounded-xl font-medium border transition-all duration-200 ${
          uploadStatus.includes('success')
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : uploadStatus.includes('error') || uploadStatus.includes('failed')
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
                    <div className="flex items-center gap-2">
            {uploadStatus.includes('success') ? (
              <CheckCircle size={16} className="text-emerald-600" />
            ) : uploadStatus.includes('error') || uploadStatus.includes('failed') ? (
              <AlertCircle size={16} className="text-red-600" />
            ) : (
              <Info size={16} className="text-blue-600" />
            )}
            <span>{uploadStatus}</span>
          </div>
        </div>
      )}

      {/* Instructions - mobile optimized */}
      <div className="text-xs text-gray-500 mt-3 text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <MapPin size={14} className="text-emerald-600" />
          <span>Location access required</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <ImageIcon size={14} className="text-gray-500" />
          <span>Max 5MB image files</span>
        </div>
      </div>
    </div>
  )
}
