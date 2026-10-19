// Service Worker Self-Destruct & Cache Clear
// Prevents any service worker from intercepting or breaking application bundles in dev/preview environments

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Never intercept or return null - pass directly through to live network
  event.respondWith(fetch(event.request));
});
