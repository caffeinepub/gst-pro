const CACHE_NAME = 'gst-pro-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/generated/gst-pro-icon.dim_256x256.png',
  '/assets/generated/gst-pro-logo.dim_1200x300.png',
  '/assets/generated/gst-pro-icon-ios.dim_180x180.png',
  '/assets/generated/gst-pro-icon-ios-ipad.dim_152x152.png',
  '/assets/generated/gst-pro-icon-ios-ipad-pro.dim_167x167.png',
  '/assets/generated/gst-pro-icon-pwa.dim_192x192.png',
  '/assets/generated/gst-pro-icon-pwa.dim_512x512.png',
  '/assets/generated/gst-pro-icon-maskable.dim_512x512.png',
  '/assets/generated/gst-pro-favicon.dim_32x32.png',
  '/assets/generated/gst-pro-splash-iphone-14-pro-max.dim_1290x2796.png',
  '/assets/generated/gst-pro-splash-iphone-14-pro.dim_1179x2556.png',
  '/assets/generated/gst-pro-splash-iphone-13-14.dim_1170x2532.png',
  '/assets/generated/gst-pro-splash-iphone-x-xs-11-pro.dim_1125x2436.png',
  '/assets/generated/gst-pro-splash-iphone-8-plus.dim_1242x2208.png',
  '/assets/generated/gst-pro-splash-iphone-11-xr.dim_828x1792.png',
  '/assets/generated/gst-pro-splash-iphone-8-7-6s.dim_750x1334.png',
  '/assets/generated/gst-pro-splash-iphone-se.dim_640x1136.png',
  '/assets/generated/gst-pro-splash-ipad-mini-air.dim_1536x2048.png',
  '/assets/generated/gst-pro-splash-ipad-pro-11.dim_1668x2388.png',
  '/assets/generated/gst-pro-splash-ipad-pro-12-9.dim_2048x2732.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('Failed to cache assets during install:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip canister API calls (let them go to network)
  if (url.pathname.includes('/api/') || url.hostname.includes('ic0.app') || url.hostname.includes('localhost')) {
    return;
  }

  // For navigation requests, use network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For static assets, use cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok && (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
