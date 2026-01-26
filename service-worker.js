const CACHE = "rugby-pwa-v1";
const FILES = [
    "index.html",
    "partita_1.html",
    "partita_2.html",
    "styles.css",
    "script_partita.js",
    "riepilogo.js",
    "manifest.json"
];

self.addEventListener("install", e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener("fetch", e => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
