import path from 'node:path'
import { createServer } from 'vite'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function lines(value = '') {
  return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean)
}

function overlap(left, right) {
  const a = new Set(lines(left).map((line) => line.toLowerCase()))
  const b = new Set(lines(right).map((line) => line.toLowerCase()))
  const shared = [...a].filter((line) => b.has(line)).length
  const union = new Set([...a, ...b]).size || 1
  return shared / union
}

const cases = [
  {
    label: 'Artisan / payroll',
    form: {
      title: 'Cerita artisan bulan ni', platform: 'Facebook', type: 'Brand Awareness', product: 'General / No Product', language: 'Bahasa Melayu', tone: 'Brutti Sabahan Casual',
      brief: 'Irwan ialah artisan Brutti. Bulan ini team selesai urus pembayaran gaji artisan. Brutti menghargai maruah artisan dan kerja tangan mereka.',
    },
  },
  {
    label: 'Product / KAANAGAN',
    form: {
      title: 'KAANAGAN Product Highlight', platform: 'Facebook', type: 'Product Highlight', product: 'KAANAGAN Open Concept Wardrobe with Drawers', language: 'Bahasa Melayu', tone: 'Brutti Sabahan Casual',
      brief: 'KAANAGAN ialah open concept wardrobe dengan drawers. Material plywood. Produk ini dibuat untuk membantu susun pakaian dan barang dengan lebih teratur.',
    },
  },
  {
    label: 'Founder / origin',
    form: {
      title: 'Dari PKP sampai hari ni', platform: 'Facebook', type: 'Brand Awareness', product: 'General / No Product', language: 'Bahasa Melayu', tone: 'Brutti Sabahan Casual',
      brief: 'Brutti lahir pada 11 Oktober 2020 semasa PKP. Car wash terpaksa tutup. Woodworking dan metalworking yang asalnya hobi jadi pilihan untuk survive.',
    },
  },
  {
    label: 'Daily human / retreat',
    form: {
      title: 'Brutti Retreat 2026', platform: 'Facebook', type: 'Behind the Scenes', product: 'General / No Product', language: 'Bahasa Melayu', tone: 'Brutti Sabahan Casual',
      brief: "Brutti Retreat 2026 berlangsung pada 18–19 Ogos 2026 di D'Danau Tombotuan, Kota Belud. Team buat aktiviti, games, makan-makan dan luangkan masa bersama.",
    },
  },
  {
    label: 'Customer story',
    form: {
      title: 'Ruang customer yang perlukan susunan lebih kemas', platform: 'Facebook', type: 'Customer Story', product: 'General / No Product', language: 'Bahasa Melayu', tone: 'Brutti Sabahan Casual',
      brief: 'Customer perlukan ruang simpanan yang lebih teratur. Ruang digunakan setiap hari untuk pakaian dan barang peribadi. Team bincang keperluan ruang sebelum pilih solution.',
    },
  },
  {
    label: 'Educational / material',
    form: {
      title: 'Pilih material ikut kegunaan', platform: 'Facebook', type: 'Educational', product: 'General / No Product', language: 'Bahasa Melayu', tone: 'Brutti Sabahan Casual',
      brief: 'Brutti menggunakan kayu pallet atau repurposed wood, plywood dan kadang-kadang besi. Pemilihan material bergantung pada keperluan project dan permintaan client.',
    },
  },
  {
    label: 'Community purpose',
    form: {
      title: 'Berkongsi rezeki', platform: 'Facebook', type: 'Brand Awareness', product: 'General / No Product', language: 'Bahasa Melayu', tone: 'Brutti Sabahan Casual',
      brief: 'Brutti menjalankan program komuniti. Team mahu berkongsi rezeki dan memberi manfaat kepada orang lain bila ada kemampuan.',
    },
  },
  {
    label: 'Verified promotion',
    form: {
      title: 'Offer produk minggu ni', platform: 'Facebook', type: 'Promotion', product: 'AHTAM M Shelving Rack', language: 'Bahasa Melayu', tone: 'Brutti Sabahan Casual',
      brief: 'AHTAM M Shelving Rack ialah produk Brutti. Harga RM350. Offer ini sah untuk minggu ini.',
    },
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
  const { buildBruttiCaptionV3, captionV3InputKey } = await server.ssrLoadModule(`/@fs/${enginePath}`)

  const outputs = []
  const history = []

  for (const item of cases) {
    const result = buildBruttiCaptionV3(item.form, 0, { recentStructures: history })
    assert(result.copy, `${item.label}: expected caption output`)
    assert(result.report.pass, `${item.label}: quality lock failed ${JSON.stringify(result.report.checks)}`)
    assert(lines(result.copy).length >= 7 && lines(result.copy).length <= 13, `${item.label}: invalid line count`)
    assert(!/#\w+/u.test(result.copy), `${item.label}: hashtag leaked`)
    assert(result.meta.storyPillar && result.meta.structure, `${item.label}: missing story metadata`)
    outputs.push({ ...item, result })
    history.push({ inputKey: result.meta.inputKey, structure: result.meta.structure, pillar: result.meta.storyPillar })
  }

  const structures = new Set(outputs.map((item) => item.result.meta.structure))
  assert(structures.size >= 5, `Expected at least 5 distinct story structures, got ${[...structures].join(', ')}`)

  for (let left = 0; left < outputs.length; left += 1) {
    for (let right = left + 1; right < outputs.length; right += 1) {
      const score = overlap(outputs[left].result.copy, outputs[right].result.copy)
      assert(score < 0.65, `${outputs[left].label} vs ${outputs[right].label}: captions too structurally similar (${score.toFixed(2)})`)
    }
  }

  const sameForm = cases[1].form
  const first = buildBruttiCaptionV3(sameForm, 0, { recentStructures: [] })
  const remembered = [{ inputKey: captionV3InputKey(sameForm, 0), structure: first.meta.structure, pillar: first.meta.storyPillar }]
  const second = buildBruttiCaptionV3(sameForm, 0, { recentStructures: remembered })
  assert(first.copy === second.copy, 'Same verified input and version must remain deterministic after refresh/login history.')
  assert(first.meta.structure === second.meta.structure, 'Same input must preserve its story structure.')

  const versions = [0, 1, 2].map((version) => buildBruttiCaptionV3(cases[3].form, version, { recentStructures: [] }))
  versions.forEach((item, index) => assert(item.report.pass, `Retreat Version ${index + 1}: quality failed`))
  assert(new Set(versions.map((item) => item.copy)).size === 3, 'Version 1–3 must be meaningfully distinct.')

  console.log('\n=== BRUTTI CAPTION ENGINE V3 ===')
  outputs.forEach((item) => {
    console.log(`\n--- ${item.label} · ${item.result.meta.storyPillar} · ${item.result.meta.structure} ---\n${item.result.copy}`)
  })
  console.log(`\nPASS: ${outputs.length} content scenarios passed, ${structures.size} structures used, unrelated captions stayed below similarity threshold, and same-input output remained deterministic.`)
} finally {
  await server.close()
}
