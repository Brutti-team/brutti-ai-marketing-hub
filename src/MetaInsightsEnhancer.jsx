import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const fallbackUrl = 'https://script.google.com/macros/s/AKfycbz9_kxaVNNH07wxqrUsVPkRPNxXpnbCpnsL5RnT5CBE_Sd-jzqq910TjykFYWmeDKXE/exec'
const endpoint = import.meta.env.VITE_APPS_SCRIPT_URL || fallbackUrl
const CACHE_PREFIX = 'brutti-meta-daily-insights-'
const verifiedFallback = {
  instagram: { latestReach: 126, trend: [{ date: '2026-08-28', value: 126 }] },
  facebook: { topPosts: [
    { sourceId: '1658937732750757', platform: 'Facebook', views: 933 },
    { sourceId: '1662779285699935', platform: 'Facebook', views: 610 },
    { sourceId: '1656115913032939', platform: 'Facebook', views: 389 },
  ] },
}

function findAnalyticsHost() {
  return [...document.querySelectorAll('.page')].find((page) => page.querySelector('.page-header h1')?.textContent?.trim() === 'Analytics') || null
}

function localDateKey() {
  const now = new Date()
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
}

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function format(value) {
  return new Intl.NumberFormat('en-MY').format(number(value))
}

function postLabel(post) {
  const title = String(post.title || post.message || post.name || '').trim()
  if (title) return title.length > 54 ? `${title.slice(0, 51)}…` : title
  const platform = post.platform || 'Facebook'
  const id = String(post.sourceId || post.id || '')
  return id ? `${platform} post #${id.slice(-8)}` : `${platform} post`
}

function normalizePosts(data) {
  const facebook = Array.isArray(data?.facebook?.topPosts) ? data.facebook.topPosts : []
  const instagram = Array.isArray(data?.instagram?.topPosts) ? data.instagram.topPosts : []
  return [...facebook, ...instagram].map((post, index) => {
    const likes = number(post.likes ?? post.reactions)
    const comments = number(post.comments)
    const shares = number(post.shares)
    const saves = number(post.saves)
    return {
      ...post,
      key: String(post.sourceId || post.id || index),
      label: postLabel(post),
      views: number(post.views ?? post.mediaViews ?? post.impressions ?? post.reach),
      likes,
      comments,
      engagement: number(post.engagement) || likes + comments + shares + saves,
    }
  })
}

function bestPost(posts, field) {
  return [...posts].sort((left, right) => right[field] - left[field])[0] || null
}

function MetricCard({ label, field, posts, accent }) {
  const post = bestPost(posts, field)
  return <article className="stat-card" style={{ borderTop: `3px solid ${accent}` }}>
    <div className="stat-icon chart">↗</div>
    <div>
      <span>Highest {label}</span>
      <strong>{post?.[field] ? format(post[field]) : '—'}</strong>
      <small>{post?.[field] ? post.label : 'No verified post data yet'}</small>
    </div>
  </article>
}

