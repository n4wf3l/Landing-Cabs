import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './i18n'
import './index.css'
import App from './App'
import { Toaster } from '@/components/ui/sonner'

// Take control of scroll position. With scroll-snap-type: y mandatory on
// mobile, browser-restored positions can land the user mid-page on a
// snap target instead of at the top. Manual restoration + an explicit
// scrollTo(0) after splash dismiss gives us a deterministic landing.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter
        basename={basename}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
        <Toaster />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
