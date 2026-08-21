import { useEffect } from 'react'

const KEEP_UPPER = new Set(['AI', 'BRUTTI', 'KPI', 'CTA', 'API', 'PWA', 'BM', 'RM', 'FB', 'URL'])

function titleToken(token = '') {
  const punctuation = token.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/)
  const prefix = punctuation?.[1] || ''
  const core = punctuation?.[2] || token
  const suffix = punctuation?.[3] || ''
  if (!core) return token
  if (KEEP_UPPER.has(core.toUpperCase())) return `${prefix}${core.toUpperCase()}${suffix}`
  const lower = core.toLowerCase()
  return `${prefix}${lower.charAt(0).toUpperCase()}${lower.slice(1)}${suffix}`
}

function titleCaseIfUpper(value = '') {
  const text = String(value || '').trim()
  if (!text || !/[A-Z]/.test(text) || /[a-z]/.test(text)) return text
  return text.split(/(\s+)/).map((part) => /\s+/.test(part) ? part : titleToken(part)).join('')
}

function polishUpperLabels(root = document) {
  root.querySelectorAll('.eyebrow, .workspace-label, .hero-label').forEach((node) => {
    if (node.children.length) return
    const next = titleCaseIfUpper(node.textContent)
    if (next && next !== node.textContent) node.textContent = next
  })
}

const ICONS = {
  'Google Sheets': `
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path fill="#0F9D58" d="M6 2h8l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
      <path fill="#87CEAC" d="M14 2v5h5Z"/>
      <path fill="#fff" d="M8 10h8v7H8Zm1.4 1.3v1.4h2v-1.4Zm3.2 0v1.4h2v-1.4Zm-3.2 2.6v1.8h2v-1.8Zm3.2 0v1.8h2v-1.8Z"/>
    </svg>`,
  'Google Drive': `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path fill="#0F9D58" d="m8.1 3 4 6.9-4 6.9H3.9L8.1 9.6 4.3 3Z"/>
      <path fill="#F4B400" d="M8.1 3h7.8l4 6.9h-7.8Z"/>
      <path fill="#4285F4" d="M8.1 16.8h8l3.8-6.9h-7.8Z"/>
    </svg>`,
  Notion: `
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2.2" fill="#111"/>
      <path fill="#fff" d="M7.2 7.3h2.9l4.5 6.7V9.6l-1.8-.2V7.8h4.1v1.5l-1.2.3v7.1h-2.1L9 9.8v4.7l1.8.2v1.5H6.7v-1.5l1.2-.2V9.3l-.7-.2Z"/>
    </svg>`,
  'Meta / Facebook': `
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#1877F2"/>
      <path fill="#fff" d="M13.5 20v-7h2.4l.4-2.7h-2.8V8.6c0-.8.2-1.3 1.4-1.3h1.5V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v1.7H8.4V13h2.1v7Z"/>
    </svg>`,
}

function polishIntegrationIcons(root = document) {
  root.querySelectorAll('.connections-list article').forEach((article) => {
    const name = article.querySelector('strong')?.textContent?.trim()
    const icon = article.querySelector('.connection-icon')
    const markup = ICONS[name]
    if (!icon || !markup || icon.dataset.brandIcon === name) return
    icon.dataset.brandIcon = name
    icon.innerHTML = markup
    icon.setAttribute('aria-label', `${name} logo`)
  })
}

function sync() {
  polishUpperLabels(document)
  polishIntegrationIcons(document)
}

export default function UiBrandPolishEnhancer() {
  useEffect(() => {
    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, 45)
    }

    const root = document.getElementById('root')
    const observer = new MutationObserver(schedule)
    if (root) observer.observe(root, { childList: true, subtree: true, characterData: true })
    schedule()

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return null
}
