import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { promptLibrary } from './data'

const hiddenNavigation = new Set(['Brand Library', 'AI Tools'])

const brandRules = [
  ['Voice', 'Sabahan santai, natural dan human. Jangan paksa slang atau ulang perkataan terlalu banyak.'],
  ['Structure', 'Satu main message, opening hook yang jelas dan satu CTA yang relevant.'],
  ['Hashtags', 'Gunakan 3–5 hashtag yang betul-betul relevant; maximum 5.'],
  ['Facts', 'Gunakan verified facts sahaja. Jangan invent harga, promotion, delivery detail atau KPI.'],
]

const systemRules = [
  ['Free AI Assist Mode', 'Ready', 'Rule-based content assist. No paid AI API required.'],
  ['Brand governance', 'Active', 'Content Studio follows BRUTTI voice, fact and CTA guardrails.'],
  ['Human approval', 'Required', 'Final approval remains with the marketing team before publishing.'],
  ['Current channel', 'Facebook only', 'Other platforms stay hidden until their data and connections are ready.'],
]

function setReactValue(element, value) {
  if (!element) return
  const prototype = Object.getPrototypeOf(element)
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  if (setter) setter.call(element, value)
  else element.value = value
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function BrandRulesPanel() {
  return (
    <section className="panel core7-brand-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">BRAND RULES</span>
          <h3>BRUTTI content guardrails</h3>
        </div>
        <span className="core7-inline-status">Built into Content Studio</span>
      </div>
      <div className="core7-brand-grid">
        {brandRules.map(([title, copy]) => (
          <article key={title}>
            <strong>{title}</strong>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function PromptStarterPanel({ pageNode }) {
  const groups = useMemo(() => promptLibrary
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !/instagram|tiktok|threads/i.test(item.title)),
    }))
    .filter((group) => group.items.length), [])

  const applyPrompt = (item) => {
    const freeAssistButton = [...pageNode.querySelectorAll('.tab-bar button')]
      .find((button) => /free assist/i.test(button.textContent || ''))
    freeAssistButton?.click()

    window.setTimeout(() => {
      const activePage = [...document.querySelectorAll('#root .page')]
        .find((page) => page.offsetParent !== null) || pageNode
      const titleInput = activePage.querySelector('input[placeholder*="KAANAGAN product highlight"]')
      const briefInput = activePage.querySelector('textarea[placeholder*="rough sentence"]')
      setReactValue(titleInput, item.title)
      setReactValue(briefInput, item.description)
      titleInput?.focus()
      activePage.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  return (
    <section className="panel core7-prompt-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">MARKETING ASSIST LIBRARY</span>
          <h3>Prompt starters inside Content Studio</h3>
        </div>
        <span className="core7-inline-status">Facebook workflow</span>
      </div>
      <p className="core7-section-copy">Pilih starter yang sesuai. Ia akan dimasukkan terus ke Content Studio sebagai direction untuk kamu semak dan refine.</p>
      <div className="core7-prompt-groups">
        {groups.map((group) => (
          <section key={group.category}>
            <div className="core7-prompt-group-head">
              <strong>{group.category}</strong>
              <span>{group.items.length} tools</span>
            </div>
            <div className="core7-prompt-grid">
              {group.items.map((item) => (
                <article key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <button className="button secondary small" type="button" onClick={() => applyPrompt(item)}>Load into Content Studio</button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function ContentStudioExtras({ pageNode }) {
  return (
    <div className="core7-studio-extras">
      <BrandRulesPanel />
      <PromptStarterPanel pageNode={pageNode} />
    </div>
  )
}

function SystemModePanel() {
  return (
    <section className="panel core7-system-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">SYSTEM MODE</span>
          <h3>Marketing operating rules</h3>
        </div>
        <span className="core7-inline-status">Operational</span>
      </div>
      <div className="core7-system-list">
        {systemRules.map(([name, status, detail]) => (
          <article key={name}>
            <div>
              <strong>{name}</strong>
              <p>{detail}</p>
            </div>
            <span>{status}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function DriveRequiredPanel() {
  return (
    <section className="panel core7-drive-required">
      <div className="core7-drive-icon">G</div>
      <div>
        <span className="eyebrow">GOOGLE DRIVE REQUIRED</span>
        <h3>Connect Drive to use approved visual assets.</h3>
        <p>Asset cards are hidden while Drive is disconnected so reference names are not mistaken for usable files. Connect Google Drive from Settings to load real BRUTTI assets.</p>
      </div>
    </section>
  )
}

export default function Core7MarketingTools() {
  const [pageTitle, setPageTitle] = useState('')
  const [pageNode, setPageNode] = useState(null)
  const [driveConnected, setDriveConnected] = useState(false)

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return undefined

    const sync = () => {
      const pages = [...root.querySelectorAll('.page')]
      const activePage = pages.find((page) => page.offsetParent !== null) || pages[0] || null
      const title = activePage?.classList.contains('dashboard-page')
        ? 'Dashboard'
        : activePage?.querySelector('h1')?.textContent?.trim() || ''

      setPageNode((current) => current === activePage ? current : activePage)
      setPageTitle((current) => current === title ? current : title)

      root.querySelectorAll('.nav-link').forEach((button) => {
        const label = button.querySelector('span')?.textContent?.trim() || ''
        button.hidden = hiddenNavigation.has(label)
      })

      root.querySelectorAll('.phase2-audit-panel, .phase3-ranking-panel').forEach((panel) => {
        panel.hidden = title !== 'Analytics'
      })

      root.querySelectorAll('.panel-heading .eyebrow').forEach((label) => {
        if (label.textContent?.trim() === 'SMART CAMPAIGN IDEAS') label.textContent = 'CAMPAIGN IDEAS'
      })

      if (title === 'Content Studio' && activePage) {
        const platformLabel = [...activePage.querySelectorAll('label')]
          .find((label) => /^Platform/i.test(label.textContent || ''))
        const platformSelect = platformLabel?.querySelector('select')
        platformSelect?.querySelectorAll('option').forEach((option) => {
          option.hidden = option.textContent?.trim() !== 'Facebook'
        })
      }

      if (title === 'Asset Library' && activePage) {
        const addAsset = [...activePage.querySelectorAll('button')]
          .find((button) => /add asset/i.test(button.textContent || ''))
        if (addAsset) addAsset.hidden = true

        const connected = [...activePage.querySelectorAll('.status-chip')]
          .some((chip) => /drive connected/i.test(chip.textContent || ''))
        setDriveConnected((current) => current === connected ? current : connected)

        const summary = activePage.querySelector('.asset-summary')
        const assetPanel = activePage.querySelector('.asset-panel')
        if (summary) summary.hidden = !connected
        if (assetPanel) assetPanel.hidden = !connected
      } else {
        setDriveConnected(false)
      }

      if (title === 'Settings' && activePage) {
        activePage.querySelectorAll('.connections-list article').forEach((row) => {
          const name = row.querySelector('strong')?.textContent?.trim() || ''
          row.hidden = name === 'Free AI Assist Mode'
          row.querySelectorAll('button').forEach((button) => { button.hidden = true })
        })

        const refreshButton = [...activePage.querySelectorAll('button')]
          .find((button) => /^Refresh status$/i.test(button.textContent?.trim() || ''))
        if (refreshButton) refreshButton.textContent = 'Refresh integration status'
      }
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  if (!pageNode) return null

  if (pageTitle === 'Content Studio') return createPortal(<ContentStudioExtras pageNode={pageNode} />, pageNode)
  if (pageTitle === 'Settings') return createPortal(<SystemModePanel />, pageNode)
  if (pageTitle === 'Asset Library' && !driveConnected) return createPortal(<DriveRequiredPanel />, pageNode)
  return null
}
