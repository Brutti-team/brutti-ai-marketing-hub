import { formatDisplayDateFromKey, formatDisplayDateTime } from './formatDate'

export function localDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function dateFromKey(key) {
  const [year, month, day] = String(key).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(value, amount) {
  const date = value instanceof Date ? new Date(value) : dateFromKey(value)
  date.setDate(date.getDate() + amount)
  return date
}

export function startOfWeek(value = new Date()) {
  const date = value instanceof Date ? new Date(value) : dateFromKey(value)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export function weekKeys(anchor = new Date()) {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, index) => localDateKey(addDays(start, index)))
}

export function formatDateRange(keys) {
  if (!keys?.length) return ''
  const firstText = formatDisplayDateFromKey(keys[0])
  const lastText = formatDisplayDateFromKey(keys[keys.length - 1])
  return firstText === lastText ? firstText : `${firstText} – ${lastText}`
}

export function formatTimestamp(value = new Date()) {
  return formatDisplayDateTime(value)
}

export function greetingForNow(value = new Date()) {
  const hour = value.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function startOfMonth(value = new Date()) {
  const date = value instanceof Date ? value : dateFromKey(value)
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(value, amount) {
  const date = startOfMonth(value)
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

// Every date shown in a Monday-first month grid: full weeks covering the month (5–6 rows).
export function monthGridKeys(anchor = new Date()) {
  const first = startOfMonth(anchor)
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0)
  const start = startOfWeek(first)
  const end = addDays(startOfWeek(last), 6)
  const keys = []
  for (let day = new Date(start); day <= end; day = addDays(day, 1)) keys.push(localDateKey(day))
  return keys
}

export function formatMonthTitle(value = new Date()) {
  return startOfMonth(value).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })
}
