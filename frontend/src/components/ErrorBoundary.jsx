import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center transition-colors">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-200/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="space-y-4">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
              >
                Reload Page
              </button>
            </div>

            {import.meta.env.MODE === 'development' && (
              <details className="mt-4 text-left text-gray-700 dark:text-gray-300">
                <summary className="cursor-pointer text-sm">Error Details</summary>
                <pre className="text-xs mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded overflow-auto whitespace-pre-wrap">
                  {this.state.error ? this.state.error.toString() : ''}
                  {this.state.errorInfo ? this.state.errorInfo.componentStack : ''}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
