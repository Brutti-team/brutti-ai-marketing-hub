import { useEffect } from 'react'

// Replaces the look of every native <select> with one shared dropdown (Michelle, 26 Nov 2026):
// golden pill when closed; white panel with a search box and a scrollable list when open.
// The native <select> stays in the page (hidden) and stays the source of truth, so existing code that reads
// or sets its value, or listens for its "change" event, keeps working exactly as before.
// To keep a native select somewhere, give it the attribute data-dd-native.

// Search box (magnifier + "Search…") inside the shared dropdown panel.
// Hidden on Settings, Content Studio and Dashboard (Michelle, 26 Nov 2026). Set true to show again.
const SHOW_SETTINGS_SEARCH = false
const SHOW_STUDIO_SEARCH = false
const SHOW_DASHBOARD_SEARCH = false

function showDropdownSearch(select) {
  if (select.closest('.settings-page')) return SHOW_SETTINGS_SEARCH
  if (select.closest('.content-studio-page, .bm-caption-studio, .bm-caption-form, .content-library')) return SHOW_STUDIO_SEARCH
  if (select.closest('.mmd-shell, .dashboard-page')) return SHOW_DASHBOARD_SEARCH
  return true
}

let uid = 0
const ctrls = new Map()
const SEARCH_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>'

function labelText(select) {
  const own = select.getAttribute('aria-label')
  if (own) return own
  const label = select.closest('label')
  if (label) {
    for (const node of label.childNodes) {
      if (node.nodeType === 3 && node.nodeValue.trim()) return node.nodeValue.trim()
    }
  }
  return ''
}

function readOptions(select) {
  return [...select.options].filter((option) => !option.hidden).map((option) => ({
    index: option.index,
    text: (option.textContent || '').trim(),
    disabled: option.disabled,
    group: option.parentElement?.tagName === 'OPTGROUP' ? String(option.parentElement.label || '').trim() : '',
    lock: option.hasAttribute('data-lock-keep') || option.hasAttribute('data-user-content') || Boolean(option.closest('[data-lock-keep], [data-user-content]')),
  }))
}

function createControl(select) {
  const id = `dd-${++uid}`
  const wrapper = document.createElement('span')
  wrapper.className = 'dd'
  const trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = 'dd-trigger'
  trigger.setAttribute('aria-haspopup', 'listbox')
  trigger.setAttribute('aria-expanded', 'false')
  trigger.setAttribute('aria-controls', `${id}-panel`)
  const value = document.createElement('span')
  value.className = 'dd-value'
  const hint = document.createElement('span')
  hint.className = 'dd-hint'
  hint.hidden = true
  trigger.append(value, hint)
  wrapper.append(trigger)
  select.after(wrapper)
  select.classList.add('dd-native')
  select.tabIndex = -1
  select.setAttribute('aria-hidden', 'true')

  const ctrl = { id, select, wrapper, trigger, value, hint, panel: null, open: false, query: '', active: -1, shown: [], signature: '' }
  trigger.addEventListener('click', () => (ctrl.open ? closePanel(ctrl, true) : openPanel(ctrl)))
  trigger.addEventListener('keydown', (event) => {
    if (ctrl.open) return
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      openPanel(ctrl)
    }
  })
  ctrls.set(select, ctrl)
  syncControl(ctrl)
  return ctrl
}

function syncControl(ctrl) {
  const { select, trigger, value, hint, wrapper } = ctrl
  const selected = select.options[select.selectedIndex]
  const text = selected ? (selected.textContent || '').trim() : ''
  const group = selected?.parentElement?.tagName === 'OPTGROUP' ? String(selected.parentElement.label || '').trim() : ''
  if (value.textContent !== text) value.textContent = text
  if (group) {
    hint.textContent = group
    hint.hidden = false
  } else {
    hint.textContent = ''
    hint.hidden = true
  }
  const lock = selected && (selected.hasAttribute('data-lock-keep') || selected.hasAttribute('data-user-content') || selected.closest('[data-lock-keep], [data-user-content]'))
  if (lock) { value.setAttribute('data-lock-keep', ''); hint.setAttribute('data-lock-keep', '') }
  else { value.removeAttribute('data-lock-keep'); hint.removeAttribute('data-lock-keep') }
  trigger.title = group ? `${text} ${group}`.trim() : text
  const name = labelText(select)
  if (name && trigger.getAttribute('aria-label') !== name) trigger.setAttribute('aria-label', name)
  if (trigger.disabled !== select.disabled) trigger.disabled = select.disabled
  const keep = !!select.closest('.app-language-control, [data-lock-keep]')
  if (keep !== ctrl.keep) { ctrl.keep = keep }
  wrapper.classList.toggle('is-disabled', select.disabled)
  const signature = `${select.selectedIndex}|${[...select.options].map((option) => option.textContent).join('\u0001')}`
  if (ctrl.open && signature !== ctrl.signature) renderList(ctrl)
  ctrl.signature = signature
}

