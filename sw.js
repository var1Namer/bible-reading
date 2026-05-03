// sw.js — Service Worker
// Bump CACHE_NAME when you update any app files so users get fresh content.

const CACHE_NAME = 'brw-v1';
const ASSETS = [
  './index.html',
  './style.css',
  './db.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
