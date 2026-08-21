import { useEffect } from 'react'
import ContentStudioV2Enhancer from './ContentStudioV2Enhancer'
import { applyBruttiSoulPolicy, soulHashtagStatus, soulPolicyLabel } from './lib/contentStudioSoulPolicy'

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

function soulLockOutput(applyCaption = true) {
  const page = activeStudio()
  if (!page) return

  const outputPanel = page.querySelector('.generator-output.has-output')
  if (!outputPanel) return

  const textarea = outputPanel.querySelector('.output-editor-label textarea')
  if (applyCaption && textarea?.value) {
    const form = readForm(page)
    const next = applyBruttiSoulPolicy(textarea.value, form)
    if (next && next !== textarea.value) setReactValue(textarea, next)
  }

  const hashtagCopy = outputPanel.querySelector('.free-assist-hashtag-copy')
  if (hashtagCopy) hashtagCopy.textContent = soulHashtagStatus()

  const hashtagHeading = outputPanel.querySelector('.free-assist-hashtags .free-assist-section-head strong')
  if (hashtagHeading) hashtagHeading.textContent = 'Hashtag · Soul Master rule'

  const sourceLabel = outputPanel.querySelector('.smart-rewrite-head > span')
  if (sourceLabel) sourceLabel.textContent = 'Content Studio Engine V2 · Brutti Soul Master · Soul locked'

  const engineNote = outputPanel.querySelector('.content-studio-v2-engine-note')
  if (engineNote && !engineNote.textContent.includes('Soul locked')) engineNote.textContent += ' · Soul locked'

  let soulNote = outputPanel.querySelector('.content-studio-soul-policy-note')
  if (!soulNote) {
    soulNote = document.createElement('small')
    soulNote.className = 'content-studio-soul-policy-note'
    soulNote.style.cssText = 'display:block;margin-top:8px;opacity:.66;line-height:1.45;'
    engineNote?.insertAdjacentElement('afterend', soulNote)
  }
  if (soulNote) soulNote.textContent = soulPolicyLabel()
}

export default function ContentStudioController() {
  useEffect(() => {
    let timer = 0
    const schedule = (delay = 180, applyCaption = true) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => soulLockOutput(applyCaption), delay)
    }

    const onSubmit = (event) => {
      if (!event.target.matches?.('.generator-form')) return
      schedule(190, true)
    }

    const onClick = (event) => {
      const button = event.target.closest?.('button')
      if (button?.closest('.rewrite-actions, .variation-row')) schedule(190, true)
      else if (button?.closest('.nav-link, .mobile-bottom-navigation')) schedule(120, false)
    }

    const onChange = (event) => {
      if (event.target.matches?.('select') && event.target.closest?.('.generator-form')) schedule(80, false)
    }

    const root = document.getElementById('root')
    const observer = new MutationObserver(() => schedule(80, false))
    if (root) observer.observe(root, { childList: true, subtree: true })

    document.addEventListener('submit', onSubmit, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('change', onChange, true)
    schedule(80, false)

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('change', onChange, true)
    }
  }, [])

  return <ContentStudioV2Enhancer />
}
