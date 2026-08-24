import { useEffect } from 'react'
import { buildSoulDraft } from './lib/bruttiSoulSource'

const STYLE_ID = 'brutti-soul-caption-stabilizer-style'
const STABILIZING_ATTR = 'data-brutti-caption-stabilizing'

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    html[${STABILIZING_ATTR}='true'] .generator-output.has-output .output-editor-label textarea {
      visibility: hidden !important;
    }
  `
  document.head.append(style)
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

function setStabilizing(active) {
  if (active) document.documentElement.setAttribute(STABILIZING_ATTR, 'true')
  else document.documentElement.removeAttribute(STABILIZING_ATTR)
}

function finish() {
  window.requestAnimationFrame(() => setStabilizing(false))
}

function applySoulDraft(variation = 0, attempt = 0) {
  const page = activeStudio()
  if (!page) {
    finish()
    return
  }

  const form = readForm(page)
  if (!clean(form.title) || !clean(form.brief) || form.language !== 'Bahasa Melayu') {
    finish()
    return
  }

  const textarea = page.querySelector('.output-editor-label textarea')
  if (!textarea) {
    if (attempt < 10) {
      window.setTimeout(() => applySoulDraft(variation, attempt + 1), 20 + attempt * 15)
      return
    }
    finish()
    return
  }

  try {
    const draft = buildSoulDraft(form, 'balanced', Math.max(0, Math.min(2, variation)))
    if (draft) {
      setReactValue(textarea, draft)
      const panel = page.querySelector('.generator-output')
      if (panel) {
        panel.dataset.captionEngine = 'brutti-soul-master'
        panel.dataset.captionVersion = String(Math.max(1, Math.min(3, variation + 1)))
      }
    }
  } finally {
    finish()
  }
}

function selectedVersion(button) {
  const match = clean(button?.textContent).match(/Version\s*(\d+)/i)
  return Math.max(0, Math.min(2, Number(match?.[1] || 1) - 1))
}

export default function SoulCaptionStabilizer() {
  useEffect(() => {
    ensureStyle()
    let safetyTimer = 0

    const armSafetyReveal = () => {
      window.clearTimeout(safetyTimer)
      safetyTimer = window.setTimeout(() => setStabilizing(false), 650)
    }

    const onSubmit = (event) => {
      if (!event.target.matches?.('.generator-form')) return
      const page = activeStudio()
      const form = page ? readForm(page) : null
      if (!form || form.language !== 'Bahasa Melayu') return
      setStabilizing(true)
      armSafetyReveal()
      window.setTimeout(() => applySoulDraft(0), 0)
    }

    const onClick = (event) => {
      const button = event.target.closest?.('.variation-row button')
      if (!button) return
      const page = activeStudio()
      const form = page ? readForm(page) : null
      if (!form || form.language !== 'Bahasa Melayu') return
      setStabilizing(true)
      armSafetyReveal()
      const variation = selectedVersion(button)
      window.setTimeout(() => applySoulDraft(variation), 0)
    }

    document.addEventListener('submit', onSubmit, true)
    document.addEventListener('click', onClick, true)

    return () => {
      window.clearTimeout(safetyTimer)
      setStabilizing(false)
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
