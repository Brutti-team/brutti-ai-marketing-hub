// Where the app reads its data from.
// Michelle (26 Nov 2026): use only Meta + GitHub. Data is read from the public
// Brutti-team/brutti-hub-data repo (GitHub Pages). Planner and content notes stay
// on this device (localStorage). The Google Apps Script code paths are kept but
// switched off with these flags so they can be turned back on later.
export const USE_GITHUB_DATA = true
// Settings → "Internal access" workspace-key form and "Connect Google" copy.
export const SHOW_GOOGLE_CONNECT = false
// Gemini caption assist through Apps Script. Off: local template captions only.
export const USE_GEMINI_ASSIST = false
// Marketing Tools campaign form: show the Status select. Off: status stays at its saved/default value (Idea).
export const SHOW_MT_STATUS_FIELD = false
// Marketing Tools campaign form: show the small "MARKETING TOOLS" label above the title.
export const SHOW_MT_FORM_EYEBROW = false

export const GITHUB_DATA_BASE = 'https://brutti-team.github.io/brutti-hub-data/'

export function dataUrl(path = '') {
  const value = String(path || '')
  if (!value) return ''
  if (/^(https?:|data:|blob:)/i.test(value) || value.startsWith('/')) return value
  return GITHUB_DATA_BASE + value.replace(/^\.?\//, '')
}

const inFlight = new Map()

// One download per file per page load; callers share it.
export function fetchDataJson(path) {
  if (inFlight.has(path)) return inFlight.get(path)
  const request = fetch(dataUrl(path), { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`Data file ${path} is unavailable (${response.status}).`)
      return response.json()
    })
    .catch((error) => { inFlight.delete(path); throw error })
  inFlight.set(path, request)
  return request
}

const rankingValue = (post) => {
  for (const key of ['engagement', 'reach', 'reactions', 'views']) if (post?.[key] !== null && post?.[key] !== undefined) return post[key]
  return 0
}

// Same shape the Apps Script meta-insights endpoint returned, so every
// existing screen keeps working.
export async function loadGitHubMetaInsights() {
  const [recent, style, status] = await Promise.all([
    fetchDataJson('meta/posts-recent.json'),
    fetchDataJson('meta/style-library.json').catch(() => ({ items: [] })),
    fetchDataJson('meta/status.json').catch(() => ({})),
  ])
  const ranked = [...(recent?.posts || [])].sort((a, b) => rankingValue(b) - rankingValue(a))
  const unavailable = new Set()
  ranked.forEach((post) => ['views', 'reach', 'reactions', 'comments', 'shares', 'saves', 'engagement'].forEach((key) => { if (post[key] === null || post[key] === undefined) unavailable.add(key) }))
  return {
    sourceUpdatedAt: recent?.sourceUpdatedAt || status?.sourceUpdatedAt || null,
    syncedPostCount: status?.syncedPostCount || ranked.length,
    unavailableMetrics: [...unavailable],
    tokenStatus: status?.tokenStatus || 'unknown',
    instagram: { latestReach: null, followers: null, trend: [], topPosts: ranked.filter((post) => post.platform === 'instagram') },
    facebook: { followers: null, topPosts: ranked.filter((post) => post.platform !== 'instagram') },
    allPosts: ranked,
    styleLibrary: style?.items || [],
    archiveCounts: status?.archiveCounts || {},
  }
}

// Older posts are split by year and only downloaded when a view needs them.
export async function loadMetaArchivePosts(years = []) {
  const status = await fetchDataJson('meta/status.json').catch(() => ({}))
  const available = new Set(Object.keys(status?.archiveCounts || {}).map(String))
  const wanted = [...new Set(years.map(String))].filter((year) => available.has(year))
  const files = await Promise.all(wanted.map((year) => fetchDataJson(`meta/posts-archive-${year}.json`).catch(() => ({ posts: [] }))))
  return files.flatMap((file) => file?.posts || [])
}

export async function loadGitHubProducts() {
  const data = await fetchDataJson('products.json')
  return (data?.products || []).map((product) => ({ ...product, imageUrl: dataUrl(product.imageUrl) }))
}

export async function loadGitHubKols() {
  const data = await fetchDataJson('kol.json')
  return data?.kols || []
}

export async function loadGitHubMarketingTools() {
  const data = await fetchDataJson('marketing-tools.json')
  return (data?.tools || []).map((tool) => ({ ...tool, imageUrl: dataUrl(tool.imageUrl) }))
}

// Planner / content notes live on this device only. Fill them once from the
// shared snapshot when this device has nothing yet (or only the demo rows).
// Existing notes on the device are never overwritten.
const SEED_MARK = 'brutti-github-seed-v1'

function readList(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null
    const value = JSON.parse(raw)
    return Array.isArray(value) ? value : null
  } catch {
    return null
  }
}

export function deviceListNeedsSeed(key, demoList = []) {
  try {
    const marks = JSON.parse(window.localStorage.getItem(SEED_MARK) || '{}')
    if (marks[key]) return false
  } catch { /* treat as unseeded */ }
  const list = readList(key)
  if (!list || !list.length) return true
  const demoIds = new Set(demoList.map((item) => String(item.id)))
  return list.every((item) => demoIds.has(String(item?.id)))
}

export function markDeviceListSeeded(key) {
  try {
    const marks = JSON.parse(window.localStorage.getItem(SEED_MARK) || '{}')
    marks[key] = new Date().toISOString()
    window.localStorage.setItem(SEED_MARK, JSON.stringify(marks))
  } catch { /* optional */ }
}

export async function loadGitHubSeed(kind) {
  if (kind === 'plans') return (await fetchDataJson('planner.json'))?.plans || []
  if (kind === 'content') return (await fetchDataJson('content.json'))?.content || []
  if (kind === 'marketing-tools') return loadGitHubMarketingTools()
  return []
}
