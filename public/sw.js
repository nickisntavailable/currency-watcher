const RATES_CACHE = "currency-watcher-rates-v1";

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// Офлайн-фолбэк только для курсов валют: онлайн — всегда свежие данные из сети
// (и попутно обновляем кэш), офлайн — отдаём последний успешно закэшированный ответ.
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    if (url.pathname !== "/api/rates") return;

    event.respondWith(
        (async () => {
            const cache = await caches.open(RATES_CACHE);
            try {
                const response = await fetch(event.request);
                if (response.ok) {
                    cache.put(event.request, response.clone());
                }
                return response;
            } catch (err) {
                const cached = await cache.match(event.request);
                if (cached) return cached;
                throw err;
            }
        })()
    );
});
