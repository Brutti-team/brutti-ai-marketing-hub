import { useEffect } from 'react'

function enhanceAssetLibrary() {
  const page = [...document.querySelectorAll('#root .page')]
    .find((item) => item.offsetParent !== null && item.querySelector('.page-header h1')?.textContent?.trim() === 'Asset Library')
  if (!page) return

  const helper = page.querySelector('.asset-upgrade-helper')
  if (!helper || page.querySelector('.asset-staging-safety')) return

  const note = document.createElement('div')
  note.className = 'asset-staging-safety'
  note.innerHTML = `
    <span><strong>Google Drive</strong><small>Ready untuk attach ke Content Studio.</small></span>
    <span><strong>Local staging</strong><small>Preview & organise sahaja; fail Drive tidak berubah.</small></span>
    <span><strong>Hide / delete</strong><small>Hide asset Drive tidak memadam fail asal.</small></span>
  `
  helper.insertAdjacentElement('afterend', note)
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
