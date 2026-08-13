import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

const json = (status: number, body: unknown, origin: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin,
      'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
      'access-control-allow-methods': 'POST, OPTIONS',
      'vary': 'origin',
    },
  })

const allowedOrigin = (request: Request) => {
  const origin = request.headers.get('origin') || ''
  const configured = Deno.env.get('ALLOWED_ORIGIN') || ''
  if (origin === configured || origin.startsWith('http://localhost:')) return origin
  return configured
}

const required = (name: string) => {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`${name} is not configured.`)
  return value
}

const responseText = (data: Record<string, unknown>) => {
  if (typeof data.output_text === 'string') return data.output_text
  const output = Array.isArray(data.output) ? data.output : []
  return output
    .flatMap((item: Record<string, unknown>) => Array.isArray(item.content) ? item.content : [])
    .map((item: Record<string, unknown>) => item.text)
    .filter((item): item is string => typeof item === 'string')
    .join('\n')
}

async function askOpenAI(instructions: string, input: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${required('OPENAI_API_KEY')}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: required('OPENAI_MODEL'),
      instructions,
      input,
    }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error?.message || 'OpenAI request failed.')
  return responseText(data)
}

async function generateContent(payload: Record<string, unknown>) {
  const instructions = `You are BRUTTI's internal marketing assistant for a Sabah-based custom furniture and interior brand.
Use only the verified facts supplied by the user. Never invent prices, promotions, availability, delivery dates, dimensions, materials, awards, customer claims, or performance KPI.
Write in the requested language and tone, include one clear CTA, and keep Facebook copy natural and useful.
Return only the final post copy. Human approval is always required before publishing.`
  const input = JSON.stringify({
    task: 'Generate Facebook marketing copy',
    title: payload.title,
    contentType: payload.type,
    product: payload.product,
    language: payload.language,
    tone: payload.tone,
    verifiedFacts: payload.brief,
    includeHashtags: Boolean(payload.includeHashtags),
  })
  const copy = await askOpenAI(instructions, input)
  return { copy, reviewStatus: 'Human Review Required' }
}

async function reviewContent(payload: Record<string, unknown>) {
  const instructions = `Review BRUTTI marketing copy. Identify unsupported claims, unsafe promises, missing source facts, language issues, brand-tone issues, and CTA quality.
Do not approve prices, promotions, availability, delivery dates, dimensions, materials, awards, customer claims, or KPI without explicit verified evidence.
Return concise JSON only with keys: decision ("pass" or "revise"), summary, issues (array of strings), suggested_copy.`
  const text = await askOpenAI(instructions, JSON.stringify(payload))
  try {
    return JSON.parse(text.replace(/^\`\`\`json\s*|\s*\`\`\`$/g, ''))
  } catch {
    return { decision: 'revise', summary: text, issues: ['AI response needs human review.'], suggested_copy: payload.copy }
  }
}

async function notionSync(
  supabase: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
) {
  const databaseId = required('NOTION_DATABASE_ID')
  const titleProperty = Deno.env.get('NOTION_TITLE_PROPERTY') || 'Name'
  const contentProperty = Deno.env.get('NOTION_CONTENT_PROPERTY')
  const contentId = String(payload.contentId || '')
  const { data: item, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', contentId)
    .single()
  if (error) throw error

  const properties: Record<string, unknown> = {
    [titleProperty]: {
      title: [{ text: { content: item.title } }],
    },
  }
  if (contentProperty) {
    properties[contentProperty] = {
      rich_text: [{ text: { content: String(item.copy || '').slice(0, 1900) } }],
    }
  }

  const updating = Boolean(item.notion_page_id)
  const response = await fetch(updating
    ? `https://api.notion.com/v1/pages/${item.notion_page_id}`
    : 'https://api.notion.com/v1/pages', {
    method: updating ? 'PATCH' : 'POST',
    headers: {
      authorization: `Bearer ${required('NOTION_API_TOKEN')}`,
      'content-type': 'application/json',
      'notion-version': '2022-06-28',
    },
    body: JSON.stringify({
      ...(!updating ? { parent: { database_id: databaseId } } : {}),
      properties,
      ...(!updating ? { children: [{
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: String(item.copy || '').slice(0, 1900) } }],
        },
      }] } : {}),
    }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.message || 'Notion sync failed.')
  if (!updating) {
    await supabase.from('content_items').update({ notion_page_id: data.id }).eq('id', contentId)
  }
  return { pageId: data.id, url: data.url }
}

