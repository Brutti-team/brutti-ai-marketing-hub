// Free-tier Gemini caption request. The API key stays in Apps Script.
// Voice: Brutti Soul Master, with the owner's caption rules over that document.
// Style examples are real Sep–Oct 2026 posts. They teach rhythm only.

import { CAPTION_GOALS, captionBrief } from './bmCaptionGenerator.js'

export const GEMINI_MODEL = 'gemini-3.5-flash-lite'
export const STYLE_EXAMPLE_COUNT = 8

const STYLE_EXAMPLES = [
  {
    id: 'pov-corner',
    lines: [
      'POV: jumpa satu cozy corner di office. 🌿',
      'Tempat singgah sekejap untuk duduk, rehat dan sambung kerja balik.',
      'Simple space tapi terus ubah mood satu sudut.',
      'Kadang corner kecil macam ni pun cukup kasi office rasa lebih hidup. 🥰',
    ],
  },
  {
    id: 'healing-spot',
    lines: [
      'Kadang healing tidak perlu jauh-jauh pun.',
      'Bawa kerusi, meja kecil, cari spot yang ngam',
      'Yang penting senang dibawa, senang disusun, ikut mana kita mau singgah.',
      'Jadi… bila kita pigi healing? 😌',
    ],
  },
  {
    id: 'pallet-bench',
    lines: [
      '2-in-1 Pallet Bench by Shiqin 🪑',
      'Dibuat fully dari pallet 😍',
      'Ngam ni untuk duduk seorang atau ramai.',
      'Simple dan fleksibel untuk pelbagai ruang.',
    ],
  },
  {
    id: 'pallet-kiosk',
    lines: [
      'Pallet lama tidak semestinya jadi waste.',
      'Team upcycle pallet jadikan kiosk yang foldable & senang dibawa.',
      'Big thanks to SK Nexilis sebab chance untuk si Jo buat piece baru dari pallet ni! 🤩',
      'Benda macam ni la kasi ingat kami, kadang yang hampir dibuang pun masih ada nilai.',
    ],
  },
  {
    id: 'wooden-stall',
    lines: [
      'Custom Wooden Stall',
      'Display jadi lebih teratur dan senang dilihat',
      'Boleh guna untuk jualan, event atau setup di luar 😍',
      'Simple ja kan tapi multifunction! 😉',
    ],
  },
  {
    id: 'eunoia-name',
    lines: [
      'Eunoia Kiosk ✨',
      'Ini antara piece yang hot seller di Brutti! 😍',
      'Ramai suka sebab simple, foldable dan senang dibawa.',
      'Ngam untuk vendor, event, pop-up atau weekend market',
      'Compact tapi tetap menyerlah!',
    ],
  },
  {
    id: 'study-table',
    lines: [
      'Study Table',
      'Paling ngam untuk belajar atau letak laptop bila mau fokus buat kerja! 🤩',
      'Siap dengan drawer lagi jadi senang untuk simpan barang kan',
      'Simple aesthetic yang ngam untuk mana-mana ruang dalam rumah. 😉',
    ],
  },
  {
    id: 'sumandak',
    lines: [
      'Si "Sumandak" ni nampak macam single bed biasa kannn 😆',
      'Tapi di bawah ada satu lagi bed slider.',
      'Bila perlu extra tempat tidur, tarik keluar ja dan terus muat dua orang.',
      'Bila tidak guna, kasi tolak ja masuk dalam balik',
      'Paling ngam ni bikin jadi katil di bilik tetamu, homestay atau bilik anak-anak yang mau jimat ruang. 😉',
    ],
  },
  {
    id: 'tondurongon',
    lines: [
      'Tondurongon. Mesti kamu tertanya kan apa bah tu maksud dia? 🤭',
      'Tondurongon ni tempat duduk relax sambil minum-minum kupi.',
      'Ngam ni letak di luar sambil ambil angin lagi 😆',
      'Ambil suasana sambil hirup kupi kannn',
    ],
  },
  {
    id: 'kaanangan',
    lines: [
      'Pagi-pagi sudah lambat, baju yang kau cari pula entah di mana dalam almari 😩',
      'Sebab tu kami bikin Kaanangan!',
      'Teda pintu mau buka-tutup. Mau cari baju, tinguk ja terus ambil.',
      'Senang ja kan begituu 😉',
    ],
  },
  {
    id: 'lula',
    lines: [
      'Kek yang sedap patut nampak dari jauh lagi 😋',
      'Sebab tu cake cabinet ni ada kaca',
      'Ini Lula, cake cabinet atau display pastry yang kami bikin dari kayu dan kaca.',
      'Boleh jadi display untuk cookies, kek atau roti fresh bakes! 🥰',
      'Kalau kamu ada bakery, kabinet macam mana yang kamu perlukan?',
    ],
  },
  {
    id: 'custom-counter',
    lines: [
      'Kalau tinguk sekali nampak macam kaunter biasa ja kan',
      'Ini custom counter yang Team bikin dari solid plywood dan pinewood.',
      'Design yang memang ngam dengan vibe aesthetic café tapi aura klasik tu tetap menyerlahhhh 😍',
      'Kadang-kadang yang susah tu bukan cari kabinet yang cantik tapi yang betul-betul ngam dengan vibes tu yang penting! ✨',
    ],
  },
]

