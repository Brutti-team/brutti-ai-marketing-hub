import path from 'node:path'
import { createServer } from 'vite'

function lines(value) {
  return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function emojiCount(value) {
  return (String(value || '').match(/\p{Extended_Pictographic}/gu) || []).length
}

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

try {
  const load = async (relative) => {
    const full = path.resolve(process.cwd(), relative).replaceAll('\\', '/')
    return server.ssrLoadModule(`/@fs/${full}`)
  }

  const engine = await load('src/lib/contentStudioEngineV2.js')
  const polish = await load('src/lib/contentStudioCopyPolish.js')
  const soul = await load('src/lib/contentStudioSoulPolicy.js')

  assert(soul.CONTENT_SOUL_POLICY.firstPerson, 'Soul Master first-person rule was not detected')
  assert(soul.CONTENT_SOUL_POLICY.sabahanColloquial, 'Soul Master Sabahan voice rule was not detected')
  assert(soul.CONTENT_SOUL_POLICY.shortLineRhythm, 'Soul Master short-line rule was not detected')
  assert(soul.CONTENT_SOUL_POLICY.noHashtags, 'Soul Master no-hashtag rule was not detected')
  assert(soul.CONTENT_SOUL_POLICY.maxEmoji === 3, 'Soul Master emoji limit should be 3')

  const controls = {
    objective: 'Consideration',
    audience: 'Orang Sabah yang sedang susun ruang',
    angle: 'Problem → Solution',
    direction: 'Santai, jujur, jangan hard sell.',
    keyMessage: 'Fungsi sebenar datang dulu sebelum rupa',
    ctaGoal: 'Natural CTA',
  }

  const baseForm = {
    title: 'KAANAGAN Product Highlight',
    platform: 'Facebook',
    type: 'Product Highlight',
    product: 'KAANAGAN Open Concept Wardrobe with Drawers',
    language: 'Bahasa Melayu',
    tone: 'Brutti Sabahan Casual',
    brief: 'KAANAGAN Open Concept Wardrobe with Drawers ialah produk Brutti. Reka bentuknya open concept wardrobe. Produk ini mempunyai drawers.',
  }

  const finalDraft = (form, mode = 'balanced', version = 0) => {
    const raw = engine.buildContentStudioDraft(form, controls, mode, version)
    const polished = polish.polishContentStudioCaption(raw, form, mode)
    return soul.applyBruttiSoulPolicy(`${polished}\n#BRUTTI #ProudlySabahan`, form, mode)
  }

  const bm = finalDraft(baseForm)
  assert(lines(bm).length >= 7 && lines(bm).length <= 13, 'BM Soul caption must stay within 7–13 lines')
  assert(/\b(kami|aku|sia)\b/i.test(bm), 'BM Soul caption must contain first-person Brutti voice')
  assert(!/#\w+/u.test(bm), 'Soul policy must strip hashtags from caption body')
  assert(emojiCount(bm) <= 3, 'Soul caption must not exceed 3 emoji')

  const bilingualForm = { ...baseForm, language: 'BM + English' }
  const bilingual = finalDraft(bilingualForm)
  assert(/\b(kami|aku|sia)\b/i.test(bilingual), 'BM + English must retain first-person Brutti voice')
  assert(/\b(Function|Real|Keep|Local|Clear|solution|styling)\b/i.test(bilingual), 'BM + English must contain an intentional English-led line')
  assert(/\b(yang|kami|mau|ngam|kasi|ja)\b/i.test(bilingual), 'BM + English must retain Sabahan BM-led copy')
  assert(!/#\w+/u.test(bilingual), 'BM + English must still obey no-hashtag Soul rule')

  const shorter = finalDraft(baseForm, 'shorten', 0)
  assert(lines(shorter).length === 7, `Shorter + Soul policy must stay exactly 7 lines, got ${lines(shorter).length}`)

  const brandForm = {
    title: 'Proudly Sabahan Brand Story',
    platform: 'Facebook',
    type: 'Brand Awareness',
    product: 'General / No Product',
    language: 'Bahasa Melayu',
    tone: 'Proud & purposeful',
    brief: 'Brutti ialah brand dari Sabah. Brutti menghasilkan furniture.',
  }
  const brand = finalDraft(brandForm)
  assert(/\b(kami|aku|sia)\b/i.test(brand), 'Brand Awareness must speak in first person after Soul policy')

  console.log('\n=== CONTENT STUDIO SOUL POLICY TEST ===')
  console.log(`\n--- Bahasa Melayu ---\n${bm}`)
  console.log(`\n--- BM + English ---\n${bilingual}`)
  console.log(`\n--- Shorter · 7 lines ---\n${shorter}`)
  console.log(`\nSoul source: ${soul.soulPolicyLabel()}`)
  console.log('\nPASS: Soul Master rules detected from .md, first-person voice enforced, BM + English is intentional, no hashtags, max 3 emoji, and Shorter remains 7 lines.')
} finally {
  await server.close()
}
