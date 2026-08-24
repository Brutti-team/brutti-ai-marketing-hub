import { buildLiveNarrativeDraft, validateLiveNarrativeDraft } from '../src/lib/liveCaptionNarrativeEngine.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function lines(value = '') {
  return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)
}

const cases = [
  {
    label: 'Product Highlight',
    form: {
      title: 'KAANAGAN Product Highlight',
      platform: 'Facebook',
      type: 'Product Highlight',
      product: 'KAANAGAN Open Concept Wardrobe with Drawers',
      language: 'Bahasa Melayu',
      tone: 'Brutti Sabahan Casual',
      brief: 'KAANAGAN Open Concept Wardrobe with Drawers ialah produk Brutti. Reka bentuknya open concept wardrobe. Produk ini mempunyai drawers.',
    },
  },
  {
    label: 'Behind the Scenes',
    form: {
      title: 'Brutti Retreat 2026',
      platform: 'Facebook',
      type: 'Behind the Scenes',
      product: 'General / No Product',
      language: 'Bahasa Melayu',
      tone: 'Brutti Sabahan Casual',
      brief: "Brutti Retreat 2026 berlangsung pada 18–19 Ogos 2026 di D'Danau Tombotuan, Kota Belud. Team Brutti buat aktiviti, games, makan-makan dan luangkan masa bersama.",
    },
  },
]

for (const item of cases) {
  const versions = [0, 1, 2].map((version) => buildLiveNarrativeDraft(item.form, 'balanced', version, 0))
  versions.forEach((draft, index) => {
    assert(validateLiveNarrativeDraft(draft, item.form.brief, 'balanced'), `${item.label} Version ${index + 1} failed validation`)
    assert(lines(draft).length >= 7 && lines(draft).length <= 13, `${item.label} Version ${index + 1} line count invalid`)
  })
  assert(new Set(versions).size === 3, `${item.label}: Version 1–3 must be distinct`)

  const engaging = buildLiveNarrativeDraft(item.form, 'engaging', 0, 0)
  const shorter = buildLiveNarrativeDraft(item.form, 'shorten', 0, 0)
  const hook1 = buildLiveNarrativeDraft(item.form, 'hook', 0, 1)
  const hook2 = buildLiveNarrativeDraft(item.form, 'hook', 0, 2)
  const cta1 = buildLiveNarrativeDraft(item.form, 'cta', 0, 1)
  const cta2 = buildLiveNarrativeDraft(item.form, 'cta', 0, 2)

  assert(validateLiveNarrativeDraft(engaging, item.form.brief, 'engaging'), `${item.label}: More/engaging failed`)
  assert(validateLiveNarrativeDraft(shorter, item.form.brief, 'shorten'), `${item.label}: Shorter failed`)
  assert(lines(shorter).length === 7, `${item.label}: Shorter must be exactly 7 lines`)
  assert(hook1 && hook2 && hook1 !== hook2, `${item.label}: New hook must rotate`)
  assert(cta1 && cta2 && cta1 !== cta2, `${item.label}: New CTA must rotate`)
  assert(!versions.some((draft) => /#[\p{L}\p{N}_-]+/u.test(draft)), `${item.label}: hashtags must stay out`)
}

console.log('PASS: live caption narrative engine is fallback-safe, 7–13 lines, versions differ, More/Shorter/Hook/CTA behave, and hashtags stay out.')
