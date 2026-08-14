import { useEffect } from 'react'

function activeAnalyticsPage() {
  return [...document.querySelectorAll('#root .page')].find(
    (page) => page.offsetParent !== null && page.querySelector('h1')?.textContent?.trim() === 'Analytics',
  ) || null
}

function markReadablePanels(page) {
  page.querySelectorAll('.panel, .source-table-panel, section').forEach((panel) => {
    if (!(panel instanceof HTMLElement)) return
    if (panel.querySelector('h2, h3, table, .phase2-audit-panel, .phase3-ranking-panel, .historical-facebook-reports')) {
      panel.classList.add('analytics-light-readable')
    }

    const text = panel.textContent?.replace(/\s+/g, ' ').trim() || ''
    if (text.includes('Live workflow distribution')) {
      panel.classList.add('analytics-distribution-panel')
    }
  })
}

export default function LightModeAnalyticsContrastEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const page = activeAnalyticsPage()
      if (page) markReadablePanels(page)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
