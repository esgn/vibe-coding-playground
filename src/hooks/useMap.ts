import { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProjection } from 'ol/proj'
import { getWidth, getTopLeft } from 'ol/extent'
import { MAP_CONFIG } from '../config/map.config'
import { MapInitializationError, type MapComponentProps } from '../types/map.types'

/**
 * Custom hook to initialize and manage an OpenLayers map with IGN WMTS layer
 */
export const useMap = (options: MapComponentProps = {}) => {
  const {
    center = MAP_CONFIG.view.center,
    initialZoom = MAP_CONFIG.view.zoom,
    minZoom = MAP_CONFIG.view.minZoom,
    maxZoom = MAP_CONFIG.view.maxZoom,
    onMapInit,
    onError,
  } = options

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      // Get projection
      const projection = getProjection(MAP_CONFIG.view.projection)
      if (!projection) {
        throw new MapInitializationError(
          `Failed to get projection: ${MAP_CONFIG.view.projection}`
        )
      }

      const projectionExtent = projection.getExtent()
      const size = getWidth(projectionExtent) / 256
      const resolutions = new Array(MAP_CONFIG.wmts.matrixLevels)
      const matrixIds = new Array(MAP_CONFIG.wmts.matrixLevels)

      // Generate resolutions and matrix IDs for WMTS
      for (let z = 0; z < MAP_CONFIG.wmts.matrixLevels; ++z) {
        resolutions[z] = size / Math.pow(2, z)
        matrixIds[z] = z
      }

      // Create WMTS source
      const wmtsSource = new WMTS({
        url: MAP_CONFIG.ign.url,
        layer: MAP_CONFIG.ign.layer,
        matrixSet: MAP_CONFIG.ign.matrixSet,
        format: MAP_CONFIG.ign.format,
        projection: projection,
        tileGrid: new WMTSTileGrid({
          origin: getTopLeft(projectionExtent),
          resolutions: resolutions,
          matrixIds: matrixIds,
        }),
        style: MAP_CONFIG.ign.style,
        attributions: MAP_CONFIG.ign.attribution,
      })

      const wmtsLayer = new TileLayer({
        source: wmtsSource,
      })

      // Create the map
      const map = new Map({
        target: mapRef.current,
        layers: [wmtsLayer],
        view: new View({
          center: center,
          zoom: initialZoom,
          minZoom: minZoom,
          maxZoom: maxZoom,
          projection: projection,
        }),
      })

      mapInstanceRef.current = map
      setIsLoading(false)

      // Call initialization callback
      onMapInit?.(map)
    } catch (err) {
      const mapError =
        err instanceof MapInitializationError
          ? err
          : new MapInitializationError('Failed to initialize map', err)

      setError(mapError)
      setIsLoading(false)
      onError?.(mapError)

      console.error('Map initialization error:', mapError)
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined)
        mapInstanceRef.current = null
      }
    }
  }, [center, initialZoom, minZoom, maxZoom, onMapInit, onError])

  return {
    mapRef,
    map: mapInstanceRef.current,
    isLoading,
    error,
  }
}
