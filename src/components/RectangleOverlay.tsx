/**
 * ==============================================================================
 * RECTANGLE OVERLAY COMPONENT
 * ==============================================================================
 * 
 * React component that renders an interactive rectangle on the map.
 * This is a "render-less" component - it doesn't render any DOM elements,
 * only creates OpenLayers features on the map.
 * 
 * USAGE:
 * <RectangleOverlay
 *   map={mapInstance}
 *   initialState={{ center: [x, y], width: 1000, height: 500 }}
 *   onChange={(state) => console.log('Rectangle changed:', state)}
 * />
 * ==============================================================================
 */

import type { RectangleOverlayProps } from '../types/rectangle.types'
import { useRectangleOverlay } from '../hooks/useRectangleOverlay'

/**
 * RECTANGLE OVERLAY COMPONENT
 * 
 * A renderless, controlled component that manages a rectangle overlay on an OpenLayers map.
 * 
 * WHAT'S A RENDERLESS COMPONENT?
 * It returns null (no DOM), but has side effects (creates map features).
 * The actual rendering happens in OpenLayers, not React's DOM.
 * 
 * WHAT'S A CONTROLLED COMPONENT?
 * It doesn't manage its own state. Parent component passes state down and handles updates.
 * This ensures a single source of truth and prevents sync issues.
 * 
 * PROPS:
 * - map: OpenLayers map instance
 * - state: Current rectangle configuration (required, controlled by parent)
 * - onChange: Callback when rectangle changes from user interaction
 * - editable: Whether user can resize/rotate (default: true)
 * - style: Visual appearance overrides (optional)
 * 
 * EXAMPLE:
 * ```tsx
 * const [rectangleState, setRectangleState] = useState({
 *   center: [261204, 6250258],  // Paris
 *   width: 2000,                 // 2km
 *   height: 1000,                // 1km
 *   angle: Math.PI / 4           // 45 degrees
 * })
 * 
 * <RectangleOverlay
 *   map={map}
 *   state={rectangleState}
 *   onChange={setRectangleState}
 *   style={{
 *     fillColor: 'rgba(255, 0, 0, 0.2)',
 *     strokeColor: '#ff0000'
 *   }}
 * />
 * ```
 */
export function RectangleOverlay({
  map,
  state,
  onChange,
  editable = true,
  style,
}: RectangleOverlayProps) {
  // Use the custom hook to handle all rectangle logic
  // The hook manages:
  // - Vector layer creation
  // - Feature rendering
  // - Interaction handling
  // - Cleanup on unmount
  // 
  // STATE MANAGEMENT:
  // This is a controlled component - parent manages state.
  useRectangleOverlay(map, state, onChange, editable, style)
  
  // RETURN NULL
  // This component doesn't render anything in React's DOM.
  // All rendering happens in OpenLayers (map features).
  // 
  // WHY?
  // - OpenLayers manages its own rendering
  // - We just need React for state management and lifecycle
  // - Returning null is perfectly valid for side-effect-only components
  return null
}

/**
 * USAGE NOTES:
 * 
 * CONTROLLED COMPONENT PATTERN:
 * Parent component manages state, passes it down, and handles updates.
 * 
 * 1. BASIC USAGE:
 *    const [rectangleState, setRectangleState] = useState({
 *      center: [261204, 6250258],
 *      width: 1000,
 *      height: 500,
 *      angle: 0
 *    })
 * 
 *    <RectangleOverlay
 *      map={map}
 *      state={rectangleState}
 *      onChange={setRectangleState}
 *    />
 * 
 * 2. WITH CHANGE HANDLER:
 *    <RectangleOverlay
 *      map={map}
 *      state={rectangleState}
 *      onChange={(newState) => {
 *        setRectangleState(newState)
 *        // Also save to backend, log, etc.
 *        console.log('New dimensions:', newState.width, newState.height)
 *      }}
 *    />
 * 
 * 3. READ-ONLY (NOT EDITABLE):
 *    <RectangleOverlay
 *      map={map}
 *      state={rectangleState}
 *      editable={false}
 *    />
 * 
 * 4. CUSTOM STYLING:
 *    <RectangleOverlay
 *      map={map}
 *      state={rectangleState}
 *      onChange={setRectangleState}
 *      style={{
 *        fillColor: 'rgba(255, 0, 0, 0.3)',
 *        strokeColor: '#ff0000',
 *        strokeWidth: 3,
 *        handleSize: 10,
 *        handleColor: '#ffffff'
 *      }}
 *    />
 * 
 * COORDINATE SYSTEM:
 * - All coordinates are in the map's projection (EPSG:3857)
 * - Width and height are in meters
 * - Angle is in radians (0 = north, positive = clockwise)
 * 
 * USER INTERACTIONS:
 * - Drag rectangle body → Move/translate
 * - Drag corner handles → Resize
 * - Drag top handle → Rotate
 * - Hold Shift while rotating → Snap to 15° increments
 * 
 * STATE SYNCHRONIZATION:
 * - Map interactions (drag/resize/rotate) call onChange
 * - Parent updates state
 * - Component re-renders with new state
 * - Features update automatically on map
 */
