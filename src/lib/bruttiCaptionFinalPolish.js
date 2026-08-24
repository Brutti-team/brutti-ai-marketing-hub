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

function factScore(fact = '') {
  const value = normalized(fact)
  let score = 0
  if (/kkip/.test(value) && /tanjung aru/.test(value)) score += 40
  if (/bawa|membawa/.test(value) && /piece|pieces|display|signage|kiosk|counter/.test(value)) score += 12
  if (/freshly made|baru siap|dibuat|bikin|hasilkan|dihasilkan/.test(value)) score += 20
  if (/display|signage|kiosk|counter/.test(value)) score += 14
  if (/stesen tanjung aru|tanjung aru/.test(value)) score += 10
  if (/130 tahun|keretapi|event|pameran/.test(value)) score += 8
  return score
}

function strongestFacts(facts = []) {
  return facts
    .map((fact, index) => ({ fact, index, score: factScore(fact) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .map((item) => item.fact)
}

function factCovered(fact = '', copy = '') {
  const factText = normalized(fact)
  const copyText = normalized(copy)

  if (/kkip/.test(factText) && /tanjung aru/.test(factText)) {
    return /kkip/.test(copyText) && /tanjung aru/.test(copyText)
  }

  if (/freshly made/.test(factText)) {
    const objectMatch = /display|signage|kiosk|counter/.test(copyText)
    return /freshly made/.test(copyText) && objectMatch
  }

  const tokens = significantTokens(factText)
  if (!tokens.length) return true
  const matched = tokens.filter((token) => copyText.includes(token)).length
  return matched >= Math.min(2, tokens.length)
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

function journeyFact(facts = []) {
  return facts.find((fact) => /kkip/i.test(fact) && /tanjung aru/i.test(fact)) || ''
}

function safeContextBridges(form = {}, facts = []) {
  if (!pieceEventBrandContext(form, facts)) return []
  const text = normalized(facts.join(' '))
  const bridges = []

  if (/kkip/.test(text) && /tanjung aru/.test(text)) {
    bridges.push('Dari KKIP sampai Tanjung Aru, perjalanan pieces ni pun sebahagian daripada cerita kerja Brutti hari tu.')
  }
  if (/display/.test(text) && /signage/.test(text) && /kiosk|counter/.test(text)) {
    bridges.push('Bila display, signage dan kiosk/counter yang digunakan pun hasil Brutti sendiri, setup tu terus jadi sebahagian daripada cerita brand kami.')
  }
  if (/freshly made|baru siap|dibuat|bikin|hasilkan|dihasilkan/.test(text)) {
    bridges.push('Bagi kami, bila hasil yang baru siap terus digunakan dalam situasi sebenar, craftsmanship tu lebih senang orang nampak.')
  }
  bridges.push('Kami lagi suka biar kerja sebenar tunjuk apa yang Brutti boleh buat, daripada kasi ayat jualan panjang-panjang.')
  return bridges
}

function ensureStrongFacts(lines = [], form = {}, facts = []) {
  if (!facts.length) return lines
  const strong = strongestFacts(facts)
  let next = [...lines]
  let joined = next.join('\n')

  strong.forEach((fact) => {
    if (factCovered(fact, joined)) return
    const insertAt = Math.min(next.length, 2)
    next.splice(insertAt, 0, clean(fact))
    joined = next.join('\n')
  })

  if (pieceEventBrandContext(form, facts)) {
    const journey = journeyFact(facts)
    if (journey) {
      const journeyIndex = next.findIndex((line) => /kkip/i.test(line) && /tanjung aru/i.test(line))
      if (journeyIndex > 0) {
        const [line] = next.splice(journeyIndex, 1)
        next.unshift(line)
      }
    }
  }

  return next
}

export function polishBruttiFinalCaption(copy, form = {}) {
  const facts = parseVerifiedFacts(form.brief || '')
  let lines = uniqueLines(String(copy || '').split('\n'))
  lines = removeWeakFiller(lines, form, facts)
  lines = ensureStrongFacts(lines, form, facts)
  lines = uniqueLines(lines)

  const bridges = safeContextBridges(form, facts)
  for (const bridge of bridges) {
    if (lines.length >= 7) break
    if (!lines.some((line) => normalized(line) === normalized(bridge))) lines.push(bridge)
  }

  lines = uniqueLines(lines)
  if (lines.length > 11) lines = lines.slice(0, 11)
  return lines.join('\n')
}
