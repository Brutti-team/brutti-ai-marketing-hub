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
  return /buat caption|susun caption|gaya caption|tone|bukan hard sell|jangan hard sell|tidak hard sell|fokus (pada|kepada)|gunakan gaya|tulis dalam|ayat santai|berbentuk recap|macam kita bercakap|cara penulisan/i.test(line)
}

function isSellingOrProductLine(line) {
  return /\bpiece\b|\bproduk\b|\bproduct\b|\bfurniture\b|\bcustomer\b|\bclient\b|\bpelanggan\b|\border\b|\bruang\b|\bsolution\b|mesej ja|mesej kami|roger ja|detail dia lebih lanjut|mau bincang/i.test(line)
}

const activityHooks = [
  'Dua hari ni, kami tukar suasana sekejap. 🌿',
  'Kali ni cerita Brutti bukan dari workshop dulu.',
  'Ada masa kerja sama-sama, ada masa keluar dari rutin sama-sama juga.',
  'Bukan semua cerita Brutti kena pasal furniture — yang ni pasal team kami pula. 👀',
]

const activitySupport = [
  'Kadang-kadang keluar sekejap dari rutin pun bagi ruang untuk team duduk dan luang masa sama-sama.',
  'Yang kami mau simpan dari moment macam ni bukan ayat corporate — cukup cerita apa yang betul-betul berlaku.',
  'Bagi kami, orang di belakang Brutti pun sebahagian daripada cerita brand ni.',
  'Moment macam ni simple, tapi tetap jadi sebahagian daripada perjalanan team Brutti.',
]

const activityClosers = [
  'Balik kerja nanti, sekurang-kurangnya ada juga cerita baru mau dibawa balik. 😄',
  'Yang penting, dua hari ni kami kasi ruang untuk jadi team di luar rutin biasa juga.',
  'Kadang cerita yang paling senang diingat memang datang dari moment macam ni.',
  'Kalau kamu, retreat paling penting makan dulu ka games dulu? 😆',
]

function stableChoice(value, length) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash) % length
}

function adaptTeamActivityDraft(draft, form, mode, variation) {
  if (!isTeamActivity(form)) return draft

  const originalLines = String(draft || '')
    .split(/\n+/)
    .map(clean)
    .filter(Boolean)

  const seed = `${form.title}|${form.brief}|${mode}|${variation}`
  let hookIndex = stableChoice(seed, activityHooks.length)
  if (mode === 'hook') hookIndex = (hookIndex + 1) % activityHooks.length
  let hook = activityHooks[hookIndex]
  if (mode === 'casual') hook = `Nah, ${hook.charAt(0).toLowerCase()}${hook.slice(1)}`
  if (mode === 'engaging') hook = `Kamu pernah juga tunggu moment macam ni ka? ${hook}`
  if (mode === 'professional') hook = hook.replace('kami tukar suasana sekejap', 'kami mengambil masa seketika di luar rutin biasa')

  const kept = originalLines
    .slice(1)
    .filter((line) => !isDirectionLine(line))
    .filter((line) => !isSellingOrProductLine(line))

  const body = [hook, ...kept]
  const supportOffset = stableChoice(`${seed}|support`, activitySupport.length)
  for (let index = 0; index < activitySupport.length && body.length < (mode === 'shorten' ? 6 : 8); index += 1) {
    const line = activitySupport[(supportOffset + index) % activitySupport.length]
    if (!body.includes(line)) body.push(line)
  }

  const closerOffset = mode === 'cta' ? 1 : 0
  const closer = activityClosers[(stableChoice(`${seed}|closer`, activityClosers.length) + closerOffset) % activityClosers.length]
  body.push(closer)

  const unique = []
  for (const line of body) {
    const next = clean(line)
    if (!next || unique.includes(next)) continue
    unique.push(next)
  }

  return unique
    .slice(0, mode === 'shorten' ? 7 : 11)
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
        window.setTimeout(() => applySoulDraft(mode, 0), 35)
        return
      }

      if (button.closest('.variation-row')) {
        const match = clean(button.textContent).match(/(\d+)/)
        const variation = Math.max(0, Number(match?.[1] || 1) - 1)
        window.setTimeout(() => applySoulDraft('balanced', variation), 35)
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