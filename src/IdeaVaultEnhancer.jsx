import { useEffect } from 'react'

const STORAGE_KEY = 'brutti-idea-vault-v1'
const STYLE_ID = 'brutti-idea-vault-style'
const FOCUS_KEY = 'brutti-idea-vault-focus-id'

const STOP_WORDS = new Set([
  'yang','dan','untuk','dengan','dari','dalam','boleh','akan','sudah','juga','atau','pada','satu','kami','kita','this','that','with','from','into','about','brutti','content','idea','today','recommendation',
])

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function loadIdeas() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function saveIdeas(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 250)))
}

function findNavButton(label) {
  return [...document.querySelectorAll('#root .nav-link')]
    .find((button) => button.querySelector('span')?.textContent?.trim() === label) || null
}

function findActivePage(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && (page.classList.contains('dashboard-page') ? title === 'Dashboard' : page.querySelector('.page-header h1')?.textContent?.trim() === title)) || null
}

function waitFor(find, attempts = 40) {
  return new Promise((resolve) => {
    let count = 0
    const tick = () => {
      const value = find()
      if (value || count >= attempts) {
        resolve(value || null)
        return
      }
      count += 1
      window.setTimeout(tick, 50)
    }
    tick()
  })
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

function findLabelControl(root, labelText, selector) {
  const label = [...root.querySelectorAll('label')]
    .find((item) => clean(item.textContent).startsWith(labelText))
  return label?.querySelector(selector) || null
}

function tokens(value = '') {
  return [...new Set(clean(value).toLowerCase().replace(/[^a-z0-9\u00c0-\u024f]+/g, ' ').split(' ')
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word)))]
}

