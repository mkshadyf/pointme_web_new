const CACHE_NAME = 'pointme-v2';
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/assets/styles.css',
  '/assets/main.js',
];

// Runtime caching strategies
const CACHE_STRATEGIES = {
  staticAssets: {
    match: ({ url }) => STATIC_ASSETS.includes(url.pathname),
    handle: 'cache-first',
  },
  images: {
    match: ({ request }) => request.destination === 'image',
    handle: 'cache-first',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  api: {
    match: ({ url }) => url.pathname.startsWith('/api/'),
    handle: 'network-first',
    maxAge: 60 * 60, // 1 hour
  },
  fonts: {
    match: ({ request }) => request.destination === 'font',
    handle: 'cache-first',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  styles: {
    match: ({ request }) => request.destination === 'style',
    handle: 'cache-first',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  scripts: {
    match: ({ request }) => request.destination === 'script',
    handle: 'cache-first',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting(),
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim(),
    ])
  );
});

async function handleFetch(event) {
  const request = event.request;
  const url = new URL(request.url);

  // Find matching strategy
  const strategy = Object.values(CACHE_STRATEGIES).find(s => s.match(event));

  if (!strategy) {
    return fetch(request);
  }

  try {
    switch (strategy.handle) {
      case 'cache-first':
        return await handleCacheFirst(event, strategy);
      case 'network-first':
        return await handleNetworkFirst(event, strategy);
      default:
        return fetch(request);
    }
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match(OFFLINE_URL);
    }
    throw error;
  }
}

async function handleCacheFirst(event, strategy) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(event.request);
  
  if (cachedResponse) {
    // Validate cache age if maxAge is set
    if (strategy.maxAge) {
      const dateHeader = cachedResponse.headers.get('date');
      if (dateHeader) {
        const cacheAge = (Date.now() - new Date(dateHeader).getTime()) / 1000;
        if (cacheAge > strategy.maxAge) {
          return refreshCache(event, cache);
        }
      }
    }
    return cachedResponse;
  }

  return refreshCache(event, cache);
}

async function handleNetworkFirst(event, strategy) {
  try {
    const response = await fetch(event.request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(event.request, response.clone());
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function refreshCache(event, cache) {
  const response = await fetch(event.request);
  cache.put(event.request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event));
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
    },
    actions: [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    tag: data.tag || 'default',
    renotify: data.renotify || false,
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

async function updateCache() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(STATIC_ASSETS);
}

async function syncData() {
  const db = await openDB('pointme-sync', 1);
  const tx = db.transaction('offline_mutations', 'readwrite');
  const store = tx.objectStore('offline_mutations');
  const mutations = await store.getAll();

  for (const mutation of mutations) {
    try {
      const response = await fetch(`/api/${mutation.table}`, {
        method: mutation.type === 'DELETE' ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mutation.data),
      });

      if (response.ok) {
        await store.delete(mutation.id);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  await tx.done;
}

// Handle app updates
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
}); 