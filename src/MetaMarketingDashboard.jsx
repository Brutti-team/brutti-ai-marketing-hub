import { useEffect, useMemo, useRef, useState } from 'react'

// Meta marketing dashboard (read-only). Uses only the post-level fields the
// existing meta-insights snapshot already returns. Metrics Meta does not sync
// yet (follows, page visits, follower / non-follower split) are shown as
// "belum tersedia" instead of estimated numbers.

const PERIODS = [
  { days: 7, label: '7 hari lepas' },
  { days: 28, label: '28 hari lepas' },
  { days: 90, label: '90 hari lepas' },
]
const PLATFORMS = [
  { id: 'all', label: 'Semua' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
]
const DAY = 24 * 60 * 60 * 1000
const FB = '#4f7bd8'
const IG = '#d3628f'

function num(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}
function sum(list, key) {
  const values = list.map((item) => item[key]).filter((value) => value !== null)
  return values.length ? values.reduce((total, value) => total + value, 0) : null
}
function fmt(value) {
  if (value === null || value === undefined) return '—'
  if (Math.abs(value) >= 10000) return new Intl.NumberFormat('en-MY', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  return new Intl.NumberFormat('en-MY').format(Math.round(value))
}
function pct(value) { return value === null ? '—' : `${value.toFixed(value >= 10 ? 1 : 2)}%` }
function change(current, previous) {
  if (current === null || previous === null || previous === 0) return null
  return ((current - previous) / previous) * 100
}
function contentType(format) {
  const value = String(format || 'post').toLowerCase()
  if (value.includes('carousel') || value.includes('album')) return 'Carousel'
  if (value.includes('reel') || value.includes('video')) return 'Reel / Video'
  if (value.includes('photo') || value.includes('image')) return 'Gambar'
  return 'Post'
}
function startOfDay(time) { const d = new Date(time); d.setHours(0, 0, 0, 0); return d.getTime() }
function shortDate(time) { return new Date(time).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }) }
function postDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function metaDashboardPosts(snapshot) {
  const raw = [
    ...(Array.isArray(snapshot?.facebook?.topPosts) ? snapshot.facebook.topPosts : []),
    ...(Array.isArray(snapshot?.instagram?.topPosts) ? snapshot.instagram.topPosts : []),
  ]
  const seen = new Map()
  raw.forEach((post, index) => {
    const time = new Date(post?.createdTime || '').getTime()
    if (!Number.isFinite(time)) return
    const id = String(post?.sourceId || `${post?.platform}-${index}`)
    const reactions = num(post?.reactions); const comments = num(post?.comments); const shares = num(post?.shares); const saves = num(post?.saves)
    const parts = [reactions, comments, shares, saves]
    const interactions = num(post?.engagement) ?? (parts.some((v) => v !== null) ? parts.reduce((t, v) => t + (v || 0), 0) : null)
    seen.set(id, {
      id, time,
      platform: String(post?.platform || 'facebook').toLowerCase() === 'instagram' ? 'instagram' : 'facebook',
      type: contentType(post?.format),
      caption: String(post?.message || '').trim().split('\n').find((line) => line.trim()) || '',
      permalink: String(post?.permalink || ''),
      views: num(post?.views), reach: num(post?.reach), reactions, comments, shares, saves, interactions,
    })
  })
  return [...seen.values()]
}

function summarise(posts) {
  const interactions = sum(posts, 'interactions')
  const reachPosts = posts.filter((p) => p.reach !== null && p.reach > 0 && p.interactions !== null)
  const rate = reachPosts.length ? (sum(reachPosts, 'interactions') / sum(reachPosts, 'reach')) * 100 : null
  return { views: sum(posts, 'views'), reach: sum(posts, 'reach'), interactions, posts: posts.length, rate }
}

function buckets(days, end) {
  const weekly = days > 31
  const size = weekly ? 7 : 1
  const count = Math.ceil(days / size)
  const list = []
  for (let i = count - 1; i >= 0; i -= 1) {
    const to = end - i * size * DAY
    list.push({ from: to - size * DAY, to, label: shortDate(to - DAY) })
  }
  return { list, weekly }
}

