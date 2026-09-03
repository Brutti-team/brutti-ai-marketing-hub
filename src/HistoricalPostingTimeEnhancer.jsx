import { useEffect } from 'react'

// Historical Smart Timing
// Source: supplied Facebook export reaction activity.
// We isolated 440 reaction timestamps tied directly to Brutti-owned page content
// and converted the export timestamps to Malaysia time (+08:00) for scheduling.
// Recommendations are constrained to Brutti office hours: 8:30 am–5:00 pm.
// This is an audience-activity proxy, not official Meta reach/impression analytics.

const WEEKDAY_TIMING = {
  0: { label: 'Sunday', slots: [10, 21, 18, 11, 16, 19], reactions: 19, urls: 13 },
  1: { label: 'Monday', slots: [10, 13, 11, 9, 17, 19], reactions: 89, urls: 59 },
  2: { label: 'Tuesday', slots: [21, 9, 10, 14, 17, 11], reactions: 65, urls: 36 },
  3: { label: 'Wednesday', slots: [10, 19, 11, 12, 17, 9], reactions: 87, urls: 45 },
  4: { label: 'Thursday', slots: [11, 8, 12, 19, 10, 9, 21], reactions: 77, urls: 40 },
  5: { label: 'Friday', slots: [21, 12, 9, 18, 15, 13, 14], reactions: 65, urls: 35 },
  6: { label: 'Saturday', slots: [20, 9, 19, 17, 10, 11], reactions: 38, urls: 24 },
}

const MIN_LEAD_MINUTES = 35
const OFFICE_START_MINUTES = (8 * 60) + 30
const OFFICE_END_MINUTES = 17 * 60
const PRACTICAL_STEP_MINUTES = 30

function sameLocalDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function plusDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  next.setHours(0, 0, 0, 0)
  return next
}

function minuteDate(date, minutes) {
  const next = new Date(date)
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return next
}

function minutesOfDay(date) {
  return (date.getHours() * 60) + date.getMinutes()
}

function ceilToStep(minutes, step = PRACTICAL_STEP_MINUTES) {
  return Math.ceil(minutes / step) * step
}

