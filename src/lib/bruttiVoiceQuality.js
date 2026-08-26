const CORPORATE_RE = /\bpihak Brutti\b|kami komited|pelanggan dihargai|memperkenalkan|tawaran hebat|produk berkualiti tinggi|solusi terbaik|sempurna untuk semua/i
const HYPE_RE = /game changer|revolusi|luar biasa|pasti puas hati|no\. ?1|terbaik untuk semua/i
const HASHTAG_RE = /#[\p{L}\p{N}_-]+/gu
const EMOJI_RE = /\p{Extended_Pictographic}/gu
const FIRST_PERSON_RE = /\b(kami|aku|sia|saya|we|our|us)\b/i
const SABAH_RE = /\b(bah|la|ni|tu|kan|sia|bikin|ngam|antam|teda|tinguk|kasi|ja|mau|kamurang)\b/gi

const STOP_WORDS = new Set([
  'yang','untuk','dengan','dalam','daripada','sudah','memang','boleh','kami','kamu','mereka','brutti','produk','cerita','detail','sebagai','sebelum','selepas','lebih','kalau','benda','ruang','piece','customer','project','fakta','verified','direction','content','caption',
])

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function contentLines(value = '') {
  return String(value || '')
    .split('\n')
    .map((line) => clean(line))
    .filter(Boolean)
}

function uniqueLines(lines = []) {
  const seen = new Set()
  return lines.filter((line) => {
    const key = line.toLowerCase().replace(/[.!?…]+$/g, '').trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function capEmoji(lines = []) {
  let seen = 0
  return lines.map((line) => line.replace(EMOJI_RE, (emoji) => {
    seen += 1
    return seen <= 3 ? emoji : ''
  }).replace(/\s{2,}/g, ' ').trim())
}

function lightLanguagePass(line = '') {
  return clean(line)
    .replace(/\bpihak Brutti\b/gi, 'Brutti')
    .replace(/\bpelanggan dihargai\b/gi, 'customer')
    .replace(/\bmemperkenalkan\b/gi, 'mau share')
    .replace(/\btawaran hebat\b/gi, 'offer ni')
    .replace(/\bdgn\b/gi, 'dengan')
    .replace(/\bsblm\b/gi, 'sebelum')
    .replace(/\bsbb\b/gi, 'sebab')
    .replace(/\byg\b/gi, 'yang')
    .replace(/\bdrg\b/gi, 'dorang')
    .replace(/\s*&\s*/g, ' dan ')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
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
  const text = String(copy || '').toLowerCase()
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

export function refineBruttiVoice(draft) {
  let lines = contentLines(draft)
    .map((line) => line.replace(HASHTAG_RE, '').trim())
    .filter(Boolean)
    .map(lightLanguagePass)

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
    { key: 'line-count', pass: lines.length >= 7 && lines.length <= 13, required: true },
    { key: 'no-corporate-tone', pass: !CORPORATE_RE.test(text), required: true },
    { key: 'no-hype', pass: !HYPE_RE.test(text), required: true },
    { key: 'no-hashtags', pass: !(text.match(HASHTAG_RE) || []).length, required: true },
    { key: 'emoji-control', pass: emojis.length <= 3, required: true },
    { key: 'no-duplicate-lines', pass: uniqueCount === lines.length, required: true },
    { key: 'repetition-control', pass: repetitionControlled, required: true },
    { key: 'verified-signal', pass: containsVerifiedSignal(text, form.brief || ''), required: true },
    { key: 'unsupported-claims', pass: unsupported.length === 0, details: unsupported, required: true },
    { key: 'first-person-reference', pass: FIRST_PERSON_RE.test(text), required: false },
    { key: 'sabahan-reference', pass: sabahMarkers.size >= 1, required: false },
  ]

  return {
    pass: checks.filter((check) => check.required !== false).every((check) => check.pass),
    checks,
    lineCount: lines.length,
    emojiCount: emojis.length,
    sabahMarkers: [...sabahMarkers],
    unsupportedClaims: unsupported,
    styleMode: 'soft-reference',
  }
}

export function lockBruttiVoice(draft, form = {}) {
  const refined = refineBruttiVoice(draft, form)
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
