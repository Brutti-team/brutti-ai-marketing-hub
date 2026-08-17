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
    const sync = () => {
      document.title = normalizeBrandCase(document.title)
      document
        .querySelectorAll('meta[name="description"], meta[name="apple-mobile-web-app-title"]')
        .forEach((meta) => {
          const content = meta.getAttribute('content')
          if (content?.includes('BRUTTI')) meta.setAttribute('content', normalizeBrandCase(content))
        })
      normalizeVisibleText(document.body)
    }

    let timer = 0
    const schedule = (delay = 80) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, delay)
    }
    const scheduleBurst = () => {
      schedule(60)
      window.setTimeout(sync, 320)
    }

    const onClick = (event) => {
      if (event.target.closest?.('button, a')) scheduleBurst()
    }
    const onSubmit = () => scheduleBurst()
    const onChange = () => schedule(100)

    sync()
    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)
    document.addEventListener('change', onChange, true)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('change', onChange, true)
    }
  }, [])

  return null
}
