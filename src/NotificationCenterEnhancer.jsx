import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  )
}

function navTo(label) {
  const target = Array.from(document.querySelectorAll('.nav-link')).find((button) =>
    button.textContent?.toLowerCase().includes(label.toLowerCase()),
  )
  target?.click()
}

function readDashboardSignals() {
  const alerts = []

  const topbarStatus = Array.from(document.querySelectorAll('.topbar .status-chip'))
    .map((element) => element.textContent || '')
    .join(' ')

  if (/local mode/i.test(topbarStatus)) {
    alerts.push({
      id: 'workspace-local',
      level: 'alert',
      title: 'Google workspace belum connected',
      detail: 'Shared save, Drive dan sync team belum aktif. Local mode masih boleh digunakan untuk preview.',
      action: 'Settings',
      button: 'Check Settings',
    })
  }

  const reviewStep = Array.from(document.querySelectorAll('.dashboard-page .pipeline-step')).find((step) => {
    const label = step.querySelector('span')?.textContent?.trim() || ''
    return label.toLowerCase() === 'review'
  })
  const reviewCount = Number.parseInt(reviewStep?.querySelector('strong')?.textContent || '0', 10) || 0

  if (reviewCount > 0) {
    alerts.unshift({
      id: 'review-queue',
      level: 'alert',
      title: `${reviewCount} content perlu human review`,
      detail: 'Semak dan approve/reject sebelum content bergerak ke scheduling atau publishing.',
      action: 'Content Studio',
      button: 'Open Review',
    })
  }

  const actionHeadings = Array.from(document.querySelectorAll('.dashboard-page .recommendation-list strong'))
    .map((element) => element.textContent?.trim() || '')
  const plannedText = actionHeadings.find((text) => /planned today/i.test(text)) || ''
  const plannedMatch = plannedText.match(/(\d+)\s+items?\s+planned today/i)
  const plannedCount = plannedMatch ? Number.parseInt(plannedMatch[1], 10) : 0

  if (plannedCount > 0) {
    alerts.push({
      id: 'today-plan',
      level: 'reminder',
      title: `${plannedCount} posting ada dalam plan hari ini`,
      detail: 'Pastikan content, visual dan approval siap sebelum masa posting.',
      action: 'Campaign Planner',
      button: 'Open Planner',
    })
  }

  return alerts
}

function sameAlerts(left, right) {
  if (left.length !== right.length) return false
  return left.every((item, index) => {
    const other = right[index]
    return other && item.id === other.id && item.level === other.level && item.title === other.title && item.detail === other.detail && item.action === other.action && item.button === other.button
  })
}

function NotificationItem({ alert, onSelect }) {
  return (
    <button className={`brutti-notification-item ${alert.level === 'alert' ? 'is-alert' : ''}`} onClick={() => onSelect(alert)}>
      <span className="brutti-notification-dot" />
      <span>
        <strong>{alert.title}</strong>
        <small>{alert.detail}</small>
      </span>
    </button>
  )
}

export default function NotificationCenterEnhancer() {
  const [alerts, setAlerts] = useState([])
  const [open, setOpen] = useState(false)
  const [topbarTarget, setTopbarTarget] = useState(null)
  const [bannerTarget, setBannerTarget] = useState(null)

  useEffect(() => {
    let cancelled = false
    let timer = 0

    const refresh = () => {
      if (cancelled) return
      const nextTopbar = document.querySelector('.topbar-status')
      if (nextTopbar) setTopbarTarget((current) => current === nextTopbar ? current : nextTopbar)

      const dashboard = document.querySelector('.dashboard-page')
      const header = dashboard?.querySelector('.page-header')
      if (dashboard && header) {
        let mount = dashboard.querySelector(':scope > .brutti-notification-banner-mount')
        if (!mount) {
          mount = document.createElement('div')
          mount.className = 'brutti-notification-banner-mount'
          header.insertAdjacentElement('afterend', mount)
        }
        setBannerTarget((current) => current === mount ? current : mount)
      } else {
        setBannerTarget((current) => current === null ? current : null)
      }

      const nextAlerts = readDashboardSignals()
      setAlerts((current) => sameAlerts(current, nextAlerts) ? current : nextAlerts)
    }

    const schedule = (delay = 180) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(refresh, delay)
    }
    const scheduleBurst = () => {
      schedule(120)
      window.setTimeout(refresh, 700)
    }

    const onClick = (event) => {
      if (event.target.closest?.('button, a')) scheduleBurst()
    }
    const onSubmit = () => scheduleBurst()
    const onChange = () => schedule(180)

    refresh()
    const interval = window.setInterval(refresh, 10000)
    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)
    document.addEventListener('change', onChange, true)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('change', onChange, true)
    }
  }, [])

  useEffect(() => {
    const close = (event) => {
      if (!event.target.closest?.('.brutti-notification-center')) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const primaryAlert = useMemo(() => alerts.find((alert) => alert.level === 'alert') || alerts[0] || null, [alerts])

  const handleSelect = (alert) => {
    setOpen(false)
    navTo(alert.action)
  }

  const topbarPortal = topbarTarget
    ? createPortal(
        <div className="brutti-notification-center">
          <button
            type="button"
            className="brutti-notification-trigger"
            aria-label={alerts.length ? `${alerts.length} reminders need attention` : 'Notifications'}
            aria-expanded={open}
            onClick={(event) => {
              event.stopPropagation()
              setOpen((value) => !value)
            }}
          >
            <BellIcon />
            {alerts.length ? <span className="brutti-notification-count">{alerts.length}</span> : null}
          </button>
          {open ? (
            <div className="brutti-notification-popover" role="dialog" aria-label="Marketing reminders" onClick={(event) => event.stopPropagation()}>
              <strong>Action Center</strong>
              {alerts.length
                ? alerts.map((alert) => <NotificationItem key={alert.id} alert={alert} onSelect={handleSelect} />)
                : <div className="brutti-notification-item"><span className="brutti-notification-dot" /><span><strong>Tiada reminder urgent sekarang</strong><small>Action Center akan highlight review, posting hari ini dan connection yang perlukan perhatian.</small></span></div>}
            </div>
          ) : null}
        </div>,
        topbarTarget,
      )
    : null

  const bannerPortal = bannerTarget && primaryAlert
    ? createPortal(
        <div className="brutti-priority-reminder" role="status">
          <div>
            <strong>Reminder · {primaryAlert.title}</strong>
            <p>{primaryAlert.detail}</p>
          </div>
          <button type="button" onClick={() => handleSelect(primaryAlert)}>{primaryAlert.button}</button>
        </div>,
        bannerTarget,
      )
    : null

  return <>{topbarPortal}{bannerPortal}</>
}
