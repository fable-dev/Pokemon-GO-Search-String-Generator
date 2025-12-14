const CACHE_NAME = 'pogo-search-v1.1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Install Event: Cache files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch Event: Serve from cache if offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
