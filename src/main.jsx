import { StrictMode, Suspense, lazy, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Core7MarketingTools from './Core7MarketingTools.jsx'
import AccessibilityThemeEnhancer from './AccessibilityThemeEnhancer.jsx'
import DailyContentRecommendationEnhancer from './DailyContentRecommendationEnhancer.jsx'
import HistoricalPostingTimeEnhancer from './HistoricalPostingTimeEnhancer.jsx'
import BruttiSoulSystemEnhancer from './BruttiSoulSystemEnhancer.jsx'
import LowRiskSafeUiEnhancer from './LowRiskSafeUiEnhancer.jsx'
import ContentStudioUiSimplifier from './ContentStudioUiSimplifier.jsx'
import LiveCaptionNarrativeEnhancer from './LiveCaptionNarrativeEnhancer.jsx'
import './styles.css'
import './core7-marketing-tools.css'
import './box-polish.css'
import './accessibility-theme.css'
import './dark-contrast-fix.css'
import './dark-mode-contrast-pass-2.css'
import './dark-mode-readable-mint.css'
import './product-image-integration.css'
import './responsive-clarity.css'
import './dark-impact-contrast-fix.css'
import './light-mode-analytics-contrast.css'
import './asset-library-upgrade.css'
import './campaign-planner-cleanup.css'
import './pwa-mobile.css'
import './interface-cleanup.css'
import './free-assist-output.css'
import './content-studio-v2.css'
import './low-risk-safe-ui.css'

const loadProductImage = () => import('./ProductImageEnhancer.jsx')
const loadAnalyticsCopy = () => import('./AnalyticsCopyPolish.jsx')
const loadNotificationCenter = () => import('./NotificationCenterEnhancer.jsx')
const loadProductCatalogQuality = () => import('./ProductCatalogQualityEnhancer.jsx')
const loadLightModeAnalyticsContrast = () => import('./LightModeAnalyticsContrastEnhancer.jsx')
const loadBrandCasing = () => import('./BrandCasingEnhancer.jsx')
const loadAssetLibrary = () => import('./AssetLibraryEnhancer.jsx')

const ProductImageEnhancer = lazy(loadProductImage)
const AnalyticsCopyPolish = lazy(loadAnalyticsCopy)
const NotificationCenterEnhancer = lazy(loadNotificationCenter)
const ProductCatalogQualityEnhancer = lazy(loadProductCatalogQuality)
const LightModeAnalyticsContrastEnhancer = lazy(loadLightModeAnalyticsContrast)
const BrandCasingEnhancer = lazy(loadBrandCasing)
const AssetLibraryEnhancer = lazy(loadAssetLibrary)

function activePageLabel() {
  return document.querySelector('#root .nav-link.active span')?.textContent?.trim() || 'Dashboard'
}

function preloadForPage(label) {
  if (label === 'Product Library') {
    loadProductImage()
    loadProductCatalogQuality()
  }
  if (label === 'Asset Library') loadAssetLibrary()
  if (label === 'Analytics') {
    loadAnalyticsCopy()
    loadLightModeAnalyticsContrast()
  }
}

export function DeferredEnhancers() {
  const [page, setPage] = useState('Dashboard')
  const [backgroundReady, setBackgroundReady] = useState(false)

  useEffect(() => {
    let pageTimer = 0
    const syncPage = () => {
      window.clearTimeout(pageTimer)
      pageTimer = window.setTimeout(() => setPage(activePageLabel()), 35)
    }

    syncPage()

    const onClick = (event) => {
      if (event.target.closest?.('.nav-link, .mobile-bottom-navigation button')) syncPage()
    }
    document.addEventListener('click', onClick, true)

    const onPointerOver = (event) => {
      const navButton = event.target.closest?.('.nav-link')
      const label = navButton?.querySelector('span')?.textContent?.trim()
      if (label) preloadForPage(label)
    }
    document.addEventListener('pointerover', onPointerOver, { passive: true, capture: true })

    let idleId = 0
    let fallbackTimer = 0
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => setBackgroundReady(true), { timeout: 1200 })
    } else {
      fallbackTimer = window.setTimeout(() => setBackgroundReady(true), 500)
    }

    return () => {
      window.clearTimeout(pageTimer)
      window.clearTimeout(fallbackTimer)
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('pointerover', onPointerOver, true)
    }
  }, [])

  return (
    <Suspense fallback={null}>
      <LowRiskSafeUiEnhancer page={page} />
      {backgroundReady ? <NotificationCenterEnhancer /> : null}
      {backgroundReady ? <BrandCasingEnhancer /> : null}

      {page === 'Product Library' ? <ProductImageEnhancer /> : null}
      {page === 'Product Library' ? <ProductCatalogQualityEnhancer /> : null}
      {page === 'Asset Library' ? <AssetLibraryEnhancer /> : null}
      {page === 'Analytics' ? <AnalyticsCopyPolish /> : null}
      {page === 'Analytics' ? <LightModeAnalyticsContrastEnhancer /> : null}
    </Suspense>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Core7MarketingTools />
    <AccessibilityThemeEnhancer />
    <DailyContentRecommendationEnhancer />
    <HistoricalPostingTimeEnhancer />
    <BruttiSoulSystemEnhancer />
    <ContentStudioUiSimplifier />
    <LiveCaptionNarrativeEnhancer />
    <DeferredEnhancers />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  const registerServiceWorker = () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
        updateViaCache: 'none',
      })
      .then((registration) => registration.update())
      .catch(() => {})
  }
  if (document.readyState === 'complete') registerServiceWorker()
  else window.addEventListener('load', registerServiceWorker, { once: true })
}
