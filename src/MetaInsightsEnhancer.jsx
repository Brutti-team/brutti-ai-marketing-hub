import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { metaInsightsRequestUrl, omitMetaTokenDetails } from './lib/googleWorkspace'
import { filterSyncedPosts, normaliseSearchPosts, postImageUrl } from './lib/syncedPostSearch'

// Hidden for now (Michelle, Oct 2026). Set to true to bring the "Find an old post" card back.
const SHOW_OLD_POST_SEARCH = false
const CACHE_PREFIX = 'brutti-meta-daily-insights-v2-'

function findAnalyticsHost() {
  return [...document.querySelectorAll('.page')].find((page) => {
    const title = page.querySelector('.page-header h1')?.textContent?.trim()
    return title === 'Analytics' || title === 'Analitik'
  }) || null
}
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
function captionText(post) {
  return String(post?.message || post?.caption || post?.text || '').trim()
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
    const item = { ...post, key: sourceId, sourceId, platform: String(post?.platform || 'facebook').toLowerCase(), type: contentType(post?.format), message: captionText(post), views: metric(post?.views), reach: metric(post?.reach), viewers: metric(post?.viewers), reactions, comments, shares, saves, engagement }
    item.interactions = engagement ?? ([reactions, comments, shares, saves].some((value) => value !== null) ? [reactions, comments, shares, saves].reduce((total, value) => total + (value || 0), 0) : null)
    if ([item.views, item.reach, item.viewers, item.interactions].some((value) => value !== null)) unique.set(sourceId, item)
  })
  return [...unique.values()].sort((a, b) => new Date(a.createdTime || 0) - new Date(b.createdTime || 0) || (b.interactions ?? -1) - (a.interactions ?? -1))
}

const SEARCH_PAGE_SIZE = 8

function useUiLanguage() {
  const [language, setLanguage] = useState(() => (document.documentElement.dataset.bruttiUiLanguage === 'en' ? 'en' : 'bm'))
  useEffect(() => {
    const onChange = (event) => setLanguage(event.detail?.language === 'en' ? 'en' : 'bm')
    window.addEventListener('brutti:languagechange', onChange)
    return () => window.removeEventListener('brutti:languagechange', onChange)
  }, [])
  return language
}

function SearchPostedPieces({ data, loading, error, onOpen }) {
  const language = useUiLanguage()
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('')
  const [date, setDate] = useState('')
  const [visibleCount, setVisibleCount] = useState(SEARCH_PAGE_SIZE)
  const [brokenImages, setBrokenImages] = useState({})
  const posts = useMemo(() => normaliseSearchPosts(data), [data])
  const active = Boolean(query.trim() || platform || date)
  const matches = useMemo(() => (active ? filterSyncedPosts(posts, { query, platform, date }) : []), [active, posts, query, platform, date])
  useEffect(() => { setVisibleCount(SEARCH_PAGE_SIZE) }, [query, platform, date, data])
  const visible = matches.slice(0, visibleCount)
  const readyText = language === 'en' ? `${posts.length} synced posts are ready.` : `Ada ${posts.length} post yang sudah diselaraskan.`
  const showingText = language === 'en' ? `Showing ${visible.length} of ${matches.length} posts` : `Ditunjukkan ${visible.length} daripada ${matches.length} post`
  const openPost = (post) => {
    const image = brokenImages[post.key] ? '' : (post.thumbnail || postImageUrl(post))
    onOpen(image ? { ...post, thumbnail: image } : post)
  }
  return <section className="panel meta-post-search" aria-label="Find a posted caption or visual" style={{ marginTop: 24 }}>
    <div className="panel-heading"><div><span className="eyebrow">FIND AN OLD POST</span><h3>Find a posted caption or visual</h3><p className="settings-copy">Search Facebook and Instagram posts already synced. Opening a result does not publish it again.</p></div></div>
    <div className="meta-search-controls">
      <label>Caption words<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search words in the caption…" autoComplete="off"/></label>
      <label>Platform<select value={platform} onChange={(event) => setPlatform(event.target.value)} aria-label="Platform"><option value="">All</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option></select></label>
      <div className="meta-search-date"><label htmlFor="meta-search-date">Post date</label><div className="meta-search-date-row"><input id="meta-search-date" type="date" value={date} onChange={(event) => setDate(event.target.value)}/>{date ? <button type="button" className="meta-view-post" onClick={() => setDate('')}>Clear date</button> : null}</div></div>
    </div>
    {loading ? <p className="settings-copy">Loading synced posts…</p> : null}
    {!loading && error ? <p className="settings-copy"><span>Synced posts could not be read.</span> {error}</p> : null}
    {!loading && !error && !active ? <p className="settings-copy">{posts.length ? <>{readyText} <span>Type a caption word, choose Facebook or Instagram, or pick a date.</span></> : <span>No synced posts to search yet.</span>}</p> : null}
    {!loading && !error && active && !matches.length ? <p className="settings-copy">No synced posts match this search.</p> : null}
    {visible.length ? <div className="meta-search-results">{visible.map((post) => {
      const image = brokenImages[post.key] ? '' : postImageUrl(post)
      const caption = post.message
      return <article className="meta-search-result" key={post.key}>
        {image ? <img className="meta-search-visual" src={image} alt="" onError={() => setBrokenImages((current) => ({ ...current, [post.key]: true }))}/> : <div className="meta-search-no-image">{postImageUrl(post) ? 'Image could not be shown here.' : 'No image'}</div>}
        <div>
          <div className="meta-search-meta">{post.platform === 'facebook' || post.platform === 'instagram' ? <span className={`meta-platform ${post.platform}`}>{post.platform === 'instagram' ? 'Instagram' : 'Facebook'}</span> : <span>Platform unavailable</span>}<time dateTime={post.createdTime || undefined}>{formatDate(post.createdTime)}</time></div>
          {caption ? <p className="meta-search-caption" data-user-content>{caption}</p> : <p className="meta-search-caption">No caption was synced for this post.</p>}
        </div>
        <button type="button" className="meta-view-post" onClick={() => openPost(post)} aria-label={`Open post from ${formatDate(post.createdTime)}`}>Open post</button>
      </article>
    })}</div> : null}
    {visibleCount < matches.length ? <div className="meta-load-more"><span>{showingText}</span><button type="button" className="button secondary" onClick={() => setVisibleCount((count) => Math.min(count + SEARCH_PAGE_SIZE, matches.length))}>Muat lagi</button></div> : null}
  </section>
}

