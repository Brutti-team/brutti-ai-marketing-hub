import { useEffect } from 'react'

const STORAGE_KEY = 'brutti-content-direction-v1'

function clean(value = '') {
  return String(value || '').trim()
}

function readMap() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

function writeMap(map) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Local persistence is best-effort only.
  }
}

function saveDirection(title, direction) {
  const key = clean(title).toLowerCase()
  const value = clean(direction)
  if (!key || !value) return
  const map = readMap()
  map[key] = value
  writeMap(map)
  window.__bruttiContentDirections = map
}

function currentStudioValues() {
  const page = [...document.querySelectorAll('#root .page')]
    .find((item) => item.offsetParent !== null && item.querySelector('.page-header h1')?.textContent?.trim() === 'Content Studio')
  if (!page) return null

  const labels = [...page.querySelectorAll('label')]
  const title = labels.find((item) => item.textContent?.trim().startsWith('Content title'))?.querySelector('input')?.value || ''
  const direction = labels.find((item) => {
    const text = item.textContent?.trim() || ''
    return text.startsWith('Verified facts / direction') || text.startsWith('Content Direction') || text.startsWith('Verified facts')
  })?.querySelector('textarea')?.value || ''

  return { title, direction }
}

function injectSavedDirection() {
  const modal = document.querySelector('.content-modal')
  if (!modal || modal.querySelector('.saved-content-direction')) return

  const title = clean(modal.querySelector('.modal-head h2')?.textContent || '')
  if (!title) return

  let direction = ''
  const map = window.__bruttiContentDirections || readMap()
  direction = clean(map[title.toLowerCase()] || '')

  if (!direction) {
    try {
      const localContent = JSON.parse(window.localStorage.getItem('brutti-content-v2') || '[]')
      const item = Array.isArray(localContent) ? localContent.find((entry) => clean(entry?.title).toLowerCase() === title.toLowerCase()) : null
      direction = clean(item?.contentDirection || item?.brief || '')
    } catch {
      direction = ''
    }
  }

  const label = document.createElement('label')
  label.className = 'saved-content-direction'
  label.textContent = 'Content Direction'

  const textarea = document.createElement('textarea')
  textarea.rows = 5
  textarea.readOnly = true
  textarea.value = direction
  textarea.placeholder = 'No Content Direction was saved for this older draft.'
  label.append(textarea)

  const contentLabel = [...modal.querySelectorAll('label')]
    .find((item) => clean(item.firstChild?.textContent || item.textContent).startsWith('Content'))
  if (contentLabel?.parentNode) contentLabel.parentNode.insertBefore(label, contentLabel)
  else modal.querySelector('.modal-guardrail')?.before(label)
}

export default function ContentDirectionPersistenceEnhancer() {
  useEffect(() => {
    window.__bruttiContentDirections = readMap()

    const onClick = (event) => {
      const button = event.target.closest?.('button')
      if (!button) return

      if (/save as draft/i.test(button.textContent || '')) {
        const values = currentStudioValues()
        if (values) saveDirection(values.title, values.direction)
      }

      if (button.getAttribute('aria-label')?.startsWith('Edit ')) {
        window.setTimeout(injectSavedDirection, 0)
        window.setTimeout(injectSavedDirection, 80)
      }
    }

    document.addEventListener('click', onClick, true)

    const observer = new MutationObserver(() => injectSavedDirection())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
