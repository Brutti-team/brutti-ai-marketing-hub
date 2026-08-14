import { useEffect } from 'react'

const PENDING_KEY = 'brutti-pending-product-image'

const repairedMappings = {
  'ahtam xl shelving rack': {
    product: 'AHTAM XL Shelving Rack',
    fileId: '1ZdI0nH5DBHLVlnAUu_Nygdo_yvm9WTrz',
    fileName: 'AHTAM-XL-Shelving-Rack.jpg',
    view: 'Front View',
  },
  'barn door': {
    product: 'BARN DOOR',
    fileId: '13MyKl4WBrUhPU00s4kAnb2siKBNFsFxb',
    fileName: 'BARN-DOOR.jpg',
    view: 'Front View',
  },
  'puloUdopuan 2.0 kitchen island'.toLowerCase(): {
    product: 'PULOUDOPUAN 2.0 Kitchen Island',
    fileId: '1nCo8zDhFincpQTnGU2APFRi9O8B0ab7k',
    fileName: 'PULOUDOPUAN-2-Kitchen-Island.jpg',
    view: 'Side / End View',
  },
  'ayyash wall rack': {
    product: 'AYYASH Wall Rack',
    fileId: '1wbB4ixz8plt26C_dYN3WlWiYSdLF8Yjv',
    fileName: 'AYYASH-Wall-Rack.jpg',
    view: 'Front View',
  },
}

function normalize(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase()
}

function mappingFor(name) {
  const mapping = repairedMappings[normalize(name)]
  if (!mapping) return null
  return {
    ...mapping,
    driveLink: `https://drive.google.com/file/d/${mapping.fileId}/view`,
  }
}

function thumbnailUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1000`
}

function fallbackUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`
}

function repairCard(card) {
  const product = card.querySelector('h3')?.textContent?.trim() || ''
  const mapping = mappingFor(product)
  if (!mapping) return

  const visual = card.querySelector('.product-visual')
  const image = visual?.querySelector('.product-real-image')
  if (image && image.dataset.repairedFileId !== mapping.fileId) {
    image.dataset.repairedFileId = mapping.fileId
    image.src = thumbnailUrl(mapping.fileId)
    image.onerror = () => {
      if (image.dataset.repairedFallback === '1') return
      image.dataset.repairedFallback = '1'
      image.src = fallbackUrl(mapping.fileId)
    }
  }

  const badge = visual?.querySelector('.photo-status')
  if (badge) badge.textContent = `${mapping.view} · Confirmed`
}

export default function ProductImageMappingRepair() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => root.querySelectorAll('.product-card').forEach(repairCard)

    const correctPendingMapping = (event) => {
      const button = event.target?.closest?.('button')
      if (!button || !/create product content/i.test(button.textContent || '')) return
      const card = button.closest('.product-card')
      const product = card?.querySelector('h3')?.textContent?.trim() || ''
      const mapping = mappingFor(product)
      if (!mapping) return
      window.setTimeout(() => {
        window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(mapping))
      }, 0)
    }

    sync()
    root.addEventListener('click', correctPendingMapping)
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true, characterData: true })

    return () => {
      root.removeEventListener('click', correctPendingMapping)
      observer.disconnect()
    }
  }, [])

  return null
}
