const CACHE_NAME = 'shop-a-rone-cache-v1';
const ASSETS = [
  './',
  'index.html','style.css','script.js','shop-a-rone-logo.png','manifest.json'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
