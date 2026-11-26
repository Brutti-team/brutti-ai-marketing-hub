const KUING = 'Asia/Kuching'

export function isHttpUrl(value = '') {
  return /^https?:\/\//i.test(String(value).trim())
}

export function kuchingDateStamp(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KUING,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function kuchingTimestamp(date = new Date()) {
  const local = new Intl.DateTimeFormat('sv-SE', {
    timeZone: KUING,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date)
  return `${local.replace(' ', 'T')}+08:00`
}

function originalFor(item, catalogById, catalogByName) {
  if (!item) return null
  const byId = item.id != null && item.id !== '' ? catalogById.get(String(item.id)) : null
  if (byId) return byId
  const key = String(item.name || '').toLowerCase().replace(/[\s\u00a0]+/g, ' ').trim()
  return key ? catalogByName.get(key) || null : null
}

export function buildProductEditsPayload({ edits = [], deletedIds = [], catalog = [], now = new Date() } = {}) {
  const catalogById = new Map((catalog || []).filter((row) => row && row.id != null && row.id !== '').map((row) => [String(row.id), row]))
  const catalogByName = new Map((catalog || []).filter((row) => row && row.name).map((row) => [String(row.name).toLowerCase().replace(/[\s\u00a0]+/g, ' ').trim(), row]))

  const rows = (Array.isArray(edits) ? edits : []).map((item) => {
    const original = originalFor(item, catalogById, catalogByName)
    const row = {
      id: item?.id || '',
      originalName: original?.name || '',
      newName: item?.name || '',
      category: item?.category || '',
      material: item?.material || '',
      dimensions: item?.dimensions || '',
      notes: item?.notes || '',
    }
    const imageUrl = String(item?.imageUrl || '').trim()
    if (isHttpUrl(imageUrl)) row.imageUrl = imageUrl
    return row
  })

  const deleted = (Array.isArray(deletedIds) ? deletedIds : []).map((id) => String(id)).filter(Boolean)

  return {
    exportedAt: kuchingTimestamp(now),
    timeZone: KUING,
    source: 'brutti-product-references-v1',
    deletedIds: deleted,
    edits: rows,
  }
}

export function productEditsFileName(date = new Date()) {
  return `brutti-product-edits-${kuchingDateStamp(date)}.json`
}

export function downloadLocalProductEdits({ edits = [], deletedIds = [], catalog = [], now = new Date() } = {}) {
  const payload = buildProductEditsPayload({ edits, deletedIds, catalog, now })
  if (!payload.edits.length && !payload.deletedIds.length) {
    return { ok: false, payload, message: 'No local edits to export' }
  }
  const name = productEditsFileName(now)
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  return { ok: true, payload, fileName: name, message: 'Edits exported' }
}
