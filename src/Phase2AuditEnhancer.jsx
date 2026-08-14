import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

const repeatItems = [
  'Product / use case',
  'Educational / tutorial',
  'Behind the scenes',
  'Brand / product storytelling',
  'Team / company culture',
  'Local / Sabahan content',
]

const improveItems = [
  'Stronger opening hook',
  'One clear CTA',
  'Shorter and easier-to-scan caption',
  '3–5 relevant hashtags',
  'One main message per post',
  'Verified product and campaign claims only',
]

const changeItems = [
  'Excessive hashtags',
  'Unsupported claims or unverified promotion details',
  'Overly long captions with too many ideas',
  'Posting that is too sales-heavy without useful value',
]

const contentMix = [
  ['Product', '30%'],
  ['Educational / Tips', '20%'],
  ['Behind the Scenes / Team', '20%'],
  ['Brand / Product Storytelling', '15%'],
  ['Customer / Project Story', '10%'],
  ['Promotion / Seasonal', '5%'],
]

const auditCopy = {
  Dashboard: {
    eyebrow: 'FACEBOOK CONTENT AUDIT · PHASE 2',
    title: 'Repeat, improve and change with clear content rules.',
    description: 'This is a qualitative content audit based on BRUTTI’s available Facebook content. It is not a performance ranking until verified reach, views and engagement data are connected.',
    mode: 'triage',
  },
  'Content Studio': {
    eyebrow: 'PHASE 2 CAPTION RULES',
    title: 'Keep every Facebook draft focused and easy to review.',
    description: 'Use one main message, a clear hook, one relevant CTA, 3–5 relevant hashtags and verified facts only. Human approval remains required before publishing.',
    mode: 'rules',
  },
  'Campaign Planner': {
    eyebrow: 'FACEBOOK STARTING MIX',
    title: 'Use this mix as a planning guide, not a KPI ranking.',
    description: 'The percentages are a practical starting mix from the current content audit. Adjust them later when verified post-performance data is available.',
    mode: 'mix',
  },
  'Brand Library': {
    eyebrow: 'FACEBOOK CONTENT PILLARS',
    title: 'Keep the strongest BRUTTI content patterns visible.',
    description: 'Prioritise practical product stories, useful education, real team moments and local storytelling while keeping the Sabahan voice natural.',
    mode: 'pillars',
  },
  Analytics: {
    eyebrow: 'FACEBOOK CONTENT RECOMMENDATION · PHASE 2',
    title: 'Content audit is ready; performance ranking is still pending.',
    description: 'Repeat / Improve / Stop-Change below is based on content quality and patterns only. Verified per-post reach, views, reactions, comments, shares, saves and clicks are still required for performance ranking.',
    mode: 'triage',
  },
}

function ListCard({ tone, title, items }) {
  return (
    <article className={`phase2-card phase2-${tone}`}>
      <span className="phase2-card-label">{title}</span>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  )
}

function AuditPanel({ config }) {
  return (
    <section className="panel phase2-audit-panel" data-phase2-audit="true">
      <div className="phase2-audit-head">
        <div>
          <span className="eyebrow">{config.eyebrow}</span>
          <h3>{config.title}</h3>
          <p>{config.description}</p>
        </div>
        <span className="phase2-status">Content audit</span>
      </div>

      {config.mode === 'triage' ? (
        <div className="phase2-grid">
          <ListCard tone="repeat" title="REPEAT" items={repeatItems} />
          <ListCard tone="improve" title="IMPROVE" items={improveItems} />
          <ListCard tone="change" title="STOP / CHANGE" items={changeItems} />
        </div>
      ) : null}

      {config.mode === 'rules' ? (
        <div className="phase2-rules">
          {improveItems.map((item, index) => <span key={item}><b>{String(index + 1).padStart(2, '0')}</b>{item}</span>)}
        </div>
      ) : null}

      {config.mode === 'mix' ? (
        <div className="phase2-mix">
          {contentMix.map(([name, value]) => <div key={name}><strong>{value}</strong><span>{name}</span></div>)}
        </div>
      ) : null}

      {config.mode === 'pillars' ? (
        <div className="phase2-pillars">
          {repeatItems.map((item) => <span key={item}>{item}</span>)}
        </div>
      ) : null}

      <div className="phase2-footnote">
        <strong>Data rule:</strong> Do not label any post as “best performing” until verified post-level KPIs are available.
      </div>
    </section>
  )
}

export default function Phase2AuditEnhancer() {
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

      root.querySelectorAll('.ai-checks span').forEach((item) => {
        const text = item.textContent?.trim() || ''
        if (!text.startsWith('Hashtags controlled')) return
        const textNode = [...item.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
        if (textNode && textNode.nodeValue !== 'Relevant hashtags (3–5 recommended; maximum 5)') {
          textNode.nodeValue = 'Relevant hashtags (3–5 recommended; maximum 5)'
        }
      })

      root.querySelectorAll('.panel-heading .eyebrow').forEach((label) => {
        if (label.textContent?.trim() === 'SMART RECOMMENDATIONS') {
          label.textContent = 'SMART WORKFLOW RECOMMENDATIONS'
        }
      })
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  const config = useMemo(() => auditCopy[pageTitle] || null, [pageTitle])
  if (!pageNode || !config) return null

  return createPortal(<AuditPanel config={config} />, pageNode)
}
