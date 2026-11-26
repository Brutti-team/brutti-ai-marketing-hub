import { useEffect, useState } from 'react'
import { notificationPermission, requestNotificationPermission } from './lib/calendarReminders'
import {
  NOTIFICATION_PREFS_EVENT,
  readNotificationPrefs,
  saveNotificationPrefs,
} from './lib/notificationPrefs'

const OPTIONS = [
  { key: 'review', label: 'Content waiting for review' },
  { key: 'plan', label: 'Today’s posting plan' },
  { key: 'workspace', label: 'Google workspace not connected' },
  { key: 'calendar', label: 'Reminder Calendar Planner' },
  { key: 'showBell', label: 'Show notification bell icon' },
]

function BellGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  )
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`notif-switch ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)}>
      <i />
    </button>
  )
}

export default function NotificationSettingsCard() {
  const [prefs, setPrefs] = useState(readNotificationPrefs)
  // Collapsed on every page load (Michelle, 26 Nov 2026); the sub-list opens only from the chevron.
  const [expanded, setExpanded] = useState(false)
  const [permission, setPermission] = useState(notificationPermission)
  const systemChoice = prefs.systemOptOut || permission !== 'granted' ? 'deny' : 'allow'
  const onSystemChoice = async (event) => {
    const value = event.target.value
    if (value === 'deny') {
      setPrefs(saveNotificationPrefs({ systemOptOut: true }))
      return
    }
    setPrefs(saveNotificationPrefs({ systemOptOut: false }))
    if (permission !== 'granted' && permission !== 'unsupported') {
      setPermission(await requestNotificationPermission())
    }
  }

  useEffect(() => {
    const sync = () => setPrefs(readNotificationPrefs())
    window.addEventListener(NOTIFICATION_PREFS_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(NOTIFICATION_PREFS_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const update = (patch) => setPrefs(saveNotificationPrefs(patch))

  return (
    <div className="notif-settings">
      <section className="notif-card">
        <div className="notif-row notif-main">
          <span className="settings-list-icon"><BellGlyph /></span>
          <span className="settings-list-copy">
            <strong>Notifications</strong>
            <small>Get reminders for review, today’s plan and workspace connection</small>
          </span>
          <span className="notif-controls">
            <span className="notif-state">{prefs.enabled ? 'On' : 'Off'}</span>
            <Toggle checked={prefs.enabled} onChange={(value) => update({ enabled: value })} label="Notifications" />
            <button type="button" className={`notif-chevron ${expanded ? 'is-open' : ''}`} aria-expanded={expanded} aria-label="Notifications options" onClick={() => setExpanded((value) => !value)}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
          </span>
        </div>
        {expanded ? (
          <div className={`notif-options ${prefs.enabled ? '' : 'is-disabled'}`}>
            {OPTIONS.map((option) => (
              <label className="notif-option" key={option.key}>
                <input type="checkbox" checked={prefs[option.key]} disabled={!prefs.enabled} onChange={(event) => update({ [option.key]: event.target.checked })} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        ) : null}
      </section>
      <section className="notif-card">
        <div className="notif-row notif-main">
          <span className="settings-list-icon"><BellGlyph /></span>
          <span className="settings-list-copy">
            <strong>System notifications</strong>
            <small>{prefs.systemOptOut ? 'Pop-up reminders are turned off in the app.' : permission === 'granted' ? 'Calendar Planner reminders pop up on this device while the app is open.' : permission === 'denied' ? 'Blocked in the browser settings. Allow notifications for this site there.' : permission === 'unsupported' ? 'This browser does not support notifications. On iPhone, add the app to the Home Screen first.' : 'Allow pop-up reminders for Calendar Planner notes on this device.'}</small>
          </span>
          <span className="notif-controls">
            {permission === 'unsupported' ? <span className="notif-state">Not supported</span> : (
              <select className="notif-allow-select" aria-label="System notifications" value={systemChoice} onChange={onSystemChoice}>
                <option value="allow">Allow</option>
                <option value="deny">Don't allow</option>
              </select>
            )}
          </span>
        </div>
      </section>
      <section className="notif-card">
        <div className="notif-row notif-main">
          <span className="settings-list-icon"><Moon /></span>
          <span className="settings-list-copy">
            <strong>Do not disturb</strong>
            <small>Hide the red count on the bell; reminders stay in the list</small>
          </span>
          <span className="notif-controls">
            <span className="notif-state">{prefs.dnd ? 'On' : 'Off'}</span>
            <Toggle checked={prefs.dnd} onChange={(value) => update({ dnd: value })} label="Do not disturb" />
          </span>
        </div>
      </section>
    </div>
  )
}
