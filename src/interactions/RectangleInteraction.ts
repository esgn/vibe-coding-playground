/**
 * ==============================================================================
 * RECTANGLE INTERACTION HANDLER
 * ==============================================================================
 * 
 * Manages user interactions with the rectangle overlay.
 * Handles mouse/touch events for:
 * - Dragging rectangle body to move/translate
 * - Dragging corners to resize
 * - Dragging rotation handle (above rectangle) to rotate
 * - Keyboard modifiers (Shift for angle snapping)
 * 
 * This is a custom OpenLayers interaction that doesn't use built-in
 * interactions because we need precise control over resize/rotate behavior.
 * ==============================================================================
 */

import type Map from 'ol/Map'
import type { Feature } from 'ol'
import type MapBrowserEvent from 'ol/MapBrowserEvent'
import type { 
  RectangleState, 
  HandleType, 
  InteractionMode,
  CornerIdentifier 
} from '../types/rectangle.types'
import {
  worldToLocal,
  calculateAngle,
  snapAngle,
  clamp,
} from '../utils/rectangleGeometry'

/**
 * RECTANGLE INTERACTION CLASS
 * 
 * This class encapsulates all the interaction logic for the rectangle.
 * It listens to map pointer events and updates rectangle state accordingly.
 * 
 * ARCHITECTURE:
 * - Stateless: Receives current state, returns new state
 * - Event-driven: Responds to pointer down/move/up events
 * - Mode-based: Different behavior based on what handle is being dragged
 */
export class RectangleInteraction {
  // ============================================================================
  // PROPERTIES
  // ============================================================================
  
  /** The OpenLayers map instance */
  private map: Map
  
  /** Current rectangle state */
  private rectangleState: RectangleState
  
  /** Callback to update rectangle state */
  private onUpdate: (state: RectangleState) => void
  
  /** Currently active handle being dragged (null if not dragging) */
  private activeHandle: Feature | null = null
  
  /** State when drag started (for calculating deltas) */
  private startState: RectangleState | null = null
  
  /** Pixel coordinate when drag started */
  private startPixel: [number, number] | null = null
  
  /** Current interaction mode (resize, rotate, or move) */
  private mode: InteractionMode = null
  
  /** Which corner is being dragged (for resize) */
  private draggedCorner: CornerIdentifier | null = null
  
  /** Initial angle from center to cursor when rotation starts */
  private startAngle: number | null = null
  
  /** Whether Shift key is pressed (for aspect ratio lock, angle snap) */
  private shiftPressed: boolean = false
  
  /** Minimum allowed dimensions (in meters) */
  private readonly MIN_SIZE = 10
  
  /** Maximum allowed dimensions (in meters) */
  private readonly MAX_SIZE = 100000  // 100km
  
  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================
  
  /**
   * Creates a new RectangleInteraction instance.
   * 
   * PARAMETERS:
   * - map: OpenLayers map
   * - initialState: Starting rectangle configuration  
   * - onUpdate: Callback fired when rectangle changes
   */
  constructor(
    map: Map,
    initialState: RectangleState,
    onUpdate: (state: RectangleState) => void
  ) {
    this.map = map
    this.rectangleState = initialState
    this.onUpdate = onUpdate
    
    // Bind event handlers (necessary for 'this' context in event listeners)
    this.handlePointerDown = this.handlePointerDown.bind(this)
    this.handlePointerMove = this.handlePointerMove.bind(this)
    this.handlePointerUp = this.handlePointerUp.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    
    // Attach event listeners
    this.attachListeners()
  }
  
  // ============================================================================
  // EVENT LISTENER MANAGEMENT
  // ============================================================================
  
  /**
   * Attach all event listeners to the map.
   */
  private attachListeners(): void {
    // Cast to 'any' to bypass TypeScript's strict event type checking
    // These are valid OpenLayers pointer events
    this.map.on('pointerdown' as any, this.handlePointerDown)
    this.map.on('pointermove' as any, this.handlePointerMove)
    this.map.on('pointerup' as any, this.handlePointerUp)
    
    // Keyboard events for modifier keys
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }
  
