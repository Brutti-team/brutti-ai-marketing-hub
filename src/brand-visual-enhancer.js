import { callMarketingApi, googleConfigured, hasWorkspaceKey } from './lib/googleWorkspace.js'

const LOGO_CACHE_KEY = 'brutti-official-logo-url'
const BASE_PATH = '/brutti-ai-marketing-hub/'

const platformSvgs = {
  Facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1877F2"/><path fill="#fff" d="M13.6 20v-7h2.45l.37-2.86H13.6V8.3c0-.83.23-1.39 1.42-1.39h1.52V4.36c-.26-.04-1.17-.11-2.22-.11-2.2 0-3.7 1.34-3.7 3.8v2.09H8.14V13h2.48v7h2.98Z"/></svg>',
  Instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="bruttiIg" x1="2" y1="22" x2="22" y2="2"><stop stop-color="#FFDC80"/><stop offset=".32" stop-color="#F77737"/><stop offset=".58" stop-color="#E1306C"/><stop offset=".78" stop-color="#C13584"/><stop offset="1" stop-color="#405DE6"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#bruttiIg)"/><rect x="5.4" y="5.4" width="13.2" height="13.2" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.25" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.7" cy="7.5" r="1.05" fill="#fff"/></svg>',
  TikTok: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#111"/><path d="M14.4 5.2c.45 1.8 1.46 2.87 3.25 3.34v2.3a7 7 0 0 1-3.25-1.02v5.08a4.35 4.35 0 1 1-3.77-4.31v2.36a2.06 2.06 0 1 0 1.52 1.99V5.2h2.25Z" fill="#fff"/><path d="M12.15 5.2h1.08v9.74a2.06 2.06 0 0 1-2.91 1.88 2.06 2.06 0 0 0 3.83-1.06V7.09c.58 1.3 1.55 2.2 2.92 2.69v1.14a7.25 7.25 0 0 1-3.67-1.1V5.2h-1.25Z" fill="#25F4EE" opacity=".8"/><path d="M10.63 10.59v1.18a4.35 4.35 0 0 0-2.05 7.7 4.35 4.35 0 0 1 2.05-8.88Zm3.77-5.39c.11.46.27.88.47 1.25a4.75 4.75 0 0 0 2.78 2.09v1.1a5.18 5.18 0 0 1-3.78-3.24V5.2h.53Z" fill="#FE2C55" opacity=".85"/></svg>',
  Threads: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#111"/><path d="M12 5.15c-3.98 0-6.45 2.5-6.45 6.63 0 4.3 2.55 7.07 6.55 7.07 3.6 0 5.82-1.92 5.82-4.7 0-2.2-1.2-3.55-3.43-4.02-.38-2.04-1.62-3.08-3.66-3.08-1.77 0-3.14.9-3.74 2.45l1.86.7c.33-.82.96-1.27 1.84-1.27.9 0 1.47.43 1.72 1.24-3.17.18-4.92 1.42-4.92 3.48 0 1.79 1.45 3.02 3.53 3.02 2.18 0 3.56-1.23 3.56-3.18 0-.4-.03-.8-.08-1.17.9.37 1.33.98 1.33 1.88 0 1.62-1.4 2.7-3.52 2.7-2.93 0-4.72-1.92-4.72-5.1 0-3.05 1.67-4.72 4.33-4.72 1.86 0 3.13.7 4.12 2.26l1.65-1.02C16.5 6.17 14.58 5.15 12 5.15Zm-.68 9.68c-1.03 0-1.7-.46-1.7-1.2 0-.96.98-1.5 3.08-1.62.03.28.04.59.04.93 0 1.2-.5 1.89-1.42 1.89Z" fill="#fff"/></svg>',
}

const platformMatchers = [
  ['Facebook', /^(facebook|meta\s*\/\s*facebook|meta facebook)$/i],
  ['Instagram', /^instagram$/i],
  ['TikTok', /^tik\s*tok$/i],
  ['Threads', /^threads$/i],
]

