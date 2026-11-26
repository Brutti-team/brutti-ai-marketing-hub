import { formatDisplayDate, formatDisplayDateTime } from './lib/formatDate'
import { useEffect, useMemo, useRef, useState } from 'react'
import { USE_GITHUB_DATA, loadMetaArchivePosts } from './lib/dataSource.js'

// Meta marketing dashboard (read-only). Uses only the post-level fields the
// existing meta-insights snapshot already returns. Metrics Meta does not sync
// yet (follows, page visits, follower / non-follower split) are shown as
// "belum tersedia" instead of estimated numbers.

// Hidden for now (Michelle, 25 Nov 2026). Code kept so they can be turned back on.
const SHOW_META_DASHBOARD_EYEBROW = false
const SHOW_META_SYNC_LINE = false
const SHOW_META_UNAVAILABLE_CARD = false
const SHOW_SAVES_BREAKDOWN = false

const PERIODS = [
  { days: 7, label: 'Seminggu lepas' },
  { days: 30, label: 'Sebulan lepas' },
  { days: 365, label: 'Setahun lepas' },
]
const SHOW_META_REFRESH = false
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
function metricSplit(name, posts, key) {
  if (!posts.length) return { name, value: 0, available: true }
  const value = sum(posts, key)
  return { name, value, available: value !== null }
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
function shortDate(time) {
  // Chart axis: day and month only (28-10), so a week of labels can all fit (Michelle, 26 Nov 2026).
  const full = formatDisplayDate(time)
  const match = String(full).match(/^(\d{2}-\d{2})-\d{4}$/)
  return match ? match[1] : full
}
function monthName(key) {
  const date = new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1)
  return date.toLocaleDateString('en-GB', { month: 'short' })
}
function monthGroupsOf(keys) {
  const groups = []
  for (const key of keys) {
    const year = key.slice(0, 4)
    const last = groups[groups.length - 1]
    if (!last || last.year !== year) groups.push({ year, keys: [key] })
    else last.keys.push(key)
  }
  return groups
}
function MonthSelect({ value, onChange, months }) {
  return (
    <select className="mmd-select" value={value} onChange={onChange} aria-label="Pilih bulan">
      <option value="">Pilih bulan</option>
      {monthGroupsOf(months).map((group) => (
        <optgroup key={group.year} label={group.year}>
          {group.keys.map((key) => <option key={key} value={key}>{monthName(key)}</option>)}
        </optgroup>
      ))}
    </select>
  )
}
function labelStep(count, width) {
  // Show a label on every day when they fit. A week always shows all 7; a month shows all
  // days when each label has at least 28px, otherwise skip just enough to stay readable.
  if (count <= 14) return 1
  const inner = Math.max(120, width - 52)
  const minPx = 28
  if (inner / count >= minPx) return 1
  return Math.max(1, Math.ceil(count / Math.max(1, Math.floor(inner / minPx))))
}
function postDate(value) { return formatDisplayDateTime(value) }

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