function PostDetail({ post, onClose }) {
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', close); document.body.classList.add('meta-drawer-open')
    return () => { document.removeEventListener('keydown', close); document.body.classList.remove('meta-drawer-open') }
  }, [onClose])
  const caption = captionText(post)
  const metrics = [['Views', post.views], ['Reach', post.reach], ['Viewers', post.viewers], ['Interactions', post.interactions], ['Reactions', post.reactions], ['Comments', post.comments], ['Shares', post.shares], ['Saves', post.saves]]
  return createPortal(<div className="meta-post-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <aside className="meta-post-drawer" role="dialog" aria-modal="true" aria-labelledby="meta-post-heading">
      <div className="meta-drawer-head"><div><span className="eyebrow">POST DETAILS</span><h3 id="meta-post-heading">{formatDate(post.createdTime)}</h3><p>{post.platform === 'instagram' ? 'Instagram' : 'Facebook'} · {post.type}</p></div><button type="button" className="meta-drawer-close" onClick={onClose} aria-label="Close post details">×</button></div>
      {post.thumbnail ? <div className="meta-post-thumbnail"><img src={post.thumbnail} alt="Post thumbnail" loading="lazy"/></div> : null}
      {caption ? <section className="meta-detail-section"><span className="eyebrow">FULL CAPTION</span><p className="meta-full-caption" data-user-content>{caption}</p></section> : null}
      <section className="meta-detail-section"><span className="eyebrow">ALL METRICS</span><div className="meta-detail-metrics">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{display(value)}</strong></div>)}</div></section>
      <section className="meta-detail-section"><span className="eyebrow">AI PERFORMANCE SUMMARY</span><p>{performanceSummary(post)}</p></section>
      <section className="meta-detail-section recommendation"><span className="eyebrow">NEXT RECOMMENDATION</span><p>{recommendation(post)}</p></section>
      {(post.permalink || post.permalinkUrl) ? <a className="button primary meta-post-link" href={post.permalink || post.permalinkUrl} target="_blank" rel="noreferrer">Open original post</a> : <p className="settings-copy">Original post link not available from Meta.</p>}
    </aside>
  </div>, document.body)
}

