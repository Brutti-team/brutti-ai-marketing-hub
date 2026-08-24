import { useEffect } from 'react'

const STYLE_ID = 'brutti-content-studio-ui-simplifier-style'

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .smart-rewrite-panel .rewrite-actions .rewrite-more-primary {
      font-size: 0 !important;
    }

    .smart-rewrite-panel .rewrite-actions .rewrite-more-primary::after {
      content: 'More';
      font-size: 14px;
      line-height: inherit;
    }

    .smart-rewrite-panel .variation-row {
      display: flex !important;
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

  document.querySelectorAll('.smart-rewrite-panel .rewrite-actions').forEach((actions) => {
    const buttons = [...actions.querySelectorAll('button')]
    const engaging = buttons.find((button) => /More engaging/i.test(button.textContent || '') || button.classList.contains('rewrite-more-primary'))
    const casual = buttons.find((button) => /More casual/i.test(button.textContent || ''))
    const professional = buttons.find((button) => /More professional/i.test(button.textContent || ''))

    if (engaging) {
      engaging.classList.add('rewrite-more-primary')
      engaging.setAttribute('aria-label', 'More')
      engaging.style.display = ''
      engaging.hidden = false
      engaging.removeAttribute('aria-hidden')
      engaging.tabIndex = 0
    }

    ;[casual, professional].forEach((button) => {
      if (!button) return
      button.style.display = 'none'
      button.setAttribute('aria-hidden', 'true')
      button.tabIndex = -1
    })
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
