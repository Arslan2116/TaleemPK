# TaleemPK — Security Audit Fixes (applied)

This document tracks what was patched in response to the full production audit.

## ✅ Critical fixes applied in code

| ID | Issue | Where | Status |
|----|-------|-------|--------|
| C-1 | Stored XSS in reviews / Q&A / answers / alumni / admin recent list | `index.html`, `admin.html` | ✅ Escaped via `escHTML()` |
| C-4 | Unauthenticated `/run-now`, `/preview-image` on social worker | `worker/social-worker.js` | ✅ `X-Trigger-Secret` gate added |
| C-5 | Compare URL race — modal silently failed on slow networks | `index.html` `loadCompareFromURL` | ✅ Polls for UNIVERSITIES up to 8 s |
| C-6 | Print/PDF dirty `printing-compare` class on Safari/cancel | `index.html` `printCompare` | ✅ `afterprint` + idempotent cleanup |
| C-7 | Chat worker cached empty Supabase responses for 60 s | `worker/chat-worker.js` `ensureCache` | ✅ Single-flight lock + non-empty commit |
| C-8 | Open CORS + no rate limit on chat worker → Gemini bill bomb | `worker/chat-worker.js` `fetch` | ✅ Origin allow-list, IP rate limit, 16 KB body cap |
| H-2 | `generate-sitemap.js` exited 0 on Supabase HTTP failure | `generate-sitemap.js` | ✅ Status check + `process.exit(1)` |
| H-3 | `expandProgs` JSON injection via inline onclick | `university.html` | ✅ Moved to `data-list` attribute |
| H-4 | `onerror` attribute XSS via admin-set icon | `university.html` `render()` | ✅ Sanitised + `replaceWith` |
| H-5 | Pre-Eng → Medical hid bio-science fallback unis | `index.html` `runPredictor` | ✅ Allow `bioSciences` too |
| H-6 | ICS → Engineering hard-blocked even for BS CS | `index.html` `runPredictor` | ✅ Allow if uni has CS programs |
| H-8 | Reply-To used `taleempk.com` (bounces) | `index.html` `notifyAdmin` | ✅ Fixed to `taleempk.pk` |
| H-10 | Social worker posted static OG image on pipeline failure | `worker/social-worker.js` | ✅ Skip post on fallback |
| H-11 | System prompt sent as fake user turn (token waste, weak isolation) | `worker/chat-worker.js` `askGemini` | ✅ Use `systemInstruction` |
| H-14 | Admin can store `javascript:` URLs | `admin.html` saves | ✅ `safeUrl()` whitelist |
| H-15 | Fabricated `MERIT_TRENDS` shown as real data | `university.html` | ✅ Added "Estimated" disclaimer + TODO migration |
| H-21 | `calcAggregate` crashed if `UNI` not yet loaded | `university.html` | ✅ Null guard |
| M-10 | Predictor sort used unparsed `meritMin` (always 50) | `index.html` `mapInstitution` | ✅ `_parseMeritMin()` |
| M-18 | `getDayOfYear` off-by-one + DST drift | `worker/social-worker.js` | ✅ UTC-based |
| M-22 | Missing security headers / CSP | `_headers`, CSP `<meta>` on all HTML | ✅ Added |

## ⚠️ Must run manually in Supabase (cannot be done from frontend code)

**File:** `sql/01-rls-lockdown.sql`

Open Supabase Dashboard → SQL Editor → paste the file → Run.
Then verify with the queries at the bottom of that file and the curl smoke test.

This single migration fixes **C-2** (anon writes) and **C-3** (admin email impersonation).

## ⚠️ Must configure manually in Cloudflare

### Chat worker (api.taleempk.pk)
1. Create a KV namespace:
   `wrangler kv:namespace create CHAT_RL`
2. Bind it in the worker's `wrangler.toml` under `[[kv_namespaces]]` with the id you get back.
3. (Optional) Set `DEBUG = "0"` to make error responses generic.

### Social worker
1. `wrangler secret put TRIGGER_SECRET` — random 32-byte string.
2. Update your bookmarklet / cron caller to send `X-Trigger-Secret: <value>` (or `?key=<value>` query).
3. Add Cloudflare Workers cost cap in dashboard (Workers → Plans → Spending limit).

### Pages (taleempk.pk)
1. Confirm the new `_headers` file is picked up (deploy logs will mention it).
2. Test headers: `curl -I https://taleempk.pk/` — look for `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.

## ⚠️ Must do manually in Supabase Auth dashboard

1. **Force email confirmation:** Auth → Settings → "Enable email confirmations" = ON.
2. **Enable MFA for admin:** sign in as admin → Account → enable TOTP.
3. **Disable unused OAuth providers** to shrink the impersonation surface.
4. **Rotate the anon key** in API settings (Regenerate). Update `config.js`, both HTML files, sitemap script, and the `SUPABASE_ANON_KEY` worker secret. Re-deploy.

## Verification checklist (do before promoting to "production")

- [ ] `sql/01-rls-lockdown.sql` applied; pg_tables shows `rowsecurity=true` for every listed table.
- [ ] Anon `curl` to `/rest/v1/institutions` with insert payload returns 401/403.
- [ ] Admin MFA enrolled.
- [ ] `TRIGGER_SECRET` set; calling `/run-now` without it returns 403.
- [ ] `CHAT_RL` KV bound; 20 rapid POSTs return 429 on the 16th+.
- [ ] `_headers` deployed; `curl -I https://taleempk.pk/` shows the new headers.
- [ ] CSP doesn't break: open the homepage with DevTools, look for console errors. (If any external script is blocked, add its origin to the `script-src` list in the CSP meta.)
- [ ] Stored-XSS test: submit a review containing `<img src=x onerror=alert(1)>` — the page must render it as text, not as an alert.
- [ ] Shared compare link works on a throttled 3G profile.
- [ ] Print/PDF on the compare modal restores the page after Cancel.

## Still recommended (not blockers, but next batch)

- M-20 Sitemap blog posts loaded from DB (currently hardcoded 4)
- M-26 Materialised view for review aggregates
- M-27/28 Persist `voteAnswer` / `markHelpful` to DB instead of client-only
- M-7 Service worker / PWA — currently advertised but not implemented
- M-30 Pick **one** of GA4 or Plausible, not both
- H-7 Re-verify every merit formula in `MERIT_FORMULAS` against the 2024–25 prospectus
- H-1 Build-time injection of the anon key (instead of literal in 5 files)
