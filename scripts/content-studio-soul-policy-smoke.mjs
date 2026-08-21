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
  assert(soul.CONTENT_SOUL_POLICY.storyPillars, 'Soul Master story pillars were not detected')
  assert(soul.CONTENT_SOUL_POLICY.artisanRespect, 'Soul Master artisan-value rule was not detected')
  assert(soul.CONTENT_SOUL_POLICY.transparency, 'Soul Master transparency rule was not detected')
  assert(soul.CONTENT_SOUL_POLICY.allMasterSectionsAvailable, 'All 10 Soul Master sections must be available')

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

  const finalDraft = (form, mode = 'balanced', version = 0, nextControls = controls) => {
    const raw = engine.buildContentStudioDraft(form, nextControls, mode, version)
    const polished = polish.polishContentStudioCaption(raw, form, mode)
    return soul.applyBruttiSoulPolicy(`${polished}\n#BRUTTI #ProudlySabahan`, form, mode)
  }

  const validateSoulCaption = (label, caption) => {
    assert(lines(caption).length >= 7 && lines(caption).length <= 13, `${label}: must stay within 7–13 lines`)
    assert(/\b(kami|aku|sia|we|our|us)\b/i.test(caption), `${label}: must contain first-person Brutti voice`)
    assert(!/#\w+/u.test(caption), `${label}: Soul policy must strip hashtags from caption body`)
    assert(emojiCount(caption) <= 3, `${label}: must not exceed 3 emoji`)
  }

  const bm = finalDraft(baseForm)
  validateSoulCaption('Bahasa Melayu', bm)
  assert(/kenapa piece ni diperlukan|fungsi dan keperluan sebenar/i.test(bm), 'Product Highlight should follow the Soul product-need-first principle')

  const bilingualForm = { ...baseForm, language: 'BM + English' }
  const bilingual = finalDraft(bilingualForm)
  validateSoulCaption('BM + English', bilingual)
  assert(/\b(Function|Real|Keep|Local|Clear|solution|styling|honest)\b/i.test(bilingual), 'BM + English must contain an intentional English accent')
  assert(/\b(yang|kami|mau|ngam|kasi|ja)\b/i.test(bilingual), 'BM + English must retain Sabahan BM-led copy')

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
  const brand = finalDraft(brandForm, 'balanced', 0, { ...controls, objective: 'Awareness', angle: 'Storytelling', keyMessage: 'Brutti membawa identiti Sabah dalam cara kami bekerja dan bercerita' })
  validateSoulCaption('Brand Awareness', brand)

  const btsForm = {
    title: 'Cerita workshop artisan',
    platform: 'Facebook',
    type: 'Behind the Scenes',
    product: 'General / No Product',
    language: 'Bahasa Melayu',
    tone: 'Brutti Sabahan Casual',
    brief: 'Team Brutti berada di workshop untuk siapkan kerja yang sudah dirancang. Aktiviti workshop dirakam untuk content behind the scenes.',
  }
  const bts = finalDraft(btsForm, 'balanced', 2, { ...controls, objective: 'Engagement', angle: 'Human / Behind the Scenes', keyMessage: 'Orang dan proses di belakang hasil akhir pun sebahagian daripada cerita Brutti' })
  validateSoulCaption('Behind the Scenes', bts)
  assert(/orang di belakang kerja|artisan/i.test(bts), 'Behind the Scenes should keep the Soul people-behind-the-work perspective')

  const customerForm = {
    title: 'Cerita keperluan customer',
    platform: 'Facebook',
    type: 'Customer Story',
    product: 'General / No Product',
    language: 'Bahasa Melayu',
    tone: 'Brutti Sabahan Casual',
    brief: 'Customer perlukan susunan ruang yang lebih teratur. Keperluan customer digunakan sebagai starting point untuk direction project.',
  }
  const customer = finalDraft(customerForm, 'balanced', 1, { ...controls, objective: 'Trust', angle: 'Customer Journey', keyMessage: 'Keperluan sebenar customer datang dulu sebelum solution' })
  validateSoulCaption('Customer Story', customer)
  assert(/kami dengar dulu|keperluan customer/i.test(customer), 'Customer Story should follow the Soul customer-need-first principle')

  console.log('\n=== CONTENT STUDIO SOUL POLICY TEST ===')
  console.log(`\n--- Bahasa Melayu · Product ---\n${bm}`)
  console.log(`\n--- BM + English ---\n${bilingual}`)
  console.log(`\n--- Brand Awareness ---\n${brand}`)
  console.log(`\n--- Behind the Scenes ---\n${bts}`)
  console.log(`\n--- Customer Story ---\n${customer}`)
  console.log(`\n--- Shorter · 7 lines ---\n${shorter}`)
  console.log(`\nSoul source: ${soul.soulPolicyLabel(baseForm)}`)
  console.log('\nPASS: all 10 Soul Master sections are available; first-person, story pillars, Sabahan voice, BM + English, no hashtags, emoji limit and 7-line Shorter guard all passed.')
} finally {
  await server.close()
}
