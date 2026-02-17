/**
 * ==============================================================================
 * APP COMPONENT (ROOT COMPONENT)
 * ==============================================================================
 * 
 * This is the main "App" component - the root of our React application.
 * It's the top-level component that contains all other components.
 * 
 * STRUCTURE:
 * App (this file)
 *  └─ ErrorBoundary (catches errors)
 *      └─ MapComponent (displays the map)
 *      └─ RectangleOverlay (interactive rectangle on map)
 *      └─ RectangleControls (UI panel to edit rectangle)
 * 
 * NEW FEATURES:
 * - Interactive rectangle overlay that users can resize and rotate
 * - Controls panel showing rectangle dimensions and position
 * ==============================================================================
 */

// REACT IMPORTS
import { useState, useCallback } from 'react'

// OPENLAYERS IMPORTS
import type Map from 'ol/Map'

// COMPONENT IMPORTS
import MapComponent from './components/MapComponent'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RectangleOverlay } from './components/RectangleOverlay'
import { RectangleControls } from './components/RectangleControls'

// TYPE IMPORTS
import type { RectangleState } from './types/rectangle.types'

// UTILITY IMPORTS
import { createRectangleGeometry } from './utils/rectangleGeometry'

// STYLE IMPORTS
import './App.css'

/**
 * APP COMPONENT
 * 
 * A functional component that serves as the root of our app.
 * 
 * STATE:
 * - map: The OpenLayers Map instance (null until map initializes)
 * - rectangleState: Current state of the rectangle overlay
 * 
 * NO PARAMETERS (no props)
 * This is the top-level component, so nothing passes it props.
 * 
 * RETURNS:
 * JSX describing the app structure
 */
function App() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  /**
   * MAP INSTANCE STATE
   * 
   * Stores the OpenLayers Map object once it's initialized.
   * Used to pass the map to RectangleOverlay.
   * 
   * STARTS AS: null (map doesn't exist yet)
   * BECOMES: Map instance (once MapComponent calls onMapInit)
   */
  const [map, setMap] = useState<Map | null>(null)
  
  /**
   * RECTANGLE STATE
   * 
   * Stores the current configuration of the rectangle overlay.
   * This is shared between RectangleOverlay (which draws it)
   * and RectangleControls (which displays/edits properties).
   * 
   * DEFAULT VALUES:
   * - center: null (will be set to map center when map is ready)
   * - width: 1000 meters (1 kilometer)
   * - height: 500 meters (half kilometer)
   * - angle: 0 radians (pointing north)
   */
  const [rectangleState, setRectangleState] = useState<RectangleState | null>(null)
  
  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  
  /**
   * HANDLE MAP INITIALIZATION
   * 
   * Called by MapComponent when the map is ready.
   * We use this to:
   * 1. Store the map instance in state
   * 2. Initialize the rectangle at the map center
   * 3. Zoom to fit the rectangle with padding
   * 
   * WRAPPED IN useCallback to prevent recreation on every render.
   * This prevents the useMap hook from re-initializing repeatedly.
   * 
   * PARAMETER:
   * - mapInstance: The initialized OpenLayers Map
   */
  const handleMapInit = useCallback((mapInstance: Map) => {
    // Store map for RectangleOverlay
    setMap(mapInstance)
    
    // Get current map center to position rectangle
    const center = mapInstance.getView().getCenter()
    
    // Initialize rectangle at map center if we got a valid center
    if (center) {
      const rectangleState: RectangleState = {
        center: center as [number, number],
        width: 1000,   // 1 kilometer wide
        height: 500,   // 500 meters tall
        angle: 0,      // Pointing north
      }
      
      setRectangleState(rectangleState)
      
      // Zoom to fit the rectangle with some padding
      // Create rectangle geometry to get its extent
      const rectangleGeometry = createRectangleGeometry(rectangleState)
      const extent = rectangleGeometry.getExtent()
      
      // Fit view to rectangle extent with padding
      mapInstance.getView().fit(extent, {
        padding: [200, 200, 200, 200], // Add 200px padding on all sides
        duration: 1000, // Animate zoom over 1 second
      })
    }
  }, [])
  
  /**
   * HANDLE RECTANGLE CHANGE
   * 
   * Called when user interacts with rectangle (drag, resize, rotate).
   * Updates our state to reflect the new configuration.
   * 
   * WRAPPED IN useCallback to prevent recreation on every render.
   * This prevents infinite loops in child components.
   * 
   * PARAMETER:
   * - newState: The updated rectangle configuration
   */
  const handleRectangleChange = useCallback((newState: RectangleState) => {
    setRectangleState(newState)
    
    // Optional: Log changes for debugging
    console.log('Rectangle updated:', {
      width: Math.round(newState.width),
      height: Math.round(newState.height),
      angle: Math.round((newState.angle * 180) / Math.PI), // Convert to degrees
    })
  }, [])
  
  // ========================================================================
  // RENDER
  // ========================================================================
  
  return (
    // MAIN CONTAINER
    // className="App" applies styles from App.css
    <div className="App">
      {/*
        ERROR BOUNDARY
        Wraps all components to catch any rendering errors.
        
        If any child component throws an error:
        - Without ErrorBoundary: Entire app crashes, blank screen
        - With ErrorBoundary: Shows error message, rest of app unaffected
        
        Think of it like a safety net.
      */}
      <ErrorBoundary>
        {/*
          MAP COMPONENT
          The main content - a full-screen map.
          
          PROP: onMapInit
          This callback is invoked when the map finishes initializing.
          We use it to get the Map instance and set up the rectangle.
        */}
        <MapComponent onMapInit={handleMapInit} />
        
        {/*
          RECTANGLE OVERLAY
          Interactive rectangle on the map.
          
          CONDITIONAL RENDERING: Only shown when both map and state are ready.
          The && operator means: if (map && rectangleState) then render overlay
          
          CONTROLLED COMPONENT:
          App manages rectangleState, overlay just renders and reports changes.
          
          PROPS:
          - map: OpenLayers Map instance to add features to
          - state: Current rectangle configuration (controlled)
          - onChange: Called when user modifies rectangle via map interaction
          - editable: true allows user to resize/rotate/move
        */}
        {map && rectangleState && (
          <RectangleOverlay
            map={map}
            state={rectangleState}
            onChange={handleRectangleChange}
            editable={true}
          />
        )}
        
        {/*
          RECTANGLE CONTROLS
          UI panel showing rectangle properties.
          
          CONDITIONAL RENDERING: Only shown when rectangle state exists.
          
          CONTROLLED PATTERN:
          Both overlay and controls read from same state and update via same callback.
          This keeps map visualization and UI perfectly synchronized.
          
          PROPS:
          - state: Current rectangle configuration
          - onChange: Updates state (same callback as overlay uses)
          - position: Where to place the panel (top-right corner)
          - editable: true allows editing values in inputs
        */}
        {rectangleState && (
          <RectangleControls
            state={rectangleState}
            onChange={handleRectangleChange}
            position="top-right"
            editable={true}
          />
        )}
      </ErrorBoundary>
    </div>
  )
}

// Export the App component as the default export
// This is what main.tsx will import and render
export default App
