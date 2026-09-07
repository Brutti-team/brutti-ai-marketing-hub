import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const endpoint = import.meta.env.VITE_APPS_SCRIPT_URL
const CACHE_PREFIX = 'brutti-meta-daily-insights-'

function findAnalyticsHost() { return [...document.querySelectorAll('.page')].find((page) => page.querySelector('.page-header h1')?.textContent?.trim() === 'Analytics') || null }
function localDateKey() { const now = new Date(); return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-') }
function metric(value) { return value === null || value === undefined || value === '' ? null : (Number.isFinite(Number(value)) ? Number(value) : null) }
function display(value) { return value === null ? '—' : new Intl.NumberFormat('en-MY').format(value) }
function postLabel(post) { const text = String(post.message || '').trim(); return text ? (text.length > 72 ? `${text.slice(0, 69)}…` : text) : `Facebook post #${String(post.sourceId || '').slice(-8)}` }

function normalisePosts(data) {
  return (Array.isArray(data?.facebook?.topPosts) ? data.facebook.topPosts : []).map((post, index) => ({
    ...post, key: String(post.sourceId || index), label: postLabel(post), views: metric(post.views), reach: metric(post.reach),
    reactions: metric(post.reactions), comments: metric(post.comments), shares: metric(post.shares), saves: metric(post.saves), engagement: metric(post.engagement),
  })).filter((post) => [post.views, post.reach, post.reactions, post.comments, post.shares, post.saves, post.engagement].some((value) => value !== null))
}

function highest(posts, field) { return [...posts].filter((post) => post[field] !== null).sort((a, b) => b[field] - a[field])[0] || null }
function MetricCard({ label, field, posts }) { const post = highest(posts, field); return <article className="stat-card"><div><span>Highest {label}</span><strong>{display(post?.[field] ?? null)}</strong><small>{post ? post.label : 'Unavailable from Meta'}</small></div></article> }

export default function MetaInsightsEnhancer() {
  const [host, setHost] = useState(null)
  const [state, setState] = useState({ loading: true, data: null, error: '', cached: false })
  useEffect(() => {
    const syncHost = () => setHost(findAnalyticsHost())
    syncHost()
    const observer = new MutationObserver(syncHost)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!host) return undefined
    if (!endpoint) { setState({ loading: false, data: null, error: 'Apps Script deployment belum dikonfigurasi. Tiada KPI Meta dipaparkan.', cached: false }); return undefined }
    let active = true
    const cacheKey = CACHE_PREFIX + localDateKey()
    try {
      const cached = JSON.parse(window.localStorage.getItem(cacheKey) || 'null')
      if (cached?.data?.sourceUpdatedAt) { setState({ loading: false, data: cached.data, error: '', cached: true }); return undefined }
    } catch { /* Read a fresh verified snapshot. */ }
    const separator = endpoint.includes('?') ? '&' : '?'
    fetch(`${endpoint}${separator}view=meta-insights`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Meta endpoint unavailable')))
      .then((result) => {
        if (!result?.ok || !result?.data?.sourceUpdatedAt) throw new Error(result?.error || 'Post-level Meta data belum tersedia.')
        window.localStorage.setItem(cacheKey, JSON.stringify({ data: result.data }))
        if (active) setState({ loading: false, data: result.data, error: '', cached: false })
      })
      .catch((error) => active && setState({ loading: false, data: null, error: error.message || 'Post-level Meta data belum tersedia.', cached: false }))
    return () => { active = false }
  }, [host])

  if (!host) return null
  const posts = normalisePosts(state.data)
  const unavailable = state.data?.unavailableMetrics || []
  return createPortal(
    <section className="panel" aria-label="Meta insights" style={{ marginTop: 24 }}>
      <div className="panel-heading"><div><span className="eyebrow">LIVE META INSIGHTS</span><h3>Verified post performance</h3></div><span className="verified-label">{state.cached ? 'Daily sheet snapshot' : 'Read-only Meta data'}</span></div>
      {state.loading ? <p className="settings-copy">Loading verified Meta metrics…</p> : null}
      {state.error ? <p className="settings-copy">{state.error} Sistem tidak menganggarkan nombor atau ranking.</p> : null}
      {posts.length ? <>
        <div className="stats-grid analytics-stats"><MetricCard label="Views" field="views" posts={posts}/><MetricCard label="Reach" field="reach" posts={posts}/><MetricCard label="Reactions" field="reactions" posts={posts}/><MetricCard label="Engagement" field="engagement" posts={posts}/></div>
        <div className="table-wrap" style={{ marginTop: 20 }}><table><thead><tr><th>Rank</th><th>Post</th><th>Views</th><th>Reach</th><th>Reactions</th><th>Comments</th><th>Shares</th><th>Saves</th><th>Engagement</th></tr></thead><tbody>{posts.map((post, index) => <tr key={post.key}><td>{index + 1}</td><td>{post.label}</td><td>{display(post.views)}</td><td>{display(post.reach)}</td><td>{display(post.reactions)}</td><td>{display(post.comments)}</td><td>{display(post.shares)}</td><td>{display(post.saves)}</td><td>{display(post.engagement)}</td></tr>)}</tbody></table></div>
        {unavailable.length ? <p className="settings-copy">Unavailable from this Meta response: {unavailable.join(', ')}.</p> : null}
      </> : null}
    </section>, host,
  )
}
