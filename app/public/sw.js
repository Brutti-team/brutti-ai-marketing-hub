const CACHE_NAME = 'brutti-hub-shell-v7'
const APP_SCOPE = '/brutti-ai-marketing-hub/'
const CORE_ASSETS = [
  APP_SCOPE,
  `${APP_SCOPE}manifest.webmanifest`,
  `${APP_SCOPE}offline.html`,
  `${APP_SCOPE}icons/brutti-official-logo.svg`,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' })
    if (response.ok) {
      const copy = response.clone()
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
    }
    return response
  } catch {
    return caches.match(request)
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_SCOPE)) return

  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request).then(async (response) => (
        response
        || (await caches.match(APP_SCOPE))
        || caches.match(`${APP_SCOPE}offline.html`)
      )),
    )
    return
  }

  if (
    request.destination === 'script'
    || request.destination === 'style'
    || request.destination === 'image'
    || url.pathname.endsWith('/manifest.webmanifest')
  ) {
    event.respondWith(networkFirst(request))
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
