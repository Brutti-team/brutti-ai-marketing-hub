"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isRunningAsApp() {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export default function PwaControls() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isRunningAsApp());
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [showGuide, setShowGuide] = useState(false);
  const [guideMode, setGuideMode] = useState<"ios" | "browser">("browser");

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowGuide(false);
    };
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const registerServiceWorker = () => {
      if ("serviceWorker" in navigator) {
        void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      }
    };
    if (document.readyState === "complete") registerServiceWorker();
    else window.addEventListener("load", registerServiceWorker, { once: true });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  async function install() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
      return;
    }

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setGuideMode(isIos ? "ios" : "browser");
    setShowGuide(true);
  }

  return (
    <>
      {!installed && (
        <button className="install-app-button" onClick={() => void install()} aria-label="Install BRUTTI AI on this device">
          <span className="install-icon" aria-hidden="true">↓</span>
          <span className="install-label">Install app</span>
        </button>
      )}

      {!online && (
        <div className="offline-banner" role="status">
          You&apos;re offline. Saved pages remain available; changes need internet.
        </div>
      )}

      {showGuide && (
        <div className="pwa-guide-layer" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowGuide(false);
        }}>
          <section className="pwa-guide" role="dialog" aria-modal="true" aria-labelledby="pwa-guide-title">
            <div className="pwa-guide-handle" aria-hidden="true" />
            <div className="pwa-guide-icon" aria-hidden="true">BR</div>
            <div>
              <p className="eyebrow">Install BRUTTI AI</p>
              <h2 id="pwa-guide-title">Add it to your home screen</h2>
            </div>
            {guideMode === "ios" ? (
              <ol>
                <li>Tap the <strong>Share</strong> button in Safari.</li>
                <li>Choose <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong>.</li>
              </ol>
            ) : (
              <p>Open your browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
            )}
            <button className="primary-inline-button guide-close" onClick={() => setShowGuide(false)}>Got it</button>
          </section>
        </div>
      )}
    </>
  );
}
