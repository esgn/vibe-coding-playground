# 📝 QUICK REFERENCE CARD

A handy cheat sheet for common tasks and concepts.

---

## 🎯 COMMON TASKS

### Change map starting position
**File:** `src/config/map.config.ts`
```typescript
view: {
  center: [x, y],  // Coordinates in EPSG:3857
  zoom: 6,         // 0 (far) to 19 (close)
}
```

### Change zoom limits
**File:** `src/config/map.config.ts`
```typescript
view: {
  minZoom: 0,    // How far out users can zoom
  maxZoom: 19,   // How far in users can zoom
}
```

### Use map with custom props
**File:** `src/App.tsx`
```typescript
<MapComponent
  center={[261204, 6250258]}
  initialZoom={10}
  minZoom={5}
  maxZoom={15}
  onMapInit={(map) => console.log('Ready!', map)}
  onError={(err) => console.error('Error!', err)}
/>
```

### Access the map instance
**File:** Any component
```typescript
const { map } = useMap()

// Wait for map to initialize
if (map) {
  // Do something with map
  const center = map.getView().getCenter()
  const zoom = map.getView().getZoom()
}
```

### Change colors
**File:** `src/components/MapComponent.css`
```css
/* Loading spinner */
.map-loading-spinner {
  border-top: 4px solid #YOUR_COLOR;
}

/* Error button */
.map-error button {
  background: #YOUR_COLOR;
}
```

### Add rectangle overlay
**File:** `src/App.tsx`
```typescript
const [rectangleState, setRectangleState] = useState<RectangleState>({
  center: [261204, 6250258],
  width: 2000,   // meters
  height: 1000,  // meters
  angle: 0       // radians
})

<RectangleOverlay
  map={map}
  state={rectangleState}
  onChange={setRectangleState}
  editable={true}
/>

<RectangleControls
  state={rectangleState}
  onChange={setRectangleState}
  position="top-right"
/>
```

### Customize rectangle style
**File:** Any component with RectangleOverlay
```typescript
<RectangleOverlay
  map={map}
  state={rectangleState}
  onChange={setRectangleState}
  style={{
    fillColor: 'rgba(255, 0, 0, 0.3)',
    strokeColor: '#ff0000',
    strokeWidth: 3,
    handleSize: 10,
    handleColor: '#ffffff'
  }}
/>
```

### Export rectangle to YAML
Rectangle controls include an "Export to YAML" button that generates:
```yaml
center:
  - 2.349014  # longitude
  - 48.852969 # latitude
angle: 45.00
extentX: 2000.00
extentY: 1000.00
```

Or programmatically:
```typescript
import { transform } from 'ol/proj'
import { radiansToDegrees } from './utils/rectangleGeometry'

const [lon, lat] = transform(state.center, 'EPSG:3857', 'EPSG:4326')
const angleDeg = radiansToDegrees(state.angle)
```

---

## 🔑 KEY SYNTAX

### React Component
```typescript
function MyComponent(props) {
  return <div>{props.text}</div>
}

// Usage:
<MyComponent text="Hello" />
```

### useState Hook
```typescript
// Declare state
const [count, setCount] = useState(0)

// Read state
console.log(count)

// Update state
setCount(5)
setCount(count + 1)
```

### useEffect Hook
```typescript
// Run once on mount
useEffect(() => {
  console.log('Component mounted')
}, [])

// Run when dependency changes
useEffect(() => {
  console.log('Value changed:', value)
}, [value])

// Cleanup on unmount
useEffect(() => {
  return () => {
    console.log('Cleanup')
  }
}, [])
```

### useRef Hook
```typescript
// Create ref
const myRef = useRef(null)

// Attach to element
<div ref={myRef} />

// Access element
if (myRef.current) {
  console.log(myRef.current)
}
```

### TypeScript Interface
```typescript
interface MyProps {
  required: string
  optional?: number
  callback?: (data: string) => void
}

function MyComponent(props: MyProps) {
  // TypeScript ensures props match interface
}
```

