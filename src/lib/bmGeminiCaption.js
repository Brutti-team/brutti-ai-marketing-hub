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

const SYSTEM_INSTRUCTION = `You write Facebook, Instagram, and TikTok captions for Brutti, a Sabah custom furniture workshop. The voice source is Brutti Soul Master: a friend telling a real scene, not a salesperson and not a corporate brand.

Voice
- Sabahan Malay, short lines, one thought each. Light humour. One main point. First person "kami" when it fits.
- Words that belong in this voice: ni, ngam, ja, kan, boleh, sudah, bikin, kasi, tinguk, mau, pigi, la, piece, custom, simple, client, display, drawer, storage, Team, ruang, bilik, nampak, senang, kemas, tempat, barang.
- bah and teda are rare. Use at most one of them, and not in every caption.
- Never use the whole word "nak". Use "mau".
- Never write the phrase "mesej kami bah".
- Do not use these words: tak, tau, mesej, whatsapp, sia, antam, jak, nda, katalog, kontena, penat, pelanggan, kedai, laci, paparan, storan, dm, inbox, hubungi, roger, sila, anda. Use "tidak" instead of "tak".
- Do not paste founder biography, salaries, the pandemic story, or wallet stories into a product caption.
- One or two emoji only, at the end of a line. No hashtag.

Shape
- Each caption is 4 or 5 short lines. No blank line inside a caption. No title and no quotation marks around the caption.
- Open the way the real posts open: a small scene, or occasionally "POV:". The product name may be the first line.
- Mention the product by the exact Product Name only. Never append the category or a generic type after that name.
- Line 4 explains the design. Use only the design facts in the user message. If those facts are empty, line 4 is a neutral look-and-feel line with no material, size, shape, feature, colour, or price.
- Never invent sizes, materials, prices, colours, stock, discounts, dates, artisan names, or client names.
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

function exampleBlock(examples) {
  return examples.map((example, index) => `Contoh ${index + 1}\n${example.lines.join('\n')}`).join('\n\n')
}

export function buildGeminiCaptionRequest({ product = null, topic = '', goal = 'highlight', note = '', variation = 0 } = {}) {
  const brief = captionBrief({ product, topic, note })
  if (!brief.name) return null
  const index = variationIndex(variation)
  const examples = styleExamplesForVariation(index)
  const designFacts = [
    `- Nota design: ${none(brief.note)}`,
    `- Perkataan design yang sudah ada dalam nama: ${brief.descriptors.length ? brief.descriptors.join(', ') : '(tiada)'}`,
    `- Warna: ${none(brief.colour)}`,
  ].join('\n')
  const userText = [
    index === 0
      ? 'Variasi 1. Tulis kapsyen baru.'
      : `Variasi ${index + 1}. Tulis kapsyen yang lain daripada variasi sebelum ini. Tukar babak dan baris pertama.`,
    '',
    `Nama produk, guna ayat ini tepat dan jangan tambah perkataan selepasnya: ${brief.name}`,
    `Kategori, jangan tulis ini selepas nama: ${none(brief.category)}`,
    `Matlamat siaran: ${goalLabel(goal)}`,
    '',
    'Fakta design untuk baris 4 sahaja. Jangan cipta fakta lain. Jangan tulis harga, saiz, atau material dalam kapsyen.',
    designFacts,
    brief.note || brief.descriptors.length || brief.colour
      ? 'Baris 4 mesti guna fakta design di atas. Jangan tambah bahan, saiz, atau fungsi yang tiada dalam senarai itu.'
      : 'Semua fakta design kosong. Baris 4 ialah pandangan neutral, tanpa bahan, saiz, bentuk, atau fungsi baru.',
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
      maxOutputTokens: 800,
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

function tidyLine(value) {
  return String(value || '')
    .replace(/\bnak\b/gi, (word) => (word[0] === 'N' ? 'Mau' : 'mau'))
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

function leaksHiddenFact(lines, brief) {
  const body = lines.join('\n')
  const note = brief.note.toLowerCase()
  const allowedNumber = (token) => note.includes(token.toLowerCase())
  if (/\bRM\s?\d/i.test(body) && !/\bRM\s?\d/i.test(brief.note)) return true
  if (/\b(harga|price)\b/i.test(body) && !/\b(harga|price)\b/i.test(brief.note)) return true
  const measures = body.match(/\d+(?:[.,]\d+)?\s*(?:cm|mm|ft|in)\b/gi) || []
  if (measures.some((token) => !allowedNumber(token))) return true
  const material = brief.details.text.match(/^- Materials:\s*(.+)$/m)?.[1] || ''
  if (material && material.length >= 8 && body.toLowerCase().includes(material.toLowerCase()) && !note.includes(material.toLowerCase())) return true
  return false
}

function categoryAppended(lines, brief) {
  if (!brief.category) return false
  const pattern = new RegExp(`${brief.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+${brief.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  return pattern.test(lines.join('\n'))
}

function designLineOk(lines, brief) {
  const line = lines[3] || ''
  const lower = line.toLowerCase()
  if (brief.note) return lower.includes(brief.note.toLowerCase())
  if (brief.descriptors.length) return brief.descriptors.some((item) => lower.includes(item.toLowerCase()))
  if (brief.colour) return lower.includes(brief.colour.toLowerCase())
  return true
}

function platformOk(lines, brief, platform) {
  if (lines.length < 4 || lines.length > 5) return false
  const text = lines.join('\n')
  if (/#/.test(text) || /mesej kami bah/i.test(text) || /\bnak\b/i.test(text)) return false
  if (!text.includes(brief.name)) return false
  const emoji = emojiCount(text)
  if (emoji < 1 || emoji > 2) return false
  if (platform === 'tiktok' && /\b(analitik|analytics|views|reach|tontonan)\b/i.test(text)) return false
  if (copiedStyle(lines) || leaksHiddenFact(lines, brief) || categoryAppended(lines, brief)) return false
  if (!designLineOk(lines, brief)) return false
  return true
}

export function finalizeGeminiCaptions(rawText, { product = null, topic = '', goal = 'highlight', note = '', variation = 0 } = {}) {
  const brief = captionBrief({ product, topic, note })
  if (!brief.name) return null
  const text = stripFences(rawText)
  const platforms = {
    facebook: captionLines(section(text, 'FACEBOOK')),
    instagram: captionLines(section(text, 'INSTAGRAM')),
    tiktok: captionLines(section(text, 'TIKTOK')),
  }
  if (!platformOk(platforms.facebook, brief, 'facebook')) return null
  if (!platformOk(platforms.instagram, brief, 'instagram')) return null
  if (!platformOk(platforms.tiktok, brief, 'tiktok')) return null
  const unique = new Set([norm(platforms.facebook.join(' ')), norm(platforms.instagram.join(' ')), norm(platforms.tiktok.join(' '))])
  if (unique.size < 3) return null
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
