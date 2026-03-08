const CACHE_NAME = 'hellomraz-runtime-v1';
const CORE_FILES = ['', 'manifest.webmanifest', 'pwa-192.png', 'pwa-512.png'];

function getScopeUrl(path = '') {
  return new URL(path, self.registration.scope).toString();
}

function shouldCache(request) {
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;

  return (
    request.mode === 'navigate' ||
    ['document', 'script', 'style', 'image', 'font'].includes(request.destination) ||
    url.pathname.endsWith('.json')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(
          CORE_FILES.map((path) => new Request(getScopeUrl(path), { cache: 'reload' })),
        ),
      )
      .catch(() => undefined),
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!shouldCache(request)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        if (request.mode === 'navigate') {
          return caches.match(getScopeUrl());
        }

        throw new Error('Network error');
      }),
  );
});
