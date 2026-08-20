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

function syncContentDirection(page) {
  const form = page.querySelector('.generator-form')
  if (!form) return

  const oldGuide = form.querySelector('.soul-caption-direction-guide')
  if (oldGuide) oldGuide.remove()

  const headingCopy = form.querySelector('.form-section-head p')
  if (headingCopy) {
    headingCopy.textContent = 'Full Brutti Soul Master digunakan sebagai source untuk susun caption.'
  }

  const brief = field(page, 'Verified facts / direction', 'textarea')
  if (brief) {
    brief.placeholder = 'Masukkan fakta sebenar yang sudah confirm: siapa / apa, piece atau project, masalah atau keperluan, detail proses, sebab ia penting, dan momen lucu / jujur jika ada. Soul Master akan susun gaya caption tanpa mereka fakta.'
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
