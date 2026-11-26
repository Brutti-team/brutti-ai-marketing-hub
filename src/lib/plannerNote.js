// Planner note text format, stored in the plan's existing Objective field (no new column):
//   @HH:MM <free note text>
//   [ ] open item
//   [x] done item
// The optional "@HH:MM " time prefix comes first; checklist lines are always the trailing lines.
const TIME_PREFIX = /^@(\d{2}:\d{2})\s?/
const ITEM_LINE = /^\[( |x|X)\]\s?(.*)$/

export function parsePlanObjective(raw) {
  let text = String(raw || '')
  const match = text.match(TIME_PREFIX)
  const time = match ? match[1] : ''
  if (match) text = text.slice(match[0].length)
  const lines = text.split('\n')
  const items = []
  while (lines.length && ITEM_LINE.test(lines[lines.length - 1])) {
    const [, mark, label] = lines.pop().match(ITEM_LINE)
    items.unshift({ text: label, done: mark !== ' ' })
  }
  return { time, note: lines.join('\n'), items }
}

export function buildPlanObjective({ time = '', note = '', items = [] }) {
  const lines = items.filter((item) => String(item.text || '').trim()).map((item) => `[${item.done ? 'x' : ' '}] ${String(item.text).trim()}`)
  const body = lines.length ? `${note.trim() ? note.trim() : ''}${note.trim() ? '\n' : ''}${lines.join('\n')}` : note.trim()
  return `${time ? `@${time} ` : ''}${body}`.trim()
}

export const checklistProgress = (items) => ({ done: items.filter((item) => item.done).length, total: items.length })
