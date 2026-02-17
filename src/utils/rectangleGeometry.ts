/**
 * ==============================================================================
 * RECTANGLE GEOMETRY UTILITIES
 * ==============================================================================
 * 
 * Mathematical functions for creating and manipulating rectangle geometries.
 * These functions handle the complex math of rotating and positioning rectangles.
 * 
 * KEY CONCEPTS:
 * - Local coordinates: Relative to rectangle center (before rotation)
 * - World coordinates: Actual map coordinates (after rotation and translation)
 * - Rotation: Applied around the center point
 * ==============================================================================
 */

import { Polygon } from 'ol/geom'
import type { RectangleState, CornerIdentifier } from '../types/rectangle.types'

/**
 * CREATE RECTANGLE GEOMETRY
 * 
 * Generates an OpenLayers Polygon geometry from rectangle state.
 * This is the main function that creates the visible rectangle on the map.
 * 
 * ALGORITHM:
 * 1. Create rectangle corners in local space (centered at origin)
 * 2. Apply rotation transformation
 * 3. Translate to world position
 * 
 * PARAMETER:
 * - state: Rectangle configuration (center, size, angle)
 * 
 * RETURNS:
 * OpenLayers Polygon geometry that can be added to a Feature
 */
export function createRectangleGeometry(state: RectangleState): Polygon {
  const { center, width, height, angle } = state
  
  // STEP 1: Create corners in local coordinate system
  // Rectangle is centered at (0, 0) with width and height
  const halfW = width / 2
  const halfH = height / 2
  
  // Define corners counterclockwise from bottom-left
  // This order is important for OpenLayers polygons (forms a closed ring)
  const localCorners: [number, number][] = [
    [-halfW, -halfH],  // Bottom-left
    [halfW, -halfH],   // Bottom-right
    [halfW, halfH],    // Top-right
    [-halfW, halfH],   // Top-left
    [-halfW, -halfH],  // Close the polygon (repeat first point)
  ]
  
  // STEP 2: Apply rotation
  // Rotate each corner around the origin using rotation matrix
  const rotatedCorners = localCorners.map((corner) => 
    rotatePoint(corner, angle)
  )
  
  // STEP 3: Translate to world coordinates
  // Add the center position to each rotated corner
  const worldCorners = rotatedCorners.map(([x, y]) => [
    center[0] + x,
    center[1] + y,
  ])
  
  // Create and return the polygon
  // [worldCorners] wraps the array because Polygon expects array of rings
  // (could have holes, but we only have outer ring)
  return new Polygon([worldCorners])
}

/**
 * ROTATE POINT
 * 
 * Rotates a 2D point around the origin using a rotation matrix.
 * 
 * ROTATION MATRIX MATH:
 * For angle θ, rotation matrix is:
 * [ cos(θ)  -sin(θ) ]
 * [ sin(θ)   cos(θ) ]
 * 
 * New point [x', y'] = matrix * [x, y]
 * x' = x * cos(θ) - y * sin(θ)
 * y' = x * sin(θ) + y * cos(θ)
 * 
 * PARAMETERS:
 * - point: [x, y] coordinates to rotate
 * - angle: Rotation angle in radians (positive = clockwise)
 * 
 * RETURNS:
 * Rotated point [x', y']
 */
export function rotatePoint(
  point: [number, number], 
  angle: number
): [number, number] {
  const [x, y] = point
  
  // Precompute sin and cos (optimization if called frequently)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  
  // Apply rotation matrix
  return [
    x * cos - y * sin,  // new x
    x * sin + y * cos,  // new y
  ]
}

/**
 * INVERSE ROTATE POINT
 * 
 * Rotates a point in the opposite direction (inverse rotation).
 * Used to convert from world coordinates back to local coordinates.
 * 
 * MATH EXPLANATION:
 * Inverse of rotation by θ is rotation by -θ
 * We can also use the transpose of the rotation matrix (swap sin signs)
 * 
 * PARAMETERS:
 * - point: [x, y] world coordinates
 * - angle: Original rotation angle in radians
 * 
 * RETURNS:
 * Point in local coordinate system [x', y']
 */
export function inverseRotatePoint(
  point: [number, number], 
  angle: number
): [number, number] {
  // Inverse rotation is rotation by negative angle
  return rotatePoint(point, -angle)
}

/**
 * WORLD TO LOCAL COORDINATES
 * 
 * Converts a world coordinate to rectangle's local coordinate system.
 * This is essential for resize operations - we need to know where the
 * mouse cursor is relative to the rectangle's unrotated space.
 * 
 * ALGORITHM:
 * 1. Subtract center (translate to origin)
 * 2. Apply inverse rotation (unrotate)
 * 
 * PARAMETERS:
 * - worldCoord: [x, y] in map coordinates
 * - center: Rectangle center in map coordinates
 * - angle: Rectangle rotation angle in radians
 * 
 * RETURNS:
 * Coordinates in rectangle's local space
 */
