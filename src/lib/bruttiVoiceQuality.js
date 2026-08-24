const CORPORATE_RE = /\bpihak Brutti\b|kami komited|pelanggan dihargai|memperkenalkan|tawaran hebat|produk berkualiti tinggi|solusi terbaik|sempurna untuk semua/i
const HYPE_RE = /game changer|revolusi|luar biasa|pasti puas hati|no\. ?1|terbaik untuk semua/i
const HASHTAG_RE = /#[\p{L}\p{N}_-]+/gu
const EMOJI_RE = /\p{Extended_Pictographic}/gu
const FIRST_PERSON_RE = /\b(kami|aku|sia|saya)\b/i
const SABAH_RE = /\b(bah|la|ni|tu|kan|sia|bikin|ngam|antam|teda|tinguk|kasi|ja|mau|kamurang)\b/gi

const STOP_WORDS = new Set([
  'yang','untuk','dengan','dalam','daripada','sudah','memang','boleh','kami','kamu','mereka','brutti','produk','cerita','detail','sebagai','sebelum','selepas','lebih','kalau','benda','ruang','piece','customer','project','fakta','verified','direction','content','caption',
])

const VOICE_REFINEMENTS = new Map([
  ['Bagi kami, Brutti ni pasal bisnes sebenar, orang sebenar dan cerita yang ada sebab untuk dikongsi.', [
    'Bagi kami, Brutti ni memang pasal orang sebenar dan benda yang betul-betul jadi.',
    'Brutti ni bagi kami simple ja — orang sebenar, kerja sebenar, cerita pun biar betul-betul real.',
    'Kami lagi suka cerita benda yang memang jadi depan mata daripada kasi bunyi terlalu marketing.',
  ]],
  ['Kami lebih suka cerita benda yang memang berlaku daripada kasi nampak semua benda perfect.', [
    'Yang betul-betul jadi tu kami cerita ja. Tidak payah kasi nampak semua perfect.',
    'Kalau benda tu memang berlaku, kami cerita macam tu ja. Tidak perlu kasi cantik lebih-lebih.',
    'Kami tidak kisah sangat mau nampak perfect. Yang penting cerita tu memang betul-betul jadi.',
  ]],
  ['Kalau detail belum confirm, kami memang tidak kasi tambah sendiri.', [
    'Kalau belum confirm, kami tidak pandai-pandai tambah cerita.',
    'Yang belum confirm tu kami tinggal dulu. Jangan antam masuk ja.',
    'Kalau detail belum clear, kami check dulu. Tidak payah tambah benda yang belum tentu.',
  ]],
  ['Kami tengok fungsi dan keperluan dulu, baru rupa dan style dia.', [
    'Kami tengok fungsi dulu. Lepas tu baru cerita pasal rupa dan style dia.',
    'Bagi kami, fungsi dulu bah. Rupa tu kemudian bila benda asas sudah ngam.',
    'Kami mula dari kegunaan sebenar dulu, bukan terus cerita pasal cantik.',
  ]],
  ['Detail yang belum confirm memang kena check dulu dengan team.', [
    'Yang belum confirm tu kita check dulu. Tidak payah antam masuk.',
    'Kalau detail masih kabur, kami kasi confirm dulu sebelum cerita lebih jauh.',
    'Yang belum pasti tu tahan dulu. Biar team check baru kita jalan.',
  ]],
  ['Keperluan sebenar customer tetap jadi starting point.', [
    'Kami mula dari apa yang customer betul-betul perlukan.',
    'Cerita customer bagi kami mula dari satu benda ja — apa yang dia memang perlukan.',
    'Mula-mula kami tinguk dulu apa keperluan sebenar customer tu.',
  ]],
  ['Kami tengok rutin dan fungsi ruang dulu sebelum fikir benda lain.', [
    'Tinguk dulu macam mana ruang tu digunakan hari-hari. Dari situ baru senang fikir.',
    'Kami suka check rutin ruang tu dulu. Lepas tu barula direction dia nampak.',
    'Bagi kami, cara ruang tu dipakai hari-hari lagi penting untuk difaham dulu.',
  ]],
  ['Bila detail sudah jelas, baru senang susun direction yang ngam.', [
    'Bila detail sudah jelas, barula senang kami susun direction yang ngam.',
    'Bila benda asas sudah clear, senang sikit kami nampak direction yang betul.',
    'Detail sudah ngam, barula senang mau jalan ke next step.',
  ]],
  ['Banyak keputusan kecil berlaku sebelum satu piece nampak siap.', [
    'Yang nampak siap tu hujung cerita ja. Sebelum tu banyak keputusan kecil kami kasi jalan satu-satu.',
    'Sebelum satu piece nampak siap, memang banyak benda kecil kami fikir dan check.',
    'Hasil siap tu nampak simple, tapi belakang dia banyak keputusan kecil juga.',
  ]],
  ['Kami share proses sebab cerita di belakang hasil tu pun penting.', [
    'Kami share proses ni sebab cerita belakang dia pun sama penting.',
    'Bagi kami, cerita masa bikin tu pun layak dikongsi, bukan hasil akhir ja.',
    'Proses belakang dia ni pun sebahagian daripada cerita Brutti, bukan hasil siap semata-mata.',
  ]],
])

