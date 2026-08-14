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
  const first = dateFromKey(keys[0])
  const last = dateFromKey(keys[keys.length - 1])
  const firstText = first.toLocaleDateString('en-MY', { day: '2-digit', month: first.getMonth() === last.getMonth() ? undefined : 'short' })
  const lastText = last.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
  return `${firstText}–${lastText}`
}

export function formatTimestamp(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleString('en-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function greetingForNow(value = new Date()) {
  const hour = value.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
