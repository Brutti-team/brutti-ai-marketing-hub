import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Phase2AuditEnhancer from './Phase2AuditEnhancer.jsx'
import Phase3RankingEnhancer from './Phase3RankingEnhancer.jsx'
import Core7MarketingTools from './Core7MarketingTools.jsx'
import AccessibilityThemeEnhancer from './AccessibilityThemeEnhancer.jsx'
import './styles.css'
import './phase2-audit.css'
import './phase3-ranking.css'
import './core7-marketing-tools.css'
import './box-polish.css'
import './accessibility-theme.css'
import './dark-contrast-fix.css'
import './dark-mode-contrast-pass-2.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Phase2AuditEnhancer />
    <Phase3RankingEnhancer />
    <Core7MarketingTools />
    <AccessibilityThemeEnhancer />
  </StrictMode>,
)
