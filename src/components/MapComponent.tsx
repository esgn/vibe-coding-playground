import 'ol/ol.css'
import './MapComponent.css'
import { useMap } from '../hooks/useMap'
import type { MapComponentProps } from '../types/map.types'

/**
 * Map component that displays an OpenLayers map with IGN PLAN V2 WMTS layer
 */
const MapComponent = (props: MapComponentProps) => {
  const { mapRef, isLoading, error } = useMap(props)

  return (
    <div className="map-wrapper">
      <div 
        ref={mapRef} 
        className={`map-container ${props.className || ''}`}
        aria-label="OpenLayers Map"
      />
      
      {isLoading && (
        <div className="map-loading">
          <div className="map-loading-spinner" />
          <p>Loading map...</p>
        </div>
      )}
      
      {error && (
        <div className="map-error">
          <h3>Map Error</h3>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )}
    </div>
  )
}

export default MapComponent
