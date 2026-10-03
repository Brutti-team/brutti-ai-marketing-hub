import { filterSyncedPosts, kualaLumpurDateKey, normaliseSearchPosts, postImageUrl } from '../src/lib/syncedPostSearch.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const data = {
  facebook: {
    topPosts: [
      {
        sourceId: 'fb-1',
        platform: 'facebook',
        createdTime: '2024-05-02T02:30:00.000Z',
        message: 'Meja makan kayu untuk ruang kecil.',
        imageUrl: '',
        views: null,
        reach: null,
        reactions: null,
        comments: null,
        shares: null,
        saves: null,
        engagement: null,
      },
      {
        sourceId: 'fb-2',
        platform: 'facebook',
        createdTime: '2024-06-01T10:00:00.000Z',
        message: 'Kabinet dapur berwarna putih.',
        imageUrl: 'https://example.com/kabinet.jpg',
        views: 10,
        engagement: 4,
      },
    ],
  },
  instagram: {
    topPosts: [
      {
        sourceId: 'ig-1',
        platform: 'instagram',
        createdTime: '2024-05-01T16:30:00.000Z',
        message: 'Sofa sudut di ruang tamu.',
        thumbnail: 'https://example.com/sofa.jpg',
        reactions: 3,
      },
    ],
  },
  allPosts: [
    {
      sourceId: 'fb-1',
      platform: 'facebook',
      createdTime: '2024-05-02T02:30:00.000Z',
      message: 'Meja makan kayu untuk ruang kecil.',
    },
  ],
}

const posts = normaliseSearchPosts(data)
assert(posts.length === 3, 'Search keeps captioned posts even when metrics or an image are missing.')
assert(posts[0].sourceId === 'fb-2', 'Newest synced post is listed first.')
const withoutImage = posts.find((post) => post.sourceId === 'fb-1')
assert(withoutImage && postImageUrl(withoutImage) === '', 'A missing image stays missing.')
assert(postImageUrl(posts.find((post) => post.sourceId === 'ig-1')) === 'https://example.com/sofa.jpg', 'An existing https image link is kept.')
assert(postImageUrl({ imageUrl: 'javascript:alert(1)' }) === '', 'A non-https image link is not used.')

const byWords = filterSyncedPosts(posts, { query: 'meja kayu' })
assert(byWords.length === 1 && byWords[0].sourceId === 'fb-1', 'Caption words all have to match.')
assert(filterSyncedPosts(posts, { query: 'sofa', platform: 'instagram' }).length === 1, 'Platform filter limits caption matches.')
assert(filterSyncedPosts(posts, { query: 'sofa', platform: 'facebook' }).length === 0, 'A Facebook filter does not return an Instagram caption.')

const klDate = kualaLumpurDateKey('2024-05-01T16:30:00.000Z')
assert(klDate === '2024-05-02', 'Post dates use the Kuala Lumpur calendar day.')
assert(filterSyncedPosts(posts, { date: '2024-05-02' }).map((post) => post.sourceId).sort().join() === 'fb-1,ig-1', 'Date search uses the synced created time.')
assert(filterSyncedPosts(posts, { platform: 'instagram', date: '2024-05-02' })[0].sourceId === 'ig-1', 'Platform and date filters combine.')

console.log('PASS: synced post search uses caption words, platform, and date without inventing an image.')
