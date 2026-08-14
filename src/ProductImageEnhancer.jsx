import { useEffect } from 'react'
import { hasWorkspaceKey, loadWorkspace, saveGoogleContent } from './lib/googleWorkspace'

const PENDING_KEY = 'brutti-pending-product-image'

const productImages = [
  {
    product: 'AHTAM XL Shelving Rack',
    fileId: '1ZdI0nH5DBHLVlnAUu_Nygdo_yvm9WTrz',
    fileName: 'AHTAM-XL-Shelving-Rack.jpg',
    view: 'Front View',
    driveLink: 'https://drive.google.com/file/d/1ZdI0nH5DBHLVlnAUu_Nygdo_yvm9WTrz/view',
  },
  {
    product: 'LOFT BED',
    fileId: '1tqh62---fZ1phYwkqK9rBsOPHFsoIdwB',
    fileName: 'LOFT-BED.jpg',
    view: 'Angled / Three-quarter View',
    driveLink: 'https://drive.google.com/file/d/1tqh62---fZ1phYwkqK9rBsOPHFsoIdwB/view',
  },
  {
    product: 'BARN DOOR',
    fileId: '13MyKl4WBrUhPU00s4kAnb2siKBNFsFxb',
    fileName: 'BARN-DOOR.jpg',
    view: 'Front View',
    driveLink: 'https://drive.google.com/file/d/13MyKl4WBrUhPU00s4kAnb2siKBNFsFxb/view',
  },
  {
    product: 'DAY BED',
    fileId: '1BxzHJ3yz88nvK_PHiOpHGfwsXokwr4yf',
    fileName: 'DAY-BED.jpg',
    view: 'Angled Side View',
    driveLink: 'https://drive.google.com/file/d/1BxzHJ3yz88nvK_PHiOpHGfwsXokwr4yf/view',
  },
  {
    product: 'PULOUDOPUAN 2.0 Kitchen Island',
    fileId: '1nCo8zDhFincpQTnGU2APFRi9O8B0ab7k',
    fileName: 'PULOUDOPUAN-2-Kitchen-Island.jpg',
    view: 'Side / End View',
    driveLink: 'https://drive.google.com/file/d/1nCo8zDhFincpQTnGU2APFRi9O8B0ab7k/view',
  },
  {
    product: 'AYYASH Wall Rack',
    fileId: '1wbB4ixz8plt26C_dYN3WlWiYSdLF8Yjv',
    fileName: 'AYYASH-Wall-Rack.jpg',
    view: 'Front View',
    driveLink: 'https://drive.google.com/file/d/1wbB4ixz8plt26C_dYN3WlWiYSdLF8Yjv/view',
  },
  {
    product: 'Dangsanak Table',
    fileId: '1hppzcBdhLIKYgKZntOLtC2TFCknqG4EO',
    fileName: 'DANGSANAK-Table.jpg',
    view: 'Angled / Three-quarter View',
    driveLink: 'https://drive.google.com/file/d/1hppzcBdhLIKYgKZntOLtC2TFCknqG4EO/view',
  },
  {
    product: 'KINOSUSUAN Baby Cot',
    fileId: '1MQl_i8eWooBbTkie73o9v-lnvduaOQ2L',
    fileName: 'KINOSUSUAN-Baby-Cot.jpg',
    view: 'Angled Front View',
    driveLink: 'https://drive.google.com/file/d/1MQl_i8eWooBbTkie73o9v-lnvduaOQ2L/view',
  },
  {
    product: 'MOGIDADAMOT 2.0 Learning Tower',
    fileId: '19XAPqKUgEaxUgzK-m-9tsz4J9wVO-kmz',
    fileName: 'MOGIDADAMOT-2-Learning-Tower.jpg',
    view: 'Angled Front/Side View',
    driveLink: 'https://drive.google.com/file/d/19XAPqKUgEaxUgzK-m-9tsz4J9wVO-kmz/view',
  },
  {
    product: 'MONOCOLO Dining Table',
    fileId: '1oGJ3JI47W5hnigYVZU5VI309D2fqFCvE',
    fileName: 'MONOCOLO-Dining-Table.jpg',
    view: 'Angled / Three-quarter View',
    driveLink: 'https://drive.google.com/file/d/1oGJ3JI47W5hnigYVZU5VI309D2fqFCvE/view',
  },
]

