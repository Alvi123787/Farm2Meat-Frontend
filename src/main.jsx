import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import ReactGA from 'react-ga4'

// GA4 Configuration and Initialization with Diagnostics
const GA4_MEASUREMENT_ID = 'G-9QMD9R9PCK'
console.log('🚀 [GA4] Initializing with Measurement ID:', GA4_MEASUREMENT_ID)

try {
  ReactGA.initialize(GA4_MEASUREMENT_ID, {
    debug: import.meta.env.DEV, // Enable debug mode in dev
  })

  // Send initial page view
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname + window.location.search })
  console.log('✅ [GA4] Initialized successfully! Initial page view sent.')

  // Track app load as custom event
  ReactGA.event({
    category: 'App',
    action: 'App_Loaded',
    label: 'App_Initialization',
    value: 1
  })
  console.log('✅ [GA4] Custom event "App_Loaded" sent!')

} catch (error) {
  console.error('❌ [GA4] Initialization failed:', error.message)
}

if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onRegisterError(error) {
      console.error('PWA service worker registration failed:', error)
    },
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
