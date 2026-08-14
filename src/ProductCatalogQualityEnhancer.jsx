import { useEffect } from 'react'

function activeProductPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('h1')?.textContent?.trim() === 'Product Library') || null
}

function syncProductCatalogCopy(page) {
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
