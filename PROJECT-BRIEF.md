# TaleemPK — Project Brief (Handover Document)

> Paste this entire file into the first message of a new chat. The AI will instantly have full context and can continue work without re-explanation.

## 🎯 What Is TaleemPK

A live, production AI-powered platform that helps Pakistani students compare universities, find scholarships, and get education guidance. Owner: Muhammad Arslan (agondal121@gmail.com).

## 🌐 Live URLs
- **Main site:** https://taleempk.pk (and https://www.taleempk.pk)
- **Chat API (backend):** https://api.taleempk.pk
- **Admin panel:** https://taleempk.pk/admin.html (admin: agondal121@gmail.com)
- **GitHub repo:** https://github.com/Arslan2116/TaleemPK
- **Old Netlify URL (still deployed but legacy):** https://eclectic-bonbon-f7478f.netlify.app

## 🏗️ Tech Stack
- **Frontend:** Single-page-app style HTML files (index.html ~5,500 lines, university.html, admin.html). Vanilla JS, no framework.
- **Hosting:** Cloudflare (two Workers — `taleempk` for the site, `taleempk-chat` for the API)
- **Database:** Supabase Postgres
  - URL: `https://vpioffkkzwbfnmpxpwgc.supabase.co`
  - anon key is public (in `config.js`, `chat-widget.js`, frontend HTML files)
  - service_role key is private (only in Cloudflare Worker secrets)
- **AI:** Gemini 2.5 Flash via Cloudflare Worker (`worker/chat-worker.js`)
- **Analytics:** Plausible + Google Analytics 4 (ID: G-1T7ZYZFGZ2)
- **Domain registrar:** PKNIC via Hosterpk (Support Pin 60814)

## 📁 Repo Layout
```
C:\Users\User\TaleemPK\
├── index.html              # Main site (5,500+ lines, all features)
├── university.html         # Per-university detail page
├── admin.html              # Admin panel (login-protected)
├── chat-widget.js          # Floating AI chat widget (loaded by index + university)
├── config.js               # Shared Supabase keys + URLs
├── logo.png, og-image.svg, favicon.png
├── robots.txt, sitemap.xml # 222 URLs (218 unis + 4 static)
├── PROJECT-BRIEF.md        # ← THIS FILE
├── worker/
│   ├── chat-worker.js      # Cloudflare Worker — AI chat backend (RAG + Gemini)
│   └── README.md           # Worker deploy guide
└── agent/                  # Local CrewAI agent (gitignored) — not deployed
    ├── taleem_agent.py
    ├── DATA-SPEC.md        # Schema each university should have
    └── .env (private)
```

## 🗄️ Database Schema (Supabase tables)

- **institutions** (218 rows; ~21 with detailed data) — universities + colleges
  - Key fields: id, name, full_name, city, province, sector (public/private/military),
    rank, fee, fee_num, fee_year, fee_note, merit, entry, programs[], tags[],
    scholarships, hostel, established, website, description, highlights[],
    icon, logo_url, data_updated, type (university/college)
- **fee_details** (FK institution_id) — detailed fee breakdown per program/category
- **reviews** (FK institution_id) — student reviews with rating
- **questions** + **answers** (Q&A community feature)
- **scholarships** — 12 verified scholarships (Ehsaas, HEC, PEEF, foreign-funded)
- **blog_posts** — articles (admission guides, exam prep)
- **notes** + **results** — schema ready, content TBD

Row Level Security: public read everywhere; only admin email can write to
institutions/fee_details/scholarships/blog_posts/notes/results. Reviews and
Q&A are insert-public for authenticated users.

## 🎨 Features Already Built

- ✅ 218 universities (21 with detailed agent-verified data)
- ✅ Search + 4 dropdown filters (city, program — 51 categories, scholarship, sort)
- ✅ Type buttons (Public/Private/Engineering/Medical/Business + provinces)
- ✅ Compare up to 3 universities side-by-side
- ✅ Fee Calculator, Admission Predictor, Admission Calendar, Map View
- ✅ Per-university detail page (university.html?id=N) — hero, fee table,
     grouped programs (UG/Graduate/PhD), merit trend chart, reviews, Q&A,
     Similar Universities, breadcrumbs, JSON-LD structured data
- ✅ Login/signup (Supabase Auth)
- ✅ Shared reviews + Q&A (database-backed)
- ✅ Admin panel for adding institutions, blog posts, notes, results, scholarships
- ✅ Blog page (3 articles + admin-added) and dedicated Scholarships page
- ✅ AI Chatbot — TaleemPK Assistant (floating widget bottom-right)
- ✅ Recently Viewed strip on homepage
- ✅ Skeleton loaders + error states
- ✅ "Load More" pagination, "Clear All" filters
- ✅ Top-3 cards gold-gradient border, card star ratings, share + back-to-top
- ✅ Mobile sticky CTA on university page
- ✅ Verified data + "Updated X ago" tags in hero
- ✅ SEO: sitemap.xml (222 URLs), robots.txt, OG image, Twitter cards, JSON-LD
- ✅ Plausible + GA4 analytics