function openPanel(ctrl) {
  if (ctrl.open || ctrl.select.disabled) return
  closeAll()
  const panel = document.createElement('div')
  panel.className = 'dd-panel'
  panel.id = `${ctrl.id}-panel`
  const list = document.createElement('ul')
  list.className = 'dd-list'
  list.setAttribute('role', 'listbox')
  const name = labelText(ctrl.select)
  if (name) list.setAttribute('aria-label', name)
  let input = null
  if (showDropdownSearch(ctrl.select)) {
    const search = document.createElement('div')
    search.className = 'dd-search'
    search.innerHTML = SEARCH_ICON
    input = document.createElement('input')
    input.type = 'text'
    input.className = 'dd-search-input'
    input.placeholder = 'Search…'
    input.setAttribute('aria-label', 'Search')
    input.setAttribute('autocomplete', 'off')
    input.setAttribute('autocapitalize', 'off')
    input.setAttribute('spellcheck', 'false')
    search.append(input)
    panel.append(search, list)
  } else {
    panel.append(list)
  }
  if (ctrl.select.closest('.app-language-control, [data-lock-keep]')) panel.setAttribute('data-lock-keep', '')
  document.body.append(panel)
  Object.assign(ctrl, { panel, input, list, open: true, query: '' })
  ctrl.trigger.setAttribute('aria-expanded', 'true')
  ctrl.wrapper.classList.add('is-open')
  renderList(ctrl)
  placePanel(ctrl)
  if (input) input.addEventListener('input', () => { ctrl.query = input.value; renderList(ctrl, true) })
  list.addEventListener('mousedown', (event) => event.preventDefault())
  list.addEventListener('click', (event) => {
    const row = event.target.closest('[data-index]')
    if (row && !row.classList.contains('is-disabled')) choose(ctrl, Number(row.dataset.index))
  })
  list.addEventListener('mousemove', (event) => {
    const row = event.target.closest('[data-index]')
    if (row && !row.classList.contains('is-disabled')) setActive(ctrl, Number(row.dataset.index), false)
  })
  active = ctrl
  document.addEventListener('pointerdown', onPointerDown, true)
  document.addEventListener('keydown', onKeyDown, true)
  window.addEventListener('resize', onReposition)
  window.addEventListener('scroll', onReposition, true)
  if (input && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) input.focus({ preventScroll: true })
}

let active = null

function renderList(ctrl, keepActive) {
  const { select, list } = ctrl
  const query = ctrl.query.trim().toLowerCase()
  const options = readOptions(select)
  ctrl.shown = options.filter((option) => !query || option.text.toLowerCase().includes(query) || option.group.toLowerCase().includes(query))
  list.textContent = ''
  if (!ctrl.shown.length) {
    const empty = document.createElement('li')
    empty.className = 'dd-empty'
    empty.textContent = 'No results'
    list.append(empty)
    ctrl.active = -1
    return
  }
  let lastGroup = null
  ctrl.shown.forEach((option) => {
    if (option.group && option.group !== lastGroup) {
      const header = document.createElement('li')
      header.className = 'dd-group'
      header.setAttribute('aria-hidden', 'true')
      header.textContent = option.group
      list.append(header)
      lastGroup = option.group
    }
    const row = document.createElement('li')
    row.className = 'dd-option'
    row.id = `${ctrl.id}-o${option.index}`
    row.setAttribute('role', 'option')
    if (option.lock) row.setAttribute('data-lock-keep', '')
    row.dataset.index = String(option.index)
    row.textContent = option.text
    const selected = option.index === select.selectedIndex
    row.setAttribute('aria-selected', selected ? 'true' : 'false')
    if (selected) row.classList.add('is-selected')
    if (option.disabled) { row.classList.add('is-disabled'); row.setAttribute('aria-disabled', 'true') }
    list.append(row)
  })
  const stillShown = keepActive && ctrl.shown.some((option) => option.index === ctrl.active)
  if (!stillShown) {
    const pick = ctrl.shown.find((option) => option.index === select.selectedIndex && !option.disabled) || ctrl.shown.find((option) => !option.disabled)
    ctrl.active = pick ? pick.index : -1
  }
  paintActive(ctrl, !keepActive)
}

function paintActive(ctrl, scroll) {
  const { list, input } = ctrl
  list.querySelectorAll('.is-active').forEach((row) => row.classList.remove('is-active'))
  const row = ctrl.active >= 0 ? list.querySelector(`[data-index="${ctrl.active}"]`) : null
  if (row) {
    row.classList.add('is-active')
    input?.setAttribute('aria-activedescendant', row.id)
    if (scroll) row.scrollIntoView({ block: 'nearest' })
  } else input?.removeAttribute('aria-activedescendant')
}

function setActive(ctrl, index, scroll = true) {
  ctrl.active = index
  paintActive(ctrl, scroll)
}

