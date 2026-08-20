import { useEffect } from 'react'

const PRODUCT_ACRONYMS = new Set(['XL', 'TV', 'M', 'L', 'ID'])

function activeProductPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('h1')?.textContent?.trim() === 'Product Library') || null
}

function formatProductDisplayName(value = '') {
  return String(value || '')
    .split(/(\s+|[-–—/])/)
    .map((part) => {
      if (!part || /^\s+$/.test(part) || /^[-–—/]$/.test(part)) return part
      if (PRODUCT_ACRONYMS.has(part.toUpperCase())) return part.toUpperCase()
      if (/^\d+(?:\.\d+)?$/.test(part)) return part
      if (/^[A-ZÀ-ÖØ-Þ0-9'.]+$/.test(part) && /[A-ZÀ-ÖØ-Þ]/.test(part)) {
        const lower = part.toLocaleLowerCase('en-MY')
        return lower.charAt(0).toLocaleUpperCase('en-MY') + lower.slice(1)
      }
      return part
    })
    .join('')
}

function syncProductNameCasing(page) {
  page.querySelectorAll('.product-card h3').forEach((heading) => {
    const current = heading.textContent?.trim() || ''
    const formatted = formatProductDisplayName(current)
    if (formatted && formatted !== current) heading.textContent = formatted
  })
}

function syncProductCatalogCopy(page) {
  syncProductNameCasing(page)

  const countText = page.querySelector('.source-count')?.textContent || ''
  const count = Number((countText.match(/\d+/) || [0])[0])
  if (count !== 84) return

  const description = page.querySelector('.page-header p')
  if (description) {
    description.textContent = 'Only products with sufficient verified details are shown. A confirmed photo is optional; available price, material and dimensions come from the current BRUTTI product source.'
  }

  const syncButton = [...page.querySelectorAll('.page-actions button')]
    .find((button) => /sync notion products/i.test(button.textContent || ''))
  if (syncButton) {
    syncButton.textContent = 'Curated catalog active'
    syncButton.disabled = true
    syncButton.title = 'Incomplete source rows are intentionally excluded from the website catalog.'
  }

  const notice = page.querySelector('.source-notice')
  if (notice) {
    const heading = notice.querySelector('strong')
    const copy = notice.querySelector('p')
    if (heading) heading.textContent = 'Curated product source loaded'
    if (copy) copy.textContent = '84 products with verified core details are available. Incomplete source records are intentionally excluded; products may still appear without a confirmed image.'
  }
}

export default function ProductCatalogQualityEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const page = activeProductPage()
      if (page) syncProductCatalogCopy(page)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
