import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const hiddenNavigation = new Set(['Brand Library', 'AI Tools'])
const hiddenSettingsRows = new Set(['Free AI Assist Mode', 'Meta / Facebook'])

function DriveRequiredPanel() {
  return (
    <section className="panel core7-drive-required">
      <div className="core7-drive-icon">G</div>
      <div>
        <span className="eyebrow">GOOGLE DRIVE REQUIRED</span>
        <h3>Connect Drive to use approved visual assets.</h3>
        <p>Asset cards stay hidden while Drive is disconnected so reference names are not mistaken for usable files. Connect Google Drive from Settings to load real BRUTTI assets.</p>
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

      // Keep Free Assist clean: remove legacy/duplicate starter panels if an older cached
      // version injected them before this enhancer runs.
      root.querySelectorAll('.core7-prompt-panel, .core7-studio-extras').forEach((panel) => panel.remove())
      root.querySelectorAll('.brutti-platform-status-strip').forEach((strip) => strip.remove())

      const avatar = root.querySelector('.topbar .avatar')
      if (avatar) avatar.hidden = true

      const sidebarStatus = root.querySelector('.sidebar .system-card')
      if (sidebarStatus) sidebarStatus.hidden = true

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
          row.hidden = hiddenSettingsRows.has(name)
          row.querySelectorAll('button').forEach((button) => { button.hidden = true })
        })

        const refreshButton = [...activePage.querySelectorAll('button')]
          .find((button) => /^Refresh status$/i.test(button.textContent?.trim() || ''))
        if (refreshButton) refreshButton.textContent = 'Refresh integration status'
      }

      if (title === 'Analytics' && activePage) {
        activePage.querySelectorAll('.page-header .status-chip').forEach((chip) => {
          if (/meta/i.test(chip.textContent || '')) chip.hidden = true
        })
      }
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  if (!pageNode) return null
  if (pageTitle === 'Asset Library' && !driveConnected) return createPortal(<DriveRequiredPanel />, pageNode)
  return null
}
