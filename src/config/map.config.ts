/**
 * ==============================================================================
 * MAP CONFIGURATION FILE
 * ==============================================================================
 * 
 * This file contains all the configuration settings for our OpenLayers map.
 * By centralizing configuration here, we can easily change settings in one place
 * instead of hunting through multiple files.
 * 
 * Think of this as the "settings menu" for our map application.
 * ==============================================================================
 */

// The 'as const' at the end makes this object read-only (immutable)
// This prevents accidental changes to configuration during runtime
export const MAP_CONFIG = {
  // IGN (Institut National de l'Information Géographique et Forestière) Settings
  // IGN is the French national mapping agency - like Google Maps but for France
  ign: {
    // URL: The web address where we fetch map tiles (images that make up the map)
    url: 'https://data.geopf.fr/wmts',
    
    // LAYER: Which specific map layer to display
    // PLANIGNV2 is a detailed topographic map of France
    layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
    
    // MATRIX SET: The coordinate system used for tiling
    // 'PM' stands for Pseudo-Mercator (also known as Web Mercator)
    // This is the same projection Google Maps uses
    matrixSet: 'PM',
    
    // FORMAT: The image format for map tiles
    // PNG supports transparency and good quality
    format: 'image/png',
    
    // STYLE: Visual style of the map
    // 'normal' means standard colors (not grayscale, satellite, etc.)
    style: 'normal',
    
    // ATTRIBUTION: Legal credit text that appears on the map
    // This acknowledges IGN as the data source (required by their terms of service)
    attribution: '© <a href="https://www.ign.fr/" target="_blank">IGN-F/Géoportail</a>',
  },
  
  // VIEW: Settings for how the map is displayed initially
  view: {
    // PROJECTION: The coordinate system for displaying the map
    // EPSG:3857 is Web Mercator - converts the round Earth to a flat screen
    // Numbers are in meters, not latitude/longitude
    projection: 'EPSG:3857',
    
    // CENTER: Where the map is centered when it first loads [x, y]
    // These coordinates are in EPSG:3857 projection (meters from the equator/prime meridian)
    // [260000, 6250000] roughly centers on France
    center: [260000, 6250000] as [number, number],
    
    // ZOOM: Initial zoom level (0 = whole world, 19 = street level)
    // 6 is a good view of entire France
    zoom: 6,
    
    // MIN_ZOOM: How far OUT users can zoom (0 = see whole world)
    minZoom: 0,
    
    // MAX_ZOOM: How far IN users can zoom (19 = very detailed street view)
    // Limited to 19 because IGN doesn't provide tiles beyond this level
    maxZoom: 19,
  },
  
  // WMTS: Web Map Tile Service configuration
  // WMTS is a standard protocol for serving pre-rendered map tiles
  wmts: {
    // MATRIX_LEVELS: How many zoom levels are available from the server
    // 20 levels means zoom levels 0-19 (we count from 0 in programming)
    matrixLevels: 20,
  },
} as const // 'as const' makes this object deeply read-only

// TYPE EXPORT: Automatically creates a TypeScript type from our config object
// This helps TypeScript understand the exact structure of MAP_CONFIG
// Other files can use this type to ensure they're using the config correctly
export type MapConfig = typeof MAP_CONFIG
