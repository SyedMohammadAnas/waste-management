'use client'

import { useState } from 'react'
import { Map as MapIcon, BarChart3 } from 'lucide-react'
import { Map } from 'react-map-gl/maplibre'
import { DeckGL } from '@deck.gl/react'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { PickingInfo } from '@deck.gl/core'
import { WasteReport } from '@/lib/types'

// MapTiler style URL with API key from environment variables
const MAPTILER_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`

// Initial map view centered on a default location (India - Chennai area based on the MapTiler URL)
const INITIAL_VIEW_STATE = {
  longitude: 80.45559,
  latitude: 16.29044,
  zoom: 14,
}

interface MapComponentProps {
  reports: WasteReport[]
  onReportClick?: (report: WasteReport) => void
}

/**
 * Main map component that displays MapTiler base map with Deck.gl heatmap overlay
 * Shows waste reports as heat density visualization
 */
export default function MapComponent({ reports, onReportClick }: MapComponentProps) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)

  // Create heatmap layer from waste reports data
  const layers = [
    new HeatmapLayer({
      id: 'waste-heatmap',
      data: reports,
      getPosition: (d: WasteReport) => [d.longitude, d.latitude],
      getWeight: () => 1, // Each report has equal weight
      radiusPixels: 25, // Heat circle radius in pixels
      intensity: 2, // Increase intensity for better visibility
      threshold: 0.05, // Threshold for fading effect
      colorRange: [
        [255, 255, 204], // Light yellow
        [255, 237, 160], // Yellow
        [254, 217, 118], // Orange-yellow
        [254, 178, 76],  // Orange
        [253, 141, 60],  // Red-orange
        [252, 78, 42],   // Red
        [227, 26, 28],   // Dark red
        [177, 0, 38],    // Very dark red
      ],
      aggregation: 'SUM',
      pickable: true,
      onClick: (info: PickingInfo<WasteReport>) => {
        // Handle click events on heatmap
        if (info.object && onReportClick) {
          onReportClick(info.object)
          return true // Indicate event was handled
        }
        return false // Event not handled, continue propagation
      },
    }),
  ]

  return (
    <div className="w-full h-full relative">
      {/* Deck.gl overlay with heatmap layer */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={(params) => setViewState(params.viewState as typeof INITIAL_VIEW_STATE)}
        layers={layers}
        controller={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* MapTiler base map */}
        <Map
          mapStyle={MAPTILER_STYLE}
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>

      {/* Map controls overlay - mobile optimized */}
      <div className="absolute top-safe left-4 bg-white/95 backdrop-blur-md rounded-xl
                      p-3 shadow-xl border border-white/20 select-none
                      hidden sm:block">
                 <h2 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
           <MapIcon size={16} className="text-emerald-600" />
           Heat Map
         </h2>
         <p className="text-xs text-gray-600 flex items-center gap-1">
           <BarChart3 size={12} className="text-gray-500" />
           {reports.length} reports • Density shows problem areas
         </p>
      </div>
    </div>
  )
}
