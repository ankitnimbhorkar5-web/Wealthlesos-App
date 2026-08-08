// WealthLens PWA shell — minimal service worker.
// Its only job is to (a) satisfy the "has a registered service worker"
// requirement for Android install eligibility, and (b) cache the tiny
// wrapper shell (not the Streamlit app itself, which always needs a live
// connection) so re-opening the installed icon feels instant even on a
// slow connection.

const CACHE_NAME = "wealthlens-shell-v1";
const SHELL_FILES = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache the actual app content — it's live trading data.
  if (url.hostname.includes("streamlit.app")) return;

  // Shell files: cache-first for instant reopen, falling back to network.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
