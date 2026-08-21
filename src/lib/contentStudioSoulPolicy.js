import { BRUTTI_SOUL, SOUL_SOURCE_LABEL } from './bruttiSoulSource'

const MASTER_TEXT = `${BRUTTI_SOUL.voice}\n${BRUTTI_SOUL.craft}\n${BRUTTI_SOUL.checklist}`

export const CONTENT_SOUL_POLICY = Object.freeze({
  source: SOUL_SOURCE_LABEL,
  firstPerson: /First person, always/i.test(BRUTTI_SOUL.voice),
  sabahanColloquial: /Sabahan colloquial/i.test(BRUTTI_SOUL.voice),
  shortLineRhythm: /Satu-satu baris/i.test(BRUTTI_SOUL.voice),
  noHashtags: /TAK guna hashtag langsung|TIADA blok hashtag/i.test(MASTER_TEXT),
  maxEmoji: /1[–-]3 per post/i.test(BRUTTI_SOUL.voice) ? 3 : 3,
  realStoryFirst: /apa yang berlaku hari ni yang jujur/i.test(BRUTTI_SOUL.full),
})

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalized(value = '') {
  return clean(value).toLowerCase().replace(/[.!?]+$/g, '')
}

function verifiedFactSet(form = {}) {
  return new Set(
    String(form.brief || '')
      .split(/\n+|\s*;\s*|(?<=[.!?])\s+/)
      .map(normalized)
      .filter(Boolean),
  )
}

function firstPersonBridge(form = {}, mode = 'balanced') {
  const english = form.language === 'English'
  const professional = mode === 'professional' || form.tone === 'Professional but friendly'
  const type = form.type || 'Brand Awareness'

  if (english) {
    if (type === 'Product Highlight') return 'We start with the real function and need before we talk about style.'
    if (type === 'Behind the Scenes') return 'We keep stories like this because the people behind the work are part of Brutti too.'
    if (type === 'Customer Story') return 'We start with the customer’s real situation before we talk about the solution.'
    if (type === 'Educational') return 'We keep the useful point simple enough to apply in a real situation.'
    if (type === 'Promotion') return 'We keep the offer clear, but we still start with whether it genuinely fits the need.'
    return 'We tell Brutti from the real things that happen, not from a corporate script.'
  }

  if (professional) {
    if (type === 'Product Highlight') return 'Bagi kami, fungsi dan keperluan sebenar datang dahulu sebelum gaya atau ayat jualan.'
    if (type === 'Behind the Scenes') return 'Bagi kami, orang di belakang kerja juga sebahagian penting daripada cerita Brutti.'
    return 'Bagi kami, cerita Brutti perlu kekal berpijak pada perkara sebenar dan identiti sendiri.'
  }

  if (type === 'Product Highlight') return 'Kami memang suka mula dari fungsi dan keperluan sebenar dulu, baru cerita rupa dia.'
  if (type === 'Behind the Scenes') return 'Kami suka simpan cerita macam ni bah, sebab orang di belakang kerja pun sebahagian dari Brutti.'
  if (type === 'Customer Story') return 'Kami dengar dulu cerita dan keperluan customer, baru fikir solution yang ngam.'
  if (type === 'Educational') return 'Kami kasi simple ja — yang penting point tu memang boleh digunakan dalam situasi sebenar.'
  if (type === 'Promotion') return 'Kami tidak mau hard sell sangat; offer tu kena masuk akal dengan keperluan dulu.'
  return 'Kami cerita Brutti dari benda yang betul-betul berlaku, bukan kasi bunyi macam corporate script.'
}

function bilingualAccent(form = {}) {
  const type = form.type || 'Brand Awareness'
  if (type === 'Product Highlight') return 'Function first, then the styling makes more sense.'
  if (type === 'Behind the Scenes') return 'Real team, real moments — no need to over-polish it.'
  if (type === 'Customer Story') return 'Real need first, solution second.'
  if (type === 'Educational') return 'Keep it practical, keep it useful.'
  if (type === 'Promotion') return 'Clear offer, no hard sell.'
  return 'Local roots, honest story — that is the Brutti way.'
}

