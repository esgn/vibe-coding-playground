/**
 * Map configuration constants
 */
export const MAP_CONFIG = {
  ign: {
    url: 'https://data.geopf.fr/wmts',
    layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
    matrixSet: 'PM',
    format: 'image/png',
    style: 'normal',
    attribution: '© <a href="https://www.ign.fr/" target="_blank">IGN-F/Géoportail</a>',
  },
  view: {
    projection: 'EPSG:3857',
    center: [260000, 6250000] as [number, number], // Centered on France
    zoom: 6,
    minZoom: 0,
    maxZoom: 19,
  },
  wmts: {
    matrixLevels: 20, // Number of zoom levels available
  },
} as const

export type MapConfig = typeof MAP_CONFIG
