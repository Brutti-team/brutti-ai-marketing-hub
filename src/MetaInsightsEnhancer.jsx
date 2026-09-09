import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

const endpoint = import.meta.env.VITE_APPS_SCRIPT_URL
const CACHE_PREFIX = 'brutti-meta-daily-insights-'

function findAnalyticsHost() { return [...document.querySelectorAll('.page')].find((page) => page.querySelector('.page-header h1')?.textContent?.trim() === 'Analytics') || null }
function localDateKey() { const now = new Date(); return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-') }
function metric(value) { return value === null || value === undefined || value === '' ? null : (Number.isFinite(Number(value)) ? Number(value) : null) }
function display(value) { return value === null ? '—' : new Intl.NumberFormat('en-MY').format(value) }
function formatDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }).format(date)
}
function contentType(value) {
  const format = String(value || 'post').toLowerCase()
  if (format.includes('carousel') || format.includes('album')) return 'Carousel'
  if (format.includes('reel') || format.includes('video')) return 'Reel'
  if (format.includes('story')) return 'Story'
  if (format.includes('photo') || format.includes('image')) return 'Photo'
  return 'Post'
}
function performanceSummary(post) {
  if (post.interactions === null && post.views === null && post.reach === null) return 'Meta belum menyediakan data yang cukup untuk menilai post ini.'
  if ((post.interactions || 0) >= 25) return 'Post ini menunjukkan interaction yang kuat berbanding post lain dalam snapshot semasa.'
  if ((post.interactions || 0) >= 8) return 'Post ini menunjukkan interaction sederhana dan masih boleh diperkukuh dengan hook atau CTA.'
  return 'Signal interaction masih rendah; cuba angle, visual atau opening yang lebih jelas.'
}
function recommendation(post) {
  if ((post.interactions || 0) >= 25) return `Teruskan tema ${post.type.toLowerCase()} ini dengan cerita susulan dan CTA yang mengundang respons.`
  if ((post.shares || 0) > 0 || (post.saves || 0) > 0) return 'Kembangkan topik ini menjadi content praktikal yang mudah dikongsi atau disimpan.'
  return 'Uji hook baharu pada topik yang sama dan bandingkan prestasi selepas 24 jam.'
}

function normalisePosts(data) {
  const raw = [...(Array.isArray(data?.facebook?.topPosts) ? data.facebook.topPosts : []), ...(Array.isArray(data?.instagram?.topPosts) ? data.instagram.topPosts : [])]
  const unique = new Map()
  raw.forEach((post, index) => {
    const sourceId = String(post?.sourceId || `${post?.platform || 'post'}-${index}`)
    const reactions = metric(post?.reactions); const comments = metric(post?.comments); const shares = metric(post?.shares); const saves = metric(post?.saves); const engagement = metric(post?.engagement)
    const item = { ...post, key: sourceId, sourceId, platform: String(post?.platform || 'facebook').toLowerCase(), type: contentType(post?.format), views: metric(post?.views), reach: metric(post?.reach), viewers: metric(post?.viewers), reactions, comments, shares, saves, engagement }
    item.interactions = engagement ?? ([reactions, comments, shares, saves].some((value) => value !== null) ? [reactions, comments, shares, saves].reduce((total, value) => total + (value || 0), 0) : null)
    if ([item.views, item.reach, item.viewers, item.interactions].some((value) => value !== null)) unique.set(sourceId, item)
  })
  return [...unique.values()].sort((a, b) => new Date(b.createdTime || 0) - new Date(a.createdTime || 0))
}

function PostDetail({ post, onClose }) {
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', close); document.body.classList.add('meta-drawer-open')
    return () => { document.removeEventListener('keydown', close); document.body.classList.remove('meta-drawer-open') }
  }, [onClose])
  const metrics = [['Views', post.views], ['Reach', post.reach], ['Viewers', post.viewers], ['Interactions', post.interactions], ['Reactions', post.reactions], ['Comments', post.comments], ['Shares', post.shares], ['Saves', post.saves]]
  return createPortal(<div className="meta-post-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <aside className="meta-post-drawer" role="dialog" aria-modal="true" aria-labelledby="meta-post-heading">
      <div className="meta-drawer-head"><div><span className="eyebrow">POST DETAILS</span><h3 id="meta-post-heading">{formatDate(post.createdTime)}</h3><p>{post.platform === 'instagram' ? 'Instagram' : 'Facebook'} · {post.type}</p></div><button type="button" className="meta-drawer-close" onClick={onClose} aria-label="Close post details">×</button></div>
      <div className="meta-post-thumbnail">{post.thumbnail ? <img src={post.thumbnail} alt="Post thumbnail"/> : <div><span>{post.platform === 'instagram' ? 'Instagram' : 'Facebook'}</span><small>Thumbnail not available from Meta</small></div>}</div>
      <section className="meta-detail-section"><span className="eyebrow">FULL CAPTION</span><p className="meta-full-caption">{String(post.message || '').trim() || 'No caption'}</p></section>
      <section className="meta-detail-section"><span className="eyebrow">ALL METRICS</span><div className="meta-detail-metrics">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{display(value)}</strong></div>)}</div></section>
      <section className="meta-detail-section"><span className="eyebrow">AI PERFORMANCE SUMMARY</span><p>{performanceSummary(post)}</p></section>
      <section className="meta-detail-section recommendation"><span className="eyebrow">NEXT RECOMMENDATION</span><p>{recommendation(post)}</p></section>
      {post.permalink ? <a className="button primary meta-post-link" href={post.permalink} target="_blank" rel="noreferrer">Open original post</a> : <p className="settings-copy">Original post link not available from Meta.</p>}
    </aside>
  </div>, document.body)
}

