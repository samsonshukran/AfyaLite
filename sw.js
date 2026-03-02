const CACHE_NAME = 'afyalite-cache-v2'; // Increment version when updating cache
const urlsToCache = [
  '/AfyaLite/',
  '/AfyaLite/index.html',
  '/AfyaLite/pages/dashboard.html',
  '/AfyaLite/pages/education.html',
  '/AfyaLite/pages/exercise.html',
  '/AfyaLite/pages/meal-planner.html',
  '/AfyaLite/pages/recipes.html',
  '/AfyaLite/pages/tips.html',
  '/AfyaLite/style/style.css',
  '/AfyaLite/style/dashboard.css',
  '/AfyaLite/style/education.css',
  '/AfyaLite/style/exercise.css',
  '/AfyaLite/style/meal-planner.css',
  '/AfyaLite/style/recipes.css',
  '/AfyaLite/style/tips.css',
  '/AfyaLite/js/script.js',
  '/AfyaLite/js/dashboard.js',
  '/AfyaLite/js/education.js',
  '/AfyaLite/js/exercise.js',
  '/AfyaLite/js/meal-planner.js',
  '/AfyaLite/js/recipes.js',
  '/AfyaLite/js/tips.js',
  '/AfyaLite/data/meals.json',
  '/AfyaLite/data/recipes.json',
  '/AfyaLite/data/tips.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap'
];

// Install event: cache all essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Activate worker immediately
});

// Fetch event: cache-first strategy
self.addEventListener('fetch', event => {
  // Skip cross-origin requests like analytics
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('fonts.googleapis.com') && 
      !event.request.url.includes('cdnjs.cloudflare.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        // Otherwise fetch from network
        return fetch(event.request).then(networkResponse => {
          // Optionally cache new requests (for future offline)
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients immediately
});