const HOOK_OPENERS = [
  'POV: jumpa satu cozy corner di office. 🌿',
  'Kadang healing tidak perlu jauh-jauh pun.',
  'Pallet lama tidak semestinya jadi waste.',
  'Kek yang sedap patut nampak dari jauh lagi 😋',
  'Kalau tinguk sekali nampak macam kaunter biasa ja kan',
]

const SYSTEM_INSTRUCTION = `You write Facebook, Instagram, and TikTok captions for Brutti, a Sabah custom furniture workshop. The voice source is Brutti Soul Master: a friend telling a real scene, not a salesperson and not a corporate brand.

Voice
- Sabahan Malay, short lines, one thought each. Light humour. One main point. First person "kami" when it fits.
- Words that belong in this voice: ni, ngam, ja, kan, boleh, sudah, bikin, kasi, tinguk, mau, pigi, la, piece, custom, simple, client, display, drawer, storage, Team, ruang, bilik, nampak, senang, kemas, tempat, barang.
- Never use the whole word "bah". It sounds unnatural.
- teda is rare. Use at most one, and not in every caption.
- Never use the whole word "nak". Use "mau". Never write "mahu".
- Never write the phrase "mesej kami bah".
- Do not use these stiff words: diperbuat daripada, reka bentuk, bersama, selepas.
- Do not use odd phrases such as "kepala-otak".
- Do not use these words: tak, tau, mesej, whatsapp, sia, antam, jak, nda, katalog, kontena, penat, pelanggan, kedai, laci, paparan, storan, dm, inbox, hubungi, roger, sila, anda. Use "tidak" instead of "tak".
- Do not paste founder biography, salaries, the pandemic story, or wallet stories into a product caption.
- One or two emoji only, at the end of a line. No hashtag.

Shape
- Each caption is 4 or 5 short lines. No blank line inside a caption. No title and no quotation marks around the caption.
- Line 1 is a short curiosity hook that makes someone keep reading: a question, a surprising or relatable tease, an open loop, or "POV:" with a twist. About 12 words or fewer. Do not open with a long flat scene. Do not start with the product name on its own line.
- Real hook openers from Brutti posts, for rhythm only: ${HOOK_OPENERS.join(' | ')}
- Mention the product by the title-case name in the user message, exactly once in each caption. Never write that name in ALL CAPITALS. Never append the category or a generic type after the name.
- Use each size, material, finishing, and colour fact at most once in a caption. Do not repeat the same idea on two lines, such as writing "kemas" twice.
- Line 4 explains the design in one natural Sabah sentence, using only the real facts in the user message. Facebook, Instagram, and TikTok must not share the same line 4.
- Vary the angle. One caption can talk about the look or the finish, another about the wood tone or colour, another about how the size fits. Use an angle only when that fact is in the user message. Everyday words and any word order are fine, such as "kayu pine upcycled" or "standard single". Do not start every line 4 with "Bahan dia".
- Do not paste the fields as a comma-separated list. Do not invent any other material, size, colour, shape, or feature. If those facts are empty, each line 4 is a different neutral look-and-feel line.
- Never invent sizes, materials, prices, colours, stock, discounts, dates, artisan names, or client names. Do not write the price in the caption.
- Do not write a Product details list. The app appends Size, Materials, Finishing, and Price from the product sheet after your caption.
- Facebook, Instagram, and TikTok must be three different captions. Same real facts, different opening and rhythm.
- TikTok must not mention analytics, views, reach, or tontonan.
- A short phrase from a style example may be reused. Never copy a whole example, and never move that example's materials, prices, stock claims, artisan names, or client names onto this product.

Output exactly this shape and nothing else:

FACEBOOK:
line
line
line
line

INSTAGRAM:
line
line
line
line

TIKTOK:
line
line
line
line`