export default function MetaInsightsEnhancer() {
  const [host, setHost] = useState(null); const [selectedPost, setSelectedPost] = useState(null)
  const [state, setState] = useState({ loading: true, data: null, error: '', cached: false })
  useEffect(() => { const syncHost = () => setHost(findAnalyticsHost()); syncHost(); const observer = new MutationObserver(syncHost); observer.observe(document.body, { childList: true, subtree: true }); return () => observer.disconnect() }, [])
  useEffect(() => {
    if (!host) return undefined
    if (!endpoint) { setState({ loading: false, data: null, error: 'Apps Script deployment belum dikonfigurasi. Tiada KPI Meta dipaparkan.', cached: false }); return undefined }
    let active = true; const cacheKey = CACHE_PREFIX + localDateKey()
    try { const cached = JSON.parse(window.localStorage.getItem(cacheKey) || 'null'); if (cached?.data?.sourceUpdatedAt) { setState({ loading: false, data: cached.data, error: '', cached: true }); return undefined } } catch { /* Read fresh data. */ }
    const separator = endpoint.includes('?') ? '&' : '?'
    fetch(`${endpoint}${separator}view=meta-insights`, { cache: 'no-store' }).then((response) => response.ok ? response.json() : Promise.reject(new Error('Meta endpoint unavailable'))).then((result) => { if (!result?.ok || !result?.data?.sourceUpdatedAt) throw new Error(result?.error || 'Post-level Meta data belum tersedia.'); window.localStorage.setItem(cacheKey, JSON.stringify({ data: result.data })); if (active) setState({ loading: false, data: result.data, error: '', cached: false }) }).catch((error) => active && setState({ loading: false, data: null, error: error.message || 'Post-level Meta data belum tersedia.', cached: false }))
    return () => { active = false }
  }, [host])
  const posts = useMemo(() => normalisePosts(state.data), [state.data])
  if (!host) return null
  return <>{createPortal(<section className="panel meta-post-performance" aria-label="Meta post performance" style={{ marginTop: 24 }}>
    <div className="panel-heading"><div><span className="eyebrow">LIVE META INSIGHTS</span><h3>Recent post performance</h3></div><span className="verified-label">{state.cached ? 'Daily sheet snapshot' : 'Read-only Meta data'}</span></div>
    {state.loading ? <p className="settings-copy">Loading verified Meta metrics…</p> : null}{state.error ? <p className="settings-copy">{state.error} Sistem tidak menganggarkan nombor.</p> : null}
    {posts.length ? <div className="meta-post-list" role="table" aria-label="Recent Facebook and Instagram posts"><div className="meta-post-row meta-post-header" role="row"><span>Date & time</span><span>Platform</span><span>Type</span><span>Views</span><span>Reach</span><span>Viewers</span><span>Interactions</span><span>Post</span></div>{posts.map((post) => <div className="meta-post-row" role="row" key={post.key}><strong>{formatDate(post.createdTime)}</strong><span className={`meta-platform ${post.platform}`}>{post.platform === 'instagram' ? 'Instagram' : 'Facebook'}</span><span>{post.type}</span><span>{display(post.views)}</span><span>{display(post.reach)}</span><span>{display(post.viewers)}</span><span>{display(post.interactions)}</span><button type="button" className="meta-view-post" onClick={() => setSelectedPost(post)} aria-label={`View post from ${formatDate(post.createdTime)}`}><span aria-hidden="true">◉</span> View Post</button></div>)}</div> : null}
  </section>, host)}{selectedPost ? <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)}/> : null}</>
}