export function worldToLocal(
  worldCoord: [number, number],
  center: [number, number],
  angle: number
): [number, number] {
  // Translate to origin (relative to center)
  const relative: [number, number] = [
    worldCoord[0] - center[0],
    worldCoord[1] - center[1],
  ]
  
  // Apply inverse rotation
  return inverseRotatePoint(relative, angle)
}

/**
 * LOCAL TO WORLD COORDINATES
 * 
 * Converts from rectangle's local coordinate system to world coordinates.
 * Opposite of worldToLocal.
 * 
 * ALGORITHM:
 * 1. Apply rotation
 * 2. Add center (translate from origin)
 * 
 * PARAMETERS:
 * - localCoord: [x, y] in rectangle's local space
 * - center: Rectangle center in map coordinates
 * - angle: Rectangle rotation angle in radians
 * 
 * RETURNS:
 * Coordinates in map coordinate system
 */
export function localToWorld(
  localCoord: [number, number],
  center: [number, number],
  angle: number
): [number, number] {
  // Apply rotation
  const rotated = rotatePoint(localCoord, angle)
  
  // Translate to world position
  return [
    center[0] + rotated[0],
    center[1] + rotated[1],
  ]
}

/**
 * GET CORNER POSITIONS
 * 
 * Returns the world coordinates of all four corners of the rectangle.
 * Useful for creating corner handles for user interaction.
 * 
 * PARAMETER:
 * - state: Rectangle configuration
 * 
 * RETURNS:
 * Object with corner positions in world coordinates
 */
export function getCornerPositions(state: RectangleState): Record<CornerIdentifier, [number, number]> {
  const { center, width, height, angle } = state
  const halfW = width / 2
  const halfH = height / 2
  
  // Define corners in local space
  const localCorners = {
    bottomLeft: [-halfW, -halfH] as [number, number],
    bottomRight: [halfW, -halfH] as [number, number],
    topRight: [halfW, halfH] as [number, number],
    topLeft: [-halfW, halfH] as [number, number],
  }
  
  // Convert each corner to world coordinates
  return {
    bottomLeft: localToWorld(localCorners.bottomLeft, center, angle),
    bottomRight: localToWorld(localCorners.bottomRight, center, angle),
    topRight: localToWorld(localCorners.topRight, center, angle),
    topLeft: localToWorld(localCorners.topLeft, center, angle),
  }
}

/**
 * GET ROTATION HANDLE POSITION
 * 
 * Calculates the position of the rotation handle (above the rectangle).
 * 
 * PARAMETERS:
 * - state: Rectangle configuration
 * - offset: Distance above the top edge in pixels (converted to map units)
 * 
 * RETURNS:
 * World coordinates for the rotation handle
 */
export function getRotationHandlePosition(
  state: RectangleState,
  offset: number = 40
): [number, number] {
  const { center, height, angle } = state
  
  // Position in local space (above center)
  const localPos: [number, number] = [0, height / 2 + offset]
  
  // Convert to world coordinates
  return localToWorld(localPos, center, angle)
}

/**
 * CALCULATE ANGLE FROM POINTS
 * 
 * Calculates the angle from one point to another.
 * Used for rotation: angle from rectangle center to mouse cursor.
 * 
 * PARAMETERS:
 * - from: Starting point [x, y]
 * - to: Ending point [x, y]
 * 
 * RETURNS:
 * Angle in radians (0 = east, π/2 = north, π = west, -π/2 = south)
 * 
 * NOTE: Math.atan2 returns angles where:
 * - 0° is along positive X axis (east)
 * - Positive angles are counterclockwise
 */
export function calculateAngle(
  from: [number, number],
  to: [number, number]
): number {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  
  return Math.atan2(dy, dx)
}

/**
 * SNAP ANGLE
 * 
 * Snaps an angle to the nearest increment (e.g., 15° intervals).
 * Useful for helping users align rectangles to cardinal directions.
 * 
 * PARAMETERS:
 * - angle: Angle in radians
 * - increment: Snap increment in radians (default: π/12 = 15°)
 * 
 * RETURNS:
 * Snapped angle in radians
 */
export function snapAngle(
  angle: number,
  increment: number = Math.PI / 12  // 15 degrees
): number {
  return Math.round(angle / increment) * increment
}

/**
 * CLAMP VALUE
 * 
 * Constrains a value between minimum and maximum bounds.
 * Used to enforce min/max dimensions on the rectangle.
 * 
 * PARAMETERS:
 * - value: Value to clamp
 * - min: Minimum allowed value
 * - max: Maximum allowed value
 * 
 * RETURNS:
 * Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * RADIANS TO DEGREES
 * 
 * Converts radians to degrees for display purposes.
 * 
 * PARAMETER:
 * - radians: Angle in radians
 * 
 * RETURNS:
 * Angle in degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * DEGREES TO RADIANS
 * 
 * Converts degrees to radians for calculations.
 * 
 * PARAMETER:
 * - degrees: Angle in degrees
 * 
 * RETURNS:
 * Angle in radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}
