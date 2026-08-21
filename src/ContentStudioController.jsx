import { useEffect } from 'react'
import ContentStudioV2Enhancer from './ContentStudioV2Enhancer'
import { applyBruttiSoulPolicy, soulHashtagStatus, soulPolicyLabel } from './lib/contentStudioSoulPolicy'
import {
  mergeProductContext,
  productContextBlock,
  productContextMeta,
  resolveVerifiedProduct,
} from './lib/contentStudioProductContext'

let activeSoulMode = 'balanced'
let lastProductBlock = ''
let productSyncToken = 0

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

function fieldLabel(page, labelPrefix) {
  return [...page.querySelectorAll('label')]
    .find((item) => clean(item.textContent).startsWith(labelPrefix)) || null
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

function rewriteMode(button) {
  const label = clean(button?.textContent)
  if (/engaging/i.test(label)) return 'engaging'
  if (/casual/i.test(label)) return 'casual'
  if (/professional/i.test(label)) return 'professional'
  if (/shorter|7 lines/i.test(label)) return 'shorten'
  if (/hook/i.test(label)) return 'hook'
  if (/cta/i.test(label)) return 'cta'
  return 'balanced'
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

function ensureProductContextPanel(page) {
  const productLabel = fieldLabel(page, 'Product')
  if (!productLabel) return null

  let panel = page.querySelector('.content-studio-product-context')
  if (!panel) {
    panel = document.createElement('div')
    panel.className = 'content-studio-product-context'
    panel.style.cssText = 'margin-top:-2px;padding:10px 12px;border:1px solid color-mix(in srgb,currentColor 13%,transparent);border-radius:10px;display:grid;gap:3px;font-size:12px;line-height:1.45;opacity:.82;'
    panel.innerHTML = '<strong>Verified product context</strong><span data-product-context-copy>Pilih produk untuk semak fakta verified yang boleh digunakan.</span><small data-product-context-source></small>'
    productLabel.insertAdjacentElement('afterend', panel)
  }
  return panel
}

function updateProductContextPanel(page, productName, record) {
  const panel = ensureProductContextPanel(page)
  if (!panel) return
  const copy = panel.querySelector('[data-product-context-copy]')
  const source = panel.querySelector('[data-product-context-source]')

  if (!productName || productName === 'General / No Product') {
    if (copy) copy.textContent = 'General content — tiada product facts ditambah.'
    if (source) source.textContent = 'Source: none'
    return
  }

  if (!record) {
    if (copy) copy.textContent = 'Tiada verified product record ditemui. Masukkan fakta sendiri sebelum generate.'
    if (source) source.textContent = 'Source: not verified'
    return
  }

  const meta = productContextMeta(record)
  if (copy) {
    copy.textContent = meta.nameOnly
      ? 'Nama produk verified. Detail seperti harga, material, dimensi dan warna tidak akan direka.'
      : `${meta.detailCount} detail verified tersedia dan ditambah ke Verified facts bila ada.`
  }
  if (source) source.textContent = `Source: ${meta.source}`
}

async function syncProductContext(page = activeStudio()) {
  if (!page) return
  const productSelect = field(page, 'Product', 'select')
  const brief = field(page, 'Verified facts', 'textarea') || field(page, 'Verified facts / direction', 'textarea')
  if (!productSelect || !brief) return

  const productName = productSelect.value || 'General / No Product'
  const token = ++productSyncToken

  if (productName === 'General / No Product') {
    const nextBrief = mergeProductContext(brief.value, lastProductBlock, '')
    lastProductBlock = ''
    if (nextBrief !== brief.value) setReactValue(brief, nextBrief)
    updateProductContextPanel(page, productName, null)
    return
  }

  const record = await resolveVerifiedProduct(productName)
  if (token !== productSyncToken) return

  const nextBlock = record ? productContextBlock(record) : ''
  const nextBrief = mergeProductContext(brief.value, lastProductBlock, nextBlock)
  lastProductBlock = nextBlock
  if (nextBrief !== brief.value) setReactValue(brief, nextBrief)
  updateProductContextPanel(page, productName, record)
}

function soulLockOutput(applyCaption = true) {
  const page = activeStudio()
  if (!page) return

  const outputPanel = page.querySelector('.generator-output.has-output')
  if (!outputPanel) return
  const form = readForm(page)

  const textarea = outputPanel.querySelector('.output-editor-label textarea')
  if (applyCaption && textarea?.value) {
    const next = applyBruttiSoulPolicy(textarea.value, form, activeSoulMode)
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
  if (soulNote) soulNote.textContent = soulPolicyLabel(form)
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
      activeSoulMode = 'balanced'
      schedule(190, true)
    }

    const onClick = (event) => {
      const button = event.target.closest?.('button')
      if (button?.closest('.rewrite-actions')) {
        activeSoulMode = rewriteMode(button)
        schedule(190, true)
      } else if (button?.closest('.variation-row')) {
        activeSoulMode = 'balanced'
        schedule(190, true)
      } else if (button?.closest('.nav-link, .mobile-bottom-navigation')) {
        schedule(120, false)
        window.setTimeout(() => {
          const page = activeStudio()
          if (page) syncProductContext(page)
        }, 140)
      }
    }

    const onChange = (event) => {
      const page = activeStudio()
      if (!page) return
      const productSelect = field(page, 'Product', 'select')
      if (event.target === productSelect) syncProductContext(page)
      if (event.target.matches?.('select') && event.target.closest?.('.generator-form')) schedule(80, false)
    }

    const root = document.getElementById('root')
    const observer = new MutationObserver(() => {
      schedule(80, false)
      const page = activeStudio()
      if (page) ensureProductContextPanel(page)
    })
    if (root) observer.observe(root, { childList: true, subtree: true })

    document.addEventListener('submit', onSubmit, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('change', onChange, true)
    schedule(80, false)
    window.setTimeout(() => syncProductContext(activeStudio()), 120)

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
