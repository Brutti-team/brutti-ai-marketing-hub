const BRUTTI_LOGO_URL = 'https://drive.google.com/thumbnail?id=1NyserkCTmZYybJWH6bptPubwdDHljDK3&sz=w512'

const platformSvgs = {
  Facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1877F2"/><path fill="#fff" d="M13.6 20v-7h2.45l.37-2.86H13.6V8.3c0-.83.23-1.39 1.42-1.39h1.52V4.36c-.26-.04-1.17-.11-2.22-.11-2.2 0-3.7 1.34-3.7 3.8v2.09H8.14V13h2.48v7h2.98Z"/></svg>',
  Instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="igStatic" x1="2" y1="22" x2="22" y2="2"><stop stop-color="#FFDC80"/><stop offset=".32" stop-color="#F77737"/><stop offset=".58" stop-color="#E1306C"/><stop offset=".78" stop-color="#C13584"/><stop offset="1" stop-color="#405DE6"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#igStatic)"/><rect x="5.4" y="5.4" width="13.2" height="13.2" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.25" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.7" cy="7.5" r="1.05" fill="#fff"/></svg>',
  TikTok: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#111"/><path d="M14.4 5.2c.45 1.8 1.46 2.87 3.25 3.34v2.3a7 7 0 0 1-3.25-1.02v5.08a4.35 4.35 0 1 1-3.77-4.31v2.36a2.06 2.06 0 1 0 1.52 1.99V5.2h2.25Z" fill="#fff"/></svg>',
  Threads: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#111"/><path d="M12 5.15c-3.98 0-6.45 2.5-6.45 6.63 0 4.3 2.55 7.07 6.55 7.07 3.6 0 5.82-1.92 5.82-4.7 0-2.2-1.2-3.55-3.43-4.02-.38-2.04-1.62-3.08-3.66-3.08-1.77 0-3.14.9-3.74 2.45l1.86.7c.33-.82.96-1.27 1.84-1.27.9 0 1.47.43 1.72 1.24-3.17.18-4.92 1.42-4.92 3.48 0 1.79 1.45 3.02 3.53 3.02 2.18 0 3.56-1.23 3.56-3.18 0-.4-.03-.8-.08-1.17.9.37 1.33.98 1.33 1.88 0 1.62-1.4 2.7-3.52 2.7-2.93 0-4.72-1.92-4.72-5.1 0-3.05 1.67-4.72 4.33-4.72 1.86 0 3.13.7 4.12 2.26l1.65-1.02C16.5 6.17 14.58 5.15 12 5.15Zm-.68 9.68c-1.03 0-1.7-.46-1.7-1.2 0-.96.98-1.5 3.08-1.62.03.28.04.59.04.93 0 1.2-.5 1.89-1.42 1.89Z" fill="#fff"/></svg>',
}

function addStyles() {
  if (document.getElementById('brutti-static-fix-style')) return
  const style = document.createElement('style')
  style.id = 'brutti-static-fix-style'
  style.textContent = `
    .brutti-static-brand-logo {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: center;
      border-radius: inherit;
    }
    .logo-mark.brutti-logo-forced,
    .brand-monogram.brutti-logo-forced {
      padding: 0 !important;
      overflow: hidden !important;
      background: #203b35 !important;
      color: transparent !important;
    }
    .brutti-platform-status-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
      width: 100%;
    }
    .brutti-platform-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 32px;
      padding: 6px 10px;
      border: 1px solid rgba(32, 59, 53, .16);
      border-radius: 10px;
      background: rgba(255,255,255,.66);
      color: inherit;
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
    }
    .brutti-platform-status-badge.is-muted { opacity: .64; }
    .brutti-platform-status-badge svg { width: 20px; height: 20px; flex: 0 0 20px; }
    .brutti-platform-status-badge small { font-size: 10px; font-weight: 600; opacity: .7; }
    .content-channel.brutti-facebook-logo {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      width: 26px !important;
      height: 26px !important;
      padding: 0 !important;
      overflow: hidden;
      border-radius: 7px !important;
      background: transparent !important;
      color: transparent !important;
    }
    .content-channel.brutti-facebook-logo svg { width: 26px; height: 26px; display: block; }
    [data-theme='dark'] .brutti-platform-status-badge,
    html[data-theme='dark'] .brutti-platform-status-badge {
      background: rgba(224, 244, 234, .08);
      border-color: rgba(224, 244, 234, .18);
    }
  `
  document.head.appendChild(style)
}

