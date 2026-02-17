# React OpenLayers IGN Map

A simple React + TypeScript webapp that displays an OpenLayers map in full screen with the PLAN IGN V2 WMTS dataset from IGN France.

## Features

- ✅ Full screen OpenLayers map
- ✅ IGN PLAN V2 WMTS layer (French geographical data)
- ✅ TypeScript for type safety
- ✅ Vite for fast development and building
- ✅ Custom hooks for map management
- ✅ Error boundaries and error handling
- ✅ Loading states
- ✅ Configurable props (center, zoom, callbacks)
- ✅ Clean architecture with separation of concerns

## Project Structure

```
src/
├── components/
│   ├── MapComponent.tsx       # Main map component
│   ├── MapComponent.css       # Map styles
│   └── ErrorBoundary.tsx      # Error boundary wrapper
├── hooks/
│   └── useMap.ts              # Custom hook for map initialization
├── config/
│   └── map.config.ts          # Centralized configuration
├── types/
│   └── map.types.ts           # TypeScript type definitions
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point
├── index.css                  # Global styles
└── examples.tsx               # Usage examples
```

## Architecture

### Components
- **MapComponent**: Presentational component that renders the map and handles UI states (loading, error)
- **ErrorBoundary**: React error boundary to catch and display rendering errors

### Hooks
- **useMap**: Custom hook that encapsulates all map initialization logic, including:
  - WMTS layer configuration
  - Map instance management
  - Error handling
  - Cleanup on unmount

### Configuration
- **map.config.ts**: Centralized configuration for IGN API, map view settings, and WMTS parameters
- **map.types.ts**: TypeScript interfaces for type safety and documentation

### Benefits
- **Separation of Concerns**: Logic (hook), presentation (component), and configuration are separated
- **Reusability**: The `useMap` hook can be used in different components
- **Type Safety**: Full TypeScript coverage with custom types
- **Error Handling**: Comprehensive error handling at multiple levels
- **Testability**: Isolated units that can be tested independently

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

## Map Controls

- **Pan**: Click and drag the map
- **Zoom**: Use mouse wheel or pinch gesture on touch devices
- **Zoom buttons**: Use the + and - buttons in the top-left corner

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

## API Props

The `MapComponent` accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `[number, number]` | `[260000, 6250000]` | Initial center coordinates in EPSG:3857 |
| `initialZoom` | `number` | `6` | Initial zoom level |
| `minZoom` | `number` | `0` | Minimum zoom level |
| `maxZoom` | `number` | `19` | Maximum zoom level |
| `className` | `string` | `''` | Additional CSS class for the map container |
| `onMapInit` | `(map: Map) => void` | `undefined` | Callback when map is initialized |
| `onError` | `(error: Error) => void` | `undefined` | Callback when map fails to initialize |

## IGN API Key

This project uses the public WMTS endpoint from IGN France. For production use, you should:

1. Register at [IGN Géoportail](https://geoservices.ign.fr/)
2. Get your own API key
3. Update the URL in [src/config/map.config.ts](src/config/map.config.ts)

## License

MIT
