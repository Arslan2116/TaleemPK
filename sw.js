/**
 * TaleemPK Service Worker
 * Strategy:
 *  - HTML (navigation): network-first with 4s timeout, fallback to cache, then offline page
 *  - Static assets (JS/CSS/PNG/SVG): stale-while-revalidate
 *  - Supabase + Gemini API: network only (never cache user data)
 *  - Bump CACHE_VERSION on every code release to evict old caches
 */
const CACHE_VERSION = 'tpk-v1-20260606';
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
  '/manifest.json'
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
    // 4s timeout — bail to cache if network is slow
    const networkResp = await Promise.race([
      fetch(request),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
    ]);
    if (networkResp && networkResp.ok) {
      cache.put(request, networkResp.clone()).catch(()=>{});
    }
    return networkResp;
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Last-resort offline fallback — try cached homepage
    const home = await caches.match('/');
    if (home) return home;
    return new Response(
      '<h1>Offline</h1><p>TaleemPK can\'t reach the server right now. Reconnect and try again.</p>',
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
