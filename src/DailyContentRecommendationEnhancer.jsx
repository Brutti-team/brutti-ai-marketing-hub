import { useEffect } from 'react'
import { getSoulRecommendation, soulSourceReady } from './lib/bruttiSoulSource'

const META_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz9_kxaVNNH07wxqrUsVPkRPNxXpnbCpnsL5RnT5CBE_Sd-jzqq910TjykFYWmeDKXE/exec'
const CACHE_KEY = 'brutti_daily_meta_recommendations_v1'
const OFFSETS = [0, 3, 7]

function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function setReactValue(element, value) {
  if (!element) return
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set
  if (setter) setter.call(element, value)
  else element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function pageByTitle(title) {
  return [...document.querySelectorAll('#root .page')].find((page) => page.offsetParent !== null
    && (title === 'Dashboard' ? page.classList.contains('dashboard-page') : page.querySelector('h1')?.textContent?.trim() === title)) || null
}

function nav(label) {
  return [...document.querySelectorAll('#root .nav-link')].find((button) => button.querySelector('span')?.textContent?.trim() === label)
}

function control(root, labelText, selector) {
  return [...root.querySelectorAll('label')].find((label) => clean(label.textContent).startsWith(labelText))?.querySelector(selector) || null
}

function waitFor(find, attempts = 40) {
  return new Promise((resolve) => {
    let count = 0
    const check = () => {
      const value = find()
      if (value || count >= attempts) resolve(value || null)
      else { count += 1; window.setTimeout(check, 50) }
    }
    check()
  })
}

function todayKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function dashboardPage() {
  return pageByTitle('Dashboard')
}

function metaCache() {
  try {
    const snapshot = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    return snapshot?.date === todayKey() ? snapshot : null
  } catch {
    return null
  }
}

async function dailyMetaSnapshot() {
  const cached = metaCache()
  if (cached) return cached
  try {
    const response = await fetch(META_URL, { cache: 'no-store' })
    if (!response.ok) throw new Error('Meta sync unavailable')
    const payload = await response.json()
    const data = payload?.data || payload
    const snapshot = { date: todayKey(), syncedAt: new Date().toISOString(), posts: Array.isArray(data?.facebook?.topPosts) ? data.facebook.topPosts.slice(0, 12) : [], live: true }
    localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot))
    return snapshot
  } catch {
    return { date: todayKey(), syncedAt: null, posts: [], live: false }
  }
}

async function useIdea(recommendation) {
  nav('Content Studio')?.click()
  const page = await waitFor(() => pageByTitle('Content Studio'))
  if (!page) return
  ;[...page.querySelectorAll('.tab-bar button')].find((button) => /free assist/i.test(button.textContent || ''))?.click()
  await waitFor(() => page.querySelector('.generator-form'))
  setReactValue(control(page, 'Content title', 'input'), recommendation.title)
  setReactValue(control(page, 'Content type', 'select'), recommendation.formType)
  const product = control(page, 'Product', 'select')
  const exists = [...(product?.options || [])].some((option) => option.value === recommendation.product)
  setReactValue(product, exists ? recommendation.product : 'General / No Product')
  setReactValue(control(page, 'Verified facts / direction', 'textarea'), recommendation.direction)
  control(page, 'Content title', 'input')?.focus()
}

async function addToPlanner(recommendation, timing) {
  nav('Campaign Planner')?.click()
  const page = await waitFor(() => pageByTitle('Campaign Planner'))
  if (!page) return
  ;[...page.querySelectorAll('button')].find((button) => /add content/i.test(button.textContent || ''))?.click()
  const modal = await waitFor(() => document.querySelector('#root .plan-modal'))
  if (!modal) return
  setReactValue(control(modal, 'Plan title', 'input'), recommendation.title)
  setReactValue(control(modal, 'Date', 'input'), todayKey())
  setReactValue(control(modal, 'Status', 'select'), 'Draft')
  setReactValue(control(modal, 'Content type', 'select'), recommendation.formType)
  setReactValue(control(modal, 'Channel', 'select'), 'Facebook')
  setReactValue(control(modal, 'Time', 'input'), timing.time24)
  const product = control(modal, 'Product', 'select')
  const exists = [...(product?.options || [])].some((option) => option.value === recommendation.product)
  setReactValue(product, exists ? recommendation.product : 'General / No Product')
  window.setTimeout(() => modal.requestSubmit(), 80)
}

function ideasForToday() {
  return OFFSETS.map((offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return getSoulRecommendation(date)
  })
}

function timing(index, posts) {
  const slots = [['Morning audience window', '10:00 AM', '10:00'], ['Midday audience window', '12:30 PM', '12:30'], ['Afternoon audience window', '3:00 PM', '15:00']]
  const post = posts[index] || posts[0]
  const strong = post && [post.views, post.reach, post.reactions, post.engagement].some((value) => Number(value) > 0)
  return { label: slots[index][0], time: slots[index][1], time24: slots[index][2], confidence: strong ? 'Medium' : 'Low' }
}

