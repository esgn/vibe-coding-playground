# React OpenLayers IGN Map

A React + TypeScript webapp that displays an interactive OpenLayers map with the PLAN IGN V2 WMTS dataset from IGN France, featuring an interactive rectangle overlay tool with resize, rotate, and YAML export capabilities.

## 🚀 Live Demo

Visit the live application: [https://esgn.github.io/vibe-coding-playground/](https://esgn.github.io/vibe-coding-playground/)

## 📖 Documentation

- **[Beginner's Guide](BEGINNERS_GUIDE.md)** - Complete guide for beginners with detailed explanations
- **[Quick Reference](QUICK_REFERENCE.md)** - Handy cheat sheet for common tasks
- **[Usage Examples](src/examples.tsx)** - Code examples showing different use cases

💡 **New to React/TypeScript/OpenLayers?** Start with the [Beginner's Guide](BEGINNERS_GUIDE.md)!

## Features

### Map Features
- ✅ Full screen OpenLayers map
- ✅ IGN PLAN V2 WMTS layer (French geographical data)
- ✅ Smooth pan and zoom controls
- ✅ Loading states and error handling
- ✅ Configurable props (center, zoom, callbacks)

### Rectangle Overlay Tool
- ✅ Interactive rectangle overlay on the map
- ✅ Drag rectangle body to move/translate
- ✅ Drag corner handles to resize
- ✅ Drag top handle to rotate
- ✅ Hold Shift while rotating to snap to 15° increments
- ✅ Properties panel with real-time dimensions
- ✅ Manual input for precise width/height/angle values
- ✅ YAML export with WGS84 coordinates

### Technical Features
- ✅ TypeScript for type safety
- ✅ Vite for fast development and building
- ✅ Custom hooks for map management
- ✅ Error boundaries
- ✅ Clean architecture with separation of concerns
- ✅ Automated GitHub Pages deployment

## Project Structure

```
src/
├── components/
│   ├── MapComponent.tsx          # Main map component
│   ├── MapComponent.css          # Map styles
│   ├── RectangleOverlay.tsx      # Rectangle overlay component
│   ├── RectangleControls.tsx     # Rectangle properties UI panel
│   ├── RectangleControls.css     # Controls panel styles
│   ├── ErrorBoundary.tsx         # Error boundary wrapper
│   └── index.ts                  # Component exports
├── hooks/
│   ├── useMap.ts                 # Map initialization hook
│   ├── useRectangleOverlay.ts    # Rectangle overlay hook
│   └── index.ts                  # Hook exports
├── interactions/
│   └── RectangleInteraction.ts   # Rectangle user interaction handler
├── utils/
│   └── rectangleGeometry.ts      # Rectangle geometry calculations
├── config/
│   └── map.config.ts             # Centralized configuration
├── types/
│   ├── map.types.ts              # Map type definitions
│   └── rectangle.types.ts        # Rectangle type definitions
├── App.tsx                       # Root component
├── main.tsx                      # Entry point
├── index.css                     # Global styles
└── examples.tsx                  # Usage examples
```

## Architecture

### Components
- **MapComponent**: Renders the OpenLayers map with loading and error states
- **RectangleOverlay**: Renders interactive rectangle on the map (controlled component)
- **RectangleControls**: UI panel showing rectangle properties with input fields
- **ErrorBoundary**: React error boundary to catch and display rendering errors

### Hooks
- **useMap**: Encapsulates map initialization logic:
  - WMTS layer configuration
  - Map instance management
  - Error handling and cleanup
- **useRectangleOverlay**: Manages rectangle overlay:
  - Vector layer creation
  - Feature rendering (rectangle + handles)
  - State synchronization
  - Cleanup on unmount

### Interactions
- **RectangleInteraction**: Custom OpenLayers interaction handler:
  - Pointer event handling (down/move/up)
  - Drag/resize/rotate logic
  - Keyboard modifier support (Shift for snapping)
  - Cursor feedback

### Utilities
- **rectangleGeometry.ts**: Mathematical functions for:
  - Rectangle creation with rotation
  - Coordinate transformations (world ↔ local)
  - Corner and handle position calculations
  - Angle conversions (radians ↔ degrees)

### Configuration
- **map.config.ts**: IGN API settings, map view configuration, WMTS parameters
- **map.types.ts**: TypeScript interfaces for map-related types
- **rectangle.types.ts**: TypeScript interfaces for rectangle overlay types

### Design Patterns
- **Controlled Components**: State managed by parent, passed down as props
- **Custom Hooks**: Encapsulate complex logic, promote reusability
- **Separation of Concerns**: Logic, presentation, configuration separated
- **Type Safety**: Full TypeScript coverage with strict mode
- **Error Handling**: Comprehensive error boundaries and try-catch blocks

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Deployment

The application automatically deploys to GitHub Pages on push to the `main` branch.

**Manual deployment:**
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

**GitHub Pages setup:**
1. Push code to GitHub repository
2. GitHub Actions workflow (`.github/workflows/gh-pages.yml`) automatically builds and deploys
3. Enable GitHub Pages in repository settings (source: gh-pages branch)
4. Site will be available at `https://<username>.github.io/vibe-coding-playground/`

## Usage

### Basic Usage

```tsx
import MapComponent from './components/MapComponent'

function App() {
  return <MapComponent />
}
```

### With Custom Configuration

```tsx
import MapComponent from './components/MapComponent'

function App() {
  return (
    <MapComponent
      center={[261204, 6250258]}  // Paris coordinates
      initialZoom={10}
      minZoom={5}
      maxZoom={18}
    />
  )
}
```

### With Callbacks

```tsx
import MapComponent from './components/MapComponent'
import type Map from 'ol/Map'

function App() {
  const handleMapInit = (map: Map) => {
    console.log('Map initialized!', map)
    
    // Add custom interactions
    map.on('click', (event) => {
      console.log('Clicked at:', event.coordinate)
    })
  }

  const handleError = (error: Error) => {
    console.error('Map error:', error)
  }

  return (
    <MapComponent
      onMapInit={handleMapInit}
      onError={handleError}
    />
  )
}
```

See [examples.tsx](src/examples.tsx) for more usage examples.

## Usage

### Map Controls

- **Pan**: Click and drag the map
- **Zoom**: Use mouse wheel or pinch gesture on touch devices
- **Zoom buttons**: Use the + and - buttons in the top-left corner

### Rectangle Overlay Controls

- **Move**: Click and drag the rectangle body
- **Resize**: Click and drag any corner handle
- **Rotate**: Click and drag the top handle (above rectangle)
- **Snap Rotation**: Hold Shift while rotating to snap to 15° increments
- **Manual Input**: Type exact values in the properties panel
- **Export**: Click "Export to YAML" to get configuration with WGS84 coordinates

### Rectangle Properties Panel

The top-right panel shows:
- **Width (m)**: Rectangle width in meters
- **Height (m)**: Rectangle height in meters
- **Angle (°)**: Rotation angle in degrees (0° = north)
- **Center**: Map coordinates (EPSG:3857)

You can edit these values directly by clicking on the input fields.

### YAML Export

Export rectangle configuration in YAML format:
```yaml
center:
  - 2.349014  # longitude (WGS84)
  - 48.852969 # latitude (WGS84)
angle: 45.00  # degrees
extentX: 2000.00  # width in meters
extentY: 1000.00  # height in meters
```

## Configuration

You can customize the map behavior by editing [src/config/map.config.ts](src/config/map.config.ts):

```typescript
export const MAP_CONFIG = {
  ign: {
    url: 'https://data.geopf.fr/wmts',
    layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
    // ... other IGN settings
  },
  view: {
    center: [260000, 6250000],
    zoom: 6,
    maxZoom: 19,
    // ... other view settings
  },
}
```

## API Reference

### MapComponent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `[number, number]` | `[260000, 6250000]` | Initial center coordinates in EPSG:3857 |
| `initialZoom` | `number` | `6` | Initial zoom level |
| `minZoom` | `number` | `0` | Minimum zoom level |
| `maxZoom` | `number` | `19` | Maximum zoom level |
| `className` | `string` | `''` | Additional CSS class for the map container |
| `onMapInit` | `(map: Map) => void` | `undefined` | Callback when map is initialized |
| `onError` | `(error: Error) => void` | `undefined` | Callback when map fails to initialize |

### RectangleOverlay Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `map` | `Map` | ✅ | OpenLayers map instance |
| `state` | `RectangleState` | ✅ | Current rectangle configuration |
| `onChange` | `(state: RectangleState) => void` | ❌ | Callback when rectangle changes |
| `editable` | `boolean` | ❌ | Whether user can interact (default: true) |
| `style` | `RectangleStyle` | ❌ | Visual style overrides |

### RectangleControls Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `state` | `RectangleState` | ✅ | Current rectangle configuration |
| `onChange` | `(state: RectangleState) => void` | ✅ | Callback to update rectangle |
| `editable` | `boolean` | ❌ | Whether controls are editable (default: true) |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | ❌ | Panel position (default: 'top-right') |

### RectangleState Type

```typescript
interface RectangleState {
  center: [number, number]  // Center coordinates in EPSG:3857
  width: number             // Width in meters
  height: number            // Height in meters
  angle: number             // Rotation angle in radians
}
```

## License

MIT
