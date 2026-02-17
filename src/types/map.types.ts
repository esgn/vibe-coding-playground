/**
 * ==============================================================================
 * TYPE DEFINITIONS FILE
 * ==============================================================================
 * 
 * This file contains TypeScript type definitions and interfaces.
 * 
 * WHAT ARE TYPES?
 * Types tell TypeScript (and us!) what kind of data to expect. They're like
 * a contract that says "this variable will always be a number" or "this function
 * needs these specific parameters". This helps catch bugs before the code runs.
 * 
 * WHAT ARE INTERFACES?
 * Interfaces define the shape of an object - what properties it has and what
 * types those properties are. Think of it like a blueprint for objects.
 * ==============================================================================
 */

// Import the Map class from OpenLayers library
// This is needed so TypeScript knows what a "Map" is when we use it in our types
import Map from 'ol/Map'

/**
 * INTERFACE: MapComponentProps
 * 
 * This defines what "props" (properties) can be passed to our MapComponent.
 * Props are like arguments to a function - they let you customize the component.
 * 
 * The '?' after each property name means it's OPTIONAL - you don't have to provide it.
 * If you don't provide it, the component will use a default value.
 */
export interface MapComponentProps {
  /**
   * CENTER: Where the map should be centered when it loads
   * Format: [x, y] coordinates in EPSG:3857 projection (in meters)
   * Example: [261204, 6250258] for Paris
   * If not provided, defaults to center of France
   */
  center?: [number, number]
  
  /**
   * INITIAL_ZOOM: How zoomed in the map starts
   * Range: 0 (whole world) to 19 (street level)
   * Example: 10 is good for a city view
   * If not provided, defaults to 6 (country view)
   */
  initialZoom?: number
  
  /**
   * MIN_ZOOM: How far out users can zoom
   * Range: 0 to maxZoom
   * Lower number = can zoom out more (see more area)
   */
  minZoom?: number
  
  /**
   * MAX_ZOOM: How far in users can zoom
   * Range: minZoom to 19
   * Higher number = can zoom in more (see more detail)
   */
  maxZoom?: number
  
  /**
   * CLASS_NAME: Additional CSS class for styling the map container
   * This lets you apply custom styles to the map
   * Example: 'my-custom-map' to apply styles from .my-custom-map CSS class
   */
  className?: string
  
  /**
   * ON_MAP_INIT: Callback function that runs after the map is created
   * 
   * WHAT'S A CALLBACK?
   * A callback is a function you provide that gets called later.
   * In this case, it's called after the map successfully initializes.
   * 
   * You receive the map object as a parameter, which lets you:
   * - Add event listeners (onClick, onZoom, etc.)
   * - Add custom controls or layers
   * - Get the initial map state
   * 
   * Example:
   *   onMapInit={(map) => console.log('Map ready!', map)}
   */
  onMapInit?: (map: Map) => void
  
  /**
   * ON_ERROR: Callback function that runs if the map fails to initialize
   * 
   * You receive an Error object that describes what went wrong.
   * This lets you:
   * - Log the error to a monitoring service
   * - Show a custom error message to the user
   * - Try alternative map sources
   * 
   * Example:
   *   onError={(error) => alert('Map failed: ' + error.message)}
   */
  onError?: (error: Error) => void
}

/**
 * INTERFACE: WMTSConfig
 * 
 * Defines the configuration for a WMTS (Web Map Tile Service) layer.
 * WMTS is a standard way to serve pre-rendered map tiles over the internet.
 * 
 * This interface ensures we provide all required settings to connect to a WMTS server.
 */
export interface WMTSConfig {
  url: string        // Web address of the WMTS server
  layer: string      // Name of the specific layer to display
  matrixSet: string  // Coordinate system for the tiles
  format: string     // Image format (png, jpg, etc.)
  style: string      // Visual style identifier
  attribution: string // Legal credit text for the map data
}

/**
 * INTERFACE: MapViewConfig
 * 
 * Defines settings for how the map view behaves.
 * The "view" controls what part of the world you're looking at and how zoomed in you are.
 */
export interface MapViewConfig {
  projection: string        // Coordinate system (how we translate Earth's sphere to flat screen)
  center: [number, number]  // Starting position [x, y]
  zoom: number              // Starting zoom level
  minZoom: number           // Minimum zoom allowed (how far out)
  maxZoom: number           // Maximum zoom allowed (how far in)
}

/**
 * CUSTOM ERROR CLASS: MapInitializationError
 * 
 * WHAT'S AN ERROR CLASS?
 * It's a special object that represents something going wrong.
 * By creating our own error class, we can:
 * - Distinguish map errors from other errors
 * - Add custom properties (like 'cause')
 * - Provide better error messages
 * 
 * WHAT'S 'extends Error'?
 * This means MapInitializationError is a specialized type of Error.
 * It inherits all the functionality of Error and adds our custom behavior.
 */
export class MapInitializationError extends Error {
  /**
   * CONSTRUCTOR: Special function that runs when creating a new error
   * 
   * Parameters:
   * - message: Human-readable description of what went wrong
   * - cause: (optional) The underlying error that caused this error
   * 
   * The 'public cause' makes this property accessible to anyone with the error object
   */
  constructor(message: string, public cause?: unknown) {
    // Call the parent Error class constructor with our message
    super(message)
    
    // Set a custom name so we can easily identify this type of error
    // This will show up in error logs and stack traces
    this.name = 'MapInitializationError'
  }
}
