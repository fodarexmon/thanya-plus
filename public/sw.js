const C = "thanya-plus-react-v4";
self.addEventListener("install", (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))).then(() => self.clients.claim())
  )
);
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) {
          const q = r.clone();
          caches.open(C).then((c) => c.put(e.request, q));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then((h) => h || caches.match("index.html")))
  );
});
