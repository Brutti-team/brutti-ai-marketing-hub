import { useEffect, useState } from 'react'

const BRUTTI_LOGO_URL = `${import.meta.env.BASE_URL}icons/brutti-app-icon-192.png`

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export default function PWAInstallControl() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(() => isStandalone())
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine)
  const [guide, setGuide] = useState(null)

  useEffect(() => {
    const onInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
      setGuide(null)
    }
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)

    window.addEventListener('beforeinstallprompt', onInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const install = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice.outcome === 'accepted') setInstalled(true)
      setInstallPrompt(null)
      return
    }
    setGuide(/iphone|ipad|ipod/i.test(window.navigator.userAgent) ? 'ios' : 'browser')
  }

  return (
    <>
      {!installed ? (
        <button className="pwa-install-button" onClick={install} aria-label="Install BRUTTI AI on this device">
          <span aria-hidden="true">↓</span><strong>Install app</strong>
        </button>
      ) : null}

      {!online ? <div className="pwa-offline-banner" role="status">Offline mode · Connect to save current changes.</div> : null}

      {guide ? (
        <div className="pwa-guide-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setGuide(null)}>
          <section className="pwa-guide-sheet" role="dialog" aria-modal="true" aria-labelledby="pwa-guide-title">
            <div className="pwa-sheet-handle" aria-hidden="true" />
            <div className="pwa-guide-heading"><span className="pwa-guide-logo"><img src={BRUTTI_LOGO_URL} alt="BRUTTI logo" /></span><div><small>BRUTTI AI</small><h2 id="pwa-guide-title">Add to your home screen</h2></div></div>
            {guide === 'ios' ? (
              <ol><li>Tap the <strong>Share</strong> button in Safari.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Tap <strong>Add</strong>.</li></ol>
            ) : (
              <p>Open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
            )}
            <button className="button primary wide" onClick={() => setGuide(null)}>Got it</button>
          </section>
        </div>
      ) : null}
    </>
  )
}
