/**
 * ==============================================================================
 * RECTANGLE CONTROLS COMPONENT
 * ==============================================================================
 * 
 * UI panel that displays rectangle properties and allows manual input.
 * Shows width, height, angle in human-readable format.
 * Optional: Allows user to type exact values instead of dragging.
 * ==============================================================================
 */

import { useState, useEffect } from 'react'
import { transform } from 'ol/proj'
import type { RectangleState } from '../types/rectangle.types'
import { radiansToDegrees, degreesToRadians } from '../utils/rectangleGeometry'
import './RectangleControls.css'

/**
 * PROPS INTERFACE
 */
interface RectangleControlsProps {
  /** Current rectangle state */
  state: RectangleState
  
  /** Callback to update rectangle */
  onChange: (state: RectangleState) => void
  
  /** Whether controls are editable (default: true) */
  editable?: boolean
  
  /** Position of the controls panel */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

/**
 * RECTANGLE CONTROLS COMPONENT
 * 
 * A UI panel that shows and allows editing of rectangle properties.
 * 
 * FEATURES:
 * - Display width, height, and angle
 * - Input fields to set exact values
 * - Real-time updates when dragging rectangle
 * - Validation of input values
 * 
 * USAGE:
 * ```tsx
 * const [rectangleState, setRectangleState] = useState(...)
 * 
 * <RectangleControls
 *   state={rectangleState}
 *   onChange={setRectangleState}
 *   position="top-right"
 * />
 * ```
 */
export function RectangleControls({
  state,
  onChange,
  editable = true,
  position = 'top-right',
}: RectangleControlsProps) {
  // ===========================================================================
  // LOCAL STATE FOR INPUT FIELDS
  // ===========================================================================
  // We use local state for input values to allow typing without immediately
  // affecting the map. Only when user presses Enter or blurs the field
  // do we update the actual rectangle.
  
  const [widthInput, setWidthInput] = useState(Math.round(state.width).toString())
  const [heightInput, setHeightInput] = useState(Math.round(state.height).toString())
  const [angleInput, setAngleInput] = useState(Math.round(radiansToDegrees(state.angle)).toString())
  
  // State for YAML export modal
  const [showYamlModal, setShowYamlModal] = useState(false)
  const [yamlContent, setYamlContent] = useState('')
  
  // ===========================================================================
  // SYNC INPUT WITH PROPS
  // ===========================================================================
  // When rectangle changes externally (e.g., user drags on map),
  // update our input fields to match.
  
  useEffect(() => {
    setWidthInput(Math.round(state.width).toString())
    setHeightInput(Math.round(state.height).toString())
    setAngleInput(Math.round(radiansToDegrees(state.angle)).toString())
  }, [state])
  
  // ===========================================================================
  // INPUT HANDLERS
  // ===========================================================================
  
  /**
   * Handle width input change.
   * Validates and updates rectangle width.
   */
  const handleWidthChange = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      onChange({
        ...state,
        width: num,
      })
    }
  }
  
  /**
   * Handle height input change.
   */
  const handleHeightChange = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      onChange({
        ...state,
        height: num,
      })
    }
  }
  
  /**
   * Handle angle input change.
   * Converts degrees to radians for storage.
   */
  const handleAngleChange = (value: string) => {
    const degrees = parseFloat(value)
    if (!isNaN(degrees)) {
      onChange({
        ...state,
        angle: degreesToRadians(degrees),
      })
    }
  }
  
  /**
   * Handle key press in input fields.
   * Enter key applies the change.
   * Escape key reverts to current state.
   */
  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
    type: 'width' | 'height' | 'angle'
  ) => {
    if (event.key === 'Enter') {
      // Apply change
      const input = event.currentTarget
      
      switch (type) {
        case 'width':
          handleWidthChange(widthInput)
          break
        case 'height':
          handleHeightChange(heightInput)
          break
        case 'angle':
          handleAngleChange(angleInput)
          break
      }
      
      input.blur()  // Remove focus
    } else if (event.key === 'Escape') {
      // Revert to current state
      setWidthInput(Math.round(state.width).toString())
      setHeightInput(Math.round(state.height).toString())
      setAngleInput(Math.round(radiansToDegrees(state.angle)).toString())
      
      event.currentTarget.blur()
    }
  }
  
  /**
   * Handle export to YAML.
   * Converts rectangle properties to YAML format with:
   * - center in longitude/latitude (WGS84 / EPSG:4326)
   * - angle in degrees
   * - extentX (width) and extentY (height) in meters
   */
  const handleExportYaml = () => {
    // Convert center from Web Mercator (EPSG:3857) to WGS84 (EPSG:4326)
    const [longitude, latitude] = transform(state.center, 'EPSG:3857', 'EPSG:4326')
    
    // Convert angle to degrees
    const angleDegrees = radiansToDegrees(state.angle)
    
    // Format as YAML
    const yaml = `center:
  - ${longitude.toFixed(6)}  # longitude
  - ${latitude.toFixed(6)}   # latitude
angle: ${angleDegrees.toFixed(2)}  # degrees
extentX: ${state.width.toFixed(2)}  # width in meters
extentY: ${state.height.toFixed(2)}  # height in meters`
    
    setYamlContent(yaml)
    setShowYamlModal(true)
  }
  
  /**
   * Handle copy YAML to clipboard.
   */
  const handleCopyYaml = () => {
    navigator.clipboard.writeText(yamlContent)
  }
  
  /**
   * Handle close YAML modal.
   */
  const handleCloseModal = () => {
    setShowYamlModal(false)
  }
  
  // ===========================================================================
  // RENDER
  // ===========================================================================
  
  return (
    <div className={`rectangle-controls rectangle-controls--${position}`}>
      {/* HEADER */}
      <div className="rectangle-controls__header">
        <h3>Rectangle Properties</h3>
      </div>
      
      {/* PROPERTIES */}
      <div className="rectangle-controls__body">
        {/* WIDTH */}
        <div className="rectangle-controls__field">
          <label htmlFor="rect-width">Width (m)</label>
          {editable ? (
            <input
              id="rect-width"
              type="number"
              value={widthInput}
              onChange={(e) => setWidthInput(e.target.value)}
              onBlur={() => handleWidthChange(widthInput)}
              onKeyDown={(e) => handleKeyPress(e, 'width')}
              min="1"
              step="10"
            />
          ) : (
            <span className="rectangle-controls__value">{widthInput} m</span>
          )}
        </div>
        
        {/* HEIGHT */}
        <div className="rectangle-controls__field">
          <label htmlFor="rect-height">Height (m)</label>
          {editable ? (
            <input
              id="rect-height"
              type="number"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              onBlur={() => handleHeightChange(heightInput)}
              onKeyDown={(e) => handleKeyPress(e, 'height')}
              min="1"
              step="10"
            />
          ) : (
            <span className="rectangle-controls__value">{heightInput} m</span>
          )}
        </div>
        
        {/* ANGLE */}
        <div className="rectangle-controls__field">
          <label htmlFor="rect-angle">Angle (°)</label>
          {editable ? (
            <input
              id="rect-angle"
              type="number"
              value={angleInput}
              onChange={(e) => setAngleInput(e.target.value)}
              onBlur={() => handleAngleChange(angleInput)}
              onKeyDown={(e) => handleKeyPress(e, 'angle')}
              step="1"
            />
          ) : (
            <span className="rectangle-controls__value">{angleInput}°</span>
          )}
        </div>
        
        {/* CENTER COORDINATES (READ-ONLY) */}
        <div className="rectangle-controls__field">
          <label>Center</label>
          <span className="rectangle-controls__value rectangle-controls__value--small">
            X: {Math.round(state.center[0])}
            <br />
            Y: {Math.round(state.center[1])}
          </span>
        </div>
      </div>
      
      {/* HELP TEXT */}
      {editable && (
        <div className="rectangle-controls__footer">
          <p className="rectangle-controls__hint">
            💡 Drag rectangle to move • Drag corners to resize • Drag top handle to rotate
          </p>
          <p className="rectangle-controls__hint">
            Hold Shift while rotating to snap to 15° increments
          </p>
          <button 
            className="rectangle-controls__export-btn"
            onClick={handleExportYaml}
          >
            Export to YAML
          </button>
        </div>
      )}
      
      {/* YAML EXPORT MODAL */}
      {showYamlModal && (
        <div className="yaml-modal" onClick={handleCloseModal}>
          <div className="yaml-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="yaml-modal__header">
              <h3>Rectangle Configuration (YAML)</h3>
              <button 
                className="yaml-modal__close"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <pre className="yaml-modal__body">{yamlContent}</pre>
            <div className="yaml-modal__footer">
              <button 
                className="yaml-modal__copy-btn"
                onClick={handleCopyYaml}
              >
                Copy to Clipboard
              </button>
              <button 
                className="yaml-modal__close-btn"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