async function googleAccessToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: required('GOOGLE_CLIENT_ID'),
      client_secret: required('GOOGLE_CLIENT_SECRET'),
      refresh_token: required('GOOGLE_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error_description || 'Google token refresh failed.')
  return data.access_token as string
}

async function listDriveAssets() {
  const folderId = required('GOOGLE_DRIVE_FOLDER_ID')
  const token = await googleAccessToken()
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id,name,mimeType,modifiedTime,thumbnailLink,webViewLink)',
    pageSize: '100',
  })
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
    headers: { authorization: `Bearer ${token}` },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error?.message || 'Google Drive sync failed.')
  return { files: data.files || [] }
}

async function publishMeta(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  payload: Record<string, unknown>,
) {
  const contentId = String(payload.contentId || '')
  const { data: item, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', contentId)
    .single()
  if (error) throw error
  if (!item.approved_at || item.stage !== 'Approved') {
    throw new Error('Human approval is required before Facebook publishing.')
  }

  const version = required('META_GRAPH_VERSION')
  const pageId = required('META_PAGE_ID')
  const response = await fetch(`https://graph.facebook.com/${version}/${pageId}/feed`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      message: item.copy,
      access_token: required('META_PAGE_ACCESS_TOKEN'),
    }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error?.message || 'Meta publishing failed.')

  await supabase.from('content_items').update({
    stage: 'Published',
    published_at: new Date().toISOString(),
    meta_post_id: data.id,
  }).eq('id', contentId)
  await supabase.from('integration_runs').insert({
    integration: 'meta',
    action: 'publish',
    status: 'success',
    details: { contentId, postId: data.id },
    created_by: userId,
  })
  return { postId: data.id }
}

Deno.serve(async (request) => {
  const origin = allowedOrigin(request)
  if (request.method === 'OPTIONS') return json(200, { ok: true }, origin)
  if (request.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed.' }, origin)

  try {
    const auth = request.headers.get('authorization')
    if (!auth) throw new Error('Authentication required.')
    const supabase = createClient(
      required('SUPABASE_URL'),
      required('SUPABASE_ANON_KEY'),
      { global: { headers: { authorization: auth } } },
    )
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) throw new Error('Invalid session.')
    const { data: isStaff, error: staffError } = await supabase.rpc('is_brutti_staff')
    if (staffError || !isStaff) throw new Error('This account is not on the BRUTTI staff allowlist.')

    const { action, payload = {} } = await request.json()
    let data: unknown
    switch (action) {
      case 'integration_status':
        data = {
          openai: Boolean(Deno.env.get('OPENAI_API_KEY') && Deno.env.get('OPENAI_MODEL')),
          notion: Boolean(Deno.env.get('NOTION_API_TOKEN') && Deno.env.get('NOTION_DATABASE_ID')),
          drive: Boolean(Deno.env.get('GOOGLE_REFRESH_TOKEN') && Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')),
          meta: Boolean(Deno.env.get('META_PAGE_ACCESS_TOKEN') && Deno.env.get('META_PAGE_ID')),
        }
        break
      case 'generate_content':
        data = await generateContent(payload)
        break
      case 'review_content':
        data = await reviewContent(payload)
        break
      case 'sync_notion':
        data = await notionSync(supabase, payload)
        break
      case 'list_drive_assets':
        data = await listDriveAssets()
        break
      case 'publish_meta':
        data = await publishMeta(supabase, authData.user.id, payload)
        break
      default:
        throw new Error('Unknown marketing action.')
    }
    return json(200, { ok: true, data }, origin)
  } catch (error) {
    return json(400, { ok: false, error: error instanceof Error ? error.message : 'Unknown error.' }, origin)
  }
})
