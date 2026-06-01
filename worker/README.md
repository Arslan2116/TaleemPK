# TaleemPK Assistant — Cloudflare Worker setup

This Worker is the backend for the AI chatbot. It securely talks to Gemini
using your API key (kept as a Cloudflare secret) and retrieves relevant
university data from Supabase before answering.

## One-time setup (5 minutes)

1. Go to **dash.cloudflare.com** → left sidebar → **Workers & Pages**
2. Click **Create application** → **Create Worker**
3. Name it: `taleempk-chat`
4. Click **Deploy** (it deploys a Hello World; we'll replace it)
5. Click **Edit code** (top right)
6. Open `chat-worker.js` from this folder and **paste its contents** into the editor
7. Click **Save and deploy**
8. Go to the Worker's **Settings → Variables and Secrets**
9. Add these three secrets (click "Add" → choose type "Secret"):
   - `GEMINI_API_KEY` — your key from https://aistudio.google.com/app/apikey
   - `SUPABASE_URL` — `https://vpioffkkzwbfnmpxpwgc.supabase.co`
   - `SUPABASE_ANON_KEY` — paste the same anon key already in your frontend
10. Re-deploy once after adding secrets so they take effect
11. Copy the Worker's URL (looks like `https://taleempk-chat.<your-username>.workers.dev`)
12. Send that URL back so we can wire the chat widget to it

## Free tier limits
- Cloudflare Workers: 100,000 requests/day (way more than enough)
- Gemini 2.0 Flash: 60 requests / minute (1500 requests / day on free tier)
- If you outgrow either, both have very cheap paid tiers.
