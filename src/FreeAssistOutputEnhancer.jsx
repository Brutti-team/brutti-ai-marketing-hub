import { useEffect } from 'react'
import { buildFastSaveDraft, fastSaveEngineMeta } from './lib/fastSaveAssistEngine'

const WEEKDAY_TIMING = {
  0: { label: 'Sunday', slots: [10, 21, 18, 11, 16, 19], confidence: 'Low' },
  1: { label: 'Monday', slots: [10, 13, 11, 9, 17, 19], confidence: 'Medium' },
  2: { label: 'Tuesday', slots: [21, 9, 10, 14, 17, 11], confidence: 'Medium' },
  3: { label: 'Wednesday', slots: [10, 19, 11, 12, 17, 9], confidence: 'Medium' },
  4: { label: 'Thursday', slots: [11, 8, 12, 19, 10, 9, 21], confidence: 'Medium' },
  5: { label: 'Friday', slots: [21, 12, 9, 18, 15, 13, 14], confidence: 'Medium' },
  6: { label: 'Saturday', slots: [20, 9, 19, 17, 10, 11], confidence: 'Low' },
}

const MIN_LEAD_MINUTES = 35
let activeRewriteMode = 'balanced'
let activeVariation = 0

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

function readForm(page) {
  return {
    title: field(page, 'Content title', 'input')?.value || '',
    platform: field(page, 'Platform', 'select')?.value || 'Facebook',
    type: field(page, 'Content type', 'select')?.value || 'Brand Awareness',
    product: field(page, 'Product', 'select')?.value || 'General / No Product',
    language: field(page, 'Language', 'select')?.value || 'Bahasa Melayu',
    tone: field(page, 'Tone', 'select')?.value || 'Brutti Sabahan Casual',
    brief: field(page, 'Verified facts / direction', 'textarea')?.value || '',
    assetName: page.querySelector('.selected-asset small')?.textContent?.trim() || '',
  }
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

function rewriteMode(button) {
  const label = clean(button?.textContent)
  if (/engaging/i.test(label)) return 'engaging'
  if (/casual/i.test(label)) return 'casual'
  if (/professional/i.test(label)) return 'professional'
  if (/shorter/i.test(label)) return 'shorten'
  if (/hook/i.test(label)) return 'hook'
  if (/cta/i.test(label)) return 'cta'
  if (/hashtag/i.test(label)) return 'hashtags'
  return 'balanced'
}

function applyFastSaveDraft(mode = activeRewriteMode, variation = activeVariation, attempt = 0) {
  const page = activeStudio()
  if (!page) return
  const form = readForm(page)
  if (!clean(form.title) || !clean(form.brief)) return
  const textarea = page.querySelector('.output-editor-label textarea')
  if (!textarea) {
    if (attempt < 7) window.setTimeout(() => applyFastSaveDraft(mode, variation, attempt + 1), 45 + attempt * 25)
    return
  }

  const draft = buildFastSaveDraft(form, mode, variation)
  if (!draft) return
  setReactValue(textarea, draft)

  const meta = fastSaveEngineMeta(form, mode, variation)
  const outputPanel = page.querySelector('.generator-output')
  if (outputPanel) {
    outputPanel.dataset.assistEngine = meta.engine
    outputPanel.dataset.legacyTemplateBankUsed = 'false'
  }

  const sourceLabel = page.querySelector('.smart-rewrite-head > span')
  if (sourceLabel) sourceLabel.textContent = 'Fast Save Assist Engine · Brutti Soul Master · No paid AI API'
}

function nextPostingTime() {
  const now = new Date()
  const cutoff = new Date(now.getTime() + MIN_LEAD_MINUTES * 60 * 1000)
  let date = new Date(now)
  date.setHours(0, 0, 0, 0)

  for (let offset = 0; offset < 8; offset += 1) {
    const day = new Date(date)
    day.setDate(day.getDate() + offset)
    const stats = WEEKDAY_TIMING[day.getDay()]
    const ranked = stats.slots
      .map((hour, rank) => {
        const slot = new Date(day)
        slot.setHours(hour, 0, 0, 0)
        return { hour, rank, slot }
      })
      .filter((item) => offset > 0 || item.slot >= cutoff)
      .sort((a, b) => a.rank - b.rank)

    if (!ranked.length) continue
    const selected = ranked[0]
    const end = new Date(selected.slot.getTime() + 60 * 60 * 1000)
    const dateLabel = offset === 0 ? 'Hari ini' : offset === 1 ? 'Esok' : selected.slot.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'short' })
    const time = selected.slot.toLocaleTimeString('en-MY', { hour: 'numeric', minute: '2-digit', hour12: true })
    const endTime = end.toLocaleTimeString('en-MY', { hour: 'numeric', minute: '2-digit', hour12: true })
    return {
      label: `${dateLabel} · ${time}`,
      detail: `${stats.label} historical activity window ${time}–${endTime} · ${stats.confidence} confidence`,
    }
  }

  return {
    label: 'Semak Campaign Planner',
    detail: 'Gunakan Historical Smart Timing sebelum schedule.',
  }
}

