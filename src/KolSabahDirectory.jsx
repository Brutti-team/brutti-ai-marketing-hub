import { useEffect, useMemo, useState } from 'react'
import { listGoogleKolSabah } from './lib/googleWorkspace'
import { contactLinks, filterKols, normalizeKol, primaryNiche, profileLinks, sampleKolSabah } from './lib/kolSabah'

export default function KolSabahDirectory({ workspaceActive, onStartCampaign }) {
  const [kols, setKols] = useState(() => sampleKolSabah())
  const [source, setSource] = useState('sample')
  const [query, setQuery] = useState('')
  const [niche, setNiche] = useState('All')
  useEffect(() => {
    if (!workspaceActive) return undefined
    let cancelled = false
    listGoogleKolSabah()
      .then((rows) => { if (!cancelled && Array.isArray(rows) && rows.length) { setKols(rows.map(normalizeKol).filter((k) => k.name)); setSource('sheet') } })
      .catch(() => { /* Apps Script action not deployed yet: keep bundled sample data. */ })
    return () => { cancelled = true }
  }, [workspaceActive])
  const niches = useMemo(() => ['All', ...Array.from(new Set(kols.filter((k) => k.niche).map((k) => primaryNiche(k.niche)))).sort()], [kols])
  const visible = filterKols(kols, query, niche)
  return (
    <section className="panel kol-directory">
      <div className="panel-heading"><div><span className="eyebrow">KOL SABAH DIRECTORY</span><h3>{visible.length} of {kols.length} KOLs</h3></div></div>
      <p className="mt-storage-note">{source === 'sheet' ? 'Live from the "KOL Sabah" tab of the BRUTTI Google Sheet (read-only).' : 'Showing bundled sample data (14 Oct 2026). Live Sheet data loads once Google is connected and list_kol_sabah is deployed.'}</p>
      <div className="kol-controls">
        <input type="search" placeholder="Search name, handle, niche, location…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search KOLs"/>
        <select value={niche} onChange={(e) => setNiche(e.target.value)} aria-label="Filter by niche">{niches.map((n) => <option key={n}>{n}</option>)}</select>
      </div>
      {visible.length === 0 ? <div className="mt-empty"><strong>No KOLs match.</strong></div> : (
        <div className="kol-grid">
          {visible.map((kol, index) => {
            const profiles = profileLinks(kol)
            const contacts = contactLinks(kol.businessContact)
            return (
              <article key={`${kol.name}-${index}`} className="kol-card">
                <header><strong>{kol.name}</strong>{kol.handle ? <span>{kol.handle}</span> : null}</header>
                <dl>
                  <div><dt>Niche</dt><dd>{kol.niche || '—'}</dd></div>
                  <div><dt>Location</dt><dd>{kol.location || '—'}</dd></div>
                  <div><dt>Followers</dt><dd>{kol.followers || '—'}</dd></div>
                  <div><dt>Business contact</dt><dd>{contacts.length ? contacts.map((c) => <a key={c.href} href={c.href} target="_blank" rel="noreferrer" className={`kol-contact ${c.type}`}>{c.type === 'whatsapp' ? 'WhatsApp ' : 'Email '}{c.label}</a>) : (kol.businessContact || '—')}</dd></div>
                </dl>
                {contacts.length && kol.businessContact ? <small className="kol-note">{kol.businessContact}</small> : null}
                {kol.notes ? <small className="kol-note">{kol.notes}</small> : null}
                <footer>
                  <div className="kol-links">{profiles.map((p) => <a key={p.href} href={p.href} target="_blank" rel="noreferrer">{p.label}</a>)}</div>
                  <button type="button" className="button secondary small" onClick={() => onStartCampaign?.(kol)}>Start KOL campaign</button>
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
