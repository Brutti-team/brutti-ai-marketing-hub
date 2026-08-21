import { BRUTTI_SOUL, SOUL_SOURCE_LABEL } from './bruttiSoulSource'

const MASTER_TEXT = [
  BRUTTI_SOUL.origin,
  BRUTTI_SOUL.voice,
  BRUTTI_SOUL.values,
  BRUTTI_SOUL.redLines,
  BRUTTI_SOUL.product,
  BRUTTI_SOUL.craft,
  BRUTTI_SOUL.pillars,
  BRUTTI_SOUL.vision,
  BRUTTI_SOUL.checklist,
  BRUTTI_SOUL.examples,
].join('\n')

export const CONTENT_SOUL_POLICY = Object.freeze({
  source: SOUL_SOURCE_LABEL,
  firstPerson: /First person, always/i.test(BRUTTI_SOUL.voice),
  sabahanColloquial: /Sabahan colloquial/i.test(BRUTTI_SOUL.voice),
  shortLineRhythm: /Satu-satu baris/i.test(BRUTTI_SOUL.voice),
  noHashtags: /TAK guna hashtag langsung|TIADA blok hashtag/i.test(MASTER_TEXT),
  maxEmoji: /1[–-]3 per post/i.test(BRUTTI_SOUL.voice) ? 3 : 3,
  realStoryFirst: /apa yang berlaku hari ni yang jujur/i.test(BRUTTI_SOUL.full),
  storyPillars: /THE FOUR STORY PILLARS/i.test(BRUTTI_SOUL.pillars),
  artisanRespect: /artisan/i.test(BRUTTI_SOUL.values),
  transparency: /transparen|telus|silap/i.test(BRUTTI_SOUL.values),
  productNeedFirst: /keperluan|customer|piece/i.test(`${BRUTTI_SOUL.product}\n${BRUTTI_SOUL.craft}`),
  allMasterSectionsAvailable: [
    BRUTTI_SOUL.origin,
    BRUTTI_SOUL.voice,
    BRUTTI_SOUL.values,
    BRUTTI_SOUL.redLines,
    BRUTTI_SOUL.product,
    BRUTTI_SOUL.craft,
    BRUTTI_SOUL.pillars,
    BRUTTI_SOUL.vision,
    BRUTTI_SOUL.checklist,
    BRUTTI_SOUL.examples,
  ].every(Boolean),
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

function storyPillarFor(form = {}) {
  const type = form.type || 'Brand Awareness'
  const text = clean(`${form.title || ''} ${form.product || ''} ${form.brief || ''}`).toLowerCase()

  if (/artisan|tukang|workshop|kilang|gaji|payroll|craft/.test(text)) return 'Kisah artisan & maruah'
  if (/founder|lukman|faznur|menyesal|silap|salah|syukur|terharu/.test(text)) return 'Founder moment / transparency'
  if (/lucu|kelakar|funny|ketawa|gelak|whatsapp|hint/.test(text)) return 'Babak lucu harian'
  if (type === 'Product Highlight' || type === 'Customer Story' || /piece|produk|wardrobe|rack|table|kiosk/.test(text)) return 'Story behind the piece'
  if (type === 'Behind the Scenes') return 'People behind the work'
  return 'Real Brutti story'
}

function firstPersonBridge(form = {}, mode = 'balanced') {
  const english = form.language === 'English'
  const professional = mode === 'professional' || form.tone === 'Professional but friendly'
  const type = form.type || 'Brand Awareness'
  const pillar = storyPillarFor(form)

  if (english) {
    if (pillar === 'Kisah artisan & maruah') return 'We tell the work through the people who actually make it, not as an anonymous factory story.'
    if (pillar === 'Founder moment / transparency') return 'We would rather tell the real part clearly, including the imperfect bit, than make the story look polished for no reason.'
    if (type === 'Product Highlight') return 'We start with the real need and function before we talk about styling.'
    if (type === 'Behind the Scenes') return 'We keep stories like this because the people behind the work are part of Brutti too.'
    if (type === 'Customer Story') return 'We start with the customer’s real situation before we talk about the solution.'
    if (type === 'Educational') return 'We keep the useful point simple enough to apply in a real situation.'
    if (type === 'Promotion') return 'We keep the offer clear, but we still start with whether it genuinely fits the need.'
    return 'We tell Brutti through real work, real people and the way we actually speak.'
  }

  if (professional) {
    if (pillar === 'Kisah artisan & maruah') return 'Bagi kami, orang yang menghasilkan setiap piece ialah artisan dan cerita mereka tidak patut hilang di belakang hasil akhir.'
    if (pillar === 'Founder moment / transparency') return 'Bagi kami, cerita yang jujur termasuk cabaran dan kesilapan lebih bermakna daripada cuba kelihatan sempurna.'
    if (type === 'Product Highlight') return 'Bagi kami, fungsi dan keperluan sebenar datang dahulu sebelum gaya atau ayat jualan.'
    if (type === 'Behind the Scenes') return 'Bagi kami, orang di belakang kerja juga sebahagian penting daripada cerita Brutti.'
    return 'Bagi kami, cerita Brutti perlu kekal berpijak pada perkara sebenar dan identiti sendiri.'
  }

  if (pillar === 'Kisah artisan & maruah') return 'Bagi kami, orang yang bikin setiap piece tu artisan — bukan watak kosong di belakang hasil siap.'
  if (pillar === 'Founder moment / transparency') return 'Kami lagi rela cerita benda sebenar, termasuk part yang silap atau tidak perfect, daripada kasi nampak semua cantik saja.'
  if (pillar === 'Babak lucu harian') return 'Kalau babak tu memang lucu, kami cerita ja macam biasa — tidak payah kasi dibuat-buat.'
  if (type === 'Product Highlight') return 'Kami suka mula dari kenapa piece ni diperlukan dan fungsi sebenar dia, baru cerita rupa dia.'
  if (type === 'Behind the Scenes') return 'Kami suka simpan cerita macam ni bah, sebab orang di belakang kerja pun sebahagian dari Brutti.'
  if (type === 'Customer Story') return 'Kami dengar dulu cerita dan keperluan customer, baru fikir solution yang ngam.'
  if (type === 'Educational') return 'Kami kasi simple ja — yang penting point tu memang boleh digunakan dalam situasi sebenar.'
  if (type === 'Promotion') return 'Kami tidak mau hard sell sangat; offer tu kena masuk akal dengan keperluan dulu.'
  return 'Kami cerita Brutti dari bisnes sebenar, orang sebenar dan benda yang memang berlaku — bukan corporate script.'
}

function bilingualAccent(form = {}) {
  const type = form.type || 'Brand Awareness'
  if (type === 'Product Highlight') return 'Function dulu, styling kemudian — baru senang nampak dia ngam ka tidak.'
  if (type === 'Behind the Scenes') return 'Real team, real moment — yang ni memang tidak payah over-polish.'
  if (type === 'Customer Story') return 'Real need dulu, baru fikir solution.'
  if (type === 'Educational') return 'Keep it practical — point tu mesti boleh guna betul-betul.'
  if (type === 'Promotion') return 'Clear offer, no hard sell — itu ja.'
  return 'Local roots, honest story — itu cara kami.'
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
  const alreadyMixed = lines.some((line) => /\b(function|real|keep|local|clear|solution|styling|honest|team|moment)\b/i.test(line))
  if (alreadyMixed) return lines

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

function keepShape(lines, form, mode) {
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

  if (mode === 'shorten') {
    while (unique.length > 7) unique.splice(Math.max(1, unique.length - 2), 1)
    return unique.slice(0, 7)
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
  lines = keepShape(lines, form, mode)
  return lines.join('\n')
}

export function soulHashtagStatus() {
  return CONTENT_SOUL_POLICY.noHashtags
    ? 'Tidak digunakan — ikut Brutti Soul Master: sekarang tiada hashtag.'
    : 'Semak Brutti Soul Master untuk rule hashtag semasa.'
}

export function soulPolicyLabel(form = {}) {
  const rules = []
  if (CONTENT_SOUL_POLICY.firstPerson) rules.push('first-person')
  if (CONTENT_SOUL_POLICY.sabahanColloquial) rules.push('Sabahan voice')
  if (CONTENT_SOUL_POLICY.shortLineRhythm) rules.push('short-line rhythm')
  if (CONTENT_SOUL_POLICY.noHashtags) rules.push('no hashtags')
  if (CONTENT_SOUL_POLICY.storyPillars) rules.push(`pillar: ${storyPillarFor(form)}`)
  rules.push(`max ${CONTENT_SOUL_POLICY.maxEmoji} emoji`)
  return `${SOUL_SOURCE_LABEL} · ${rules.join(' · ')}`
}
