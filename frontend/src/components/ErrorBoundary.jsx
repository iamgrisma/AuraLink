import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)'
        }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
            AuraLink encountered an unexpected error. Refreshing the page usually fixes the problem.
          </p>
          <button onClick={this.handleReload} className="btn btn-primary">
            <RefreshCw size={16} /> Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
