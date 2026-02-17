/**
 * ==============================================================================
 * MAP COMPONENT
 * ==============================================================================
 * 
 * This is a React component that displays an OpenLayers map with loading and
 * error states. It's the "view" layer - purely focused on what the user sees.
 * 
 * All the complex map logic is handled by the useMap hook, keeping this
 * component clean and easy to understand.
 * 
 * COMPONENT = FUNCTION THAT RETURNS JSX (HTML-like code)
 * In React, components are just functions that return what should appear on screen.
 * ==============================================================================
 */

// Import OpenLayers default styles (makes the map look correct)
import 'ol/ol.css'

// Import our custom styles for loading spinner and error messages
import './MapComponent.css'

// Import our custom hook that handles all the map initialization logic
import { useMap } from '../hooks/useMap'

// Import TypeScript type definition for the component's props
import type { MapComponentProps } from '../types/map.types'

/**
 * MAPCOMPONENT FUNCTION
 * 
 * This is a functional React component - it's a function that returns JSX.
 * 
 * PARAMETER:
 * - props: Configuration options (center, zoom, callbacks, etc.)
 *   Type: MapComponentProps (see types/map.types.ts for details)
 * 
 * RETURNS:
 * JSX (looks like HTML) that describes what should be rendered on screen
 */
const MapComponent = (props: MapComponentProps) => {
  // ========================================================================
  // USE OUR CUSTOM HOOK
  // ========================================================================
  // 
  // Call useMap hook with the props passed to this component.
  // The hook does all the hard work and gives us back:
  // - mapRef: Reference to attach to our <div>
  // - isLoading: Whether the map is still initializing
  // - error: Any error that occurred (or null)
  // 
  // DESTRUCTURING: We extract just the values we need from the returned object
  const { mapRef, isLoading, error } = useMap(props)

  // ========================================================================
  // RENDER (RETURN JSX)
  // ========================================================================
  // 
  // JSX looks like HTML but it's actually JavaScript.
  // React converts this into actual DOM elements.
  // 
  // The structure is:
  // - Wrapper div (positions everything)
  //   - Map container div (where OpenLayers renders)
  //   - Loading overlay (only shown when isLoading is true)
  //   - Error overlay (only shown when error exists)
  return (
    <div className="map-wrapper">
      {/* 
        MAP CONTAINER
        This is the actual div where the map renders.
        
        ref={mapRef} - Attaches our ref so OpenLayers can find this element
        className - CSS classes for styling (combines default + custom)
        aria-label - Accessibility label for screen readers
      */}
      <div 
        ref={mapRef} 
        className={`map-container ${props.className || ''}`}
        aria-label="OpenLayers Map"
      />
      
      {/* 
        LOADING OVERLAY
        The {isLoading && ...} syntax means:
        "Only render this if isLoading is true"
        
        This is called CONDITIONAL RENDERING in React.
        When the map finishes loading, isLoading becomes false,
        and this entire div disappears.
      */}
      {isLoading && (
        <div className="map-loading">
          {/* Animated spinner (see CSS for animation) */}
          <div className="map-loading-spinner" />
          
          {/* Loading text */}
          <p>Loading map...</p>
        </div>
      )}
      
      {/* 
        ERROR OVERLAY
        Similar to loading overlay, but only shows if there's an error.
        The {error && ...} means "only render if error exists (is not null)"
      */}
      {error && (
        <div className="map-error">
          {/* Error title */}
          <h3>Map Error</h3>
          
          {/* Error message from the error object */}
          <p>{error.message}</p>
          
          {/* 
            RELOAD BUTTON
            onClick - Event handler that runs when button is clicked
            () => ... is an arrow function (short function syntax)
            window.location.reload() reloads the entire page
          */}
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )}
    </div>
  )
}

// Export the component so other files can import and use it
// 'default' means this is the main export of this file
export default MapComponent
