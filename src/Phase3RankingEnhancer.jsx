import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

const criteria = [
  'Clear hook',
  'One main message',
  'Useful customer value',
  'BRUTTI brand voice',
  'One clear CTA',
  'Verified facts + hashtag discipline',
]

const rankingGroups = [
  {
    level: 'strong',
    label: 'STRONG CONTENT PATTERN',
    range: '5–6 / 6',
    items: [
      {
        pattern: 'Tutorial / Educational',
        score: '6 / 6',
        reason: 'Clear problem, useful explanation, practical product use and an easy next action.',
      },
      {
        pattern: 'Product + Storytelling',
        score: '5 / 6',
        reason: 'A human or local story makes the product easier to remember while keeping the BRUTTI voice natural.',
      },
      {
        pattern: 'Interactive Product Choice',
        score: '5 / 6',
        reason: 'A simple comparison or question keeps one clear message and encourages audience conversation.',
      },
    ],
  },
  {
    level: 'medium',
    label: 'MEDIUM CONTENT PATTERN',
    range: '3–4 / 6',
    items: [
      {
        pattern: 'Product Highlight + Many Details',
        score: '4 / 6',
        reason: 'Useful information is present, but the caption can become long or too claim-heavy.',
      },
      {
        pattern: 'Local Collaboration',
        score: '4 / 6',
        reason: 'Local context fits BRUTTI well, but the BRUTTI message should remain the main focus.',
      },
      {
        pattern: 'Event / Promotion',
        score: '3 / 6',
        reason: 'Good for timely updates, but it often needs a tighter message and one stronger CTA.',
      },
    ],
  },
  {
    level: 'needs',
    label: 'NEEDS IMPROVEMENT',
    range: '0–2 / 6',
    items: [
      {
        pattern: 'Hashtag-heavy Sales Post',
        score: '2 / 6',
        reason: 'Too many hashtags make the post harder to scan and can weaken the main message.',
      },
      {
        pattern: 'Multi-topic Caption',
        score: '2 / 6',
        reason: 'Several ideas compete for attention; split them into separate content pieces.',
      },
      {
        pattern: 'Unsupported / Claim-heavy Copy',
        score: '1 / 6',
        reason: 'Prices, promotions, product claims or performance statements need verified sources before publishing.',
      },
    ],
  },
]

function RankingGroup({ group, compact }) {
  return (
    <article className={`phase3-group phase3-${group.level}`}>
      <div className="phase3-group-head">
        <div>
          <span>{group.label}</span>
          <strong>{group.range}</strong>
        </div>
        <small>Editorial quality</small>
      </div>
      <div className="phase3-items">
        {group.items.slice(0, compact ? 2 : group.items.length).map((item) => (
          <div className="phase3-item" key={item.pattern}>
            <div><strong>{item.pattern}</strong><span>{item.score}</span></div>
            <p>{item.reason}</p>
          </div>
        ))}
      </div>
    </article>
  )
}

function RankingPanel({ compact }) {
  return (
    <section className="panel phase3-ranking-panel" data-phase3-ranking="true">
      <div className="phase3-ranking-head">
        <div>
          <span className="eyebrow">FACEBOOK CONTENT RANKING · PHASE 3</span>
          <h3>{compact ? 'Temporary quality ranking for current Facebook content patterns.' : 'Rank content quality now; add performance ranking when KPI is available.'}</h3>
          <p>
            This ranking uses editorial quality signals only. It does not claim which post performed best because verified per-post reach, views and engagement are not yet available.
          </p>
        </div>
        <span className="phase3-status">Temporary ranking</span>
      </div>

      <div className="phase3-criteria">
        {criteria.map((item, index) => <span key={item}><b>{index + 1}</b>{item}</span>)}
      </div>

      <div className="phase3-ranking-grid">
        {rankingGroups.map((group) => <RankingGroup key={group.level} group={group} compact={compact} />)}
      </div>

      <div className="phase3-note">
        <strong>Upgrade path:</strong> When Facebook post-level KPI is connected, keep this quality score and add a separate performance score for reach, views, engagements, clicks and enquiries.
      </div>
    </section>
  )
}

export default function Phase3RankingEnhancer() {
  const [pageTitle, setPageTitle] = useState('')
  const [pageNode, setPageNode] = useState(null)

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const pages = [...root.querySelectorAll('.page')]
      const activePage = pages.find((page) => page.offsetParent !== null) || pages[0] || null
      const title = activePage?.classList.contains('dashboard-page')
        ? 'Dashboard'
        : activePage?.querySelector('h1')?.textContent?.trim() || ''

      setPageNode((current) => current === activePage ? current : activePage)
      setPageTitle((current) => current === title ? current : title)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  const config = useMemo(() => {
    if (pageTitle === 'Dashboard') return { compact: true }
    if (pageTitle === 'Analytics') return { compact: false }
    return null
  }, [pageTitle])

  if (!pageNode || !config) return null
  return createPortal(<RankingPanel compact={config.compact} />, pageNode)
}
