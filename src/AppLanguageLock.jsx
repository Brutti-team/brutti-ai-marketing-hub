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

function activeSettingsPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => {
      if (page.offsetParent === null) return false
      const title = page.querySelector('.page-header h1')?.textContent?.trim()
      return title === 'Settings' || Boolean(page.querySelector('.cloud-access-panel'))
    }) || null
}

function createLanguagePanel(page) {
  if (page.querySelector('[data-brutti-language-lock="true"]')) return

  const pageHeader = page.querySelector('.page-header')
  const panel = document.createElement('section')
  panel.className = 'panel app-language-lock-panel'
  panel.dataset.bruttiLanguageLock = 'true'

  const heading = document.createElement('div')
  heading.className = 'panel-heading'
  const headingInner = document.createElement('div')
  const eyebrow = document.createElement('span')
  eyebrow.className = 'eyebrow'
  const title = document.createElement('h3')
  headingInner.append(eyebrow, title)
  heading.append(headingInner)

  const row = document.createElement('div')
  row.className = 'setting-row'
  const copy = document.createElement('div')
  const label = document.createElement('strong')
  const description = document.createElement('p')
  copy.append(label, description)

  const select = document.createElement('select')
  select.setAttribute('aria-label', 'App language')
  select.innerHTML = '<option value="bm">Bahasa Melayu</option><option value="en">English</option>'

  const render = (language) => {
    const bm = language === 'bm'
    eyebrow.textContent = bm ? 'BAHASA APLIKASI' : 'APP LANGUAGE'
    title.textContent = bm ? 'Bahasa Brutti AI' : 'Brutti AI language'
    label.textContent = bm ? 'Bahasa pilihan' : 'Preferred language'
    description.textContent = bm
      ? 'Pilih bahasa antaramuka Brutti AI. Fasa low-risk ini hanya mengunci pilihan bahasa; label teknikal Content Studio dan Planner dikekalkan supaya fungsi sedia ada tidak terganggu.'
      : 'Choose the Brutti AI interface language. This low-risk phase stores the preference while keeping system-critical Content Studio and Planner labels unchanged.'
    select.value = language
  }

  select.addEventListener('change', () => render(applyLanguage(select.value)))
  row.append(copy, select)
  panel.append(heading, row)

  if (pageHeader) pageHeader.insertAdjacentElement('afterend', panel)
  else page.prepend(panel)

  render(readLanguage())
}

export default function AppLanguageLock() {
  useEffect(() => {
    const initial = applyLanguage(readLanguage())
    let timer = 0

    const sync = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const page = activeSettingsPage()
        if (page) createLanguagePanel(page)
      }, 30)
    }

    const onLanguageChange = () => {
      const page = activeSettingsPage()
      const select = page?.querySelector('[data-brutti-language-lock="true"] select')
      if (select) select.value = readLanguage()
    }

    document.documentElement.dataset.bruttiUiLanguage = initial
    sync()
    document.addEventListener('click', sync, true)
    window.addEventListener(LANGUAGE_EVENT, onLanguageChange)

    const root = document.getElementById('root')
    const observer = root ? new MutationObserver(sync) : null
    observer?.observe(root, { childList: true, subtree: true })

    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
      document.removeEventListener('click', sync, true)
      window.removeEventListener(LANGUAGE_EVENT, onLanguageChange)
    }
  }, [])

  return null
}

export { STORAGE_KEY, LANGUAGE_EVENT }
