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

  const productSelect = findLabelControl(page, 'Product', 'select')
  const productExists = [...(productSelect?.options || [])]
    .some((option) => option.value === recommendation.product)
  setReactValue(productSelect, productExists ? recommendation.product : 'General / No Product')
  setReactValue(findLabelControl(page, 'Verified facts / direction', 'textarea'), recommendation.direction)

  window.scrollTo({ top: 0, behavior: 'smooth' })
  findLabelControl(page, 'Content title', 'input')?.focus()
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
  setReactValue(findLabelControl(modal, 'Status', 'select'), 'Draft')
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

const metaEndpoint = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz9_kxaVNNH07wxqrUsVPkRPNxXpnbCpnsL5RnT5CBE_Sd-jzqq910TjykFYWmeDKXE/exec'

async function loadMetaSignal() {
  try {
    const response = await fetch(metaEndpoint, { cache: 'no-store' })
    if (!response.ok) return null
    const payload = await response.json()
    const data = payload?.data || payload
    const posts = data?.facebook?.topPosts || []
    const dashboard = findActivePage('Dashboard')
    if (dashboard) renderDailyIdeas(dashboard, posts)
    const strongest = posts.find((post) => post.views !== null || post.reach !== null || post.reactions !== null)
    if (!strongest) return null
    const metric = strongest.views !== null ? `${strongest.views} views` : strongest.reach !== null ? `${strongest.reach} reach` : `${strongest.reactions} reactions`
    return `Meta context: rujuk format post yang ada ${metric}; ini panduan dalaman sahaja, bukan claim prestasi.`
  } catch {
    return null
  }
}

function renderDailyIdeas(page, posts = []) {
  if (page.querySelector('.daily-meta-ideas')) return
  const ideas = ['Ulang format post terbaik dengan angle baharu.','Buat perbandingan ringkas untuk bantu audience memilih.','Kongsi behind the scenes dan tanya soalan kepada audience.']
  const section = document.createElement('section')
  section.className = 'panel daily-meta-ideas'
  section.innerHTML = '<div class="panel-heading"><div><span class="eyebrow">DAILY CONTENT IDEAS</span><h3>3 idea berdasarkan Meta</h3></div></div><div class="recommendation-list">' + ideas.map((idea, i) => '<article><span class="recommend-number">0'+(i+1)+'</span><div><strong>'+idea+'</strong><p>'+(posts[i] ? 'Rujukan post Meta '+(posts[i].id || 'teratas')+'.' : 'Idea berasaskan format content BRUTTI.')+'</p></div></article>').join('') + '</div>'
  page.appendChild(section)
}

function syncRecommendation(metaSignal = '') {
  if (!soulSourceReady) return
  const page = findActivePage('Dashboard')
  if (!page) return
  const hero = page.querySelector('.hero-panel')
  if (!hero) return

  const recommendation = getSoulRecommendation(new Date())
  const weekday = new Date().toLocaleDateString('en-MY', { weekday: 'long' })
  setLabelText(hero.querySelector('.hero-label'), `TODAY'S RECOMMENDATION · ${weekday}`)
  setText(hero.querySelector('.hero-content h2'), recommendation.idea)
  setText(hero.querySelector('.hero-content p'), `Brutti Soul Master: ${recommendation.reason}${metaSignal ? ` ${metaSignal}` : ''}`)

  const buttons = [...hero.querySelectorAll('.hero-buttons button')]
  const useButton = buttons[0]
  const plannerButton = buttons[1]
  setFirstTextNode(useButton, 'Use This Idea ')
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
      timer = window.setTimeout(() => { loadMetaSignal().then((signal) => syncRecommendation(signal || '')) }, 45)
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