function monthStart(time) {
  const date = new Date(time)
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}
function addMonths(time, count) {
  const date = new Date(time)
  date.setMonth(date.getMonth() + count)
  return date.getTime()
}
function monthKeyOf(time) {
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
function monthLabel(keyOrTime) {
  const date = typeof keyOrTime === 'string'
    ? new Date(Number(keyOrTime.slice(0, 4)), Number(keyOrTime.slice(5, 7)) - 1, 1)
    : new Date(keyOrTime)
  return date.toLocaleDateString('ms-MY', { month: 'short', year: 'numeric' })
}
function monthRange(key) {
  const from = monthStart(new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1).getTime())
  const to = addMonths(from, 1)
  return { from, to, prevFrom: addMonths(from, -1), prevTo: from }
}
function dayBuckets(from, to) {
  const list = []
  for (let time = from; time < to; time += DAY) list.push({ from: time, to: time + DAY, label: shortDate(time) })
  return list
}
function monthBuckets(from, to) {
  const list = []
  for (let time = monthStart(from); time < to; time = addMonths(time, 1)) {
    const next = addMonths(time, 1)
    list.push({ from: Math.max(time, from), to: Math.min(next, to), label: monthLabel(time) })
  }
  return list
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


function useChartTip() {
  const [tip, setTip] = useState(null)
  const show = (event, text) => {
    const root = event.currentTarget.closest('.mmd-tip-root')
    if (!root) return
    const box = root.getBoundingClientRect()
    let x = event.clientX - box.left + 12
    let y = event.clientY - box.top - 38
    if (x + 190 > box.width) x = Math.max(8, box.width - 190)
    if (x < 8) x = 8
    if (y < 8) y = event.clientY - box.top + 16
    setTip({ text, x, y })
  }
  const hide = () => setTip(null)
  const node = tip ? <div className="mmd-tip" role="tooltip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div> : null
  return { show, hide, node }
}

function LineChart({ labels, lines, height = 190 }) {
  const [ref, width] = useWidth()
  const { show, hide, node } = useChartTip()
  const pad = { l: 40, r: 12, t: 12, b: 26 }
  const max = niceMax(Math.max(0, ...lines.flatMap((line) => line.values)))
  const x = (i) => pad.l + (labels.length <= 1 ? 0 : (i * (width - pad.l - pad.r)) / (labels.length - 1))
  const y = (v) => pad.t + (height - pad.t - pad.b) * (1 - v / max)
  const ticks = [0, max / 2, max]
  const every = labelStep(labels.length, width)
  const dense = labels.length > 10 && every === 1
  return (
    <div ref={ref} className="mmd-chart-wrap mmd-tip-root" onPointerLeave={hide}>
      <svg className="mmd-chart" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img">
        {ticks.map((t) => <g key={t}><line className="mmd-grid" x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} /><text className="mmd-axis" x={pad.l - 6} y={y(t) + 4} textAnchor="end">{fmt(t)}</text></g>)}
        {labels.map((label, i) => (i % every === 0 || i === labels.length - 1) ? <text key={label + i} className={`mmd-axis${dense ? ' is-dense' : ''}`} x={x(i)} y={height - 6} textAnchor="middle">{label}</text> : null)}
        {lines.map((line) => (
          <g key={line.name}>
            <path d={`M${line.values.map((v, i) => `${x(i)},${y(v)}`).join(' L')} L${x(line.values.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={line.color} opacity=".10" />
            <polyline fill="none" stroke={line.color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" points={line.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} vectorEffect="non-scaling-stroke" />
            {line.values.map((v, i) => {
              const text = `${line.name} · ${labels[i]}: ${fmt(v)}`
              return (
                <g key={i} onPointerEnter={(event) => show(event, text)} onPointerMove={(event) => show(event, text)}>
                  <circle cx={x(i)} cy={y(v)} r={labels.length > 31 ? 0 : 2.6} fill={line.color} />
                  <circle cx={x(i)} cy={y(v)} r="9" fill="transparent" />
                </g>
              )
            })}
          </g>
        ))}
      </svg>
      {node}
    </div>
  )
}

function BarChart({ labels, groups, height = 190 }) {
  const [ref, width] = useWidth()
  const { show, hide, node } = useChartTip()
  const pad = { l: 40, r: 12, t: 12, b: 26 }
  const max = niceMax(Math.max(0, ...groups.flatMap((g) => g.values)))
  const slot = (width - pad.l - pad.r) / Math.max(1, labels.length)
  const barW = Math.max(2, Math.min(22, (slot * 0.72) / groups.length))
  const y = (v) => pad.t + (height - pad.t - pad.b) * (1 - v / max)
  const every = labelStep(labels.length, width)
  const dense = labels.length > 10 && every === 1
  return (
    <div ref={ref} className="mmd-chart-wrap mmd-tip-root" onPointerLeave={hide}>
      <svg className="mmd-chart" viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img">
        {[0, max / 2, max].map((t) => <g key={t}><line className="mmd-grid" x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} /><text className="mmd-axis" x={pad.l - 6} y={y(t) + 4} textAnchor="end">{fmt(t)}</text></g>)}
        {labels.map((label, i) => {
          const center = pad.l + slot * i + slot / 2
          const start = center - (barW * groups.length) / 2
          return (
            <g key={label + i}>
              {groups.map((g, gi) => {
                const text = `${g.name} · ${label}: ${fmt(g.values[i])}`
                return <rect key={g.name} x={start + gi * barW} y={y(g.values[i])} width={barW - 1} height={Math.max(0, y(0) - y(g.values[i]))} rx="2" fill={g.color} onPointerEnter={(event) => show(event, text)} onPointerMove={(event) => show(event, text)} />
              })}
              {(i % every === 0 || i === labels.length - 1) ? <text className={`mmd-axis${dense ? ' is-dense' : ''}`} x={center} y={height - 6} textAnchor="middle">{label}</text> : null}
            </g>
          )
        })}
      </svg>
      {node}
    </div>
  )
}

function Donut({ parts }) {
  const { show, hide, node } = useChartTip()
  const total = parts.reduce((t, p) => t + p.value, 0)
  const r = 52; const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="mmd-donut mmd-tip-root" onPointerLeave={hide}>
      <svg viewBox="0 0 140 140" role="img">
        <circle cx="70" cy="70" r={r} fill="none" className="mmd-donut-track" strokeWidth="18" />
        {total > 0 ? parts.map((p) => {
          const len = (p.value / total) * c
          const text = `${p.name}: ${fmt(p.value)}`
          const el = <circle key={p.name} cx="70" cy="70" r={r} fill="none" stroke={p.color} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" style={{ pointerEvents: 'stroke' }} onPointerEnter={(event) => show(event, text)} onPointerMove={(event) => show(event, text)} />
          offset += len
          return el
        }) : null}
        <text x="70" y="66" textAnchor="middle" className="mmd-donut-total">{fmt(total)}</text>
        <text x="70" y="84" textAnchor="middle" className="mmd-axis">interaksi</text>
      </svg>
      <ul>{parts.map((p) => <li key={p.name}><i style={{ background: p.color }} /><span>{p.name}</span><strong>{fmt(p.value)}</strong><small>{total ? `${Math.round((p.value / total) * 100)}%` : '—'}</small></li>)}</ul>
      {node}
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
  const [days, setDays] = useState(30)
  const [monthKey, setMonthKey] = useState('')
  const [platform, setPlatform] = useState('all')
  const [sortKey, setSortKey] = useState('interactions')
  const [openBreaks, setOpenBreaks] = useState({})
  const wasEmpty = useRef(true)
  // Older posts live in yearly archive files; fetch them only when the chosen
  // period (or its comparison period) reaches past the recent window.
  const [archivePosts, setArchivePosts] = useState([])
  const [archiveYears, setArchiveYears] = useState([])
  const recentPosts = useMemo(() => metaDashboardPosts(snapshot), [snapshot])
  useEffect(() => {
    if (!USE_GITHUB_DATA || !recentPosts.length) return undefined
    const dayEnd = startOfDay(Date.now()) + DAY
    const needFrom = monthKey ? monthRange(monthKey).prevFrom : dayEnd - 2 * days * DAY
    const oldest = recentPosts.reduce((min, post) => Math.min(min, post.time), Infinity)
    if (!(needFrom < oldest)) return undefined
    const years = []
    for (let year = new Date(needFrom).getFullYear(); year <= new Date(oldest).getFullYear(); year += 1) if (!archiveYears.includes(year)) years.push(year)
    if (!years.length) return undefined
    let cancelled = false
    loadMetaArchivePosts(years).then((posts) => {
      if (cancelled) return
      setArchiveYears((current) => [...current, ...years])
      if (posts.length) setArchivePosts((current) => [...current, ...posts])
    }).catch(() => { /* dashboard keeps the recent window */ })
    return () => { cancelled = true }
  }, [recentPosts, days, monthKey, archiveYears])
  const allPosts = useMemo(() => {
    if (!archivePosts.length) return recentPosts
    const ids = new Set(recentPosts.map((post) => post.id))
    return [...recentPosts, ...metaDashboardPosts({ facebook: { topPosts: archivePosts } }).filter((post) => !ids.has(post.id))]
  }, [recentPosts, archivePosts])
  const monthsWithData = useMemo(() => {
    const keys = [...new Set(allPosts.map((post) => monthKeyOf(post.time)))]
    return keys.sort().reverse()
  }, [allPosts])
  useEffect(() => {
    if (wasEmpty.current && allPosts.length) {
      wasEmpty.current = false
      const pin = () => {
        const html = document.documentElement
        const prev = html.style.scrollBehavior
        html.style.scrollBehavior = 'auto'
        window.scrollTo(0, 0)
        html.style.scrollBehavior = prev
      }
      pin()
      const frame = window.requestAnimationFrame(pin)
      const timer = window.setTimeout(pin, 50)
      return () => { window.cancelAnimationFrame(frame); window.clearTimeout(timer) }
    }
    if (!allPosts.length) wasEmpty.current = true
  }, [allPosts.length])
  // Rolling periods end at the end of today (local time). A chosen calendar month is that month only.
  const end = startOfDay(Date.now()) + DAY
  const view = useMemo(() => {
    const byPlatform = platform === 'all' ? allPosts : allPosts.filter((p) => p.platform === platform)
    const picked = monthKey ? monthRange(monthKey) : null
    const currentFrom = picked ? picked.from : end - days * DAY
    const currentTo = picked ? picked.to : end
    const previousFrom = picked ? picked.prevFrom : end - 2 * days * DAY
    const previousTo = picked ? picked.prevTo : end - days * DAY
    const current = byPlatform.filter((p) => p.time >= currentFrom && p.time < currentTo)
    const previous = byPlatform.filter((p) => p.time >= previousFrom && p.time < previousTo)
    const byMonth = Boolean(picked) || days > 31
    const list = byMonth && !picked ? monthBuckets(currentFrom, currentTo) : dayBuckets(currentFrom, currentTo)
    const labels = list.map((b) => b.label)
    const grain = byMonth && !picked ? 'bulan' : 'hari'
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
      current, grain, labels, lineSets, types,
      now: summarise(current), before: summarise(previous),
      fb: summarise(fbPosts), ig: summarise(igPosts),
      breakdown: [
        { id: 'reactions', name: 'Reaksi / Like', value: sum(current, 'reactions'), split: [
          metricSplit('Facebook', fbPosts, 'reactions'),
          metricSplit('Instagram', igPosts, 'reactions'),
        ] },
        { id: 'comments', name: 'Komen', value: sum(current, 'comments'), split: [
          metricSplit('Facebook', fbPosts, 'comments'),
          metricSplit('Instagram', igPosts, 'comments'),
        ] },
        { id: 'share', name: 'Share', value: sum(current, 'shares'), split: [
          metricSplit('Facebook', fbPosts, 'shares'),
          metricSplit('Instagram', igPosts, 'shares'),
        ] },
        ...(SHOW_SAVES_BREAKDOWN ? [{ name: 'Simpan (IG sahaja)', value: sum(igPosts, 'saves') }] : []),
      ],
      series: (key) => lineSets.map((set) => ({ name: set.name, color: set.color, values: series(set.posts, list, key) })),
    }
  }, [allPosts, platform, days, monthKey, end])
  const maxBreak = Math.max(1, ...view.breakdown.map((b) => b.value || 0))
  // Interactions / Views by day always show the last 7 calendar days, independent of the period selector.
  const weekView = useMemo(() => {
    const byPlatform = platform === 'all' ? allPosts : allPosts.filter((p) => p.platform === platform)
    const from = end - 7 * DAY
    const list = dayBuckets(from, end)
    const current = byPlatform.filter((p) => p.time >= from && p.time < end)
    const fbPosts = current.filter((p) => p.platform === 'facebook')
    const igPosts = current.filter((p) => p.platform === 'instagram')
    const lineSets = platform === 'all'
      ? [{ name: 'Facebook', color: FB, posts: fbPosts }, { name: 'Instagram', color: IG, posts: igPosts }]
      : [{ name: platform === 'facebook' ? 'Facebook' : 'Instagram', color: platform === 'facebook' ? FB : IG, posts: current }]
    return {
      labels: list.map((b) => b.label),
      lineSets,
      series: (key) => lineSets.map((set) => ({ name: set.name, color: set.color, values: series(set.posts, list, key) })),
    }
  }, [allPosts, platform, end])
  // Top posts follow the month picker, or the current calendar month when none is chosen.
  const topMonthKey = monthKey || monthKeyOf(Date.now())
  const topMonth = monthRange(topMonthKey)
  const topMonthPosts = (platform === 'all' ? allPosts : allPosts.filter((p) => p.platform === platform))
    .filter((p) => p.time >= topMonth.from && p.time < topMonth.to)
  const topPosts = [...topMonthPosts].sort((a, b) => (b[sortKey] ?? -1) - (a[sortKey] ?? -1)).slice(0, 8)
  const topMonthLabel = monthLabel(topMonthKey)
  const lastSync = snapshot?.sourceUpdatedAt ? formatDisplayDateTime(snapshot.sourceUpdatedAt) : 'Belum ada'

  if (!allPosts.length) {
    return (
      <section className="panel mmd-shell" aria-label="Dashboard Meta">
        <div className="page-header mmd-head">
          <div>{SHOW_META_DASHBOARD_EYEBROW ? <span className="eyebrow">PRESTASI META</span> : null}<h1>Dashboard Marketing</h1></div>
          <div className="mmd-controls">
            <div className="mmd-seg" role="group" aria-label="Platform">{PLATFORMS.map((p) => <button key={p.id} className={platform === p.id ? 'active' : ''} onClick={() => setPlatform(p.id)}>{p.label}</button>)}</div>
            <select className="mmd-select" value={String(days)} onChange={(e) => { setMonthKey(''); setDays(Number(e.target.value)) }} aria-label="Tempoh">{PERIODS.map((p) => <option key={p.days} value={p.days}>{p.label}</option>)}</select>
            <MonthSelect value={monthKey} onChange={(e) => setMonthKey(e.target.value)} months={monthsWithData} />
          </div>
        </div>
        <p className="settings-copy">{syncing ? 'Sedang membaca data Meta…' : 'Data post Meta belum dapat dibaca. Dashboard akan keluar selepas sync Meta berjaya. Sistem tidak memaparkan angka rekaan.'}</p>
      </section>
    )
  }

  return (
    <section className="mmd-shell" aria-label="Dashboard Meta">
      <div className="page-header mmd-head">
        <div>{SHOW_META_DASHBOARD_EYEBROW ? <span className="eyebrow">PRESTASI META · FACEBOOK &amp; INSTAGRAM</span> : null}<h1>Dashboard Marketing</h1>{syncing ? <small className="mmd-updating" role="status">Mengemas kini…</small> : null}{SHOW_META_SYNC_LINE ? <small>Sync terakhir: {lastSync} · {fmt(allPosts.length)} post</small> : null}</div>
        <div className="mmd-controls">
          <div className="mmd-seg" role="group" aria-label="Platform">{PLATFORMS.map((p) => <button key={p.id} className={platform === p.id ? 'active' : ''} onClick={() => setPlatform(p.id)}>{p.label}</button>)}</div>
          <select className="mmd-select" value={String(days)} onChange={(e) => { setMonthKey(''); setDays(Number(e.target.value)) }} aria-label="Tempoh">{PERIODS.map((p) => <option key={p.days} value={p.days}>{p.label}</option>)}</select>
          <MonthSelect value={monthKey} onChange={(e) => setMonthKey(e.target.value)} months={monthsWithData} />
          {SHOW_META_REFRESH && onRefresh ? <button className="mmd-refresh" onClick={onRefresh} disabled={syncing}>{syncing ? 'Menyelaras…' : 'Muat semula'}</button> : null}
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
          <div className="mmd-card-head"><div><span className="eyebrow">INTERAKSI</span><h4>Interaksi ikut hari</h4></div><span className="mmd-chip">Last 7 days</span></div>
          <LineChart labels={weekView.labels} lines={weekView.series('interactions')} />
          <Legend items={weekView.lineSets} />
        </article>

        <article className="panel mmd-card mmd-wide">
          <div className="mmd-card-head"><div><span className="eyebrow">TONTONAN</span><h4>Views ikut hari</h4></div><span className="mmd-chip">Last 7 days</span></div>
          <BarChart labels={weekView.labels} groups={weekView.series('views')} />
          <Legend items={weekView.lineSets} />
        </article>

        <article className="panel mmd-card">
          <div className="mmd-card-head"><div><span className="eyebrow mmd-eyebrow-plain">Platform Interactions</span></div></div>
          <Donut parts={[{ name: 'Facebook', color: FB, value: view.fb.interactions || 0 }, { name: 'Instagram', color: IG, value: view.ig.interactions || 0 }]} />
          <div className="mmd-mini-table">
            <div><span /><b>Post</b><b>Views</b><b>Reach</b></div>
            <div><span><i style={{ background: FB }} />Facebook</span><b>{fmt(view.fb.posts)}</b><b>{fmt(view.fb.views)}</b><b>{fmt(view.fb.reach)}</b></div>
            <div><span><i style={{ background: IG }} />Instagram</span><b>{fmt(view.ig.posts)}</b><b>{fmt(view.ig.views)}</b><b>{fmt(view.ig.reach)}</b></div>
          </div>
        </article>

        <article className="panel mmd-card">
          <div className="mmd-card-head"><div><span className="eyebrow mmd-eyebrow-plain">Pecahan Interaksi</span></div></div>
          <div className="mmd-hbars">{view.breakdown.map((b) => b.split ? (
            <div key={b.name} className="mmd-hbar-expand">
              <button type="button" className="mmd-hbar-toggle" aria-expanded={Boolean(openBreaks[b.id])} aria-controls={`mmd-${b.id}-split`} onClick={() => setOpenBreaks((cur) => ({ ...cur, [b.id]: !cur[b.id] }))}>
                <span>{b.name}</span>
                <i><b style={{ width: `${Math.round(((b.value || 0) / maxBreak) * 100)}%` }} /></i>
                <strong>{fmt(b.value)}</strong>
              </button>
              {openBreaks[b.id] ? (
                <div id={`mmd-${b.id}-split`} className="mmd-hbar-split">
                  {b.split.map((part) => (
                    <div key={part.name}>
                      <span>{part.name}</span>
                      <i>{part.available ? <b style={{ width: `${Math.round(((part.value || 0) / maxBreak) * 100)}%` }} /> : null}</i>
                      <strong>{part.available ? fmt(part.value) : 'tiada data'}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div key={b.name}><span>{b.name}</span><i><b style={{ width: `${Math.round(((b.value || 0) / maxBreak) * 100)}%` }} /></i><strong>{fmt(b.value)}</strong></div>
          ))}</div>
        </article>

        <article className="panel mmd-card">
          <div className="mmd-card-head"><div><span className="eyebrow mmd-eyebrow-plain">{"Type of Content's Interaction"}</span></div></div>
          <div className="mmd-hbars mmd-hbars-alt">{view.types.length ? view.types.map((t) => <div key={t.type}><span>{t.type} <small>({t.count})</small></span><i><b style={{ width: `${Math.round((t.avg / Math.max(1, ...view.types.map((x) => x.avg))) * 100)}%` }} /></i><strong>{fmt(t.avg)}</strong></div>) : <p className="mmd-note">Tiada post dalam tempoh ini.</p>}</div>
        </article>

        {SHOW_META_UNAVAILABLE_CARD ? (
        <article className="panel mmd-card mmd-pending">
          <div className="mmd-card-head"><div><span className="eyebrow">BELUM TERSEDIA</span><h4>Follows, Visits &amp; follower</h4></div></div>
          <ul>
            <li><strong>Follows / unfollow</strong><span>Belum diselaraskan dari Meta</span></li>
            <li><strong>Lawatan Page / profil (Visits)</strong><span>Belum diselaraskan dari Meta</span></li>
            <li><strong>Dari follower vs bukan follower</strong><span>Belum diselaraskan dari Meta</span></li>
          </ul>
          <p className="mmd-note">Angka ini tidak direka. Boleh ditambah kemudian dalam Apps Script (sync Meta) jika diluluskan.</p>
        </article>
        ) : null}

        <article className="panel mmd-card mmd-full">
          <div className="mmd-card-head">
            <div><span className="eyebrow">TOP POSTING BY MONTH</span><h4>Post terbaik · {topMonthLabel}</h4></div>
            <select className="mmd-select" value={sortKey} onChange={(e) => setSortKey(e.target.value)} aria-label="Susun ikut">
              <option value="interactions">Ikut interaksi</option><option value="views">Ikut views</option><option value="reach">Ikut reach</option><option value="time">Terbaru</option>
            </select>
          </div>
          {topPosts.length ? <div className="mmd-posts">
            <div className="mmd-post mmd-post-head"><span>Post</span><b>Views</b><b>Reach</b><b>Interaksi</b><span /></div>
            {topPosts.map((p) => (
              <div className="mmd-post" key={p.id}>
                <span className="mmd-post-main"><i className={`mmd-badge ${p.platform}`}>{p.platform === 'facebook' ? 'FB' : 'IG'}</i><span><strong>{postDate(p.time)} · {p.type}</strong>{p.caption ? <small>{p.caption}</small> : null}</span></span>
                <b data-label="Views">{fmt(p.views)}</b><b data-label="Reach">{fmt(p.reach)}</b><b data-label="Interaksi">{fmt(p.interactions)}</b>
                {p.permalink ? <a className="mmd-view-post" href={p.permalink} target="_blank" rel="noreferrer">View post</a> : <span />}
              </div>
            ))}
          </div> : <p className="mmd-note">Tiada post dalam tempoh ini.</p>}
        </article>
      </div>
    </section>
  )
}
