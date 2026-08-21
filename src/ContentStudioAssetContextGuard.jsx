import { useEffect } from 'react'

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function activeStudio() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('.page-header h1')?.textContent?.trim() === 'Content Studio') || null
}

function syncAssetGuard() {
  const page = activeStudio()
  if (!page) return

  const selected = page.querySelector('.selected-asset')
  const existing = page.querySelector('.content-studio-asset-context-guard')

  if (!selected) {
    existing?.remove()
    return
  }

  const assetName = clean(selected.querySelector('small')?.textContent)
  const strong = selected.querySelector('strong')
  if (strong) strong.textContent = 'Selected visual · reference only'

  let guard = existing
  if (!guard) {
    guard = document.createElement('div')
    guard.className = 'content-studio-asset-context-guard'
    guard.style.cssText = 'margin-top:8px;padding:10px 12px;border:1px solid color-mix(in srgb,currentColor 13%,transparent);border-radius:10px;display:grid;gap:3px;font-size:12px;line-height:1.45;opacity:.82;'
    selected.insertAdjacentElement('afterend', guard)
  }

  guard.innerHTML = `
    <strong>Visual context guard</strong>
    <span>${assetName ? `Selected: ${assetName}` : 'A visual is selected.'}</span>
    <small>Nama visual boleh digunakan sebagai reference. Content Studio tidak akan menganggap objek, orang, lokasi, aktiviti atau detail dalam gambar/video sebagai fakta kecuali detail itu dimasukkan dalam Verified facts.</small>
  `
}

export default function ContentStudioAssetContextGuard() {
  useEffect(() => {
    let timer = 0
    const schedule = (delay = 60) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(syncAssetGuard, delay)
    }

    const root = document.getElementById('root')
    const observer = new MutationObserver(() => schedule())
    if (root) observer.observe(root, { childList: true, subtree: true, characterData: true })

    const onClick = (event) => {
      if (event.target.closest?.('.nav-link, .mobile-bottom-navigation, .selected-asset, .generator-form')) schedule(80)
    }
    document.addEventListener('click', onClick, true)
    schedule(80)

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
