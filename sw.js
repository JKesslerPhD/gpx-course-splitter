const APP_CACHE = 'gpx-course-splitter-v1'
const FONT_CACHE = 'gpx-course-splitter-fonts-v1'
const LEAFLET_CACHE = 'gpx-course-splitter-leaflet-v1'
const APP_ASSETS = ['./', './index.html', './manifest.json', './icon.svg']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP_CACHE).then(c => c.addAll(APP_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== APP_CACHE && k !== FONT_CACHE && k !== LEAFLET_CACHE)
          .map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Cache-first for Google Fonts
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(e.request).then(cached => cached || fetch(e.request).then(res => {
          cache.put(e.request, res.clone()); return res
        }))
      )
    )
    return
  }

  // Cache-first for Leaflet assets (unpkg CDN)
  if (url.hostname === 'unpkg.com') {
    e.respondWith(
      caches.open(LEAFLET_CACHE).then(cache =>
        cache.match(e.request).then(cached => cached || fetch(e.request).then(res => {
          cache.put(e.request, res.clone()); return res
        }))
      )
    )
    return
  }

  // Cache-first for app assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})
