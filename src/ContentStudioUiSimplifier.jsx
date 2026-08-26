import { useEffect } from 'react'

const STYLE_ID = 'brutti-content-studio-ui-simplifier-style'

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .brief-polish-row,
    .smart-rewrite-panel {
      display: none !important;
    }

    .generator-output .regenerate-caption-button {
      white-space: nowrap;
    }
  `
  document.head.append(style)
}

function hide(element) {
  if (!element) return
  element.hidden = true
  element.style.display = 'none'
  element.setAttribute('aria-hidden', 'true')
}

function ensureRegenerateButton(page) {
  const actions = page.querySelector('.generator-output.has-output .output-actions.assist-actions')
  if (!actions || actions.querySelector('.regenerate-caption-button')) return

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'button secondary regenerate-caption-button'
  button.textContent = 'Regenerate'
  button.setAttribute('aria-label', 'Regenerate caption')

  const saveButton = [...actions.querySelectorAll('button')]
    .find((item) => /save as draft/i.test(item.textContent || ''))
  actions.insertBefore(button, saveButton || null)
}

function simplifyCopy(page) {
  const steps = page.querySelectorAll('.assist-steps span')
  if (steps[1]) steps[1].innerHTML = '<b>2</b>Regenerate if needed'

  const emptyTitle = page.querySelector('.empty-output h3')
  const emptyCopy = page.querySelector('.empty-output p')
  if (emptyTitle) emptyTitle.textContent = 'Caption generator is ready.'
  if (emptyCopy) emptyCopy.textContent = 'Add verified facts and Content Direction to generate one Facebook caption. If the first result is not right, press Regenerate.'
}

function sync() {
  ensureStyle()

  const page = [...document.querySelectorAll('#root .page')]
    .find((item) => item.offsetParent !== null && item.querySelector('.page-header h1')?.textContent?.trim() === 'Content Studio')
  if (!page) return

  page.querySelectorAll('.brief-polish-row, .smart-rewrite-panel').forEach(hide)
  simplifyCopy(page)
  ensureRegenerateButton(page)
}

export default function ContentStudioUiSimplifier() {
  useEffect(() => {
    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, 30)
    }

    const root = document.getElementById('root')
    if (!root) return undefined

    const observer = new MutationObserver(schedule)
    observer.observe(root, { childList: true, subtree: true })
    document.addEventListener('click', schedule, true)
    document.addEventListener('submit', schedule, true)
    sync()

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('click', schedule, true)
      document.removeEventListener('submit', schedule, true)
    }
  }, [])

  return null
}
