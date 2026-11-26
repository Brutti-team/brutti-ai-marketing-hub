// Notification (bell) preferences. Stored on this device only; no credentials.
export const NOTIFICATION_PREFS_KEY = 'brutti-notification-prefs-v1'
export const NOTIFICATION_PREFS_EVENT = 'brutti:notification-prefs'

export const NOTIFICATION_DEFAULTS = {
  enabled: true, // master switch for bell reminders
  review: true, // alert id: review-queue
  plan: true, // alert id: today-plan
  workspace: true, // alert id: workspace-local
  calendar: true, // alert ids: cal-* (Calendar Planner note reminders, bell + system notification)
  showBell: true, // show the bell icon in the top bar
  dnd: false, // do not disturb: hide the red count, reminders stay in the list
}

// Which preference controls which reminder id produced by NotificationCenterEnhancer.
export const ALERT_PREF_BY_ID = {
  'review-queue': 'review',
  'today-plan': 'plan',
  'workspace-local': 'workspace',
}

export function readNotificationPrefs() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(NOTIFICATION_PREFS_KEY) || '{}')
    const next = { ...NOTIFICATION_DEFAULTS }
    Object.keys(NOTIFICATION_DEFAULTS).forEach((key) => {
      if (typeof saved?.[key] === 'boolean') next[key] = saved[key]
    })
    return next
  } catch {
    return { ...NOTIFICATION_DEFAULTS }
  }
}

export function saveNotificationPrefs(patch) {
  const next = { ...readNotificationPrefs(), ...patch }
  try {
    window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next))
  } catch {
    // Storage blocked; the change still applies for this session through the event below.
  }
  window.dispatchEvent(new CustomEvent(NOTIFICATION_PREFS_EVENT, { detail: next }))
  return next
}