### Conditional Rendering
```typescript
// If-then
{isLoading && <LoadingSpinner />}

// If-else
{isLoading ? <LoadingSpinner /> : <Content />}

// Multiple conditions
{error ? (
  <ErrorMessage />
) : isLoading ? (
  <LoadingSpinner />
) : (
  <Content />
)}
```

---

## 🌍 MAP OPERATIONS

### Get current view
```typescript
const view = map.getView()
const center = view.getCenter()     // [x, y]
const zoom = view.getZoom()         // number
const rotation = view.getRotation() // radians
```

### Set view
```typescript
const view = map.getView()
view.setCenter([x, y])
view.setZoom(10)
view.animate({
  center: [x, y],
  zoom: 10,
  duration: 1000  // milliseconds
})
```

### Add event listener
```typescript
// Map click
map.on('click', (event) => {
  console.log('Clicked at:', event.coordinate)
})

// View change
map.on('moveend', () => {
  console.log('Map moved')
})

// Zoom change  
map.getView().on('change:resolution', () => {
  console.log('Zoom changed')
})
```

### Add a marker
```typescript
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Circle, Fill } from 'ol/style'

const marker = new Feature({
  geometry: new Point([x, y])
})

marker.setStyle(new Style({
  image: new Circle({
    radius: 6,
    fill: new Fill({ color: 'red' })
  })
}))

const vectorLayer = new VectorLayer({
  source: new VectorSource({
    features: [marker]
  })
})

map.addLayer(vectorLayer)
```

### Get map size
```typescript
const size = map.getSize()  // [width, height] in pixels
```

### Convert coordinates
```typescript
import { transform } from 'ol/proj'

// From EPSG:4326 (lat/lon) to EPSG:3857
const [x, y] = transform(
  [longitude, latitude],
  'EPSG:4326',
  'EPSG:3857'
)

// From EPSG:3857 to EPSG:4326
const [lon, lat] = transform(
  [x, y],
  'EPSG:3857',
  'EPSG:4326'
)
```

---

## 🔲 RECTANGLE OPERATIONS

### Create rectangle state
```typescript
import type { RectangleState } from './types/rectangle.types'

const rectangleState: RectangleState = {
  center: [261204, 6250258],  // EPSG:3857 coordinates
  width: 2000,                 // meters
  height: 1000,                // meters
  angle: 0                     // radians (0 = north)
}
```

### Update rectangle programmatically
```typescript
// Move rectangle
setRectangleState(prev => ({
  ...prev,
  center: [newX, newY]
}))

// Resize
setRectangleState(prev => ({
  ...prev,
  width: 3000,
  height: 1500
}))

// Rotate (45 degrees)
setRectangleState(prev => ({
  ...prev,
  angle: Math.PI / 4
}))
```

### Convert angles
```typescript
import { radiansToDegrees, degreesToRadians } from './utils/rectangleGeometry'

// Radians to degrees
const degrees = radiansToDegrees(state.angle)

// Degrees to radians
const radians = degreesToRadians(45)
```

### Get rectangle corners
```typescript
import { getCornerPositions } from './utils/rectangleGeometry'

const corners = getCornerPositions(rectangleState)
// Returns: { bottomLeft, bottomRight, topRight, topLeft }
// Each corner is [x, y] in map coordinates
```

### Create custom rectangle geometry
```typescript
import { createRectangleGeometry } from './utils/rectangleGeometry'

const geometry = createRectangleGeometry(rectangleState)
// Returns OpenLayers Polygon that can be added to a Feature
```

### Transform rectangle center to lat/lon
```typescript
import { transform } from 'ol/proj'

const [longitude, latitude] = transform(
  rectangleState.center,
  'EPSG:3857',
  'EPSG:4326'
)
```

### Listen to rectangle changes
```typescript
const handleRectangleChange = (newState: RectangleState) => {
  console.log('Rectangle changed:', {
    width: newState.width,
    height: newState.height,
    angle: radiansToDegrees(newState.angle)
  })
  
  // Save to backend, update other state, etc.
  setRectangleState(newState)
}

<RectangleOverlay
  map={map}
  state={rectangleState}
  onChange={handleRectangleChange}
/>
```

