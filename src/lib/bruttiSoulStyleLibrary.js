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
        const message = clean(post?.caption || post?.message)
        if (message) posts.push(message)
      })
    } catch {
      // A stale or partial cache should never block caption generation.
    }
  }
  return [...new Set(posts)]
}

export function readBruttiSoulStyleProfile() {
  const captions = readCachedPosts()
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
