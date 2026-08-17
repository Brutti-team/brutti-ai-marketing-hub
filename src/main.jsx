import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import BruttiSoulLiteEnhancer from './BruttiSoulLiteEnhancer.jsx'
import './styles.css'
import './box-polish.css'
import './accessibility-theme.css'
import './dark-contrast-fix.css'
import './dark-mode-contrast-pass-2.css'
import './dark-mode-readable-mint.css'
import './responsive-clarity.css'
import './dark-impact-contrast-fix.css'
import './light-mode-analytics-contrast.css'
import './brutti-soul-master.css'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <BruttiSoulLiteEnhancer />
  </>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations
          .filter((registration) => registration.scope.includes('/brutti-ai-marketing-hub/'))
          .map((registration) => registration.unregister()),
      )

      if ('caches' in window) {
        const keys = await window.caches.keys()
        await Promise.all(
          keys
            .filter((key) => key.startsWith('brutti-hub-'))
            .map((key) => window.caches.delete(key)),
        )
      }
    } catch {
      // Cache cleanup is best-effort only; the website remains usable without it.
    }
  })
}
