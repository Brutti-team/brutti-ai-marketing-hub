// Local Bahasa Malaysia caption generator for Content Studio.
// Voice source in this repo: Brutti Soul Master (how Brutti sounds, how a post
// is built, and the golden examples) plus the Brand Library voice card.
// No network, no API key, and no paid model. Variation comes from whole
// caption structures, not a one-word swap.
//
// Locked rule: one main point, professional Bahasa Malaysia with a light
// touch of humour, and only price / material / dimensions / colour when the
// selected product row actually has those fields.

const HUMOUR = [
  'Kami lebih suka benda yang ngam dengan ruang daripada ayat yang terlebih hebat.',
  'Bila ruang itu ngam, kami pun senyum sendiri, bah.',
  'Kami tidak akan mengatakan ini yang terbaik di dunia. Cukup yang memang kami buat.',
]

const HUMOUR_SHORT = [
  'Ngam dengan ruang, bukan ayat yang terlebih hebat.',
  'Bila ngam, kami pun senyum, bah.',
  'Bukan “terbaik di dunia”. Cukup yang kami buat.',
]

const CTA = [
  'Jika mahu bertanya lanjut, mesej kami.',
  'Boleh WhatsApp atau DM untuk semak butiran.',
  'Tinggalkan mesej di inbox jika mahu berbincang.',
]

const CTA_SHORT = [
  'Mesej kami untuk butiran lanjut.',
  'WhatsApp atau DM jika mahu bertanya.',
  'Inbox kami untuk berbincang.',
]

export const CAPTION_GOALS = [
  { id: 'highlight', label: 'Sorotan produk' },
  { id: 'promo', label: 'Promosi' },
  { id: 'customer', label: 'Projek atau maklum balas pelanggan' },
  { id: 'behind', label: 'Di sebalik tabir' },
  { id: 'tips', label: 'Tip' },
]

export const VARIATION_COUNT = 3

const HASHTAG_SKIP = new Set([
  'tip', 'tips', 'untuk', 'dan', 'yang', 'dari', 'satu', 'the', 'and', 'promo', 'projek', 'produk', 'custom',
])

