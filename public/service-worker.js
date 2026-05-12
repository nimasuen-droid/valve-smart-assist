const CACHE_VERSION = "valve-smart-assist-v2";
const APP_SHELL = ["/", "/settings", "/manifest.webmanifest", "/favicon.ico", "/app-icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cachedRoute = await caches.match(request);
          const cachedShell = await caches.match("/");

          return (
            cachedRoute ||
            cachedShell ||
            new Response("Valve Selection Guide is offline and no cached shell is available.", {
              status: 503,
              headers: { "Content-Type": "text/plain;charset=utf-8" },
            })
          );
        }),
    );
    return;
  }

  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) return response;

          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request)),
    );
  }
});
