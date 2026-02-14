/***********************
 * Service Worker - Offline Mode
 * يدير التخزين المؤقت والعمل بدون انترنت
 ***********************/

const CACHE_NAME = 'dent-treasury-offline-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/offline-script.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap'
];

// Install event - cache files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Cache opened');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('❌ Cache failed:', error);
            })
    );
    self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest)
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // If fetch fails (offline), try to return cached response
                        return caches.match(event.request);
                    });
            })
    );
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

// Background sync for pending operations
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-pending-data') {
        event.waitUntil(syncPendingData());
    }
});

async function syncPendingData() {
    // This will be handled by the main script
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
        client.postMessage({
            type: 'SYNC_PENDING_DATA'
        });
    });
}

// Push notification (optional - for future use)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
    };
    
    event.waitUntil(
        self.registration.showNotification('مدفوعات الصناديق', options)
    );
});
