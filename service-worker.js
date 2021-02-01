self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('trello-clone-store').then((cache) => cache.addAll([
        '/css/buttons.css',
        '/css/styles.css',
        '/css/themes.css',
        '/icon/app-logo.png',
        '/dragAndDrop.js',
        '/index.html',
        '/script.js',
      ])),
    );
  });
  
  self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request)),
    );
  });