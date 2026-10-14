import sampleCsv from '../data/kol-sabah-sample.csv?raw'

export const KOL_FIELDS = ['name', 'handle', 'niche', 'location', 'tiktok', 'instagram', 'facebook', 'youtube', 'followers', 'businessContact', 'source', 'notes']

export function parseCsv(text) {
  const rows = []
  let row = [], cell = '', quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1 }
      else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += ch
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim()))
}

export function kolFromValues(values) {
  const kol = {}
  KOL_FIELDS.forEach((field, index) => { kol[field] = String(values[index] ?? '').trim() })
  return kol
}

export function normalizeKol(record) {
  if (Array.isArray(record)) return kolFromValues(record)
  const kol = {}
  KOL_FIELDS.forEach((field) => { kol[field] = String(record?.[field] ?? '').trim() })
  return kol
}

export const sampleKolSabah = () => parseCsv(sampleCsv).slice(1).map(kolFromValues).filter((k) => k.name)

// Split the free-text niche into short filter tags ("Musician & vlogger; Sabah lifestyle" -> first segment).
export const primaryNiche = (niche) => (niche || '').split(/[;/(]/)[0].trim() || 'Unspecified'

export function filterKols(list, query, niche) {
  const q = query.trim().toLowerCase()
  return list.filter((kol) => (niche === 'All' || primaryNiche(kol.niche) === niche)
    && (!q || [kol.name, kol.handle, kol.niche, kol.location, kol.notes].join(' ').toLowerCase().includes(q)))
}

// Turn the Business Contact free text into wa.me / mailto links where possible.
export function contactLinks(text) {
  const value = text || ''
  const links = []
  ;(value.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || []).forEach((email) => links.push({ type: 'email', label: email, href: `mailto:${email}` }))
  const phoneSource = value.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, ' ')
  ;(phoneSource.match(/(?:\+?6?0)1[\d\s-]{7,11}\d/g) || []).forEach((raw) => {
    let digits = raw.replace(/\D/g, '')
    if (digits.startsWith('0')) digits = `6${digits}`
    if (digits.length >= 10 && digits.length <= 13) links.push({ type: 'whatsapp', label: raw.trim(), href: `https://wa.me/${digits}` })
  })
  return links
}

export const profileLinks = (kol) => [['TikTok', kol.tiktok], ['Instagram', kol.instagram], ['Facebook', kol.facebook], ['YouTube', kol.youtube]]
  .filter(([, url]) => /^https?:\/\//i.test(url || ''))
  .map(([label, url]) => ({ label, href: url }))
