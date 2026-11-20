export const BRIGHTNESS_KEY = 'brutti-ui-brightness-v2'
export const BRIGHTNESS_LEGACY_KEY = 'brutti-ui-brightness'
export const BRIGHTNESS_MIN = 0
export const BRIGHTNESS_MAX = 100
export const BRIGHTNESS_DEFAULT = 75
const FILTER_MIN = 40
const FILTER_MAX = 120

export function clampBrightness(value) {
  const next = Number(value)
  if (!Number.isFinite(next)) return BRIGHTNESS_DEFAULT
  return Math.min(BRIGHTNESS_MAX, Math.max(BRIGHTNESS_MIN, Math.round(next)))
}

export function currentTheme() {
  const attr = document.documentElement.dataset.theme
  if (attr === 'dark' || attr === 'light') return attr
  try {
    return window.localStorage.getItem('brutti-ui-theme') === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function filterFromSlider(value, theme = currentTheme()) {
  const slider = clampBrightness(value)
  if (theme === 'dark' && slider > BRIGHTNESS_DEFAULT) {
    // Dark mode: no veil, so go a little brighter than 1.2 to keep the
    // top of the scale visible while staying crisp.
    return 1 + ((slider - BRIGHTNESS_DEFAULT) * 0.35) / (BRIGHTNESS_MAX - BRIGHTNESS_DEFAULT)
  }
  return (FILTER_MIN + ((FILTER_MAX - FILTER_MIN) * slider) / 100) / 100
}

export function sliderFromFilterPercent(percent) {
  const next = Number(percent)
  if (!Number.isFinite(next)) return BRIGHTNESS_DEFAULT
  return clampBrightness(((next - FILTER_MIN) * 100) / (FILTER_MAX - FILTER_MIN))
}

export function readBrightness() {
  try {
    const stored = window.localStorage.getItem(BRIGHTNESS_KEY)
    if (stored != null) return clampBrightness(stored)
    const legacy = window.localStorage.getItem(BRIGHTNESS_LEGACY_KEY)
    if (legacy != null) {
      const migrated = sliderFromFilterPercent(legacy)
      try {
        window.localStorage.setItem(BRIGHTNESS_KEY, String(migrated))
      } catch {
        // Keep using the migrated value for this session even if it cannot be saved.
      }
      return migrated
    }
    return BRIGHTNESS_DEFAULT
  } catch {
    return BRIGHTNESS_DEFAULT
  }
}

const VEIL_ID = 'app-brightness-veil'

function brightnessVeil() {
  let veil = document.getElementById(VEIL_ID)
  if (veil) return veil
  if (!document.body) return null
  veil = document.createElement('div')
  veil.id = VEIL_ID
  veil.setAttribute('aria-hidden', 'true')
  document.body.appendChild(veil)
  return veil
}

export function applyBrightness(percent) {
  const value = clampBrightness(percent)
  const filter = filterFromSlider(value)
  const root = document.getElementById('root')
  // Old versions applied the filter only to #root, which left the body
  // background and position:fixed UI (bottom nav) unfiltered.
  if (root) root.style.removeProperty('filter')
  const html = document.documentElement
  if (filter === 1) html.style.removeProperty('filter')
  else html.style.filter = `brightness(${filter})`
  html.style.setProperty('--app-brightness', String(filter))
  const veil = brightnessVeil()
  if (veil) {
    // Light mode still needs the white veil above 75, because brightness()
    // cannot lift near-white backgrounds. Dark mode stays filter-only so
    // colours stay crisp instead of going grey and foggy.
    const lift = currentTheme() === 'dark' ? 0 : Math.max(0, (filter - 1) / 0.2) * 0.18
    veil.style.opacity = String(lift)
  }
  watchTheme()
  return value
}

let watchingTheme = false

function watchTheme() {
  if (watchingTheme || typeof MutationObserver === 'undefined') return
  watchingTheme = true
  new MutationObserver(() => applyBrightness(readBrightness()))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
}

export function saveBrightness(percent) {
  const value = applyBrightness(percent)
  try {
    window.localStorage.setItem(BRIGHTNESS_KEY, String(value))
  } catch {
    // Local storage may be blocked; the selected brightness still works for this session.
  }
  return value
}
