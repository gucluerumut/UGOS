const CACHE_NAME = 'ugos-v1.2.0';
const STATIC_CACHE = 'ugos-static-v1.2.0';
const DYNAMIC_CACHE = 'ugos-dynamic-v1.2.0';

const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/tasks.svg',
  '/icons/focus.svg',
  '/icons/habits.svg'
];

const DYNAMIC_CACHE_LIMIT = 50;

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Opened static cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static resources:', error);
      })
  );
});

// Helper function to limit cache size
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
};

// Fetch event - serve from cache with improved strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - cache first
    if (urlsToCache.some(cachedUrl => request.url.includes(cachedUrl))) {
      event.respondWith(
        caches.match(request)
          .then(response => response || fetch(request))
          .catch(() => caches.match('/'))
      );
    }
    // Dynamic content - network first with cache fallback
    else {
      event.respondWith(
        fetch(request)
          .then(response => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(request, responseClone);
                  limitCacheSize(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT);
                });
            }
            return response;
          })
          .catch(() => {
            return caches.match(request)
              .then(response => response || caches.match('/'));
          })
      );
    }
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated successfully');
      return self.clients.claim();
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync offline data when connection is restored
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncDataToServer(offlineData);
      await clearOfflineData();
    }
  } catch (error) {
    console.error('UGOS: Background sync başarısız:', error);
  }
}

async function getOfflineData() {
  // Get data stored while offline
  return new Promise((resolve) => {
    const request = indexedDB.open('ugos-offline', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offline-data'], 'readonly');
      const store = transaction.objectStore('offline-data');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
    };
    request.onerror = () => resolve([]);
  });
}

async function syncDataToServer(data) {
  // Sync data to server when online
  for (const item of data) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item)
      });
    } catch (error) {
      console.error('UGOS: Veri senkronizasyonu başarısız:', error);
    }
  }
}

async function clearOfflineData() {
  // Clear synced offline data
  return new Promise((resolve) => {
    const request = indexedDB.open('ugos-offline', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offline-data'], 'readwrite');
      const store = transaction.objectStore('offline-data');
      store.clear();
      resolve();
    };
  });
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'UGOS bildirim',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Uygulamayı Aç',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('UGOS', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});