function injectEnhancerStyles() {
  if (document.getElementById('brutti-brand-visual-styles')) return
  const style = document.createElement('style')
  style.id = 'brutti-brand-visual-styles'
  style.textContent = `
    .brutti-official-logo-img {
      display: block;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      object-position: center;
      border-radius: inherit;
    }
    .brutti-logo-replaced {
      overflow: hidden;
      line-height: 0 !important;
      color: transparent !important;
    }
    .brutti-platform-icon {
      width: 1.15em;
      height: 1.15em;
      min-width: 1.15em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: -0.18em;
      margin-right: .42em;
      border-radius: .3em;
      overflow: hidden;
      flex: 0 0 auto;
    }
    .brutti-platform-icon svg { width: 100%; height: 100%; display: block; }
    [data-brutti-platform-decorated="true"] { display: inline-flex; align-items: center; }
  `
  document.head.appendChild(style)
}

function directText(element) {
  return Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent || '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function platformNameFor(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  for (const [name, matcher] of platformMatchers) {
    if (matcher.test(clean)) return name
  }
  return ''
}

function createPlatformIcon(name) {
  const span = document.createElement('span')
  span.className = `brutti-platform-icon brutti-platform-${name.toLowerCase()}`
  span.setAttribute('aria-hidden', 'true')
  span.innerHTML = platformSvgs[name]
  return span
}

function decoratePlatforms(root = document) {
  const selectors = [
    'button', '[role="button"]', 'label', 'span', 'strong', 'b', 'small',
    'td', 'th', 'h3', 'h4', '.badge', '.pill', '.chip', '.platform',
    '[data-platform]', '.integration-name', '.integration-title', '.channel-name',
  ].join(',')

  root.querySelectorAll?.(selectors).forEach(element => {
    if (element.dataset.bruttiPlatformDecorated === 'true') return
    if (element.querySelector(':scope > .brutti-platform-icon')) return

    const text = directText(element) || element.getAttribute('data-platform') || ''
    const platform = platformNameFor(text)
    if (!platform) return

    element.prepend(createPlatformIcon(platform))
    element.dataset.bruttiPlatformDecorated = 'true'
    element.setAttribute('data-brutti-platform', platform)
  })
}

function driveImageCandidates(fileId) {
  const id = encodeURIComponent(fileId)
  return [
    `https://drive.google.com/thumbnail?id=${id}&sz=w512`,
    `https://drive.google.com/uc?export=view&id=${id}`,
  ]
}

function imageLoads(url, timeoutMs = 5000) {
  return new Promise(resolve => {
    const image = new Image()
    let settled = false
    const finish = ok => {
      if (settled) return
      settled = true
      resolve(ok)
    }
    const timer = window.setTimeout(() => finish(false), timeoutMs)
    image.onload = () => {
      window.clearTimeout(timer)
      finish(image.naturalWidth > 20 && image.naturalHeight > 20)
    }
    image.onerror = () => {
      window.clearTimeout(timer)
      finish(false)
    }
    image.referrerPolicy = 'no-referrer'
    image.src = url
  })
}

function logoScore(file) {
  const name = String(file?.name || '').toLowerCase()
  let score = 0
  if (/brutti.*logo|logo.*brutti/.test(name)) score += 120
  if (/company.*logo|brand.*logo/.test(name)) score += 90
  if (name.includes('logo')) score += 55
  if (name.includes('brutti')) score += 35
  if (/facebook|instagram|tiktok|threads|candidate|unverified/.test(name)) score -= 150
  return score
}

async function findOfficialDriveLogo() {
  if (!googleConfigured || !hasWorkspaceKey()) return ''
  try {
    const result = await callMarketingApi('list_drive_assets')
    const files = Array.isArray(result?.files) ? result.files : []
    const candidates = files
      .filter(file => String(file?.mimeType || '').startsWith('image/'))
      .map(file => ({ file, score: logoScore(file) }))
      .filter(item => item.score > 40)
      .sort((a, b) => b.score - a.score)

    for (const item of candidates) {
      for (const url of driveImageCandidates(item.file.id)) {
        if (await imageLoads(url)) return url
      }
    }
  } catch {
    // Keep the existing visual if Drive is not connected or the logo is private.
  }
  return ''
}

