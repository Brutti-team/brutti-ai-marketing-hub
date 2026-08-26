import { useEffect } from 'react'
import { buildBruttiCaptionV3 } from './lib/bruttiCaptionEngineV3'

const STYLE_ID = 'brutti-soul-caption-stabilizer-style'
const STABILIZING_ATTR = 'data-brutti-caption-stabilizing'
const HISTORY_KEY = 'brutti-caption-v3-structure-history'

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function supportedLanguage(language = '') {
  return language === 'Bahasa Melayu' || language === 'BM + English'
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

function readStructureHistory() {
  try {
    const value = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(value) ? value.slice(-20) : []
  } catch {
    return []
  }
}

function rememberStructure(meta) {
  if (!meta?.inputKey || !meta?.structure) return
  try {
    const history = readStructureHistory().filter((item) => item?.inputKey !== meta.inputKey)
    history.push({ inputKey: meta.inputKey, structure: meta.structure, pillar: meta.storyPillar })
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-20)))
  } catch {
    // Structure history is optional.
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

function applyCaptionV3(variation = 0, attempt = 0) {
  const page = activeStudio()
  if (!page) {
    finish()
    return
  }

  const form = readForm(page)
  if (!clean(form.title) || !clean(form.brief) || !supportedLanguage(form.language)) {
    finish()
    return
  }

  const textarea = page.querySelector('.output-editor-label textarea')
  if (!textarea) {
    if (attempt < 10) {
      window.setTimeout(() => applyCaptionV3(variation, attempt + 1), 20 + attempt * 15)
      return
    }
    finish()
    return
  }

  try {
    const version = Math.max(0, Math.min(2, variation))
    const result = buildBruttiCaptionV3(form, version, { recentStructures: readStructureHistory() })
    if (!result.copy) return

    // Lightweight mode: Caption Engine V3 already performs verified-claim checks.
    // Soul Master stays as a reference inside the engine, but the final caption is no
    // longer forced through extra Soul-policy + fact-first rewrite layers.
    setReactValue(textarea, result.copy)
    rememberStructure(result.meta)

    const panel = page.querySelector('.generator-output')
    if (panel) {
      panel.dataset.captionEngine = 'brutti-caption-engine-v3-light'
      panel.dataset.captionVersion = String(result.meta.version)
      panel.dataset.captionStoryPillar = result.meta.storyPillar
      panel.dataset.captionStoryStructure = result.meta.structure
      panel.dataset.captionQuality = result.report.pass ? 'guarded' : 'review'
      panel.dataset.captionVoiceRefined = result.refined ? 'true' : 'false'
      panel.dataset.captionQualityFallback = result.fallback ? 'true' : 'false'
      panel.dataset.captionIntegrityGuard = 'verified-claims'
      panel.dataset.captionFinalPolish = 'single-pass'
      panel.dataset.captionStyleMode = 'soft-reference'
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
      safetyTimer = window.setTimeout(() => setStabilizing(false), 500)
    }

    const onSubmit = (event) => {
      if (!event.target.matches?.('.generator-form')) return
      const page = activeStudio()
      const form = page ? readForm(page) : null
      if (!form || !supportedLanguage(form.language)) return
      setStabilizing(true)
      armSafetyReveal()
      window.setTimeout(() => applyCaptionV3(0), 0)
    }

    const onClick = (event) => {
      const button = event.target.closest?.('.variation-row button')
      if (!button) return
      const page = activeStudio()
      const form = page ? readForm(page) : null
      if (!form || !supportedLanguage(form.language)) return
      setStabilizing(true)
      armSafetyReveal()
      window.setTimeout(() => applyCaptionV3(selectedVersion(button)), 0)
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