const FIRST_PERSON_BRIDGES = {
  'Brand Awareness': 'Bagi kami, yang penting cerita ni datang dari benda yang betul-betul berlaku.',
  'Product Highlight': 'Kami lagi suka cerita fungsi yang memang sudah confirm daripada kasi ayat lebih-lebih.',
  Educational: 'Bagi kami, point yang berguna tu mesti boleh dibawa balik ke situasi sebenar.',
  'Behind the Scenes': 'Kami share sebab benda macam ni pun sebahagian daripada cerita sebenar team.',
  'Customer Story': 'Kami mula dari apa yang customer betul-betul perlukan, bukan dari template.',
  Promotion: 'Kami lagi suka detail yang clear daripada kasi orang rasa kena hard sell.',
}

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function stableIndex(value = '', length = 1) {
  if (!length) return 0
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash) % length
}

function contentLines(value = '') {
  return String(value || '')
    .split('\n')
    .map((line) => clean(line))
    .filter(Boolean)
}

function capEmoji(lines) {
  let seen = 0
  return lines.map((line) => line.replace(EMOJI_RE, (emoji) => {
    seen += 1
    return seen <= 3 ? emoji : ''
  }).replace(/\s{2,}/g, ' ').trim())
}

function uniqueLines(lines) {
  const seen = new Set()
  return lines.filter((line) => {
    const key = line.toLowerCase().replace(/[.!?…]+$/g, '').trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function refineLine(line, form, variation) {
  const options = VOICE_REFINEMENTS.get(line)
  let next = options
    ? options[stableIndex(`${form.title}|${form.brief}|${form.type}|${variation}|${line}`, options.length)]
    : line

  next = next
    .replace(/\bpihak Brutti\b/gi, 'kami')
    .replace(/\bpelanggan dihargai\b/gi, 'customer')
    .replace(/\bmemperkenalkan\b/gi, 'mau cerita pasal')
    .replace(/\btawaran hebat\b/gi, 'offer ni')
    .replace(/\s+([,.!?])/g, '$1')
    .trim()

  return next
}

function significantTokens(value = '') {
  return [...new Set(
    String(value || '')
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((token) => token.length >= 5 && !STOP_WORDS.has(token)) || [],
  )]
}

function containsVerifiedSignal(copy, brief) {
  const tokens = significantTokens(brief)
  if (!tokens.length) return true
  const text = copy.toLowerCase()
  return tokens.some((token) => text.includes(token))
}

function unsupportedClaims(copy, source) {
  const text = String(copy || '')
  const verified = String(source || '').toLowerCase().replace(/\s+/g, ' ')
  const unsupported = []

  const currency = text.match(/RM\s?\d[\d,.]*/gi) || []
  currency.forEach((claim) => {
    if (!verified.includes(claim.toLowerCase().replace(/\s+/g, ' '))) unsupported.push(claim)
  })

  const percentages = text.match(/\d+(?:\.\d+)?%/g) || []
  percentages.forEach((claim) => {
    if (!verified.includes(claim.toLowerCase())) unsupported.push(claim)
  })

  const guardedTerms = ['discount', 'diskaun', 'free delivery', 'penghantaran percuma', 'stok terhad', 'limited stock', 'reach', 'views', 'followers', 'sold', 'viral']
  guardedTerms.forEach((term) => {
    if (text.toLowerCase().includes(term) && !verified.includes(term)) unsupported.push(term)
  })

  return [...new Set(unsupported)]
}

export function refineBruttiVoice(draft, form = {}, variation = 0) {
  let lines = contentLines(draft)
    .map((line) => line.replace(HASHTAG_RE, '').trim())
    .filter(Boolean)
    .map((line) => refineLine(line, form, variation))

  lines = uniqueLines(lines)

  const currentCopy = lines.join('\n')
  if (!FIRST_PERSON_RE.test(currentCopy) && lines.length >= 2) {
    const bridge = FIRST_PERSON_BRIDGES[form.type] || FIRST_PERSON_BRIDGES['Brand Awareness']
    lines.splice(Math.max(1, lines.length - 1), 0, bridge)
  }

  lines = uniqueLines(capEmoji(lines)).slice(0, 13)
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function evaluateBruttiVoiceQuality(copy, form = {}) {
  const lines = contentLines(copy)
  const text = lines.join('\n')
  const emojis = text.match(EMOJI_RE) || []
  const sabahMarkers = new Set((text.match(SABAH_RE) || []).map((item) => item.toLowerCase()))
  const unsupported = unsupportedClaims(text, `${form.title || ''} ${form.product || ''} ${form.brief || ''}`)
  const fillerTerms = ['ngam', 'simple', 'bah', 'kasi']
  const repetitionControlled = fillerTerms.every((term) => (text.toLowerCase().match(new RegExp(`\\b${term}\\b`, 'g')) || []).length <= 4)
  const uniqueCount = new Set(lines.map((line) => line.toLowerCase().replace(/[.!?…]+$/g, '').trim())).size

  const checks = [
    { key: 'line-count', pass: lines.length >= 7 && lines.length <= 13 },
    { key: 'first-person', pass: FIRST_PERSON_RE.test(text) },
    { key: 'sabahan-voice', pass: sabahMarkers.size >= 2 },
    { key: 'no-corporate-tone', pass: !CORPORATE_RE.test(text) },
    { key: 'no-hype', pass: !HYPE_RE.test(text) },
    { key: 'no-hashtags', pass: !(text.match(HASHTAG_RE) || []).length },
    { key: 'emoji-control', pass: emojis.length <= 3 },
    { key: 'no-duplicate-lines', pass: uniqueCount === lines.length },
    { key: 'repetition-control', pass: repetitionControlled },
    { key: 'verified-signal', pass: containsVerifiedSignal(text, form.brief || '') },
    { key: 'unsupported-claims', pass: unsupported.length === 0, details: unsupported },
  ]

  return {
    pass: checks.every((check) => check.pass),
    checks,
    lineCount: lines.length,
    emojiCount: emojis.length,
    sabahMarkers: [...sabahMarkers],
    unsupportedClaims: unsupported,
  }
}

export function lockBruttiVoice(draft, form = {}, variation = 0) {
  const refined = refineBruttiVoice(draft, form, variation)
  const refinedReport = evaluateBruttiVoiceQuality(refined, form)
  if (refinedReport.pass) {
    return { copy: refined, report: refinedReport, refined: refined !== draft, fallback: false }
  }

  const baseReport = evaluateBruttiVoiceQuality(draft, form)
  if (baseReport.pass) {
    return { copy: draft, report: baseReport, refined: false, fallback: true }
  }

  return { copy: refined || draft, report: refinedReport, refined: refined !== draft, fallback: true }
}
