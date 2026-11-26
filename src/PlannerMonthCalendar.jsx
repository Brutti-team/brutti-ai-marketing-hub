import { useState } from 'react'
import { dateFromKey, localDateKey, monthGridKeys } from './lib/dateUtils'
import { formatDisplayDateFromKey, formatDisplayTimeFromHm, formatDisplayWeekdayDate } from './lib/formatDate'
import { buildPlanObjective, checklistProgress, parsePlanObjective } from './lib/plannerNote'
import PlannerChecklist from './PlannerChecklist'

// Modern month calendar for the Calendar Planner (Michelle, 26 Nov). The Previous / Today / Next
// buttons stay in App.jsx. Notes are normal planner plans: they are saved through the same savePlan()
// flow as "Add content plan" (Daily Planner sheet when the workspace is connected, local storage otherwise).
// The optional time is stored as a leading "@HH:MM " in the plan's Objective field because the sheet has no time column.

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const CHIP_LIMIT = 2
// Hidden (Michelle, 26 Nov): the Type dropdown in the add-note form. Set to true to show it again. Existing type is kept on edit.
const SHOW_NOTE_TYPE = false
const NOTE_TYPES = ['Brand Awareness', 'Product Highlight', 'Educational', 'Behind the Scenes', 'Customer Story']
// Chip colours rotate by note id (type is hidden now), so the calendar looks varied like the reference design.
const TONES = ['blue', 'green', 'purple', 'orange', 'pink']
const toneFor = (plan) => {
  const key = String(plan?.id ?? plan?.title ?? '')
  let hash = 0
  for (let index = 0; index < key.length; index += 1) hash = (hash * 31 + key.charCodeAt(index)) >>> 0
  return TONES[hash % TONES.length]
}
const clock = (time) => formatDisplayTimeFromHm(time)
const splitPlanNote = (plan) => parsePlanObjective(plan?.objective)
const isPhone = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches
const dayLabel = (key) => formatDisplayWeekdayDate(key)

function Chip({ plan, onOpen }) {
  const { time, items } = splitPlanNote(plan)
  const progress = checklistProgress(items)
  return (
    <button type="button" className={`pcal-chip tone-${toneFor(plan)}`} onClick={(event) => { event.stopPropagation(); onOpen(plan) }} title={`${time ? `${clock(time)} · ` : ''}${plan.title}`}>
      <strong data-user-content>{plan.title}</strong>
      {time || progress.total ? <small className={progress.total ? 'has-progress' : ''}>{progress.total ? <span className={`pcal-progress ${progress.done === progress.total ? 'is-complete' : ''}`}>✓ {progress.done}/{progress.total}</span> : null}{time ? <span data-user-content>{clock(time)}</span> : null}</small> : null}
    </button>
  )
}

function NoteForm({ initial, onClose, onSave, onDelete, onMore }) {
  const start = splitPlanNote(initial)
  const [form, setForm] = useState({ title: initial.title || '', date: initial.date, time: start.time, type: initial.type || 'Brand Awareness', note: start.note, items: start.items })
  const [saving, setSaving] = useState(false)
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    await onSave({ ...initial, title: form.title.trim(), date: form.date, type: form.type, objective: buildPlanObjective(form) })
    setSaving(false)
  }
  return (
    <div className="modal-backdrop pcal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal plan-modal pcal-form" onSubmit={submit}>
        <div className="modal-head"><div><h2>{initial.id ? 'Edit note' : 'Add note'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
        <label>Title<input required autoFocus value={form.title} onChange={update('title')} data-user-content/></label>
        <div className="two-fields"><label>Date<input required type="date" value={form.date} onChange={update('date')}/></label><label>Time<input type="time" value={form.time} onChange={update('time')}/></label></div>
        {SHOW_NOTE_TYPE ? <label>Type<select value={form.type} onChange={update('type')}>{[...new Set([...NOTE_TYPES, form.type])].map((type) => <option key={type} value={type}>{type}</option>)}</select></label> : null}
        <label>Notes<textarea rows="3" value={form.note} onChange={update('note')}/></label>
        <PlannerChecklist items={form.items} onChange={(items) => setForm((current) => ({ ...current, items }))}/>
        <div className="modal-actions"><div>{initial.id ? <button type="button" className="button danger-subtle" onClick={() => onDelete(initial.id)}>Delete</button> : null}<button type="button" className="button secondary" onClick={() => onMore({ ...initial, title: form.title.trim(), date: form.date, type: form.type, objective: buildPlanObjective(form) })}>More options</button></div><div><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit" disabled={saving}>Save note</button></div></div>
      </form>
    </div>
  )
}

