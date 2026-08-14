import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Phase2AuditEnhancer from './Phase2AuditEnhancer.jsx'
import Phase3RankingEnhancer from './Phase3RankingEnhancer.jsx'
import './styles.css'
import './phase2-audit.css'
import './phase3-ranking.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Phase2AuditEnhancer />
    <Phase3RankingEnhancer />
  </StrictMode>,
)
