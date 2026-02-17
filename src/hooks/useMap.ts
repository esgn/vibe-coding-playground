/**
 * ==============================================================================
 * CUSTOM REACT HOOK: useMap
 * ==============================================================================
 * 
 * WHAT'S A REACT HOOK?
 * Hooks are special functions in React that let you "hook into" React features.
 * They must start with "use" and can only be called inside React components.
 * 
 * WHAT DOES THIS HOOK DO?
 * This hook handles all the complex logic of creating and managing an OpenLayers map.
 * It keeps this logic separate from the visual component, making code easier to:
 * - Understand (logic vs. presentation)
 * - Test (can test logic independently)
 * - Reuse (use in different components if needed)
 * 
 * WHY USE A HOOK?
 * Without it, all this code would be inside the component, making it messy.
 * The hook acts like a helper that does the hard work and gives back what we need.
 * ==============================================================================
 */

// REACT IMPORTS
// These are built-in React hooks we'll use:
import { useEffect, useRef, useState } from 'react'
// - useEffect: Runs code after component renders (perfect for initializing the map)
// - useRef: Holds a reference to DOM elements or values that persist between renders
// - useState: Manages state (data that can change and triggers re-renders)

// OPENLAYERS IMPORTS
// These are classes from the OpenLayers library for creating maps:
import Map from 'ol/Map'                      // Main map object
import View from 'ol/View'                    // Controls what part of map is visible
import TileLayer from 'ol/layer/Tile'         // Layer made of image tiles
import WMTS from 'ol/source/WMTS'             // Source for WMTS tile service
import WMTSTileGrid from 'ol/tilegrid/WMTS'   // Grid structure for WMTS tiles
import { get as getProjection } from 'ol/proj' // Gets coordinate system definitions
import { getWidth, getTopLeft } from 'ol/extent' // Helper functions for map extent

// OUR CUSTOM IMPORTS
import { MAP_CONFIG } from '../config/map.config' // Our configuration settings
import { MapInitializationError, type MapComponentProps } from '../types/map.types' // Our types

/**
 * HOOK FUNCTION: useMap
 * 
 * This is the main export of this file - a custom React hook.
 * 
 * PARAMETERS:
 * - options: Optional configuration object (MapComponentProps type)
 * - Default value {} means if no options provided, use empty object
 * 
 * RETURNS:
 * An object containing:
 * - mapRef: Reference to attach to the map's DOM element
 * - map: The actual map instance (null until initialized)
 * - isLoading: Boolean indicating if map is still loading
 * - error: Any error that occurred (null if no error)
 */
