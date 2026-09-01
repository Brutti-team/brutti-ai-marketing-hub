"use client";

import { FormEvent, useState } from "react";
import type { GeneratedBruttiContent } from "./lib/brutti-soul-master";

const initialForm = { topic: "", objective: "", platform: "Facebook", event: "", people: "", facts: "", cta: "", performancePlan: "" };
type GeneratorResponse = { output?: GeneratedBruttiContent; error?: string; performanceStatus?: string };

export default function ContentGenerator() {
  const [form, setForm] = useState(initialForm); const [state, setState] = useState<"idle" | "generating" | "error" | "success">("idle"); const [message, setMessage] = useState(""); const [result, setResult] = useState<GeneratedBruttiContent | null>(null);
  const update = (field: keyof typeof initialForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("generating"); setMessage(""); setResult(null);
    try {
      const response = await fetch("/api/content/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const data = await response.json() as GeneratorResponse;
      if (!response.ok || !data.output) throw new Error(data.error || "Content could not be generated.");
      setResult(data.output); setMessage(`${data.performanceStatus || ""} Draft has been saved for review.`.trim()); setState("success"); window.dispatchEvent(new Event("brutti-content-created"));
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Content could not be generated."); }
  }
  return <section className="panel generator-panel">
    <div className="panel-heading"><div><p className="eyebrow">Brutti Soul Master</p><h3>Generate today&apos;s content</h3><p>Isi kejadian sebenar. Brutti AI akan baca context Meta/Sheets yang tersedia sebelum tulis draft.</p></div><span className="connection-badge"><i /> Private context</span></div>
    <form className="request-form" onSubmit={submit}><div className="form-grid">
      <label className="field"><span>Topik / produk *</span><input value={form.topic} onChange={(event) => update("topic", event.target.value)} required /></label>
      <label className="field"><span>Platform *</span><select value={form.platform} onChange={(event) => update("platform", event.target.value)}><option>Facebook</option><option>Instagram</option><option>Facebook + Instagram</option></select></label>
      <label className="field field-wide"><span>Tujuan post *</span><input value={form.objective} onChange={(event) => update("objective", event.target.value)} placeholder="Contoh: Brand awareness, kasi orang faham proses kerja" required /></label>
      <label className="field field-wide"><span>Apa kejadian sebenar hari ini? *</span><textarea value={form.event} onChange={(event) => update("event", event.target.value)} rows={3} required /></label>
      <label className="field"><span>Siapa terlibat</span><input value={form.people} onChange={(event) => update("people", event.target.value)} placeholder="Contoh: Faznur, team kilang" /></label>
      <label className="field"><span>CTA jika perlu</span><input value={form.cta} onChange={(event) => update("cta", event.target.value)} placeholder="Kosongkan jika tiada" /></label>
      <label className="field field-wide"><span>Fakta wajib *</span><textarea value={form.facts} onChange={(event) => update("facts", event.target.value)} rows={3} placeholder="Fakta yang boleh disebut. Jangan masukkan andaian." required /></label>
      <label className="field field-wide"><span>Data performance / rencana yang mahu dirujuk</span><textarea value={form.performancePlan} onChange={(event) => update("performancePlan", event.target.value)} rows={2} placeholder="Contoh: fokus format video proses jika data memang sokong" /></label>
    </div><div className="form-footer"><p className={`form-message ${state}`} aria-live="polite">{message || "Data Meta hanya digunakan sebagai context — bukan dakwaan marketing."}</p><button className="submit-button" type="submit" disabled={state === "generating"}>{state === "generating" ? "Generating…" : "Generate Brutti content"}</button></div></form>
    {result && <article className="generated-brief" aria-live="polite"><p className="eyebrow">Ready for review</p><h4>{result.contentAngle}</h4><div className="generated-section"><strong>Caption</strong><p className="preserve-lines">{result.caption}</p></div><div className="generated-section"><strong>3 hook alternatif</strong><ol>{result.hooks.map((hook) => <li key={hook}>{hook}</li>)}</ol></div><div className="generated-section"><strong>Visual / video</strong><p>{result.visualSuggestion}</p></div><div className="generated-section"><strong>CTA</strong><p>{result.cta || "Tidak diperlukan untuk draft ini."}</p></div><div className="generated-section"><strong>Kenapa bunyi Brutti</strong><p>{result.styleCheck}</p></div>{result.clarificationQuestions.length > 0 && <div className="generated-section"><strong>Perlu sahkan dulu</strong><ol>{result.clarificationQuestions.map((question) => <li key={question}>{question}</li>)}</ol></div>}</article>}
  </section>;
}
