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
  if (!status || !/not connected/i.test(status.textContent || '')) return

  const detail = row.querySelector('p')
  if (detail) detail.textContent = 'Skipped for now — enable only when verified Meta access and data are available.'
  status.textContent = 'Deferred'
  status.className = 'status-pill archived'
}

export default function MetaDeferredEnhancer() {
  useEffect(() => {
    let timer = 0
    const sync = () => {
      const page = activeSettingsPage()
      if (page) syncMetaStatus(page)
    }
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, 80)
    }
    const onClick = (event) => {
      if (event.target.closest?.('button, a')) {
        schedule()
        window.setTimeout(sync, 350)
      }
    }

    sync()
    document.addEventListener('click', onClick, true)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