function variationIndex(variation) {
  const number = Number(variation)
  if (!Number.isFinite(number) || number < 0) return 0
  return Math.floor(number)
}

export function geminiTemperature(variation = 0) {
  return variationIndex(variation) > 0 ? 1.15 : 0.8
}

export function styleExamplesForVariation(variation = 0) {
  const start = (variationIndex(variation) * 3) % STYLE_EXAMPLES.length
  return Array.from({ length: STYLE_EXAMPLE_COUNT }, (_, offset) => STYLE_EXAMPLES[(start + offset) % STYLE_EXAMPLES.length])
}

function goalLabel(goal) {
  return CAPTION_GOALS.find((item) => item.id === goal)?.label || CAPTION_GOALS[0].label
}

function none(value) {
  return value ? value : '(tiada)'
}

function dropBah(text) {
  return String(text || '').replace(/\bbah\b/gi, ' ').replace(/[ ]{2,}/g, ' ').replace(/[ ]+([,!.?])/g, '$1').trim()
}

function exampleBlock(examples) {
  return examples.map((example, index) => `Contoh ${index + 1}\n${example.lines.map(dropBah).join('\n')}`).join('\n\n')
}

export function buildGeminiCaptionRequest({ product = null, topic = '', goal = 'highlight', note = '', variation = 0, strict = false } = {}) {
  const brief = captionBrief({ product, topic, note })
  if (!brief.name) return null
  const index = variationIndex(variation)
  const examples = styleExamplesForVariation(index)
  const designFacts = [
    brief.note ? `- Nota design: ${brief.note}` : '',
    brief.materials ? `- Bahan: ${brief.materials}` : '',
    brief.finishing ? `- Finishing: ${brief.finishing}` : '',
    brief.dimensions ? `- Saiz: ${brief.dimensions}` : '',
    brief.colour ? `- Warna: ${brief.colour}` : '',
    brief.descriptors.length ? `- Perkataan design yang sudah ada dalam nama: ${brief.descriptors.join(', ')}` : '',
  ].filter(Boolean)
  const userText = [
    index === 0
      ? 'Variasi 1. Tulis kapsyen baru.'
      : `Variasi ${index + 1}. Tulis kapsyen yang lain daripada variasi sebelum ini. Tukar babak dan baris pertama.`,
    '',
    `Nama produk, tulis begini dan jangan tambah perkataan selepasnya: ${brief.name}`,
    'Sebut nama itu sekali saja dalam setiap kapsyen. Jangan ulang nama. Setiap fakta saiz, bahan, finishing, dan warna sekali saja, jangan pada dua baris. Jangan ulang idea yang sama, contohnya kemas.',
    'Baris 1 mesti hook pendek, kira-kira 12 patah kata: soalan, tease, open loop, atau POV dengan twist. Jangan ayat panjang yang rata.',
    brief.officialName && brief.officialName !== brief.name ? `Jangan tulis nama ini dalam huruf besar semua: ${brief.officialName}` : '',
    `Kategori, jangan tulis ini selepas nama: ${none(brief.category)}`,
    `Matlamat siaran: ${goalLabel(goal)}`,
    '',
    designFacts.length
      ? 'Fakta design untuk baris 4. Tulis satu ayat Sabah yang lain untuk Facebook, Instagram, dan TikTok. Jangan ulang ayat yang sama. Jangan mula semua dengan "Bahan dia". Satu ayat boleh pasal rasa atau kemasan, satu pasal tona atau warna, satu pasal saiz yang muat. Guna sudut itu hanya jika fakta dia ada di bawah. Jangan tampal fakta sebagai senarai. Jangan cipta bahan, saiz, warna, finishing, atau fungsi lain. Jangan tulis harga. Jangan guna perkataan bah.'
      : 'Tiada fakta design. Tiga baris 4 mesti lain, pandangan neutral, tanpa bahan, saiz, bentuk, warna, atau fungsi baru. Jangan tulis harga. Jangan guna perkataan bah.',
    designFacts.join('\n'),
    strict
      ? `Cubaan semula. Kapsyen tadi ditolak. Nama produk mesti disebut sekali saja dalam setiap kapsyen: ${brief.name}. Kalau belum ada, letak dalam baris 2 atau 3, dan buang sebutan yang berulang. Jangan ulang saiz, bahan, finishing, atau warna pada dua baris. Jangan ulang idea yang sama, contohnya kemas. Baris 1 mesti hook pendek, bukan ayat panjang yang rata. Jangan guna perkataan bah, langsung. Jangan guna diperbuat daripada, mahu, reka bentuk, bersama, selepas, atau kepala-otak. Guna mau. Baris 4 Facebook, Instagram, dan TikTok mesti tiga ayat berbeza. Fakta boleh disebut dalam ayat biasa, apa-apa susunan perkataan. Kekal 4 atau 5 baris, nama dalam title case, tanpa hashtag, tanpa nak, tanpa mesej kami bah. Letak satu baris kosong sebelum INSTAGRAM: dan sebelum TIKTOK:.`
      : '',
    '',
    'Contoh gaya dari pos Brutti. Ikut rentak sahaja. Jangan salin. Jangan pindahkan harga, material, stok, nama artisan, atau nama client dari contoh ke produk ini.',
    '',
    exampleBlock(examples),
  ].join('\n')

  const temperature = geminiTemperature(index)
  return {
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_INSTRUCTION,
    userText,
    temperature,
    generationConfig: {
      temperature,
      maxOutputTokens: 2048,
      topP: 0.95,
      thinkingConfig: { thinkingBudget: 0 },
    },
  }
}

