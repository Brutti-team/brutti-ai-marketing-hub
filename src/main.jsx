import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Phase2AuditEnhancer from './Phase2AuditEnhancer.jsx'
import './styles.css'
import './phase2-audit.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Phase2AuditEnhancer />
  </StrictMode>,
)
