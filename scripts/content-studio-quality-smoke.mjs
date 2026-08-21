import path from 'node:path'
import { createServer } from 'vite'

function lines(value) {
  return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function changedLineCount(left, right) {
  const a = new Set(lines(left))
  const b = new Set(lines(right))
  let changed = 0
  a.forEach((line) => { if (!b.has(line)) changed += 1 })
  b.forEach((line) => { if (!a.has(line)) changed += 1 })
  return changed
}

function validateCaption(label, caption) {
  const count = lines(caption).length
  assert(count >= 7 && count <= 13, `${label}: expected 7–13 lines, got ${count}`)
  assert(!/RM\s?\d|\d+%|discount|diskaun|free delivery|penghantaran percuma|stok terhad|limited stock|reach|views?|followers?|viral/i.test(caption), `${label}: unsupported claim leaked into output`)
  assert(!/orang yang baca patut|bahagian human tu mesti|mesej dikekalkan ringkas|elakkan claim|kasi dekat soalan tadi|bagi orang satu sebab|santai boleh, tapi fakta|mula dari fungsi dan detail produk yang sudah confirm dulu/i.test(caption), `${label}: writer-facing meta instruction leaked into final caption`)
}

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

try {
  const enginePath = path.resolve(process.cwd(), 'src/lib/contentStudioEngineV2.js').replaceAll('\\', '/')
  const polishPath = path.resolve(process.cwd(), 'src/lib/contentStudioCopyPolish.js').replaceAll('\\', '/')
  const engine = await server.ssrLoadModule(`/@fs/${enginePath}`)
  const polish = await server.ssrLoadModule(`/@fs/${polishPath}`)

  const baseForm = {
    title: 'Portable event display test',
    platform: 'Facebook',
    type: 'Product Highlight',
    product: 'Sample Display Rack',
    language: 'Bahasa Melayu',
    tone: 'Brutti Sabahan Casual',
    brief: 'Reka bentuk foldable. Mudah dibawa untuk event. Boleh dilipat selepas digunakan. Senang disimpan selepas event.',
  }
  const baseControls = {
    objective: 'Consideration',
    audience: 'Pemilik bisnes di Sabah yang perlukan display mudah dibawa untuk event',
    angle: 'Problem → Solution',
    direction: 'Fokus pada fungsi sebenar dan situasi event. Santai, relatable dan jangan hard sell.',
    keyMessage: 'Mudah dibawa, digunakan dan disimpan semula bila event selesai',
    ctaGoal: 'Natural CTA',
  }

  const finalDraft = (form, controls, mode, version, cycle = 0) => polish.polishContentStudioCaption(
    engine.buildContentStudioDraft(form, controls, mode, version, cycle),
    form,
    mode,
  )

  const versions = [0, 1, 2].map((version) => finalDraft(baseForm, baseControls, 'balanced', version))
  versions.forEach((caption, index) => validateCaption(`Version ${index + 1}`, caption))
  assert(new Set(versions).size === 3, 'Version 1–3 must produce three distinct captions')
  assert(changedLineCount(versions[0], versions[1]) >= 4, 'Version 2 is too similar to Version 1')
  assert(changedLineCount(versions[0], versions[2]) >= 4, 'Version 3 is too similar to Version 1')

  const baseline = versions[0]
  const modes = ['engaging', 'casual', 'professional', 'shorten', 'hook', 'cta']
  const rewrites = Object.fromEntries(modes.map((mode) => [mode, finalDraft(baseForm, baseControls, mode, 0)]))
  Object.entries(rewrites).forEach(([mode, caption]) => {
    validateCaption(mode, caption)
    assert(caption !== baseline, `${mode}: rewrite did not change the caption`)
    assert(changedLineCount(baseline, caption) >= 2, `${mode}: rewrite is too cosmetic`)
  })
  assert(lines(rewrites.shorten).length === 7, `shorten: expected exactly 7 lines, got ${lines(rewrites.shorten).length}`)

  const nextHook = finalDraft(baseForm, baseControls, 'hook', 0, 1)
  const nextHookAgain = finalDraft(baseForm, baseControls, 'hook', 0, 2)
  const nextCta = finalDraft(baseForm, baseControls, 'cta', 0, 1)
  const nextCtaAgain = finalDraft(baseForm, baseControls, 'cta', 0, 2)
  validateCaption('new hook cycle 1', nextHook)
  validateCaption('new hook cycle 2', nextHookAgain)
  validateCaption('new CTA cycle 1', nextCta)
  validateCaption('new CTA cycle 2', nextCtaAgain)
  assert(nextHook !== nextHookAgain, 'New Hook must rotate to a different hook on repeated clicks')
  assert(nextCta !== nextCtaAgain, 'New CTA must rotate to a different CTA on repeated clicks')

  const realCases = [
    {
      label: 'BRUTTI REAL CASE · Product Highlight · KAANAGAN',
      form: {
        title: 'KAANAGAN Product Highlight',
        platform: 'Facebook',
        type: 'Product Highlight',
        product: 'KAANAGAN Open Concept Wardrobe with Drawers',
        language: 'Bahasa Melayu',
        tone: 'Brutti Sabahan Casual',
        brief: 'KAANAGAN Open Concept Wardrobe with Drawers ialah produk Brutti. Reka bentuknya open concept wardrobe. Produk ini mempunyai drawers.',
      },
      controls: {
        objective: 'Consideration',
        audience: 'Orang di Sabah yang sedang cari wardrobe untuk susun pakaian dan barang dengan lebih teratur',
        angle: 'Problem → Solution',
        direction: 'Fokus pada kegunaan sebenar dan rasa ruang yang lebih teratur. Santai, natural dan jangan hard sell.',
        keyMessage: 'Wardrobe open concept dengan drawers untuk bantu susun ruang dengan lebih teratur',
        ctaGoal: 'Natural CTA',
      },
    },
    {
      label: 'BRUTTI REAL CASE · Brand Awareness',
      form: {
        title: 'Proudly Sabahan Brand Story',
        platform: 'Facebook',
        type: 'Brand Awareness',
        product: 'General / No Product',
        language: 'Bahasa Melayu',
        tone: 'Proud & purposeful',
        brief: 'Brutti ialah brand dari Sabah. Brutti menggunakan direction Proudly Sabahan, Purposefully Crafted dan Responsibly Made. Brutti menghasilkan furniture.',
      },
      controls: {
        objective: 'Awareness',
        audience: 'Orang Sabah dan pelanggan yang mahu lebih kenal siapa Brutti dan cara Brutti bekerja',
        angle: 'Storytelling',
        direction: 'Bagi rasa bangga Sabah tapi jangan terlalu formal. Cerita brand macam manusia, bukan corporate statement.',
        keyMessage: 'Brutti membawa identiti Sabah dalam cara kami fikir, bikin dan bercerita tentang furniture',
        ctaGoal: 'Natural CTA',
      },
    },
    {
      label: 'BRUTTI REAL CASE · Behind the Scenes · Retreat 2026',
      form: {
        title: 'Brutti Retreat 2026',
        platform: 'Facebook',
        type: 'Behind the Scenes',
        product: 'General / No Product',
        language: 'Bahasa Melayu',
        tone: 'Brutti Sabahan Casual',
        brief: "Brutti Retreat 2026 berlangsung pada 18–19 Ogos 2026 di D'Danau Tombotuan, Kota Belud. Team Brutti buat aktiviti, games, makan-makan dan luangkan masa bersama.",
      },
      controls: {
        objective: 'Engagement',
        audience: 'Followers Brutti yang suka tengok sisi team dan cerita di belakang kerja harian',
        angle: 'Human / Behind the Scenes',
        direction: 'Recap yang fun, energetic, natural dan memorable. Fokus pada team moment. Jangan hard sell.',
        keyMessage: 'Retreat ni tentang team Brutti luangkan masa bersama di luar rutin kerja',
        ctaGoal: 'Comment / Reply',
      },
    },
  ]

  const realOutputs = realCases.map((item, index) => {
    const caption = finalDraft(item.form, item.controls, 'balanced', index % 3)
    validateCaption(item.label, caption)
    return { ...item, caption }
  })

  console.log('\n=== CONTENT STUDIO QUALITY SMOKE TEST ===')
  versions.forEach((caption, index) => {
    console.log(`\n--- Version ${index + 1}: ${engine.CONTENT_VERSION_LABELS[index]} ---\n${caption}`)
  })
  Object.entries(rewrites).forEach(([mode, caption]) => {
    console.log(`\n--- Rewrite: ${mode} ---\n${caption}`)
  })
  console.log(`\n--- New Hook cycle 2 ---\n${nextHookAgain}`)
  console.log(`\n--- New CTA cycle 2 ---\n${nextCtaAgain}`)
  console.log('\n=== BRUTTI REAL CONTENT CASES ===')
  realOutputs.forEach((item) => {
    console.log(`\n--- ${item.label} ---\n${item.caption}`)
  })
  console.log('\nPASS: versions are structurally distinct, rewrites are non-cosmetic, repeated hook/CTA clicks rotate, real Brutti content cases stay within guards, meta-instructions are removed, length guard passed, unsupported-claim guard passed.')
} finally {
  await server.close()
}
