import { useEffect } from 'react'
import { SOUL_SOURCE_LABEL, buildSoulDraft, soulSourceReady } from './lib/bruttiSoulSource'

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function activeStudio() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('.page-header h1')?.textContent?.trim() === 'Content Studio') || null
}

function field(page, labelPrefix, selector) {
  const label = [...page.querySelectorAll('label')]
    .find((item) => clean(item.textContent).startsWith(labelPrefix))
  return label?.querySelector(selector) || null
}

function setReactValue(element, value) {
  if (!element) return
  const prototype = Object.getPrototypeOf(element)
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  if (setter) setter.call(element, value)
  else element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function readForm(page) {
  return {
    title: field(page, 'Content title', 'input')?.value || '',
    platform: field(page, 'Platform', 'select')?.value || 'Facebook',
    type: field(page, 'Content type', 'select')?.value || 'Brand Awareness',
    product: field(page, 'Product', 'select')?.value || 'General / No Product',
    language: field(page, 'Language', 'select')?.value || 'Bahasa Melayu',
    tone: field(page, 'Tone', 'select')?.value || 'Brutti Sabahan Casual',
    brief: field(page, 'Verified facts / direction', 'textarea')?.value || '',
  }
}

function isTeamActivity(form) {
  const noProduct = !form.product || form.product === 'General / No Product'
  const typeFits = form.type === 'Behind the Scenes' || form.type === 'Brand Awareness'
  const text = clean(`${form.title} ${form.brief}`).toLowerCase()
  const activitySignal = /retreat|team building|team-building|bonding|riadah|outing|trip|aktiviti|activity|event|games?|makan-makan|luangkan masa|d['’]?danau|company culture|team culture|staff|kakitangan/.test(text)
  return noProduct && typeFits && activitySignal
}

function isDirectionLine(line) {
  return /buat caption|susun caption|gaya caption|tone|bukan hard sell|jangan hard sell|tidak hard sell|fokus (pada|kepada)|gunakan gaya|tulis dalam|ayat santai|berbentuk recap|macam kita bercakap|cara penulisan|jangan menjual|tidak menjual|non-selling/i.test(line)
}

function isSellingOrProductLine(line) {
  return /\bpiece\b|\bproduk\b|\bproduct\b|\bfurniture\b|\bcustomer\b|\bclient\b|\bpelanggan\b|\border\b|\bruang\b|\bsolution\b|mesej ja|mesej kami|roger ja|detail dia lebih lanjut|mau bincang/i.test(line)
}

function sentence(value = '') {
  const text = clean(value).replace(/[.!?]+$/g, '')
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}.` : ''
}

function activityFacts(brief = '') {
  return String(brief || '')
    .split(/(?<=[.!?])\s+|\s*;\s*|\n+/)
    .map(sentence)
    .filter(Boolean)
    .filter((line) => !isDirectionLine(line))
    .filter((line) => !isSellingOrProductLine(line))
    .slice(0, 6)
}

const activityHooks = {
  balanced: [
    'Dua hari ni, kami tukar suasana sekejap. 🌿',
    'Kali ni cerita Brutti bukan dari workshop dulu.',
    'Ada masa kerja sama-sama, ada masa keluar dari rutin sama-sama juga.',
  ],
  engaging: [
    'Bila kali terakhir satu team betul-betul keluar dari rutin sama-sama? 👀',
    'Kerja sama-sama tiap hari tu satu hal. Pergi retreat sama-sama tu cerita lain pula. 😄',
    'Dua hari jauh dari rutin kerja — apa yang paling kami bawa balik nanti?',
  ],
  casual: [
    'Nah, kali ni kami kasi rehat kepala sekejap bah. 😄',
    'Office tinggal dulu. Dua hari ni tukar angin sekejap.',
    'Kerja tu kerja juga, tapi sekali-sekala kena juga keluar ramai-ramai bah.',
  ],
  professional: [
    'Dua hari ini, team Brutti mengambil masa seketika di luar rutin kerja biasa.',
    'Ada masa untuk bekerja bersama, dan ada masa untuk mengenali team di luar rutin harian.',
    'Retreat kali ini memberi ruang untuk team Brutti berhenti seketika daripada rutin biasa.',
  ],
  hook: [
    'Bukan semua cerita Brutti bermula dengan kayu, workshop atau project.',
    'Dua hari. Satu team. Kali ni cerita dia jauh sikit dari rutin biasa. 🌿',
    'Kalau selalu nampak kami masa kerja, kali ni tengok versi luar office pula. 👀',
  ],
  cta: [
    'Ada satu benda best bila satu team dapat keluar dari rutin sama-sama.',
    'Kadang moment paling senang diingat bukan masa meeting pun.',
    'Retreat ni bukan pasal agenda panjang sangat — lebih kepada masa bersama.',
  ],
}

const activitySupport = {
  balanced: [
    'Kadang-kadang keluar sekejap dari rutin pun bagi ruang untuk team duduk dan luang masa sama-sama.',
    'Bagi kami, orang di belakang Brutti pun sebahagian daripada cerita brand ni.',
    'Moment macam ni simple, tapi tetap jadi sebahagian daripada perjalanan team Brutti.',
  ],
  engaging: [
    'Yang best, bila suasana berubah sikit, perangai sebenar team pun kadang-kadang keluar juga. 😄',
    'Bukan semua bonding kena formal — kadang makan, main dan duduk sama-sama pun sudah cukup.',
    'Dari moment kecil macam ni la selalunya cerita team jadi lebih hidup.',
  ],
  casual: [
    'Yang penting boleh duduk sama-sama tanpa tengok kerja tiap lima minit.',
    'Makan sama-sama, main sama-sama, sembang pun lain macam bila bukan dalam suasana kerja.',
    'Simple ja sebenarnya, tapi benda macam ni yang nanti paling banyak jadi bahan cerita.',
  ],
  professional: [
    'Aktiviti seperti ini memberi ruang untuk team berinteraksi di luar konteks kerja harian.',
    'Ia juga menjadi sebahagian daripada usaha membina hubungan kerja yang lebih baik secara natural.',
    'Bagi Brutti, budaya team turut menjadi sebahagian daripada perjalanan brand.',
  ],
  hook: [
    'Yang ni bukan cerita jualan. Cuma satu babak sebenar dari kehidupan team Brutti.',
    'Kadang cerita brand yang paling jujur datang dari benda yang berlaku di luar kerja.',
    'Bila suasana berubah, kita nampak sisi team yang jarang masuk dalam feed.',
  ],
  cta: [
    'Masing-masing mungkin balik dengan cerita kegemaran yang lain-lain.',
    'Ada yang ingat games, ada yang ingat makan, ada juga yang mungkin ingat part paling santai.',
    'Yang penting, ada moment yang boleh dibawa balik bersama bila rutin kerja sambung semula.',
  ],
}

const activityClosers = {
  balanced: [
    'Balik kerja nanti, sekurang-kurangnya ada juga cerita baru mau dibawa balik. 😄',
    'Yang penting, dua hari ni kami kasi ruang untuk jadi team di luar rutin biasa juga.',
  ],
  engaging: [
    'Kalau kamu, retreat paling penting makan dulu ka games dulu? 😆',
    'Kalau satu team outing, kamu jenis join semua games atau cari tempat duduk dulu? 😄',
  ],
  casual: [
    'Esok-esok kalau ada inside joke baru, faham-faham ja la. 😆',
    'Lepas ni sambung kerja balik — tapi kali ni ada bahan cerita lebih sikit la.',
  ],
  professional: [
    'Dua hari yang sederhana, tetapi bermakna untuk perjalanan team Brutti.',
    'Semoga masa seperti ini membantu team kembali kepada rutin dengan hubungan yang lebih kuat.',
  ],
  hook: [
    'Kadang satu cerita baru memang bermula bila kita keluar sekejap dari rutin.',
    'Yang ini kami simpan sebagai satu lagi bab kecil dalam perjalanan Brutti.',
  ],
  cta: [
    'Kalau kamu pernah join team retreat, moment apa yang paling susah lupa?',
    'Team kamu kalau outing, siapa biasanya paling awal excited? 😄',
  ],
}

const variationProfiles = [
  {
    hook: 'Bila tengok balik, dua hari macam ni mungkin nampak simple — tapi ada benda yang kita bawa balik sama-sama.',
    support: 'Kadang moment yang tidak dirancang sangat tu la yang paling senang tinggal dalam ingatan.',
    closer: 'Yang ni kami simpan sebagai salah satu cerita kecil team Brutti. 🌿',
  },
  {
    hook: 'Kalau satu team sudah keluar ramai-ramai, memang ada ja cerita dia. 😄',
    support: 'Games, makan-makan dan sembang di luar kerja biasanya cukup untuk keluarkan sisi lain masing-masing.',
    closer: 'Kalau lepas ni banyak inside joke baru, kamu tau la dari mana datang dia. 😆',
  },
  {
    hook: 'Retreat ni bukan sekadar tukar tempat — yang penting masa yang team dapat luang sama-sama.',
    support: 'Bila rutin kerja berhenti sekejap, ada ruang untuk kenal orang di sebelah kita dengan cara yang lain.',
    closer: 'Balik nanti, kerja sambung macam biasa. Tapi hopefully team balik dengan connection yang lebih kuat.',
  },
]

function stableChoice(value, length) {
  if (!length) return 0
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash) % length
}

function rotate(items, offset) {
  if (!items.length) return []
  const start = ((offset % items.length) + items.length) % items.length
  return [...items.slice(start), ...items.slice(0, start)]
}

function uniqueLines(lines, limit = 11) {
  const seen = new Set()
  const result = []
  for (const line of lines) {
    const next = clean(line)
    if (!next || seen.has(next)) continue
    seen.add(next)
    result.push(next)
    if (result.length >= limit) break
  }
  return result
}

function adaptTeamActivityDraft(draft, form, mode, variation) {
  if (!isTeamActivity(form)) return draft

  const facts = activityFacts(form.brief)
  const seed = `${form.title}|${form.brief}|${mode}|${variation}`
const profile = variationProfiles[Math.min(Math.max(variation, 0), variationProfiles.length - 1)]
const activeMode = mode
const hookPool = activityHooks[activeMode] || activityHooks.balanced
const supportPool = activitySupport[activeMode] || activitySupport.balanced
const closerPool = activityClosers[activeMode] || activityClosers.balanced

const useVersionProfile = variation > 0 && mode === 'balanced'

let hook = useVersionProfile
  ? profile.hook
  : hookPool[
      (stableChoice(`${seed}|hook`, hookPool.length) + variation) %
        hookPool.length
    ]
  const factOffset = variation > 0 ? variation : stableChoice(`${seed}|facts`, Math.max(facts.length, 1))
  const orderedFacts = rotate(facts, factOffset)

let supportLines = useVersionProfile
  ? [profile.support]
  : rotate(
      supportPool,
      stableChoice(`${seed}|support`, supportPool.length) + variation,
    )

 let closer = useVersionProfile
  ? profile.closer
  : closerPool[
      (stableChoice(`${seed}|closer`, closerPool.length) + variation) %
        closerPool.length
    ]

  if (mode === 'professional' && variation === 0) {
    supportLines = supportLines.slice(0, 2)
  }

  if (mode === 'shorten' && variation === 0) {
    hook = 'Dua hari keluar dari rutin kerja. 🌿'
    supportLines = ['Makan, games dan masa bersama — simple, tapi cukup untuk tukar suasana.']
    closer = 'Lepas ni sambung kerja balik dengan cerita baru pula.'
  }

  if (mode === 'hook' && variation === 0) {
    supportLines = supportLines.slice(0, 2)
  }

  if (mode === 'cta' && variation === 0) {
    supportLines = supportLines.slice(0, 2)
  }

  const maxLines = mode === 'shorten' && variation === 0 ? 7 : 11
  const body = uniqueLines([hook, ...orderedFacts, ...supportLines, closer], maxLines)

  return body
    .join('\n')
    .replace(/#[\p{L}\p{N}_-]+/gu, '')
    .trim()
}

function applySoulDraft(mode = 'balanced', variation = 0, attempt = 0) {
  const page = activeStudio()
  if (!page) return
  const form = readForm(page)
  if (!clean(form.title) || !clean(form.brief)) return
  const output = page.querySelector('.output-editor-label textarea')
  if (!output) {
    if (attempt < 4) window.setTimeout(() => applySoulDraft(mode, variation, attempt + 1), 45 + attempt * 35)
    return
  }
  const soulDraft = buildSoulDraft(form, mode, variation)
  setReactValue(output, adaptTeamActivityDraft(soulDraft, form, mode, variation))
}

function syncContentDirection(page) {
  const form = page.querySelector('.generator-form')
  if (!form) return

  const oldGuide = form.querySelector('.soul-caption-direction-guide')
  if (oldGuide) oldGuide.remove()

  const headingCopy = form.querySelector('.form-section-head p')
  if (headingCopy) {
    headingCopy.textContent = 'Full Brutti Soul Master digunakan sebagai source untuk susun caption mengikut jenis cerita — produk, team, aktiviti, customer, brand atau promosi.'
  }

  const brief = field(page, 'Verified facts / direction', 'textarea')
  if (brief) {
    brief.placeholder = 'Masukkan fakta sebenar yang sudah confirm. Untuk produk/project: siapa, apa, fungsi, proses atau sebab ia penting. Untuk team/event/aktiviti: siapa terlibat, tempat, tempoh, aktiviti, moment lucu / jujur dan apa yang berlaku. Soul Master akan susun gaya caption tanpa mereka fakta atau memaksa unsur jualan.'
  }

  const polishRow = form.querySelector('.brief-polish-row')
  if (polishRow) polishRow.style.display = 'none'
}

function syncStudioSourceRules() {
  const page = activeStudio()
  if (!page || !soulSourceReady) return

  syncContentDirection(page)

  const hashtagCheckbox = page.querySelector('.checkbox-row input[type="checkbox"]')
  if (hashtagCheckbox?.checked) hashtagCheckbox.click()
  const hashtagRow = hashtagCheckbox?.closest('.checkbox-row')
  if (hashtagRow) hashtagRow.style.display = 'none'

  const hashtagButton = [...page.querySelectorAll('.rewrite-actions button')]
    .find((button) => /hashtag/i.test(button.textContent || ''))
  if (hashtagButton) hashtagButton.style.display = 'none'

  const sourceLabel = page.querySelector('.smart-rewrite-head > span')
  if (sourceLabel) sourceLabel.textContent = `${SOUL_SOURCE_LABEL} · No API`
}

function rewriteMode(button) {
  const label = clean(button.textContent)
  if (/engaging/i.test(label)) return 'engaging'
  if (/casual/i.test(label)) return 'casual'
  if (/professional/i.test(label)) return 'professional'
  if (/shorter/i.test(label)) return 'shorten'
  if (/hook/i.test(label)) return 'hook'
  if (/cta/i.test(label)) return 'cta'
  return 'balanced'
}

let activeRewriteMode = 'balanced'

export default function BruttiSoulStudioEnhancer() {
  useEffect(() => {
    if (!soulSourceReady) return undefined

    let syncTimer = 0
    const scheduleSync = () => {
      window.clearTimeout(syncTimer)
      syncTimer = window.setTimeout(syncStudioSourceRules, 40)
    }

    const onClick = (event) => {
      const button = event.target.closest?.('button')
      if (!button) return

     if (button.closest('.rewrite-actions')) {
  const mode = rewriteMode(button)

  if (mode !== 'hook' && mode !== 'cta') {
    activeRewriteMode = mode
  }

  window.setTimeout(
    () => applySoulDraft(mode, 0),
    35,
  )

return
}

if (button.closest('.nav-link') || button.closest('.tab-bar')) scheduleSync()
}

const onSubmit = (event) => {
  if (!event.target.matches?.('.generator-form')) return
  window.setTimeout(() => applySoulDraft('balanced', 0), 35)
  window.setTimeout(syncStudioSourceRules, 90)
}

scheduleSync()
document.addEventListener('click', onClick, true)
document.addEventListener('submit', onSubmit, true)
    return () => {
      window.clearTimeout(syncTimer)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
    }
  }, [])

  return null
}
