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
 * 
 * It's simple by design - just sets up error handling and displays the map.
 * ==============================================================================
 */

// Import our custom CSS for the App component
import './App.css'

// Import the MapComponent that displays the OpenLayers map
import MapComponent from './components/MapComponent'

// Import ErrorBoundary to catch and handle errors gracefully
import { ErrorBoundary } from './components/ErrorBoundary'

/**
 * APP COMPONENT
 * 
 * A simple functional component that serves as the root of our app.
 * 
 * NO PARAMETERS (no props)
 * This is the top-level component, so nothing passes it props.
 * 
 * RETURNS:
 * JSX describing the app structure
 */
function App() {
  return (
    // MAIN CONTAINER
    // className="App" applies styles from App.css
    <div className="App">
      {/*
        ERROR BOUNDARY
        Wraps MapComponent to catch any rendering errors.
        
        If MapComponent (or its children) throw an error:
        - Without ErrorBoundary: Entire app crashes, blank screen
        - With ErrorBoundary: Shows error message, rest of app unaffected
        
        Think of it like a safety net.
      */}
      <ErrorBoundary>
        {/*
          MAP COMPONENT
          The main content of our app - a full-screen map.
          
          We're not passing any props, so it uses all default values:
          - Center: France
          - Zoom: 6
          - Max zoom: 19
          
          If we wanted to customize, we could do:
          <MapComponent 
            center={[261204, 6250258]} 
            initialZoom={10}
          />
        */}
        <MapComponent />
      </ErrorBoundary>
    </div>
  )
}

// Export the App component as the default export
// This is what main.tsx will import and render
export default App
