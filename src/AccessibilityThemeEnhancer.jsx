import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const THEME_KEY = 'brutti-ui-theme'

function readInitialTheme() {
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function ThemeToggle({ theme, onChange }) {
  return (
    <div className="theme-toggle" role="group" aria-label="Website colour mode">
      <button
        type="button"
        className={theme === 'light' ? 'active' : ''}
        aria-pressed={theme === 'light'}
        onClick={() => onChange('light')}
      >
        <span className="theme-dot theme-dot-light" aria-hidden="true" />
        Light
      </button>
      <button
        type="button"
        className={theme === 'dark' ? 'active' : ''}
        aria-pressed={theme === 'dark'}
        onClick={() => onChange('dark')}
      >
        <span className="theme-dot theme-dot-dark" aria-hidden="true" />
        Dark
      </button>
    </div>
  )
}

export default function AccessibilityThemeEnhancer() {
  const [theme, setTheme] = useState(readInitialTheme)
  const [target, setTarget] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Local storage may be blocked; the selected theme still works for this session.
    }
  }, [theme])

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    let timer = 0
    const sync = () => {
      const nextTarget = root.querySelector('.topbar-status')
      setTarget((current) => current === nextTarget ? current : nextTarget)
    }
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, 60)
    }

    sync()
    document.addEventListener('click', schedule, true)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', schedule, true)
    }
  }, [])

  if (!target) return null
  return createPortal(<ThemeToggle theme={theme} onChange={setTheme} />, target)
}
