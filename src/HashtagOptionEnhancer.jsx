import { useEffect } from 'react'

const STORAGE_KEY = 'brutti-content-studio-hashtag-count-v1'

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function findActiveStudio() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('.page-header h1')?.textContent?.trim() === 'Content Studio')
}

function findLabelControl(root, labelText, selector) {
  const label = [...root.querySelectorAll('label')]
    .find((item) => clean(item.textContent).startsWith(labelText))
  return label?.querySelector(selector) || null
}

function getSelectedCount() {
  const value = Number(window.localStorage.getItem(STORAGE_KEY) || 0)
  return value === 1 || value === 2 ? value : 0
}

function chooseHashtags(page, count) {
  if (!count) return []
  const title = findLabelControl(page, 'Content title', 'input')?.value || ''
  const type = findLabelControl(page, 'Content type', 'select')?.value || ''
  const product = findLabelControl(page, 'Product', 'select')?.value || ''
  const brief = findLabelControl(page, 'Verified facts / direction', 'textarea')?.value || ''
  const haystack = `${title} ${type} ${product} ${brief}`.toLowerCase()

  const tags = ['#BRUTTI']
  let second = '#ProudlySabahan'
  if (/brutti builders|interior|renovation|design \+ build|design and build/.test(haystack)) second = '#BruttiBuilders'
  else if (/artisan|craft|workshop|kilang|woodwork|metalwork/.test(haystack)) second = '#ProudlySabahan'
  else if (/furniture|cabinet|wardrobe|storage|rack|shelf|bed|table|kiosk|product/.test(haystack)) second = '#FurnitureSabah'
  tags.push(second)
  return tags.slice(0, count)
}

function stripHashtags(value = '') {
  return String(value || '')
    .split('\n')
    .filter((line) => !/^\s*#(?:[\p{L}\p{N}_-]+)(?:\s+#(?:[\p{L}\p{N}_-]+))*\s*$/u.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function setReactValue(element, value) {
  if (!element) return
  const prototype = Object.getPrototypeOf(element)
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  if (setter) setter.call(element, value)
  else element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function applyHashtags(page) {
  const output = page.querySelector('.output-editor-label textarea')
  if (!output) return
  const select = page.querySelector('.soul-hashtag-select')
  const count = select ? Number(select.value || 0) : getSelectedCount()
  const base = stripHashtags(output.value)
  const tags = chooseHashtags(page, count)
  const next = tags.length ? `${base}\n\n${tags.join(' ')}` : base
  if (next !== output.value) setReactValue(output, next)
  window.setTimeout(() => patchSoulChecklist(page), 20)
}

function hashtagCount(value = '') {
  return (String(value).match(/#[\p{L}\p{N}_-]+/gu) || []).length
}

function patchSoulChecklist(page) {
  const output = page.querySelector('.output-editor-label textarea')
  const count = hashtagCount(output?.value || '')
  const rows = [...page.querySelectorAll('.soul-checklist > span')]
  const hashtagRow = rows.find((row) => /No hashtag block|Hashtag limit/i.test(row.textContent || ''))
  if (hashtagRow) {
    const pass = count <= 2
    hashtagRow.className = pass ? 'pass' : 'flag'
    hashtagRow.textContent = `${pass ? '✓' : '!'} Hashtag limit (0–2)`
  }

  const rule = [...page.querySelectorAll('.soul-source-rules span')]
    .find((item) => /No hashtags|hashtags/i.test(item.textContent || ''))
  if (rule && rule.textContent !== 'Default 0 · max 2 hashtags') rule.textContent = 'Default 0 · max 2 hashtags'
}

function addHashtagControl(page) {
  if (page.querySelector('.soul-hashtag-control')) {
    patchSoulChecklist(page)
    return
  }

  const form = page.querySelector('.generator-form')
  if (!form) return

  const wrapper = document.createElement('label')
  wrapper.className = 'soul-hashtag-control'
  const title = document.createElement('span')
  title.className = 'soul-hashtag-label'
  title.textContent = 'Hashtag'
  const select = document.createElement('select')
  select.className = 'soul-hashtag-select'
  ;[
    ['0', 'Tiada hashtag — default Brutti Soul'],
    ['1', '1 hashtag sahaja'],
    ['2', '2 hashtag maksimum'],
  ].forEach(([value, label]) => {
    const option = document.createElement('option')
    option.value = value
    option.textContent = label
    select.append(option)
  })
  select.value = String(getSelectedCount())
  const note = document.createElement('small')
  note.textContent = 'Soul Master asal tidak menggunakan hashtag. Pilihan ini hanya override bila diperlukan, maksimum 2.'
  wrapper.append(title, select, note)

  const oldCheckbox = form.querySelector('.checkbox-row')
  if (oldCheckbox) oldCheckbox.insertAdjacentElement('beforebegin', wrapper)
  else form.querySelector('button[type="submit"]')?.insertAdjacentElement('beforebegin', wrapper)

  select.addEventListener('change', () => {
    window.localStorage.setItem(STORAGE_KEY, select.value)
    applyHashtags(page)
  })

  const scheduleApply = (delay = 180) => window.setTimeout(() => applyHashtags(page), delay)
  if (form.dataset.hashtagGenerateBound !== '1') {
    form.dataset.hashtagGenerateBound = '1'
    form.addEventListener('submit', () => scheduleApply(220), true)
  }

  const outputArea = page.querySelector('.generator-output')
  if (outputArea && outputArea.dataset.hashtagActionsBound !== '1') {
    outputArea.dataset.hashtagActionsBound = '1'
    outputArea.addEventListener('click', (event) => {
      const button = event.target.closest('button')
      if (!button) return
      if (button.closest('.rewrite-actions') || button.closest('.variation-row')) scheduleApply(220)
    }, true)
  }

  patchSoulChecklist(page)
}

export default function HashtagOptionEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    let scheduled = false
    const sync = () => {
      if (scheduled) return
      scheduled = true
      window.requestAnimationFrame(() => {
        const page = findActiveStudio()
        if (page) addHashtagControl(page)
        scheduled = false
      })
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  return null
}
