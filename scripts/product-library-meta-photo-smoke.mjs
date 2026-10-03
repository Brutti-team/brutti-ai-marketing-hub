import { matchProductPhotos, postsFromSnapshot, productLibraryPhoto } from '../src/lib/metaProductPhoto.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const parik = { id: 'BR-001', name: 'Study Desk, Parik' }
const plainDesk = { id: 'BR-002', name: 'Study Desk' }
const kaanagan = { id: 'BR-010', name: 'KAANAGAN Open Concept Wardrobe' }
const kaanaganDrawers = { id: 'BR-011', name: 'KAANAGAN Open Concept Wardrobe with Drawers' }
const onlyDesk = { id: 'BR-020', name: 'Desk' }
const parikMini = { id: 'BR-021', name: 'Parik Mini' }

const photo = 'https://cdn.example/already-synced.jpg'
const newer = 'https://cdn.example/newer-synced.jpg'

function post(message, imageUrl = photo, extra = {}) {
  return { sourceId: extra.sourceId || 'post-1', platform: extra.platform || 'facebook', createdTime: extra.createdTime || '2024-01-01T00:00:00.000Z', message, imageUrl }
}

const named = matchProductPhotos([parik, plainDesk], [post('Meja Parik untuk bilik belajar.')])
assert(named[parik.id]?.imageUrl === photo, 'A unique product name in the caption should use that post image URL.')
assert(!named[plainDesk.id], 'A caption that only shares a generic desk description must not match another product.')

const sku = matchProductPhotos([parik], [post('Ready stock BR-001.')])
assert(sku[parik.id]?.imageUrl === photo, 'A clear SKU in the caption should use that post image URL.')

const vague = matchProductPhotos([parik], [post('Nampak macam desk yang kemas.')])
assert(!vague[parik.id], 'A vague desk caption must not attach a photo.')

const lookalike = matchProductPhotos([parik], [post('Parikh desk BR-0012 is not this product.')])
assert(!lookalike[parik.id], 'A longer word or SKU must not count as Parik or BR-001.')

const hashtag = matchProductPhotos([parik], [post('Baru siap #Parik')])
assert(hashtag[parik.id]?.imageUrl === photo, 'A hashtag of the product name is still a clear name.')

const noImage = matchProductPhotos([parik], [post('Parik', '')])
assert(!noImage[parik.id], 'A matching caption without an image URL must stay on the placeholder.')

const notHttp = matchProductPhotos([parik], [post('Parik', '/local/parik.jpg')])
assert(!notHttp[parik.id], 'Only an existing http(s) image URL from the synced post can be shown.')

const siblings = [kaanagan, kaanaganDrawers]
const ambiguous = matchProductPhotos(siblings, [post('KAANAGAN sudah siap.')])
assert(!ambiguous[kaanagan.id] && !ambiguous[kaanaganDrawers.id], 'A shared name with no SKU or full name must be skipped.')

const exactDrawers = matchProductPhotos(siblings, [post('KAANAGAN Open Concept Wardrobe with Drawers sudah siap.')])
assert(exactDrawers[kaanaganDrawers.id]?.imageUrl === photo, 'The full product name should match that product.')
assert(!exactDrawers[kaanagan.id], 'A shorter product name inside a longer name must not take the photo.')

const exactShort = matchProductPhotos(siblings, [post('KAANAGAN Open Concept Wardrobe untuk bilik.')])
assert(exactShort[kaanagan.id]?.imageUrl === photo, 'The shorter full name should match when the longer name is absent.')
assert(!exactShort[kaanaganDrawers.id], 'The longer sibling must stay unmatched when only the shorter name is written.')

const singleWord = matchProductPhotos([onlyDesk], [post('A new desk for the room.')])
assert(!singleWord[onlyDesk.id], 'A single generic word is not a clear product name.')

const fullGeneric = matchProductPhotos([plainDesk, parik], [post('Study desk untuk ruang baca.')])
assert(fullGeneric[plainDesk.id]?.imageUrl === photo, 'The full existing name Study Desk is a clear match for that product.')
assert(!fullGeneric[parik.id], 'Study Desk must not attach a photo to Study Desk, Parik.')

const sharedParik = matchProductPhotos([parik, parikMini], [post('Parik')])
assert(!sharedParik[parik.id] && !sharedParik[parikMini.id], 'Parik shared by two products is vague unless the caption names one of them fully.')

const exactParik = { id: 'BR-030', name: 'Parik' }
const exactOnly = matchProductPhotos([exactParik, parikMini], [post('Parik')])
assert(exactOnly[exactParik.id]?.imageUrl === photo, 'A product named Parik should match a caption that says Parik.')
assert(!exactOnly[parikMini.id], 'Parik Mini must not take a caption that only says Parik.')

const miniCaption = matchProductPhotos([parik, parikMini], [post('Parik Mini sudah sampai.')])
assert(miniCaption[parikMini.id]?.imageUrl === photo, 'Parik Mini should match its full name.')
assert(!miniCaption[parik.id], 'The shorter Parik name must not take a caption that names Parik Mini.')

const newest = matchProductPhotos([parik], [
  post('Parik lama', photo, { sourceId: 'old', createdTime: '2023-01-01T00:00:00.000Z' }),
  post('Parik baru', newer, { sourceId: 'new', createdTime: '2025-06-01T00:00:00.000Z', platform: 'instagram' }),
])
assert(newest[parik.id]?.imageUrl === newer, 'The newest clear post should supply the image URL.')
assert(newest[parik.id]?.platform === 'instagram', 'Instagram should stay labelled as Instagram.')

const tiktok = matchProductPhotos([parik], [post('Parik', photo, { platform: 'tiktok' })])
assert(!tiktok[parik.id], 'TikTok posts are out of scope.')

const saved = productLibraryPhoto(parik, '/brutti-ai-marketing-hub/catalog-products/PARIK.jpg', named)
assert(saved.source === 'saved' && saved.src.includes('PARIK.jpg'), 'An existing product photo must stay in place.')

const filled = productLibraryPhoto(parik, '', named)
assert(filled.source === 'meta' && filled.src === photo, 'A product with no photo should show the synced image URL.')

const empty = productLibraryPhoto(plainDesk, '   ', named)
assert(empty.source === 'placeholder' && empty.src === '', 'A product with no safe match keeps an empty placeholder.')

const snapshot = postsFromSnapshot({
  allPosts: [post('from-all')],
  facebook: { topPosts: [post('from-top')] },
})
assert(snapshot.length === 1 && snapshot[0].message === 'from-all', 'Matching should read the full synced post list when it is present.')

const fallback = postsFromSnapshot({ facebook: { topPosts: [post('fb')]}, instagram: { topPosts: [post('ig')] } })
assert(fallback.length === 2, 'Without allPosts, Facebook and Instagram top posts are the synced set.')

console.log('PASS: Product Library uses a synced photo only for a clear name or SKU.')
