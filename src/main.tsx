/**
 * ==============================================================================
 * MAIN ENTRY POINT
 * ==============================================================================
 * 
 * This is the FIRST file that runs when the application loads.
 * It's responsible for "mounting" (attaching) our React app to the HTML page.
 * 
 * WHAT HAPPENS HERE?
 * 1. Find the HTML element with id="root" (in index.html)
 * 2. Tell React to render our App component into that element
 * 3. The app appears on screen!
 * 
 * THINK OF IT LIKE:
 * - index.html: The container/frame
 * - main.tsx: The bridge between HTML and React
 * - App.tsx: The actual React application
 * ==============================================================================
 */

// Import React library
// We need this even though we don't use it directly
// (JSX gets converted to React.createElement calls)
import React from 'react'

// Import ReactDOM - the library that connects React to the browser's DOM
// DOM = Document Object Model (the structure of the HTML page)
import ReactDOM from 'react-dom/client'

// Import our root App component
import App from './App'

// Import global CSS styles that apply to the entire app
import './index.css'

/**
 * CREATE ROOT AND RENDER APP
 * 
 * This is where the magic happens - connecting React to HTML!
 */

// STEP 1: GET THE ROOT ELEMENT
// document.getElementById('root') finds the <div id="root"> in index.html
// The ! tells TypeScript "I know this element exists, trust me"
// (Without !, TypeScript worries it might be null)
const rootElement = document.getElementById('root')!

// STEP 2: CREATE A REACT ROOT
// ReactDOM.createRoot() creates a React "root" at that DOM element
// This is the entry point where React takes control
const root = ReactDOM.createRoot(rootElement)

// STEP 3: RENDER THE APP
// root.render() tells React to render our component tree starting with <App />
root.render(
  // REACT.STRICTMODE
  // A wrapper component that helps catch potential problems:
  // - Warns about deprecated APIs
  // - Detects unexpected side effects
  // - Validates that components follow best practices
  // 
  // It ONLY runs in development mode, not in production.
  // It may cause components to render twice (intentionally) to detect bugs.
  <React.StrictMode>
    {/*
      OUR APP COMPONENT
      This is the root of our actual application.
      Everything else (MapComponent, ErrorBoundary, etc.) is inside App.
    */}
    <App />
  </React.StrictMode>,
)

/**
 * EXECUTION FLOW SUMMARY:
 * 
 * 1. Browser loads index.html
 * 2. index.html loads this main.tsx file via <script> tag
 * 3. This file runs:
 *    - Finds the <div id="root"> element
 *    - Creates a React root at that element  
 *    - Renders <App /> component into it
 * 4. App renders:
 *    - ErrorBoundary component
 *    - MapComponent component
 * 5. MapComponent renders:
 *    - Calls useMap hook
 *    - Hook initializes OpenLayers map
 *    - Map appears on screen!
 */
