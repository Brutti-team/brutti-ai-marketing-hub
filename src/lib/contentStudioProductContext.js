import { products as embeddedProducts } from '../data'
import { googleConfigured, hasWorkspaceKey, loadWorkspace } from './googleWorkspace'

const embeddedByName = new Map(embeddedProducts.map((product) => [product.name, product]))
const workspaceByName = new Map()
let workspaceLoaded = false

function clean(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function sourceLabel(record = {}) {
  return clean(record.sourceStatus || record.source || '')
}

function hasVerifiedSource(record = {}) {
  return /verified/i.test(sourceLabel(record))
}

function isNameOnlySource(record = {}) {
  return /^verified name$/i.test(sourceLabel(record))
}

export function productFactsFromRecord(record = {}) {
  if (!record?.name || !hasVerifiedSource(record)) return []

  const facts = [`${clean(record.name)} ialah produk Brutti.`]
  if (isNameOnlySource(record)) return facts

  const fields = [
    ['category', 'Kategori yang direkodkan'],
    ['price', 'Harga yang direkodkan'],
    ['material', 'Material yang direkodkan'],
    ['dimensions', 'Dimensi yang direkodkan'],
    ['colour', 'Warna yang direkodkan'],
    ['status', 'Status produk dalam source'],
  ]

  fields.forEach(([key, label]) => {
    const value = clean(record[key])
    if (value) facts.push(`${label}: ${value}.`)
  })

  return facts
}

export function productContextBlock(record = {}) {
  return productFactsFromRecord(record).join('\n')
}

export function mergeProductContext(brief = '', previousBlock = '', nextBlock = '') {
  let base = String(brief || '')
  if (previousBlock) base = base.replace(previousBlock, '')
  base = base.replace(/\n{3,}/g, '\n\n').trim()

  const nextFacts = String(nextBlock || '').split('\n').map(clean).filter(Boolean)
  const existing = new Set(base.split('\n').map(clean).filter(Boolean).map((line) => line.toLowerCase()))
  const missing = nextFacts.filter((line) => !existing.has(line.toLowerCase()))

  if (!missing.length) return base
  return [base, missing.join('\n')].filter(Boolean).join('\n\n')
}

function cacheWorkspaceProducts(products = []) {
  products.forEach((product) => {
    if (product?.name) workspaceByName.set(product.name, product)
  })
}

export async function resolveVerifiedProduct(productName = '') {
  const name = clean(productName)
  if (!name || name === 'General / No Product') return null

  if (!workspaceLoaded && googleConfigured && typeof window !== 'undefined' && hasWorkspaceKey()) {
    workspaceLoaded = true
    try {
      const workspace = await loadWorkspace()
      cacheWorkspaceProducts(workspace?.products || [])
    } catch {
      // Keep Content Studio usable with the embedded verified-name fallback.
    }
  }

  const workspaceRecord = workspaceByName.get(name)
  if (workspaceRecord && hasVerifiedSource(workspaceRecord)) return workspaceRecord

  const embeddedRecord = embeddedByName.get(name)
  return embeddedRecord && hasVerifiedSource(embeddedRecord) ? embeddedRecord : null
}

export function productContextMeta(record = {}) {
  const facts = productFactsFromRecord(record)
  return {
    source: sourceLabel(record) || 'No verified source',
    factCount: facts.length,
    detailCount: Math.max(0, facts.length - 1),
    nameOnly: isNameOnlySource(record),
  }
}
