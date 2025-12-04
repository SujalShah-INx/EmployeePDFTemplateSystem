import React from 'react';
import ReactDOM from 'react-dom/client';
import MantineApp from './MantineApp.jsx';
import './index.css';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>⚠️ Something went wrong</h1>
          <p style={{ color: '#666', marginTop: '16px' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '24px', 
              padding: '12px 24px', 
              fontSize: '16px',
              cursor: 'pointer',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px'
            }}
          >
            Reload Page
          </button>
          <details style={{ marginTop: '24px', textAlign: 'left', maxWidth: '600px', margin: '24px auto' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px', 
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error?.stack || 'No stack trace available'}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <MantineApp />
    </ErrorBoundary>
  </React.StrictMode>,
);
