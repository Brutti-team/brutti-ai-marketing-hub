import { useEffect } from 'react'

function activeSettingsPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('h1')?.textContent?.trim() === 'Settings') || null
}

function syncMetaStatus(page) {
  const row = [...page.querySelectorAll('.connections-list article')]
    .find((article) => article.querySelector('strong')?.textContent?.trim() === 'Meta / Facebook')
  if (!row) return

  const status = row.querySelector('.status-pill')
  if (!status) return

  const detail = row.querySelector('p')
  if (detail) detail.textContent = 'Facebook publishing is paused. Keep approved content in BRUTTI and post manually until verified Meta access is ready.'
  status.textContent = 'Deferred'
  status.className = 'status-pill archived'
}

export default function MetaDeferredEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const page = activeSettingsPage()
      if (page) syncMetaStatus(page)
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  return null
}
