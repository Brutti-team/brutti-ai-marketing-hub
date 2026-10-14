import { useEffect, useMemo, useState } from 'react'
import { listGoogleKolSabah } from './lib/googleWorkspace'
import { filterKols, normalizeKol, primaryNiche, sampleKolSabah } from './lib/kolSabah'

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
            return (
              <article key={`${kol.name}-${index}`} className="kol-card">
                <header><strong>{kol.name}</strong></header>
                <dl>
                  <div><dt>Niche</dt><dd>{kol.niche || '—'}</dd></div>
                  <div><dt>Location</dt><dd>{kol.location || '—'}</dd></div>
                </dl>
                <footer>
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