function directionFor(form) {
  const product = form.product && form.product !== 'General / No Product' ? form.product : ''
  const subject = product ? product : form.title || 'cerita Brutti'
  const language = form.language === 'English' ? 'English' : form.language === 'BM + English' ? 'BM + English' : 'Bahasa Melayu'
  const asset = form.assetName ? ` Gunakan visual approved “${form.assetName}”.` : ''
  return `Buat ${form.type} untuk ${form.platform} tentang ${subject}. Gunakan verified facts sebagai fakta utama dan Brutti Soul Master sebagai voice + guardrail. Tulis dalam ${language}.${asset} Jangan tambah harga, promosi, stok, delivery, ukuran, KPI atau claim yang tidak disahkan.`
}

function hashtagsFor(form) {
  const tags = ['#BRUTTI', '#ProudlySabahan']
  const text = clean(`${form.title} ${form.product} ${form.type} ${form.brief}`).toLowerCase()

  if (form.product && form.product !== 'General / No Product') tags.push('#FurnitureSabah')
  else if (/behind the scenes|retreat|team|staff|aktiviti|activity|workshop/.test(text)) tags.push('#BehindTheScenes')
  else tags.push('#SabahBrand')

  if (/custom|bespoke/.test(text)) tags.push('#CustomFurnitureSabah')
  else if (/educational|tip|tips|cara|panduan/.test(text)) tags.push('#BruttiTips')
  else tags.push('#BikinSampaiJadi')

  return [...new Set(tags)].slice(0, 4).join(' ')
}

function makeSection(className, number, title) {
  const section = document.createElement('section')
  section.className = `free-assist-section ${className}`
  section.innerHTML = `<div class="free-assist-section-head"><span>${number}</span><strong>${title}</strong></div>`
  return section
}

