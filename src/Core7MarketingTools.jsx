import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const hiddenNavigation = new Set(['Brand Library', 'AI Tools'])
const hiddenSettingsRows = new Set(['Free AI Assist Mode', 'Meta / Facebook'])

const staticSettingLabels = new Map([
  ['Human approval required', 'Required'],
  ['Block unsupported facts', 'Active'],
  ['Facebook-only operations', 'Active'],
])

function DriveRequiredPanel() {
  return (
    <section className="panel core7-drive-required">
      <div className="core7-drive-icon">G</div>
      <div>
        <span className="eyebrow">GOOGLE DRIVE REQUIRED</span>
        <h3>Connect Drive to use approved visual assets.</h3>
        <p>Asset cards stay hidden while Drive is disconnected so reference names are not mistaken for usable files. Connect Google Drive from Settings to load real Brutti assets.</p>
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
        const shouldHide = hiddenNavigation.has(label)
        if (button.hidden !== shouldHide) button.hidden = shouldHide
      })

      root.querySelectorAll('.phase2-audit-panel, .phase3-ranking-panel, .social-enterprise-intelligence, .workspace-readiness-panel')
        .forEach((panel) => panel.remove())

      root.querySelectorAll('.panel-heading .eyebrow').forEach((label) => {
        if (label.textContent?.trim() === 'SMART CAMPAIGN IDEAS') label.textContent = 'CAMPAIGN IDEAS'
      })

      root.querySelectorAll('.core7-prompt-panel, .core7-studio-extras').forEach((panel) => panel.remove())
      root.querySelectorAll('.brutti-platform-status-strip').forEach((strip) => strip.remove())

      root.querySelectorAll('button').forEach((button) => {
        const text = button.textContent?.trim() || ''
        if (/publish\s+(to\s+facebook|photo\s*\+\s*caption|to\s+meta)/i.test(text) && !button.hidden) button.hidden = true
      })

      const avatar = root.querySelector('.topbar .avatar')
      if (avatar && !avatar.hidden) avatar.hidden = true

      const sidebarStatus = root.querySelector('.sidebar .system-card')
      if (sidebarStatus && !sidebarStatus.hidden) sidebarStatus.hidden = true

      if (title === 'Dashboard') {
        root.querySelectorAll('.dashboard-page > .stats-grid, .dashboard-page .focus-panel, .dashboard-page .upcoming-panel')
          .forEach((panel) => {
            panel.hidden = true
            panel.style.setProperty('display', 'none', 'important')
          })
        root.querySelector('.dashboard-page .pipeline-panel')
          ?.style.setProperty('grid-column', '1 / -1', 'important')
      }

      if (title === 'Content Studio' && activePage) {
        const platformLabel = [...activePage.querySelectorAll('label')]
          .find((label) => /^Platform/i.test(label.textContent || ''))
        const platformSelect = platformLabel?.querySelector('select')
        platformSelect?.querySelectorAll('option').forEach((option) => {
          const shouldHide = option.textContent?.trim() !== 'Facebook'
          if (option.hidden !== shouldHide) option.hidden = shouldHide
        })
      }

      if (title === 'Asset Library' && activePage) {
        const addAsset = [...activePage.querySelectorAll('button')]
          .find((button) => /add asset/i.test(button.textContent || ''))
        if (addAsset && !addAsset.hidden) addAsset.hidden = true

        const connected = [...activePage.querySelectorAll('.status-chip')]
          .some((chip) => /drive connected/i.test(chip.textContent || ''))
        setDriveConnected((current) => current === connected ? current : connected)

        const summary = activePage.querySelector('.asset-summary')
        const assetPanel = activePage.querySelector('.asset-panel')
        if (summary && summary.hidden === connected) summary.hidden = !connected
        if (assetPanel && assetPanel.hidden === connected) assetPanel.hidden = !connected
      } else {
        setDriveConnected(false)
      }

      if (title === 'Settings' && activePage) {
        activePage.querySelectorAll('.connections-list article').forEach((row) => {
          const name = row.querySelector('strong')?.textContent?.trim() || ''
          const shouldHide = hiddenSettingsRows.has(name)
          if (row.hidden !== shouldHide) row.hidden = shouldHide
          row.querySelectorAll('button').forEach((button) => {
            if (!button.hidden) button.hidden = true
          })
        })

        activePage.querySelectorAll('.setting-row').forEach((row) => {
          const name = row.querySelector('strong')?.textContent?.trim() || ''
          const status = row.querySelector('.switch')
          const label = staticSettingLabels.get(name)
          if (!status || !label) return

          const className = 'status-pill connected static-setting-status'
          const ariaLabel = `${name}: ${label}`
          if (status.className !== className) status.className = className
          if (status.textContent !== label) status.textContent = label
          if (status.getAttribute('aria-label') !== ariaLabel) status.setAttribute('aria-label', ariaLabel)
        })

        const refreshButton = [...activePage.querySelectorAll('button')]
          .find((button) => /^Refresh status$/i.test(button.textContent?.trim() || ''))
        if (refreshButton && refreshButton.textContent !== 'Refresh integration status') {
          refreshButton.textContent = 'Refresh integration status'
        }
      }

      if (title === 'Analytics' && activePage) {
        activePage.querySelectorAll('.page-header .status-chip').forEach((chip) => {
          if (/meta/i.test(chip.textContent || '') && !chip.hidden) chip.hidden = true
        })
      }
    }

    let timer = 0
    const schedule = (delay = 60) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(sync, delay)
    }

    sync()
    window.setTimeout(sync, 250)
    window.setTimeout(sync, 900)
    const onClick = () => {
      schedule(60)
      window.setTimeout(sync, 180)
    }
    document.addEventListener('click', onClick, true)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  if (!pageNode) return null
  if (pageTitle === 'Asset Library' && !driveConnected) return createPortal(<DriveRequiredPanel />, pageNode)
  return null
}
