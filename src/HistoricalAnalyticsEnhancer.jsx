import { useEffect } from 'react'

const accountActivity = [
  ['Raw group-post rows', '5,164'],
  ['Estimated unique post records', '1,234'],
  ['Groups posted to', '6'],
  ['Pending group-post rows', '303'],
]

const contentActivity = [
  ['Product / price mention records', '519'],
  ['Attachment references', '2,177'],
  ['Customer reply rows', '11'],
  ['Tagged photo / video URL rows', '7'],
]

function activeAnalyticsPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('h1')?.textContent?.trim() === 'Analytics') || null
}

function reportCard(title, eyebrow, rows) {
  const section = document.createElement('section')
  section.className = 'panel historical-report-card'
  section.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="eyebrow">${eyebrow}</span>
        <h3>${title}</h3>
      </div>
      <span class="historical-data-badge">Historical export</span>
    </div>
    <div class="historical-metric-list">
      ${rows.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('')}
    </div>
  `
  return section
}

function enhance(page) {
  if (page.querySelector('.historical-facebook-reports')) return

  const wrapper = document.createElement('section')
  wrapper.className = 'historical-facebook-reports'
  wrapper.innerHTML = `
    <div class="historical-report-head">
      <div>
        <span class="eyebrow">FACEBOOK ARCHIVE ANALYSIS</span>
        <h2>Account & content activity report</h2>
        <p>Verified historical activity from the supplied Facebook account export. Coverage: 7 Apr 2025 – 23 May 2026. This is not live Meta Insights or Ads Manager data.</p>
      </div>
    </div>
  `

  const grid = document.createElement('div')
  grid.className = 'historical-report-grid'
  grid.appendChild(reportCard('Account Activity Report', 'ACCOUNT ACTIVITY', accountActivity))
  grid.appendChild(reportCard('Content Activity Report', 'CONTENT ACTIVITY', contentActivity))
  wrapper.appendChild(grid)

  const note = document.createElement('div')
  note.className = 'analytics-notice historical-limit-note'
  note.innerHTML = `
    <div>
      <strong>Performance ranking remains excluded</strong>
      <p>This archive does not contain verified reach, views, shares, conversion or post-level engagement KPI. Best-performing and viral ranking therefore remain qualitative until a suitable verified export is available.</p>
    </div>
  `
  wrapper.appendChild(note)

  const sourcePanel = page.querySelector('.source-table-panel')
  if (sourcePanel) sourcePanel.insertAdjacentElement('beforebegin', wrapper)
  else page.appendChild(wrapper)
}

export default function HistoricalAnalyticsEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const page = activeAnalyticsPage()
      if (page) enhance(page)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
