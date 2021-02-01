  const staticQuizFlags = "trello-clone-store"
  const assets = [
    "/",
    '/css/buttons.css',
    '/css/styles.css',
    '/css/themes.css',
    '/icon/app-logo.png',
    '/dragAndDrop.js',
    '/index.html',
    '/script.js',
  ]
self.addEventListener("install", (installEvent) => {
    installEvent.waitUntil(
      caches.open(staticQuizFlags).then((cache) => {
        cache.addAll(assets)
      })
    )
  })
  self.addEventListener("fetch", (fetchEvent) => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then((res) => {
        return res || fetch(fetchEvent.request)
      })
    )
  })