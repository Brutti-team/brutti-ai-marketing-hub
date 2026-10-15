// Marketing Tools campaign storage.
// Uses the "Marketing Tools" Google Sheet (via Apps Script) when the Google
// workspace is connected; falls back to browser localStorage otherwise.
// The API client is loaded lazily so this module stays importable in Node checks.
const api = () => import('./googleWorkspace.js')

export const MARKETING_TOOLS = ['Bunting', 'Billboard', 'KOL']
export const MARKETING_TOOL_STATUSES = ['Idea', 'In Progress', 'Live', 'Done']
export const MARKETING_TOOLS_STORAGE_KEY = 'brutti-marketing-tools-v1'

export const blankMarketingCampaign = () => ({ id: '', name: '', tool: 'Bunting', brand: 'Brutti', location: '', startDate: '', endDate: '', cost: '', costNote: '', status: 'Idea', notes: '', tiktok: '', instagram: '', facebook: '', youtube: '', phone: '' })

export const KOL_CONTACT_FIELDS = [['tiktok', 'TikTok'], ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['youtube', 'YouTube']]

const storage = () => (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null)

export function loadMarketingCampaigns() {
  try {
    const parsed = JSON.parse(storage()?.getItem(MARKETING_TOOLS_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((item) => MARKETING_TOOLS.includes(item?.tool)) : []
  } catch {
    return []
  }
}

function persist(list) {
  storage()?.setItem(MARKETING_TOOLS_STORAGE_KEY, JSON.stringify(list))
  return list
}

const cleanCampaign = (record) => {
  const clean = { ...blankMarketingCampaign(), ...record, cost: Number(record.cost) || 0, costNote: String(record.costNote || '').trim(), brand: String(record.brand || '').trim() || 'Brutti' }
  for (const field of ['tiktok', 'instagram', 'facebook', 'youtube', 'phone']) clean[field] = String(record[field] || '').trim()
  if (!clean.status) clean.status = 'Idea'
  if (!MARKETING_TOOLS.includes(clean.tool)) throw new Error('Unsupported tool')
  if (!MARKETING_TOOL_STATUSES.includes(clean.status)) throw new Error('Unsupported status')
  return clean
}

export function saveMarketingCampaign(list, record) {
  const clean = cleanCampaign(record)
  if (clean.id) return persist(list.map((item) => (item.id === clean.id ? clean : item)))
  return persist([...list, { ...clean, id: `mt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }])
}

export function deleteMarketingCampaign(list, id) {
  return persist(list.filter((item) => item.id !== id))
}

export function clearLocalMarketingCampaigns() {
  storage()?.removeItem(MARKETING_TOOLS_STORAGE_KEY)
}

// --- Google Sheet backend (used when the workspace is connected) ---
export async function loadRemoteMarketingCampaigns() {
  const list = await (await api()).listGoogleMarketingTools()
  return Array.isArray(list) ? list.filter((item) => MARKETING_TOOLS.includes(item?.tool)) : []
}

export async function saveRemoteMarketingCampaign(list, record) {
  const clean = cleanCampaign(record)
  if (clean.id) {
    const saved = await (await api()).updateGoogleMarketingTool(clean)
    return list.map((item) => (item.id === saved.id ? saved : item))
  }
  const saved = await (await api()).createGoogleMarketingTool(clean)
  return [...list, saved]
}

export async function deleteRemoteMarketingCampaign(list, id) {
  await (await api()).deleteGoogleMarketingTool(id)
  return list.filter((item) => item.id !== id)
}

// One-time move of local records into the Sheet. Keeps local IDs so a retry
// skips anything already moved. Returns the refreshed remote list.
export async function moveLocalCampaignsToSheet() {
  const local = loadMarketingCampaigns()
  const remoteIds = new Set((await loadRemoteMarketingCampaigns()).map((item) => item.id))
  for (const item of local) {
    if (!remoteIds.has(item.id)) await (await api()).createGoogleMarketingTool(cleanCampaign(item))
  }
  clearLocalMarketingCampaigns()
  return loadRemoteMarketingCampaigns()
}

export const filterMarketingCampaigns = (list, tool) => (tool === 'All' ? list : list.filter((item) => item.tool === tool))
export const totalMarketingCost = (list) => list.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
