import { useEffect } from 'react'

const STYLE_ID = 'brutti-content-studio-ui-simplifier-style'

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .smart-rewrite-panel .smart-rewrite-head,
    .smart-rewrite-panel .rewrite-actions {
      display: none !important;
    }

    .smart-rewrite-panel .variation-row {
      display: flex !important;
      margin-top: 0 !important;
      padding-top: 0 !important;
      border-top: 0 !important;
    }
  `
  document.head.append(style)
}

function sync() {
  ensureStyle()

  document.querySelectorAll('.brief-polish-row').forEach((row) => {
    row.style.display = 'none'
    row.setAttribute('aria-hidden', 'true')
  })

  document.querySelectorAll('.smart-rewrite-panel .smart-rewrite-head, .smart-rewrite-panel .rewrite-actions').forEach((section) => {
    section.hidden = true
    section.style.display = 'none'
    section.setAttribute('aria-hidden', 'true')
  })

  document.querySelectorAll('.smart-rewrite-panel .variation-row').forEach((row) => {
    row.hidden = false
    row.style.display = 'flex'
    row.removeAttribute('aria-hidden')
    row.querySelectorAll('button').forEach((button) => {
      button.hidden = false
      button.style.display = ''
      button.removeAttribute('aria-hidden')
      button.tabIndex = 0
    })
  })
}

export default function ContentStudioUiSimplifier() {
  useEffect(() => {
    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, 30)
    }

    const root = document.getElementById('root')
    if (!root) return undefined

    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true })
    document.addEventListener('click', schedule, true)
    document.addEventListener('submit', schedule, true)
    sync()

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('click', schedule, true)
      document.removeEventListener('submit', schedule, true)
    }
  }, [])

  return null
}
