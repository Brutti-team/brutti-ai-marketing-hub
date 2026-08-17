import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Core7MarketingTools from './Core7MarketingTools.jsx'
import AccessibilityThemeEnhancer from './AccessibilityThemeEnhancer.jsx'
import DailyContentRecommendationEnhancer from './DailyContentRecommendationEnhancer.jsx'
import ProductImageEnhancer from './ProductImageEnhancer.jsx'
import HistoricalAnalyticsEnhancer from './HistoricalAnalyticsEnhancer.jsx'
import MetaDeferredEnhancer from './MetaDeferredEnhancer.jsx'
import AnalyticsCopyPolish from './AnalyticsCopyPolish.jsx'
import NotificationCenterEnhancer from './NotificationCenterEnhancer.jsx'
import ProductCatalogQualityEnhancer from './ProductCatalogQualityEnhancer.jsx'
import LightModeAnalyticsContrastEnhancer from './LightModeAnalyticsContrastEnhancer.jsx'
import BrandCasingEnhancer from './BrandCasingEnhancer.jsx'
import './styles.css'
import './core7-marketing-tools.css'
import './box-polish.css'
import './accessibility-theme.css'
import './dark-contrast-fix.css'
import './dark-mode-contrast-pass-2.css'
import './dark-mode-readable-mint.css'
import './product-image-integration.css'
import './historical-analytics.css'
import './responsive-clarity.css'
import './dark-impact-contrast-fix.css'
import './light-mode-analytics-contrast.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Core7MarketingTools />
    <AccessibilityThemeEnhancer />
    <DailyContentRecommendationEnhancer />
    <ProductImageEnhancer />
    <HistoricalAnalyticsEnhancer />
    <MetaDeferredEnhancer />
    <AnalyticsCopyPolish />
    <NotificationCenterEnhancer />
    <ProductCatalogQualityEnhancer />
    <LightModeAnalyticsContrastEnhancer />
    <BrandCasingEnhancer />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {})
  })
}
