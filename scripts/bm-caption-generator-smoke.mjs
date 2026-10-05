import fs from 'node:fs'
import { generateBmCaptions, isBlankField } from '../src/lib/bmCaptionGenerator.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const data = fs.readFileSync(new URL('../src/data.js', import.meta.url), 'utf8')
const app = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const engine = fs.readFileSync(new URL('../src/lib/bmCaptionGenerator.js', import.meta.url), 'utf8')
const posts = fs.readFileSync(new URL('../src/MetaInsightsEnhancer.jsx', import.meta.url), 'utf8')
const packageJson = fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')

const productBlock = data.slice(data.indexOf('export const productNames'), data.indexOf(']', data.indexOf('export const productNames')))
const productNames = [...productBlock.matchAll(/'([^']+)'/g)].map((match) => match[1])
const categories = ['Storage', 'Wardrobe', 'Display', 'Bespoke']

function fallbackProduct(name) {
  const index = productNames.indexOf(name)
  assert(index >= 0, `${name} must exist in the fallback Product Library.`)
  return {
    id: `BR-${String(index + 1).padStart(3, '0')}`,
    name,
    category: categories[index % categories.length],
    price: '',
    material: '',
    dimensions: '',
    colour: '',
  }
}

const goals = ['highlight', 'promo', 'customer', 'behind', 'tips']
const bannedPhrases = [
  'Ia ialah almari dalam kerja Brutti',
  'Ia ialah rak storan dalam kerja Brutti',
  'Ia ialah',
  'dalam kerja Brutti',
  'Sorotan hari ini hanya satu',
  'Sorotan hari ini',
  'Kami tidak akan mengatakan ini yang terbaik di dunia',
  'terbaik di dunia',
  'Kategori dalam rekod',
  'Dalam rekod',
  'ialah',
  'terangkan dengan jelas',
  'untuk kerja tu',
  'tak patut',
  'memang untuk ruang macam tu',
  'penggunaan sebenar',
]

function assertNatural(text) {
  for (const phrase of bannedPhrases) {
    assert(!text.includes(phrase), `Stiff phrase leaked (${phrase}):\n${text}`)
  }
}

// Recent Brutti posts and Soul: loghat shows up as bah, teda, ngam, kasi, ni, tinguk, jaaa.
const soulDialect = /\b(bah|teda|ngam|kasi|jaaa|ni|tinguk|bikin)\b/i

function nonEmptyLines(text) {
  return String(text).split('\n').map((line) => line.trim()).filter(Boolean)
}

function assertDialect(output) {
  for (const key of ['facebook', 'instagram', 'tiktok']) {
    assert(soulDialect.test(output[key]), `${key} caption is missing Sabah dialect:\n${output[key]}`)
  }
}

function wordSet(text) {
  return new Set(String(text).toLowerCase().split(/[^a-z0-9à-ÿ]+/i).filter((word) => word.length > 3))
}

function differenceCount(left, right) {
  const a = wordSet(left)
  const b = wordSet(right)
  let count = 0
  for (const word of a) if (!b.has(word)) count += 1
  for (const word of b) if (!a.has(word)) count += 1
  return count
}

function assertNoBlankLeak(text, product, note = '') {
  const source = `${product.price || ''} ${product.material || ''} ${product.dimensions || ''} ${product.colour || ''} ${note}`
  if (isBlankField(product.price) && !/\bRM\b/i.test(source)) {
    assert(!/\bRM\b/i.test(text), `Blank price invented an RM amount:\n${text}`)
    assert(!/\bharga\b/i.test(text), `Blank price still mentioned harga:\n${text}`)
  }
  if (isBlankField(product.material)) {
    assert(!/\bmaterial\b/i.test(text) && !/\bbahan\b/i.test(text), `Blank material was written:\n${text}`)
  }
  if (isBlankField(product.dimensions)) {
    assert(!/\bdimensi\b/i.test(text) && !/\bsaiz\b/i.test(text) && !/\bukuran\b/i.test(text) && !/\bcm\b/i.test(text), `Blank dimensions were written:\n${text}`)
  }
  if (isBlankField(product.colour)) {
    assert(!/\bwarna\b/i.test(text), `Blank colour was written:\n${text}`)
  }
  if (!/diskaun|percuma|stok|limited|%/i.test(source)) {
    assert(!/\b(diskaun|percuma|stok|limited)\b|%/i.test(text), `Invented offer language:\n${text}`)
  }
  assert(!/\[(harga|price|material|colour|color|saiz|dimensi)\]/i.test(text), `Placeholder token leaked:\n${text}`)
  assert(!/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(text), `Invented date:\n${text}`)
}