  /**
   * Remove all event listeners.
   * IMPORTANT: Call this when component unmounts to prevent memory leaks!
   */
  public dispose(): void {
    // Cast to 'any' to bypass TypeScript's strict event type checking
    this.map.un('pointerdown' as any, this.handlePointerDown)
    this.map.un('pointermove' as any, this.handlePointerMove)
    this.map.un('pointerup' as any, this.handlePointerUp)
    
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Update the rectangle state.
   * Called externally when state changes from outside this interaction.
   */
  public setState(state: RectangleState): void {
    this.rectangleState = state
  }
  
  /**
   * Emit updated state through callback.
   */
  private updateState(state: RectangleState): void {
    this.rectangleState = state
    this.onUpdate(state)
  }
  
  // ============================================================================
  // KEYBOARD EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle key press (for modifier keys like Shift).
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
      this.shiftPressed = true
    }
  }
  
  /**
   * Handle key release.
   */
  private handleKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
      this.shiftPressed = false
    }
  }
  
  // ============================================================================
  // POINTER EVENT HANDLERS
  // ============================================================================
  
  /**
   * POINTER DOWN - Start of drag operation
   * 
   * Detects which handle (if any) was clicked and enters appropriate mode.
   * Also allows dragging the rectangle body itself to translate it.
   */
  private handlePointerDown(event: MapBrowserEvent<UIEvent>): void {
    // Get feature at click location
    const feature = this.getFeatureAtPixel(event.pixel)
    
    if (!feature) {
      return  // Clicked on empty map, not on a feature
    }
    
    // Check if it's a handle feature
    const handleType = feature.get('handleType') as HandleType | undefined
    
    if (handleType) {
      // User clicked on a handle - start drag operation
      this.activeHandle = feature
      this.startState = { ...this.rectangleState }
      this.startPixel = event.pixel as [number, number]
      this.mode = handleType
      
      // For corner handles, remember which corner
      if (handleType === 'corner') {
        this.draggedCorner = feature.get('cornerId') as CornerIdentifier
      }
      
      // For rotation handle, remember initial angle offset
      if (handleType === 'rotate') {
        const startCoord = this.map.getCoordinateFromPixel(event.pixel) as [number, number]
        this.startAngle = calculateAngle(this.rectangleState.center, startCoord)
      }
      
      // Prevent map panning while dragging handle
      event.stopPropagation()
    } else if (feature.get('type') === 'rectangle') {
      // User clicked on the rectangle body itself - allow translation
      // Treat it as dragging the center
      this.activeHandle = feature
      this.startState = { ...this.rectangleState }
      this.startPixel = event.pixel as [number, number]
      this.mode = 'center'
      
      // Prevent map panning while dragging rectangle
      event.stopPropagation()
    }
  }
  
  /**
   * POINTER MOVE - During drag operation
   * 
   * Updates rectangle based on cursor position and current mode.
   */
  private handlePointerMove(event: MapBrowserEvent<UIEvent>): void {
    // If not dragging, just update cursor
    if (!this.activeHandle) {
      this.updateCursor(event.pixel)
      return
    }
    
    // We're dragging - update rectangle based on mode
    switch (this.mode) {
      case 'corner':
        this.handleResize(event)
        break
      case 'rotate':
        this.handleRotate(event)
        break
      case 'center':
        this.handleMove(event)
        break
    }
    
    // Prevent default map behavior
    event.stopPropagation()
  }
  
  /**
   * POINTER UP - End of drag operation
   * 
   * Clears drag state and returns to idle mode.
   */
  private handlePointerUp(event: MapBrowserEvent<UIEvent>): void {
    if (this.activeHandle) {
      // End drag
      this.activeHandle = null
      this.startState = null
      this.startPixel = null
      this.startAngle = null
      this.mode = null
      this.draggedCorner = null
      
      event.stopPropagation()
    }
  }
  
  // ============================================================================
  // RESIZE LOGIC
  // ============================================================================
  
  /**
   * Handle resizing the rectangle by dragging a corner.
   * 
   * ALGORITHM:
   * 1. Get current cursor position in world coordinates
   * 2. Convert to rectangle's local coordinate system (unrotated)
   * 3. Calculate new dimensions based on cursor position
   * 4. Optionally maintain aspect ratio (if Shift pressed)
   * 5. Update rectangle state
   */
  private handleResize(event: MapBrowserEvent<UIEvent>): void {
    if (!this.startState || !this.draggedCorner) return
    
    // Get current cursor position in world coordinates
    const currentCoord = this.map.getCoordinateFromPixel(event.pixel) as [number, number]
    
    // Convert to rectangle's local coordinate system
    const localCoord = worldToLocal(
      currentCoord,
      this.startState.center,
      this.startState.angle
    )
    
    // Calculate new dimensions based on which corner is being dragged
    // The opposite corner stays fixed, the dragged corner moves
    let newWidth: number
    let newHeight: number
    
    switch (this.draggedCorner) {
      case 'bottomRight':
        // Dragging bottom-right: width and height both increase positively
        newWidth = Math.abs(localCoord[0] * 2)
        newHeight = Math.abs(localCoord[1] * 2)
        break
      
      case 'topRight':
        // Dragging top-right: width increases, height with y sign
        newWidth = Math.abs(localCoord[0] * 2)
        newHeight = Math.abs(localCoord[1] * 2)
        break
      
      case 'topLeft':
        // Dragging top-left: both decrease
        newWidth = Math.abs(localCoord[0] * 2)
        newHeight = Math.abs(localCoord[1] * 2)
        break
      
      case 'bottomLeft':
        // Dragging bottom-left: width decreases, height decreases
        newWidth = Math.abs(localCoord[0] * 2)
        newHeight = Math.abs(localCoord[1] * 2)
        break
      
      default:
        return
    }
    
    // If Shift is pressed, maintain aspect ratio
    if (this.shiftPressed && this.startState) {
      const aspectRatio = this.startState.width / this.startState.height
      // Adjust height to match aspect ratio
      newHeight = newWidth / aspectRatio
    }
    
    // Clamp to reasonable bounds
    newWidth = clamp(newWidth, this.MIN_SIZE, this.MAX_SIZE)
    newHeight = clamp(newHeight, this.MIN_SIZE, this.MAX_SIZE)
    
    // Update rectangle
    this.updateState({
      ...this.rectangleState,
      width: newWidth,
      height: newHeight,
    })
  }
  
  // ============================================================================
  // ROTATION LOGIC
  // ============================================================================
  
  /**
   * Handle rotating the rectangle by dragging the rotation handle.
   * 
   * ALGORITHM:
   * 1. Get current cursor position
   * 2. Calculate angle from rectangle center to cursor
   * 3. Calculate angle delta from initial position
   * 4. Add delta to original angle
   * 5. Optionally snap to 15° increments (if Shift pressed)
   * 6. Update rectangle angle
   */
  private handleRotate(event: MapBrowserEvent<UIEvent>): void {
    if (!this.startState || this.startAngle === null) return
    
    // Get current cursor position
    const currentCoord = this.map.getCoordinateFromPixel(event.pixel) as [number, number]
    
    // Calculate current angle from rectangle center to cursor
    const currentAngle = calculateAngle(this.rectangleState.center, currentCoord)
    
    // Calculate angle delta from initial position
    const angleDelta = currentAngle - this.startAngle
    
    // Add delta to original angle
    const angle = this.startState.angle + angleDelta
    
    // If Shift pressed, snap to 15° increments
    const finalAngle = this.shiftPressed ? snapAngle(angle) : angle
    
    // Update rectangle
    this.updateState({
      ...this.rectangleState,
      angle: finalAngle,
    })
  }
  
  // ============================================================================
  // MOVE LOGIC
  // ============================================================================
  
  /**
   * Handle moving the entire rectangle by dragging the center.
   * 
   * ALGORITHM:
   * 1. Calculate how far cursor has moved since drag started
   * 2. Add that delta to the original center position
   * 3. Update rectangle center
   */
  private handleMove(event: MapBrowserEvent<UIEvent>): void {
    if (!this.startState || !this.startPixel) return
    
    // Get current pixel position
    const currentPixel = event.pixel as [number, number]
    
    // Convert to coordinates (pixel positions not needed for coordinate-based calculations)
    const startCoord = this.map.getCoordinateFromPixel(this.startPixel) as [number, number]
    const currentCoord = this.map.getCoordinateFromPixel(currentPixel) as [number, number]
    
    const deltaCoord: [number, number] = [
      currentCoord[0] - startCoord[0],
      currentCoord[1] - startCoord[1],
    ]
    
    // Apply delta to original center
    const newCenter: [number, number] = [
      this.startState.center[0] + deltaCoord[0],
      this.startState.center[1] + deltaCoord[1],
    ]
    
    // Update rectangle
    this.updateState({
      ...this.rectangleState,
      center: newCenter,
    })
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Get the feature at a given pixel coordinate.
   * Used to detect if cursor is over a handle or the rectangle body.
   * Priority: handles first, then rectangle body.
   */
  private getFeatureAtPixel(pixel: number[]): Feature | null {
    let foundFeature: Feature | null = null
    
    this.map.forEachFeatureAtPixel(pixel, (feature) => {
      const feat = feature as Feature
      
      // Priority 1: Handle features (corners, rotation handle)
      if (feat.get('handleType')) {
        foundFeature = feat
        return true  // Stop searching - handle has priority
      }
      
      // Priority 2: Rectangle body (if no handle found yet)
      if (!foundFeature && feat.get('type') === 'rectangle') {
        foundFeature = feat
      }
      
      return false  // Continue searching for handles
    })
    
    return foundFeature
  }
  
  /**
   * Update cursor style based on what's under the mouse.
   * Provides visual feedback about what will happen on click.
   */
  private updateCursor(pixel: number[]): void {
    const feature = this.getFeatureAtPixel(pixel)
    const mapElement = this.map.getTargetElement()
    
    if (!mapElement) return
    
    if (feature) {
      const handleType = feature.get('handleType') as HandleType
      const featureType = feature.get('type') as string
      
      // Set cursor based on handle type
      switch (handleType) {
        case 'corner':
          mapElement.style.cursor = 'nwse-resize'
          break
        case 'rotate':
          mapElement.style.cursor = 'grab'
          break
        case 'center':
          mapElement.style.cursor = 'move'
          break
        default:
          // If it's the rectangle body, show move cursor
          if (featureType === 'rectangle') {
            mapElement.style.cursor = 'move'
          } else {
            mapElement.style.cursor = 'default'
          }
      }
    } else {
      // Not over a handle or rectangle
      mapElement.style.cursor = 'default'
    }
  }
}
