import path from 'node:path'
import { createServer } from 'vite'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function lines(value = '') {
  return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)
}

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

try {
  const enginePath = path.resolve(process.cwd(), 'src/lib/bruttiCaptionEngineV32.js').replaceAll('\\', '/')
  const { buildBruttiCaptionV32, parseDirectionAwareBrief } = await server.ssrLoadModule(`/@fs/${enginePath}`)

  const kioskForm = {
    title: 'Custom kiosk untuk repeat client',
    platform: 'Facebook',
    type: 'Brand Awareness',
    product: 'General / No Product',
    language: 'BM + English',
    tone: 'Casual',
    brief: 'client sudah pernah buat kiosk dgn kita sblm ni. untuk kiosk kedua ni, client sendiri cari design yg dia mahu dan contact Brutti sebab tahu kita boleh realisasikan design ikut detail yg diminta. Materials:. Vertical support poles are fabricated using 2” x 2” solid pinewood. Fokus kepada repeat client, trust dan design dari client. Jangan hard sell.',
  }

  const kioskProfile = parseDirectionAwareBrief(kioskForm.brief, kioskForm)
  assert(kioskProfile.focus === 'customer-story', `Kiosk direction should resolve to customer-story, got ${kioskProfile.focus}`)
  assert(kioskProfile.technicalFacts.length >= 1, 'Technical kiosk specs should be separated from the main story.')
  assert(kioskProfile.directionLines.length >= 1, 'Explicit Content Direction should be separated from verified facts.')

  const kioskVersions = [0, 1, 2].map((version) => buildBruttiCaptionV32(kioskForm, version, { recentStructures: [] }))
  kioskVersions.forEach((result, index) => {
    const copy = result.copy
    assert(copy, `Kiosk Version ${index + 1}: expected output`)
    assert(result.report.pass, `Kiosk Version ${index + 1}: safety guard failed`)
    assert(result.meta.engine === 'brutti-caption-v3.2', `Kiosk Version ${index + 1}: wrong engine marker`)
    assert(result.meta.storyPillar === 'customer-story', `Kiosk Version ${index + 1}: story direction was not respected`)
    assert(result.meta.directionMode === 'story-first', `Kiosk Version ${index + 1}: story-first mode missing`)
    assert(result.meta.technicalFactsSkipped >= 1, `Kiosk Version ${index + 1}: technical details were not demoted`)
    assert(lines(copy).length >= 7 && lines(copy).length <= 13, `Kiosk Version ${index + 1}: invalid line count`)
    assert(/client/i.test(copy), `Kiosk Version ${index + 1}: customer story disappeared`)
    assert(/design|idea/i.test(copy), `Kiosk Version ${index + 1}: client design direction disappeared`)
    assert(!/vertical support|solid pinewood|materials?\s*:/i.test(copy), `Kiosk Version ${index + 1}: raw technical specification leaked into caption`)
    assert(!/fokus kepada|jangan hard sell|content direction/i.test(copy), `Kiosk Version ${index + 1}: instruction text leaked into caption`)
    assert(!/\bdgn\b|\byg\b|\bsblm\b/i.test(copy), `Kiosk Version ${index + 1}: raw shorthand leaked into caption`)
  })
  assert(new Set(kioskVersions.map((item) => item.copy)).size === 3, 'Kiosk Version 1–3 should use different story angles.')

  const productForm = {
    title: 'KAANAGAN Product Highlight',
    platform: 'Facebook',
    type: 'Product Highlight',
    product: 'KAANAGAN Open Concept Wardrobe with Drawers',
    language: 'Bahasa Melayu',
    tone: 'Casual',
    brief: 'Produk ini membantu susun pakaian dan barang dengan lebih teratur. Material plywood 18mm. Dimensions 180cm x 120cm. Ceritakan fungsi dan penggunaan sebenar, bukan specification.',
  }
  const product = buildBruttiCaptionV32(productForm, 0, { recentStructures: [] })
  assert(product.copy && product.report.pass, 'Product mixed brief should still generate safely.')
  assert(product.meta.technicalFactsSkipped >= 1, 'Product technical facts should stay supporting when direction does not ask for them.')
  assert(!/18mm|180cm|120cm|dimensions/i.test(product.copy), 'Product raw specs should not be forced into the caption.')

  const educationalForm = {
    title: 'Kenapa material berbeza ikut project',
    platform: 'Facebook',
    type: 'Educational',
    product: 'General / No Product',
    language: 'BM + English',
    tone: 'Casual',
    brief: 'Plywood digunakan untuk bahagian tertentu mengikut keperluan project. Material choice bergantung pada kegunaan. Fokus explain material secara simple.',
  }
  const educational = buildBruttiCaptionV32(educationalForm, 0, { recentStructures: [] })
  assert(educational.copy && educational.report.pass, 'Educational material direction should still generate.')
  assert(educational.meta.technicalFactsSkipped === 0, 'Technical facts should remain available when the direction explicitly focuses on material.')

  console.log('\n=== BRUTTI CAPTION ENGINE V3.2 · DIRECTION TEST ===')
  console.log(`\nKiosk focus: ${kioskProfile.focus} · technical separated: ${kioskProfile.technicalFacts.length}`)
  kioskVersions.forEach((result, index) => console.log(`\n--- Kiosk Version ${index + 1} · ${result.meta.structure} ---\n${result.copy}`))
  console.log('\nPASS: Content Direction controls the main story, customer/design context outranks kiosk/material keywords, technical specs stay supporting by default, and explicit material education remains supported.')
} finally {
  await server.close()
}