function DaySheet({ date, items, onClose, onOpen, onAdd, onToggle }) {
  return (
    <div className="modal-backdrop pcal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal plan-modal pcal-form pcal-daysheet">
        <div className="modal-head"><div><h2 data-user-content>{dayLabel(date)}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
        <div className="pcal-daylist">{items.length ? items.map((plan) => <div className="pcal-dayitem" key={plan.id}><Chip plan={plan} onOpen={onOpen}/>{splitPlanNote(plan).items.map((item, index) => <label className={`pcal-daycheck ${item.done ? 'is-done' : ''}`} key={index}><input type="checkbox" checked={item.done} onChange={() => onToggle(plan, index)}/><span data-user-content>{item.text}</span></label>)}</div>) : <p className="pcal-empty">No notes yet.</p>}</div>
        <div className="modal-actions"><div/><div><button type="button" className="button secondary" onClick={onClose}>Close</button><button type="button" className="button primary" onClick={() => onAdd(date)}>Add note</button></div></div>
      </div>
    </div>
  )
}

export default function PlannerMonthCalendar({ plans, monthAnchor, onSavePlan, onDeletePlan, onMoreOptions }) {
  const [form, setForm] = useState(null)
  const [daySheet, setDaySheet] = useState('')
  const today = localDateKey()
  const monthPrefix = localDateKey(monthAnchor).slice(0, 7)
  const byDate = plans.reduce((map, plan) => { (map[plan.date] = map[plan.date] || []).push(plan); return map }, {})
  const sorted = (date) => [...(byDate[date] || [])].sort((a, b) => (splitPlanNote(a).time || '99:99').localeCompare(splitPlanNote(b).time || '99:99'))
  const addNote = (date) => { setDaySheet(''); setForm({ id: null, title: '', date, channel: 'Facebook', type: 'Brand Awareness', status: 'Idea', product: 'General / No Product', objective: '' }) }
  const openNote = (plan) => { setDaySheet(''); setForm(plan) }
  const save = async (plan) => { if ((await onSavePlan(plan)) !== false) setForm(null) }
  const toggleItem = (plan, index) => { const parts = splitPlanNote(plan); onSavePlan({ ...plan, objective: buildPlanObjective({ ...parts, items: parts.items.map((item, at) => (at === index ? { ...item, done: !item.done } : item)) }) }) }
  const remove = async (id) => { await onDeletePlan(id); setForm(null) }
  const more = (plan) => { setForm(null); onMoreOptions(plan) }
  const cellClick = (date) => (isPhone() ? setDaySheet(date) : addNote(date))
  return (
    <>
      <section className="week-calendar pcal" aria-label="Content calendar">
        <div className="pcal-weekdays">{WEEKDAYS.map((name) => <div key={name}>{name}</div>)}</div>
        <div className="pcal-grid">
          {monthGridKeys(monthAnchor).map((date) => {
            const items = sorted(date)
            const shown = items.slice(0, CHIP_LIMIT)
            const extra = items.length - shown.length
            const outside = !date.startsWith(monthPrefix)
            return (
              <div key={date} className={`pcal-cell ${outside ? 'is-outside' : ''} ${date === today ? 'is-today' : ''}`} onClick={() => cellClick(date)}>
                <div className="pcal-cell-head"><span className="pcal-num">{dateFromKey(date).getDate()}</span><button type="button" className="pcal-plus" title="Add note" aria-label={`Add note ${formatDisplayDateFromKey(date)}`} onClick={(event) => { event.stopPropagation(); addNote(date) }}>+</button></div>
                <div className="pcal-chips">{shown.map((plan) => <Chip key={plan.id} plan={plan} onOpen={openNote}/>)}
                  {extra > 0 ? <button type="button" className="pcal-more" onClick={(event) => { event.stopPropagation(); setDaySheet(date) }}>{extra} more...</button> : null}
                </div>
                {items.length ? <div className="pcal-dots" aria-hidden="true">{items.slice(0, 4).map((plan) => <i key={plan.id} className={`tone-${toneFor(plan)}`}/>)}</div> : null}
              </div>
            )
          })}
        </div>
      </section>
      {daySheet ? <DaySheet date={daySheet} items={sorted(daySheet)} onClose={() => setDaySheet('')} onOpen={openNote} onAdd={addNote} onToggle={toggleItem}/> : null}
      {form ? <NoteForm key={form.id || 'new'} initial={form} onClose={() => setForm(null)} onSave={save} onDelete={remove} onMore={more}/> : null}
    </>
  )
}
