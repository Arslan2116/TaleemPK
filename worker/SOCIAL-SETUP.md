# TaleemPK Social Media Auto-Poster — Complete Setup Guide

Ye system daily 9:00 AM PKT pe:
1. **Branded 1080×1080 image generate** karta hai (university card / scholarship / tips)
2. **Facebook Page** pe post karta hai (image + caption)
3. **Instagram Business** pe post karta hai (same image + caption)
4. **Twitter/X** pe tweet karta hai (text only)

Content automatically rotate hota hai: University → Tips → Scholarship → Deadline

---

## Step 1 — Supabase Storage Bucket banana

Images yahan store hongi. Ek baar setup karo:

1. **supabase.com** → apna project kholo
2. Left sidebar → **Storage** → **New Bucket**
3. Bucket name: `social-images`
4. **Public bucket** ON karo ✅
5. Create karo

Ab **SUPABASE_SERVICE_KEY** chahiye (service_role key — anon key se alag):
- Project Settings → API → `service_role` key copy karo
- Ye key PRIVATE hai — sirf Cloudflare Worker ke secrets mein daalna

---

## Step 2 — Facebook Page Access Token

1. Go to: **https://developers.facebook.com/tools/explorer/**
2. Apna Facebook App select karo (agar nahi hai → **Create App** → Consumer type)
3. **Generate Access Token** → ye permissions add karo:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
4. Short-lived token milega → Long-lived banao:

```
https://graph.facebook.com/v19.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id=YOUR_APP_ID
  &client_secret=YOUR_APP_SECRET
  &fb_exchange_token=SHORT_LIVED_TOKEN
```

Browser mein ye URL open karo → `access_token` milega (60 days valid)

5. **FB_PAGE_ID** = Facebook Page ka numeric ID
   - Page → About → scroll down → "Page ID"

---

## Step 3 — Instagram Business Account ID

1. Facebook Page se Instagram linked hona chahiye
2. Graph API Explorer mein:
   ```
   GET /me/accounts?fields=id,name,instagram_business_account
   ```
3. Response mein: `instagram_business_account.id` → ye hai **IG_USER_ID**

---

## Step 4 — Twitter/X API Keys

1. **https://developer.twitter.com/en/portal/dashboard**
2. App create karo → **App Settings → Keys and Tokens**:
   - `API Key` → **TWITTER_API_KEY**
   - `API Key Secret` → **TWITTER_API_SECRET**
   - `Access Token` → **TWITTER_ACCESS_TOKEN**
   - `Access Token Secret` → **TWITTER_ACCESS_SECRET**
3. App permissions: **Read and Write** (zaroori!)
4. Free tier: 1500 tweets/month = daily ke liye kaafi ✅

---

## Step 5 — Wrangler CLI se Deploy karna

*(Ye ek baar karna hai — phir Cloudflare auto-run karta rahega)*

```bash
# Node.js install hona chahiye (nodejs.org se)

# Worker folder mein jao
cd C:\Users\User\TaleemPK\worker

# Dependencies install karo
npm install

# Cloudflare account se login
npx wrangler login
# Browser khulega → Allow karo

# Deploy karo
npm run deploy
```

Deploy success hone pe URL milega:
```
https://taleempk-social.YOUR-USERNAME.workers.dev
```

---

## Step 6 — Secrets add karna

```bash
# Ek ek kar ke ye commands run karo
# Har command ke baad value type karo aur Enter

npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_KEY
npx wrangler secret put FB_PAGE_ID
npx wrangler secret put FB_PAGE_ACCESS_TOKEN
npx wrangler secret put IG_USER_ID
npx wrangler secret put TWITTER_API_KEY
npx wrangler secret put TWITTER_API_SECRET
npx wrangler secret put TWITTER_ACCESS_TOKEN
npx wrangler secret put TWITTER_ACCESS_SECRET
```

Ya Cloudflare Dashboard se bhi add kar sakte ho:
Worker → **Settings** → **Variables and Secrets** → Add

| Secret | Value |
|---|---|
| `GEMINI_API_KEY` | aistudio.google.com se |
| `SUPABASE_URL` | `https://vpioffkkzwbfnmpxpwgc.supabase.co` |
| `SUPABASE_ANON_KEY` | config.js wala |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role |
| `FB_PAGE_ID` | Facebook Page ID |
| `FB_PAGE_ACCESS_TOKEN` | Step 2 ka long-lived token |
| `IG_USER_ID` | Step 3 ka Instagram ID |
| `TWITTER_API_KEY` | Step 4 se |
| `TWITTER_API_SECRET` | Step 4 se |
| `TWITTER_ACCESS_TOKEN` | Step 4 se |
| `TWITTER_ACCESS_SECRET` | Step 4 se |

---

## Step 7 — Cron Trigger set karna

Cloudflare Dashboard → Worker → **Settings** → **Triggers** → **Add Cron**:
```
0 4 * * *
```
= Every day 9:00 AM Pakistan Time ✅

---

## Step 8 — Test karo

### Image preview (browser mein):
```
https://taleempk-social.YOUR-USERNAME.workers.dev/preview-image
```
Agar branded NUST card PNG dikhti hai → image generation kaam kar raha hai ✅

### Full post test:
```
https://taleempk-social.YOUR-USERNAME.workers.dev/run-now
```
JSON response check karo:
```json
{
  "success": true,
  "results": {
    "facebook":  { "ok": true, "id": "..." },
    "instagram": { "ok": true, "id": "..." },
    "twitter":   { "ok": true, "id": "..." }
  }
}
```

---

## Daily Post Schedule

| Content Type | When | Image |
|---|---|---|
| 🏛️ University Spotlight | Day 1, 5, 9... | University card (name, fee, rank, merit) |
| 💡 Tips & Advice | Day 2, 6, 10... | Tips card (4 numbered tips) |
| 🎓 Scholarships | Day 3, 7, 11... | Scholarship list card |
| 📅 Admission Deadlines | Day 4, 8, 12... | Urgent deadlines card |

---

## Troubleshooting

**Image nahi ban rahi?**
- `resvg-wasm` WASM load ho raha hai CDN se — internet connection check karo
- `/preview-image` endpoint try karo

**Supabase upload fail?**
- `social-images` bucket PUBLIC hona chahiye
- `SUPABASE_SERVICE_KEY` anon key nahi, service_role key honi chahiye

**Facebook/Instagram error?**
- Token 60 din mein expire hota hai — refresh karo
- App mein permissions dobara check karo

**Twitter 401?**
- App permissions "Read and Write" honi chahiye
- Permissions change kare ke baad tokens regenerate karo

**Wrangler login nahi ho raha?**
- `npx wrangler login` — browser mein approve karo
- VPN off karo agar on hai
