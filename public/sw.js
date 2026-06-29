const CACHE_NAME = 'fincoach-cache-v2';
const DB_NAME = 'fincoach-offline-db';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';

// Caching strategies
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.svg'
      ]);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Dynamic Asset Cache (Stale-While-Revalidate)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip caching for backend endpoints, chrome extensions, or POST/PUT methods
  if (
    e.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('supabase.co')
  ) {
    return;
  }

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for static assets
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, cacheCopy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Stale-While-Revalidate for other GET requests
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});

// IndexedDB Helper inside Service Worker
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function getSyncItems() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

function deleteSyncItem(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// Supabase REST endpoint worker upload logic
async function processQueue() {
  const items = await getSyncItems();
  if (items.length === 0) return;



  for (const item of items) {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method || 'POST',
        headers: item.headers,
        body: JSON.stringify(item.payload)
      });

      if (response.ok) {
        await deleteSyncItem(item.id);
        // Notify active tabs about successful sync
        const clientsList = await self.clients.matchAll();
        for (const client of clientsList) {
          client.postMessage({
            type: 'OFFLINE_SYNC_SUCCESS',
            id: item.id,
            action: item.action
          });
        }
      }
    } catch {
      // Stop loop if network is still down
      break;
    }
  }
}

// Background Sync Event Listener
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-transactions') {
    e.waitUntil(processQueue());
  }
});

// Periodic fallback / wakeup event listeners
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'TRIGGER_SYNC') {
    e.waitUntil(processQueue());
  }
});
