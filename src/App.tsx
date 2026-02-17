import './App.css'
import MapComponent from './components/MapComponent'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <MapComponent />
      </ErrorBoundary>
    </div>
  )
}

export default App
