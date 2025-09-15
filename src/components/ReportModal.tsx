'use client'

import Image from 'next/image'
import { Clock, MapPin, Hash, Map, X, FileText } from 'lucide-react'
import { WasteReport } from '@/lib/types'

interface ReportModalProps {
  report: WasteReport | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal component for displaying detailed waste report information
 * Shows full-size photo, location coordinates, and timestamp
 */
export default function ReportModal({ report, isOpen, onClose }: ReportModalProps) {
  if (!isOpen || !report) return null

  /**
   * Formats timestamp for display
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  /**
   * Formats coordinates for display with proper precision
   */
  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  /**
   * Opens Google Maps with the report location
   */
  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`
    window.open(url, '_blank')
  }

  /**
   * Handles modal backdrop click to close
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full
                      max-h-[85vh] sm:max-h-[90vh] overflow-hidden shadow-2xl
                      animate-slideUp sm:animate-none border-t-4 border-emerald-500">
        {/* Modal header - mobile optimized */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50">
                     <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
             <FileText size={20} className="text-emerald-600" />
             Report Details
           </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 active:text-gray-900
                       text-2xl leading-none touch-target select-none
                       w-10 h-10 flex items-center justify-center rounded-full
                       hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
            aria-label="Close modal"
                       >
               <X size={20} />
             </button>
        </div>

        {/* Modal content - mobile optimized */}
        <div className="p-4 sm:p-6 overflow-y-auto smooth-scroll modal-content">
          {/* Photo display - mobile optimized */}
          <div className="mb-6">
            <Image
              src={report.photo_url}
              alt="Waste report photo"
              width={800}
              height={256}
              className="w-full h-48 sm:h-64 object-cover rounded-xl shadow-lg border border-gray-200"
              onError={(e) => {
                // Handle broken image
                const target = e.target as HTMLImageElement
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg=='
              }}
            />
          </div>

          {/* Report information - mobile optimized */}
          <div className="space-y-5">
            {/* Timestamp */}
                         <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
               <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                 <Clock size={20} />
               </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-sm">Reported On</h3>
                <p className="text-gray-600 text-sm">{formatTimestamp(report.created_at)}</p>
              </div>
            </div>

            {/* Location */}
                         <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
               <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                 <MapPin size={20} />
               </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-sm">Location</h3>
                <p className="text-gray-600 font-mono text-xs break-all">
                  {formatCoordinates(report.latitude, report.longitude)}
                </p>
              </div>
            </div>

            {/* Report ID */}
                         <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
               <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                 <Hash size={20} />
               </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-sm">Report ID</h3>
                <p className="text-gray-600 font-mono text-xs break-all">{report.id}</p>
              </div>
            </div>
          </div>

          {/* Action buttons - mobile optimized */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={openInMaps}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold
                         hover:bg-blue-700 active:bg-blue-800 transition-all duration-200
                         flex items-center justify-center gap-2 touch-target select-none
                         shadow-lg focus:ring-2 focus:ring-blue-300"
            >
                             <Map size={18} />
               <span>Open in Maps</span>
            </button>
            <button
              onClick={onClose}
              className="sm:flex-shrink-0 px-6 py-3 text-gray-700 border-2 border-gray-300
                         rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200
                         font-medium touch-target select-none
                         focus:ring-2 focus:ring-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
