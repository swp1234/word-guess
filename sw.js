/**
 * Service Worker for Word Guess PWA
 * Enables offline functionality and app installation
 */

const CACHE_NAME = 'word-guess-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/js/app.js',
    '/js/i18n.js',
    '/js/word-list.js',
    '/icon-192.svg',
    '/icon-512.svg',
    '/js/locales/ko.json',
    '/js/locales/en.json',
    '/js/locales/ja.json',
    '/js/locales/zh.json',
    '/js/locales/es.json',
    '/js/locales/pt.json',
    '/js/locales/id.json',
    '/js/locales/tr.json',
    '/js/locales/de.json',
    '/js/locales/fr.json',
    '/js/locales/hi.json',
    '/js/locales/ru.json'
];

/**
 * Install event - cache all assets
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching assets');
            return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
                console.log('[SW] Cache error (non-critical):', err);
                // Don't fail installation on cache errors
            });
        })
    );

    self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

/**
 * Fetch event - serve from cache, fall back to network
 */
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (!event.request.url.includes(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                // Serve from cache
                return response;
            }

            // Try network
            return fetch(event.request).then((response) => {
                // Check if response is valid
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Cache the response
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch((err) => {
                console.log('[SW] Fetch error:', err);
                // Return offline page or error response
                return new Response('Offline - please try again later', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            });
        })
    );
});

/**
 * Background sync for future features
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-game-stats') {
        event.waitUntil(syncGameStats());
    }
});

/**
 * Push notifications for future features
 */
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New Word Guess available!',
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: 'word-guess-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('Word Guess', options)
    );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if app is already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }

            // Open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

/**
 * Sync game statistics (placeholder)
 */
function syncGameStats() {
    // TODO: Implement stats sync when backend is ready
    return Promise.resolve();
}
