import { useEffect } from 'react'

const STORAGE_KEY = 'brutti-content-language-default'
const OPTIONS = ['Bahasa Melayu', 'BM + English', 'English']

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function activePage(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('.page-header h1')?.textContent?.trim() === title) || null
}

function field(root, labelPrefix, selector) {
  const label = [...root.querySelectorAll('label')]
    .find((item) => clean(item.textContent).startsWith(labelPrefix))
  return label?.querySelector(selector) || null
}

function setReactValue(element, value) {
  if (!element || element.value === value) return
  const prototype = Object.getPrototypeOf(element)
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  if (setter) setter.call(element, value)
  else element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function savedLanguage() {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return OPTIONS.includes(saved) ? saved : 'Bahasa Melayu'
}

function syncSettingsPanel() {
  const page = activePage('Settings')
  if (!page) return

  let panel = page.querySelector('.content-language-settings')
  if (!panel) {
    panel = document.createElement('section')
    panel.className = 'panel content-language-settings'
    panel.innerHTML = `
      <div class="panel-heading">
        <div><span class="eyebrow">CONTENT LANGUAGE</span><h3>Default writing language</h3></div>
        <span class="status-chip local"><span></span>Saved locally</span>
      </div>
      <div class="setting-row">
        <div><strong>Content Studio default</strong><p>Digunakan untuk content baru yang masih kosong. Kamu masih boleh ubah language untuk setiap caption.</p></div>
        <select data-content-language-default aria-label="Content Studio default language">
          ${OPTIONS.map((option) => `<option value="${option}">${option}</option>`).join('')}
        </select>
      </div>
      <p class="settings-copy">Bahasa Melayu = BM/Sabahan. BM + English = campuran natural ikut Brutti Soul Master. English = English-first.</p>
    `
    const settingsGrid = page.querySelector('.settings-grid')
    if (settingsGrid) settingsGrid.insertAdjacentElement('beforebegin', panel)
    else page.append(panel)
  }

  const select = panel.querySelector('[data-content-language-default]')
  if (select && document.activeElement !== select) select.value = savedLanguage()

  const freeAssistRow = [...page.querySelectorAll('.connections-list article')]
    .find((row) => /Free AI Assist Mode/i.test(row.textContent || ''))
  const detail = freeAssistRow?.querySelector('p')
  if (detail) detail.textContent = 'Content Studio Engine V2, Brutti Soul Master, verified-fact guards dan human review.'
}

function applyDefaultToEmptyStudio() {
  const page = activePage('Content Studio')
  if (!page) return
  const title = field(page, 'Content title', 'input')
  const brief = field(page, 'Verified facts', 'textarea') || field(page, 'Verified facts / direction', 'textarea')
  const language = field(page, 'Language', 'select')
  if (!language || clean(title?.value) || clean(brief?.value)) return
  setReactValue(language, savedLanguage())
}

function polishSidebarCopy() {
  const card = document.querySelector('#root .system-card p')
  if (card && /Free Assist templates/i.test(card.textContent || '')) {
    card.textContent = 'Content Studio Engine V2, Sheets and Drive are ready.'
  }
}

export default function ContentLanguagePreferenceEnhancer() {
  useEffect(() => {
    let timer = 0
    const schedule = (delay = 60) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        syncSettingsPanel()
        applyDefaultToEmptyStudio()
        polishSidebarCopy()
      }, delay)
    }

    const onChange = (event) => {
      if (!event.target.matches?.('[data-content-language-default]')) return
      if (OPTIONS.includes(event.target.value)) window.localStorage.setItem(STORAGE_KEY, event.target.value)
    }

    const onClick = (event) => {
      if (event.target.closest?.('.nav-link, .mobile-bottom-navigation button')) schedule(80)
    }

    const root = document.getElementById('root')
    const observer = new MutationObserver(() => schedule())
    if (root) observer.observe(root, { childList: true, subtree: true })

    document.addEventListener('change', onChange, true)
    document.addEventListener('click', onClick, true)
    schedule(80)

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('change', onChange, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