function series(posts, bucketList, key) {
  return bucketList.map((bucket) => {
    const inBucket = posts.filter((p) => p.time >= bucket.from && p.time < bucket.to)
    return sum(inBucket, key) || 0
  })
}

function niceMax(value) {
  if (value <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value) || 10
  return step * power
}

function useWidth(fallback = 640) {
  const ref = useRef(null)
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => { const w = Math.round(entry.contentRect.width); if (w > 0) setWidth(w) })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width]
}

function LineChart({ labels, lines, height = 190 }) {
  const [ref, width] = useWidth()
  const pad = { l: 40, r: 12, t: 12, b: 26 }
  const max = niceMax(Math.max(0, ...lines.flatMap((line) => line.values)))
  const x = (i) => pad.l + (labels.length <= 1 ? 0 : (i * (width - pad.l - pad.r)) / (labels.length - 1))
  const y = (v) => pad.t + (height - pad.t - pad.b) * (1 - v / max)
  const ticks = [0, max / 2, max]
  const every = Math.max(1, Math.ceil(labels.length / Math.max(3, Math.floor(width / 90))))
  return (
    <div ref={ref} className="mmd-chart-wrap"><svg className="mmd-chart" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img">
      {ticks.map((t) => <g key={t}><line className="mmd-grid" x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} /><text className="mmd-axis" x={pad.l - 6} y={y(t) + 4} textAnchor="end">{fmt(t)}</text></g>)}
      {labels.map((label, i) => (i % every === 0 || i === labels.length - 1) ? <text key={label + i} className="mmd-axis" x={x(i)} y={height - 6} textAnchor="middle">{label}</text> : null)}
      {lines.map((line) => (
        <g key={line.name}>
          <path d={`M${line.values.map((v, i) => `${x(i)},${y(v)}`).join(' L')} L${x(line.values.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={line.color} opacity=".10" />
          <polyline fill="none" stroke={line.color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" points={line.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} vectorEffect="non-scaling-stroke" />
          {line.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={labels.length > 31 ? 0 : 2.6} fill={line.color}><title>{`${line.name} · ${labels[i]}: ${fmt(v)}`}</title></circle>)}
        </g>
      ))}
    </svg></div>
  )
}

function BarChart({ labels, groups, height = 190 }) {
  const [ref, width] = useWidth()
  const pad = { l: 40, r: 12, t: 12, b: 26 }
  const max = niceMax(Math.max(0, ...groups.flatMap((g) => g.values)))
  const slot = (width - pad.l - pad.r) / Math.max(1, labels.length)
  const barW = Math.max(2, Math.min(22, (slot * 0.72) / groups.length))
  const y = (v) => pad.t + (height - pad.t - pad.b) * (1 - v / max)
  const every = Math.max(1, Math.ceil(labels.length / Math.max(3, Math.floor(width / 90))))
  return (
    <div ref={ref} className="mmd-chart-wrap"><svg className="mmd-chart" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img">
      {[0, max / 2, max].map((t) => <g key={t}><line className="mmd-grid" x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} /><text className="mmd-axis" x={pad.l - 6} y={y(t) + 4} textAnchor="end">{fmt(t)}</text></g>)}
      {labels.map((label, i) => {
        const center = pad.l + slot * i + slot / 2
        const start = center - (barW * groups.length) / 2
        return (
          <g key={label + i}>
            {groups.map((g, gi) => <rect key={g.name} x={start + gi * barW} y={y(g.values[i])} width={barW - 1} height={Math.max(0, y(0) - y(g.values[i]))} rx="2" fill={g.color}><title>{`${g.name} · ${label}: ${fmt(g.values[i])}`}</title></rect>)}
            {(i % every === 0 || i === labels.length - 1) ? <text className="mmd-axis" x={center} y={height - 6} textAnchor="middle">{label}</text> : null}
          </g>
        )
      })}
    </svg></div>
  )
}

function Donut({ parts }) {
  const total = parts.reduce((t, p) => t + p.value, 0)
  const r = 52; const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="mmd-donut">
      <svg viewBox="0 0 140 140" role="img">
        <circle cx="70" cy="70" r={r} fill="none" className="mmd-donut-track" strokeWidth="18" />
        {total > 0 ? parts.map((p) => {
          const len = (p.value / total) * c
          const el = <circle key={p.name} cx="70" cy="70" r={r} fill="none" stroke={p.color} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)"><title>{`${p.name}: ${fmt(p.value)}`}</title></circle>
          offset += len
          return el
        }) : null}
        <text x="70" y="66" textAnchor="middle" className="mmd-donut-total">{fmt(total)}</text>
        <text x="70" y="84" textAnchor="middle" className="mmd-axis">interaksi</text>
      </svg>
      <ul>{parts.map((p) => <li key={p.name}><i style={{ background: p.color }} /><span>{p.name}</span><strong>{fmt(p.value)}</strong><small>{total ? `${Math.round((p.value / total) * 100)}%` : '—'}</small></li>)}</ul>
    </div>
  )
}

function Legend({ items }) {
  return <div className="mmd-legend">{items.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}</span>)}</div>
}

function Kpi({ tone, label, value, delta, note }) {
  const dir = delta === null ? 'flat' : delta >= 0 ? 'up' : 'down'
  return (
    <article className={`mmd-kpi mmd-tone-${tone}`}>
      <span className="mmd-kpi-label">{label}</span>
      <strong>{value}</strong>
      <small className={`mmd-delta mmd-${dir}`}>{delta === null ? 'Tiada perbandingan' : `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(1)}%`}<em>{note}</em></small>
    </article>
  )
}

export default function MetaMarketingDashboard({ snapshot, syncing, onRefresh }) {
  const [days, setDays] = useState(28)
  const [platform, setPlatform] = useState('all')
  const [sortKey, setSortKey] = useState('interactions')
  const allPosts = useMemo(() => metaDashboardPosts(snapshot), [snapshot])
  // Period ends at the end of today (local time); previous period is the same length right before it.
  const end = startOfDay(Date.now()) + DAY
  const view = useMemo(() => {
    const byPlatform = platform === 'all' ? allPosts : allPosts.filter((p) => p.platform === platform)
    const current = byPlatform.filter((p) => p.time >= end - days * DAY && p.time < end)
    const previous = byPlatform.filter((p) => p.time >= end - 2 * days * DAY && p.time < end - days * DAY)
    const { list, weekly } = buckets(days, end)
    const labels = list.map((b) => b.label)
    const fbPosts = current.filter((p) => p.platform === 'facebook')
    const igPosts = current.filter((p) => p.platform === 'instagram')
    const lineSets = platform === 'all'
      ? [{ name: 'Facebook', color: FB, posts: fbPosts }, { name: 'Instagram', color: IG, posts: igPosts }]
      : [{ name: platform === 'facebook' ? 'Facebook' : 'Instagram', color: platform === 'facebook' ? FB : IG, posts: current }]
    const types = ['Reel / Video', 'Gambar', 'Carousel', 'Post'].map((type) => {
      const list2 = current.filter((p) => p.type === type)
      return { type, count: list2.length, avg: list2.length ? (sum(list2, 'interactions') || 0) / list2.length : 0 }
    }).filter((t) => t.count)
    return {
      current, weekly, labels, lineSets, types,
      now: summarise(current), before: summarise(previous),
      fb: summarise(fbPosts), ig: summarise(igPosts),
      breakdown: [
        { name: 'Reaksi / Like', value: sum(current, 'reactions') },
        { name: 'Komen', value: sum(current, 'comments') },
        { name: 'Share', value: sum(current, 'shares') },
        { name: 'Simpan (IG sahaja)', value: sum(current.filter((p) => p.platform === 'instagram'), 'saves') },
      ],
      series: (key) => lineSets.map((set) => ({ name: set.name, color: set.color, values: series(set.posts, list, key) })),
    }
  }, [allPosts, platform, days, end])
  const topPosts = [...view.current].sort((a, b) => (b[sortKey] ?? -1) - (a[sortKey] ?? -1)).slice(0, 8)
  const maxBreak = Math.max(1, ...view.breakdown.map((b) => b.value || 0))
  const periodLabel = PERIODS.find((p) => p.days === days)?.label
  const lastSync = snapshot?.sourceUpdatedAt ? new Date(snapshot.sourceUpdatedAt).toLocaleString('ms-MY') : 'Belum ada'

  if (!allPosts.length) {
    return (
      <section className="panel mmd-shell" aria-label="Dashboard Meta">
        <div className="mmd-head"><div><span className="eyebrow">PRESTASI META</span><h3>Dashboard Marketing</h3></div></div>
        <p className="settings-copy">{syncing ? 'Sedang membaca data Meta…' : 'Data post Meta belum dapat dibaca. Dashboard akan keluar selepas sync Meta berjaya. Sistem tidak memaparkan angka rekaan.'}</p>
      </section>
    )
  }

  return (
    <section className="mmd-shell" aria-label="Dashboard Meta">
      <div className="mmd-head">
        <div><span className="eyebrow">PRESTASI META · FACEBOOK &amp; INSTAGRAM</span><h3>Dashboard Marketing</h3><small>Sync terakhir: {lastSync} · {fmt(allPosts.length)} post</small></div>
        <div className="mmd-controls">
          <div className="mmd-seg" role="group" aria-label="Platform">{PLATFORMS.map((p) => <button key={p.id} className={platform === p.id ? 'active' : ''} onClick={() => setPlatform(p.id)}>{p.label}</button>)}</div>
          <select className="mmd-select" value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Tempoh">{PERIODS.map((p) => <option key={p.days} value={p.days}>{p.label}</option>)}</select>
          {onRefresh ? <button className="mmd-refresh" onClick={onRefresh} disabled={syncing}>{syncing ? 'Menyelaras…' : 'Muat semula'}</button> : null}
        </div>
      </div>

      <div className="mmd-kpis">
        <Kpi tone="mint" label="Tontonan (Views)" value={fmt(view.now.views)} delta={change(view.now.views, view.before.views)} note="vs tempoh sebelum" />
        <Kpi tone="sky" label="Jangkauan (Reach)" value={fmt(view.now.reach)} delta={change(view.now.reach, view.before.reach)} note="jumlah setiap post" />
        <Kpi tone="peach" label="Interaksi" value={fmt(view.now.interactions)} delta={change(view.now.interactions, view.before.interactions)} note="vs tempoh sebelum" />
        <Kpi tone="lilac" label="Post diterbitkan" value={fmt(view.now.posts)} delta={change(view.now.posts, view.before.posts)} note="vs tempoh sebelum" />
        <Kpi tone="butter" label="Kadar engagement" value={pct(view.now.rate)} delta={change(view.now.rate, view.before.rate)} note="interaksi ÷ reach" />
      </div>

      <div className="mmd-grid">
        <article className="panel mmd-card mmd-wide">
          <div className="mmd-card-head"><div><span className="eyebrow">INTERAKSI</span><h4>Interaksi ikut {view.weekly ? 'minggu' : 'hari'}</h4></div><span className="mmd-chip">{periodLabel}</span></div>
          <LineChart labels={view.labels} lines={view.series('interactions')} />
          <Legend items={view.lineSets} />
        </article>

        <article className="panel mmd-card mmd-wide">
          <div className="mmd-card-head"><div><span className="eyebrow">TONTONAN</span><h4>Views ikut {view.weekly ? 'minggu' : 'hari'}</h4></div><span className="mmd-chip">{periodLabel}</span></div>
          <BarChart labels={view.labels} groups={view.series('views')} />
          <Legend items={view.lineSets} />
        </article>

        <article className="panel mmd-card">
          <div className="mmd-card-head"><div><span className="eyebrow">PLATFORM</span><h4>Facebook vs Instagram</h4></div></div>
          <Donut parts={[{ name: 'Facebook', color: FB, value: view.fb.interactions || 0 }, { name: 'Instagram', color: IG, value: view.ig.interactions || 0 }]} />
          <div className="mmd-mini-table">
            <div><span /><b>Post</b><b>Views</b><b>Reach</b></div>
            <div><span><i style={{ background: FB }} />Facebook</span><b>{fmt(view.fb.posts)}</b><b>{fmt(view.fb.views)}</b><b>{fmt(view.fb.reach)}</b></div>
            <div><span><i style={{ background: IG }} />Instagram</span><b>{fmt(view.ig.posts)}</b><b>{fmt(view.ig.views)}</b><b>{fmt(view.ig.reach)}</b></div>
          </div>
        </article>

        <article className="panel mmd-card">
          <div className="mmd-card-head"><div><span className="eyebrow">PECAHAN INTERAKSI</span><h4>Like, komen, share &amp; simpan</h4></div></div>
          <div className="mmd-hbars">{view.breakdown.map((b) => <div key={b.name}><span>{b.name}</span><i><b style={{ width: `${Math.round(((b.value || 0) / maxBreak) * 100)}%` }} /></i><strong>{fmt(b.value)}</strong></div>)}</div>
          <p className="mmd-note">Facebook tidak beri data “simpan”, jadi simpan dikira dari Instagram sahaja.</p>
        </article>

        <article className="panel mmd-card">
          <div className="mmd-card-head"><div><span className="eyebrow">JENIS CONTENT</span><h4>Purata interaksi setiap post</h4></div></div>
          <div className="mmd-hbars mmd-hbars-alt">{view.types.length ? view.types.map((t) => <div key={t.type}><span>{t.type} <small>({t.count})</small></span><i><b style={{ width: `${Math.round((t.avg / Math.max(1, ...view.types.map((x) => x.avg))) * 100)}%` }} /></i><strong>{fmt(t.avg)}</strong></div>) : <p className="mmd-note">Tiada post dalam tempoh ini.</p>}</div>
        </article>

        <article className="panel mmd-card mmd-pending">
          <div className="mmd-card-head"><div><span className="eyebrow">BELUM TERSEDIA</span><h4>Follows, Visits &amp; follower</h4></div></div>
          <ul>
            <li><strong>Follows / unfollow</strong><span>Belum diselaraskan dari Meta</span></li>
            <li><strong>Lawatan Page / profil (Visits)</strong><span>Belum diselaraskan dari Meta</span></li>
            <li><strong>Dari follower vs bukan follower</strong><span>Belum diselaraskan dari Meta</span></li>
          </ul>
          <p className="mmd-note">Angka ini tidak direka. Boleh ditambah kemudian dalam Apps Script (sync Meta) jika diluluskan.</p>
        </article>

        <article className="panel mmd-card mmd-full">
          <div className="mmd-card-head">
            <div><span className="eyebrow">SETIAP POST</span><h4>Post terbaik · {periodLabel}</h4></div>
            <select className="mmd-select" value={sortKey} onChange={(e) => setSortKey(e.target.value)} aria-label="Susun ikut">
              <option value="interactions">Ikut interaksi</option><option value="views">Ikut views</option><option value="reach">Ikut reach</option><option value="time">Terbaru</option>
            </select>
          </div>
          {topPosts.length ? <div className="mmd-posts">
            <div className="mmd-post mmd-post-head"><span>Post</span><b>Views</b><b>Reach</b><b>Interaksi</b><b>Komen</b><b>Share</b><span /></div>
            {topPosts.map((p) => (
              <div className="mmd-post" key={p.id}>
                <span className="mmd-post-main"><i className={`mmd-badge ${p.platform}`}>{p.platform === 'facebook' ? 'FB' : 'IG'}</i><span><strong>{postDate(p.time)} · {p.type}</strong>{p.caption ? <small>{p.caption}</small> : null}</span></span>
                <b data-label="Views">{fmt(p.views)}</b><b data-label="Reach">{fmt(p.reach)}</b><b data-label="Interaksi">{fmt(p.interactions)}</b><b data-label="Komen">{fmt(p.comments)}</b><b data-label="Share">{fmt(p.shares)}</b>
                {p.permalink ? <a className="mmd-link" href={p.permalink} target="_blank" rel="noreferrer">Lihat post ↗</a> : <span />}
              </div>
            ))}
          </div> : <p className="mmd-note">Tiada post dalam tempoh ini.</p>}
        </article>
      </div>
    </section>
  )
}
