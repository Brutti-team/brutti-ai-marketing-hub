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
}

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

try {
  const absoluteEnginePath = path.resolve(process.cwd(), 'src/lib/contentStudioEngineV2.js').replaceAll('\\', '/')
  const engine = await server.ssrLoadModule(`/@fs/${absoluteEnginePath}`)
  const form = {
    title: 'Portable event display test',
    platform: 'Facebook',
    type: 'Product Highlight',
    product: 'Sample Display Rack',
    language: 'Bahasa Melayu',
    tone: 'Brutti Sabahan Casual',
    brief: 'Reka bentuk foldable. Mudah dibawa untuk event. Boleh dilipat selepas digunakan. Senang disimpan selepas event.',
  }
  const controls = {
    objective: 'Consideration',
    audience: 'Pemilik bisnes di Sabah yang perlukan display mudah dibawa untuk event',
    angle: 'Problem → Solution',
    direction: 'Fokus pada fungsi sebenar dan situasi event. Santai, relatable dan jangan hard sell.',
    keyMessage: 'Mudah dibawa, digunakan dan disimpan semula bila event selesai',
    ctaGoal: 'Natural CTA',
  }

  const versions = [0, 1, 2].map((version) => engine.buildContentStudioDraft(form, controls, 'balanced', version))
  versions.forEach((caption, index) => validateCaption(`Version ${index + 1}`, caption))
  assert(new Set(versions).size === 3, 'Version 1–3 must produce three distinct captions')
  assert(changedLineCount(versions[0], versions[1]) >= 4, 'Version 2 is too similar to Version 1')
  assert(changedLineCount(versions[0], versions[2]) >= 4, 'Version 3 is too similar to Version 1')

  const baseline = versions[0]
  const modes = ['engaging', 'casual', 'professional', 'shorten', 'hook', 'cta']
  const rewrites = Object.fromEntries(modes.map((mode) => [mode, engine.buildContentStudioDraft(form, controls, mode, 0)]))
  Object.entries(rewrites).forEach(([mode, caption]) => {
    validateCaption(mode, caption)
    assert(caption !== baseline, `${mode}: rewrite did not change the caption`)
    assert(changedLineCount(baseline, caption) >= 2, `${mode}: rewrite is too cosmetic`)
  })
  assert(lines(rewrites.shorten).length === 7, `shorten: expected exactly 7 lines, got ${lines(rewrites.shorten).length}`)

  console.log('\n=== CONTENT STUDIO QUALITY SMOKE TEST ===')
  versions.forEach((caption, index) => {
    console.log(`\n--- Version ${index + 1}: ${engine.CONTENT_VERSION_LABELS[index]} ---\n${caption}`)
  })
  Object.entries(rewrites).forEach(([mode, caption]) => {
    console.log(`\n--- Rewrite: ${mode} ---\n${caption}`)
  })
  console.log('\nPASS: versions are structurally distinct, rewrites are non-cosmetic, length guard passed, unsupported-claim guard passed.')
} finally {
  await server.close()
}
