import { useState } from 'react'

// Editable checklist used in the planner note forms. items: [{ text, done }]
export default function PlannerChecklist({ items, onChange }) {
  const [draft, setDraft] = useState('')
  const set = (index, patch) => onChange(items.map((item, at) => (at === index ? { ...item, ...patch } : item)))
  const add = () => {
    const text = draft.trim()
    if (!text) return
    onChange([...items, { text, done: false }])
    setDraft('')
  }
  return (
    <div className="pcal-checklist">
      <span className="pcal-checklist-title">Checklist</span>
      {items.map((item, index) => (
        <div className={`pcal-check-row ${item.done ? 'is-done' : ''}`} key={index}>
          <input type="checkbox" checked={item.done} onChange={(event) => set(index, { done: event.target.checked })} aria-label="Done" />
          <input type="text" value={item.text} onChange={(event) => set(index, { text: event.target.value })} data-user-content />
          <button type="button" className="pcal-check-remove" onClick={() => onChange(items.filter((_, at) => at !== index))} aria-label="Remove item" title="Remove item">×</button>
        </div>
      ))}
      <div className="pcal-check-add">
        <input type="text" value={draft} placeholder="New item" onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add() } }} />
        <button type="button" className="button secondary small" onClick={add}>Add item</button>
      </div>
    </div>
  )
}
