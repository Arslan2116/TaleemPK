# TaleemPK — Operations Runbook

Quick reference for the things you'll need to do periodically or in an
incident. Keep this in the repo so the steps stay versioned with the code.

---

## 1. Rotating the Supabase `anon` key (H-1)

Do this **once per year** as routine hygiene, or **immediately** if you
think the key has leaked (e.g. accidental Pastebin/Discord/screenshot).

> The anon key is intentionally public — RLS is the real authorisation
> layer (verified by the SQL in `sql/01-rls-lockdown.sql`). Rotating
> isn't an emergency, but stale keys clutter logs and complicate
> attribution.

### Steps

1. **Generate the new key in Supabase**
   - Dashboard → Settings → API → click **"Regenerate"** next to the
     anon public key.
   - Copy the new JWT (starts with `eyJhbGciOi…`).
2. **Update the 5 places it lives in the repo**
   - `config.js` (frontend config object)
   - `index.html` (look for `const SUPABASE = {`)
   - `university.html` (look for `const SB_KEY =`)
   - `admin.html` (look for `const SB_KEY =`)
   - `generate-sitemap.js` (look for `const SUPABASE_ANON_KEY =`)
   - Use search-and-replace; the old key starts with
     `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS…`
3. **Update the Worker secret** (the chat worker calls Supabase from
   the server side):
   ```powershell
   cd C:\Users\User\TaleemPK\worker
   wrangler.cmd secret put SUPABASE_ANON_KEY
   # paste the new value when prompted
   ```
4. **Commit + push** to trigger Cloudflare Pages rebuild.
5. **Verify** the front-end smoke test still works after deploy:
   ```bash
   curl -X POST "https://vpioffkkzwbfnmpxpwgc.supabase.co/rest/v1/institutions" \
     -H "apikey: <NEW KEY>" \
     -H "Authorization: Bearer <NEW KEY>" \
     -H "Content-Type: application/json" \
     -d '{"name":"x","full_name":"y"}'
   # Expect 401/403 — RLS still blocks anon writes.
   ```
6. **Revoke nothing manually** — Supabase invalidates the old key the
   moment you regenerate.

### Better long-term

Migrate the key to a single build-time placeholder (e.g.
`__SUPABASE_ANON_KEY__`) replaced by a Cloudflare Pages build step or a
tiny `/api/config` worker that returns the key fresh. This way rotation
becomes one secret update, not five file edits.

---

## 2. Merit formula sanity check (H-7)

Every March, before the new admission cycle starts, re-verify each
formula in `MERIT_FORMULAS` (both `index.html` and `university.html`)
against the **current** prospectus.

### The high-impact ones

| University | Where it's documented | Last known weighting |
|---|---|---|
| NUST       | nust.edu.pk → Admissions → Merit calculation       | 75 % NET + 15 % FSc + 10 % Matric |
| UET Lahore | uet.edu.pk → Admissions notice                      | 70 % ECAT + 30 % FSc (no matric in 2024) |
| GIKI       | giki.edu.pk → Undergraduate admission criteria      | 70 % test + 30 % FSc |
| FAST       | nu.edu.pk → Admissions FAQ                          | 50 % NU-Test + 50 % FSc |
| PIEAS      | pieas.edu.pk → BS admission                         | 75 % test + 25 % FSc |
| LUMS       | lums.edu.pk → Admissions                            | SAT / LCAT-driven (no aggregate formula) |
| IBA        | iba.edu.pk → Admissions                             | IBA Aptitude + Math + English (no aggregate) |
| PMC unis (MBBS) | pmc.gov.pk → Admission policy                  | 50 % MDCAT + 40 % FSc + 10 % Matric |

### Procedure

1. Visit each official site for the current year.
2. Compare weights against the values in:
   - `index.html` → `const MERIT_FORMULAS = [`
   - `university.html` → `const MERIT_FORMULAS = {`
