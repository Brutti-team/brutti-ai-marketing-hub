import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const fallbackUrl = 'https://script.google.com/macros/s/AKfycbz9_kxaVNNH07wxqrUsVPkRPNxXpnbCpnsL5RnT5CBE_Sd-jzqq910TjykFYWmeDKXE/exec'
const endpoint = import.meta.env.VITE_APPS_SCRIPT_URL || fallbackUrl

function findAnalyticsHost() {
  return [...document.querySelectorAll('.page')].find((page) => page.querySelector('.page-header h1')?.textContent?.trim() === 'Analytics') || null
}

export default function MetaInsightsEnhancer() {
  const [host, setHost] = useState(null)
  const [state, setState] = useState({ loading: true, data: null, error: '' })

  useEffect(() => {
    const syncHost = () => setHost(findAnalyticsHost())
    syncHost()
    const observer = new MutationObserver(syncHost)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!host) return
    let active = true
    setState({ loading: true, data: null, error: '' })
    fetch(endpoint + '?view=meta-insights', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Meta endpoint unavailable')))
      .then((data) => active && setState({ loading: false, data, error: '' }))
      .catch(() => active && setState({ loading: false, data: null, error: 'Meta insights are temporarily unavailable.' }))
    return () => { active = false }
  }, [host])

  if (!host) return null
  const data = state.data?.data || state.data || {}
  const instagram = data.instagram || {}
  const facebook = data.facebook || {}
  const trend = instagram.trend || []
  const posts = facebook.topPosts || []

  return createPortal(
    <section className="panel" aria-label="Meta insights" style={{ marginTop: 24 }}>
      <div className="panel-heading"><div><span className="eyebrow">LIVE META INSIGHTS</span><h3>Facebook & Instagram performance</h3></div><span className="verified-label">Google Sheet sync</span></div>
      {state.loading ? <p className="settings-copy">Loading verified Meta metrics…</p> : state.error ? <p className="settings-copy">{state.error}</p> : <div className="stats-grid analytics-stats">
        <article className="stat-card"><div className="stat-icon image">◎</div><div><span>Instagram reach</span><strong>{instagram.latestReach ?? '—'}</strong><small>Latest recorded daily reach</small></div></article>
        <article className="stat-card"><div className="stat-icon chart">f</div><div><span>Facebook post media views</span><strong>{posts[0]?.views ?? '—'}</strong><small>Top recorded post</small></div></article>
        <div style={{ gridColumn: '1 / -1' }}><div className="eyebrow">TOP FACEBOOK POSTS</div>{posts.length ? posts.slice(0, 5).map((post, index) => <div key={post.sourceId || index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line, #e8e1d8)' }}><span>{index + 1}. Post {post.sourceId}</span><strong>{post.views}</strong></div>) : <p className="settings-copy">No Facebook post view records yet.</p>}</div>
        {trend.length ? <div style={{ gridColumn: '1 / -1' }}><div className="eyebrow">INSTAGRAM REACH TREND</div><div style={{ display: 'flex', gap: 8, alignItems: 'end', minHeight: 72 }}>{trend.slice(-14).map((point) => <div key={point.date} title={point.date + ': ' + point.value} style={{ flex: 1, height: Math.max(8, Math.round((Number(point.value) / Math.max(...trend.map((item) => Number(item.value)), 1)) * 64)), background: 'var(--mint, #8fcfc0)', borderRadius: 4 }} />)}</div></div> : null}
      </div>}
      <p className="settings-copy" style={{ marginBottom: 0 }}>Meta token remains private in Apps Script; this panel is read-only.</p>
    </section>,
    host,
  )
}
