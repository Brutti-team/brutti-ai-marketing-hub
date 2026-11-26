import { formatDisplayDateFromKey, formatDisplayTimeFromHm } from './formatDate'
import { parsePlanObjective } from './plannerNote'
// Calendar Planner reminders (Michelle, 26 Nov). Reads the same planner notes the calendar saves
// (localStorage 'brutti-plans-v2', mirrored from the Daily Planner sheet when connected). The time of a note is
// stored as a leading "@HH:MM " in its Objective text. No server push: reminders fire while the app is open
// (or its PWA is alive in the background); see PR notes for the true background push options.
const PLANS_KEY = 'brutti-plans-v2'
const NOTIFIED_KEY = 'brutti-cal-notified-v1'
const DEFAULT_HOUR = 8 // notes with no time remind at 08:00 on the day
const EVE_HOUR = 18 // and at 18:00 the evening before
const WINDOW_MS = 12 * 3600 * 1000

const pad = (n) => String(n).padStart(2, '0')
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseDay = (key) => { const [y, m, d] = String(key).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1) }

function readPlans() {
  try {
    const plans = JSON.parse(window.localStorage.getItem(PLANS_KEY) || '[]')
    return Array.isArray(plans) ? plans.filter((plan) => plan && plan.title && /^\d{4}-\d{2}-\d{2}$/.test(plan.date)) : []
  } catch { return [] }
}

function splitNote(plan) {
  const { time, note } = parsePlanObjective(plan.objective)
  const [h, m] = time ? time.split(':').map(Number) : [DEFAULT_HOUR, 0]
  return { time, hour: h, minute: m, note }
}

// Bell items for today / tomorrow and anything whose time has passed in the last 24 hours.
export function calendarAlerts(now = new Date()) {
  const today = dayKey(now)
  const tomorrow = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  const alerts = []
  readPlans().forEach((plan) => {
    const { time, hour, minute } = splitNote(plan)
    const day = parseDay(plan.date)
    const when = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute)
    // Panel only shows title + date/time. Note text stays in the planner; OS notifications keep their own body.
    const timeLabel = time ? formatDisplayTimeFromHm(time) : ''
    const detail = [formatDisplayDateFromKey(plan.date), timeLabel].filter(Boolean).join(' · ')
    const base = { level: 'reminder', action: 'Calendar Planner', button: 'Open Calendar', detail, order: when.getTime() }
    if (time && now >= when && now - when < 24 * 3600 * 1000) alerts.push({ ...base, id: `cal-${plan.id}-due`, title: `Reminder: ${plan.title}`, level: 'alert' })
    else if (plan.date === today && !(time && now >= when)) alerts.push({ ...base, id: `cal-${plan.id}-today`, title: plan.title })
    else if (plan.date === tomorrow) alerts.push({ ...base, id: `cal-${plan.id}-tomorrow`, title: plan.title })
  })
  return alerts.sort((a, b) => a.order - b.order).slice(0, 12)
}

// Phone / browser notifications are shown outside the page, so they follow the App language setting here.
const uiLanguage = () => { try { return window.localStorage.getItem('brutti-ui-language-v1') === 'en' ? 'en' : 'bm' } catch { return 'bm' } }

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window
export const notificationPermission = () => (notificationsSupported() ? Notification.permission : 'unsupported')
export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported'
  try { return await Notification.requestPermission() } catch { return Notification.permission }
}

function readNotified() {
  try { const value = JSON.parse(window.localStorage.getItem(NOTIFIED_KEY) || '[]'); return new Set(Array.isArray(value) ? value : []) } catch { return new Set() }
}

async function show(title, body, tag) {
  const base = import.meta.env.BASE_URL
  const options = { body, tag, icon: `${base}icons/brutti-app-icon-512.png`, badge: `${base}icons/brutti-app-icon-512.png`, data: { url: base } }
  try {
    const registration = await navigator.serviceWorker?.getRegistration?.(base)
    if (registration?.showNotification) { await registration.showNotification(title, options); return }
  } catch { /* fall back below */ }
  try { new Notification(title, options) } catch { /* not allowed here */ }
}

// Fire system notifications that are due and not yet sent on this device.
export function fireDueSystemNotifications(prefs, now = new Date()) {
  if (notificationPermission() !== 'granted' || !prefs.enabled || !prefs.calendar || prefs.dnd) return
  const sent = readNotified()
  let changed = false
  readPlans().forEach((plan) => {
    const { time, hour, minute, note } = splitNote(plan)
    const day = parseDay(plan.date)
    const when = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute)
    const eve = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, EVE_HOUR, 0)
    const timeLabel = time ? formatDisplayTimeFromHm(time) : ''
    const dateLabel = formatDisplayDateFromKey(plan.date)
    const body = [timeLabel, note.trim()].filter(Boolean).join(' · ') || (uiLanguage() === 'en' ? 'Calendar Planner' : 'Perancang Kalendar')
    ;[[`${plan.id}-on`, when, plan.title], [`${plan.id}-eve`, eve, `${uiLanguage() === 'en' ? 'Tomorrow' : 'Esok'}: ${plan.title}`]].forEach(([key, at, title]) => {
      if (sent.has(key) || now < at || now - at > WINDOW_MS) return
      sent.add(key)
      changed = true
      show(title, key.endsWith('-eve') ? `${dateLabel}${timeLabel ? ` ${timeLabel}` : ''}` : body, `brutti-cal-${key}`)
    })
  })
  if (changed) {
    try { window.localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...sent].slice(-300))) } catch { /* storage blocked */ }
  }
}
