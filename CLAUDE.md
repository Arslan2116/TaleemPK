# TaleemPK — Architecture & Workflows

Pakistani university comparison site. **No build step, no framework** — plain HTML/CSS/JS
served as static files on Cloudflare Workers (static assets mode), data in Supabase Postgres.

## File map

| File | Role |
|---|---|
| `index.html` | Homepage shell (~76KB). Loads the split assets below in order. |
| `styles.css` | All homepage CSS (extracted from index.html). |
| `app-core.js` | i18n strings (`T`, `t()`) + early UI logic. |
| `uni-data.js` | Seed data: `UNIVERSITIES` array, `DATA_UPDATES`, `LOGO_OVERRIDES`, `MERIT_MAP`. |
| `app.js` | Main application logic (~3,400 lines): render, filters, compare, calculators, predictor. |
| `university.html` | Template for university detail pages. |
| `university.css` | Shared CSS for the template AND all 272 static pages. |
| `university.js` | Shared JS for all university pages (fetches from Supabase by id/slug). |
| `university/*.html` | 272 pre-rendered SEO pages. Tiny shells → `/university.css` + `/university.js`. |
| `blog.html` + `blog/*.html` | Blog listing + individual static article pages. |
| `admin.html` | Admin panel (blog posts, deadlines, data edits). |
| `sw.js` | Service worker: network-first HTML, stale-while-revalidate statics. |
| `config.js` | `TPK_CONFIG` with Supabase URL + anon key. |
| `merit-formulas.js` | Per-university aggregate formulas, keyed by institution **id** (numeric keys are ids, not counts!). |
| `logos/` | Self-hosted university logos (`<id>.<ext>`), referenced by DB `logo_url = '/logos/<id>.png'`. |
| `sql/` | Migration/fix scripts — **run manually in Supabase SQL Editor**, never auto-applied. |
| `_redirects` | Cloudflare rewrites. ⚠️ Do NOT add `/blog /blog.html 200` — Workers auto-serves .html at clean URLs and that rule creates an infinite redirect loop. |

## Load order (critical)

```
index.html → styles.css → app-core.js → uni-data.js → app.js
```
All script tags are **synchronous on purpose** — later files use consts from earlier ones
at parse time. Never add `defer`/`async` to these four.

## Cache versioning (critical)

Split assets are referenced as `/file.js?v=N`. When you change `styles.css`, `uni-data.js`,
`app-core.js`, `app.js`, or `university.css`:
1. Bump `?v=N` in `index.html` (and `university.html` + propagate for university.css)
2. Add the new versioned URL to `PRECACHE_URLS` in `sw.js`
3. Bump `CACHE_VERSION` in `sw.js`
Otherwise returning visitors keep the old cached copy.

## Data: Supabase is the single source of truth

- `uni-data.js` seed is **generated** from the DB: `python scripts/sync-uni-data.py`
  (then bump `?v=N` for uni-data.js in index.html + sw.js, and `CACHE_VERSION`).
- Workflow for any data change: fix it in Supabase → run the sync script → commit.
  Never hand-edit the UNIVERSITIES array.
- `DATA_UPDATES` is intentionally `{}` now; the tail of uni-data.js (LOGO_OVERRIDES,
  logo helpers, MERIT_MAP) is hand-maintained and preserved by the sync script.
- `meritMin`: curated `MERIT_MAP` wins over free-text parsing — both in `mapInstitution()`
  (app.js) and the sync script. Keep the two mappings in sync.
- Counts ("270 HEC Universities") are hardcoded in index.html/README — update on add/delete.

## Editing the 272 static pages

- CSS: edit `university.css` only — pages just link it. No propagation needed anymore.
- JS: edit `university.js` — shared by all pages.
- HTML structure: edit `university.html` template, then propagate with a Python script
  (read every `university/*.html`, string-replace old markup, write back, count).

## Supabase

- Anon key is public by design; RLS protects writes.
- `institutions` is the core table (+ `fee_details`, `blog_posts`, reviews/Q&A tables).
- Schema changes: write to `sql/*.sql`, user runs them manually. `university.js` has a
  fallback query in `load()` for when new columns don't exist yet — keep that pattern.

## Gotchas

- `merit-formulas.js` object keys are institution IDs — a global find-replace on numbers
  will corrupt formulas (it happened once with 272→270).
- Local preview server caches JS aggressively; `fetch(url, {cache:'no-store'})` to check
  what's actually on disk. Production serves fresh after deploy.
- Deploy = `git push` (Cloudflare auto-deploys main, ~1-2 min).
