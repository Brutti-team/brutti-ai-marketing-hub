import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const cloudConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = cloudConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

const contentFromRow = (row) => ({
  id: row.id,
  title: row.title,
  platform: row.platform,
  type: row.content_type,
  product: row.product,
  language: row.language,
  tone: row.tone,
  aiReview: row.ai_review_status,
  stage: row.stage,
  updatedAt: new Date(row.updated_at).toLocaleString('en-MY'),
  copy: row.copy,
})

const contentToRow = (item) => ({
  id: String(item.id),
  title: item.title,
  platform: item.platform,
  content_type: item.type,
  product: item.product,
  language: item.language,
  tone: item.tone,
  ai_review_status: item.aiReview,
  stage: item.stage,
  copy: item.copy,
  approved_at: item.stage === 'Approved' || item.stage === 'Scheduled' || item.stage === 'Published'
    ? new Date().toISOString()
    : null,
})

const planFromRow = (row) => ({
  id: row.id,
  title: row.title,
  date: row.plan_date,
  channel: row.channel,
  type: row.content_type,
  status: row.status,
  product: row.product,
})

const planToRow = (plan) => ({
  id: String(plan.id),
  title: plan.title,
  plan_date: plan.date,
  channel: plan.channel,
  content_type: plan.type,
  status: plan.status,
  product: plan.product,
})

export async function getSession() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export function watchSession(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export async function sendMagicLink(email) {
  if (!supabase) throw new Error('Cloud backend is not configured.')
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  })
  if (error) throw error
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function loadWorkspace() {
  if (!supabase) return { content: [], plans: [] }
  const [contentResult, plansResult] = await Promise.all([
    supabase.from('content_items').select('*').order('updated_at', { ascending: false }),
    supabase.from('content_plans').select('*').order('plan_date', { ascending: true }),
  ])
  if (contentResult.error) throw contentResult.error
  if (plansResult.error) throw plansResult.error
  return {
    content: contentResult.data.map(contentFromRow),
    plans: plansResult.data.map(planFromRow),
  }
}

export async function saveCloudContent(item) {
  const { data, error } = await supabase
    .from('content_items')
    .upsert(contentToRow(item))
    .select()
    .single()
  if (error) throw error
  return contentFromRow(data)
}

export async function deleteCloudContent(id) {
  const { error } = await supabase.from('content_items').delete().eq('id', String(id))
  if (error) throw error
}

export async function saveCloudPlan(plan) {
  const { data, error } = await supabase
    .from('content_plans')
    .upsert(planToRow(plan))
    .select()
    .single()
  if (error) throw error
  return planFromRow(data)
}

export async function deleteCloudPlan(id) {
  const { error } = await supabase.from('content_plans').delete().eq('id', String(id))
  if (error) throw error
}

export async function callMarketingApi(action, payload = {}) {
  if (!supabase) throw new Error('Cloud backend is not configured.')
  const { data, error } = await supabase.functions.invoke('marketing-api', {
    body: { action, payload },
  })
  if (error) throw error
  if (!data?.ok) throw new Error(data?.error || 'Marketing API request failed.')
  return data.data
}
