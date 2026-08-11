"use client";

import { FormEvent, useEffect, useState } from "react";
import type { CalendarRecord } from "./lib/brutti-store";

const blank = {
  id: "", title: "", date: "", time: "10:00", platform: "Facebook",
  contentType: "Facebook Post", productName: "", notes: "", status: "Draft" as const,
  createdAt: "", updatedAt: "",
};

export default function CalendarManager() {
  const [items, setItems] = useState<CalendarRecord[]>([]);
  const [form, setForm] = useState<CalendarRecord>(blank);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/calendar", { cache: "no-store" });
    const data = await response.json() as { items?: CalendarRecord[]; error?: string };
    setItems(data.items || []);
    setMessage(data.error || "");
  }
  useEffect(() => {
    let active = true;
    fetch("/api/calendar", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { items?: CalendarRecord[]; error?: string }) => {
        if (!active) return;
        setItems(data.items || []);
        setMessage(data.error || "");
      });
    return () => { active = false; };
  }, []);

  function startNew() { setForm(blank); setShowForm(true); }
  function edit(item: CalendarRecord) { setForm(item); setShowForm(true); }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/calendar", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) { setMessage("Schedule could not be saved."); return; }
    setMessage("Schedule saved successfully.");
    setShowForm(false);
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this schedule?")) return;
    const response = await fetch(`/api/calendar?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) { setMessage("Schedule could not be deleted."); return; }
    setMessage("Schedule deleted.");
    await load();
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div><p className="eyebrow">Editable planner</p><h3>Facebook content calendar</h3></div>
        <button className="primary-inline-button" onClick={startNew}>+ Add schedule</button>
      </div>
      {message && <p className="manager-message" aria-live="polite">{message}</p>}
      {showForm && (
        <form className="calendar-editor" onSubmit={submit}>
          <label><span>Title *</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label><span>Date *</span><input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label><span>Time</span><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
          <label><span>Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CalendarRecord["status"] })}><option>Draft</option><option>Scheduled</option><option>Published</option></select></label>
          <label><span>Content type</span><input value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })} /></label>
          <label><span>Product</span><input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} /></label>
          <label className="field-wide"><span>Notes</span><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          <div className="calendar-form-actions"><button className="action-button primary" type="submit">Save schedule</button><button className="action-button" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
        </form>
      )}
      <div className="calendar-list">
        {items.map((item) => (
          <article className="calendar-list-card" key={item.id}>
            <div className="calendar-date"><strong>{new Date(`${item.date}T00:00:00`).toLocaleDateString("en-MY", { day: "2-digit" })}</strong><span>{new Date(`${item.date}T00:00:00`).toLocaleDateString("en-MY", { month: "short" })}</span></div>
            <div><span className="calendar-meta">{item.time || "Any time"} · Facebook · {item.contentType}</span><h4>{item.title}</h4><p>{item.productName || "General BRUTTI brand"}</p>{item.notes && <small>{item.notes}</small>}</div>
            <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span>
            <div className="calendar-row-actions"><button onClick={() => edit(item)}>Edit</button><button className="danger-link" onClick={() => void remove(item.id)}>Delete</button></div>
          </article>
        ))}
        {!items.length && <p className="empty-state">No schedule yet. Select “Add schedule” to begin.</p>}
      </div>
      <p className="data-note">All calendar changes are saved on the website. Publishing status is a workflow status; it does not automatically post to Facebook.</p>
    </section>
  );
}
