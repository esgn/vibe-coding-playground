/**
 * Example usage of MapComponent with custom props
 * 
 * This file demonstrates various ways to use the MapComponent
 */

import MapComponent from './components/MapComponent'
import type { MapComponentProps } from './types/map.types'
import type Map from 'ol/Map'

// Example 1: Basic usage with default configuration
export const BasicMapExample = () => {
  return <MapComponent />
}

// Example 2: Custom center and zoom
export const CustomCenterExample = () => {
  return (
    <MapComponent
      center={[261204, 6250258]} // Paris coordinates in EPSG:3857
      initialZoom={10}
    />
  )
}

// Example 3: With zoom limits
export const ZoomLimitsExample = () => {
  return (
    <MapComponent
      center={[482600, 5456300]} // Lyon coordinates
      initialZoom={8}
      minZoom={5}
      maxZoom={15}
    />
  )
}

// Example 4: With callbacks
export const WithCallbacksExample = () => {
  const handleMapInit = (map: Map) => {
    console.log('Map initialized:', map)
    
    // Add custom interactions or controls
    map.on('moveend', () => {
      const view = map.getView()
      console.log('Map moved to:', view.getCenter(), 'Zoom:', view.getZoom())
    })
  }

  const handleError = (error: Error) => {
    console.error('Map initialization failed:', error)
    // Send error to monitoring service
  }

  return (
    <MapComponent
      onMapInit={handleMapInit}
      onError={handleError}
    />
  )
}

// Example 5: Full configuration
export const FullConfigExample = () => {
  const config: MapComponentProps = {
    center: [261204, 6250258],
    initialZoom: 12,
    minZoom: 6,
    maxZoom: 18,
    className: 'custom-map',
    onMapInit: (map) => {
      console.log('Map ready!', map)
    },
    onError: (error) => {
      alert(`Failed to load map: ${error.message}`)
    },
  }

  return <MapComponent {...config} />
}
