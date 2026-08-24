import { parseVerifiedFacts } from './bruttiCaptionEngineV3'

const STOP_WORDS = new Set([
  'yang', 'untuk', 'dengan', 'dalam', 'daripada', 'sudah', 'memang', 'boleh', 'kami', 'kamu',
  'mereka', 'brutti', 'produk', 'cerita', 'detail', 'sebagai', 'sebelum', 'selepas', 'lebih', 'kalau',
  'benda', 'piece', 'pieces', 'event', 'content', 'caption', 'setup', 'sampai', 'digunakan',
])

const PIECE_EVENT_FILLER = [
  /^tidak semua benda kena jadi content berat/i,
  /^kadang satu babak real pun sudah cukup/i,
  /^yang best pasal moment macam ni/i,
  /^kami simpan cerita ni sebab dia memang rasa macam brutti sehari-hari/i,
  /^benda kecil macam ni la/i,
  /^tidak semua cerita perlu dibesarkan/i,
  /^bila fikir balik, benda macam ni la yang paling senang bikin kami ingat kenapa kami mula/i,
  /^simple ja, tapi benda macam ni yang kami rasa sayang/i,
]

const UNSUPPORTED_SCENE_RULES = Object.freeze([
  { line: /\b(lucu|kelakar|funny)\b/i, fact: /\b(lucu|kelakar|funny)\b/i },
  { line: /\b(ketawa|gelak|laugh(?:ed|ing)?)\b/i, fact: /\b(ketawa|gelak|laugh(?:ed|ing)?)\b/i },
  { line: /\b(makan(?:-makan)?|lunch|dinner|food)\b/i, fact: /\b(makan(?:-makan)?|lunch|dinner|food)\b/i },
  { line: /\b(game|games|permainan)\b/i, fact: /\b(game|games|permainan)\b/i },
  { line: /\b(penat|tired|exhausted)\b/i, fact: /\b(penat|tired|exhausted)\b/i },
  { line: /\b(ramai|crowd(?:ed)?|full house|packed)\b/i, fact: /\b(ramai|crowd(?:ed)?|full house|packed)\b/i },
  { line: /\b(hujan|rain(?:ing)?|panas|hot weather)\b/i, fact: /\b(hujan|rain(?:ing)?|panas|hot weather)\b/i },
  {
    line: /\b(customer|pelanggan|visitor|pengunjung)\b.*\b(suka|puji|tertarik|respon|react|love|compliment)\b/i,
    fact: /\b(customer|pelanggan|visitor|pengunjung)\b.*\b(suka|puji|tertarik|respon|react|love|compliment)\b/i,
  },
])

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalized(value = '') {
  return clean(value).toLowerCase().replace(/[.!?…]+$/g, '')
}

