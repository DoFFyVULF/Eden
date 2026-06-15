const CACHE_NAME = "eden-shell-v3"; // Увеличили версию, чтобы сбросить старый кэш
const PRECACHE_URLS = ["/"];

// Установка: кэшируем главную страницу
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Активация: удаляем старые кэши
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Перехват запросов
self.addEventListener("fetch", (event) => {
  const { request } = event;
  
  // Игнорируем не-GET запросы и запросы к другим доменам (если нужно)
  if (request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      try {
        // Пробуем получить данные из сети
        const networkResponse = await fetch(request);
        
        // Кэшируем только если ответ успешный (статус 200)
        const isCacheable =
          networkResponse.status === 200 &&
          networkResponse.type !== "opaque" &&
          !networkResponse.headers.get("vary")?.includes("*");

        if (isCacheable) {
          cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Если сети нет, пытаемся отдать из кэша
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Если и в кэше нет, возвращаем стандартную ошибку браузера
        // (не создаем фейковую страницу Offline, чтобы не путать пользователя)
        return new Response("Network error", { status: 503 });
      }
    })()
  );
});