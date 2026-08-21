import { useEffect } from 'react'

function safetyMarkup(language) {
  if (language === 'en') {
    return `
      <span><strong>Google Drive</strong><small>Ready to attach to Content Studio.</small></span>
      <span><strong>Local staging</strong><small>Preview and organise only; Drive files are unchanged.</small></span>
      <span><strong>Hide / delete</strong><small>Hiding a Drive asset does not delete the original file.</small></span>
    `
  }
  return `
    <span><strong>Google Drive</strong><small>Sedia untuk attach ke Content Studio.</small></span>
    <span><strong>Local staging</strong><small>Preview dan susun sahaja; fail Drive tidak berubah.</small></span>
    <span><strong>Hide / delete</strong><small>Hide asset Drive tidak memadam fail asal.</small></span>
  `
}

function enhanceAssetLibrary() {
  const page = [...document.querySelectorAll('#root .page')]
    .find((item) => item.offsetParent !== null && item.querySelector('.page-header h1')?.textContent?.trim() === 'Asset Library')
  if (!page) return

  const helper = page.querySelector('.asset-upgrade-helper')
  if (!helper) return

  let note = page.querySelector('.asset-staging-safety')
  if (!note) {
    note = document.createElement('div')
    note.className = 'asset-staging-safety'
    helper.insertAdjacentElement('afterend', note)
  }

  const markup = safetyMarkup(document.documentElement.dataset.appLanguage || 'bm')
  if (note.innerHTML !== markup) note.innerHTML = markup
}

export default function AssetLibrarySafetyEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined
    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(enhanceAssetLibrary, 70)
    }
    enhanceAssetLibrary()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [])

  return null
}