function formatTime(date) {
  return date.toLocaleTimeString('en-MY', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function confidenceFor(stats) {
  if (stats.reactions >= 40 && stats.urls >= 20) return 'Medium'
  return 'Low'
}

function rankedOfficeCandidates(date, stats) {
  return stats.slots
    .map((hour, rank) => {
      const historicalStart = hour * 60
      const historicalEnd = (hour + 1) * 60
      const windowStart = Math.max(historicalStart, OFFICE_START_MINUTES)
      const windowEnd = Math.min(historicalEnd, OFFICE_END_MINUTES)
      if (windowEnd <= windowStart) return null
      return {
        rank,
        startMinutes: windowStart,
        endMinutes: windowEnd,
        date: minuteDate(date, windowStart),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank)
}

function practicalOfficeFallback(date, cutoff) {
  const cutoffMinutes = minutesOfDay(cutoff)
  const nextMinutes = Math.max(OFFICE_START_MINUTES, ceilToStep(cutoffMinutes))
  if (nextMinutes > OFFICE_END_MINUTES) return null

  const start = minuteDate(date, nextMinutes)
  const windowStartMinutes = Math.max(OFFICE_START_MINUTES, nextMinutes - PRACTICAL_STEP_MINUTES)
  const windowStart = minuteDate(date, windowStartMinutes)
  const windowEnd = minuteDate(date, OFFICE_END_MINUTES)

  return {
    start,
    windowStart,
    windowEnd,
    fallback: true,
  }
}

function getHistoricalPostingTime(targetDate = new Date(), respectCurrentTime = false) {
  const now = new Date()
  let date = new Date(targetDate)
  date.setHours(0, 0, 0, 0)
  let stats = WEEKDAY_TIMING[date.getDay()]
  let shiftedToNextDay = false
  let fallback = false
  let start
  let windowStart
  let windowEnd

  const chooseTopHistorical = () => {
    const candidate = rankedOfficeCandidates(date, stats)[0]
    if (!candidate) return false
    start = candidate.date
    windowStart = minuteDate(date, candidate.startMinutes)
    windowEnd = minuteDate(date, candidate.endMinutes)
    return true
  }

  if (respectCurrentTime && sameLocalDay(date, now)) {
    const cutoff = new Date(now.getTime() + MIN_LEAD_MINUTES * 60 * 1000)
    const available = rankedOfficeCandidates(date, stats)
      .filter((item) => item.date >= cutoff)

    if (available.length) {
      const candidate = available[0]
      start = candidate.date
      windowStart = minuteDate(date, candidate.startMinutes)
      windowEnd = minuteDate(date, candidate.endMinutes)
    } else {
      const practical = practicalOfficeFallback(date, cutoff)
      if (practical) {
        start = practical.start
        windowStart = practical.windowStart
        windowEnd = practical.windowEnd
        fallback = true
      } else {
        date = plusDays(date, 1)
        stats = WEEKDAY_TIMING[date.getDay()]
        shiftedToNextDay = true
        chooseTopHistorical()
      }
    }
  } else {
    chooseTopHistorical()
  }

  if (!start) {
    start = minuteDate(date, OFFICE_START_MINUTES)
    windowStart = minuteDate(date, OFFICE_START_MINUTES)
    windowEnd = minuteDate(date, Math.min(OFFICE_START_MINUTES + 30, OFFICE_END_MINUTES))
    fallback = true
  }

  return {
    date,
    dateKey: dateKey(date),
    dayLabel: stats.label,
    time: formatTime(start),
    window: `${formatTime(windowStart)}–${formatTime(windowEnd)}`,
    confidence: confidenceFor(stats),
    reactions: stats.reactions,
    urls: stats.urls,
    shiftedToNextDay,
    fallback,
    mode: 'Historical Smart Timing · Office Hours',
    source: 'Brutti-owned Facebook reaction activity proxy',
  }
}

function dashboardPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.classList.contains('dashboard-page')) || null
}

function setMarkup(node, markup) {
  if (node && node.innerHTML !== markup) node.innerHTML = markup
}

function timingCardMarkup(timing) {
  const when = timing.shiftedToNextDay ? `Tomorrow · ${timing.dayLabel}` : timing.dayLabel
  const timingLabel = timing.fallback ? 'practical office-hours slot' : 'best historical window'
  return `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
      <div>
        <span style="display:block;font-size:10px;letter-spacing:.11em;text-transform:uppercase;opacity:.72;margin-bottom:4px">Best time to post · ${timing.mode}</span>
        <strong style="display:block;font-size:24px;line-height:1.1">${timing.time}</strong>
        <span style="display:block;margin-top:4px;font-size:12px;opacity:.82">${when} · ${timingLabel} ${timing.window}</span>
      </div>
      <span style="padding:6px 9px;border:1px solid currentColor;border-radius:999px;font-size:11px;opacity:.8">Confidence: ${timing.confidence}</span>
    </div>
    <small style="display:block;margin-top:9px;line-height:1.45;opacity:.68">Based on ${timing.reactions} historical reaction signals across ${timing.urls} Brutti-owned content URLs for ${timing.dayLabel}s. Recommendations are limited to Brutti office hours, 8:30 am–5:00 pm. Proxy only — not live Meta Insights.</small>
  `
}

function syncDashboardTiming() {
  const page = dashboardPage()
  if (!page) return
  const heroContent = page.querySelector('.hero-panel .hero-content')
  if (!heroContent) return

  const timing = getHistoricalPostingTime(new Date(), true)
  let card = heroContent.querySelector('.historical-posting-time')
  if (!card) {
    card = document.createElement('div')
    card.className = 'historical-posting-time'
    card.style.cssText = 'margin:18px 0 4px;padding:14px 16px;border:1px solid rgba(255,255,255,.26);border-radius:16px;background:rgba(255,255,255,.08);color:inherit;'
    const buttons = heroContent.querySelector('.hero-buttons')
    if (buttons) buttons.insertAdjacentElement('beforebegin', card)
    else heroContent.append(card)
  }
  setMarkup(card, timingCardMarkup(timing))
}

function syncPlanModalTiming() {
  const modal = document.querySelector('#root .plan-modal')
  if (!modal) return
  const dateInput = [...modal.querySelectorAll('label')]
    .find((label) => label.textContent?.trim().startsWith('Date'))
    ?.querySelector('input[type="date"]')
  if (!dateInput?.value) return

  const target = new Date(`${dateInput.value}T00:00:00`)
  const timing = getHistoricalPostingTime(target, dateInput.value === dateKey(new Date()))
  let note = modal.querySelector('.plan-modal-smart-timing')
  if (!note) {
    note = document.createElement('div')
    note.className = 'plan-modal-smart-timing'
    note.style.cssText = 'margin:-2px 0 14px;padding:10px 12px;border-radius:12px;background:rgba(238,246,239,.7);font-size:12px;line-height:1.45;'
    const dateRow = dateInput.closest('.two-fields')
    dateRow?.insertAdjacentElement('afterend', note)
  }
  const timingLabel = timing.fallback ? 'practical office-hours slot' : 'historical activity window'
  const markup = `<strong>Recommended posting time: ${timing.time}</strong><br><span style="opacity:.7">${timing.dayLabel} ${timingLabel} ${timing.window} · limited to Brutti office hours 8:30 am–5:00 pm · ${timing.confidence} confidence · not live Meta Insights.</span>`
  setMarkup(note, markup)

  if (dateInput.dataset.smartTimingBound !== '1') {
    dateInput.dataset.smartTimingBound = '1'
    dateInput.addEventListener('change', () => window.setTimeout(syncPlanModalTiming, 20))
  }
}

function syncAll() {
  syncDashboardTiming()
  syncPlanModalTiming()
}

export default function HistoricalPostingTimeEnhancer() {
  useEffect(() => {
    let timer = 0
    const schedule = (delay = 55) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(syncAll, delay)
    }

    const minuteTimer = window.setInterval(syncAll, 60 * 1000)
    const onClick = () => {
      schedule(55)
      window.setTimeout(syncAll, 180)
    }

    syncAll()
    document.addEventListener('click', onClick, true)

    return () => {
      window.clearTimeout(timer)
      window.clearInterval(minuteTimer)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
