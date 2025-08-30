/// <reference lib="webworker" />
/* eslint-env serviceworker */
/**
 * Service Worker (injectManifest)
 * - precache build assets
 * - runtime caching (API)
 * - Google Maps -> NetworkOnly
 * - push notification
 */

import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

precacheAndRoute(self.__WB_MANIFEST || []);

const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api\//, /^\/assets\//],
});
registerRoute(navigationRoute);

// API cache
const RAW = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE = new URL(RAW, self.location.origin);
const API_ORIGIN = API_BASE.origin;
const API_PATH = API_BASE.pathname.includes('/api')
  ? API_BASE.pathname.replace(/\/+$/, '')
  : `${API_BASE.pathname.replace(/\/+$/, '')}/api`;

registerRoute(
  ({ url }) =>
    (url.origin === API_ORIGIN && url.pathname.startsWith(API_PATH)) ||
    (url.origin === self.location.origin && url.pathname.startsWith('/api')),
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

// Google Maps online
registerRoute(
  ({ url }) => url.origin === 'https://maps.googleapis.com' || url.origin === 'https://maps.gstatic.com',
  new NetworkOnly()
);

// static SWR
registerRoute(
  ({ request, url }) =>
    url.origin === self.location.origin && ['image', 'style', 'script'].includes(request.destination),
  new StaleWhileRevalidate({ cacheName: 'static-swr' })
);

// Push
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data?.json() || {}; } catch { data = {}; }
  const title = data.title || 'Festival';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/' },
    tag: data.tag || undefined,
    renotify: data.renotify === true
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