function normalize(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase()
}

function imageForProduct(name) {
  const key = normalize(name)
  return productImages.find((item) => normalize(item.product) === key) || null
}

function thumbnailUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1000`
}

function fallbackImageUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`
}

function activePageByTitle(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('h1')?.textContent?.trim() === title) || null
}

function readPending() {
  try {
    return JSON.parse(window.sessionStorage.getItem(PENDING_KEY) || 'null')
  } catch {
    return null
  }
}

function writePending(mapping) {
  window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(mapping))
}

function clearPending() {
  window.sessionStorage.removeItem(PENDING_KEY)
}

function bindOnce(element, key, handler, options) {
  if (!element || element.dataset[key] === '1') return
  element.dataset[key] = '1'
  element.addEventListener('click', handler, options)
}

function attachDriveImage(img, mapping, visual) {
  let fallbackTried = false
  img.addEventListener('load', () => {
    visual.classList.add('has-real-product-image')
    visual.classList.remove('product-image-unavailable')
  })
  img.addEventListener('error', () => {
    if (!fallbackTried) {
      fallbackTried = true
      img.src = fallbackImageUrl(mapping.fileId)
      return
    }
    visual.classList.remove('has-real-product-image')
    visual.classList.add('product-image-unavailable')
    img.remove()
  })
  img.src = thumbnailUrl(mapping.fileId)
}

function enhanceProductCards(page) {
  page.querySelectorAll('.product-card').forEach((card) => {
    const productName = card.querySelector('h3')?.textContent?.trim() || ''
    const mapping = imageForProduct(productName)
    if (!mapping) return

    const visual = card.querySelector('.product-visual')
    if (!visual) return

    if (!visual.querySelector('.product-real-image')) {
      const img = document.createElement('img')
      img.className = 'product-real-image'
      img.alt = `${mapping.product} product photo`
      img.loading = 'lazy'
      img.decoding = 'async'
      attachDriveImage(img, mapping, visual)
      visual.prepend(img)
    }

    const badge = visual.querySelector('.photo-status')
    const badgeText = `${mapping.view} · Confirmed`
    if (badge && badge.textContent !== badgeText) badge.textContent = badgeText

    const createButton = [...card.querySelectorAll('button')]
      .find((button) => /create product content/i.test(button.textContent || ''))
    bindOnce(createButton, 'productImageBridge', () => writePending(mapping), true)
  })
}

function productSelectOn(page) {
  return [...page.querySelectorAll('label')]
    .find((label) => /^Product/i.test(label.textContent || ''))
    ?.querySelector('select') || null
}

function createSelectedVisual(page, mapping, productLabel) {
  const existing = page.querySelector('.selected-asset:not(.product-confirmed-visual)')
  if (existing) return

  let panel = page.querySelector('.product-confirmed-visual')
  if (!panel) {
    panel = document.createElement('div')
    panel.className = 'selected-asset product-confirmed-visual'
    panel.innerHTML = `
      <img class="product-confirmed-thumb" alt="" />
      <span><strong>Confirmed product visual</strong><small></small></span>
      <button type="button">Remove</button>
    `
    const image = panel.querySelector('img')
    image.src = thumbnailUrl(mapping.fileId)
    image.alt = `${mapping.product} confirmed product visual`
    image.addEventListener('error', () => { image.style.display = 'none' })
    panel.querySelector('small').textContent = `${mapping.fileName} · ${mapping.view}`
    panel.querySelector('button').addEventListener('click', () => {
      clearPending()
      panel.remove()
    })
    productLabel.insertAdjacentElement('afterend', panel)
  }
}

