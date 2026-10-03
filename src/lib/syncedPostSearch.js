function metric(value) {
  return value === null || value === undefined || value === '' ? null : (Number.isFinite(Number(value)) ? Number(value) : null)
}

function contentType(value) {
  const format = String(value || 'post').toLowerCase()
  if (format.includes('carousel') || format.includes('album')) return 'Carousel'
  if (format.includes('reel') || format.includes('video')) return 'Reel'
  if (format.includes('story')) return 'Story'
  if (format.includes('photo') || format.includes('image')) return 'Photo'
  return 'Post'
}

function knownPlatform(value) {
  const platform = String(value || '').toLowerCase()
  return platform === 'facebook' || platform === 'instagram' ? platform : ''
}

export function kualaLumpurDateKey(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function postImageUrl(post) {
  const url = String(post?.imageUrl || post?.thumbnail || '').trim()
  return /^https:\/\//i.test(url) ? url : ''
}

export function normaliseSearchPosts(data) {
  const raw = [
    ...(Array.isArray(data?.facebook?.topPosts) ? data.facebook.topPosts : []),
    ...(Array.isArray(data?.instagram?.topPosts) ? data.instagram.topPosts : []),
    ...(Array.isArray(data?.allPosts) ? data.allPosts : []),
  ]
  const unique = new Map()
  raw.forEach((post, index) => {
    const platform = knownPlatform(post?.platform)
    const message = String(post?.message || post?.caption || post?.text || '').trim()
    const createdTime = post?.createdTime || ''
    if (!message && !createdTime && !platform) return
    const sourceId = String(post?.sourceId || `${platform || 'post'}-${createdTime || 'nodate'}-${index}`)
    if (unique.has(sourceId)) return
    const reactions = metric(post?.reactions)
    const comments = metric(post?.comments)
    const shares = metric(post?.shares)
    const saves = metric(post?.saves)
    const engagement = metric(post?.engagement)
    const interactions = engagement ?? ([reactions, comments, shares, saves].some((value) => value !== null)
      ? [reactions, comments, shares, saves].reduce((total, value) => total + (value || 0), 0)
      : null)
    unique.set(sourceId, {
      ...post,
      key: sourceId,
      sourceId,
      platform,
      type: contentType(post?.format),
      message,
      createdTime,
      views: metric(post?.views),
      reach: metric(post?.reach),
      viewers: metric(post?.viewers),
      reactions,
      comments,
      shares,
      saves,
      engagement,
      interactions,
    })
  })
  return [...unique.values()].sort((a, b) => {
    const aTime = new Date(a.createdTime || 0).getTime()
    const bTime = new Date(b.createdTime || 0).getTime()
    const aValue = Number.isNaN(aTime) ? 0 : aTime
    const bValue = Number.isNaN(bTime) ? 0 : bTime
    return bValue - aValue
  })
}

export function filterSyncedPosts(posts, { query = '', platform = '', date = '' } = {}) {
  const words = String(query).toLowerCase().split(/\s+/).filter(Boolean)
  const platformFilter = knownPlatform(platform)
  const dateFilter = String(date || '').trim()
  return posts.filter((post) => {
    if (platformFilter && post.platform !== platformFilter) return false
    if (dateFilter && kualaLumpurDateKey(post.createdTime) !== dateFilter) return false
    if (!words.length) return true
    const caption = String(post.message || '').toLowerCase()
    return words.every((word) => caption.includes(word))
  })
}
