import { BRUTTI_SOUL } from './bruttiSoulSource'
import { lockBruttiVoice } from './bruttiVoiceQuality'

const DIRECTION_RE = /buat caption|susun caption|gaya caption|style caption|tone|mulakan dengan|kemudian sambung|fokus (?:pada|kepada)|content perlu fokus|posting perlu fokus|caption perlu fokus|highlight|tekankan|tonjolkan|ceritakan|gunakan gaya|tulis dalam|ayat santai|berbentuk recap|macam kita bercakap|cara penulisan|jangan reka|jangan tambah|jangan masukkan|jangan hard sell|tidak hard sell|bukan hard sell|jangan menjual|tidak menjual|non-selling|secara natural|brand awareness|craftsmanship|storytelling|content direction|objective|target audience|cta|minimum|maksimum|baris/i
const NUMBER_RE = /\b(?:RM\s?)?\d[\d,.]*(?:%|\+\+)?\b/i
const DATE_RE = /\b(?:\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\d{1,2}\s+(?:Jan|Feb|Mac|Apr|Mei|Jun|Jul|Ogos|Sep|Okt|Nov|Dis)[a-z]*\s+\d{4}|20\d{2})\b/i

const STRUCTURES = Object.freeze([
  'scene-led',
  'specific-fact-led',
  'name-led',
  'number-led',
  'need-first',
  'process-led',
  'behind-the-result',
  'moment-recap',
  'human-reflection',
  'straight-story',
  'contrast-led',
  'craft-note',
])

const HUMAN_DETAIL_RULES = Object.freeze([
  { line: /ketawa|gelak/i, fact: /ketawa|gelak/i },
  { line: /makan|lunch|dinner|food/i, fact: /makan|lunch|dinner|food/i },
  { line: /game|games|permainan/i, fact: /game|games|permainan/i },
  { line: /penat|tired/i, fact: /penat|tired/i },
])

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function sentence(value = '') {
  const next = clean(value)
  if (!next) return ''
  return /[.!?…]$/.test(next) ? next : `${next}.`
}

function stableIndex(value = '', length = 1) {
  if (!length) return 0
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash) % length
}

