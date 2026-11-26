// Display-only date and time helpers for the whole app (Michelle, 26 Nov 2026).
// Dates: DD-MM-YYYY (e.g. 27-11-2026). Times: h:mm AM/PM with no leading zero (e.g. 7:00 AM).
// Combined: '27-11-2026 · 7:00 AM'. Instants are shown in Asia/Kuching.
// Do not use these for storage, API params, @HH:MM planner prefixes, or <input type="date"|"time"> values.

export const DISPLAY_TIME_ZONE = 'Asia/Kuching'

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/
const HM = /^(\d{1,2}):(\d{2})$/
const DISPLAY_DATE = /^(\d{2})-(\d{2})-(\d{4})$/
const DISPLAY_DATE_TIME = /^(\d{2})-(\d{2})-(\d{4})\s*·\s*(\d{1,2}):(\d{2})\s*([AP]M)$/i
const LEGACY_TIMESTAMP = /^(\d{1,2})\s+([A-Za-z]{3,})\.?\s+(\d{4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*([APap][Mm]|PG|PTG|pagi|petang)?$/i

const MONTHS = {
  jan: 0, feb: 1, mac: 2, mar: 2, apr: 3, mei: 4, may: 4, jun: 5, jul: 6,
  ogos: 7, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, dis: 11, dec: 11,
}

const pad2 = (value) => String(value).padStart(2, '0')

function hour12(hour24) {
  return hour24 % 12 || 12
}

function meridiem(hour24) {
  return hour24 < 12 ? 'AM' : 'PM'
}

export function formatDisplayDateFromKey(key) {
  const match = String(key || '').trim().match(DATE_KEY)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

export function formatDisplayTimeFromHm(hm) {
  const match = String(hm || '').trim().match(HM)
  if (!match) return ''
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour > 23 || minute > 59) return ''
  return `${hour12(hour)}:${pad2(minute)} ${meridiem(hour)}`
}

function partsInZone(date) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: DISPLAY_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const map = {}
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') map[part.type] = part.value
  }
  return map
}

function formatPartsDate(map) {
  return `${map.day}-${map.month}-${map.year}`
}

function formatPartsTime(map) {
  const hour = Number.parseInt(map.hour, 10)
  const period = String(map.dayPeriod || '').replace(/\./g, '').trim().toUpperCase()
  const suffix = period.startsWith('P') || period === 'PTG' || period.startsWith('PETANG') ? 'PM' : 'AM'
  return `${hour}:${pad2(map.minute)} ${suffix}`
}

function resolveDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text) return null

  const display = text.match(DISPLAY_DATE_TIME)
  if (display) {
    let hour = Number(display[4])
    const minute = Number(display[5])
    const period = display[6].toUpperCase()
    if (period === 'AM' && hour === 12) hour = 0
    else if (period === 'PM' && hour !== 12) hour += 12
    return new Date(Number(display[3]), Number(display[2]) - 1, Number(display[1]), hour, minute)
  }

  const dateOnly = text.match(DISPLAY_DATE)
  if (dateOnly && text.length === 10) {
    return new Date(Number(dateOnly[3]), Number(dateOnly[2]) - 1, Number(dateOnly[1]), 12, 0, 0)
  }

  const key = text.match(DATE_KEY)
  if (key && text.length === 10) {
    return new Date(Number(key[1]), Number(key[2]) - 1, Number(key[3]), 12, 0, 0)
  }

  const legacy = text.match(LEGACY_TIMESTAMP)
  if (legacy) {
    const month = MONTHS[legacy[2].slice(0, 3).toLowerCase()]
    if (month != null) {
      let hour = Number(legacy[4])
      const minute = Number(legacy[5])
      const period = String(legacy[6] || '').toUpperCase()
      if (period === 'AM' || period === 'PG' || period.startsWith('PAGI')) {
        if (hour === 12) hour = 0
      } else if (period === 'PM' || period === 'PTG' || period.startsWith('PETANG')) {
        if (hour !== 12) hour += 12
      }
      return new Date(Number(legacy[3]), month, Number(legacy[1]), hour, minute)
    }
  }

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDisplayDate(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string') {
    const text = value.trim()
    if (DATE_KEY.test(text) && text.length === 10) return formatDisplayDateFromKey(text)
    if (DISPLAY_DATE.test(text) && text.length === 10) return text
  }
  const date = resolveDate(value)
  if (!date) return ''
  return formatPartsDate(partsInZone(date))
}

export function formatDisplayTime(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string') {
    const text = value.trim()
    if (HM.test(text) && !text.includes('T') && text.length <= 5) return formatDisplayTimeFromHm(text)
  }
  const date = resolveDate(value)
  if (!date) return ''
  return formatPartsTime(partsInZone(date))
}

export function formatDisplayDateTime(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string') {
    const text = value.trim()
    const already = text.match(DISPLAY_DATE_TIME)
    if (already) return `${already[1]}-${already[2]}-${already[3]} · ${Number(already[4])}:${already[5]} ${already[6].toUpperCase()}`
    if (DATE_KEY.test(text) && text.length === 10) return formatDisplayDateFromKey(text)
  }
  const date = resolveDate(value)
  if (!date) return ''
  const map = partsInZone(date)
  return `${formatPartsDate(map)} · ${formatPartsTime(map)}`
}

// Calendar day headings, e.g. 'Jumaat, 27-11-2026'. Date-only keys stay calendar dates (no TZ shift).
export function formatDisplayWeekdayDate(value) {
  if (typeof value === 'string' && DATE_KEY.test(value.trim()) && value.trim().length === 10) {
    const [, year, month, day] = value.trim().match(DATE_KEY)
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0)
    const weekday = date.toLocaleDateString('ms-MY', { weekday: 'long' })
    return `${weekday}, ${formatDisplayDateFromKey(value.trim())}`
  }
  const date = resolveDate(value)
  if (!date) return formatDisplayDate(value)
  const weekday = new Intl.DateTimeFormat('ms-MY', { timeZone: DISPLAY_TIME_ZONE, weekday: 'long' }).format(date)
  return `${weekday}, ${formatDisplayDate(date)}`
}
