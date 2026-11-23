const CACHE_NAME = 'hellomraz-runtime-v2';
const CORE_FILES = ['', 'offline.html', 'manifest.webmanifest', 'pwa-192.png', 'pwa-512.png'];

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
        cache.addAll(CORE_FILES.map((path) => new Request(getScopeUrl(path), { cache: 'reload' }))),
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
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!shouldCache(request)) return;

  // The build hashes these assets, so the same URL always holds the same
  // bytes. Serve them from cache and skip the revalidation round trip.
  const url = new URL(request.url);
  if (url.pathname.includes('/_astro/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

function putInCache(request, response) {
  if (!response.ok) return;

  const copy = response.clone();
  void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  putInCache(request, response);

  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    putInCache(request, response);

    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (request.mode === 'navigate') {
      return caches.match(getScopeUrl('offline.html'));
    }

    throw new Error('Network error');
  }
}
