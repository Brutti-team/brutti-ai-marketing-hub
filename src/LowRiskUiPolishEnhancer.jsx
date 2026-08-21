import { useEffect } from 'react'

const FACEBOOK_MARK = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="11" fill="#1877F2"/>
    <text x="12" y="16.1" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="15" font-weight="700">f</text>
  </svg>`

function decorateFacebookQueue() {
  document.querySelectorAll('.review-queue .queue-channel').forEach((mark) => {
    if (mark.dataset.facebookBrand === '1') return
    if ((mark.textContent || '').trim().toLowerCase() !== 'f') return
    mark.dataset.facebookBrand = '1'
    mark.classList.add('facebook-brand-mark')
    mark.innerHTML = FACEBOOK_MARK
    mark.setAttribute('role', 'img')
    mark.setAttribute('aria-label', 'Facebook')
  })
}

export default function LowRiskUiPolishEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    let timer = 0
    const sync = () => decorateFacebookQueue()
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, 55)
    }

    sync()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [])

  return null
}
