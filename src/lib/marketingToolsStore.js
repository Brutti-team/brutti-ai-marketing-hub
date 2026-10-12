// Marketing Tools campaign storage.
// Local-only for now (browser localStorage). Swap this module for a
// Google Sheet / Apps Script backend later; keep the same function signatures.
export const MARKETING_TOOLS = ['Bunting', 'Billboard', 'KOL']
export const MARKETING_TOOL_STATUSES = ['Idea', 'In Progress', 'Live', 'Done']
export const MARKETING_TOOLS_STORAGE_KEY = 'brutti-marketing-tools-v1'

export const blankMarketingCampaign = () => ({ id: '', name: '', tool: 'Bunting', brand: 'Brutti', location: '', startDate: '', endDate: '', cost: '', status: 'Idea', notes: '' })

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

export function saveMarketingCampaign(list, record) {
  const clean = { ...blankMarketingCampaign(), ...record, cost: Number(record.cost) || 0, brand: String(record.brand || '').trim() || 'Brutti' }
  if (!MARKETING_TOOLS.includes(clean.tool)) throw new Error('Unsupported tool')
  if (clean.id) return persist(list.map((item) => (item.id === clean.id ? clean : item)))
  return persist([...list, { ...clean, id: `mt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }])
}

export function deleteMarketingCampaign(list, id) {
  return persist(list.filter((item) => item.id !== id))
}

export const filterMarketingCampaigns = (list, tool) => (tool === 'All' ? list : list.filter((item) => item.tool === tool))
export const totalMarketingCost = (list) => list.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
