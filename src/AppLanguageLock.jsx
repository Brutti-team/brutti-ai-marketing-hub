import { useEffect } from 'react'

const STORAGE_KEY = 'brutti-ui-language-v1'
const LANGUAGE_EVENT = 'brutti:languagechange'
const SUPPORTED = new Set(['bm', 'en'])

function readLanguage() {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return SUPPORTED.has(saved) ? saved : 'bm'
}

function applyLanguage(language) {
  const next = SUPPORTED.has(language) ? language : 'bm'
  window.localStorage.setItem(STORAGE_KEY, next)
  document.documentElement.lang = next === 'bm' ? 'ms' : 'en'
  document.documentElement.dataset.bruttiUiLanguage = next
  window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: { language: next } }))
  return next
}

export default function AppLanguageLock() {
  useEffect(() => {
    applyLanguage(readLanguage())
  }, [])

  return null
}

export { STORAGE_KEY, LANGUAGE_EVENT }
