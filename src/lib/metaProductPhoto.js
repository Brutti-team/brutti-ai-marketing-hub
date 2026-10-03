// Attach a synced Facebook or Instagram image only when the caption clearly
// names that product. Generic words such as "desk" are never enough.

const GENERIC_WORDS = new Set([
  'study', 'desk', 'desks', 'table', 'tables', 'rack', 'racks', 'shelf', 'shelves', 'shelving',
  'bed', 'beds', 'wardrobe', 'wardrobes', 'storage', 'display', 'console', 'organizer', 'organiser',
  'open', 'concept', 'modular', 'closet', 'drawer', 'drawers', 'shoe', 'shoes', 'cloth', 'pastry',
  'baby', 'cot', 'dining', 'kitchen', 'island', 'wall', 'learning', 'tower', 'door', 'doors',
  'loft', 'bespoke', 'custom', 'unit', 'units', 'side', 'front', 'small', 'large', 'medium', 'mini',
  'series', 'collection', 'furniture', 'product', 'products', 'shawl', 'sampin', 'with', 'from',
  'meja', 'rak', 'almari', 'katil', 'kerusi', 'laci', 'dapur', 'ruang', 'kabinet', 'kayu',
  'belajar', 'kanak', 'anak', 'rumah', 'bilik', 'tidur', 'makan', 'kasut', 'baju', 'kain',
])

export function normalizeProductText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function nameTokens(name) {
  return normalizeProductText(name).split(' ').filter(Boolean)
}

function isDistinctiveToken(token) {
  return Boolean(token) && token.length >= 4 && !/^\d+$/.test(token) && !GENERIC_WORDS.has(token)
}

export function distinctiveNameTokens(name) {
  return [...new Set(nameTokens(name).filter(isDistinctiveToken))]
}

function phraseInText(phrase, text) {
  const needle = normalizeProductText(phrase)
  const haystack = normalizeProductText(text)
  if (!needle || !haystack) return false
  const parts = needle.split(' ')
  const tokens = haystack.split(' ')
  for (let index = 0; index <= tokens.length - parts.length; index += 1) {
    if (parts.every((part, offset) => tokens[index + offset] === part)) return true
  }
  return false
}

function sameProduct(left, right) {
  return productPhotoKey(left) !== '' && productPhotoKey(left) === productPhotoKey(right)
}

export function productPhotoKey(product) {
  const id = String(product?.id || '').trim()
  if (id) return id
  const name = normalizeProductText(product?.name)
  return name ? `name:${name}` : ''
}

function skuCandidates(product) {
  const found = []
  const id = String(product?.id || '').trim()
  if (/^BR-\d{3,}$/i.test(id)) found.push(id.toUpperCase())
  const named = String(product?.name || '').match(/\bBR-\d{3,}\b/gi) || []
  named.forEach((sku) => found.push(sku.toUpperCase()))
  return [...new Set(found)]
}

function skuInCaption(product, caption) {
  return skuCandidates(product).some((sku) => {
    const digits = sku.slice(3)
    const pattern = new RegExp(`(^|[^A-Za-z0-9])BR[-\\u2013\\u2014\\s]?${digits}([^0-9]|$)`, 'i')
    return pattern.test(String(caption || ''))
  })
}

function fullNameIsClear(name) {
  const tokens = nameTokens(name)
  if (tokens.length >= 2) return true
  return tokens.some(isDistinctiveToken)
}

function fullNameInCaption(product, caption, products) {
  const mine = normalizeProductText(product?.name)
  if (!fullNameIsClear(product?.name) || !phraseInText(mine, caption)) return false
  const blockedByLongerName = products.some((other) => {
    if (sameProduct(other, product)) return false
    const otherName = normalizeProductText(other?.name)
    return otherName.length > mine.length && otherName.startsWith(`${mine} `) && phraseInText(otherName, caption)
  })
  if (blockedByLongerName) return false
  const duplicateName = products.some((other) => !sameProduct(other, product) && normalizeProductText(other?.name) === mine)
  return !duplicateName
}

function uniqueNameInCaption(product, caption, products) {
  const matched = distinctiveNameTokens(product?.name).filter((token) => phraseInText(token, caption))
  if (!matched.length) return false
  return matched.some((token) => !products.some((other) => {
    if (sameProduct(other, product)) return false
    return distinctiveNameTokens(other?.name).includes(token)
  }))
}

export function captionClearlyNamesProduct(product, caption, products) {
  if (!product) return false
  const list = Array.isArray(products) && products.length ? products : [product]
  if (skuInCaption(product, caption)) return true
  if (fullNameInCaption(product, caption, list)) return true
  return uniqueNameInCaption(product, caption, list)
}

function postCaption(post) {
  return String(post?.message || post?.caption || '')
}

function isSyncedMetaPost(post) {
  const platform = String(post?.platform || 'facebook').trim().toLowerCase()
  if (platform !== 'facebook' && platform !== 'instagram') return false
  const imageUrl = String(post?.imageUrl || '').trim()
  if (!/^https?:\/\//i.test(imageUrl)) return false
  return Boolean(postCaption(post).trim())
}

function postTime(post) {
  const time = Date.parse(post?.createdTime || '')
  return Number.isFinite(time) ? time : 0
}

export function postsFromSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return []
  if (Array.isArray(snapshot.allPosts) && snapshot.allPosts.length) return snapshot.allPosts
  return [...(snapshot.facebook?.topPosts || []), ...(snapshot.instagram?.topPosts || [])]
}

export function matchProductPhotos(products, posts) {
  const list = Array.isArray(products) ? products.filter(Boolean) : []
  const usablePosts = (Array.isArray(posts) ? posts : []).filter(isSyncedMetaPost)
  const matches = {}
  list.forEach((product) => {
    const key = productPhotoKey(product)
    if (!key) return
    const hits = usablePosts
      .filter((post) => captionClearlyNamesProduct(product, postCaption(post), list))
      .sort((left, right) => postTime(right) - postTime(left))
    if (!hits.length) return
    const post = hits[0]
    const platform = String(post.platform || 'facebook').trim().toLowerCase() === 'instagram' ? 'instagram' : 'facebook'
    matches[key] = {
      imageUrl: String(post.imageUrl).trim(),
      platform,
      postId: String(post.sourceId || post.id || ''),
    }
  })
  return matches
}

export function productLibraryPhoto(product, savedImage, matches) {
  const saved = String(savedImage || '').trim()
  if (saved) return { src: saved, source: 'saved' }
  const match = matches?.[productPhotoKey(product)]
  const src = String(match?.imageUrl || '').trim()
  if (!/^https?:\/\//i.test(src)) return { src: '', source: 'placeholder' }
  return {
    src,
    source: 'meta',
    platform: match.platform === 'instagram' ? 'instagram' : 'facebook',
  }
}
