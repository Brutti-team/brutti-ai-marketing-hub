import { useEffect } from 'react'
import { buildLiveNarrativeDraft, validateLiveNarrativeDraft } from './lib/liveCaptionNarrativeEngine'

let activeMode = 'balanced'
let activeVariation = 0
let rewriteCycle = 0

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
    brief: field(page, 'Verified facts / direction', 'textarea')?.value || field(page, 'Verified facts', 'textarea')?.value || '',
  }
}

function setReactValue(element, value) {
  if (!element || !value || element.value === value) return
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
  if (setter) setter.call(element, value)
  else element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function modeForButton(button) {
  const label = clean(button?.textContent)
  if (/^More$/i.test(label) || /engaging/i.test(label)) return 'engaging'
  if (/shorter/i.test(label)) return 'shorten'
  if (/hook/i.test(label)) return 'hook'
  if (/cta/i.test(label)) return 'cta'
  if (/casual/i.test(label)) return 'casual'
  if (/professional/i.test(label)) return 'professional'
  return 'balanced'
}

function applyNarrativeDraft(mode = activeMode, variation = activeVariation, cycle = rewriteCycle, attempt = 0) {
  const page = activeStudio()
  if (!page) return

  const form = readForm(page)
  if (!clean(form.title) || !clean(form.brief)) return
  if (form.language === 'English' || form.language === 'BM + English') return

  const textarea = page.querySelector('.output-editor-label textarea')
  if (!textarea) {
    if (attempt < 8) window.setTimeout(() => applyNarrativeDraft(mode, variation, cycle, attempt + 1), 45 + attempt * 25)
    return
  }

  const fallback = textarea.value
  try {
    const draft = buildLiveNarrativeDraft(form, mode, variation, cycle)
    if (!draft || !validateLiveNarrativeDraft(draft, form.brief, mode)) return
    setReactValue(textarea, draft)
    const outputPanel = page.querySelector('.generator-output')
    if (outputPanel) {
      outputPanel.dataset.captionEngine = 'natural-narrative-v1'
      outputPanel.dataset.captionFallbackAvailable = fallback ? 'true' : 'false'
    }
  } catch {
    // Fail open: keep the existing App.jsx caption untouched.
  }
}

export default function LiveCaptionNarrativeEnhancer() {
  useEffect(() => {
    const onSubmit = (event) => {
      if (!event.target.matches?.('.generator-form')) return
      activeMode = 'balanced'
      activeVariation = 0
      rewriteCycle = 0
      window.setTimeout(() => applyNarrativeDraft('balanced', 0, 0), 180)
    }

    const onClick = (event) => {
      const button = event.target.closest?.('button')
      if (!button) return

      if (button.closest('.rewrite-actions')) {
        const mode = modeForButton(button)
        if (mode === 'hook' || mode === 'cta') rewriteCycle += 1
        else rewriteCycle = 0
        if (mode !== 'hook' && mode !== 'cta') activeMode = mode
        window.setTimeout(() => applyNarrativeDraft(mode, activeVariation, rewriteCycle), 180)
        return
      }

      if (button.closest('.variation-row')) {
        const match = clean(button.textContent).match(/Version\s*(\d+)/i)
        activeVariation = Math.max(0, Math.min(2, Number(match?.[1] || 1) - 1))
        activeMode = 'balanced'
        rewriteCycle = 0
        window.setTimeout(() => applyNarrativeDraft('balanced', activeVariation, 0), 180)
      }
    }

    document.addEventListener('submit', onSubmit, true)
    document.addEventListener('click', onClick, true)

    return () => {
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
