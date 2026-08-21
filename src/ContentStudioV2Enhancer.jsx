import { useEffect } from 'react'
import {
  buildContentStudioDirection,
  buildContentStudioDraft,
  buildContentStudioHashtags,
  contentStudioEngineMeta,
} from './lib/contentStudioEngineV2'

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
let activeMode = 'balanced'
let activeVariation = 0
let controls = {
  objective: 'Auto',
  audience: 'Homeowners, customers & Brutti followers in Sabah',
  angle: 'Auto',
  direction: '',
  keyMessage: '',
  ctaGoal: 'Auto',
}

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
    brief: field(page, 'Verified facts', 'textarea')?.value || field(page, 'Verified facts / direction', 'textarea')?.value || '',
    assetName: page.querySelector('.selected-asset small')?.textContent?.trim() || '',
  }
}

function setReactValue(element, value) {
  if (!element || element.value === value) return
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
  return 'balanced'
}

function nextPostingTime() {
  const now = new Date()
  const cutoff = new Date(now.getTime() + MIN_LEAD_MINUTES * 60 * 1000)
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  for (let offset = 0; offset < 8; offset += 1) {
    const day = new Date(start)
    day.setDate(day.getDate() + offset)
    const stats = WEEKDAY_TIMING[day.getDay()]
    const candidates = stats.slots
      .map((hour, rank) => {
        const slot = new Date(day)
        slot.setHours(hour, 0, 0, 0)
        return { slot, hour, rank }
      })
      .filter((item) => offset > 0 || item.slot >= cutoff)
      .sort((a, b) => a.rank - b.rank)

    if (!candidates.length) continue
    const selected = candidates[0]
    const end = new Date(selected.slot.getTime() + 60 * 60 * 1000)
    const dateLabel = offset === 0 ? 'Hari ini' : offset === 1 ? 'Esok' : selected.slot.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'short' })
    const time = selected.slot.toLocaleTimeString('en-MY', { hour: 'numeric', minute: '2-digit', hour12: true })
    const endTime = end.toLocaleTimeString('en-MY', { hour: 'numeric', minute: '2-digit', hour12: true })
    return {
      label: `${dateLabel} · ${time}`,
      detail: `${stats.label} historical activity window ${time}–${endTime} · ${stats.confidence} confidence`,
    }
  }

  return { label: 'Semak Campaign Planner', detail: 'Gunakan Historical Smart Timing sebelum schedule.' }
}

function option(value, label = value) {
  return `<option value="${value}">${label}</option>`
}

function injectStrategyControls(page) {
  const form = page.querySelector('.generator-form')
  if (!form) return

  const briefLabel = [...form.querySelectorAll('label')]
    .find((item) => clean(item.textContent).startsWith('Verified facts / direction') || clean(item.textContent).startsWith('Verified facts'))
  if (!briefLabel) return

  const textNode = [...briefLabel.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
  if (textNode) textNode.textContent = 'Verified facts'
  const brief = briefLabel.querySelector('textarea')
  if (brief) brief.placeholder = 'Masukkan fakta yang sudah confirm sahaja — produk, event, customer, proses, material, fungsi atau detail sebenar.'

  if (!form.querySelector('.content-studio-v2-controls')) {
    const panel = document.createElement('section')
    panel.className = 'content-studio-v2-controls'
    panel.innerHTML = `
      <div class="content-studio-v2-head">
        <span>Strategy input</span>
        <strong>Bagi engine context yang cukup</strong>
        <small>Fakta dan arahan dipisahkan supaya caption lebih tepat dan kurang generic.</small>
      </div>
      <div class="content-studio-v2-grid">
        <label>Objective<select data-v2="objective">
          ${option('Auto')}${option('Awareness')}${option('Engagement')}${option('Education')}${option('Trust')}${option('Consideration')}${option('Conversion')}
        </select></label>
        <label>Content angle<select data-v2="angle">
          ${option('Auto')}${option('Storytelling')}${option('Problem → Solution')}${option('Practical Tip')}${option('Human / Behind the Scenes')}${option('Customer Journey')}${option('Offer + Reason to Act')}
        </select></label>
        <label>CTA goal<select data-v2="ctaGoal">
          ${option('Auto')}${option('Natural CTA')}${option('Comment / Reply')}${option('WhatsApp / DM')}${option('Save')}${option('Share')}
        </select></label>
      </div>
      <label>Target audience<input data-v2="audience" type="text" placeholder="e.g. Homeowners di Sabah yang sedang susun ruang"/></label>
      <label>Key message<input data-v2="keyMessage" type="text" placeholder="Satu benda utama yang orang mesti ingat selepas baca"/></label>
      <label>Content direction<textarea data-v2="direction" rows="3" placeholder="Contoh: fokus pada fungsi sebenar, santai, jangan hard sell, bagi orang rasa relatable."></textarea></label>
    `
    briefLabel.insertAdjacentElement('beforebegin', panel)
  }

  const panel = form.querySelector('.content-studio-v2-controls')
  panel.querySelectorAll('[data-v2]').forEach((input) => {
    const key = input.dataset.v2
    if (document.activeElement !== input && input.value !== controls[key]) input.value = controls[key]
  })

  const oldHashtagRow = form.querySelector('.checkbox-row')
  if (oldHashtagRow) oldHashtagRow.style.display = 'none'

  const disclaimers = [...form.querySelectorAll('.form-disclaimer')]
  const engineDisclaimer = disclaimers.find((item) => /No paid AI API/i.test(item.textContent))
  if (engineDisclaimer) engineDisclaimer.innerHTML = 'Content Studio Engine V2 menggunakan verified facts + strategy input + Brutti Soul Master. Tiada paid AI API; human review masih wajib sebelum publish.'

  const headingCopy = form.querySelector('.form-section-head p')
  if (headingCopy) headingCopy.textContent = 'Masukkan fakta sebenar dahulu, kemudian bagi objective dan direction secara berasingan.'
}

function makeSection(className, number, title) {
  const section = document.createElement('section')
  section.className = `free-assist-section ${className}`
  section.innerHTML = `<div class="free-assist-section-head"><span>${number}</span><strong>${title}</strong></div>`
  return section
}

function ensureOutputStructure(page, form) {
  const outputPanel = page.querySelector('.generator-output.has-output')
  const captionLabel = outputPanel?.querySelector('.output-editor-label')
  if (!outputPanel || !captionLabel) return

  let direction = outputPanel.querySelector('.free-assist-direction')
  if (!direction) {
    direction = makeSection('free-assist-direction', '01', 'Apa perlu buat')
    const copy = document.createElement('p')
    copy.className = 'free-assist-direction-copy'
    direction.append(copy)
    captionLabel.insertAdjacentElement('beforebegin', direction)
  }
  direction.querySelector('.free-assist-direction-copy').textContent = buildContentStudioDirection(form, controls)

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
    const copy = document.createElement('p')
    copy.className = 'free-assist-hashtag-copy'
    hashtags.append(copy)
    captionLabel.insertAdjacentElement('afterend', hashtags)
  }
  hashtags.querySelector('.free-assist-hashtag-copy').textContent = buildContentStudioHashtags(form, controls)

  let timing = outputPanel.querySelector('.free-assist-posting-time')
  if (!timing) {
    timing = makeSection('free-assist-posting-time', '04', 'Cadangan masa posting')
    timing.innerHTML += '<strong class="free-assist-time-primary"></strong><small class="free-assist-time-detail"></small><small class="free-assist-time-note">Berdasarkan historical Facebook reaction activity Brutti; ini bukan live Meta Insights.</small>'
    hashtags.insertAdjacentElement('afterend', timing)
  }
  const posting = nextPostingTime()
  timing.querySelector('.free-assist-time-primary').textContent = posting.label
  timing.querySelector('.free-assist-time-detail').textContent = posting.detail

  let engineNote = outputPanel.querySelector('.content-studio-v2-engine-note')
  if (!engineNote) {
    engineNote = document.createElement('p')
    engineNote.className = 'content-studio-v2-engine-note'
    outputPanel.querySelector('.output-toolbar')?.insertAdjacentElement('afterend', engineNote)
  }
  const meta = contentStudioEngineMeta(form, controls, activeMode, activeVariation)
  engineNote.textContent = `${meta.engine} · ${meta.strategy.objective} · ${meta.strategy.angle} · verified facts: ${meta.verifiedFactCount}`

  const sourceLabel = outputPanel.querySelector('.smart-rewrite-head > span')
  if (sourceLabel) sourceLabel.textContent = 'Content Studio Engine V2 · Brutti Soul Master · Single final-output engine'

  const hashtagButton = [...outputPanel.querySelectorAll('.rewrite-actions button')].find((button) => /hashtag/i.test(button.textContent))
  if (hashtagButton) hashtagButton.style.display = 'none'
}