function matchScore(idea, recommendationText) {
  const left = tokens([idea.title, idea.notes, idea.type, idea.product].join(' '))
  const right = tokens(recommendationText)
  if (!left.length || !right.length) return 0
  const rightSet = new Set(right)
  const overlap = left.filter((word) => rightSet.has(word)).length
  if (overlap < 2) return 0
  return overlap / Math.max(2, Math.min(left.length, right.length))
}

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .planner-workspace-split{display:grid;grid-template-columns:minmax(420px,.8fr) minmax(620px,1.2fr);gap:18px;align-items:start;margin:18px 0 24px}
    .planner-calendar-workspace{min-width:0}
    .planner-calendar-workspace .week-calendar{min-height:0;grid-template-columns:repeat(7,minmax(88px,1fr))}
    .planner-calendar-workspace .calendar-day{min-height:220px}
    .idea-vault-panel{margin:0;padding:18px;border:1px solid var(--border,rgba(120,120,120,.2));border-radius:18px;background:var(--surface,#fff)}
    .idea-vault-head{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap}
    .idea-vault-body{margin-top:14px}
    .idea-vault-folder{margin-top:16px;border:1px solid var(--border,rgba(120,120,120,.2));border-radius:12px;background:rgba(127,127,127,.035)}
    .idea-vault-folder summary{display:flex;align-items:center;gap:9px;cursor:pointer;padding:13px 14px;font-weight:800;list-style:none}
    .idea-vault-folder summary::-webkit-details-marker{display:none}
    .idea-vault-folder summary::before{content:'▸';font-size:.9rem;transition:transform .16s ease}
    .idea-vault-folder[open] summary::before{transform:rotate(90deg)}
    .idea-vault-folder-content{padding:0 14px 14px}
    .idea-vault-head h2{margin:4px 0 5px;font-size:1.15rem}.idea-vault-head p{margin:0;max-width:720px;opacity:.72}
    .idea-vault-eyebrow{font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.62}
    .idea-vault-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:16px 0}
    .idea-vault-form label{display:grid;gap:6px;font-size:.82rem;font-weight:700}.idea-vault-form .wide{grid-column:1/-1}
    .idea-vault-form input,.idea-vault-form select,.idea-vault-form textarea,.idea-vault-search{width:100%;box-sizing:border-box;border:1px solid var(--border,rgba(120,120,120,.25));border-radius:10px;padding:10px 11px;background:var(--surface,#fff);color:inherit;font:inherit}
    .idea-vault-form textarea{min-height:82px;resize:vertical}.idea-vault-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;grid-column:1/-1}
    .idea-vault-toolbar{display:flex;gap:10px;align-items:center;justify-content:space-between;margin:14px 0 10px;flex-wrap:wrap}.idea-vault-search{max-width:420px}
    .idea-vault-count{font-size:.82rem;opacity:.66}.idea-vault-list{display:grid;gap:10px}
    .idea-vault-card{border:1px solid var(--border,rgba(120,120,120,.2));border-radius:14px;padding:14px;background:rgba(127,127,127,.035)}
    .idea-vault-card-top{display:flex;gap:12px;justify-content:space-between;align-items:flex-start}.idea-vault-card h3{margin:0 0 5px;font-size:1rem}.idea-vault-card p{margin:8px 0 0;white-space:pre-wrap;opacity:.8}
    .idea-vault-meta{display:flex;gap:7px;flex-wrap:wrap;font-size:.75rem;opacity:.7}.idea-vault-pill{padding:3px 7px;border-radius:999px;background:rgba(127,127,127,.11)}
    .idea-vault-card-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.idea-vault-empty{padding:18px;text-align:center;border:1px dashed var(--border,rgba(120,120,120,.25));border-radius:12px;opacity:.7}
    .idea-vault-match{margin-top:12px;padding:11px 13px;border-radius:12px;background:rgba(127,127,127,.08);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.idea-vault-match strong{display:block}.idea-vault-match small{opacity:.7}
    @media(max-width:1380px){.planner-workspace-split{grid-template-columns:1fr}.planner-calendar-workspace .calendar-day{min-height:0}}
    @media(max-width:760px){.idea-vault-form{grid-template-columns:1fr}.idea-vault-form .wide{grid-column:auto}}
  `
  document.head.append(style)
}

function button(text, className = 'button secondary') {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = className
  element.textContent = text
  return element
}

async function useIdeaInStudio(idea) {
  findNavButton('Content Studio')?.click()
  const page = await waitFor(() => findActivePage('Content Studio'))
  if (!page) return
  await waitFor(() => page.querySelector('.generator-form'))

  setReactValue(findLabelControl(page, 'Content title', 'input'), idea.title)
  const typeSelect = findLabelControl(page, 'Content type', 'select')
  const typeExists = [...(typeSelect?.options || [])].some((option) => option.value === idea.type)
  if (typeExists) setReactValue(typeSelect, idea.type)

  const productSelect = findLabelControl(page, 'Product', 'select')
  const productExists = [...(productSelect?.options || [])].some((option) => option.value === idea.product)
  if (productExists) setReactValue(productSelect, idea.product)

  setReactValue(findLabelControl(page, 'Verified facts / direction', 'textarea'), idea.notes)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function createField(labelText, control, wide = false) {
  const label = document.createElement('label')
  if (wide) label.className = 'wide'
  const span = document.createElement('span')
  span.textContent = labelText
  label.append(span, control)
  return label
}

function mountVault(page) {
  if (!page || page.querySelector('.idea-vault-panel')) return

  const panel = document.createElement('section')
  panel.className = 'idea-vault-panel'
  panel.dataset.ideaVault = 'v1-lightweight'

  const head = document.createElement('div')
  head.className = 'idea-vault-head'
  const headCopy = document.createElement('div')
  const eyebrow = document.createElement('span')
  eyebrow.className = 'idea-vault-eyebrow'
  eyebrow.textContent = 'Future content'
  const title = document.createElement('h2')
  title.textContent = 'Idea Vault'
  const description = document.createElement('p')
  description.textContent = 'Simpan idea yang belum ada tarikh. Ia tidak masuk Calendar sehingga kamu sendiri decide bila mahu guna.'
  headCopy.append(eyebrow, title, description)
  head.append(headCopy)

  const body = document.createElement('div')
  body.className = 'idea-vault-body'

  const savedFolder = document.createElement('details')
  savedFolder.className = 'idea-vault-folder'
  const savedSummary = document.createElement('summary')
  savedFolder.append(savedSummary)
  const savedFolderContent = document.createElement('div')
  savedFolderContent.className = 'idea-vault-folder-content'
  savedFolder.append(savedFolderContent)

  const form = document.createElement('form')
  form.className = 'idea-vault-form'
  const titleInput = document.createElement('input')
  titleInput.required = true
  titleInput.placeholder = 'Contoh: Cerita custom kiosk untuk event'
  const typeSelect = document.createElement('select')
  ;['Brand Awareness','Behind The Scenes','Product Highlight','Educational','Customer Story','Promotion','General'].forEach((value) => {
    const option = document.createElement('option'); option.value = value; option.textContent = value; typeSelect.append(option)
  })
  const notesInput = document.createElement('textarea')
  notesInput.placeholder = 'Verified facts, angle, hook, reference atau apa saja yang kamu tidak mahu lupa.'

  form.append(
    createField('Idea / title', titleInput, true),
    createField('Content type', typeSelect),
    createField('Notes / facts', notesInput, true),
  )

  const formActions = document.createElement('div')
  formActions.className = 'idea-vault-actions'
  const saveButton = button('Save Idea', 'button primary')
  saveButton.type = 'submit'
  const helper = document.createElement('small')
  helper.textContent = 'No date required · local lightweight storage'
  formActions.append(saveButton, helper)
  form.append(formActions)

  const toolbar = document.createElement('div')
  toolbar.className = 'idea-vault-toolbar'
  const search = document.createElement('input')
  search.type = 'search'
  search.className = 'idea-vault-search'
  search.placeholder = 'Search saved ideas…'
  const count = document.createElement('span')
  count.className = 'idea-vault-count'
  toolbar.append(search, count)

  const list = document.createElement('div')
  list.className = 'idea-vault-list'

  let ideas = loadIdeas()

  const render = () => {
    const query = clean(search.value).toLowerCase()
    const filtered = ideas
      .filter((idea) => !query || [idea.title, idea.notes, idea.type, idea.product, idea.target, idea.status].join(' ').toLowerCase().includes(query))
      .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)))
    count.textContent = `${filtered.length} of ${ideas.length} saved idea${ideas.length === 1 ? '' : 's'}`
    savedSummary.textContent = `Saved ideas (${ideas.length}) — open folder`
    list.replaceChildren()

    if (!filtered.length) {
      const empty = document.createElement('div')
      empty.className = 'idea-vault-empty'
      empty.textContent = ideas.length ? 'Tiada idea yang match dengan carian ni.' : 'Belum ada idea disimpan. Save saja dulu walaupun belum tahu bila mahu post.'
      list.append(empty)
      return
    }

    filtered.forEach((idea) => {
      const card = document.createElement('article')
      card.className = 'idea-vault-card'
      card.dataset.ideaId = idea.id
      const top = document.createElement('div')
      top.className = 'idea-vault-card-top'
      const copy = document.createElement('div')
      const heading = document.createElement('h3')
      heading.textContent = idea.title
      const meta = document.createElement('div')
      meta.className = 'idea-vault-meta'
      ;[idea.status || 'Idea', idea.type, idea.priority, idea.product, idea.target].filter(Boolean).forEach((value) => {
        const pill = document.createElement('span'); pill.className = 'idea-vault-pill'; pill.textContent = value; meta.append(pill)
      })
      copy.append(heading, meta)
      top.append(copy)
      card.append(top)
      if (idea.notes) { const notes = document.createElement('p'); notes.textContent = idea.notes; card.append(notes) }

      const actions = document.createElement('div')
      actions.className = 'idea-vault-card-actions'
      const useButton = button('Use in Content Studio')
      useButton.addEventListener('click', () => useIdeaInStudio(idea))
      const readyButton = button(idea.status === 'Ready' ? 'Mark as Idea' : 'Mark Ready')
      readyButton.addEventListener('click', () => {
        ideas = ideas.map((item) => item.id === idea.id ? { ...item, status: item.status === 'Ready' ? 'Idea' : 'Ready', updatedAt: new Date().toISOString() } : item)
        saveIdeas(ideas); render()
      })
      const deleteButton = button('Delete')
      deleteButton.addEventListener('click', () => {
        ideas = ideas.filter((item) => item.id !== idea.id)
        saveIdeas(ideas); render()
      })
      actions.append(useButton, readyButton, deleteButton)
      card.append(actions)
      list.append(card)
    })

    const focusId = window.sessionStorage.getItem(FOCUS_KEY)
    if (focusId) {
      window.sessionStorage.removeItem(FOCUS_KEY)
      window.setTimeout(() => list.querySelector(`[data-idea-id="${CSS.escape(focusId)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const now = new Date().toISOString()
    ideas.push({
      id: `idea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: clean(titleInput.value),
      type: typeSelect.value,
      notes: clean(notesInput.value),
      status: 'Idea',
      createdAt: now,
      updatedAt: now,
    })
    saveIdeas(ideas)
    form.reset()
    typeSelect.value = 'Brand Awareness'
    render()
  })
  search.addEventListener('input', render)

  savedFolderContent.append(toolbar, list)
  body.append(form, savedFolder)
  panel.append(head, body)
  arrangePlannerLayout(page, panel)
  render()
}

function arrangePlannerLayout(page, panel) {
  const existing = page.querySelector('.planner-workspace-split')
  if (existing) {
    if (!existing.contains(panel)) existing.prepend(panel)
    return
  }

  const header = page.querySelector('.page-header')
  const summary = page.querySelector('.dynamic-planner-summary')
  const calendar = page.querySelector('.week-calendar')
  if (!header?.parentNode || !summary || !calendar) {
    if (header?.nextSibling) header.parentNode.insertBefore(panel, header.nextSibling)
    else page.prepend(panel)
    return
  }

  const workspace = document.createElement('div')
  workspace.className = 'planner-workspace-split'
  const calendarWorkspace = document.createElement('div')
  calendarWorkspace.className = 'planner-calendar-workspace'
  calendarWorkspace.append(summary, calendar)
  workspace.append(panel, calendarWorkspace)
  header.insertAdjacentElement('afterend', workspace)
}

function mountDashboardMatch(page) {
  if (!page || page.querySelector('.idea-vault-match')) return
  const ideas = loadIdeas()
  if (!ideas.length) return
  const hero = page.querySelector('.hero-panel')
  if (!hero) return
  const recommendationText = [hero.querySelector('.hero-content h2')?.textContent, hero.querySelector('.hero-content p')?.textContent].join(' ')
  const ranked = ideas.map((idea) => ({ idea, score: matchScore(idea, recommendationText) })).sort((a, b) => b.score - a.score)
  const best = ranked[0]
  if (!best || best.score < 0.34) return

  const match = document.createElement('div')
  match.className = 'idea-vault-match'
  const copy = document.createElement('div')
  const strong = document.createElement('strong')
  strong.textContent = 'Related saved idea found'
  const small = document.createElement('small')
  small.textContent = best.idea.title
  copy.append(strong, small)
  const open = button('Open Idea Vault')
  open.addEventListener('click', () => {
    window.sessionStorage.setItem(FOCUS_KEY, best.idea.id)
    findNavButton('Campaign Planner')?.click()
  })
  match.append(copy, open)
  const buttons = hero.querySelector('.hero-buttons')
  if (buttons?.parentNode) buttons.parentNode.insertBefore(match, buttons.nextSibling)
  else hero.querySelector('.hero-content')?.append(match)
}

export default function IdeaVaultEnhancer({ page }) {
  useEffect(() => {
    ensureStyle()
    let timer = 0
    let retry = 0

    const sync = () => {
      if (page === 'Campaign Planner') {
        const planner = findActivePage('Campaign Planner')
        if (planner) mountVault(planner)
        else if (retry < 8) { retry += 1; timer = window.setTimeout(sync, 60) }
        return
      }
      if (page === 'Dashboard') {
        const dashboard = findActivePage('Dashboard')
        if (dashboard) mountDashboardMatch(dashboard)
        else if (retry < 8) { retry += 1; timer = window.setTimeout(sync, 60) }
      }
    }

    timer = window.setTimeout(sync, page === 'Dashboard' ? 140 : 40)
    return () => window.clearTimeout(timer)
  }, [page])

  return null
}
