/// <reference lib="webworker" />
/* eslint-env serviceworker */
/**
 * Service Worker (injectManifest)
 * - precache build assets
 * - runtime caching (API)
 * - Google Maps -> NetworkOnly
 * - push notifications + deep link
 */

import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// ====== 1) Precache bundlowanych plików (wstrzykuje VitePWA) ======
precacheAndRoute(self.__WB_MANIFEST || []);

// SPA fallback (działa offline nawigacja do /route)
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api\//, /^\/assets\//],
});
registerRoute(navigationRoute);

// ====== 2) Runtime caching ======

// 2.1 API – NetworkFirst z timeoutem
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API = new URL(API_URL);
const API_ORIGIN = API.origin;
const API_PATH = API.pathname || '/';

registerRoute(
  ({ url }) =>
    (url.origin === API_ORIGIN && url.pathname.startsWith(API_PATH)) ||
    (url.origin === self.location.origin && url.pathname.startsWith('/api/')),
  new NetworkFirst({
    networkTimeoutSeconds: 5,
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 10 * 60 })
    ],
  }),
  'GET'
);

// 2.2 Google Maps – NetworkOnly
registerRoute(
  ({ url }) => url.origin === 'https://maps.googleapis.com' || url.origin === 'https://maps.gstatic.com',
  new NetworkOnly()
);

// statyczne zasoby – SWR
registerRoute(
  ({ request, url }) =>
    url.origin === self.location.origin && ['image', 'style', 'script'].includes(request.destination),
  new StaleWhileRevalidate({ cacheName: 'static-swr' })
);

// ====== 3) Web Push ======
self.addEventListener('push', (event) => {
    let data = {};
    try {
      data = event.data?.json() || {};
    } catch {
      // fallback gdy payload nie jest JSON-em
      data = {};
    }
    const title = data.title || 'Festival';
    const options = {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });
  

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) { w.focus(); w.navigate(url); return; }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
