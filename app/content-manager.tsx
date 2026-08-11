"use client";

import { useEffect, useState } from "react";
import type { ContentRecord } from "./lib/brutti-store";

type Status = ContentRecord["status"];

export default function ContentManager() {
  const [items, setItems] = useState<ContentRecord[]>([]);
  const [editing, setEditing] = useState<ContentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/content", { cache: "no-store" });
    const data = await response.json() as { items?: ContentRecord[]; error?: string };
    setItems(data.items || []);
    setMessage(data.error || "");
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/content", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { items?: ContentRecord[]; error?: string }) => {
        if (!active) return;
        setItems(data.items || []);
        setMessage(data.error || "");
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function save(item: ContentRecord, status: Status = item.status) {
    setMessage("Saving…");
    const response = await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status }),
    });
    if (!response.ok) {
      setMessage("The change could not be saved. Please try again.");
      return;
    }
    setEditing(null);
    setMessage(status === "Published" ? "Content marked as Published." : `Content saved as ${status}.`);
    await load();
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div><p className="eyebrow">AI output</p><h3>Generated Facebook content</h3></div>
        <div className="manager-heading-actions"><span className="snapshot-label">Stored securely on this website</span><button className="text-link" onClick={() => void load()}>Refresh ↻</button></div>
      </div>
      {message && <p className="manager-message" aria-live="polite">{message}</p>}
      {loading ? <p className="empty-state">Loading content…</p> : (
        <div className="content-cards">
          {items.map((item) => (
            <article className="content-card" key={item.id}>
              <div className="content-card-head"><span className="platform-icon facebook">F</span><div><strong>{item.title}</strong><small>Facebook · {item.contentType}</small></div><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></div>
              {editing?.id === item.id ? (
                <div className="editor-box">
                  <label><span>Title</span><input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label>
                  <label><span>Content</span><textarea rows={10} value={editing.content} onChange={(event) => setEditing({ ...editing, content: event.target.value })} /></label>
                  <div className="content-actions"><button className="action-button primary" onClick={() => void save(editing)}>Save changes</button><button className="action-button" onClick={() => setEditing(null)}>Cancel</button></div>
                </div>
              ) : (
                <><p className="preserve-lines">{item.content}</p><div className="content-actions">
                  <button className="action-button" onClick={() => setEditing(item)}>Edit</button>
                  <button className="action-button approve" onClick={() => void save(item, "Approved")}>Approve</button>
                  <button className="action-button reject" onClick={() => void save(item, "Rejected")}>Reject</button>
                  <button className="action-button publish" onClick={() => void save(item, "Published")}>Publish</button>
                </div></>
              )}
            </article>
          ))}
          {!items.length && <p className="empty-state">No generated content yet.</p>}
        </div>
      )}
    </section>
  );
}