function ensureStructure(page) {
  const outputPanel = page.querySelector('.generator-output.has-output')
  const captionLabel = outputPanel?.querySelector('.output-editor-label')
  if (!outputPanel || !captionLabel) return

  const form = readForm(page)
  const textarea = captionLabel.querySelector('textarea')
  if (!textarea?.value?.trim()) return

  let direction = outputPanel.querySelector('.free-assist-direction')
  if (!direction) {
    direction = makeSection('free-assist-direction', '01', 'Apa perlu buat')
    const body = document.createElement('p')
    body.className = 'free-assist-direction-copy'
    direction.append(body)
    captionLabel.insertAdjacentElement('beforebegin', direction)
  }
  direction.querySelector('.free-assist-direction-copy').textContent = directionFor(form)

  let captionHead = outputPanel.querySelector('.free-assist-caption-head')
  if (!captionHead) {
    captionHead = document.createElement('div')
    captionHead.className = 'free-assist-section-head free-assist-caption-head'
    captionHead.innerHTML = '<span>02</span><strong>Caption</strong>'
    captionLabel.insertAdjacentElement('beforebegin', captionHead)
  }

  const labelText = [...captionLabel.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
  if (labelText) labelText.textContent = 'Editable Facebook caption · 7–13 content lines'

  let hashtags = outputPanel.querySelector('.free-assist-hashtags')
  if (!hashtags) {
    hashtags = makeSection('free-assist-hashtags', '03', 'Hashtag')
    const body = document.createElement('p')
    body.className = 'free-assist-hashtag-copy'
    hashtags.append(body)
    captionLabel.insertAdjacentElement('afterend', hashtags)
  }
  hashtags.querySelector('.free-assist-hashtag-copy').textContent = hashtagsFor(form)

  let timing = outputPanel.querySelector('.free-assist-posting-time')
  if (!timing) {
    timing = makeSection('free-assist-posting-time', '04', 'Cadangan masa posting')
    const primary = document.createElement('strong')
    primary.className = 'free-assist-time-primary'
    const detail = document.createElement('small')
    detail.className = 'free-assist-time-detail'
    const note = document.createElement('small')
    note.className = 'free-assist-time-note'
    note.textContent = 'Berdasarkan historical Facebook reaction activity Brutti; ini bukan live Meta Insights.'
    timing.append(primary, detail, note)
    hashtags.insertAdjacentElement('afterend', timing)
  }

  const posting = nextPostingTime()
  timing.querySelector('.free-assist-time-primary').textContent = posting.label
  timing.querySelector('.free-assist-time-detail').textContent = posting.detail

  let engineNote = outputPanel.querySelector('.fast-save-engine-note')
  if (!engineNote) {
    engineNote = document.createElement('p')
    engineNote.className = 'fast-save-engine-note'
    outputPanel.querySelector('.output-toolbar')?.insertAdjacentElement('afterend', engineNote)
  }
  engineNote.textContent = 'Generated by Fast Save Assist Engine · verified facts + Brutti Soul Master · legacy caption template bank bypassed.'
}

function sync() {
  const page = activeStudio()
  if (!page) return
  ensureStructure(page)
}

export default function FreeAssistOutputEnhancer() {
  useEffect(() => {
    let timer = 0
    const schedule = (delay = 45) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, delay)
    }

    const observer = new MutationObserver(() => schedule(40))
    observer.observe(document.getElementById('root'), { childList: true, subtree: true })

    const onInput = (event) => {
      if (event.target.closest?.('.generator-form, .generator-output')) schedule(25)
    }

    const onSubmit = (event) => {
      if (!event.target.matches?.('.generator-form')) return
      activeRewriteMode = 'balanced'
      activeVariation = 0
      window.setTimeout(() => applyFastSaveDraft('balanced', 0), 120)
      window.setTimeout(sync, 170)
    }

    const onClick = (event) => {
      const button = event.target.closest?.('button')
      if (button?.closest('.rewrite-actions')) {
        const mode = rewriteMode(button)
        if (mode !== 'hook' && mode !== 'cta' && mode !== 'hashtags') activeRewriteMode = mode
        window.setTimeout(() => applyFastSaveDraft(mode, activeVariation), 120)
      } else if (button?.closest('.variation-row')) {
        const match = clean(button.textContent).match(/(\d+)/)
        activeVariation = Math.max(0, Number(match?.[1] || 1) - 1)
        window.setTimeout(() => applyFastSaveDraft(activeRewriteMode, activeVariation), 120)
      }

      if (event.target.closest?.('.nav-link, .tab-bar, .rewrite-actions, .variation-row, .generator-form, .generator-output')) schedule(155)
    }

    document.addEventListener('input', onInput, true)
    document.addEventListener('change', onInput, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)
    sync()

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('change', onInput, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
    }
  }, [])

  return null
}
