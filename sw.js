/**
 * TaleemPK Service Worker
 * Strategy:
 *  - HTML (navigation): network-first with 4s timeout, fallback to cache, then offline page
 *  - Static assets (JS/CSS/PNG/SVG): stale-while-revalidate
 *  - Supabase + Gemini API: network only (never cache user data)
 *  - Bump CACHE_VERSION on every code release to evict old caches
 */
const CACHE_VERSION = 'tpk-v14-20260801';
const RUNTIME_CACHE = 'tpk-runtime-' + CACHE_VERSION;
const STATIC_CACHE  = 'tpk-static-'  + CACHE_VERSION;

// Pre-cache shell so the app loads instantly the next time
const PRECACHE_URLS = [
  '/',
  '/favicon.png',
  '/logo.png',
  '/og-image.png',
  '/chat-widget.js',
  '/config.js',
  '/manifest.json',
  // split-out core assets (post perf refactor)
  '/styles.css?v=4',
  '/uni-data.js?v=2',
  '/app-core.js?v=1',
  '/app.js?v=10',
  '/university.css?v=4',
  '/university.js',
  '/merit-formulas.js',
  '/gpa-systems.js'
];

// ── Install: pre-cache the shell ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS).catch(()=>{ /* tolerate failures */ }))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: nuke old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch handler ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GETs. Don't touch POST/PUT/DELETE.
  if (request.method !== 'GET') return;

  // NEVER cache:
  //   - Supabase (user data, RLS-protected)
  //   - Cloudflare worker chat API (live)
  //   - Analytics (gtag, plausible)
  if (url.hostname.includes('supabase.co')
      || url.hostname === 'api.taleempk.pk'
      || url.hostname.includes('google-analytics.com')
      || url.hostname.includes('googletagmanager.com')
      || url.hostname.includes('plausible.io')) {
    return; // let browser handle directly (no SW intervention)
  }

  // HTML navigation → network-first, fall back to cache, then offline shell
  if (request.mode === 'navigate' || (request.headers.get('Accept') || '').includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (same-origin or trusted CDNs) → stale-while-revalidate
  if (url.origin === self.location.origin
      || /jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|fonts\.gstatic\.com|fonts\.googleapis\.com/.test(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Everything else: network only
});

// ── Strategies ──

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    // 12s timeout — slow Pakistani mobile networks need room. On timeout we serve the
    // SAME page from cache (or an offline notice) — never the homepage, which made every
    // slow university-page click silently land back on the homepage.
    const networkResp = await Promise.race([
      fetch(request),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 12000))
    ]);
    if (networkResp && networkResp.ok) {
      cache.put(request, networkResp.clone()).catch(()=>{});
    }
    return networkResp;
  } catch (_) {
    // Offline / slow — serve the REQUESTED page from cache if we have it
    const cached = await cache.match(request);
    if (cached) return cached;
    // Truly offline and uncached: a neutral offline notice — NOT the homepage,
    // so a university link never silently resolves to the wrong page.
    return new Response(
      '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — TaleemPK</title></head>'
      + '<body style="font-family:sans-serif;text-align:center;padding:60px 20px;color:#0A1628"><h1>You’re offline</h1>'
      + '<p style="color:#5A6478">Reconnect and reload to view this page.</p>'
      + '<p style="margin-top:20px"><a href="/" style="color:#00A040;font-weight:700">← Go to homepage</a></p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then(resp => {
    if (resp && resp.ok) cache.put(request, resp.clone()).catch(()=>{});
    return resp;
  }).catch(() => null);
  // Return cached immediately if present, refresh in background
  return cached || networkFetch || new Response('', { status: 504 });
}

// ── Message handler — let pages force a cache update ──
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
