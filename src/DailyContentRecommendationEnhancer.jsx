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
const META_CACHE_KEY = 'brutti_daily_meta_recommendations_v1'
const OFFSETS = [0, 3, 7]

function dashboardPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.classList.contains('dashboard-page')) || null
}

function dateKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function readMetaCache() {
  try {
    const cache = JSON.parse(localStorage.getItem(META_CACHE_KEY) || 'null')
    return cache?.date === dateKey() ? cache : null
  } catch {
    return null
  }
}

async function dailyMetaSnapshot() {
  const cached = readMetaCache()
  if (cached) return cached

  try {
    const response = await fetch(metaEndpoint, { cache: 'no-store' })
    if (!response.ok) throw new Error('Meta live sync unavailable')
    const payload = await response.json()
    const data = payload?.data || payload
    const snapshot = {
      date: dateKey(),
      syncedAt: new Date().toISOString(),
      posts: Array.isArray(data?.facebook?.topPosts) ? data.facebook.topPosts.slice(0, 12) : [],
      live: true,
    }
    localStorage.setItem(META_CACHE_KEY, JSON.stringify(snapshot))
    return snapshot
  } catch {
    return { date: dateKey(), syncedAt: null, posts: [], live: false }
  }
}

function recommendationsForToday() {
  return OFFSETS.map((offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return getSoulRecommendation(date)
  })
}

function timingFor(index, posts) {
  const slots = [
    ['Morning audience window', '10:00 AM', '10:00'],
    ['Midday audience window', '12:30 PM', '12:30'],
    ['Afternoon audience window', '3:00 PM', '15:00'],
  ]
  const post = posts[index] || posts[0]
  const hasSignal = post && [post.views, post.reach, post.reactions, post.engagement].some((value) => Number(value) > 0)
  return { label: slots[index][0], time: slots[index][1], time24: slots[index][2], confidence: hasSignal ? 'Medium' : 'Low' }
}

function metaContext(index, snapshot) {
  const post = snapshot.posts[index] || snapshot.posts[0]
  if (!snapshot.live) return 'Meta live sync sementara tidak tersedia; direction Brutti Soul Master masih digunakan.'
  if (!post) return 'Data Meta terbaru telah diselaraskan; belum ada post ranking untuk hari ini.'
  const metric = [['views', post.views], ['reach', post.reach], ['reactions', post.reactions], ['engagement', post.engagement]]
    .find(([, value]) => Number(value) > 0)
  return metric ? 'Meta live signal: ' + metric[1] + ' ' + metric[0] + ' pada post Facebook ranking.' : 'Data Meta live terbaru telah diselaraskan.'
}

function cardMarkup(recommendation, index, snapshot) {
  const timing = timingFor(index, snapshot.posts)
  return '<article class="daily-recommendation-card" style="padding:20px;border:1px solid rgba(20,74,58,.18);border-radius:18px;background:rgba(255,255,255,.78);box-shadow:0 8px 24px rgba(20,74,58,.06);display:flex;flex-direction:column;gap:13px">'
    + '<div style="display:flex;justify-content:space-between;gap:8px"><span style="font-size:11px;font-weight:800;letter-spacing:.1em;color:#1d6751">IDEA 0' + (index + 1) + '</span><span style="font-size:11px;padding:5px 9px;border-radius:999px;background:#e6f3ec;color:#175a44">Confidence: ' + timing.confidence + '</span></div>'
    + '<div><h3 style="margin:0 0 7px;font-size:20px;line-height:1.25">' + recommendation.title + '</h3><p style="margin:0;line-height:1.55">' + recommendation.idea + '</p></div>'
    + '<div style="padding:12px;border-radius:12px;background:#f3f8f4"><strong style="font-size:12px">Brutti Soul Master reason</strong><p style="margin:5px 0 0;font-size:13px;line-height:1.5">' + recommendation.reason + '</p></div>'
    + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;font-size:13px"><div><span style="display:block;font-size:10px;opacity:.62">BEST TIME TO POST</span><strong>' + timing.label + '</strong></div><div><span style="display:block;font-size:10px;opacity:.62">POSTING TIME</span><strong>' + timing.time + '</strong></div><div><span style="display:block;font-size:10px;opacity:.62">TARGET</span><strong>' + recommendation.target + '</strong></div><div><span style="display:block;font-size:10px;opacity:.62">OBJECTIVE</span><strong>' + recommendation.objective + '</strong></div></div>'
    + '<div><span style="display:block;font-size:10px;opacity:.62">SUGGESTED FORMAT</span><strong>' + recommendation.suggested + '</strong></div><small style="line-height:1.45;opacity:.7">' + metaContext(index, snapshot) + '</small>'
    + '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:auto"><button type="button" class="btn-primary daily-use-idea" data-index="' + index + '">Use This Idea</button><button type="button" class="btn-secondary daily-add-planner" data-index="' + index + '">Add to Planner</button></div></article>'
}

function renderRecommendations(snapshot) {
  const page = dashboardPage()
  const hero = page?.querySelector('.hero-panel')
  if (!hero) return
  const recommendations = recommendationsForToday()
  let section = page.querySelector('.daily-meta-recommendations')
  if (!section) {
    section = document.createElement('section')
    section.className = 'panel daily-meta-recommendations'
    section.style.cssText = 'margin-top:20px'
    hero.insertAdjacentElement('afterend', section)
  }
  const syncLabel = snapshot.live ? 'Meta live synced once today' : 'Meta live sync unavailable · using Brutti Soul Master fallback'
  section.innerHTML = '<div class="panel-heading" style="display:flex;justify-content:space-between;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px"><div><span class="eyebrow">TODAY\'S RECOMMENDATION</span><h2 style="margin:4px 0 0">3 content ideas for today</h2></div><small style="opacity:.68">' + syncLabel + '</small></div><div class="daily-recommendation-grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">' + recommendations.map((item, index) => cardMarkup(item, index, snapshot)).join('') + '</div>'
  section.querySelectorAll('.daily-use-idea').forEach((button) => {
    button.addEventListener('click', () => loadRecommendationIntoStudio(recommendations[Number(button.dataset.index)]))
  })
  section.querySelectorAll('.daily-add-planner').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index)
      addRecommendationToPlanner(recommendations[index], timingFor(index, snapshot))
    })
  })
}

export default function DailyContentRecommendationEnhancer() {
  useEffect(() => {
    if (!soulSourceReady) return undefined
    let cancelled = false
    const sync = async () => {
      const snapshot = await dailyMetaSnapshot()
      if (!cancelled) renderRecommendations(snapshot)
    }
    sync()
    const onClick = (event) => {
      if (event.target.closest?.('.nav-link')) window.setTimeout(sync, 45)
    }
    document.addEventListener('click', onClick, true)
    return () => {
      cancelled = true
      document.removeEventListener('click', onClick, true)
    }
  }, [])
  return null
}
