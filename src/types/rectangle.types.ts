/**
 * ==============================================================================
 * RECTANGLE OVERLAY TYPE DEFINITIONS
 * ==============================================================================
 * 
 * Type definitions for the interactive rectangle overlay feature.
 * This defines the shape and properties of rectangles that can be drawn,
 * resized, and rotated on the map.
 * ==============================================================================
 */

import type Map from 'ol/Map'

/**
 * RECTANGLE STATE
 * 
 * Defines all properties needed to describe a rectangle on the map.
 * 
 * WHY THESE PROPERTIES?
 * - Center: Base point for rotation and positioning
 * - Width/Height: Dimensions in map units (meters for EPSG:3857)
 * - Angle: Rotation in radians (0 = aligned with north, positive = clockwise)
 */
export interface RectangleState {
  /** Center point coordinates [x, y] in map projection (EPSG:3857) */
  center: [number, number]
  
  /** Width of rectangle in meters */
  width: number
  
  /** Height of rectangle in meters */
  height: number
  
  /** Rotation angle in radians (0 = north, clockwise positive) */
  angle: number
}

/**
 * HANDLE TYPE
 * 
 * Different types of interaction handles the user can drag.
 */
export type HandleType = 
  | 'corner'   // Corner handles for resizing
  | 'rotate'   // Handle above rectangle for rotation
  | 'center'   // Center handle for moving the entire rectangle

/**
 * INTERACTION MODE
 * 
 * What the user is currently doing with the rectangle.
 */
export type InteractionMode = HandleType | null

/**
 * RECTANGLE OVERLAY PROPS
 * 
 * Props for the RectangleOverlay component.
 * 
 * CONTROLLED COMPONENT:
 * The parent component manages the state and passes it down.
 * When user interacts, onChange is called with the new state.
 * Parent is responsible for updating the state prop.
 */
export interface RectangleOverlayProps {
  /** The OpenLayers map instance */
  map: Map
  
  /** Current rectangle configuration (controlled by parent) */
  state: RectangleState
  
  /** Callback fired whenever the rectangle changes (resize, rotate, move) */
  onChange?: (state: RectangleState) => void
  
  /** Whether the rectangle is editable (default: true) */
  editable?: boolean
  
  /** Visual style overrides */
  style?: RectangleStyle
}

/**
 * RECTANGLE STYLE
 * 
 * Customizable visual appearance of the rectangle.
 */
export interface RectangleStyle {
  /** Fill color (RGBA format, e.g., 'rgba(52, 152, 219, 0.3)') */
  fillColor?: string
  
  /** Stroke (border) color */
  strokeColor?: string
  
  /** Stroke width in pixels */
  strokeWidth?: number
  
  /** Handle size in pixels */
  handleSize?: number
  
  /** Handle color */
  handleColor?: string
}

/**
 * CORNER IDENTIFIER
 * 
 * Identifies which corner of the rectangle.
 * Used for resize operations to know which corner is being dragged.
 */
export type CornerIdentifier = 
  | 'bottomLeft' 
  | 'bottomRight' 
  | 'topRight' 
  | 'topLeft'
