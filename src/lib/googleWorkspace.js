const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL
const workspaceKeyName = 'brutti-google-workspace-key'

export const googleConfigured = Boolean(appsScriptUrl)

export function hasWorkspaceKey() {
  return Boolean(window.sessionStorage.getItem(workspaceKeyName))
}

export function setWorkspaceKey(key) {
  const cleanKey = key.trim()
  if (!cleanKey) throw new Error('Enter the BRUTTI workspace key.')
  window.sessionStorage.setItem(workspaceKeyName, cleanKey)
}

export function clearWorkspaceKey() {
  window.sessionStorage.removeItem(workspaceKeyName)
}

function getWorkspaceKey() {
  return window.sessionStorage.getItem(workspaceKeyName) || ''
}

export async function callMarketingApi(action, payload = {}) {
  if (!googleConfigured) throw new Error('Google Apps Script is not configured yet.')
  const accessKey = getWorkspaceKey()
  if (!accessKey) throw new Error('Connect the internal Google workspace first.')

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
    throw new Error(result?.error || `Google Apps Script request failed (${response.status}).`)
  }
  return result.data
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
