import { useEffect, useState } from 'react'
import { listGoogleKolSabah } from './lib/googleWorkspace'
import { filterKols, normalizeKol, sampleKolSabah } from './lib/kolSabah'

export default function KolSabahDirectory({ workspaceActive }) {
  const [kols, setKols] = useState(() => sampleKolSabah())
  const [query, setQuery] = useState('')
  useEffect(() => {
    if (!workspaceActive) return undefined
    let cancelled = false
    listGoogleKolSabah()
      .then((rows) => { if (!cancelled && Array.isArray(rows) && rows.length) { setKols(rows.map(normalizeKol).filter((k) => k.name)) } })
      .catch(() => { /* Apps Script action not deployed yet: keep bundled sample data. */ })
    return () => { cancelled = true }
  }, [workspaceActive])
  const visible = filterKols(kols, query, 'All')
  return (
    <section className="panel kol-directory">
      <div className="panel-heading"><div><span className="eyebrow">KOL SABAH DIRECTORY</span><h3>{visible.length} of {kols.length} KOLs</h3></div></div>
      <div className="kol-controls">
        <input type="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search KOLs"/>
      </div>
      {visible.length === 0 ? <div className="mt-empty"><strong>No KOLs match.</strong></div> : (
        <div className="kol-grid">
          {visible.map((kol, index) => {
            return (
              <article key={`${kol.name}-${index}`} className="kol-card">
                <header><strong>{kol.name}</strong></header>
                <div className="kol-photo">{kol.image ? <img src={kol.image} alt={kol.name} loading="lazy"/> : <span>{(kol.name.match(/[A-Za-z0-9]+/g) || ['?']).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>}</div>
                <details className="kol-more"><summary className="button secondary small">Details</summary><dl className="kol-details">
                  <div><dt>Platform</dt><dd className="kol-links">{[['TikTok', kol.tiktok], ['Instagram', kol.instagram], ['Facebook', kol.facebook], ['YouTube', kol.youtube]].filter(([, url]) => url).map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>)}{!kol.tiktok && !kol.instagram && !kol.facebook && !kol.youtube && '-'}</dd></div>
                  <div><dt>No. Tel</dt><dd>{(kol.businessContact.match(/(?:\+?6?0)1[\d\s-]{7,11}\d/) || ['-'])[0]}</dd></div>
                  <div><dt>Rate</dt><dd>{kol.rate || '-'}</dd></div>
                </dl></details>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