function assertPlatforms(output) {
  assert(output.facebook !== output.instagram, 'Facebook and Instagram must not be the same caption.')
  assert(!/\b(analitik|analytics|views|reach|tontonan)\b/i.test(output.tiktok), 'TikTok caption must not include analytics.')
  for (const key of ['facebook', 'instagram', 'tiktok']) {
    const lines = nonEmptyLines(output[key])
    assert(lines.length >= 4 && lines.length <= 5, `${key} must be 4 to 5 non-empty lines, got ${lines.length}:\n${output[key]}`)
    assert(!output[key].includes('#'), `${key} must not contain a hashtag:\n${output[key]}`)
  }
}

const kaanagan = fallbackProduct('KAANAGAN Open Concept Wardrobe with Drawers')
const ahtam = fallbackProduct('AHTAM XL Shelving Rack')
const pusma = fallbackProduct('PUSMA Display Rack')
const facebookSamples = []

for (const product of [kaanagan, ahtam, pusma]) {
  for (const goal of goals) {
    const versions = [0, 1, 2].map((variation) => generateBmCaptions({ product, goal, variation }))
    versions.forEach((output) => {
      const combined = `${output.facebook}\n${output.instagram}\n${output.tiktok}`
      assertPlatforms(output)
      assertNatural(combined)
      assertDialect(output)
      assertNoBlankLeak(combined, product)
      facebookSamples.push(output.facebook)
      assert(output.facebook.includes(product.name), 'Caption must keep the real product name.')
      assert(!output.usedFacts.includes('price'), 'Blank price must not be marked as used.')
      assert(!output.usedFacts.includes('material'), 'Blank material must not be marked as used.')
      assert(!output.usedFacts.includes('dimensions'), 'Blank dimensions must not be marked as used.')
      assert(!output.usedFacts.includes('colour'), 'Blank colour must not be marked as used.')
    })
    assert(new Set(versions.map((item) => item.facebook)).size === 3, `${goal} regenerate did not change the Facebook caption for ${product.name}.`)
    assert(new Set(versions.map((item) => item.instagram)).size === 3, `${goal} regenerate did not change the Instagram caption for ${product.name}.`)
    assert(versions[0].facebook.split('\n')[0] !== versions[1].facebook.split('\n')[0], 'Regenerate should change the opening, not only a later word.')
    assert(differenceCount(versions[0].facebook, versions[1].facebook) >= 6, 'Regenerate is too close to a single word swap.')
  }
}

const sampleBlob = facebookSamples.join('\n')
assert(/\bPOV:/.test(sampleBlob), 'Some captions should open the way recent Brutti posts do, with POV.')
assert(/\bjaaa\b/.test(sampleBlob) && /\bteda\b/.test(sampleBlob) && /\bngam\b/.test(sampleBlob) && /\bkasi\b/.test(sampleBlob), 'Phrase banks should use the dialect words from recent Brutti posts.')
assert(/[🌿✨😍🥰]/u.test(sampleBlob), 'A caption should carry the light emoji recent posts use at line ends.')
assert(!sampleBlob.includes('#'), 'Facebook captions must not contain hashtags.')
assert(engine.includes('Brutti Soul Master'), 'The generator should name Brutti Soul Master as the voice source.')
assert(/\bbikin\b/.test(engine) && /\btinguk\b/.test(engine) && /\bngam\b/.test(engine) && /\bnda\b/.test(engine) && /\bsia\b/.test(engine), 'Soul dialect words should live in the phrase banks.')

