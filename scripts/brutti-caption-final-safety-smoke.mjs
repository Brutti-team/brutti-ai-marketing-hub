import path from 'node:path'
import { createServer } from 'vite'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function lines(value = '') {
  return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)
}

function normalize(value = '') {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function assertNoDuplicates(copy, label) {
  const normalized = lines(copy).map((line) => normalize(line).replace(/[.!?…]+$/g, ''))
  assert(new Set(normalized).size === normalized.length, `${label}: duplicate caption line detected`)
}

function assertSafeVariation(copy, verifiedFacts, label) {
  const text = normalize(copy)
  const facts = normalize(verifiedFacts)
  const rules = [
    { name: 'lucu/kelakar', output: /\b(lucu|kelakar|funny)\b/i, source: /\b(lucu|kelakar|funny)\b/i },
    { name: 'ketawa/gelak', output: /\b(ketawa|gelak|laugh(?:ed|ing)?)\b/i, source: /\b(ketawa|gelak|laugh(?:ed|ing)?)\b/i },
    { name: 'makan', output: /\b(makan(?:-makan)?|lunch|dinner|food)\b/i, source: /\b(makan(?:-makan)?|lunch|dinner|food)\b/i },
    { name: 'games', output: /\b(game|games|permainan)\b/i, source: /\b(game|games|permainan)\b/i },
    { name: 'penat', output: /\b(penat|tired|exhausted)\b/i, source: /\b(penat|tired|exhausted)\b/i },
    { name: 'crowd', output: /\b(ramai|crowd(?:ed)?|full house|packed)\b/i, source: /\b(ramai|crowd(?:ed)?|full house|packed)\b/i },
    { name: 'weather', output: /\b(hujan|rain(?:ing)?|panas|hot weather)\b/i, source: /\b(hujan|rain(?:ing)?|panas|hot weather)\b/i },
  ]

  rules.forEach((rule) => {
    if (rule.output.test(text)) assert(rule.source.test(facts), `${label}: invented ${rule.name} detail`)
  })
}

const cases = [
  {
    label: 'Brand Awareness / Keretapi 130 Tahun',
    form: {
      title: 'Brutti di Sambutan 130 Tahun Keretapi',
      platform: 'Facebook',
      type: 'Brand Awareness',
      product: 'General / No Product',
      language: 'Bahasa Melayu',
      tone: 'Brutti Sabahan Casual',
      brief: 'Sabtu lalu, Team Brutti hadir ke event sambutan 130 Tahun Keretapi di Stesen Tanjung Aru. Team membawa beberapa pieces dari KKIP ke Stesen Tanjung Aru untuk digunakan dalam setup event. Dari display, signage sampai kiosk/counter yang digunakan, semuanya freshly made by Brutti.',
    },
    mustContain: [/kkip/i, /tanjung aru/i, /freshly made/i, /display/i, /signage/i, /kiosk|counter/i],
    mustNotContain: [/ceritakan perjalanan/i, /content perlu fokus/i, /jangan hard sell/i],
  },
  {
    label: 'Behind The Scenes / workshop',
    form: {
      title: 'Di belakang setup Brutti',
      platform: 'Facebook',
      type: 'Behind the Scenes',
      product: 'General / No Product',
      language: 'Bahasa Melayu',
      tone: 'Brutti Sabahan Casual',
      brief: 'Team Brutti menyiapkan display event di workshop KKIP. Display dipotong, disusun dan diperiksa sebelum dibawa keluar. Setup akhir menggunakan pieces yang disiapkan oleh team sendiri.',
    },
    mustContain: [/workshop/i, /kkip/i, /display/i, /dipotong|disusun|diperiksa/i],
    mustNotContain: [],
  },
  {
    label: 'Product Highlight / KAANAGAN',
    form: {
      title: 'KAANAGAN Product Highlight',
      platform: 'Facebook',
      type: 'Product Highlight',
      product: 'KAANAGAN Open Concept Wardrobe with Drawers',
      language: 'Bahasa Melayu',
      tone: 'Brutti Sabahan Casual',
      brief: 'KAANAGAN ialah open concept wardrobe dengan drawers. Material yang digunakan ialah plywood. KAANAGAN dibuat untuk membantu susun pakaian dan barang dengan lebih teratur.',
    },
    mustContain: [/kaanagan/i, /plywood/i, /pakaian|barang/i],
    mustNotContain: [],
  },
]

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

try {
  const enginePath = path.resolve(process.cwd(), 'src/lib/bruttiCaptionEngineV3.js').replaceAll('\\', '/')
  const soulPath = path.resolve(process.cwd(), 'src/lib/contentStudioSoulPolicy.js').replaceAll('\\', '/')
  const polishPath = path.resolve(process.cwd(), 'src/lib/bruttiCaptionFinalPolish.js').replaceAll('\\', '/')

  const { buildBruttiCaptionV3 } = await server.ssrLoadModule(`/@fs/${enginePath}`)
  const { applyBruttiSoulPolicy } = await server.ssrLoadModule(`/@fs/${soulPath}`)
  const { polishBruttiFinalCaption } = await server.ssrLoadModule(`/@fs/${polishPath}`)

  let checks = 0

  for (const item of cases) {
    const versions = []
    for (let version = 0; version < 3; version += 1) {
      const generated = buildBruttiCaptionV3(item.form, version, { recentStructures: [] })
      const guarded = applyBruttiSoulPolicy(generated.copy, item.form, 'balanced') || generated.copy
      const finalCopy = polishBruttiFinalCaption(guarded, item.form) || guarded
      const label = `${item.label} · Version ${version + 1}`

      assert(finalCopy, `${label}: expected caption`)
      assert(lines(finalCopy).length >= 7 && lines(finalCopy).length <= 13, `${label}: line count must stay 7–13`)
      assert(!/#\w+/u.test(finalCopy), `${label}: hashtag leaked`)
      assertNoDuplicates(finalCopy, label)
      assertSafeVariation(finalCopy, item.form.brief, label)
      item.mustContain.forEach((pattern) => assert(pattern.test(finalCopy), `${label}: must-use verified fact missing (${pattern})`))
      item.mustNotContain.forEach((pattern) => assert(!pattern.test(finalCopy), `${label}: direction/instruction leaked (${pattern})`))
      versions.push(finalCopy)
      checks += 1
    }

    assert(new Set(versions).size >= 2, `${item.label}: variations should not all collapse to identical copy`)
  }

  console.log(`PASS: final caption guard passed ${checks} outputs across Brand Awareness, Behind The Scenes and Product Highlight.`)
} finally {
  await server.close()
}