function removeHashtags(line = '') {
  if (!CONTENT_SOUL_POLICY.noHashtags) return line
  return clean(line.replace(/#[\p{L}\p{N}_-]+/gu, ''))
}

function capEmoji(lines = []) {
  let count = 0
  return lines.map((line) => line.replace(/\p{Extended_Pictographic}/gu, (emoji) => {
    count += 1
    return count <= CONTENT_SOUL_POLICY.maxEmoji ? emoji : ''
  }).replace(/\s{2,}/g, ' ').trim())
}

function ensureFirstPerson(lines, form, factSet, mode) {
  if (!CONTENT_SOUL_POLICY.firstPerson) return lines
  const generatedHasFirstPerson = lines.some((line) => {
    if (factSet.has(normalized(line))) return false
    return /\b(kami|aku|sia|we|our|us)\b/i.test(line)
  })
  if (generatedHasFirstPerson) return lines

  const bridge = firstPersonBridge(form, mode)
  const next = [...lines]
  next.splice(Math.min(1, next.length), 0, bridge)
  return next
}

function ensureBilingual(lines, form, factSet) {
  if (form.language !== 'BM + English') return lines
  const accent = bilingualAccent(form)
  const alreadyEnglishLed = lines.some((line) => /\b(the|we|our|real|keep|function|local|clear|solution)\b/i.test(line))
  if (alreadyEnglishLed) return lines

  const next = [...lines]
  const replaceIndex = next.findIndex((line, index) => index > 1 && index < next.length - 1 && !factSet.has(normalized(line)))
  if (replaceIndex >= 0) next[replaceIndex] = accent
  else next.splice(Math.min(3, next.length), 0, accent)
  return next
}

function sabahanPass(lines, form, factSet, mode) {
  if (!CONTENT_SOUL_POLICY.sabahanColloquial) return lines
  if (form.language === 'English' || mode === 'professional' || form.tone === 'Professional but friendly') return lines

  return lines.map((line) => {
    if (factSet.has(normalized(line))) return line
    return line
      .replace(/\bmahu\b/gi, 'mau')
      .replace(/\bsahaja\b/gi, 'ja')
      .replace(/\btidak perlu\b/gi, 'tidak payah')
      .replace(/\bsesuai\b/gi, 'ngam')
      .replace(/\bmelihat\b/gi, 'tinguk')
      .replace(/\s{2,}/g, ' ')
      .trim()
  })
}

function keepShape(lines, form) {
  const unique = []
  lines.forEach((line) => {
    const next = clean(line)
    if (!next) return
    if (unique.some((item) => normalized(item) === normalized(next))) return
    unique.push(next)
  })

  const fallback = form.language === 'English'
    ? ['We keep the real detail visible so the story still feels human.', 'We would rather say one honest thing clearly than fill the caption with marketing lines.']
    : ['Kami kasi detail sebenar tu tetap nampak supaya cerita masih rasa human.', 'Kami lagi rela cerita satu benda yang jujur dengan jelas daripada isi caption dengan ayat marketing.']

  let cursor = 0
  while (unique.length < 7 && cursor < fallback.length) {
    unique.splice(Math.max(1, unique.length - 1), 0, fallback[cursor])
    cursor += 1
  }

  return unique.slice(0, 13)
}

export function applyBruttiSoulPolicy(caption, form = {}, mode = 'balanced') {
  const factSet = verifiedFactSet(form)
  let lines = String(caption || '')
    .split('\n')
    .map(removeHashtags)
    .map(clean)
    .filter(Boolean)

  lines = ensureFirstPerson(lines, form, factSet, mode)
  lines = ensureBilingual(lines, form, factSet)
  lines = sabahanPass(lines, form, factSet, mode)
  lines = capEmoji(lines)
  lines = keepShape(lines, form)
  return lines.join('\n')
}

export function soulHashtagStatus() {
  return CONTENT_SOUL_POLICY.noHashtags
    ? 'Tidak digunakan — ikut Brutti Soul Master: sekarang tiada hashtag.'
    : 'Semak Brutti Soul Master untuk rule hashtag semasa.'
}

export function soulPolicyLabel() {
  const rules = []
  if (CONTENT_SOUL_POLICY.firstPerson) rules.push('first-person')
  if (CONTENT_SOUL_POLICY.sabahanColloquial) rules.push('Sabahan voice')
  if (CONTENT_SOUL_POLICY.shortLineRhythm) rules.push('short-line rhythm')
  if (CONTENT_SOUL_POLICY.noHashtags) rules.push('no hashtags')
  rules.push(`max ${CONTENT_SOUL_POLICY.maxEmoji} emoji`)
  return `${SOUL_SOURCE_LABEL} · ${rules.join(' · ')}`
}