function clean(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function isBlankField(value) {
  const text = clean(value)
  if (!text) return true
  if (/^(?:-|—|–|n\/?a|na|null|undefined|none|nil|tiada|tbd|tba|kosong|blank|unknown|tidak ada)$/i.test(text)) return true
  if (/^saved kiosk or project reference$/i.test(text)) return true
  return false
}

function readField(value) {
  const text = clean(value)
  return isBlankField(text) ? '' : text
}

function tidyNote(note) {
  const text = readField(note)
  if (!text) return ''
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function stableOffset(value, length) {
  let hash = 0
  const text = clean(value)
  for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0
  return Math.abs(hash) % length
}

function categoryKind(category = '') {
  const value = clean(category).toLowerCase()
  if (!value) return 'general'
  if (value.includes('wardrobe') || value.includes('almari')) return 'wardrobe'
  if (value.includes('display') || value.includes('papar')) return 'display'
  if (value.includes('kiosk')) return 'kiosk'
  if (value.includes('storage') || value.includes('rak') || value.includes('stor')) return 'storage'
  if (value.includes('bespoke') || value.includes('custom')) return 'bespoke'
  return 'general'
}

function fact(key, label, value, clause) {
  return {
    key,
    line: `${label}: ${value}.`,
    sentence: `${label} ialah ${value}.`,
    clause,
  }
}

function categoryFact(category) {
  const kind = categoryKind(category)
  const sentence = {
    wardrobe: 'Ia ialah almari dalam kerja Brutti.',
    storage: 'Ia ialah rak storan dalam kerja Brutti.',
    display: 'Ia ialah rak paparan dalam kerja Brutti.',
    kiosk: 'Ia ialah kiosk custom dalam kerja Brutti.',
    bespoke: 'Ia ialah kerja custom Brutti.',
    general: `Kategori dalam rekod: ${category}.`,
  }[kind]
  const clause = {
    wardrobe: 'ia almari',
    storage: 'ia rak storan',
    display: 'ia rak paparan',
    kiosk: 'ia kiosk custom',
    bespoke: 'ia kerja custom',
    general: `kategorinya ${category}`,
  }[kind]
  return { key: 'category', line: sentence, sentence, clause }
}

function factsFromProduct(product = {}) {
  const facts = []
  const category = readField(product.category)
  const price = readField(product.price)
  const material = readField(product.material)
  const dimensions = readField(product.dimensions || product.dimension)
  const colour = readField(product.colour || product.color)

  if (category) facts.push(categoryFact(category))
  if (price) facts.push(fact('price', 'Harga', price, `harganya ${price}`))
  if (material) facts.push(fact('material', 'Material', material, `materialnya ${material}`))
  if (dimensions) facts.push(fact('dimensions', 'Dimensi', dimensions, `dimensinya ${dimensions}`))
  if (colour) facts.push(fact('colour', 'Warna', colour, `warnanya ${colour}`))
  return facts
}

function factParagraph(facts) {
  if (!facts.length) return ''
  if (facts.length === 1) return facts[0].sentence
  return `Dalam rekod, ${facts.map((item) => item.clause).join(', ')}.`
}

function factLines(facts) {
  return facts.map((item) => item.line).join('\n')
}

function paragraphs(parts) {
  return parts.map((part) => String(part || '').trim()).filter(Boolean).join('\n\n')
}

function hashtagsFor(name, category) {
  const tags = ['#Brutti', '#PerabotSabah', '#BuatanSabah']
  const extra = {
    wardrobe: '#Almari',
    display: '#Paparan',
    kiosk: '#KioskCustom',
    storage: '#Storan',
    bespoke: '#CustomSabah',
    general: '#CustomSabah',
  }[categoryKind(category)]
  tags.push(extra)

  const token = clean(name).split(/\s+/)[0].replace(/[^A-Za-z0-9]/g, '')
  if (token.length >= 3 && token.length <= 24 && !HASHTAG_SKIP.has(token.toLowerCase())) {
    const tag = `#${token}`
    if (!tags.some((item) => item.toLowerCase() === tag.toLowerCase())) tags.push(tag)
  }
  return tags.slice(0, 5).join(' ')
}

function tipLines(name, category) {
  const kind = categoryKind(category)
  if (kind === 'wardrobe') {
    return [
      `Satu tip sahaja untuk ${name}: asingkan pakaian yang digantung dan yang dilipat sebelum susun almari.`,
      `Sebelum pilih susunan untuk ${name}, lihat pakaian yang dipakai setiap minggu.`,
      `Tip ringkas: rancang laluan buka almari dahulu, kemudian baru susun ${name}.`,
    ]
  }
  if (kind === 'display') {
    return [
      `Satu tip sahaja untuk ${name}: letakkan barang yang paling kerap ditanya pada paras mata.`,
      `Untuk paparan ${name}, kekalkan satu fokus supaya perhatian tidak lari.`,
      `Tip ringkas: beri ruang kosong di sekeliling barang supaya ${name} lebih jelas dibaca.`,
    ]
  }
  if (kind === 'kiosk') {
    return [
      `Satu tip sahaja untuk ${name}: tetapkan tapak dan laluan pelanggan dahulu.`,
      `Untuk kiosk seperti ${name}, pastikan pelanggan nampak barang tanpa terhalang.`,
      `Tip ringkas: uji buka dan tutup ${name} sekali sebelum hari digunakan.`,
    ]
  }
  if (kind === 'storage') {
    return [
      `Satu tip sahaja untuk ${name}: senaraikan barang yang selalu dicari, kemudian baru susun rak.`,
      `Sebelum isi ${name}, kumpulkan barang yang sejenis supaya rak tidak cepat sesak.`,
      `Tip ringkas untuk ${name}: letakkan barang harian di tempat yang paling senang dicapai.`,
    ]
  }
  if (kind === 'bespoke') {
    return [
      `Satu tip sahaja untuk ${name}: terangkan bagaimana ruang itu digunakan sebelum minta kerja custom.`,
      `Untuk piece custom seperti ${name}, senaraikan apa yang mesti muat dan apa yang boleh dikurangkan.`,
      `Tip ringkas: bawa contoh barang yang akan diletakkan bila berbincang tentang ${name}.`,
    ]
  }
  return [
    `Satu tip sahaja untuk ${name}: ukur ruang dan senaraikan apa yang perlu diletakkan dahulu.`,
    `Sebelum buat keputusan tentang ${name}, lihat bagaimana ruang itu digunakan setiap hari.`,
    `Tip ringkas dari Brutti: mulakan dengan fungsi ruang, kemudian baru lihat ${name}.`,
  ]
}

function highlightPoint(name, variation) {
  return [
    `Sorotan hari ini hanya satu: ${name}.`,
    `Jika anda sedang melihat pilihan perabot atau kiosk custom, piece yang kami perkenalkan ialah ${name}.`,
    `${name} ialah piece yang kami bawa dalam siaran ini.`,
  ][variation]
}

function highlightShort(name, variation) {
  return [
    name,
    `Piece yang kami perkenalkan: ${name}.`,
    `Siaran ini tentang ${name} saja.`,
  ][variation]
}

function promoPoint(name, facts, note, variation) {
  const hasPrice = facts.some((item) => item.key === 'price')
  if (note && hasPrice) {
    return [
      `Untuk ${name}, ini saja maklumat tawaran yang boleh kami tulis.`,
      `Jika anda sedang pertimbangkan ${name}, kami kekal pada rekod dan nota yang ada.`,
      `${name}: satu perkara saja untuk siaran promosi ini.`,
    ][variation]
  }
  if (note) {
    return [
      `Untuk ${name}, kami ikut nota yang diberi.`,
      `${name} — apa yang boleh dikongsi ada dalam nota ini.`,
      `Satu perkara tentang ${name}, seperti yang ditulis dalam nota.`,
    ][variation]
  }
  if (hasPrice) {
    return [
      `Untuk ${name}, kami kongsikan harga yang memang ada dalam rekod.`,
      `Jika anda sedang banding ${name}, angka yang boleh disebut ialah harga dalam rekod.`,
      `${name} ada harga dalam rekod. Itu saja angka yang kami guna.`,
    ][variation]
  }
  return [
    `Jika berminat dengan ${name}, tanya kami untuk maklumat semasa.`,
    `${name} ada dalam pilihan Brutti. Mesej kami jika mahu semak butiran terkini.`,
    `Untuk ${name}, kami sedia menjawab soalan tanpa menambah butiran yang tiada.`,
  ][variation]
}

function promoShort(name, variation) {
  return [
    name,
    `Tentang ${name}.`,
    `Satu perkara: ${name}.`,
  ][variation]
}

function customerPoint(name, note, variation) {
  if (note) {
    return [
      `Maklum balas yang boleh kami kongsi tentang ${name} ada di bawah.`,
      `Projek pelanggan untuk ${name}, mengikut nota yang diberi.`,
      `Cerita pelanggan tentang ${name} — satu saja, dan hanya yang ditulis.`,
    ][variation]
  }
  return [
    `Ingin bincang projek custom seperti ${name}? Kami dengar keperluan ruang dahulu.`,
    `Untuk projek pelanggan, kami mula dengan ruang sebenar. Piece yang dimaksudkan: ${name}.`,
    `${name} dibuat ikut keperluan pelanggan. Cerita lanjut hanya bila anda kongsikannya kepada kami.`,
  ][variation]
}

function customerShort(name, note, variation) {
  if (note) {
    return [
      `Projek pelanggan: ${name}.`,
      `Maklum balas tentang ${name}.`,
      `${name}, mengikut nota yang ada.`,
    ][variation]
  }
  return [
    `Projek custom: ${name}.`,
    `Kami dengar ruang anda dahulu.`,
    `${name} ikut keperluan pelanggan.`,
  ][variation]
}

function behindPoint(name, variation) {
  return [
    `Di sebalik ${name} ada kerja custom yang dibuat di Sabah.`,
    `Sebelum ${name} siap, ia melalui kerja Brutti sendiri — bukan barang import yang dilabel semula.`,
    `Yang kami boleh ceritakan hari ini: proses custom di sebalik ${name}.`,
  ][variation]
}

function behindShort(name, variation) {
  return [
    `Kerja custom di Sabah: ${name}.`,
    `Bukan barang import dilabel semula.`,
    `Proses custom di sebalik ${name}.`,
  ][variation]
}

function supportingFacts(facts, variation) {
  if (!facts.length) return ''
  if (variation === 1) return factParagraph(facts)
  if (variation === 2) {
    const [first, ...rest] = facts
    return paragraphs([first.sentence, factLines(rest)])
  }
  return factLines(facts)
}

function facebookFor(goal, ctx, variation) {
  const { name, facts, note, humour, cta } = ctx
  const support = supportingFacts(facts, variation)

  if (goal === 'promo') {
    return paragraphs([
      promoPoint(name, facts, note, variation),
      note,
      variation === 1 ? factParagraph(facts.filter((item) => item.key === 'price' || item.key === 'category')) : factLines(facts.filter((item) => item.key === 'price' || item.key === 'category')),
      humour,
      cta,
    ])
  }

  if (goal === 'customer') {
    const identity = facts.filter((item) => item.key === 'category')
    return paragraphs([
      customerPoint(name, note, variation),
      note,
      variation === 0 ? '' : supportingFacts(identity, variation),
      humour,
      cta,
    ])
  }

  if (goal === 'behind') {
    const maker = variation === 1
      ? ''
      : 'Benua Brutti Sdn Bhd membuat perabot dan kiosk custom di Sabah.'
    return paragraphs([
      behindPoint(name, variation),
      maker,
      note,
      humour,
      cta,
    ])
  }

  if (goal === 'tips') {
    const fit = facts.filter((item) => item.key === 'dimensions')
    return paragraphs([
      tipLines(name, ctx.category)[variation],
      note,
      variation === 2 ? factLines(fit) : '',
      humour,
      cta,
    ])
  }

  const maker = variation === 2
    ? 'Benua Brutti Sdn Bhd membuat perabot dan kiosk custom di Sabah. Siaran ini hanya tentang piece di atas.'
    : ''
  return paragraphs([
    highlightPoint(name, variation),
    note,
    support,
    maker,
    humour,
    cta,
  ])
}

function instagramFor(goal, ctx, variation) {
  const { name, facts, note, humourShort, ctaShort, hashtags, category } = ctx
  let lead = highlightShort(name, variation)
  let body = variation === 1 ? factParagraph(facts) : factLines(facts)

  if (goal === 'promo') {
    lead = promoShort(name, variation)
    const promoFacts = facts.filter((item) => item.key === 'price' || item.key === 'category')
    body = variation === 1 ? factParagraph(promoFacts) : factLines(promoFacts)
  } else if (goal === 'customer') {
    lead = customerShort(name, note, variation)
    body = note || (variation === 0 ? '' : factLines(facts.filter((item) => item.key === 'category')))
  } else if (goal === 'behind') {
    lead = behindShort(name, variation)
    body = note
  } else if (goal === 'tips') {
    lead = tipLines(name, category)[variation]
    body = note
  }

  const includeNoteAgain = goal === 'highlight' || goal === 'promo'
  return paragraphs([lead, includeNoteAgain ? note : '', body, humourShort, ctaShort, hashtags])
}

function tiktokFor(goal, ctx, variation) {
  const { name, facts, note, ctaShort } = ctx
  const hooks = [
    `${name}.`,
    `Dari Sabah: ${name}.`,
    `Satu perkara saja — ${name}.`,
  ]
  const spec = facts.find((item) => item.key !== 'category')
  let second = note || spec?.line || 'Kerja custom dari Sabah.'
  if (goal === 'tips') second = tipLines(name, ctx.category)[variation]
  if (goal === 'behind') second = behindShort(name, variation)
  if (goal === 'promo' && !spec && !note) second = 'Tanya kami untuk maklumat semasa.'
  return [hooks[variation], second, ctaShort].filter(Boolean).join('\n')
}

export function generateBmCaptions({ product = null, topic = '', goal = 'highlight', note = '', variation = 0 } = {}) {
  const record = product || {}
  const name = readField(record.name || record.productName) || readField(topic)
  const index = ((Number(variation) || 0) % VARIATION_COUNT + VARIATION_COUNT) % VARIATION_COUNT
  const selectedGoal = CAPTION_GOALS.some((item) => item.id === goal) ? goal : 'highlight'

  if (!name) {
    return {
      facebook: '',
      instagram: '',
      tiktok: '',
      variation: index,
      structureId: 'empty',
      usedFacts: [],
    }
  }

  const facts = factsFromProduct(record)
  const voice = (index + stableOffset(name, VARIATION_COUNT)) % VARIATION_COUNT
  const ctx = {
    name,
    category: readField(record.category),
    facts,
    note: tidyNote(note),
    humour: HUMOUR[voice],
    humourShort: HUMOUR_SHORT[voice],
    cta: CTA[voice],
    ctaShort: CTA_SHORT[voice],
    hashtags: hashtagsFor(name, readField(record.category)),
  }

  return {
    facebook: facebookFor(selectedGoal, ctx, index),
    instagram: instagramFor(selectedGoal, ctx, index),
    tiktok: tiktokFor(selectedGoal, ctx, index),
    variation: index,
    structureId: `${selectedGoal}-${index}`,
    usedFacts: facts.map((item) => item.key),
  }
}
