import { useEffect } from 'react'
import {
  callMarketingApi,
  deleteGoogleContent,
  deleteGooglePlan,
  hasWorkspaceKey,
  loadWorkspace,
  saveGoogleContent,
  saveGooglePlan,
  syncNotionProducts,
} from './lib/googleWorkspace'

function localDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function activeSettingsPage() {
  return [...document.querySelectorAll('#root .page')]
    .find((page) => page.offsetParent !== null && page.querySelector('h1')?.textContent?.trim() === 'Settings') || null
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function runPlannerTest(report) {
  const stamp = Date.now()
  let id = ''
  const base = {
    title: `SYSTEM TEST — Planner E2E ${stamp}`,
    name: `SYSTEM TEST — Planner E2E ${stamp}`,
    date: localDateKey(),
    channel: 'Facebook',
    type: 'Facebook Post',
    product: 'General / No Product',
    objective: 'Temporary integration self-test',
    promotion: '',
    language: 'Bahasa Melayu',
    generatedContent: 'Temporary system test. Safe to delete automatically.',
    approvalNotes: 'Automated BRUTTI workspace readiness test.',
  }

  const steps = [
    ['Draft', 'Add'],
    ['Review', 'Edit'],
    ['Approved', 'Approve'],
    ['Rejected', 'Reject'],
    ['Approved', 'Approve'],
    ['Scheduled', 'Save'],
  ]

  try {
    for (const [status, websiteAction] of steps) {
      const saved = await saveGooglePlan({ ...base, id: id || undefined, status, websiteAction })
      id = saved.id
      assert(saved.websiteSyncStatus === 'Synced', `Planner ${status}: Notion sync did not return Synced.`)
      assert(!saved.syncError, `Planner ${status}: ${saved.syncError}`)
      assert(saved.notionPageId, `Planner ${status}: Notion Page ID is missing.`)

      const workspace = await loadWorkspace()
      const record = (workspace.plans || []).find((item) => item.id === id)
      assert(record, `Planner ${status}: saved Google Sheet record could not be reloaded.`)
      assert(record.status === status, `Planner ${status}: reloaded status is ${record.status || 'missing'}.`)
      assert(record.websiteSyncStatus === 'Synced', `Planner ${status}: reloaded Notion sync status is not Synced.`)
      report(`Planner ${status} ✓`)
    }

    await deleteGooglePlan(id)
    const afterDelete = await loadWorkspace()
    assert(!(afterDelete.plans || []).some((item) => item.id === id), 'Planner delete: temporary Google Sheet record still exists.')
    id = ''
    report('Planner delete + Notion archive request ✓')
  } finally {
    if (id) {
      try { await deleteGooglePlan(id) } catch { /* best-effort cleanup */ }
    }
  }
}

async function runContentWorkflowTest(report) {
  const stamp = Date.now()
  let id = ''
  const base = {
    title: `SYSTEM TEST — Content Workflow ${stamp}`,
    platform: 'Facebook',
    type: 'Facebook Post',
    product: 'General / No Product',
    language: 'Bahasa Melayu',
    tone: 'Brutti Sabahan Casual',
    aiReview: 'Human Review Required',
    copy: 'Temporary system test content. This record is deleted automatically after validation.',
  }

  const stages = ['Draft', 'AI Generated', 'Review', 'Approved', 'Rejected', 'Approved', 'Scheduled']

  try {
    for (const stage of stages) {
      const saved = await saveGoogleContent({ ...base, id: id || undefined, stage })
      id = saved.id
      const workspace = await loadWorkspace()
      const record = (workspace.content || []).find((item) => item.id === id)
      assert(record, `Content ${stage}: saved record could not be reloaded.`)
      assert(record.stage === stage, `Content ${stage}: reloaded stage is ${record.stage || 'missing'}.`)
      report(`Content ${stage} ✓`)
    }

    await deleteGoogleContent(id)
    const afterDelete = await loadWorkspace()
    assert(!(afterDelete.content || []).some((item) => item.id === id), 'Content delete: temporary record still exists.')
    id = ''
    report('Content delete ✓')
  } finally {
    if (id) {
      try { await deleteGoogleContent(id) } catch { /* best-effort cleanup */ }
    }
  }
}

async function runProductsTest(report) {
  const result = await syncNotionProducts()
  const count = Number(result?.count || 0)
  assert(count > 0, 'Product sync returned zero products.')
  const workspace = await loadWorkspace()
  const loaded = (workspace.products || []).length
  assert(loaded === count, `Product sync count mismatch: synced ${count}, loaded ${loaded}.`)
  report(`Notion Product Library sync ✓ — ${loaded} products loaded`)
  return loaded
}

async function runDriveTest(report) {
  const result = await callMarketingApi('list_drive_assets')
  const files = result?.files || []
  assert(files.length > 0, 'Drive Asset Library returned zero image files.')
  assert(files.every((file) => file.id && file.name), 'Drive Asset Library returned an incomplete file record.')
  report(`Google Drive assets ✓ — ${files.length} images available`)
  return files.length
}

function createPanel(page) {
  if (page.querySelector('.workspace-readiness-panel')) return page.querySelector('.workspace-readiness-panel')

  const panel = document.createElement('section')
  panel.className = 'panel workspace-readiness-panel'
  panel.style.marginTop = '24px'
  panel.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="eyebrow">SYSTEM CHECK</span>
        <h3>Workspace readiness test</h3>
        <p style="margin-top:8px">Tests Planner, Notion sync, Product Library, Drive assets and the review-first content workflow. Temporary test records are deleted automatically.</p>
      </div>
      <button type="button" class="button primary workspace-readiness-run">Run readiness test</button>
    </div>
    <div class="workspace-readiness-result" style="margin-top:16px;white-space:pre-wrap;line-height:1.6">Ready to test. Meta / Facebook publishing is intentionally excluded.</div>
  `

  page.appendChild(panel)
  return panel
}

export default function WorkspaceReadinessEnhancer() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const page = activeSettingsPage()
      if (!page) return
      const panel = createPanel(page)
      const button = panel.querySelector('.workspace-readiness-run')
      const result = panel.querySelector('.workspace-readiness-result')
      if (!button || button.dataset.bound === '1') return
      button.dataset.bound = '1'

      button.addEventListener('click', async () => {
        if (!hasWorkspaceKey()) {
          result.textContent = 'Connect the internal Google workspace first.'
          return
        }

        button.disabled = true
        result.textContent = 'Running readiness test…\n'
        const lines = []
        const report = (line) => {
          lines.push(line)
          result.textContent = `${lines.join('\n')}\n`
        }

        try {
          await runPlannerTest(report)
          await runProductsTest(report)
          await runDriveTest(report)
          await runContentWorkflowTest(report)
          report('PASS ✓ Core workspace is ready. Meta / Facebook remains intentionally skipped.')
        } catch (error) {
          report(`FAIL ✕ ${error.message || 'Unexpected readiness-test error.'}`)
        } finally {
          button.disabled = false
        }
      })
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