export default function MetaInsightsEnhancer() {
  const [host, setHost] = useState(null); const [selectedPost, setSelectedPost] = useState(null)
  const [visibleCount, setVisibleCount] = useState(10)
  const [state, setState] = useState({ loading: true, data: null, error: '', cached: false })
  useEffect(() => { const syncHost = () => setHost(findAnalyticsHost()); syncHost(); const observer = new MutationObserver(syncHost); observer.observe(document.body, { childList: true, subtree: true }); return () => observer.disconnect() }, [])
  useEffect(() => {
    if (!host) return undefined
    const requestUrl = metaInsightsRequestUrl()
    if (!requestUrl) { setState({ loading: false, data: null, error: 'Apps Script deployment belum dikonfigurasi. Tiada KPI Meta dipaparkan.', cached: false }); return undefined }
    let active = true; const cacheKey = CACHE_PREFIX + localDateKey()
    try { const cached = JSON.parse(window.localStorage.getItem(cacheKey) || 'null'); if (cached?.data?.sourceUpdatedAt) { const data = omitMetaTokenDetails(cached.data); if (data !== cached.data) { try { window.localStorage.setItem(cacheKey, JSON.stringify({ data })) } catch { /* Keep the stripped snapshot in memory if storage is full. */ } } setState({ loading: false, data, error: '', cached: true }); return undefined } } catch { /* Read fresh data. */ }
    fetch(requestUrl, { cache: 'no-store' }).then((response) => response.ok ? response.json() : Promise.reject(new Error('Meta endpoint unavailable'))).then((result) => { if (!result?.ok || !result?.data?.sourceUpdatedAt) throw new Error(result?.error || 'Post-level Meta data belum tersedia.'); const data = omitMetaTokenDetails(result.data); const compact = { sourceUpdatedAt: data.sourceUpdatedAt || null, syncedPostCount: data.syncedPostCount || 0, facebook: { topPosts: data.facebook?.topPosts || [] }, instagram: { topPosts: data.instagram?.topPosts || [] }, styleLibrary: data.styleLibrary || [] }; try { Object.keys(window.localStorage).filter((key) => key.startsWith(CACHE_PREFIX) && key !== cacheKey).forEach((key) => window.localStorage.removeItem(key)); window.localStorage.setItem(cacheKey, JSON.stringify({ data: compact })) } catch { /* Browser quota must not block live Meta insights. */ } if (active) setState({ loading: false, data, error: '', cached: false }) }).catch((error) => active && setState({ loading: false, data: null, error: error.message || 'Post-level Meta data belum tersedia.', cached: false }))
    return () => { active = false }
  }, [host])
  const posts = useMemo(() => normalisePosts(state.data), [state.data])
  useEffect(() => { setVisibleCount(10) }, [state.data])
  const visiblePosts = posts.slice(0, visibleCount)
  if (!host) return null
  return <>{createPortal(<>{SHOW_OLD_POST_SEARCH ? <SearchPostedPieces data={state.data} loading={state.loading} error={state.error} onOpen={setSelectedPost}/> : null}<section className="panel meta-post-performance" aria-label="Meta post performance" style={{ marginTop: 24 }}>
    <div className="panel-heading"><div><span className="eyebrow">LIVE META INSIGHTS</span><h3>Recent post performance</h3></div><span className="verified-label system-copy-hidden">{state.cached ? 'Daily sheet snapshot' : 'Read-only Meta data'}</span></div>
    {state.loading ? <p className="settings-copy">Loading verified Meta metrics…</p> : null}{state.error ? <p className="settings-copy">{state.error} Sistem tidak menganggarkan nombor.</p> : null}
    {posts.length ? <><div className="meta-post-list" role="table" aria-label="Recent Facebook and Instagram posts"><div className="meta-post-row meta-post-header" role="row"><span>Date & time</span><span>Platform</span><span>Type</span><span>Views</span><span>Reach</span><span>Viewers</span><span>Interactions</span><span>Post</span></div>{visiblePosts.map((post) => <div className="meta-post-row" role="row" key={post.key}><strong>{formatDate(post.createdTime)}</strong><span className={`meta-platform ${post.platform}`}>{post.platform === 'instagram' ? 'Instagram' : 'Facebook'}</span><span>{post.type}</span><span>{display(post.views)}</span><span>{display(post.reach)}</span><span>{display(post.viewers)}</span><span>{display(post.interactions)}</span><button type="button" className="meta-view-post" onClick={() => setSelectedPost(post)} aria-label={`View post from ${formatDate(post.createdTime)}`}><span aria-hidden="true">◉</span> View Post</button></div>)}</div>{visibleCount < posts.length ? <div className="meta-load-more"><span>Showing {visiblePosts.length} of {posts.length} posts</span><button type="button" className="button secondary" onClick={() => setVisibleCount((count) => Math.min(count + 10, posts.length))}>Muat lagi</button></div> : <p className="meta-list-count">All {posts.length} posts loaded</p>}</> : null}
  </section></>, host)}{selectedPost ? <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)}/> : null}</>
}