function DailyReferenceChart({ posts }) {
  const ranked = [...posts].filter((post) => post.views || post.likes || post.comments || post.engagement)
    .sort((left, right) => right.engagement - left.engagement || right.views - left.views).slice(0, 6)
  const max = Math.max(...ranked.map((post) => Math.max(post.views, post.likes, post.comments, post.engagement)), 1)

  if (!ranked.length) return <p className="settings-copy">Belum ada post-level metrics yang boleh dijadikan rujukan harian.</p>

  return <div style={{ display: 'grid', gap: 14 }}>
    {ranked.map((post) => <article key={post.key} style={{ padding: '13px 0', borderTop: '1px solid var(--line, #e8e1d8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <strong>{post.label}</strong>
        <small style={{ opacity: .7 }}>{post.platform || 'Facebook'}</small>
      </div>
      <div style={{ display: 'grid', gap: 7, marginTop: 10 }}>
        {[
          ['Views', post.views, '#8fcfc0'],
          ['Likes', post.likes, '#e7a8a8'],
          ['Comments', post.comments, '#f0c97a'],
          ['Engagement', post.engagement, '#9ab5e8'],
        ].map(([label, value, color]) => value ? <div key={label} style={{ display: 'grid', gridTemplateColumns: '82px 1fr 48px', gap: 8, alignItems: 'center', fontSize: 12 }}>
          <span style={{ opacity: .72 }}>{label}</span>
          <i style={{ height: 8, display: 'block', overflow: 'hidden', borderRadius: 999, background: 'rgba(127,127,127,.12)' }}><b style={{ display: 'block', width: `${Math.max(4, Math.round((value / max) * 100))}%`, height: '100%', borderRadius: 999, background: color }} /></i>
          <strong style={{ textAlign: 'right', fontSize: 12 }}>{format(value)}</strong>
        </div> : null)}
      </div>
    </article>)}
  </div>
}

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
    let active = true
    const cacheKey = CACHE_PREFIX + localDateKey()
    try {
      const cached = JSON.parse(window.localStorage.getItem(cacheKey) || 'null')
      if (cached?.data) {
        setState({ loading: false, data: cached.data, error: '', cached: true })
        return undefined
      }
    } catch { /* Fetch a fresh verified snapshot below. */ }

    setState({ loading: true, data: null, error: '', cached: false })
    const separator = endpoint.includes('?') ? '&' : '?'
    fetch(`${endpoint}${separator}view=meta-insights`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Meta endpoint unavailable')))
      .then((data) => {
        try { window.localStorage.setItem(cacheKey, JSON.stringify({ syncedAt: new Date().toISOString(), data })) } catch { /* Storage is optional. */ }
        if (active) setState({ loading: false, data, error: '', cached: false })
      })
      .catch(() => active && setState({ loading: false, data: verifiedFallback, error: 'Showing the last verified sheet snapshot.', cached: true }))
    return () => { active = false }
  }, [host])

  if (!host) return null
  const rawData = state.data?.data || state.data || verifiedFallback
  const instagram = rawData.instagram || {}
  const posts = normalizePosts(rawData)
  const trend = Array.isArray(instagram.trend) ? instagram.trend : []
  const updated = rawData.sourceUpdatedAt ? new Date(rawData.sourceUpdatedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }) : 'Daily snapshot'

  return createPortal(
    <section className="panel" aria-label="Meta insights" style={{ marginTop: 24 }}>
      <div className="panel-heading"><div><span className="eyebrow">LIVE META INSIGHTS</span><h3>Daily post performance reference</h3></div><span className="verified-label">{state.cached ? 'Daily sheet snapshot' : 'Google Sheet synced today'}</span></div>
      {state.loading ? <p className="settings-copy">Loading verified Meta metrics…</p> : <>
        {state.error ? <p className="settings-copy" style={{ marginTop: 0 }}>{state.error}</p> : null}
        <div className="stats-grid analytics-stats">
          <MetricCard label="Views" field="views" posts={posts} accent="#8fcfc0" />
          <MetricCard label="Likes" field="likes" posts={posts} accent="#e7a8a8" />
          <MetricCard label="Comments" field="comments" posts={posts} accent="#f0c97a" />
          <MetricCard label="Engagement" field="engagement" posts={posts} accent="#9ab5e8" />
        </div>
        <section style={{ marginTop: 22 }}>
          <div className="panel-heading"><div><span className="eyebrow">DAILY CONTENT REFERENCE</span><h3>Which post performed best?</h3></div><small style={{ opacity: .68 }}>Sheet snapshot · {updated}</small></div>
          <DailyReferenceChart posts={posts} />
        </section>
        {trend.length ? <section style={{ marginTop: 22 }}><div className="eyebrow">INSTAGRAM DAILY REACH</div><div style={{ display: 'flex', gap: 6, alignItems: 'end', minHeight: 64, marginTop: 10 }}>{trend.slice(-14).map((point) => <div key={point.date} title={`${point.date}: ${point.value}`} style={{ flex: 1, minWidth: 8, height: Math.max(7, Math.round((number(point.value) / Math.max(...trend.map((item) => number(item.value)), 1)) * 60)), background: '#8fcfc0', borderRadius: 4 }} />)}</div></section> : null}
      </>}
      <p className="settings-copy" style={{ marginBottom: 0, marginTop: 20 }}>Read-only Google Sheet data. The website caches one verified snapshot per day, so opening Analytics does not create extra Meta API calls.</p>
    </section>,
    host,
  )
}
