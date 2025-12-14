// --- CONFIGURATION ---
const CACHE_NAME = 'pogo-search-v1.1'; // UPDATE THIS ID WHEN YOU PUSH A NEW VERSION
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// --- INSTALL: Cache the files ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting(); 
});

// --- ACTIVATE: Clean up old caches ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // If the cache key is NOT the current one, delete it!
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache.', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // Tell the active service worker to take control of the page immediately.
  self.clients.claim(); 
});

// --- FETCH: Serve from Cache, fall back to Network ---
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found, else fetch from network
      return response || fetch(event.request);
    })
  );
});
