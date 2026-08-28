const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL
const workspaceKeyName = 'brutti-google-workspace-key'

let verifiedWorkspaceKey = ''
let verificationPromise = null

export const googleConfigured = Boolean(appsScriptUrl)

export function hasWorkspaceKey() {
  return Boolean(window.sessionStorage.getItem(workspaceKeyName))
}

export function setWorkspaceKey(key) {
  const cleanKey = key.trim()
  if (!cleanKey) throw new Error('Enter the BRUTTI workspace key.')
  window.sessionStorage.setItem(workspaceKeyName, cleanKey)
  verifiedWorkspaceKey = ''
  verificationPromise = null
}

export function clearWorkspaceKey() {
  window.sessionStorage.removeItem(workspaceKeyName)
  verifiedWorkspaceKey = ''
  verificationPromise = null
}

function getWorkspaceKey() {
  return window.sessionStorage.getItem(workspaceKeyName) || ''
}

function isWorkspaceAuthError(message = '') {
  const value = String(message).toLowerCase()
  return value.includes('workspace key') || value.includes('workspace_key')
}

async function requestMarketingApi(action, payload, accessKey) {
  let response
  try {
    response = await fetch(appsScriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload, accessKey }),
    })
  } catch {
    throw new Error('Could not reach Google Apps Script. Check the deployment URL and web app access settings.')
  }

  const raw = await response.text()
  let result
  try {
    result = JSON.parse(raw)
  } catch {
    throw new Error('Google Apps Script returned an invalid response. Redeploy the latest Apps Script version.')
  }

  if (!response.ok || !result?.ok) {
    const message = result?.error || `Google Apps Script request failed (${response.status}).`
    if (isWorkspaceAuthError(message)) clearWorkspaceKey()
    throw new Error(message)
  }
  return result.data
}

async function verifyWorkspaceKey(accessKey) {
  if (verifiedWorkspaceKey === accessKey) return null
  if (!verificationPromise) {
    verificationPromise = requestMarketingApi('integration_status', {}, accessKey)
      .then((data) => {
        verifiedWorkspaceKey = accessKey
        return data
      })
      .finally(() => {
        verificationPromise = null
      })
  }
  return verificationPromise
}

export async function callMarketingApi(action, payload = {}) {
  if (!googleConfigured) throw new Error('Google Apps Script is not configured yet.')
  const accessKey = getWorkspaceKey()
  if (!accessKey) throw new Error('Connect the internal Google workspace first.')

  if (action === 'integration_status') return verifyWorkspaceKey(accessKey)

  await verifyWorkspaceKey(accessKey)
  return requestMarketingApi(action, payload, accessKey)
}

export async function loadWorkspace() {
  return callMarketingApi('load_workspace')
}

export async function saveGoogleContent(item) {
  return callMarketingApi('save_content', { item })
}

export async function deleteGoogleContent(id) {
  return callMarketingApi('delete_content', { id: String(id) })
}

export async function saveGooglePlan(plan) {
  return callMarketingApi('save_plan', { plan })
}

export async function deleteGooglePlan(id) {
  return callMarketingApi('delete_plan', { id: String(id) })
}

export async function syncNotionProducts() {
  return callMarketingApi('sync_notion_products')
}