function applyV2Draft(mode = activeMode, variation = activeVariation, attempt = 0) {
  const page = activeStudio()
  if (!page) return
  const form = readForm(page)
  if (!clean(form.title) || !clean(form.brief)) return
  const textarea = page.querySelector('.output-editor-label textarea')
  if (!textarea) {
    if (attempt < 8) window.setTimeout(() => applyV2Draft(mode, variation, attempt + 1), 45 + attempt * 30)
    return
  }

  const draft = buildContentStudioDraft(form, controls, mode, variation)
  if (!draft) return
  setReactValue(textarea, draft)
  ensureOutputStructure(page, form)
}

function sync() {
  const page = activeStudio()
  if (!page) return
  injectStrategyControls(page)
  const form = readForm(page)
  if (page.querySelector('.generator-output.has-output')) ensureOutputStructure(page, form)
}

export default function ContentStudioV2Enhancer() {
  useEffect(() => {
    let timer = 0
    const schedule = (delay = 45) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, delay)
    }

    const root = document.getElementById('root')
    const observer = new MutationObserver(() => schedule(40))
    if (root) observer.observe(root, { childList: true, subtree: true })

    const onInput = (event) => {
      const key = event.target?.dataset?.v2
      if (key) {
        controls = { ...controls, [key]: event.target.value }
        schedule(20)
        return
      }
      if (event.target.closest?.('.generator-form, .generator-output')) schedule(35)
    }

    const onSubmit = (event) => {
      if (!event.target.matches?.('.generator-form')) return
      activeMode = 'balanced'
      activeVariation = 0
      window.setTimeout(() => applyV2Draft('balanced', 0), 110)
      window.setTimeout(sync, 170)
    }

    const onClick = (event) => {
      const button = event.target.closest?.('button')
      if (button?.closest('.rewrite-actions')) {
        const mode = rewriteMode(button)
        activeMode = mode === 'hook' || mode === 'cta' ? activeMode : mode
        window.setTimeout(() => applyV2Draft(mode, activeVariation), 110)
      } else if (button?.closest('.variation-row')) {
        const match = clean(button.textContent).match(/(\d+)/)
        activeVariation = Math.max(0, Number(match?.[1] || 1) - 1)
        activeMode = 'balanced'
        window.setTimeout(() => applyV2Draft('balanced', activeVariation), 110)
      }
      schedule(150)
    }

    document.addEventListener('input', onInput, true)
    document.addEventListener('change', onInput, true)
    document.addEventListener('submit', onSubmit, true)
    document.addEventListener('click', onClick, true)
    sync()

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('change', onInput, true)
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
