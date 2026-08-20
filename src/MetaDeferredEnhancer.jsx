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

  if (detail && detail.textContent !== DEFERRED_DETAIL) detail.textContent = DEFERRED_DETAIL
  if (status.textContent?.trim() !== 'Deferred') status.textContent = 'Deferred'
  if (status.className !== 'status-pill archived') status.className = 'status-pill archived'
}

export default function MetaDeferredEnhancer() {
  useEffect(() => {
    let timer = 0

    const sync = () => {
      const page = activeSettingsPage()
      if (page) syncMetaStatus(page)
    }

    const schedule = (delay = 70) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, delay)
    }

    sync()
    const onClick = () => schedule()
    document.addEventListener('click', onClick, true)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
