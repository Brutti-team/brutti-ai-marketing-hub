import { useEffect } from 'react'

function activeStudio() {
  return [...document.querySelectorAll('#root .page')]
    .find((item) => item.offsetParent !== null && item.querySelector('.page-header h1')?.textContent?.trim() === 'Content Studio') || null
}

function removeLegacyControls(page) {
  page.querySelectorAll('.brief-polish-row, .smart-rewrite-panel').forEach((element) => element.remove())
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

function sync(page) {
  if (!page?.isConnected) return
  removeLegacyControls(page)
  simplifyCopy(page)
  ensureRegenerateButton(page)
}

export default function ContentStudioUiSimplifier() {
  useEffect(() => {
    let observer = null
    let timer = 0
    let retryTimer = 0

    const start = () => {
      const page = activeStudio()
      if (!page) {
        retryTimer = window.setTimeout(start, 40)
        return
      }

      const schedule = () => {
        window.clearTimeout(timer)
        timer = window.setTimeout(() => sync(page), 20)
      }

      sync(page)
      observer = new MutationObserver(schedule)
      observer.observe(page, { childList: true, subtree: true })
    }

    start()

    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(retryTimer)
      observer?.disconnect()
    }
  }, [])

  return null
}
