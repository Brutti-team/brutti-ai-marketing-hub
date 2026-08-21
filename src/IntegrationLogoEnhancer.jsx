import { useEffect } from 'react'

const LOGOS = {
  'Google Sheets': `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#188038" d="M6 2h8l4 4v16H6z"/>
      <path fill="#34A853" d="M14 2v5h5z"/>
      <path fill="none" stroke="#fff" stroke-width="1.5" d="M9 10.5h6M9 14h6M9 17.5h6M11 9v10"/>
    </svg>`,
  'Google Drive': `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#0F9D58" d="M8.1 3h5.2l5.2 9h-5.2z"/>
      <path fill="#F4B400" d="M8.1 3 2.9 12l2.6 4.5L10.7 7z"/>
      <path fill="#4285F4" d="M5.5 16.5 8.1 21h10.4l2.6-4.5z"/>
    </svg>`,
  Notion: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2.5" fill="#fff" stroke="#111" stroke-width="1.6"/>
      <path fill="#111" d="M8 7.5h3l5 7.2V9.4l-1.8-.3V7.5H19v1.6l-1.4.3V17H15l-5.4-7.7v5.9l2 .3V17H7v-1.5l1.3-.3V9.3L8 9.2z"/>
    </svg>`,
}

function decorate() {
  document.querySelectorAll('.settings-panel .connections-list article').forEach((article) => {
    const title = article.querySelector('strong')?.textContent?.trim()
    const markup = title ? LOGOS[title] : null
    const icon = article.querySelector('.connection-icon')
    if (!markup || !icon || icon.dataset.integrationBrand === title) return
    icon.dataset.integrationBrand = title
    icon.classList.add('integration-brand-logo')
    icon.innerHTML = markup
    icon.setAttribute('aria-label', `${title} logo`)
    icon.setAttribute('role', 'img')
  })
}

export default function IntegrationLogoEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined
    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(decorate, 45)
    }
    decorate()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [])

  return null
}
