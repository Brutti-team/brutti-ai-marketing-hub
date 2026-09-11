const CACHE_PREFIX = 'brutti-meta-daily-insights-'

const EMPTY_PROFILE = {
  count: 0,
  averageLines: 0,
  firstPerson: false,
  casual: false,
  reflective: false,
  practical: false,
  questionLed: false,
  source: 'rule-library',
}

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function preserveCaption(value = '') {
  return String(value || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => clean(line))
    .filter(Boolean)
    .join('\n')
}

function readCachedPosts() {
  if (typeof window === 'undefined' || !window.localStorage) return []
  const posts = []
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key?.startsWith(CACHE_PREFIX)) continue
    try {
      const cached = JSON.parse(window.localStorage.getItem(key) || 'null')
      const data = cached?.data || cached
      const library = Array.isArray(data?.styleLibrary) ? data.styleLibrary : []
      const fallback = [...(data?.facebook?.topPosts || []), ...(data?.instagram?.topPosts || [])]
      ;[...library, ...fallback].forEach((post) => {
        const message = preserveCaption(post?.caption || post?.message)
        if (message) posts.push({ message, platform: post?.platform || '' })
      })
    } catch {
      // A stale or partial cache should never block caption generation.
    }
  }
  const unique = new Map()
  posts.forEach((post) => { if (!unique.has(post.message)) unique.set(post.message, post) })
  return [...unique.values()]
}

function words(value = '') {
  return new Set(clean(value).toLowerCase().split(/[^a-z0-9à-ÿ]+/i).filter((word) => word.length > 2))
}

function overlap(left, right) {
  const a = words(left); const b = words(right)
  if (!a.size || !b.size) return 0
  return [...a].filter((word) => b.has(word)).length / Math.max(1, Math.min(a.size, 12))
}

const SEMANTIC_GROUPS = [
  ['kiosk', 'foldable', 'portable', 'mudah dibawa', 'event', 'setup', 'display'],
  ['sidai', 'towel', 'sejadah', 'kain'],
  ['storage', 'simpan', 'ruang letak', 'tepi katil'],
  ['extend', 'buka', 'luas', 'ramai'],
  ['decoration', 'hias', 'kemas', 'ruang'],
]

function semanticMatch(query, caption) {
  const left = clean(query).toLowerCase()
  const right = clean(caption).toLowerCase()
  return SEMANTIC_GROUPS.reduce((score, group) => {
    const queryHit = group.some((term) => left.includes(term))
    const captionHit = group.some((term) => right.includes(term))
    return score + (queryHit && captionHit ? 1 : 0)
  }, 0)
}

function splitCaption(value = '') {
  return String(value || '')
    .split(/\n+|(?<=[.!?…])\s+/)
    .map(clean)
    .filter(Boolean)
}

export function analyseBruttiSoulStructure(caption = '') {
  const lines = splitCaption(caption)
  const joined = lines.join(' ').toLowerCase()
  return {
    lineCount: lines.length,
    firstPerson: /\b(kami|kita|saya|aku)\b/i.test(joined),
    reflective: /\b(cerita|ingat|perjalanan|hasil kerja|proses|guna dia|penting)\b/i.test(joined),
    practical: /\b(fungsi|guna|ruang|simpan|boleh|mudah|senang)\b/i.test(joined),
    question: /\?/.test(joined),
    dashHook: /[—–-]/.test(lines[0] || ''),
    sequence: lines.map((line) => /\b(boleh|guna|fungsi|simpan|saiz|storage|mudah|senang)\b/i.test(line) ? 'fact-or-use' : /\b(kami|kita|bagi kami)\b/i.test(line) ? 'brand-reflection' : 'story').slice(0, 6),
  }
}

export function selectBruttiSoulReference(form = {}, brief = '') {
  const captions = readCachedPosts()
  if (!captions.length) return null
  const query = `${form.title || ''} ${form.product || ''} ${brief || ''}`
  const focus = String(form.type || '').toLowerCase()
  const ranked = captions.map((item, index) => {
    const text = item.message.toLowerCase()
    let score = overlap(query, item.message) * 6
    if (form.title && text.includes(String(form.title).toLowerCase())) score += 8
    score += semanticMatch(query, item.message) * 3
    if (focus.includes('behind') && /proses|kerja|team|buat|hasil|craftsmanship|tangan/.test(text)) score += 2
    if (focus.includes('product') && /fungsi|guna|ruang|saiz|size|boleh|mudah/.test(text)) score += 2
    if (focus.includes('promotion') && /harga|promo|offer|diskaun|limited/.test(text)) score += 2
    if (focus.includes('customer') && /client|customer|pelanggan|minta|order|datang/.test(text)) score += 2
    return { ...item, score: score - index * 0.0001 }
  }).sort((a, b) => b.score - a.score)[0]
  return ranked ? { ...ranked, structure: analyseBruttiSoulStructure(ranked.message) } : null
}

export function readBruttiSoulStyleProfile() {
  const captions = readCachedPosts().map((item) => item.message)
  if (!captions.length) return EMPTY_PROFILE
  const joined = captions.join(' ').toLowerCase()
  const lineCounts = captions.map((caption) => caption.split(/\n+/).filter(Boolean).length)
  return {
    count: captions.length,
    averageLines: Math.round((lineCounts.reduce((sum, value) => sum + value, 0) / captions.length) * 10) / 10,
    firstPerson: /\b(kami|kita|saya|aku)\b/i.test(joined),
    casual: /\b(ni|ja|bah|ba|mau|kasi|ngam|suda|nda|kan|pun)\b/i.test(joined),
    reflective: /\b(cerita|ingat|perjalanan|bangga|syukur|hasil kerja|proses)\b/i.test(joined),
    practical: /\b(boleh|guna|fungsi|ruang|senang|mudah|simpan|sesuai)\b/i.test(joined),
    questionLed: captions.filter((caption) => /^\s*[^.!?]{3,80}\?/.test(caption)).length >= Math.ceil(captions.length / 3),
    source: 'meta-caption-library',
  }
}

export function styleLibraryLabel(profile = EMPTY_PROFILE) {
  return profile.count ? `Brutti Soul Style Library · ${profile.count} caption Meta dibaca` : 'Brutti Soul Style Library · Rule library sahaja'
}
