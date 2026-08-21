import { useEffect } from 'react'

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function findNavButton(label) {
  return [...document.querySelectorAll('#root .nav-link')]
    .find((button) => button.querySelector('span')?.textContent?.trim() === label) || null
}

function findActivePage(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('.page-header h1')?.textContent?.trim() === title) || null
}

function findLabelControl(root, labelText, selector) {
  if (!root) return null
  const label = [...root.querySelectorAll('label')]
    .find((item) => clean(item.textContent).startsWith(labelText))
  return label?.querySelector(selector) || null
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

function waitFor(find, attempts = 45) {
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

function readPlan(modal) {
  return {
    title: findLabelControl(modal, 'Plan title', 'input')?.value || '',
    date: findLabelControl(modal, 'Date', 'input')?.value || '',
    status: findLabelControl(modal, 'Status', 'select')?.value || 'Idea',
    type: findLabelControl(modal, 'Content type', 'select')?.value || 'Brand Awareness',
    channel: findLabelControl(modal, 'Channel', 'select')?.value || 'Facebook',
    product: findLabelControl(modal, 'Product', 'select')?.value || 'General / No Product',
  }
}

const OBJECTIVE_BY_TYPE = {
  'Brand Awareness': 'Awareness',
  'Product Highlight': 'Consideration',
  Educational: 'Education',
  'Behind the Scenes': 'Engagement',
  'Customer Story': 'Trust',
  Promotion: 'Conversion',
}

async function usePlanInContentStudio(modal) {
  const plan = readPlan(modal)
  if (!clean(plan.title)) {
    findLabelControl(modal, 'Plan title', 'input')?.focus()
    return
  }

  modal.querySelector('.modal-head .icon-button')?.click()
  findNavButton('Content Studio')?.click()

  const page = await waitFor(() => findActivePage('Content Studio'))
  if (!page) return

  const freeAssist = [...page.querySelectorAll('.tab-bar button')]
    .find((button) => /free assist/i.test(button.textContent || ''))
  freeAssist?.click()

  const form = await waitFor(() => page.querySelector('.generator-form'))
  if (!form) return

  setReactValue(findLabelControl(form, 'Content title', 'input'), plan.title)
  setReactValue(findLabelControl(form, 'Content type', 'select'), plan.type)

  const productSelect = findLabelControl(form, 'Product', 'select')
  const productExists = [...(productSelect?.options || [])]
    .some((option) => option.value === plan.product)
  setReactValue(productSelect, productExists ? plan.product : 'General / No Product')

  // A planner item is direction, not evidence. Never carry old or inferred claims into Verified facts.
  const verifiedFacts = findLabelControl(form, 'Verified facts', 'textarea')
    || findLabelControl(form, 'Verified facts / direction', 'textarea')
  setReactValue(verifiedFacts, '')

  await waitFor(() => form.querySelector('[data-v2="objective"]'))
  setReactValue(form.querySelector('[data-v2="objective"]'), OBJECTIVE_BY_TYPE[plan.type] || 'Auto')
  setReactValue(form.querySelector('[data-v2="angle"]'), 'Auto')
  setReactValue(form.querySelector('[data-v2="ctaGoal"]'), 'Auto')
  setReactValue(form.querySelector('[data-v2="keyMessage"]'), '')
  setReactValue(
    form.querySelector('[data-v2="direction"]'),
    `Campaign Planner item${plan.date ? ` · ${plan.date}` : ''}. Gunakan plan ini sebagai direction sahaja. Isi Verified facts dengan fakta yang sudah confirm sebelum generate.`,
  )

  window.scrollTo({ top: 0, behavior: 'smooth' })
  verifiedFacts?.focus()
}

function enhancePlanModal(modal) {
  if (!modal || modal.dataset.contentStudioHandoff === '1') return
  modal.dataset.contentStudioHandoff = '1'

  const actions = modal.querySelector('.modal-actions')
  const target = actions?.lastElementChild || actions
  if (!target) return

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'button secondary'
  button.dataset.plannerStudioHandoff = '1'
  button.textContent = 'Use in Content Studio'
  button.title = 'Buka plan ini dalam Content Studio. Verified facts akan dikosongkan supaya hanya fakta yang sudah confirm digunakan.'
  button.addEventListener('click', () => usePlanInContentStudio(modal))
  target.insertBefore(button, target.firstChild)

  const note = document.createElement('small')
  note.dataset.plannerStudioHandoffNote = '1'
  note.style.cssText = 'display:block;margin:8px 0 0;opacity:.66;line-height:1.4;'
  note.textContent = 'Planner = direction. Verified facts tetap perlu diisi dengan maklumat yang sudah confirm dalam Content Studio.'
  actions.insertAdjacentElement('beforebegin', note)
}

export default function PlannerContentStudioHandoffEnhancer() {
  useEffect(() => {
    let timer = 0
    const sync = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const modal = document.querySelector('#root .plan-modal')
        if (modal) enhancePlanModal(modal)
      }, 40)
    }

    const root = document.getElementById('root')
    const observer = new MutationObserver(sync)
    if (root) observer.observe(root, { childList: true, subtree: true })
    sync()

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return null
}