function uniqueLines(lines = []) {
  const seen = new Set()
  return lines
    .map(clean)
    .filter(Boolean)
    .filter((line) => {
      const key = normalized(line)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function significantTokens(value = '') {
  return [...new Set(
    String(value || '')
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((token) => token.length >= 4 && !STOP_WORDS.has(token)) || [],
  )]
}

function factScore(fact = '', form = {}) {
  const value = normalized(fact)
  const product = normalized(form.product || '')
  let score = 0

  if (/kkip/.test(value) && /tanjung aru/.test(value)) score += 50
  if (/bawa|membawa/.test(value) && /piece|pieces|display|signage|kiosk|counter/.test(value)) score += 18
  if (/freshly made|baru siap|dibuat|bikin|hasilkan|dihasilkan|disiapkan/.test(value)) score += 24
  if (/display|signage|kiosk|counter/.test(value)) score += 16
  if (/workshop|kkip|stesen tanjung aru|tanjung aru/.test(value)) score += 14
  if (/dipotong|disusun|diperiksa|proses|process|pasang|install/.test(value)) score += 12
  if (/plywood|pallet|kayu|besi|metal|material/.test(value)) score += 12
  if (/drawers|wardrobe|rack|shelving|console|organizer/.test(value)) score += 10
  if (/pakaian|barang|fungsi|kegunaan|susun/.test(value)) score += 10
  if (/130 tahun|keretapi|event|pameran|program/.test(value)) score += 8
  if (/\bRM\s?\d|\d+%|20\d{2}\b/i.test(fact)) score += 12
  if (product && product !== 'general / no product') {
    const productTokens = significantTokens(product)
    if (productTokens.some((token) => value.includes(token))) score += 25
  }

  return score
}

function mustUseFacts(facts = [], form = {}) {
  if (facts.length <= 4) return facts
  return facts
    .map((fact, index) => ({ fact, index, score: factScore(fact, form) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4)
    .map((item) => item.fact)
}

function factCovered(fact = '', copy = '') {
  const factText = normalized(fact)
  const copyText = normalized(copy)

  if (/kkip/.test(factText) && /tanjung aru/.test(factText)) {
    return /kkip/.test(copyText) && /tanjung aru/.test(copyText)
  }

  if (/freshly made/.test(factText)) {
    const objectMatch = /display|signage|kiosk|counter|piece|pieces/.test(copyText)
    return /freshly made/.test(copyText) && objectMatch
  }

  if (/plywood/.test(factText)) return /plywood/.test(copyText)

  const tokens = significantTokens(factText)
  if (!tokens.length) return true
  const matched = tokens.filter((token) => copyText.includes(token)).length
  const required = tokens.length >= 5 ? 3 : Math.min(2, tokens.length)
  return matched >= required
}

function pieceEventBrandContext(form = {}, facts = []) {
  const text = normalized(`${form.title || ''} ${form.type || ''} ${facts.join(' ')}`)
  const brand = (form.type || 'Brand Awareness') === 'Brand Awareness'
  const event = /event|keretapi|stesen|pameran|expo|festival/.test(text)
  const piece = /piece|pieces|display|signage|kiosk|counter|freshly made|kkip/.test(text)
  return brand && event && piece
}

function removeWeakFiller(lines = [], form = {}, facts = []) {
  if (!pieceEventBrandContext(form, facts)) return lines
  return lines.filter((line) => !PIECE_EVENT_FILLER.some((pattern) => pattern.test(line)))
}

function stripUnsupportedScenes(lines = [], facts = []) {
  const factText = clean(facts.join(' '))
  return lines.filter((line) => UNSUPPORTED_SCENE_RULES.every((rule) => !rule.line.test(line) || rule.fact.test(factText)))
}

function journeyFact(facts = []) {
  return facts.find((fact) => /kkip/i.test(fact) && /tanjung aru/i.test(fact)) || ''
}

function productIdentityFact(form = {}, facts = []) {
  const product = clean(form.product || '')
  if (!product || product === 'General / No Product') return ''
  const tokens = significantTokens(product)
  return facts.find((fact) => tokens.some((token) => normalized(fact).includes(token))) || ''
}

function safeContextBridges(form = {}, facts = []) {
  const text = normalized(facts.join(' '))
  const bridges = []

  if (pieceEventBrandContext(form, facts)) {
    if (/kkip/.test(text) && /tanjung aru/.test(text)) {
      bridges.push('Dari KKIP sampai Tanjung Aru, perjalanan pieces ni pun sebahagian daripada cerita kerja Brutti hari tu.')
    }
    if (/display/.test(text) && /signage/.test(text) && /kiosk|counter/.test(text)) {
      bridges.push('Bila display, signage dan kiosk/counter yang digunakan pun hasil Brutti sendiri, setup tu terus jadi sebahagian daripada cerita brand kami.')
    }
    if (/freshly made|baru siap|dibuat|bikin|hasilkan|dihasilkan|disiapkan/.test(text)) {
      bridges.push('Bagi kami, bila hasil yang baru siap terus digunakan dalam situasi sebenar, craftsmanship tu lebih senang orang nampak.')
    }
    bridges.push('Kami lagi suka biar kerja sebenar tunjuk apa yang Brutti boleh buat, daripada kasi ayat jualan panjang-panjang.')
    return bridges
  }

  if (form.type === 'Behind the Scenes') {
    if (/workshop|kkip/.test(text)) bridges.push('Part di workshop ni memang sebahagian daripada cerita sebelum hasil akhir orang nampak.')
    if (/dipotong|disusun|diperiksa|proses|process/.test(text)) bridges.push('Bagi kami, proses yang memang berlaku tu lagi berguna untuk diceritakan daripada tambah benda yang tidak confirm.')
  }

  if (form.type === 'Product Highlight') {
    if (/plywood|pallet|kayu|besi|metal|material/.test(text)) bridges.push('Kami suka mula dari material dan fungsi yang memang sudah confirm, baru cerita rupa dia.')
    if (/pakaian|barang|fungsi|kegunaan|susun/.test(text)) bridges.push('Bila fungsi sebenar dia jelas, baru senang orang nampak kenapa piece tu dibuat.')
  }

  return bridges
}

function ensureMustUseFacts(lines = [], form = {}, facts = []) {
  if (!facts.length) return lines
  const requiredFacts = mustUseFacts(facts, form)
  let next = [...lines]
  let joined = next.join('\n')

  requiredFacts.forEach((fact) => {
    if (factCovered(fact, joined)) return
    const insertAt = Math.min(next.length, 2)
    next.splice(insertAt, 0, clean(fact))
    joined = next.join('\n')
  })

  const journey = journeyFact(requiredFacts)
  if (journey) {
    const journeyIndex = next.findIndex((line) => /kkip/i.test(line) && /tanjung aru/i.test(line))
    if (journeyIndex > 0) {
      const [line] = next.splice(journeyIndex, 1)
      next.unshift(line)
    }
  } else if (form.type === 'Product Highlight') {
    const identity = productIdentityFact(form, requiredFacts)
    if (identity) {
      const productTokens = significantTokens(form.product || '')
      const identityIndex = next.findIndex((line) => productTokens.some((token) => normalized(line).includes(token)))
      if (identityIndex > 0) {
        const [line] = next.splice(identityIndex, 1)
        next.unshift(line)
      }
    }
  }

  return next
}

export function polishBruttiFinalCaption(copy, form = {}) {
  const facts = parseVerifiedFacts(form.brief || '')
  let lines = uniqueLines(String(copy || '').split('\n'))
  lines = stripUnsupportedScenes(lines, facts)
  lines = removeWeakFiller(lines, form, facts)
  lines = ensureMustUseFacts(lines, form, facts)
  lines = uniqueLines(lines)

  const bridges = safeContextBridges(form, facts)
  for (const bridge of bridges) {
    if (lines.length >= 7) break
    if (!lines.some((line) => normalized(line) === normalized(bridge))) lines.push(bridge)
  }

  lines = stripUnsupportedScenes(uniqueLines(lines), facts)
  if (lines.length > 11) lines = lines.slice(0, 11)
  return lines.join('\n')
}
