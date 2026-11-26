// Planner note text format, stored in the plan's existing Objective field (no new column):
//   @HH:MM #Event <free note text>
//   [ ] open item
//   [x] done item
// The optional "@HH:MM " time prefix comes first, then an optional "#Event/#Posting/#Task "
// kind mark (Michelle, 26 Nov 2026). Checklist lines are always the trailing lines.
const TIME_PREFIX = /^@(\d{2}:\d{2})\s?/
const KIND_MARK = /^#(Event|Posting|Task)\s?/
const ITEM_LINE = /^\[( |x|X)\]\s?(.*)$/

export const NOTE_KINDS = ['Event', 'Posting', 'Task']

export function parsePlanObjective(raw) {
  let text = String(raw || '')
  const match = text.match(TIME_PREFIX)
  const time = match ? match[1] : ''
  if (match) text = text.slice(match[0].length)
  const kindMatch = text.match(KIND_MARK)
  const kind = kindMatch ? kindMatch[1] : ''
  if (kindMatch) text = text.slice(kindMatch[0].length)
  const lines = text.split('\n')
  const items = []
  while (lines.length && ITEM_LINE.test(lines[lines.length - 1])) {
    const [, mark, label] = lines.pop().match(ITEM_LINE)
    items.unshift({ text: label, done: mark !== ' ' })
  }
  return { time, kind, note: lines.join('\n'), items }
}

export function buildPlanObjective({ time = '', kind = '', note = '', items = [] }) {
  const lines = items.filter((item) => String(item.text || '').trim()).map((item) => `[${item.done ? 'x' : ' '}] ${String(item.text).trim()}`)
  const body = lines.length ? `${note.trim() ? note.trim() : ''}${note.trim() ? '\n' : ''}${lines.join('\n')}` : note.trim()
  const prefix = `${time ? `@${time} ` : ''}${NOTE_KINDS.includes(kind) ? `#${kind} ` : ''}`
  return `${prefix}${body}`.trim()
}

export const checklistProgress = (items) => ({ done: items.filter((item) => item.done).length, total: items.length })
