import { useEffect } from 'react'

const DEFERRED_DETAIL =
  'Facebook publishing is paused. Keep approved content in BRUTTI and post manually until verified Meta access is ready.'

function activeSettingsPage() {
  return [...document.querySelectorAll('#root .page')]
    .find(
      (page) =>
        page.offsetParent !== null &&
        page.querySelector('h1')?.textContent?.trim() === 'Settings',
    ) || null
}

function syncMetaStatus(page) {
  const row = [...page.querySelectorAll('.connections-list article')]
    .find(
      (article) =>
        article.querySelector('strong')?.textContent?.trim() === 'Meta / Facebook',
    )

  if (!row) return

  const status = row.querySelector('.status-pill')
  if (!status) return

  const detail = row.querySelector('p')

  if (detail && detail.textContent !== DEFERRED_DETAIL) {
    detail.textContent = DEFERRED_DETAIL
  }

  if (status.textContent?.trim() !== 'Deferred') {
    status.textContent = 'Deferred'
  }

  if (status.className !== 'status-pill archived') {
    status.className = 'status-pill archived'
  }
}

export default function MetaDeferredEnhancer() {
  useEffect(() => {
    const main = document.querySelector('#root .app-main main')
    if (!main) return undefined

    const sync = () => {
      const page = activeSettingsPage()
      if (page) syncMetaStatus(page)
    }

    sync()

    const observer = new MutationObserver(() => {
      sync()
    })

    observer.observe(main, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}
