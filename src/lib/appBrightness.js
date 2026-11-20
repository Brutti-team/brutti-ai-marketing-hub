export const BRIGHTNESS_KEY = 'brutti-ui-brightness'
export const BRIGHTNESS_MIN = 60
export const BRIGHTNESS_MAX = 120
export const BRIGHTNESS_DEFAULT = 100

export function clampBrightness(value) {
  const next = Number(value)
  if (!Number.isFinite(next)) return BRIGHTNESS_DEFAULT
  return Math.min(BRIGHTNESS_MAX, Math.max(BRIGHTNESS_MIN, Math.round(next)))
}

export function readBrightness() {
  try {
    const stored = window.localStorage.getItem(BRIGHTNESS_KEY)
    return stored == null ? BRIGHTNESS_DEFAULT : clampBrightness(stored)
  } catch {
    return BRIGHTNESS_DEFAULT
  }
}

export function applyBrightness(percent) {
  const value = clampBrightness(percent)
  const root = document.getElementById('root')
  if (root) root.style.filter = `brightness(${value / 100})`
  document.documentElement.style.setProperty('--app-brightness', String(value / 100))
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
