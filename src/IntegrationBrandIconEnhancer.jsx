import { useEffect } from 'react'

const ICONS = Object.freeze({
  'Google Sheets': `
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <rect x="4" y="2" width="16" height="20" rx="2.5" fill="#0F9D58"/>
      <path d="M8 7.5h8M8 11.5h8M8 15.5h8M11 7.5v8M16 7.5v8" fill="none" stroke="white" stroke-width="1.35" stroke-linecap="round"/>
    </svg>`,
  'Google Drive': `
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path d="M8.2 3.5h5l6.6 11.4h-5z" fill="#4285F4"/>
      <path d="M8.2 3.5 2.3 14.1l2.6 4.5L13.2 3.5z" fill="#0F9D58"/>
      <path d="M4.9 18.6h12.2l2.7-3.7H7.1z" fill="#F4B400"/>
    </svg>`,
  Notion: `
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="2.8" fill="white" stroke="#111" stroke-width="1.7"/>
      <path d="M7.5 17V7.2h2.3l6.6 7.5V7.2h1.9V17h-2.1L9.4 9.3V17z" fill="#111"/>
    </svg>`,
})

function syncIntegrationIcons() {
  document.querySelectorAll('.settings-panel .connections-list article').forEach((article) => {
    const name = article.querySelector('strong')?.textContent?.trim()
    const markup = ICONS[name]
    const icon = article.querySelector('.connection-icon')
    if (!markup || !icon || icon.dataset.bruttiBrandIcon === name) return

    icon.innerHTML = markup
    icon.dataset.bruttiBrandIcon = name
    icon.setAttribute('aria-label', `${name} icon`)
  })
}

export default function IntegrationBrandIconEnhancer() {
  useEffect(() => {
    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(syncIntegrationIcons, 35)
    }

    const root = document.getElementById('root')
    const observer = root ? new MutationObserver(schedule) : null
    observer?.observe(root, { childList: true, subtree: true })
    document.addEventListener('click', schedule, true)
    schedule()

    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
      document.removeEventListener('click', schedule, true)
    }
  }, [])

  return null
}
