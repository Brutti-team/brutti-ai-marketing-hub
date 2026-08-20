import { useEffect } from 'react'

// Historical Smart Timing
// Source: supplied Facebook export reaction activity.
// We isolated 440 reaction timestamps tied directly to Brutti-owned page content
// and converted the export timestamps to Malaysia time (+08:00) for scheduling.
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

function hourDate(date, hour) {
  const next = new Date(date)
  next.setHours(hour, 0, 0, 0)
  return next
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

function getHistoricalPostingTime(targetDate = new Date(), respectCurrentTime = false) {
  const now = new Date()
  let date = new Date(targetDate)
  date.setHours(0, 0, 0, 0)
  let stats = WEEKDAY_TIMING[date.getDay()]
  let chosenHour = stats.slots[0]
  let shiftedToNextDay = false

  if (respectCurrentTime && sameLocalDay(date, now)) {
    const cutoff = new Date(now.getTime() + MIN_LEAD_MINUTES * 60 * 1000)
    const available = stats.slots
      .map((hour, rank) => ({ hour, rank, date: hourDate(date, hour) }))
      .filter((item) => item.date >= cutoff)
      .sort((a, b) => a.rank - b.rank)

    if (available.length) {
      chosenHour = available[0].hour
    } else {
      date = plusDays(date, 1)
      stats = WEEKDAY_TIMING[date.getDay()]
      chosenHour = stats.slots[0]
      shiftedToNextDay = true
    }
  }

  const start = hourDate(date, chosenHour)
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  return {
    date,
    dateKey: dateKey(date),
    dayLabel: stats.label,
    time: formatTime(start),
    window: `${formatTime(start)}–${formatTime(end)}`,
    confidence: confidenceFor(stats),
    reactions: stats.reactions,
    urls: stats.urls,
    shiftedToNextDay,
    mode: 'Historical Smart Timing',
    source: 'Brutti-owned Facebook reaction activity proxy',
  }
}

function dashboardPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.classList.contains('dashboard-page')) || null
}

function plannerPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('h1')?.textContent?.trim() === 'Campaign Planner') || null
}

function setMarkup(node, markup) {
  if (node && node.innerHTML !== markup) node.innerHTML = markup
}

function timingCardMarkup(timing) {
  const when = timing.shiftedToNextDay ? `Tomorrow · ${timing.dayLabel}` : timing.dayLabel
  return `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
      <div>
        <span style="display:block;font-size:10px;letter-spacing:.11em;text-transform:uppercase;opacity:.72;margin-bottom:4px">Best time to post · ${timing.mode}</span>
        <strong style="display:block;font-size:24px;line-height:1.1">${timing.time}</strong>
        <span style="display:block;margin-top:4px;font-size:12px;opacity:.82">${when} · best activity window ${timing.window}</span>
      </div>
      <span style="padding:6px 9px;border:1px solid currentColor;border-radius:999px;font-size:11px;opacity:.8">Confidence: ${timing.confidence}</span>
    </div>
    <small style="display:block;margin-top:9px;line-height:1.45;opacity:.68">Based on ${timing.reactions} historical reaction signals across ${timing.urls} Brutti-owned content URLs for ${timing.dayLabel}s. Proxy only — not live Meta Insights.</small>
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

function syncPlannerTiming() {
  const page = plannerPage()
  if (!page) return
  const summary = page.querySelector('.planner-summary')
  if (!summary) return

  const timing = getHistoricalPostingTime(new Date(), true)
  let strip = page.querySelector('.planner-smart-timing-strip')
  if (!strip) {
    strip = document.createElement('div')
    strip.className = 'planner-smart-timing-strip'
    strip.style.cssText = 'margin:12px 0 18px;padding:11px 14px;border:1px solid rgba(20,74,58,.16);border-radius:14px;background:rgba(238,246,239,.65);display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;font-size:12px;'
    summary.insertAdjacentElement('afterend', strip)
  }
  const when = timing.shiftedToNextDay ? `Tomorrow · ${timing.dayLabel}` : `Today · ${timing.dayLabel}`
  const markup = `<span><strong>Historical Smart Timing</strong> · ${when}: <strong>${timing.time}</strong> <span style="opacity:.68">(${timing.window})</span></span><span style="opacity:.68">${timing.confidence} confidence · not live Meta</span>`
  setMarkup(strip, markup)
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
  const markup = `<strong>Recommended posting time: ${timing.time}</strong><br><span style="opacity:.7">${timing.dayLabel} historical activity window ${timing.window} · ${timing.confidence} confidence · not live Meta Insights.</span>`
  setMarkup(note, markup)

  if (dateInput.dataset.smartTimingBound !== '1') {
    dateInput.dataset.smartTimingBound = '1'
    dateInput.addEventListener('change', () => window.setTimeout(syncPlanModalTiming, 20))
  }
}

function syncAll() {
  syncDashboardTiming()
  syncPlannerTiming()
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