function patchLocalDraft(title, mapping) {
  try {
    const items = JSON.parse(window.localStorage.getItem('brutti-content-v2') || '[]')
    const index = items.findIndex((item) => normalize(item.title) === normalize(title)
      && normalize(item.product) === normalize(mapping.product))
    if (index < 0 || items[index].driveFileId) return
    items[index] = {
      ...items[index],
      driveFileId: mapping.fileId,
      assetName: mapping.fileName,
      driveLink: mapping.driveLink,
    }
    window.localStorage.setItem('brutti-content-v2', JSON.stringify(items))
  } catch {
    // Local storage is best-effort only. Shared Google data remains the source of truth when connected.
  }
}

async function syncSavedContentImage(title, mapping) {
  patchLocalDraft(title, mapping)
  if (!hasWorkspaceKey()) return

  try {
    const workspace = await loadWorkspace()
    const item = (workspace.content || []).find((record) => normalize(record.title) === normalize(title)
      && normalize(record.product) === normalize(mapping.product))
    if (!item || item.driveFileId) return
    await saveGoogleContent({
      ...item,
      driveFileId: mapping.fileId,
      assetName: mapping.fileName,
      driveLink: mapping.driveLink,
    })
  } catch {
    // Keep the normal Content Studio save flow usable even if the optional image-link sync is unavailable.
  }
}

function enhanceContentStudio(page) {
  const mapping = readPending()
  const productSelect = productSelectOn(page)
  if (!mapping || !productSelect) {
    page.querySelector('.product-confirmed-visual')?.remove()
    return
  }

  if (normalize(productSelect.value) !== normalize(mapping.product)) {
    page.querySelector('.product-confirmed-visual')?.remove()
    return
  }

  const productLabel = productSelect.closest('label')
  if (productLabel) createSelectedVisual(page, mapping, productLabel)

  if (productSelect.dataset.productImageChange !== '1') {
    productSelect.dataset.productImageChange = '1'
    productSelect.addEventListener('change', () => {
      const current = readPending()
      if (current && normalize(productSelect.value) !== normalize(current.product)) {
        clearPending()
        page.querySelector('.product-confirmed-visual')?.remove()
      }
    })
  }

  const saveButton = [...page.querySelectorAll('button')]
    .find((button) => /^Save as draft$/i.test(button.textContent?.trim() || ''))
  bindOnce(saveButton, 'productImageSaveBridge', () => {
    const title = page.querySelector('input[placeholder*="product highlight"]')?.value?.trim()
      || page.querySelector('.generator-form input[required]')?.value?.trim()
      || ''
    if (!title) return
    window.setTimeout(() => syncSavedContentImage(title, mapping), 700)
  })
}

function enhanceContentEditor(root) {
  const modal = root.querySelector('.content-modal')
  if (!modal || modal.dataset.productImageEditor === '1') return

  const productText = [...modal.querySelectorAll('.content-meta span')]
    .map((span) => span.textContent?.trim() || '')
    .find((value) => imageForProduct(value))
  const mapping = imageForProduct(productText)
  if (!mapping) return

  modal.dataset.productImageEditor = '1'
  const meta = modal.querySelector('.content-meta')
  if (meta && !/Visual:/i.test(meta.textContent || '')) {
    const visualMeta = document.createElement('span')
    visualMeta.className = 'product-image-meta'
    visualMeta.textContent = `Visual: ${mapping.fileName}`
    meta.appendChild(visualMeta)
  }

  const title = modal.querySelector('.modal-head h2')?.textContent?.trim() || ''
  if (title) syncSavedContentImage(title, mapping)
}

export default function ProductImageEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const productPage = activePageByTitle('Product Library')
      if (productPage) enhanceProductCards(productPage)

      const studioPage = activePageByTitle('Content Studio')
      if (studioPage) enhanceContentStudio(studioPage)

      enhanceContentEditor(root)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
