import { useEffect, useState } from 'react'
import { listGoogleKolSabah } from './lib/googleWorkspace'
import { USE_GITHUB_DATA, loadGitHubKols } from './lib/dataSource.js'
import { filterKols, isHiddenKol, normalizeKol, sampleKolSabah } from './lib/kolSabah'
import { PreferWebpImg } from './lib/PreferWebpImg.jsx'

export default function KolSabahDirectory({ workspaceActive }) {
  const [kols, setKols] = useState(() => sampleKolSabah())
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  useEffect(() => {
    if (!workspaceActive && !USE_GITHUB_DATA) return undefined
    let cancelled = false
    ;(workspaceActive ? listGoogleKolSabah() : loadGitHubKols())
      .then((rows) => { if (!cancelled && Array.isArray(rows) && rows.length) { setKols(rows.map(normalizeKol).filter((k) => k.name && !isHiddenKol(k))) } })
      .catch(() => { /* Apps Script action not deployed yet: keep bundled sample data. */ })
    return () => { cancelled = true }
  }, [workspaceActive])
  const visible = filterKols(kols, query, 'All').slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' }))
  return (
    <section className="panel kol-directory">
      <div className="panel-heading"><div><span className="eyebrow">KOL SABAH DIRECTORY</span><h3>{visible.length} of {kols.length}</h3></div></div>
      <div className="kol-controls">
        <input type="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search KOLs"/>
      </div>
      {visible.length === 0 ? <div className="mt-empty"><strong>No KOLs match.</strong></div> : (
        <div className="kol-grid">
          {visible.map((kol, index) => {
            return (
              <article key={`${kol.name}-${index}`} className="kol-card">
                <header><strong>{kol.name}</strong></header>
                <div className="kol-photo">{kol.image ? <PreferWebpImg src={kol.image} alt={kol.name} loading="lazy"/> : <span>{(kol.name.match(/[A-Za-z0-9]+/g) || ['?']).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>}</div>
                <footer><button type="button" className="button secondary small" onClick={() => setSelected(kol)}>Details</button></footer>
              </article>
            )
          })}
        </div>
      )}
      {selected ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <div className="modal plan-modal kol-modal" role="dialog" aria-modal="true" aria-label={`${selected.name} details`}>
            <div className="modal-head"><div><span className="eyebrow">KOL SABAH</span><h2>{selected.name}</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={() => setSelected(null)}>✕</button></div>
            <dl className="kol-details">
                  <div><dt>Platform</dt><dd className="kol-links">{[['TikTok', selected.tiktok], ['Instagram', selected.instagram], ['Facebook', selected.facebook], ['YouTube', selected.youtube]].filter(([, url]) => url).map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>)}{!selected.tiktok && !selected.instagram && !selected.facebook && !selected.youtube && '-'}</dd></div>
                  <div><dt>No. Tel</dt><dd>{(selected.businessContact.match(/(?:\+?6?0)1[\d\s-]{7,11}\d/) || ['-'])[0]}</dd></div>
                  <div><dt>Rate</dt><dd>{selected.rate || '-'}</dd></div>
                </dl>
          </div>
        </div>
      ) : null}
    </section>
  )
}