function move(ctrl, step) {
  const enabled = ctrl.shown.filter((option) => !option.disabled)
  if (!enabled.length) return
  let at = enabled.findIndex((option) => option.index === ctrl.active)
  at = at < 0 ? (step > 0 ? 0 : enabled.length - 1) : Math.min(enabled.length - 1, Math.max(0, at + step))
  setActive(ctrl, enabled[at].index)
}

function choose(ctrl, index) {
  const { select } = ctrl
  if (index !== select.selectedIndex) {
    select.selectedIndex = index
    select.dispatchEvent(new Event('input', { bubbles: true }))
    select.dispatchEvent(new Event('change', { bubbles: true }))
  }
  closePanel(ctrl, true)
  syncControl(ctrl)
}

function placePanel(ctrl) {
  const { panel, trigger } = ctrl
  if (!panel) return
  const rect = trigger.getBoundingClientRect()
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const width = Math.min(Math.max(rect.width, 220), vw - 16)
  const left = Math.max(8, Math.min(rect.left, vw - width - 8))
  panel.style.width = `${width}px`
  panel.style.left = `${left}px`
  const gap = 6
  const below = vh - rect.bottom - gap - 8
  const above = rect.top - gap - 8
  const flip = below < 200 && above > below
  const room = Math.max(140, flip ? above : below)
  panel.style.maxHeight = `${Math.min(300, room)}px`
  if (flip) {
    panel.style.top = 'auto'
    panel.style.bottom = `${vh - rect.top + gap}px`
  } else {
    panel.style.bottom = 'auto'
    panel.style.top = `${rect.bottom + gap}px`
  }
}

let frame = 0
function onReposition(event) {
  if (!active || (event?.target && active.panel?.contains(event.target))) return
  window.cancelAnimationFrame(frame)
  frame = window.requestAnimationFrame(() => active && placePanel(active))
}

function onPointerDown(event) {
  if (!active) return
  if (active.panel?.contains(event.target) || active.wrapper.contains(event.target)) return
  closePanel(active, false)
}

function onKeyDown(event) {
  const ctrl = active
  if (!ctrl) return
  const { key } = event
  if (key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closePanel(ctrl, true)
  } else if (key === 'ArrowDown' || key === 'ArrowUp') {
    event.preventDefault()
    move(ctrl, key === 'ArrowDown' ? 1 : -1)
  } else if (key === 'Home' || key === 'End') {
    if (event.target === ctrl.input && ctrl.query) return
    event.preventDefault()
    const enabled = ctrl.shown.filter((option) => !option.disabled)
    if (enabled.length) setActive(ctrl, enabled[key === 'Home' ? 0 : enabled.length - 1].index)
  } else if (key === 'Enter' || (key === ' ' && event.target !== ctrl.input)) {
    event.preventDefault()
    event.stopPropagation()
    if (ctrl.active >= 0) choose(ctrl, ctrl.active)
  } else if (key === 'Tab') {
    closePanel(ctrl, false)
  }
}

function closePanel(ctrl, refocus) {
  if (!ctrl.open) return
  ctrl.open = false
  ctrl.panel?.remove()
  ctrl.panel = null
  ctrl.trigger.setAttribute('aria-expanded', 'false')
  ctrl.wrapper.classList.remove('is-open')
  if (active === ctrl) {
    active = null
    document.removeEventListener('pointerdown', onPointerDown, true)
    document.removeEventListener('keydown', onKeyDown, true)
    window.removeEventListener('resize', onReposition)
    window.removeEventListener('scroll', onReposition, true)
  }
  if (refocus) ctrl.trigger.focus({ preventScroll: true })
}

function closeAll() {
  ctrls.forEach((ctrl) => closePanel(ctrl, false))
}

function eligible(select) {
  return !select.multiple && !(select.size > 1) && !select.hasAttribute('data-dd-native') && !select.closest('.dd-panel')
}

function sweep() {
  document.querySelectorAll('select').forEach((select) => {
    if (!ctrls.has(select) && eligible(select)) createControl(select)
  })
  ctrls.forEach((ctrl, select) => {
    if (!select.isConnected) {
      closePanel(ctrl, false)
      ctrl.wrapper.remove()
      ctrls.delete(select)
    } else if (ctrl.wrapper.previousElementSibling !== select) {
      select.after(ctrl.wrapper)
    }
    if (select.isConnected) syncControl(ctrl)
  })
}

export default function DropdownEnhancer() {
  useEffect(() => {
    let queued = 0
    const schedule = () => {
      if (queued) return
      queued = window.requestAnimationFrame(() => { queued = 0; sweep() })
    }
    const observer = new MutationObserver((records) => {
      if (records.every((record) => record.target.closest?.('.dd, .dd-panel') || record.target.classList?.contains('dd'))) return
      schedule()
    })
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    const timer = window.setInterval(schedule, 400)
    document.addEventListener('change', schedule, true)
    sweep()
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
      window.cancelAnimationFrame(queued)
      document.removeEventListener('change', schedule, true)
    }
  }, [])
  return null
}
