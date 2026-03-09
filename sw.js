const CACHE_NAME = 'nicos-links-v1';
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/css/index.css',
    '/css/pages.css',
    '/css/argent-theme.css',
    '/assets/icons/Logo_Black.svg',
    '/assets/icons/Logo_White.svg',
    '/assets/fonts/Lexend-Regular.ttf',
    '/assets/fonts/Lexend-Bold.ttf'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