function context(index, snapshot) {
  const post = snapshot.posts[index] || snapshot.posts[0]
  if (!snapshot.live) return 'Meta live sync sementara tidak tersedia; direction Brutti Soul Master masih digunakan.'
  if (!post) return 'Data Meta terbaru telah diselaraskan; belum ada post ranking untuk hari ini.'
  const metric = [['views', post.views], ['reach', post.reach], ['reactions', post.reactions], ['engagement', post.engagement]].find(([, value]) => Number(value) > 0)
  return metric ? 'Meta live signal: ' + metric[1] + ' ' + metric[0] + ' pada post Facebook ranking.' : 'Data Meta live terbaru telah diselaraskan.'
}

function card(idea, index, snapshot) {
  const slot = timing(index, snapshot.posts)
  return '<article class="daily-recommendation-card" style="padding:20px;border:1px solid rgba(20,74,58,.18);border-radius:18px;background:rgba(255,255,255,.78);box-shadow:0 8px 24px rgba(20,74,58,.06);display:flex;flex-direction:column;gap:13px">'
    + '<div style="display:flex;justify-content:space-between;gap:8px"><span style="font-size:11px;font-weight:800;letter-spacing:.1em;color:#1d6751">IDEA 0' + (index + 1) + '</span><span style="font-size:11px;padding:5px 9px;border-radius:999px;background:#e6f3ec;color:#175a44">Confidence: ' + slot.confidence + '</span></div>'
    + '<div><h3 style="margin:0 0 7px;font-size:20px;line-height:1.25">' + idea.title + '</h3><p style="margin:0;line-height:1.55">' + idea.idea + '</p></div>'
    + '<div style="padding:12px;border-radius:12px;background:#f3f8f4"><strong style="font-size:12px">Brutti Soul Master reason</strong><p style="margin:5px 0 0;font-size:13px;line-height:1.5">' + idea.reason + '</p></div>'
    + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;font-size:13px"><div><span style="display:block;font-size:10px;opacity:.62">BEST TIME TO POST</span><strong>' + slot.label + '</strong></div><div><span style="display:block;font-size:10px;opacity:.62">POSTING TIME</span><strong>' + slot.time + '</strong></div><div><span style="display:block;font-size:10px;opacity:.62">TARGET</span><strong>' + idea.target + '</strong></div><div><span style="display:block;font-size:10px;opacity:.62">OBJECTIVE</span><strong>' + idea.objective + '</strong></div></div>'
    + '<div><span style="display:block;font-size:10px;opacity:.62">SUGGESTED FORMAT</span><strong>' + idea.suggested + '</strong></div><small style="line-height:1.45;opacity:.7">' + context(index, snapshot) + '</small>'
    + '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:auto"><button type="button" class="btn-primary daily-use-idea" data-index="' + index + '">Use This Idea</button><button type="button" class="btn-secondary daily-add-planner" data-index="' + index + '">Add to Planner</button></div></article>'
}

function render(snapshot) {
  const page = dashboardPage()
  const hero = page?.querySelector('.hero-panel')
  if (!hero) return
  const ideas = ideasForToday()
  let section = page.querySelector('.daily-meta-recommendations')
  if (!section) {
    section = document.createElement('section')
    section.className = 'panel daily-meta-recommendations'
    section.style.cssText = 'margin-top:20px'
    hero.insertAdjacentElement('afterend', section)
  }
  const label = snapshot.live ? 'Meta live synced once today' : 'Meta live sync unavailable · using Brutti Soul Master fallback'
  section.innerHTML = '<div class="panel-heading" style="display:flex;justify-content:space-between;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px"><div><span class="eyebrow">TODAY\'S RECOMMENDATION</span><h2 style="margin:4px 0 0">3 content ideas for today</h2></div><small style="opacity:.68">' + label + '</small></div><div class="daily-recommendation-grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">' + ideas.map((item, index) => card(item, index, snapshot)).join('') + '</div>'
  section.querySelectorAll('.daily-use-idea').forEach((button) => button.addEventListener('click', () => useIdea(ideas[Number(button.dataset.index)])))
  section.querySelectorAll('.daily-add-planner').forEach((button) => button.addEventListener('click', () => {
    const index = Number(button.dataset.index)
    addToPlanner(ideas[index], timing(index, snapshot.posts))
  }))
}

export default function DailyContentRecommendationEnhancer() {
  useEffect(() => {
    if (!soulSourceReady) return undefined
    let cancelled = false
    const sync = async () => {
      const snapshot = await dailyMetaSnapshot()
      if (!cancelled) render(snapshot)
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
