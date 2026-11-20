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

export function filterFromSlider(value) {
  const slider = clampBrightness(value)
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

export function applyBrightness(percent) {
  const value = clampBrightness(percent)
  const filter = filterFromSlider(value)
  const root = document.getElementById('root')
  if (root) root.style.filter = `brightness(${filter})`
  document.documentElement.style.setProperty('--app-brightness', String(filter))
  return value
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