const priced = { ...pusma, price: 'RM890', material: 'Plywood', dimensions: '180 x 40 x 90 cm', colour: 'Natural' }
const filled = generateBmCaptions({ product: priced, goal: 'highlight', variation: 0 })
assertNatural(`${filled.facebook}\n${filled.instagram}\n${filled.tiktok}`)
assertDialect(filled)
assertPlatforms(filled)
assert(filled.facebook.includes('RM890'), 'Recorded price should be used when the field is filled.')
assert(filled.instagram.includes('RM890'), 'Instagram should keep the recorded price.')
assert(filled.facebook.includes('Plywood') && filled.facebook.includes('180 x 40 x 90 cm') && filled.facebook.includes('Natural'), 'Filled material, dimensions and colour should appear.')
assert(filled.usedFacts.includes('price') && filled.usedFacts.includes('material') && filled.usedFacts.includes('dimensions') && filled.usedFacts.includes('colour'), 'Filled spec fields should be recorded as used.')

const cleared = generateBmCaptions({ product: { ...priced, price: '   ', material: '-', dimensions: 'N/A', colour: 'tiada' }, goal: 'highlight', variation: 0 })
assertNatural(`${cleared.facebook}\n${cleared.instagram}\n${cleared.tiktok}`)
assertDialect(cleared)
assertPlatforms(cleared)
assertNoBlankLeak(`${cleared.facebook}\n${cleared.instagram}\n${cleared.tiktok}`, { price: '', material: '', dimensions: '', colour: '' })
assert(!cleared.facebook.includes('RM890') && !cleared.facebook.includes('Plywood'), 'Cleared fields must not keep the previous values.')

const noted = generateBmCaptions({ product: ahtam, goal: 'customer', note: 'Pelanggan di Penampang guna rak ini untuk kedai runcit.', variation: 0 })
assertNatural(`${noted.facebook}\n${noted.instagram}`)
assertDialect(noted)
assertPlatforms(noted)
assert(noted.facebook.includes('Pelanggan di Penampang guna rak ini untuk kedai runcit.'), 'A supplied note should be kept as written.')
assertNoBlankLeak(`${noted.facebook}\n${noted.instagram}`, ahtam, noted.facebook)

const topicOnly = generateBmCaptions({ topic: 'susun ruang kedai', goal: 'tips', variation: 1 })
assertNatural(`${topicOnly.facebook}\n${topicOnly.instagram}\n${topicOnly.tiktok}`)
assertDialect(topicOnly)
assertPlatforms(topicOnly)
assert(topicOnly.facebook.includes('susun ruang kedai'), 'A typed topic should be usable without a product row.')
assertNoBlankLeak(`${topicOnly.facebook}\n${topicOnly.instagram}\n${topicOnly.tiktok}`, {})

const sentinel = generateBmCaptions({
  product: { name: 'Kiosk rujukan', material: 'Saved kiosk or project reference', price: '', dimensions: '', colour: '' },
  goal: 'highlight',
  variation: 0,
})
assertNatural(`${sentinel.facebook}\n${sentinel.instagram}`)
assertDialect(sentinel)
assertPlatforms(sentinel)
assert(!/saved kiosk or project reference/i.test(sentinel.facebook), 'Internal placeholder material must not be written into a caption.')

assert(!generateBmCaptions({ variation: 0 }).facebook, 'Missing product and topic should not invent a caption.')

assert(!/\b(fetch|openai|supabase|generativelanguage|api\.openai)\b/i.test(engine), 'The caption generator must stay local.')
assert(engine.includes('HUMOUR') && engine.includes('CTA'), 'Phrase banks should live in the generator.')
assert(app.includes('BmCaptionStudio') && app.includes('Penjana Kapsyen') && app.includes("useState('caption')"), 'Content Studio should open on the Malay caption generator.')
assert(posts.includes('meta-post-list') && posts.includes('meta-post-drawer'), 'The locked Post List and its side panel must stay in place.')
assert(packageJson.includes('quality:bm-caption'), 'The check script must call the caption smoke test.')

console.log('PASS: Bahasa Malaysia caption generator keeps blank fields out, writes Facebook and Instagram, and regenerates a different caption without inventing an RM price.')