## 🤖 AI Chatbot — TaleemPK Assistant (v3)

- Floating widget bottom-right on index.html + university.html
- Frontend: chat-widget.js (markdown-lite rendering, session memory, suggestions)
- Backend: worker/chat-worker.js (Cloudflare Worker at api.taleempk.pk)
- Model: Gemini 2.5 Flash (env: GEMINI_API_KEY in Worker secrets)
- RAG: pulls institutions + scholarships + recent blog posts from Supabase
- Intent detection: compare / exam / scholarship / career / abroad / recommend / fees / merit / hostel / general
- Covers: universities, entry tests (ECAT/MDCAT/NET/LCAT/NAT/GAT),
  field & career advice, scholarships, study abroad, exam prep, wellbeing
- Cache: 60-second in-memory cache of Supabase data
- Token budget: 1500 output tokens, 12 turns of memory
- Guardrails: no fee/merit hallucination, no medical/legal/investment advice,
  stays on Pakistani education topics, mental-health helpline if needed

## 📊 Universities With Detailed Verified Data (so far)

NUST, LUMS, UET Lahore, IBA Karachi, FAST NUCES, COMSATS, QAU, GIKI, PIEAS,
NED, University of Punjab, AKU, Habib University, Air University, Bahria,
ITU, MUET, UCP, SZABIST, GCU Lahore. (~21 total. The other ~197 have basic
"HEC recognized" placeholder data.)

## 🔄 Data Workflow (current)

1. Owner runs a CrewAI agent locally (in /agent folder, not in repo)
2. Agent scrapes a single university's official website via ScrapeWebsiteTool
3. Returns clean JSON in TaleemPK's schema (DATA-SPEC.md format)
4. Owner pastes the JSON into the chat
5. Assistant produces a Supabase SQL `update institutions set ... where id=X;`
   plus a `delete + insert into fee_details` block
6. Owner runs the SQL in Supabase SQL Editor
7. Site updates live (frontend fetches from DB on every load)

Note: A previous Habib University agent output had hallucinated fees (~half
of real). Always sanity-check before applying.

## ⚙️ Deployment Pipeline

- Push to GitHub `main` → Cloudflare auto-deploys the main-site Worker
- Worker `taleempk-chat` is updated manually by editing code in Cloudflare
  dashboard and clicking Save and Deploy (Worker code lives at
  worker/chat-worker.js in the repo as the source of truth)

## 🧰 Known Issues / Tech Debt

1. **index.html is 5,500+ lines** — CSS, JS, HTML all inline.
   Future sprint: split into styles.css + app.js (planned, deferred).
2. **165 inline `onclick=` handlers** — refactor to event delegation eventually.
3. **69 inline `style="..."`** attributes — should be CSS classes.
4. **Habib University fees** in DB are placeholder; agent gave wrong numbers
   so we did NOT apply them. Manual update needed when verified.
5. **Most data updates are manual** — automation system not built yet
   (Owner chose to defer; agent isn't 100% reliable yet).
6. **Old Netlify URL** still deployed — should redirect to taleempk.pk.

## 🚀 Next Priorities (Owner's roadmap)

1. Add detailed data for more universities (currently 21/218)
2. Upload real logos to Supabase Storage (logos bucket) and update logo_url
3. Submit sitemap to Google Search Console
4. Set up Instagram / Facebook / X social accounts
5. Eventually: GitHub Actions automation for weekly data sync (PR-review style)

## 🔑 Where To Find Things

- **Supabase project:** "Taleempk" under agondal121@gmail.com
- **Cloudflare account:** agondal121@gmail.com — Workers: `taleempk`, `taleempk-chat`
- **GitHub:** Arslan2116/TaleemPK (push triggers Cloudflare deploy)
- **Domain:** taleempk.pk via Hosterpk (PKNIC). Nameservers: princess.ns.cloudflare.com / roman.ns.cloudflare.com
- **WhatsApp (admin):** +92 335 3303999 — used for merit-data submissions
- **Admin login:** agondal121@gmail.com / [password known only to owner]

## 💬 Style For The Owner

- Communicate in Roman Urdu + English mix (he writes that way)
- Keep replies concise and action-oriented
- When proposing SQL or code changes, give exact paste-ready blocks
- Verify big claims (fees, merit %) — never invent numbers, always cite source
- Watch for hallucinated agent output (Habib bug burned us once)

---

## How To Use This File In A New Chat

1. Open a new chat with an AI assistant.
2. Send: "Here is the complete state of my project. Please use this as
   context and continue helping me." Then paste this entire file.
3. After it acknowledges, give your next task naturally. It will have
   the full picture.

Keep this file updated as the project evolves (especially the
"Universities With Detailed Verified Data" and "Next Priorities" sections).
