// Polyfill crypto.randomUUID for non-secure contexts (e.g. http://192.168.x.x during local hackathon demo)
if (typeof window !== 'undefined') {
  if (!window.crypto) {
    window.crypto = {
      getRandomValues: (arr) => arr.map(() => Math.floor(Math.random() * 256))
    };
  }
  if (!window.crypto.randomUUID) {
    window.crypto.randomUUID = function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }
}

const originalError = console.error;
const originalWarn = console.warn;

window.addEventListener('error', e => {
  if (e.message === 'ResizeObserver loop limit exceeded' || e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation();
    return;
  }
  
  // Production Error Monitoring Placeholder (e.g., Sentry)
  // Sentry.captureException(e.error);
  if (process.env.NODE_ENV === 'production') {
    // A real app would send this error to an event pipeline
    console.debug('[Monitoring] Captured global error:', e.message);
  }
});

window.addEventListener('unhandledrejection', e => {
  if (process.env.NODE_ENV === 'production') {
    console.debug('[Monitoring] Captured unhandled promise rejection:', e.reason);
  }
});

console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('defaultProps will be removed')) return;
  originalError(...args);
};

console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('width(-1) and height(-1)')) return;
  originalWarn(...args);
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

// Register PWA Service Worker for Offline Caching and Background Sync
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[FinCoach SW] Service Worker successfully registered with scope:', reg.scope);
        
        // Listen to messages from the Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'OFFLINE_SYNC_SUCCESS') {
            console.log('[FinCoach SW] Background sync successfully processed offline transactions.');
            // Auto refresh connection status or store if needed
          }
        });
      })
      .catch((err) => {
        console.error('[FinCoach SW] Service Worker registration failed:', err);
      });
  });
}
