import { useEffect } from 'react'
import { BRUTTI_SOUL, SOUL_SOURCE_LABEL, buildSoulDraft, soulSourceReady } from './lib/bruttiSoulSource'

const CAPTION_GUIDE = [
  ['HOOK', 'Mula dengan babak, nombor atau nama — bukan label produk, “New Product Alert” atau ayat promo.'],
  ['VOICE', 'First person: aku / sia / kami. Bunyi macam kawan bercerita; Sabahan colloquial + sikit English, bukan corporate.'],
  ['STRUCTURE', 'Ayat pendek satu-satu baris. Guna jeda bila perlu, 1–3 emoji sahaja dan tiada hashtag.'],
  ['REAL DETAIL', 'Guna benda yang betul-betul berlaku dan fakta yang sudah confirm. Jangan reka cerita, harga, claim atau detail proses.'],
  ['PEOPLE', 'Kalau cerita artisan, guna nama + latar hanya bila memang diketahui. Elak ayat kosong macam “staff kami sangat berdedikasi”.'],
  ['EMOTION', 'Boleh lucu, jujur, sebak atau syukur — tapi kaitkan emosi dengan sebab yang spesifik, bukan filler.'],
]

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
  setReactValue(output, buildSoulDraft(form, mode, variation))
}

function addCaptionDirectionGuide(page) {
  const form = page.querySelector('.generator-form')
  if (!form || form.querySelector('.soul-caption-direction-guide')) return
  if (!BRUTTI_SOUL.full || !BRUTTI_SOUL.voice || !BRUTTI_SOUL.craft || !BRUTTI_SOUL.checklist) return

  const heading = form.querySelector('.form-section-head')
  const headingCopy = heading?.querySelector('p')
  if (headingCopy) headingCopy.textContent = 'Masukkan fakta sebenar; full Brutti Soul Master akan jadi source untuk susun caption.'

  const brief = field(page, 'Verified facts / direction', 'textarea')
  if (brief) {
    brief.placeholder = 'Masukkan benda sebenar yang berlaku: siapa / apa, piece atau project, masalah atau keperluan, satu detail proses, sebab ia penting, dan momen lucu / jujur jika ada. Jangan tambah fakta yang belum confirm.'
  }

  const polishNote = form.querySelector('.brief-polish-row span')
  if (polishNote) polishNote.textContent = 'Kemaskan wording sahaja. Fakta asal mesti kekal dan tidak boleh direka.'

  const guide = document.createElement('section')
  guide.className = 'soul-caption-direction-guide'
  guide.setAttribute('aria-label', 'Brutti Soul caption guide')
  guide.style.cssText = 'margin:12px 0 18px;padding:14px 16px;border:1px solid rgba(20,74,58,.18);border-radius:16px;background:rgba(238,246,239,.72);display:grid;gap:10px;'

  const top = document.createElement('div')
  top.innerHTML = '<strong style="display:block;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#164a3a">Brutti Soul · Caption Source</strong><span style="display:block;margin-top:4px;font-size:12px;line-height:1.5;opacity:.75">Full .md digunakan sebagai source brand: Origin, Voice, Values, Product, Content Craft, Story Pillars, Vision, Checklist & Golden Examples. Untuk bentuk ayat caption, Voice + Content Craft + Checklist diberi keutamaan.</span>'
  guide.append(top)

  const grid = document.createElement('div')
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;'
  CAPTION_GUIDE.forEach(([label, copy]) => {
    const card = document.createElement('div')
    card.style.cssText = 'padding:9px 10px;border-radius:12px;background:rgba(255,255,255,.62);font-size:12px;line-height:1.45;'
    const key = document.createElement('strong')
    key.textContent = label
    key.style.cssText = 'display:block;margin-bottom:3px;font-size:10px;letter-spacing:.08em;color:#164a3a;'
    const text = document.createElement('span')
    text.textContent = copy
    card.append(key, text)
    grid.append(card)
  })
  guide.append(grid)

  const firstDisclaimer = form.querySelector('.form-disclaimer')
  if (firstDisclaimer) firstDisclaimer.insertAdjacentElement('afterend', guide)
  else heading?.insertAdjacentElement('afterend', guide)
}

function syncStudioSourceRules() {
  const page = activeStudio()
  if (!page || !soulSourceReady) return

  addCaptionDirectionGuide(page)

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
