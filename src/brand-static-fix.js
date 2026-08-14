const BRUTTI_LOGO_URL = 'https://drive.google.com/thumbnail?id=1NyserkCTmZYybJWH6bptPubwdDHljDK3&sz=w512'

const facebookSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1877F2"/><path fill="#fff" d="M13.6 20v-7h2.45l.37-2.86H13.6V8.3c0-.83.23-1.39 1.42-1.39h1.52V4.36c-.26-.04-1.17-.11-2.22-.11-2.2 0-3.7 1.34-3.7 3.8v2.09H8.14V13h2.48v7h2.98Z"/></svg>'

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
    .content-channel.brutti-facebook-logo svg {
      width: 26px;
      height: 26px;
      display: block;
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
    element.innerHTML = facebookSvg
    element.classList.add('brutti-facebook-logo')
    element.dataset.bruttiFacebookLogo = 'true'
    element.setAttribute('title', 'Facebook')
  })

  document.querySelectorAll('.brutti-platform-status-strip').forEach((strip) => strip.remove())

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

function applyStaticVisualFix() {
  addStyles()
  try {
    window.localStorage.removeItem('brutti-official-logo-url')
  } catch (error) {
    console.debug('Unable to clear cached Brutti logo URL.', error)
  }
  forceLogo()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyStaticVisualFix, { once: true })
} else {
  applyStaticVisualFix()
}

const observer = new MutationObserver(() => applyStaticVisualFix())
observer.observe(document.documentElement, { childList: true, subtree: true })
