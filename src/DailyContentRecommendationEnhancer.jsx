import { useEffect } from 'react'
import { getSoulRecommendation, soulSourceReady } from './lib/bruttiSoulSource'

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
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

function findNavButton(label) {
  return [...document.querySelectorAll('#root .nav-link')]
    .find((button) => button.querySelector('span')?.textContent?.trim() === label)
}

function findActivePage(title) {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && (page.classList.contains('dashboard-page') ? title === 'Dashboard' : page.querySelector('h1')?.textContent?.trim() === title)) || null
}

function findLabelControl(root, labelText, selector) {
  const label = [...root.querySelectorAll('label')]
    .find((item) => clean(item.textContent).startsWith(labelText))
  return label?.querySelector(selector) || null
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

function todayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value
}

function setLabelText(label, value) {
  if (!label) return
  const textNodes = [...label.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE)
  if (!textNodes.length) {
    label.appendChild(document.createTextNode(value))
    return
  }
  textNodes.forEach((node, index) => {
    node.textContent = index === 0 ? value : ''
  })
}

function setFirstTextNode(button, value) {
  if (!button) return
  const textNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
  if (textNode) textNode.textContent = value
}

function objectiveForRecommendation(recommendation) {
  const text = clean(`${recommendation.objective || ''} ${recommendation.formType || ''}`).toLowerCase()
  if (/trust/.test(text)) return 'Trust'
  if (/engagement/.test(text)) return 'Engagement'
  if (/education/.test(text)) return 'Education'
  if (/conversion|promotion/.test(text)) return 'Conversion'
  if (/product story|product highlight|consideration/.test(text)) return 'Consideration'
  return 'Awareness'
}

function angleForRecommendation(recommendation) {
  const type = recommendation.formType || 'Brand Awareness'
  if (type === 'Product Highlight') return 'Storytelling'
  if (type === 'Educational') return 'Practical Tip'
  if (type === 'Behind the Scenes') return 'Human / Behind the Scenes'
  if (type === 'Customer Story') return 'Customer Journey'
  if (type === 'Promotion') return 'Offer + Reason to Act'
  return 'Storytelling'
}

async function loadRecommendationIntoStudio(recommendation) {
  findNavButton('Content Studio')?.click()
  const page = await waitFor(() => findActivePage('Content Studio'))
  if (!page) return

  const freeAssist = [...page.querySelectorAll('.tab-bar button')]
    .find((button) => /free assist/i.test(button.textContent || ''))
  freeAssist?.click()
  await waitFor(() => page.querySelector('.generator-form'))

  setReactValue(findLabelControl(page, 'Content title', 'input'), recommendation.title)
  setReactValue(findLabelControl(page, 'Content type', 'select'), recommendation.formType)

  const verifiedFacts = findLabelControl(page, 'Verified facts', 'textarea') || findLabelControl(page, 'Verified facts / direction', 'textarea')
  setReactValue(verifiedFacts, '')

  const productSelect = findLabelControl(page, 'Product', 'select')
  const productExists = [...(productSelect?.options || [])]
    .some((option) => option.value === recommendation.product)
  setReactValue(productSelect, productExists ? recommendation.product : 'General / No Product')

  const strategyPanel = await waitFor(() => page.querySelector('.content-studio-v2-controls'))
  if (strategyPanel) {
    setReactValue(strategyPanel.querySelector('[data-v2="objective"]'), objectiveForRecommendation(recommendation))
    setReactValue(strategyPanel.querySelector('[data-v2="angle"]'), angleForRecommendation(recommendation))
    setReactValue(strategyPanel.querySelector('[data-v2="ctaGoal"]'), 'Auto')
    setReactValue(strategyPanel.querySelector('[data-v2="audience"]'), recommendation.target || '')
    setReactValue(strategyPanel.querySelector('[data-v2="keyMessage"]'), recommendation.idea || '')
    setReactValue(strategyPanel.querySelector('[data-v2="direction"]'), recommendation.direction || '')
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
  verifiedFacts?.focus()
}

async function addRecommendationToPlanner(recommendation) {
  findNavButton('Campaign Planner')?.click()
  const page = await waitFor(() => findActivePage('Campaign Planner'))
  if (!page) return

  const addButton = [...page.querySelectorAll('button')]
    .find((button) => /add content/i.test(button.textContent || ''))
  addButton?.click()

  const modal = await waitFor(() => document.querySelector('#root .plan-modal'))
  if (!modal) return

  setReactValue(findLabelControl(modal, 'Plan title', 'input'), recommendation.title)
  setReactValue(findLabelControl(modal, 'Date', 'input'), todayKey())
  setReactValue(findLabelControl(modal, 'Status', 'select'), 'Idea')
  setReactValue(findLabelControl(modal, 'Content type', 'select'), recommendation.formType)
  setReactValue(findLabelControl(modal, 'Channel', 'select'), 'Facebook')

  const productSelect = findLabelControl(modal, 'Product', 'select')
  const productExists = [...(productSelect?.options || [])]
    .some((option) => option.value === recommendation.product)
  setReactValue(productSelect, productExists ? recommendation.product : 'General / No Product')

  window.setTimeout(() => modal.requestSubmit(), 80)
}

function bindAction(button, key, handler) {
  if (!button || button.dataset[key] === '1') return
  button.dataset[key] = '1'
  button.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    handler()
  }, true)
}

function syncRecommendation() {
  if (!soulSourceReady) return
  const page = findActivePage('Dashboard')
  if (!page) return
  const hero = page.querySelector('.hero-panel')
  if (!hero) return

  const recommendation = getSoulRecommendation(new Date())
  const weekday = new Date().toLocaleDateString('en-MY', { weekday: 'long' })
  setLabelText(hero.querySelector('.hero-label'), `TODAY'S RECOMMENDATION · ${weekday}`)
  setText(hero.querySelector('.hero-content h2'), recommendation.idea)
  setText(hero.querySelector('.hero-content p'), `Brutti Soul Master: ${recommendation.reason}`)

  const buttons = [...hero.querySelectorAll('.hero-buttons button')]
  const useButton = buttons[0]
  const plannerButton = buttons[1]
  setFirstTextNode(useButton, 'Use Idea + Add Facts ')
  setText(plannerButton, 'Add to Planner')
  bindAction(useButton, 'soulUseIdea', () => loadRecommendationIntoStudio(recommendation))
  bindAction(plannerButton, 'soulAddPlanner', () => addRecommendationToPlanner(recommendation))

  const cards = [...hero.querySelectorAll('.art-card')]
  if (cards[0]) {
    setText(cards[0].querySelector('span'), 'TARGET')
    setText(cards[0].querySelector('strong'), recommendation.target)
  }
  if (cards[1]) {
    setText(cards[1].querySelector('span'), 'OBJECTIVE')
    setText(cards[1].querySelector('strong'), recommendation.objective)
  }
  if (cards[2]) {
    setText(cards[2].querySelector('span'), 'SUGGESTED')
    setText(cards[2].querySelector('strong'), recommendation.suggested)
  }
}

export default function DailyContentRecommendationEnhancer() {
  useEffect(() => {
    if (!soulSourceReady) return undefined
    let timer = 0

    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(syncRecommendation, 45)
    }

    const onClick = (event) => {
      const nav = event.target.closest?.('.nav-link')
      if (nav) schedule()
    }

    schedule()
    document.addEventListener('click', onClick, true)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