3. If any weight changed, update **both** files (they have a hand-coded
   intentional duplication so the per-uni page and the main calculator
   agree).
4. Smoke test with the previous year's known top student: their inputs
   should produce an aggregate ≥ that year's published closing merit.

---

## 3. Cloudflare Pages deployment

Deploys happen automatically on `git push origin main`. To check status:

- Cloudflare Dashboard → Workers & Pages → `taleempk` → Deployments
- Should show "Success" within 60–90 s of push.
- Stuck deployment? Check the build log; usually a missing static file.

To trigger a manual rebuild without a new commit, click **"Retry
deployment"** on the latest entry.

---

## 4. Worker secrets reference

Both workers use these. To list configured secrets:

```powershell
cd C:\Users\User\TaleemPK\worker
wrangler.cmd secret list --name taleempk-chat
wrangler.cmd secret list --name taleempk-social   # only if deployed
```

| Secret name           | Used by         | Where to get it |
|-----------------------|-----------------|---|
| `GEMINI_API_KEY`      | chat, social    | https://aistudio.google.com/app/apikey |
| `SUPABASE_URL`        | chat, social    | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY`   | chat, social    | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY`| social only     | Supabase Dashboard → Settings → API → **service_role** (never put in frontend) |
| `TRIGGER_SECRET`      | social only     | Generate with `openssl rand -hex 32` or PowerShell snippet in SECURITY-AUDIT-FIXES.md |
| `FB_PAGE_ID`          | social only     | developers.facebook.com |
| `FB_PAGE_ACCESS_TOKEN`| social only     | Long-lived page token |
| `IG_USER_ID`          | social only     | Instagram Business connected to FB page |
| `TWITTER_*` (4 secrets) | social only   | Twitter Developer Portal |

---

## 5. Incident: site defaced / weird data

1. **Verify RLS is on** — run in Supabase SQL editor:
   ```sql
   select tablename, rowsecurity
   from pg_tables where schemaname='public';
   ```
   Anything `false` → re-apply `sql/01-rls-lockdown.sql`.
2. **Check admin_users** — only your user_id should be there:
   ```sql
   select au.user_id, u.email
   from admin_users au join auth.users u on u.id = au.user_id;
   ```
3. **Audit recent inserts** — look for unusual rows:
   ```sql
   select id, name, created_at from institutions order by created_at desc limit 20;
   ```
4. **Delete malicious content** from the SQL editor (RLS only restricts
   from API — you have direct DB access in the editor).
5. **If anything looks like an XSS payload** in reviews/Q&A: the saved
   string is harmless because the front-end now escapes it on render
   (audit fix C-1). But still delete to keep the data clean.

---

## 6. Incident: chat worker billing spike

1. Check Gemini console: https://aistudio.google.com/app/apikey →
   look at "Usage" for the last 24h.
2. Cloudflare Dashboard → `taleempk-chat` → Metrics — look for a
   request-count spike.
3. If a single IP is abusing, the KV rate limiter (`CHAT_RL` binding)
   should already be capping at 15/minute. Verify it's still bound:
   Workers & Pages → `taleempk-chat` → Bindings.
4. Tighten if needed: edit `worker/chat-worker.js` → `RATE_PER_MIN`,
   re-deploy.
5. If it's the Gemini key itself that's been exfiltrated (you used
   it elsewhere by mistake), rotate it in AI Studio and update the
   worker secret.

---

## 7. Routine cadence

| Cadence | Task |
|---|---|
| Every push  | Cloudflare Pages auto-deploys |
| Weekly      | Review Supabase Logs → Auth → look for unusual sign-ups |
| Monthly     | Run `node generate-sitemap.js` if blog count changed a lot, commit, push (or wire to CI later) |
| Quarterly   | Glance at Cloudflare worker metrics; review chat error rate |
| Yearly      | Rotate Supabase anon key (Section 1) and re-verify merit formulas (Section 2) |
