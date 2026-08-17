import { useEffect } from 'react'

const normalizeBrandCase = (value = '') => value.replace(/\bBRUTTI\b/g, 'Brutti')

function normalizeElementAttributes(element) {
  if (!(element instanceof Element)) return

  ;['placeholder', 'aria-label', 'title', 'alt'].forEach((attribute) => {
    const value = element.getAttribute(attribute)
    if (value?.includes('BRUTTI')) element.setAttribute(attribute, normalizeBrandCase(value))
  })
}

function normalizeVisibleText(root) {
  if (!root) return

  if (root.nodeType === Node.TEXT_NODE) {
    const parent = root.parentElement
    if (!parent?.closest('script, style') && root.nodeValue?.includes('BRUTTI')) {
      root.nodeValue = normalizeBrandCase(root.nodeValue)
    }
    return
  }

  if (!(root instanceof Element) && root !== document.body) return

  if (root instanceof Element) normalizeElementAttributes(root)

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const textNode = walker.currentNode
    const parent = textNode.parentElement
    if (!parent?.closest('script, style') && textNode.nodeValue?.includes('BRUTTI')) {
      textNode.nodeValue = normalizeBrandCase(textNode.nodeValue)
    }
  }

  root.querySelectorAll?.('[placeholder], [aria-label], [title], [alt]').forEach(normalizeElementAttributes)
}

export default function BrandCasingEnhancer() {
  useEffect(() => {
    document.title = normalizeBrandCase(document.title)

    document
      .querySelectorAll('meta[name="description"], meta[name="apple-mobile-web-app-title"]')
      .forEach((meta) => {
        const content = meta.getAttribute('content')
        if (content?.includes('BRUTTI')) meta.setAttribute('content', normalizeBrandCase(content))
      })

    normalizeVisibleText(document.body)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') normalizeVisibleText(mutation.target)
        if (mutation.type === 'childList') mutation.addedNodes.forEach(normalizeVisibleText)
        if (mutation.type === 'attributes') normalizeElementAttributes(mutation.target)
      })
    })

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'],
    })

    return () => observer.disconnect()
  }, [])

  return null
}
