'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, MapPin, BarChart3, Wifi, Camera, Map, AlertTriangle, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { WasteReport } from '@/lib/types'
import MapComponent from '@/components/MapComponent'
import UploadComponent from '@/components/UploadComponent'
import ReportModal from '@/components/ReportModal'

/**
 * Main application page for the Waste Management MVP
 * Features:
 * - MapTiler base map with Deck.gl heatmap overlay
 * - Real-time waste report visualization
 * - Photo upload with geolocation capture
 * - Detailed report viewing modal
 */
export default function Home() {
  // State management for application data and UI
  const [reports, setReports] = useState<WasteReport[]>([])
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  /**
   * Fetches all waste reports from Supabase database
   * Called on initial load and after new uploads
   */
  const fetchReports = useCallback(async () => {
    try {
      setError('')
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setReports(data || [])
    } catch (err) {
      console.error('Error fetching reports:', err)
      setError('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Sets up real-time subscription to listen for new reports
   * Automatically updates the heatmap when new data arrives
   */
  useEffect(() => {
    // Initial data fetch
    fetchReports()

    // Set up real-time subscription for new reports
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          console.log('New report received:', payload.new)
          // Add new report to existing reports
          setReports((currentReports) => [
            payload.new as WasteReport,
            ...currentReports,
          ])
        }
      )
      .subscribe()

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchReports])

  /**
   * Handles successful photo upload
   * Refreshes the reports data to include the new submission
   */
  const handleUploadSuccess = useCallback(() => {
    fetchReports()
    setIsUploadModalOpen(false) // Close upload modal on success
  }, [fetchReports])

  /**
   * Handles report selection from heatmap clicks
   * Opens the detailed report modal
   */
  const handleReportClick = useCallback((report: WasteReport) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }, [])

  /**
   * Closes the report detail modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedReport(null)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading waste reports...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4">
            <AlertTriangle size={48} className="text-red-500 mx-auto" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchReports}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden select-none">
      {/* Main map view with heatmap overlay */}
      <MapComponent
        reports={reports}
        onReportClick={handleReportClick}
      />

      {/* Mobile: Floating Report Button, Desktop: Full Upload Component */}
      <>
        {/* Mobile Report Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="md:hidden fixed top-5 right-5 z-10
                     bg-emerald-600 text-white p-3 rounded-full shadow-lg
                     hover:bg-emerald-700 active:bg-emerald-800
                     transition-all duration-200 touch-target
                     border-2 border-white"
          aria-label="Report waste issue"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>

        {/* Desktop Upload Component */}
        <div className="hidden md:block absolute bottom-4 right-4 z-10 w-80">
          <UploadComponent onUploadSuccess={handleUploadSuccess} />
        </div>
      </>

      {/* Mobile Upload Modal */}
      {isUploadModalOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-slideUp border-t-4 border-emerald-500">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <MapPin size={20} />
                Report Waste Issue
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 active:text-gray-900
                           text-2xl leading-none touch-target select-none
                           w-10 h-10 flex items-center justify-center rounded-full
                           hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
                                 aria-label="Close modal"
               >
                 <X size={20} />
               </button>
            </div>
            <div className="p-4">
              <UploadComponent onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* Report detail modal - mobile optimized */}
      <ReportModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Mobile-first application footer with stats */}
      <div className="absolute bottom-safe mb-5 left-5 right-4 sm:left-6 sm:right-auto
                      bg-white/95 backdrop-blur-md rounded-xl
                      p-3 sm:p-4 shadow-xl border border-white/20 z-10">
        <div className="text-sm text-gray-600">
          <div className="font-semibold text-gray-800 mb-1 text-base">
            WasteTracker
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-600" />
              <span>{reports.length} reports</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi size={12} className="text-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-600 font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions overlay for first-time users - mobile optimized */}
      {reports.length === 0 && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mx-auto
                          max-w-sm sm:max-w-md text-center shadow-2xl border border-white/20">
            <div className="mb-4">
              <MapPin size={48} className="text-emerald-600 mx-auto" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
              Welcome to WasteTracker
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
              Start reporting waste issues by uploading a photo. Your location will be captured
              automatically and displayed on the real-time map.
            </p>
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <MapPin size={18} className="text-emerald-600" />
                <span>Enable location access</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Camera size={18} className="text-emerald-600" />
                <span>Take a photo of waste</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Map size={18} className="text-emerald-600" />
                <span>View real-time updates</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Tap the upload button in the top-right to get started
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
