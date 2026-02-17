import Map from 'ol/Map'

/**
 * Props for MapComponent
 */
export interface MapComponentProps {
  /** Initial center coordinates [x, y] in EPSG:3857 */
  center?: [number, number]
  /** Initial zoom level */
  initialZoom?: number
  /** Minimum zoom level */
  minZoom?: number
  /** Maximum zoom level */
  maxZoom?: number
  /** CSS class name for the map container */
  className?: string
  /** Callback when map is initialized */
  onMapInit?: (map: Map) => void
  /** Callback when map fails to initialize */
  onError?: (error: Error) => void
}

/**
 * WMTS configuration options
 */
export interface WMTSConfig {
  url: string
  layer: string
  matrixSet: string
  format: string
  style: string
  attribution: string
}

/**
 * Map view configuration
 */
export interface MapViewConfig {
  projection: string
  center: [number, number]
  zoom: number
  minZoom: number
  maxZoom: number
}

/**
 * Map initialization error
 */
export class MapInitializationError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'MapInitializationError'
  }
}
