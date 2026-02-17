/**
 * ==============================================================================
 * RECTANGLE OVERLAY HOOK
 * ==============================================================================
 * 
 * Custom React hook that manages the rectangle overlay logic.
 * Handles:
 * - Rectangle state management
 * - Vector layer creation  
 * - Feature rendering (rectangle + handles)
 * - Interaction setup
 * - Cleanup
 * 
 * This follows React patterns by keeping logic separate from presentation.
 * ==============================================================================
 */

import { useEffect, useRef, useCallback, useMemo } from 'react'
import type Map from 'ol/Map'
import { Feature } from 'ol'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'
import { Point } from 'ol/geom'
import type { 
  RectangleState, 
  RectangleStyle,
  CornerIdentifier 
} from '../types/rectangle.types'
import {
  createRectangleGeometry,
  getCornerPositions,
  getRotationHandlePosition,
} from '../utils/rectangleGeometry'
import { RectangleInteraction } from '../interactions/RectangleInteraction'

/**
 * DEFAULT STYLE
 * 
 * Default visual appearance for the rectangle if none provided.
 */
const DEFAULT_STYLE: Required<RectangleStyle> = {
  fillColor: 'rgba(52, 152, 219, 0.3)',  // Blue, 30% transparent
  strokeColor: '#3498db',                 // Blue
  strokeWidth: 2,
  handleSize: 8,
  handleColor: '#ffffff',
}

/**
 * USE RECTANGLE OVERLAY HOOK
 * 
 * Main hook for rectangle overlay functionality.
 * This is a CONTROLLED hook - it doesn't manage state internally.
 * 
 * PARAMETERS:
 * - map: OpenLayers map instance (can be null during initialization)
 * - state: Current rectangle configuration (controlled by parent)
 * - onChange: Callback when rectangle changes (parent updates state)
 * - editable: Whether user can interact (default: true)
 * - style: Visual style overrides
 * 
 * CONTROLLED PATTERN:
 * Parent component manages state, hook just renders and reports changes.
 */