function stripFences(text) {
  return String(text || '').replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim()
}

function section(text, label) {
  const match = text.match(new RegExp(`${label}\\s*:\\s*([\\s\\S]*?)(?=\\n(?:FACEBOOK|INSTAGRAM|TIKTOK)\\s*:|$)`, 'i'))
  return match ? match[1].trim() : ''
}

function softenOfficialName(text, official, display) {
  const source = String(official || '').split(/\s+/)
  const shown = String(display || '').split(/\s+/)
  return source.reduce((next, token, index) => {
    const replacement = shown[index]
    if (!token || !replacement || token === replacement || token.length <= 2) return next
    if (token !== token.toUpperCase()) return next
    return next.replace(new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), replacement)
  }, String(text || ''))
}

function tidyLine(value) {
  return String(value || '')
    .replace(/\bnak\b/gi, (word) => (word[0] === 'N' ? 'Mau' : 'mau'))
    .replace(/\bmahu\b/gi, (word) => (word[0] === 'M' ? 'Mau' : 'mau'))
    .replace(/#\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function captionLines(text) {
  return String(text || '')
    .split(/\n\s*Product details\s*:/i)[0]
    .split(/\n+/)
    .map(tidyLine)
    .filter((line) => line && !/^- (?:Size|Materials|Finishing|Price starts from)\b/i.test(line) && !/^Product details:?$/i.test(line))
}

function norm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\p{Extended_Pictographic}/gu, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function copiedStyle(lines) {
  const body = norm(lines.join(' '))
  const lineNorms = lines.map(norm)
  return STYLE_EXAMPLES.some((example) => {
    const exampleNorms = example.lines.map(norm)
    if (body === norm(example.lines.join(' '))) return true
    const longHits = exampleNorms.filter((line) => line.length >= 36 && body.includes(line))
    if (longHits.length >= 2) return true
    const exact = exampleNorms.filter((line) => lineNorms.includes(line))
    return exact.length >= 3
  })
}

function emojiCount(text) {
  return (String(text).match(/\p{Extended_Pictographic}/gu) || []).length
}

function allowedFactBlob(brief) {
  return [brief.note, brief.materials, brief.finishing, brief.dimensions, brief.colour, ...(brief.descriptors || [])]
    .filter(Boolean)
    .join('\n')
    .toLowerCase()
}

function materialWordAllowed(word, blob) {
  const value = String(word || '').toLowerCase()
  if (!value) return true
  if (blob.includes(value)) return true
  const translations = {
    kayu: ['wood', 'timber', 'pine', 'plywood', 'oak', 'teak', 'jati'],
    besi: ['steel', 'iron', 'metal'],
    kaca: ['glass'],
  }
  if ((translations[value] || []).some((item) => blob.includes(item))) return true
  return blob.split(/[^a-z0-9]+/).filter((token) => token.length >= 4).some((token) => value.includes(token))
}

function leaksHiddenFact(lines, brief) {
  const body = lines.join('\n')
  const blob = allowedFactBlob(brief)
  const blobCompact = blob.replace(/\s+/g, '')
  if (/\bRM\s?\d/i.test(body) && !/\bRM\s?\d/i.test(brief.note)) return true
  if (/\b(harga|price)\b/i.test(body) && !/\b(harga|price)\b/i.test(brief.note)) return true
  const measures = body.match(/\d+(?:[.,]\d+)?\s*(?:cm|mm|ft|in)\b/gi) || []
  if (measures.some((token) => !blobCompact.includes(token.toLowerCase().replace(/\s+/g, '')))) return true
  const materialWords = body.match(/\b(plywood|pine(?:wood)?|oak|wood|kayu|besi|steel|iron|glass|kaca|pallet|sealers?|varnish|lacquer|paints?|coatings?|metal|aluminium|aluminum|mdf|teak|jati|bamboo|rotan|rattan|acrylic|marble|granite|granit|satin)\b/gi) || []
  return materialWords.some((word) => !materialWordAllowed(word, blob))
}

function bareNameLine(line, name) {
  const stripped = String(line || '')
    .replace(/\p{Extended_Pictographic}/gu, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
  return Boolean(name) && stripped === String(name).toLowerCase()
}

function isFactDump(line, brief) {
  const lower = String(line || '').toLowerCase()
  const fields = [brief.materials, brief.finishing, brief.dimensions].filter((item) => item && item.length >= 6)
  return fields.filter((item) => lower.includes(item.toLowerCase())).length >= 2
}

function categoryAppended(lines, brief) {
  if (!brief.category) return false
  const pattern = new RegExp(`${brief.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+${brief.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  return pattern.test(lines.join('\n'))
}

const FACT_STOP = new Set(['with', 'from', 'and', 'the', 'yang', 'untuk', 'atau', 'this', 'that'])

function factTokens(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !FACT_STOP.has(word))
}

function designFactWords(brief) {
  const words = new Set([
    ...factTokens(brief.materials),
    ...factTokens(brief.finishing),
    ...factTokens(brief.colour),
    ...factTokens(brief.dimensions),
    ...factTokens(brief.note),
    ...(brief.descriptors || []).flatMap((item) => factTokens(item)),
  ])
  const blob = `${brief.materials || ''} ${brief.finishing || ''} ${brief.note || ''}`.toLowerCase()
  if (/wood|timber|pine|plywood|oak|teak|jati/.test(blob)) words.add('kayu')
  if (/\bkayu\b/.test(blob)) words.add('wood')
  if (/steel|iron|metal|\bbesi\b/.test(blob)) words.add('besi')
  if (/glass|\bkaca\b/.test(blob)) words.add('kaca')
  return [...words]
}

function designLineOk(lines, brief) {
  const facts = designFactWords(brief)
  const measures = String(brief.dimensions || '').match(/\d+(?:[.,]\d+)?\s*(?:cm|mm|ft|in)\b/gi) || []
  const hasFact = Boolean(facts.length || measures.length || brief.note || brief.colour)
  if (!hasFact) return true
  const window = lines.slice(2, 5).join('\n').toLowerCase()
  const compact = window.replace(/\s+/g, '')
  if (brief.note && window.includes(String(brief.note).toLowerCase())) return true
  if (brief.colour && window.includes(String(brief.colour).toLowerCase())) return true
  if (facts.some((word) => window.includes(word))) return true
  return measures.some((token) => compact.includes(token.toLowerCase().replace(/\s+/g, '')))
}

function wordCount(line) {
  const stripped = norm(line)
  return stripped ? stripped.split(' ').length : 0
}

function nameHits(text, name) {
  if (!name) return 0
  const pattern = new RegExp(String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'), 'gi')
  return (String(text).match(pattern) || []).length
}

function fieldTokenSet(value) {
  const found = new Set(factTokens(value))
  const extras = String(value || '').toLowerCase().match(/\d+\s*'\s*\d+|\d+\s*(?:cm|mm|ft|in)\b/g) || []
  extras.forEach((token) => found.add(token.replace(/\s+/g, '')))
  return found
}

function lineHasToken(line, token) {
  const lower = String(line || '').toLowerCase()
  if (/^\d/.test(token)) return lower.replace(/\s+/g, '').includes(token)
  return new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lower)
}

function repeatedFact(lines, brief) {
  const fields = {
    size: fieldTokenSet(brief.dimensions),
    material: fieldTokenSet(brief.materials),
    finishing: fieldTokenSet(brief.finishing),
    colour: fieldTokenSet(brief.colour),
  }
  const names = Object.keys(fields)
  const shared = new Set()
  names.forEach((left, index) => {
    names.slice(index + 1).forEach((right) => {
      fields[left].forEach((token) => {
        if (fields[right].has(token)) shared.add(token)
      })
    })
  })
  names.forEach((name) => shared.forEach((token) => fields[name].delete(token)))
  const material = String(brief.materials || '')
  if (/wood|timber|pine|plywood|oak|teak|jati/i.test(material)) fields.material.add('kayu')
  if (/steel|iron|metal/i.test(material)) fields.material.add('besi')
  if (/glass/i.test(material)) fields.material.add('kaca')
  return names.some((name) => {
    const tokens = [...fields[name]]
    if (!tokens.length) return false
    return lines.filter((line) => tokens.some((token) => lineHasToken(line, token))).length >= 2
  })
}

function withProductName(lines, name) {
  if (!name || nameHits(lines.join('\n'), name) > 0) return lines
  const next = lines.slice()
  const slot = next.length >= 2 ? 1 : 0
  next[slot] = `${name} ni. ${next[slot] || ''}`.trim()
  return next
}

function platformOk(lines, brief, platform) {
  if (lines.length < 4 || lines.length > 5) return false
  const text = lines.join('\n')
  if (/#/.test(text) || /mesej kami bah/i.test(text) || /\bnak\b/i.test(text) || /\bbah\b/i.test(text) || /kepala-otak/i.test(text)) return false
  if (/\bdiperbuat daripada\b|\breka bentuk\b|\bbersama\b|\bselepas\b/i.test(text)) return false
  if (!text.includes(brief.name)) return false
  const emoji = emojiCount(text)
  if (emoji < 1 || emoji > 2) return false
  if (platform === 'tiktok' && /\b(analitik|analytics|views|reach|tontonan)\b/i.test(text)) return false
  if (/\b(sila|contact|dm)\b/i.test(text)) return false
  if (bareNameLine(lines[0], brief.name) || isFactDump(lines[3], brief)) return false
  if (wordCount(lines[0]) > 12 || nameHits(text, brief.name) > 1 || repeatedFact(lines, brief)) return false
  if (copiedStyle(lines) || leaksHiddenFact(lines, brief) || categoryAppended(lines, brief)) return false
  if (!designLineOk(lines, brief)) return false
  return true
}

export function finalizeGeminiCaptions(rawText, { product = null, topic = '', goal = 'highlight', note = '', variation = 0 } = {}) {
  const brief = captionBrief({ product, topic, note })
  if (!brief.name) return null
  const text = softenOfficialName(stripFences(rawText), brief.officialName, brief.name)
  const platforms = {
    facebook: withProductName(captionLines(section(text, 'FACEBOOK')), brief.name),
    instagram: withProductName(captionLines(section(text, 'INSTAGRAM')), brief.name),
    tiktok: withProductName(captionLines(section(text, 'TIKTOK')), brief.name),
  }
  if (!platformOk(platforms.facebook, brief, 'facebook')) return null
  if (!platformOk(platforms.instagram, brief, 'instagram')) return null
  if (!platformOk(platforms.tiktok, brief, 'tiktok')) return null
  const unique = new Set([norm(platforms.facebook.join(' ')), norm(platforms.instagram.join(' ')), norm(platforms.tiktok.join(' '))])
  if (unique.size < 3) return null
  const designKeys = new Set([platforms.facebook[3], platforms.instagram[3], platforms.tiktok[3]].map(norm))
  if (designKeys.size < 3) return null
  const details = brief.details.text
  const join = (lines) => (details ? `${lines.join('\n')}\n\n${details}` : lines.join('\n'))
  const index = variationIndex(variation)
  return {
    facebook: join(platforms.facebook),
    instagram: join(platforms.instagram),
    tiktok: join(platforms.tiktok),
    variation: index,
    structureId: `gemini-${goalLabel(goal)}-${index}`,
    usedFacts: brief.colour ? [...brief.details.used, 'colour'] : brief.details.used,
    source: 'gemini',
    model: GEMINI_MODEL,
  }
}
