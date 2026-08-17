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
    let timer = 0
    const sync = () => {
      const page = activeAnalyticsPage()
      if (!page) return

      replaceExact(
        page.querySelector('.page-header p'),
        'Operational marketing analytics update from the workspace. Meta performance KPI stay excluded until a verified Insights source exists.',
        'Operational marketing analytics from the workspace. Meta performance KPIs remain excluded until a verified Insights source exists.',
      )

      page.querySelectorAll('.status-chip').forEach((chip) => {
        replaceExact(chip, 'Meta KPI excluded', 'Meta KPIs excluded')
      })

      page.querySelectorAll('.analytics-notice strong').forEach((label) => {
        replaceExact(label, 'No fabricated performance KPI', 'No fabricated performance KPIs')
      })
    }

    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, 90)
    }
    const onClick = (event) => {
      if (event.target.closest?.('button, a')) {
        schedule()
        window.setTimeout(sync, 320)
      }
    }

    sync()
    document.addEventListener('click', onClick, true)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
