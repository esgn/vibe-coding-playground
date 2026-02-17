/**
 * ==============================================================================
 * ERROR BOUNDARY COMPONENT
 * ==============================================================================
 * 
 * WHAT'S AN ERROR BOUNDARY?
 * React components can throw errors during rendering. Without an error boundary,
 * one error would crash the entire app and show a blank screen to users.
 * 
 * An error boundary "catches" these errors (like a try-catch for components)
 * and shows a fallback UI instead of crashing.
 * 
 * WHY A CLASS COMPONENT?
 * Error boundaries MUST be class components (not functional components).
 * This is a React limitation - the error catching lifecycle methods only
 * exist in class components.
 * ==============================================================================
 */

// Import Component class and ReactNode type from React
import { Component, type ReactNode } from 'react'
// - Component: Base class for React class components
// - ReactNode: TypeScript type for anything that can be rendered (JSX, string, number, etc.)

/**
 * PROPS INTERFACE
 * Defines what props this component accepts
 */
interface Props {
  // CHILDREN: The components/content to wrap and protect
  // This error boundary will catch errors from any children
  children: ReactNode
  
  // FALLBACK: Optional custom UI to show when an error occurs
  // If not provided, we show a default error message
  fallback?: ReactNode
}

/**
 * STATE INTERFACE
 * Defines the component's internal state
 */
interface State {
  // HAS_ERROR: Boolean flag - true if an error was caught
  hasError: boolean
  
  // ERROR: The actual error object (null if no error)
  error: Error | null
}

/**
 * ERROR BOUNDARY CLASS COMPONENT
 * 
 * EXTENDS Component<Props, State>
 * This means our class inherits from React's Component class.
 * <Props, State> tells TypeScript what types our props and state are.
 */
export class ErrorBoundary extends Component<Props, State> {
  /**
   * CONSTRUCTOR
   * 
   * Special method that runs when creating a new instance of this component.
   * Used to set up initial state.
   * 
   * PARAMETER:
   * - props: The props passed to this component
   */
  constructor(props: Props) {
    // Call the parent class (Component) constructor
    // This is REQUIRED in class components before using 'this'
    super(props)
    
    // SET INITIAL STATE
    // When the component first renders, there's no error yet
    this.state = { hasError: false, error: null }
  }

  /**
   * GET_DERIVED_STATE_FROM_ERROR
   * 
   * SPECIAL LIFECYCLE METHOD
   * React calls this automatically when a child component throws an error.
   * 
   * WHY 'static'?
   * Static methods belong to the class itself, not instances.
   * This method doesn't need access to 'this' - it just converts
   * an error into new state.
   * 
   * PARAMETER:
   * - error: The error that was thrown
   * 
   * RETURNS:
   * New state object. React will merge this into the component's state.
   */
  static getDerivedStateFromError(error: Error): State {
    // Return state with error info
    // This triggers a re-render with hasError = true
    return { hasError: true, error }
  }

  /**
   * COMPONENT_DID_CATCH
   * 
   * ANOTHER LIFECYCLE METHOD
   * Called after an error is caught, used for side effects.
   * 
   * PARAMETERS:
   * - error: The error that was thrown
   * - errorInfo: React-specific error information (component stack trace)
   * 
   * COMMON USES:
   * - Log error to console (for developers)
   * - Send error to monitoring service (like Sentry)
   * - Analytics tracking
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console so developers can see what went wrong
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // In production, you might also:
    // - Send to error monitoring service: logErrorToService(error, errorInfo)
    // - Track in analytics: analytics.track('error', { error })
  }

  /**
   * RENDER METHOD
   * 
   * REQUIRED METHOD in class components.
   * Returns what should be displayed on screen.
   * 
   * Called automatically by React when:
   * - Component first mounts
   * - State or props change
   */
  render() {
    // CHECK IF THERE'S AN ERROR
    if (this.state.hasError) {
      // AN ERROR OCCURRED - SHOW FALLBACK UI
      // 
      // Try to use custom fallback if provided, otherwise use default
      return (
        this.props.fallback || (
          // DEFAULT ERROR UI
          // Simple centered message with error details
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Something went wrong</h2>
            
            {/* 
              OPTIONAL CHAINING: this.state.error?.message
              The ?. means "only access .message if error is not null/undefined"
              If error is null, the whole expression evaluates to undefined
            */}
            <p>{this.state.error?.message}</p>
          </div>
        )
      )
    }

    // NO ERROR - RENDER CHILDREN NORMALLY
    // Just pass through the child components as-is
    return this.props.children
  }
}