export function useRectangleOverlay(
  map: Map | null,
  state: RectangleState,
  onChange?: (state: RectangleState) => void,
  editable: boolean = true,
  style?: RectangleStyle
) {
  // ===========================================================================
  // STATE
  // ===========================================================================
  
  /**
   * This hook is now fully controlled.
   * It receives state from parent and renders it.
   * When user interacts, it calls onChange to notify parent.
   * Parent is responsible for updating the state.
   */
  
  // Merge provided style with defaults
  // useMemo prevents recreating this object on every render
  const finalStyle: Required<RectangleStyle> = useMemo(() => ({
    ...DEFAULT_STYLE,
    ...style,
  }), [style])
  
  // ===========================================================================
  // REFS
  // ===========================================================================
  
  // Vector layer that holds all rectangle-related features
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)
  
  // Vector source that manages the features
  const sourceRef = useRef<VectorSource | null>(null)
  
  // Interaction handler for user input
  const interactionRef = useRef<RectangleInteraction | null>(null)
  
  // ===========================================================================
  // FEATURE CREATION
  // ===========================================================================
  
  /**
   * Create the main rectangle feature.
   */
  const createRectangleFeature = useCallback((rectState: RectangleState): Feature => {
    const geometry = createRectangleGeometry(rectState)
    const feature = new Feature({ geometry })
    
    // Set style
    feature.setStyle(
      new Style({
        fill: new Fill({ color: finalStyle.fillColor }),
        stroke: new Stroke({ 
          color: finalStyle.strokeColor, 
          width: finalStyle.strokeWidth 
        }),
      })
    )
    
    // Mark as rectangle (not a handle)
    feature.set('type', 'rectangle')
    
    return feature
  }, [finalStyle])
  
  /**
   * Create corner handle features.
   * Returns 4 features, one for each corner.
   */
  const createCornerHandles = useCallback((state: RectangleState): Feature[] => {
    const corners = getCornerPositions(state)
    const handles: Feature[] = []
    
    // Create a handle for each corner
    const cornerIds: CornerIdentifier[] = [
      'bottomLeft',
      'bottomRight', 
      'topRight',
      'topLeft'
    ]
    
    cornerIds.forEach((cornerId) => {
      const position = corners[cornerId]
      const feature = new Feature({
        geometry: new Point(position),
      })
      
      // Mark as corner handle and remember which corner
      feature.set('handleType', 'corner')
      feature.set('cornerId', cornerId)
      
      // Style as a circle
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: finalStyle.handleSize,
            fill: new Fill({ color: finalStyle.handleColor }),
            stroke: new Stroke({ 
              color: finalStyle.strokeColor, 
              width: 2 
            }),
          }),
        })
      )
      
      handles.push(feature)
    })
    
    return handles
  }, [finalStyle])
  
  /**
   * Create rotation handle feature.
   * This appears above the rectangle for rotation.
   */
  const createRotationHandle = useCallback((state: RectangleState): Feature => {
    const position = getRotationHandlePosition(state)
    const feature = new Feature({
      geometry: new Point(position),
    })
    
    // Mark as rotation handle
    feature.set('handleType', 'rotate')
    
    // Style as a larger circle (distinct from corner handles)
    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: finalStyle.handleSize + 2,
          fill: new Fill({ color: finalStyle.handleColor }),
          stroke: new Stroke({ 
            color: '#e74c3c',  // Red to distinguish from corners
            width: 2 
          }),
        }),
      })
    )
    
    return feature
  }, [finalStyle])
  
  /**
   * Create all features (rectangle + handles).
   */
  const createAllFeatures = useCallback((rectState: RectangleState): Feature[] => {
    const features = [
      createRectangleFeature(rectState),
    ]
    
    // Only add handles if editable
    if (editable) {
      features.push(...createCornerHandles(rectState))
      features.push(createRotationHandle(rectState))
    }
    
    return features
  }, [createRectangleFeature, createCornerHandles, createRotationHandle, editable])
  
  // ===========================================================================
  // EFFECTS
  // ===========================================================================
  
  /**
   * EFFECT: Initialize layer and interaction when map is ready.
   * Runs once when map becomes available.
   */
  useEffect(() => {
    if (!map) return
    
    // Create vector source and layer
    const source = new VectorSource()
    const layer = new VectorLayer({
      source: source,
      // Layer sits above map tiles but below other overlays
      zIndex: 100,
    })
    
    // Store in refs
    sourceRef.current = source
    layerRef.current = layer
    
    // Add layer to map
    map.addLayer(layer)
    
    // Add initial features
    const features = createAllFeatures(state)
    source.addFeatures(features)
    
    // Setup interaction if editable
    if (editable) {
      const interaction = new RectangleInteraction(
        map,
        state,
        (newState) => {
          // Call onChange callback when user interacts
          if (onChange) {
            onChange(newState)
          }
        }
      )
      
      interactionRef.current = interaction
    }
    
    // CLEANUP FUNCTION
    // Called when component unmounts or map changes
    return () => {
      // Remove layer from map
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
      }
      
      // Dispose interaction (remove event listeners)
      if (interactionRef.current) {
        interactionRef.current.dispose()
      }
      
      // Clear refs
      layerRef.current = null
      sourceRef.current = null
      interactionRef.current = null
    }
    // Only re-run if map or editable changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, editable])
  
  /**
   * EFFECT: Update features when rectangle state changes from parent.
   * This runs whenever state prop values actually change.
   * 
   * We depend on individual state properties to prevent unnecessary updates
   * when the state object reference changes but values stay the same.
   */
  useEffect(() => {
    if (!sourceRef.current) return
    
    // Clear existing features
    sourceRef.current.clear()
    
    // Add updated features
    const features = createAllFeatures(state)
    sourceRef.current.addFeatures(features)
    
    // Update interaction state
    if (interactionRef.current) {
      interactionRef.current.setState(state)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.center[0],
    state.center[1], 
    state.width, 
    state.height, 
    state.angle,
  ])
}