---

## 🎨 CSS QUICK REFERENCE

### Positioning
```css
/* Relative: positioned relative to normal position */
position: relative;

/* Absolute: positioned relative to nearest positioned ancestor */
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);  /* Center */
```

### Flexbox (for layouts)
```css
.container {
  display: flex;
  justify-content: center;  /* Horizontal centering */
  align-items: center;      /* Vertical centering */
  gap: 10px;                /* Space between items */
}
```

### Colors
```css
/* Named color */
color: red;

/* Hex */
color: #3498db;

/* RGB */
color: rgb(52, 152, 219);

/* RGBA (with transparency) */
background: rgba(255, 255, 255, 0.95);
```

### Animations
```css
/* Define animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Use animation */
.element {
  animation: fadeIn 0.3s ease-in;
}
```

---

## 📦 USEFUL COORDINATES (EPSG:3857)

France (country): `[260000, 6250000]`
Paris: `[261204, 6250258]`
Lyon: `[482600, 5456300]`
Marseille: `[535600, 5309600]`
Toulouse: `[138800, 5344000]`
Nice: `[746800, 5415700]`

**Find more:**
1. Visit https://epsg.io/map
2. Search for location
3. Switch to EPSG:3857
4. Copy coordinates

---

## 🐛 DEBUGGING CHECKLIST

### Map not showing
- [ ] Check browser console for errors
- [ ] Verify network requests succeed (F12 > Network tab)
- [ ] Check `mapRef.current` is not null
- [ ] Ensure OpenLayers CSS is imported
- [ ] Check container has width/height

### TypeScript errors
- [ ] Read error message completely
- [ ] Check type annotations
- [ ] Hover over variables to see inferred types
- [ ] Use TypeScript autocomplete (Ctrl+Space)

### Coordinates wrong
- [ ] Verify projection (EPSG:3857 vs EPSG:4326)
- [ ] Check coordinate order ([x, y] not [lat, lon])
- [ ] Use transform() to convert between projections

### Performance issues
- [ ] Check number of layers
- [ ] Verify zoom constraints
- [ ] Monitor network requests
- [ ] Check for memory leaks

---

## 🔢 IMPORTANT NUMBERS

### Zoom levels
- 0-2: World/continent
- 3-5: Country
- 6-9: Region
- 10-13: City
- 14-16: Neighborhood
- 17-19: Street/building

### Common HTTP status codes
- 200: OK
- 404: Not found
- 500: Server error
- 503: Service unavailable

### Z-index ranges
- 0: Default
- 1: Slightly elevated
- 10: Tooltips
- 100: Dropdowns
- 1000: Modals/overlays

---

## 💡 BEST PRACTICES

### Component Design
✅ Keep components small and focused
✅ Extract logic into custom hooks
✅ Use props for customization
✅ Handle loading and error states

### State Management
✅ Use useState for component-local state
✅ Use useRef for values that don't trigger re-renders
✅ Keep state as close as possible to where it's used

### TypeScript
✅ Always define types for props
✅ Use interfaces for object shapes
✅ Avoid `any` type unless necessary
✅ Leverage type inference when obvious

### Performance
✅ Use useEffect cleanup functions
✅ Memoize expensive calculations
✅ Avoid inline function definitions in render
✅ Keep dependency arrays accurate

---

## 📚 QUICK LINKS

**Documentation:**
- React: https://react.dev
- TypeScript: https://typescriptlang.org
- OpenLayers: https://openlayers.org
- IGN Géoportail: https://geoservices.ign.fr

**Tools:**
- Coordinate converter: https://epsg.io
- CSS reference: https://developer.mozilla.org/en-US/docs/Web/CSS
- TypeScript playground: https://typescriptlang.org/play

---

*Keep this reference handy while coding! 🚀*