function uniqueLines(lines = []) {
  const seen = new Set()
  return lines
    .map((line) => clean(line))
    .filter(Boolean)
    .filter((line) => {
      const key = line.toLowerCase().replace(/[.!?…]+$/g, '')
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function parseVerifiedFacts(value = '') {
  return String(value || '')
    .split(/\n+|\s*;\s*|(?<=[.!?])\s+/)
    .map(clean)
    .filter(Boolean)
    .filter((line) => !DIRECTION_RE.test(line))
    .map(sentence)
    .slice(0, 8)
}

function storySignals(form = {}, facts = []) {
  const factsText = clean(facts.join(' ')).toLowerCase()
  const contextText = clean(`${form.title || ''} ${form.product || ''} ${form.type || ''} ${factsText}`).toLowerCase()
  return {
    artisan: /artisan|tukang|gaji|payroll|kilang|workshop|production|craft|maruah|intern|qc/.test(factsText),
    piece: /produk|product|piece|rack|table|wardrobe|shelf|shelving|console|organizer|furniture|perabot|custom|bespoke|display|signage|kiosk|counter/.test(factsText),
    founder: /lukman|faznur|founder|bini|isteri|menyesal|syukur|terharu|silap|salah|belajar|pandemik|pkp|survive/.test(factsText),
    funny: /lucu|kelakar|funny|ketawa|gelak|hint|whatsapp/.test(factsText),
    customer: /customer|client|pelanggan|order|ruang|rumah|homeowner|premis|keperluan/.test(factsText),
    process: /proses|process|bikin|buat|dibuat|made|freshly made|hasilkan|dihasilkan|install|installation|pasang|material|plywood|pallet|kayu|besi|metal|kkip/.test(factsText),
    community: /komuniti|community|charity|remaja|usahawan|berkongsi rezeki/.test(factsText),
    promotion: /promo|promotion|offer|harga|sale|diskaun|discount/.test(factsText),
    event: /retreat|event|aktiviti|program|launch|pameran|expo|festival|stesen|keretapi/.test(contextText),
    number: facts.some((fact) => NUMBER_RE.test(fact) || DATE_RE.test(fact)),
  }
}

export function detectStoryPillar(form = {}, facts = parseVerifiedFacts(form.brief || '')) {
  const signal = storySignals(form, facts)
  if (signal.artisan) return 'artisan-story'
  if (signal.founder) return 'founder-moment'
  if (signal.piece || signal.process) return 'piece-story'
  if (signal.funny) return 'daily-human-moment'
  if (signal.customer) return 'customer-story'
  if (signal.community) return 'community-purpose'
  if (signal.promotion) return 'verified-promotion'
  if (form.type === 'Educational') return 'educational-story'
  return 'brand-story'
}

const PILLAR_STRUCTURES = Object.freeze({
  'artisan-story': ['name-led', 'process-led', 'human-reflection', 'scene-led', 'behind-the-result', 'specific-fact-led'],
  'founder-moment': ['scene-led', 'human-reflection', 'contrast-led', 'specific-fact-led', 'moment-recap', 'straight-story'],
  'daily-human-moment': ['moment-recap', 'scene-led', 'specific-fact-led', 'human-reflection', 'straight-story', 'contrast-led'],
  'customer-story': ['need-first', 'specific-fact-led', 'scene-led', 'straight-story', 'human-reflection', 'name-led'],
  'piece-story': ['specific-fact-led', 'process-led', 'craft-note', 'behind-the-result', 'name-led', 'straight-story'],
  'community-purpose': ['scene-led', 'human-reflection', 'specific-fact-led', 'moment-recap', 'contrast-led', 'straight-story'],
  'verified-promotion': ['straight-story', 'specific-fact-led', 'need-first', 'number-led', 'scene-led'],
  'educational-story': ['specific-fact-led', 'need-first', 'process-led', 'straight-story', 'craft-note', 'scene-led'],
  'brand-story': ['specific-fact-led', 'scene-led', 'straight-story', 'human-reflection', 'contrast-led', 'moment-recap'],
})

function usableStructures(pillar, signals) {
  const preferred = [...(PILLAR_STRUCTURES[pillar] || PILLAR_STRUCTURES['brand-story'])]
  if (signals.number) preferred.unshift('number-led')
  const unique = [...new Set(preferred.filter((item) => STRUCTURES.includes(item)))]
  return unique.length ? unique : [...STRUCTURES]
}

export function captionV3InputKey(form = {}, variation = 0) {
  return `${clean(form.title)}|${clean(form.product)}|${clean(form.type)}|${clean(form.brief)}|${Math.max(0, Math.min(2, Number(variation) || 0))}`
}

function chooseStructure(form, facts, pillar, variation, recent = []) {
  const signals = storySignals(form, facts)
  const key = captionV3InputKey(form, variation)
  const sameInput = recent.find((item) => item?.inputKey === key && STRUCTURES.includes(item?.structure))
  if (sameInput) return sameInput.structure

  const pool = usableStructures(pillar, signals)
  const seed = stableIndex(`${key}|${BRUTTI_SOUL.full.length}`, 997)
  const recentStructures = new Set(recent.slice(-6).map((item) => item?.structure).filter(Boolean))
  const offset = (seed + variation * 3) % pool.length
  const ordered = [...pool.slice(offset), ...pool.slice(0, offset)]
  return ordered.find((item) => !recentStructures.has(item)) || ordered[0]
}

function factScore(fact = '') {
  const value = clean(fact).toLowerCase()
  let score = 0
  if (/freshly made|baru siap|dibuat|bikin|hasilkan|dihasilkan/.test(value)) score += 8
  if (/piece|produk|display|signage|kiosk|counter|rack|table|wardrobe|furniture|perabot/.test(value)) score += 7
  if (/kkip|stesen tanjung aru|tanjung aru|workshop|kilang/.test(value)) score += 6
  if (/bawa|membawa|setup|digunakan|pasang|install/.test(value)) score += 5
  if (/event|keretapi|pameran|program|launch|expo/.test(value)) score += 4
  if (NUMBER_RE.test(value) || DATE_RE.test(value)) score += 2
  return score
}

function prioritizeFacts(facts = [], variation = 0) {
  const ranked = facts
    .map((fact, index) => ({ fact, index, score: factScore(fact) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
  if (!ranked.length) return []

  const top = ranked.slice(0, 3).map((item) => item.fact)
  const rest = ranked.slice(3).map((item) => item.fact)
  if (variation === 1 && top.length > 1) top.push(top.shift())
  if (variation === 2 && top.length > 2) [top[1], top[2]] = [top[2], top[1]]
  return [...top, ...rest]
}

function subjectFor(form = {}) {
  if (form.product && form.product !== 'General / No Product') return clean(form.product)
  return clean(form.title) || 'cerita ni'
}

function nameLead(form, facts) {
  const subject = subjectFor(form)
  const explicitNameFact = facts.find((fact) => new RegExp(subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(fact))
  return explicitNameFact || `${subject} ni ada sebab kenapa dia masuk cerita kali ni.`
}

function numberLead(facts) {
  return facts.find((fact) => NUMBER_RE.test(fact) || DATE_RE.test(fact)) || facts[0] || ''
}

const BRIDGES = Object.freeze({
  'artisan-story': [
    'Bila cerita pasal hasil kerja, kami lagi suka nampak orang di belakang dia juga.',
    'Bagi kami, artisan tu bukan background dalam cerita Brutti. Dorang memang sebahagian daripada jiwa dia.',
    'Yang kami mau simpan bukan hasil siap ja, tapi orang dan usaha yang bikin benda tu jadi.',
    'Kalau ada detail orang yang memang diketahui, itu lagi kuat daripada ayat puji-puji kosong.',
    'Kerja tangan ni ada manusia di belakang dia. Itu yang kami tidak mau hilang.',
  ],
  'founder-moment': [
    'Benda macam ni kami lagi selesa cerita macam mana dia betul-betul jadi.',
    'Tidak perlu kasi nampak hero sangat. Yang penting cerita dia jujur.',
    'Kadang bila fikir balik, benda yang paling melekat bukan yang perfect pun.',
    'Kami pun belajar sambil jalan. Ada benda okay, ada benda bikin garu kepala juga.',
    'Kalau ada pengajaran, biar datang dari kejadian sebenar tu sendiri.',
  ],
  'daily-human-moment': [
    'Moment macam ni kami suka cerita macam mana dia betul-betul jadi.',
    'Ada masa kerja, ada masa ketawa-ketawa. Dua-dua memang sebahagian daripada team.',
    'Benda kecil macam ni la yang selalunya paling senang tinggal dalam ingatan.',
    'Tidak semua cerita perlu dibesarkan. Yang real tu pun sudah cukup.',
    'Kami simpan cerita ni sebab dia memang rasa macam Brutti sehari-hari.',
  ],
  'customer-story': [
    'Kami mula dari apa yang customer betul-betul perlukan dulu bah, bukan terus antam template.',
    'Bila keperluan ruang sudah jelas, barula senang mau kasi direction dia ngam.',
    'Lain customer, lain cara dia guna ruang bah. Memang tidak boleh copy-paste ja semua benda.',
    'Kami lagi suka dengar masalah sebenar dulu, baru cari solution yang ngam bah.',
    'Bila detail dia real, cerita pun senang ja dibawa tanpa hard sell bah.',
  ],
  'piece-story': [
    'Kami lagi suka cerita hasil kerja melalui fungsi dan benda yang memang digunakan betul-betul.',
    'Bagi kami, craftsmanship paling senang nampak melalui hasil yang memang dibuat dan digunakan.',
    'Bila satu piece masuk dalam situasi sebenar, cerita dia jadi lebih jelas daripada ayat marketing panjang-panjang.',
    'Satu piece bagi kami bukan setakat barang siap. Ada proses dan kerja tangan di belakang dia.',
    'Kami lagi suka bagi hasil kerja tu bercakap daripada puji panjang-panjang.',
  ],
  'community-purpose': [
    'Bila ada ruang untuk berkongsi rezeki, bagi kami itu bukan side story.',
    'Brutti bukan pasal jual benda ja. Ada masa kita kena tengok balik apa yang boleh dikasi semula.',
    'Kalau benda tu memang beri manfaat pada orang, itu memang layak diceritakan.',
    'Kami mau cerita benda macam ni tanpa kasi nampak macam mau collect pujian.',
    'Yang penting, cerita dia datang dari apa yang betul-betul dibuat.',
  ],
  'verified-promotion': [
    'Kalau offer tu memang ada, kami kasi straight pada detail yang sudah confirm.',
    'Tidak payah kasi over. Orang cuma perlu tahu benda yang betul-betul relevant.',
    'Harga atau syarat yang belum confirm memang tidak masuk cerita.',
    'Promo pun masih boleh bunyi macam manusia, bukan poster berjalan.',
    'Kalau memang ngam dengan keperluan, barula offer tu ada makna.',
  ],
  'educational-story': [
    'Kami suka tip yang boleh terus nampak guna dia, bukan teori panjang sangat.',
    'Mula dari keadaan sebenar dulu. Dari situ baru senang faham kenapa satu pilihan dibuat.',
    'Tidak semua ruang atau project perlukan jawapan yang sama.',
    'Kalau fungsi sudah jelas, keputusan lain pun biasanya jadi lebih senang.',
    'Yang penting point dia practical dan tidak lari daripada fakta.',
  ],
  'brand-story': [
    'Kami lagi suka biar kerja sebenar tunjuk siapa Brutti daripada paksa masuk ayat jualan.',
    'Bila cerita datang dari benda yang betul-betul dibuat, brand tu rasa lebih dekat.',
    'Bagi kami, benda real selalu lebih kuat daripada ayat yang terlalu polished.',
    'Tidak semua post kena ada jualan. Kadang kerja sebenar tu sendiri sudah cukup.',
    'Yang penting, bila baca tu rasa ada manusia dan kerja sebenar di belakang brand ni.',
  ],
})

const ENDINGS = Object.freeze({
  reflection: [
    'Bila fikir balik, benda macam ni la yang paling senang bikin kami ingat kenapa kami mula.',
    'Simple ja, tapi benda macam ni yang kami rasa sayang kalau tidak disimpan sebagai cerita.',
    'Kadang tidak perlu conclusion besar pun. Cukup tau kenapa moment ni penting.',
    'Yang ni kami simpan sebagai sebahagian daripada perjalanan Brutti.',
  ],
  conversation: [
    'Kamurang pun pernah kena situasi lebih kurang macam ni ka?',
    'Kalau kamurang di tempat kami, benda pertama yang kamurang akan perasan apa?',
    'Kalau ada cerita sama macam ni, kasi tau juga bah.',
    'Yang ni memang jenis cerita yang bikin kami mau dengar pengalaman orang lain juga.',
  ],
  practical: [
    'Kalau mau check detail dia lebih jauh, roger ja team Brutti.',
    'Kalau ada benda yang kamu mau confirm, mesej ja kami dulu.',
    'Kalau benda ni relevant dengan ruang kamu, boleh kasi kami tengok detail sama-sama.',
    'Yang penting, confirm dulu apa yang kamu betul-betul perlukan.',
  ],
})

function humanDetailAllowed(line = '', facts = []) {
  const factText = clean(facts.join(' '))
  return HUMAN_DETAIL_RULES.every((rule) => !rule.line.test(line) || rule.fact.test(factText))
}

function bridgeLines(pillar, seed, count = 4, facts = []) {
  const pool = (BRIDGES[pillar] || BRIDGES['brand-story']).filter((line) => humanDetailAllowed(line, facts))
  if (!pool.length) return BRIDGES['brand-story'].slice(0, count)
  const offset = seed % pool.length
  return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, count)
}

function contextualFactBridge(facts = []) {
  const text = clean(facts.join(' ')).toLowerCase()
  if (/kkip/.test(text) && /tanjung aru/.test(text) && /freshly made|dibuat|bikin|hasilkan|dihasilkan/.test(text)) {
    return 'Dari KKIP sampai Tanjung Aru, kami suka bila hasil kerja sendiri dapat terus masuk dalam setup sebenar.'
  }
  if (/display/.test(text) && /kiosk|counter/.test(text) && /freshly made|dibuat|bikin|hasilkan|dihasilkan/.test(text)) {
    return 'Bila display sampai kiosk pun memang hasil Brutti sendiri, craftsmanship tu terus nampak tanpa perlu hard sell.'
  }
  return ''
}

function endingFor(pillar, form, seed, variation) {
  const conversational = pillar === 'daily-human-moment' || pillar === 'founder-moment'
  const brandAwareness = form.type === 'Brand Awareness'
  const practical = !brandAwareness && (pillar === 'piece-story' || pillar === 'customer-story' || pillar === 'verified-promotion' || form.type === 'Educational')
  const family = conversational && variation === 1 ? 'conversation' : practical && variation !== 2 ? 'practical' : 'reflection'
  const pool = ENDINGS[family]
  return pool[(seed + variation) % pool.length]
}

function structureDraft(structure, form, facts, pillar, variation) {
  const ordered = prioritizeFacts(facts, variation)
  const seed = stableIndex(`${captionV3InputKey(form, variation)}|${structure}`, 997)
  const bridges = bridgeLines(pillar, seed, 5, facts)
  const lead = ordered[0] || `${subjectFor(form)} ni ada cerita dia sendiri.`
  const second = ordered[1]
  const third = ordered[2]
  const fourth = ordered[3]
  const ending = endingFor(pillar, form, seed, variation)
  const factBridge = contextualFactBridge(facts)

  if ((pillar === 'piece-story' || pillar === 'brand-story') && ordered.length >= 2) {
    let lines = uniqueLines([
      lead,
      second,
      third,
      factBridge,
      bridges[0],
      fourth,
      bridges[1],
      ending,
    ])
    const extra = bridgeLines(pillar, seed + 3, 5, facts)
    for (const line of extra) {
      if (lines.length >= 8) break
      lines = uniqueLines([...lines.slice(0, -1), line, lines.at(-1)])
    }
    return uniqueLines(lines).slice(0, 11).join('\n')
  }

  const layouts = {
    'scene-led': [lead, bridges[0], second, third, bridges[1], fourth, bridges[2], ending],
    'specific-fact-led': [lead, second, bridges[0], third, bridges[1], fourth, bridges[2], ending],
    'name-led': [nameLead(form, ordered), second || lead, bridges[0], third, bridges[1], fourth, bridges[2], ending],
    'number-led': [numberLead(ordered), second, bridges[0], third, bridges[1], fourth, bridges[2], ending],
    'need-first': [lead, 'Mula dari keperluan sebenar dulu. Dari situ barula cerita dia senang disusun.', second, bridges[0], third, bridges[1], fourth, ending],
    'process-led': [lead, 'Yang orang nampak selalunya hasil akhir. Proses sebelum tu yang banyak cerita.', second, third, bridges[0], fourth, bridges[1], ending],
    'behind-the-result': [lead, 'Hasil siap tu hujung cerita ja.', second, bridges[0], third, fourth, bridges[1], ending],
    'moment-recap': [lead, second, 'Bila dikumpul balik satu-satu, baru terasa moment ni memang ada cerita dia.', third, bridges[0], fourth, bridges[1], ending],
    'human-reflection': [lead, bridges[0], second, 'Bila fikir balik, point dia bukan mau kasi nampak semua perfect.', third, bridges[1], fourth, ending],
    'straight-story': [lead, second, third, bridges[0], fourth, bridges[1], bridges[2], ending],
    'contrast-led': [lead, 'Kalau tengok sepintas lalu mungkin nampak simple. Bila masuk detail, lain pula cerita dia.', second, third, bridges[0], fourth, bridges[1], ending],
    'craft-note': [lead, 'Kami tengok benda ni dari fungsi, proses dan kerja tangan di belakang dia.', second, third, bridges[0], fourth, bridges[1], ending],
  }

  let lines = uniqueLines(layouts[structure] || layouts['straight-story']).filter((line) => humanDetailAllowed(line, facts))
  const extra = bridgeLines(pillar, seed + 3, 5, facts)
  for (const line of extra) {
    if (lines.length >= 8) break
    lines = uniqueLines([...lines.slice(0, -1), line, lines.at(-1)])
  }

  return uniqueLines(lines).slice(0, 11).join('\n')
}

export function buildBruttiCaptionV3(form = {}, variation = 0, options = {}) {
  const version = Math.max(0, Math.min(2, Number(variation) || 0))
  const facts = parseVerifiedFacts(form.brief || '')
  if (!clean(form.title) || !facts.length) {
    return {
      copy: '',
      report: { pass: false, checks: [], reason: 'missing-verified-input' },
      meta: { engine: 'brutti-caption-v3', storyPillar: 'unknown', structure: 'none', version: version + 1 },
    }
  }

  const pillar = detectStoryPillar(form, facts)
  const structure = chooseStructure(form, facts, pillar, version, options.recentStructures || [])
  const draft = structureDraft(structure, form, facts, pillar, version)
  const locked = lockBruttiVoice(draft, form, version)

  return {
    copy: locked.copy,
    report: locked.report,
    refined: locked.refined,
    fallback: locked.fallback,
    meta: {
      engine: 'brutti-caption-v3',
      storyPillar: pillar,
      structure,
      version: version + 1,
      inputKey: captionV3InputKey(form, version),
      factCount: facts.length,
    },
  }
}