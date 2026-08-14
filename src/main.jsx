import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Phase2AuditEnhancer from './Phase2AuditEnhancer.jsx'
import Phase3RankingEnhancer from './Phase3RankingEnhancer.jsx'
import Core7MarketingTools from './Core7MarketingTools.jsx'
import AccessibilityThemeEnhancer from './AccessibilityThemeEnhancer.jsx'
import DailyContentRecommendationEnhancer from './DailyContentRecommendationEnhancer.jsx'
import ProductImageEnhancer from './ProductImageEnhancer.jsx'
import WorkspaceReadinessEnhancer from './WorkspaceReadinessEnhancer.jsx'
import HistoricalAnalyticsEnhancer from './HistoricalAnalyticsEnhancer.jsx'
import MetaDeferredEnhancer from './MetaDeferredEnhancer.jsx'
import AnalyticsCopyPolish from './AnalyticsCopyPolish.jsx'
import SocialEnterpriseIntelligenceEnhancer from './SocialEnterpriseIntelligenceEnhancer.jsx'
import NotificationCenterEnhancer from './NotificationCenterEnhancer.jsx'
import './styles.css'
import './phase2-audit.css'
import './phase3-ranking.css'
import './core7-marketing-tools.css'
import './box-polish.css'
import './accessibility-theme.css'
import './dark-contrast-fix.css'
import './dark-mode-contrast-pass-2.css'
import './dark-mode-readable-mint.css'
import './product-image-integration.css'
import './historical-analytics.css'
import './social-enterprise-intelligence.css'
import './responsive-clarity.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Phase2AuditEnhancer />
    <Phase3RankingEnhancer />
    <Core7MarketingTools />
    <AccessibilityThemeEnhancer />
    <DailyContentRecommendationEnhancer />
    <ProductImageEnhancer />
    <WorkspaceReadinessEnhancer />
    <HistoricalAnalyticsEnhancer />
    <MetaDeferredEnhancer />
    <AnalyticsCopyPolish />
    <SocialEnterpriseIntelligenceEnhancer />
    <NotificationCenterEnhancer />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {})
  })
}