export const useMap = (options: MapComponentProps = {}) => {
  // DESTRUCTURING WITH DEFAULTS
  // We extract properties from the options object.
  // The "= MAP_CONFIG.view.center" syntax means:
  // "Use options.center if provided, otherwise use MAP_CONFIG.view.center"
  const {
    center = MAP_CONFIG.view.center,         // Where to center the map
    initialZoom = MAP_CONFIG.view.zoom,      // Starting zoom level
    minZoom = MAP_CONFIG.view.minZoom,       // Minimum zoom allowed
    maxZoom = MAP_CONFIG.view.maxZoom,       // Maximum zoom allowed
    onMapInit,                                // Callback for successful init
    onError,                                  // Callback for errors
  } = options

  // REF FOR MAP CONTAINER (useRef)
  // This creates a reference that will point to the <div> element where the map renders.
  // 
  // WHY USE useRef?
  // - Regular variables reset on every render
  // - useRef persists the value across renders without causing re-renders
  // - Perfect for holding references to DOM elements
  // 
  // <HTMLDivElement> tells TypeScript this will reference a div element
  // null is the initial value (no element attached yet)
  const mapRef = useRef<HTMLDivElement>(null)
  
  // REF FOR MAP INSTANCE (useRef)
  // This holds the actual OpenLayers Map object.
  // 
  // WHY USE useRef INSTEAD OF useState?
  // - Changing the map shouldn't trigger a re-render of the component
  // - We just need to store it and access it later
  // - useRef is perfect for this: it persists data without causing re-renders
  const mapInstanceRef = useRef<Map | null>(null)
  
  // STATE FOR LOADING STATUS (useState)
  // Tracks whether the map is currently being initialized.
  // 
  // WHY USE useState?
  // - When loading status changes, we WANT to re-render (to show/hide loading spinner)
  // - useState triggers re-renders when the value changes
  // 
  // useState(true) means it starts as true (loading)
  // Returns [currentValue, functionToUpdateValue]
  const [isLoading, setIsLoading] = useState(true)
  
  // STATE FOR ERROR (useState)
  // Stores any error that occurs during map initialization.
  // 
  // Starts as null (no error)
  // If an error occurs, we'll update this with setError(errorObject)
  // This will trigger a re-render to show the error message
  const [error, setError] = useState<Error | null>(null)

  // USE_EFFECT HOOK
  // This is where the magic happens! useEffect runs after the component renders.
  // 
  // WHEN DOES IT RUN?
  // - After the first render (when the component appears)
  // - After any render where dependencies change (see array at bottom)
  // 
  // WHY USE useEffect FOR MAP INITIALIZATION?
  // - The map needs a DOM element to render into
  // - DOM elements only exist AFTER the component renders
  // - useEffect runs AFTER render, so the DOM element is ready
  useEffect(() => {
    // GUARD CLAUSE: Exit early if the map container doesn't exist yet
    // This can happen during the very first render before React attaches the ref
    if (!mapRef.current) return

    // TRY-CATCH BLOCK
    // Wraps potentially error-prone code so we can handle failures gracefully
    // If anything inside 'try' fails, execution jumps to 'catch'
    try {
      // Set loading to true (will show loading spinner in UI)
      setIsLoading(true)
      
      // Clear any previous errors (in case this is a re-initialization)
      setError(null)

      // ========================================================================
      // STEP 1: GET THE PROJECTION (COORDINATE SYSTEM)
      // ========================================================================
      // 
      // WHAT'S A PROJECTION?
      // The Earth is round, but screens are flat. A projection is a mathematical
      // formula that converts coordinates from a sphere to a flat surface.
      // 
      // EPSG:3857 is "Web Mercator" - the same projection Google Maps uses.
      // It measures distances in meters from the equator and prime meridian.
      const projection = getProjection(MAP_CONFIG.view.projection)
      
      // VALIDATION: Make sure we got a valid projection
      // If getProjection returns null/undefined, something is wrong
      if (!projection) {
        throw new MapInitializationError(
          `Failed to get projection: ${MAP_CONFIG.view.projection}`
        )
      }

      // ========================================================================
      // STEP 2: CALCULATE TILE GRID PARAMETERS
      // ========================================================================
      
      // PROJECTION EXTENT
      // This is the full bounding box of the projection in meters [minX, minY, maxX, maxY]
      // For Web Mercator, this covers the entire world (within projection limits)
      const projectionExtent = projection.getExtent()
      
      // SIZE CALCULATION
      // We need to know how big the world is at zoom level 0 (most zoomed out)
      // - getWidth(projectionExtent): Total width of the world in meters
      // - Divide by 256: Standard tile size is 256x256 pixels
      // This gives us the "size" of one tile at zoom level 0
      const size = getWidth(projectionExtent) / 256
      
      // CREATE ARRAYS FOR RESOLUTIONS AND MATRIX IDs
      // We need one entry for each zoom level (0 to 19 = 20 levels)
      const resolutions = new Array(MAP_CONFIG.wmts.matrixLevels)
      const matrixIds = new Array(MAP_CONFIG.wmts.matrixLevels)

      // GENERATE RESOLUTIONS FOR EACH ZOOM LEVEL
      // 
      // WHAT'S A RESOLUTION?
      // Resolution is how many meters on Earth one pixel represents.
      // - Zoom 0 (far out): 1 pixel = many meters
      // - Zoom 19 (close up): 1 pixel = very few meters
      // 
      // THE FORMULA: size / Math.pow(2, z)
      // - Math.pow(2, z) means "2 to the power of z" (2^z)
      // - Zoom 0: size / 1 = full size
      // - Zoom 1: size / 2 = half size
      // - Zoom 2: size / 4 = quarter size
      // - Each zoom level shows TWICE as much detail as the previous
      // 
      // MATRIX IDs are just the zoom level numbers (0, 1, 2, ... 19)
      for (let z = 0; z < MAP_CONFIG.wmts.matrixLevels; ++z) {
        resolutions[z] = size / Math.pow(2, z)  // Calculate resolution for this zoom
        matrixIds[z] = z                         // Store the zoom level number
      }

      // ========================================================================
      // STEP 3: CREATE THE WMTS SOURCE
      // ========================================================================
      // 
      // WHAT'S A SOURCE?
      // A "source" tells OpenLayers where to get the map data from.
      // Think of it like a URL for loading images, but for map tiles.
      // 
      // WHAT'S WMTS?
      // Web Map Tile Service - a standard protocol for requesting map tiles.
      // The server has pre-rendered tiles at different zoom levels.
      // We just request the tiles we need for the current view.
      const wmtsSource = new WMTS({
        // URL: Where to request tiles from
        url: MAP_CONFIG.ign.url,
        
        // LAYER: Which specific map layer to display (IGN has many layers)
        layer: MAP_CONFIG.ign.layer,
        
        // MATRIX SET: The tiling scheme identifier
        matrixSet: MAP_CONFIG.ign.matrixSet,
        
        // FORMAT: What image format the tiles are in
        format: MAP_CONFIG.ign.format,
        
        // PROJECTION: Coordinate system (must match our map projection)
        projection: projection,
        
        // TILE GRID: Defines how tiles are organized
        tileGrid: new WMTSTileGrid({
          // ORIGIN: Top-left corner of the tile grid in projection coordinates
          // This is the reference point for calculating tile positions
          origin: getTopLeft(projectionExtent),
          
          // RESOLUTIONS: Array of resolutions for each zoom level (calculated earlier)
          resolutions: resolutions,
          
          // MATRIX IDs: Identifiers for each zoom level (0, 1, 2, ...)
          matrixIds: matrixIds,
        }),
        
        // STYLE: Visual style identifier for the layer
        style: MAP_CONFIG.ign.style,
        
        // ATTRIBUTIONS: Copyright/credit text shown on map
        attributions: MAP_CONFIG.ign.attribution,
      })

      // ========================================================================
      // STEP 4: CREATE THE TILE LAYER
      // ========================================================================
      // 
      // WHAT'S A LAYER?
      // A layer is like a transparency sheet in an overhead projector.
      // You can stack multiple layers on top of each other.
      // 
      // TILE LAYER specifically means the layer is made up of image tiles
      // (as opposed to vector layers, which are made of shapes/lines)
      const wmtsLayer = new TileLayer({
        source: wmtsSource,  // Connect this layer to our WMTS source
      })

      // ========================================================================
      // STEP 5: CREATE THE MAP!
      // ========================================================================
      // 
      // This is the main Map object that brings everything together.
      const map = new Map({
        // TARGET: The DOM element to render the map into
        // We use mapRef.current which points to the <div> in our component
        target: mapRef.current,
        
        // LAYERS: Array of layers to display on the map
        // We only have one layer (the WMTS tiles), but you could add more
        // For example: [wmtsLayer, markersLayer, routesLayer]
        layers: [wmtsLayer],
        
        // VIEW: Controls what part of the world is visible and how zoomed in
        view: new View({
          // CENTER: Where the map is centered [x, y] in projection coordinates
          center: center,
          
          // ZOOM: Starting zoom level
          zoom: initialZoom,
          
          // MIN_ZOOM: User can't zoom out further than this
          minZoom: minZoom,
          
          // MAX_ZOOM: User can't zoom in further than this
          maxZoom: maxZoom,
          
          // PROJECTION: Must match the projection of our layers
          projection: projection,
        }),
      })

      // ========================================================================
      // STEP 6: STORE THE MAP AND UPDATE STATE
      // ========================================================================
      
      // Store the map instance in our ref so we can access it later
      // (for cleanup, or if the component needs to interact with the map)
      mapInstanceRef.current = map
      
      // Set loading to false - we're done!
      // This will hide the loading spinner in the UI
      setIsLoading(false)

      // OPTIONAL CALLBACK: If user provided an onMapInit function, call it now
      // The ?. is "optional chaining" - only calls the function if it exists
      // This lets the parent component do something with the map after it's ready
      onMapInit?.(map)
    } catch (err) {
      // ========================================================================
      // ERROR HANDLING
      // ========================================================================
      // If anything went wrong in the try block, we end up here.
      
      // NORMALIZE THE ERROR
      // The error might already be our custom MapInitializationError,
      // or it might be a generic JavaScript error.
      // We check using 'instanceof' and wrap generic errors in our custom error class.
      const mapError =
        err instanceof MapInitializationError
          ? err  // It's already our custom error, use it as-is
          : new MapInitializationError('Failed to initialize map', err) // Wrap generic error

      // Store the error in state (will trigger re-render to show error message)
      setError(mapError)
      
      // Stop showing loading spinner
      setIsLoading(false)
      
      // Call the error callback if user provided one
      onError?.(mapError)

      // Log to console for developers to see
      console.error('Map initialization error:', mapError)
    }

    // ========================================================================
    // CLEANUP FUNCTION
    // ========================================================================
    // 
    // WHAT'S A CLEANUP FUNCTION?
    // When you return a function from useEffect, React will call it when:
    // - The component unmounts (is removed from the page)
    // - Before the effect runs again (if dependencies change)
    // 
    // WHY DO WE NEED CLEANUP?
    // OpenLayers keeps references to DOM elements and event listeners.
    // If we don't clean up, we get memory leaks (old maps stay in memory).
    // 
    // This is like turning off lights when you leave a room.
    return () => {
      // If we have a map instance, clean it up
      if (mapInstanceRef.current) {
        // setTarget(undefined) tells OpenLayers to detach from the DOM
        // This removes event listeners and frees up resources
        mapInstanceRef.current.setTarget(undefined)
        
        // Clear our reference to the map
        mapInstanceRef.current = null
      }
    }
  }, [center, initialZoom, minZoom, maxZoom, onMapInit, onError])
  // ^
  // |
  // DEPENDENCY ARRAY: useEffect re-runs if any of these values change
  // If user changes center, zoom, etc., we re-initialize the map
  // If these don't change, the effect only runs once (on mount)

  // ========================================================================
  // RETURN VALUE
  // ========================================================================
  // 
  // The hook returns an object with everything the component needs:
  return {
    // mapRef: Attach this to the <div> where the map should render
    mapRef,
    
    // map: The actual Map instance (null until initialized)
    // Components can use this to interact with the map
    map: mapInstanceRef.current,
    
    // isLoading: Boolean - true while map is initializing
    // Component uses this to show/hide loading spinner
    isLoading,
    
    // error: Any error that occurred (null if no error)
    // Component uses this to show error message
    error,
  }
}
