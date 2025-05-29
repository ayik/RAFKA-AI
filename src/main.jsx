import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App.jsx';
import Sidebar from './components/Sidebar.jsx';
import { store, persistor } from './features/store.js';
import './index.css';

/**
 * Loading spinner component for PersistGate
 */
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);
/**
 * Global error boundary
 */
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Crash:', error, errorInfo);
    // Log to error tracking service (e.g. Sentry)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50 dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Something went wrong
          </h1>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {this.state.error?.toString()}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Performance-enhanced app container
 */
const AppContainer = () => (
  <div className="main-container flex h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <Sidebar />
    <App />
  </div>
);

/**
 * Service Worker Registration
 */
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
          registration.update();
        })
        .catch(err => {
          console.error('ServiceWorker registration failed:', err);
        });
    });
  }
};

// Register service worker
registerServiceWorker();

/**
 * Render the application
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <ErrorBoundary>
        
            <AppContainer />
          
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);