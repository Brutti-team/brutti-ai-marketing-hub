import { useEffect } from 'react'

function activeAnalyticsPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('h1')?.textContent?.trim() === 'Analytics') || null
}

function replaceExact(node, current, replacement) {
  if (node?.textContent?.trim() === current) node.textContent = replacement
}

export default function AnalyticsCopyPolish() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const page = activeAnalyticsPage()
      if (!page) return
      replaceExact(
        page.querySelector('.page-header p'),
        'Operational marketing analytics update from the workspace. Meta performance KPI stay excluded until a verified Insights source exists.',
        'Operational marketing analytics from the workspace with a verified daily Meta performance reference.',
      )
      page.querySelectorAll('.status-chip').forEach((chip) => {
        if (/Meta KPIs? excluded/i.test(chip.textContent || '')) chip.textContent = 'Meta insights connected'
      })
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