function forceLogo() {
  const selectors = ['.logo-mark', '.brand-monogram', '[data-brand-logo]', '[data-brutti-logo]']
  document.querySelectorAll(selectors.join(',')).forEach((element) => {
    if (element.dataset.bruttiStaticLogo === 'true') return
    const image = document.createElement('img')
    image.src = BRUTTI_LOGO_URL
    image.alt = 'BRUTTI'
    image.className = 'brutti-static-brand-logo'
    image.referrerPolicy = 'no-referrer'
    image.addEventListener('error', () => {
      element.dataset.bruttiStaticLogo = 'failed'
    }, { once: true })
    element.replaceChildren(image)
    element.classList.add('brutti-logo-forced')
    element.dataset.bruttiStaticLogo = 'true'
  })

  document.querySelectorAll('.content-channel').forEach((element) => {
    if (element.dataset.bruttiFacebookLogo === 'true') return
    element.innerHTML = platformSvgs.Facebook
    element.classList.add('brutti-facebook-logo')
    element.dataset.bruttiFacebookLogo = 'true'
    element.setAttribute('title', 'Facebook')
  })

  let favicon = document.querySelector('link[rel="icon"]')
  if (!favicon) {
    favicon = document.createElement('link')
    favicon.rel = 'icon'
    document.head.appendChild(favicon)
  }
  favicon.href = BRUTTI_LOGO_URL

  let touchIcon = document.querySelector('link[rel="apple-touch-icon"]')
  if (!touchIcon) {
    touchIcon = document.createElement('link')
    touchIcon.rel = 'apple-touch-icon'
    document.head.appendChild(touchIcon)
  }
  touchIcon.href = BRUTTI_LOGO_URL
}

function makeBadge(name, active) {
  const badge = document.createElement('span')
  badge.className = `brutti-platform-status-badge ${active ? '' : 'is-muted'}`
  badge.innerHTML = `${platformSvgs[name]}<span>${name}</span><small>${active ? 'Active' : 'Coming soon'}</small>`
  return badge
}

function addPlatformStrip() {
  document.querySelectorAll('select').forEach((select) => {
    const names = Array.from(select.options).map((option) => option.textContent || '')
    const hasSocialOptions = ['Facebook','Instagram','TikTok','Threads'].some((name) => names.some((text) => text.includes(name)))
    if (!hasSocialOptions) return

    const host = select.closest('label') || select.parentElement
    if (!host || host.dataset.bruttiPlatformStrip === 'true') return

    const strip = document.createElement('div')
    strip.className = 'brutti-platform-status-strip'
    ;['Facebook','Instagram','TikTok','Threads'].forEach((name) => {
      const option = Array.from(select.options).find((item) => (item.textContent || '').includes(name))
      const active = Boolean(option && !option.disabled && name === 'Facebook')
      strip.appendChild(makeBadge(name, active))
    })
    host.appendChild(strip)
    host.dataset.bruttiPlatformStrip = 'true'
  })
}

function applyStaticVisualFix() {
  addStyles()
  try { window.localStorage.removeItem('brutti-official-logo-url') } catch {}
  forceLogo()
  addPlatformStrip()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyStaticVisualFix, { once: true })
} else {
  applyStaticVisualFix()
}

const observer = new MutationObserver(() => applyStaticVisualFix())
observer.observe(document.documentElement, { childList: true, subtree: true })