function isLikelyBrandMark(element) {
  if (!(element instanceof HTMLElement)) return false
  if (element.dataset.bruttiOfficialLogo === 'true') return false

  const className = String(element.className || '').toLowerCase()
  if (/brand[-_ ]?(mark|logo|icon)|logo[-_ ]?(mark|icon)|sidebar[-_ ]?logo|app[-_ ]?logo/.test(className)) return true

  const text = element.textContent?.trim()
  if (text !== 'B') return false
  const parentText = element.parentElement?.textContent?.replace(/\s+/g, ' ').toUpperCase() || ''
  if (!parentText.includes('BRUTTI')) return false

  const rect = element.getBoundingClientRect()
  return rect.width > 18 && rect.height > 18 && rect.width <= 90 && rect.height <= 90
}

function replaceBrandMark(element, logoUrl) {
  if (!isLikelyBrandMark(element)) return
  const image = document.createElement('img')
  image.className = 'brutti-official-logo-img'
  image.alt = 'BRUTTI'
  image.src = logoUrl
  image.referrerPolicy = 'no-referrer'
  image.addEventListener('error', () => {
    element.classList.remove('brutti-logo-replaced')
    element.dataset.bruttiOfficialLogo = 'failed'
    image.remove()
    if (!element.textContent?.trim()) element.textContent = 'B'
  }, { once: true })

  element.replaceChildren(image)
  element.classList.add('brutti-logo-replaced')
  element.dataset.bruttiOfficialLogo = 'true'
}

function applyBrandLogo(logoUrl, root = document) {
  if (!logoUrl) return

  const explicitSelectors = [
    '[data-brand-logo]', '[data-brutti-logo]', '.brand-mark', '.brand-logo', '.brand-icon',
    '.logo-mark', '.logo-icon', '.sidebar-logo', '.sidebar-brand-logo', '.app-logo', '.app-icon',
  ].join(',')

  root.querySelectorAll?.(explicitSelectors).forEach(element => replaceBrandMark(element, logoUrl))

  root.querySelectorAll?.('div, span, a').forEach(element => {
    if (element.textContent?.trim() === 'B') replaceBrandMark(element, logoUrl)
  })
}

let dynamicManifestUrl = ''
function applyDocumentBrandAssets(logoUrl) {
  if (!logoUrl) return

  let favicon = document.querySelector('link[rel="icon"]')
  if (!favicon) {
    favicon = document.createElement('link')
    favicon.rel = 'icon'
    document.head.appendChild(favicon)
  }
  favicon.href = logoUrl

  let touchIcon = document.querySelector('link[rel="apple-touch-icon"]')
  if (!touchIcon) {
    touchIcon = document.createElement('link')
    touchIcon.rel = 'apple-touch-icon'
    document.head.appendChild(touchIcon)
  }
  touchIcon.href = logoUrl

  const manifestLink = document.querySelector('link[rel="manifest"]')
  if (manifestLink) {
    if (dynamicManifestUrl) URL.revokeObjectURL(dynamicManifestUrl)
    const manifest = {
      name: 'BRUTTI AI Marketing Hub',
      short_name: 'BRUTTI Hub',
      description: 'Personal BRUTTI AI-assisted marketing workspace.',
      start_url: BASE_PATH,
      scope: BASE_PATH,
      display: 'standalone',
      background_color: '#f5f1e8',
      theme_color: '#12372a',
      icons: [
        { src: logoUrl, sizes: '192x192', purpose: 'any' },
        { src: logoUrl, sizes: '512x512', purpose: 'any maskable' },
      ],
    }
    dynamicManifestUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }))
    manifestLink.href = dynamicManifestUrl
  }
}

function applyAll(logoUrl, root = document) {
  decoratePlatforms(root)
  applyBrandLogo(logoUrl, root)
}

async function initialiseBrandVisuals() {
  injectEnhancerStyles()

  const cachedLogo = window.localStorage.getItem(LOGO_CACHE_KEY) || ''
  if (cachedLogo) {
    applyDocumentBrandAssets(cachedLogo)
    applyAll(cachedLogo)
  } else {
    decoratePlatforms()
  }

  const officialLogo = await findOfficialDriveLogo()
  const logoUrl = officialLogo || cachedLogo
  if (officialLogo) {
    window.localStorage.setItem(LOGO_CACHE_KEY, officialLogo)
    applyDocumentBrandAssets(officialLogo)
  }

  applyAll(logoUrl)

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return
        applyAll(logoUrl, node)
        if (logoUrl && isLikelyBrandMark(node)) replaceBrandMark(node, logoUrl)
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialiseBrandVisuals, { once: true })
} else {
  initialiseBrandVisuals()
}
