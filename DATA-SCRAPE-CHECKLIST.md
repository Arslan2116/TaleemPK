# TaleemPK — University Scrape Checklist

Exactly what to pull for each university, from official sources only.
This maps 1:1 to the database, so the JSON an agent returns converts
straight into SQL. Pair this with the rules in DATA-SOP.md (never invent,
official source wins, cite the URL + date).

> Output: return ONE JSON object per university in the shape at the bottom.
> Leave anything you can't verify officially as `null` — never guess.

---

## WHERE to look (per field)

| Source page on the official site | What to grab from it |
|---|---|
| **Admissions / Apply** | entry test name, eligibility, admission steps, deadlines, schedule |
| **Fee Structure / Prospectus** | fee per semester, per-credit-hour, one-time charges, fee breakdown |
| **Programs / Departments / Faculties** | full program list (UG / Graduate / PhD) |
| **Merit / Admission Criteria** | weightage formula, minimum marks, closing merit |
| **Financial Aid / Scholarships** | scholarship types and benefits |
| **About / Overview** | founding year, sector, campuses, 1–3 line description |
| **Hostel / Facilities** | hostel availability (skip if no official page — mark null) |

HEC recognition: every uni on TaleemPK is HEC-recognized — the site adds
that automatically. Don't scrape it, but flag if a uni is NOT on the HEC
recognized list (then it shouldn't be added at all).

---

## WHAT to scrape (field by field)

### 1. Identity (rarely changes)
- [ ] `name` — common short name (e.g. "NUST", "DSU"). Must be UNIQUE across
      the site — if two unis share a short form, use distinct ones (e.g. UMW vs UOM).
- [ ] `full_name` — exact official name (match HEC spelling)
- [ ] `sector` — one of: `public` / `private` / `military`
- [ ] `type` — `university` / `college`
- [ ] `city` — main campus city first; multi-campus: `Lahore / Karachi / Islamabad`.
      Fully-online unis: `Online / Nationwide`.
- [ ] `province` — one of: Federal / Punjab / Sindh / KPK / Balochistan / AJK / Gilgit-Baltistan
- [ ] `established` — 4-digit founding year
- [ ] `website` — domain only, no `https://`, no `www`, no trailing slash (e.g. `nust.edu.pk`)

### 2. Money — CHECK EVERY CYCLE (most important)
- [ ] `fee` — display string, a RANGE per semester (e.g. `Rs. 1.2–1.4L/sem`).
      If fees vary a lot by program, use the realistic recurring range and
      explain the spread in `fee_note`.
- [ ] `fee_num` — ONE representative number in rupees for the calculator
      (mid-point of the most-applied program, e.g. `130000`). Must be a real
      number if a fee exists — never 0.
- [ ] `fee_year` — the admission cycle this fee belongs to (e.g. `Fall 2026`,
      `2024-25`, `Spring 2026`). **Never skip — this is the freshness signal.**
- [ ] `fee_note` — caveats: per-credit-hour billing, program variation,
      overseas fees, "first semester higher", etc.
- [ ] `fee_details` — itemised breakdown rows for the "Detailed Fee Structure"
      section. Keep it to ~8–12 useful rows:
      `[{ "label": "Admission Fee (one-time)", "value": "Rs. 15,000" }, …]`
      Good rows: admission fee, security/caution, tuition per credit hour,
      exam fee, and per-semester totals for the main program groups.

### 3. Admissions — CHECK EVERY CYCLE
- [ ] `entry` — entry test name(s) (e.g. `NUST NET`, `ECAT`, `MDCAT`,
      `DSU Admission Test`, `GRE/HAT for grad`). If direct/no test, say so.
- [ ] `merit` — closing merit OR eligibility (e.g. `85%+ aggregate`,
      `60% min FSc`, or the weightage like `50% test + 40% FSc + 10% matric`).
      Mark estimates clearly.
- [ ] `seats` — total seats/year, approximate ok with `~` (e.g. `~2,000/year`).
      Open-enrollment/online: `Open enrollment`.

### 4. Programs
- [ ] `programs` — array of REAL offered degrees, consistent naming
      (`BS Computer Science`, `BBA`, `MBBS`, `BE Civil`, `MS Data Science`,
      `PhD Management`). Combine UG + Graduate + PhD, dedupe across campuses.
      Cap ~30–35 — list the real ones, don't pad.

### 5. Tags — drives the predictor & filters (be accurate)
- [ ] `tags` — lowercase array combining:
      - sector: `public` / `private` / `military`
      - region: `punjab` / `sindh` / `kpk` / `balochistan` / `ajk` / `gilgitbaltistan` / `federal`
      - fields actually offered: `engineering` / `medical` / `cs` / `business` / `sciences` / `arts`
      Example: `["private","sindh","engineering","cs","business","arts"]`
      ⚠️ Wrong field tags = wrong recommendations to students. Tag only fields
      the uni truly offers (check the program list).

### 6. Extras
- [ ] `scholarships` — short summary of types + headline benefit
      (e.g. `Merit, need-based (up to 90% waiver), sibling/employee waivers`).
- [ ] `hostel` — availability (e.g. `Available (separate male/female)`,
      `Day-scholar only`, or `null` if not verifiable / online uni).
- [ ] `description` — 1–3 plain factual sentences (what it's known for + context).
      No marketing fluff, no unverifiable superlatives.
- [ ] `highlights` — 3–5 short factual selling points
      (e.g. `["PEC accredited", "Strong industry links", "Affordable"]`).
- [ ] `logo_url` — optional direct image URL; leave null (site auto-falls back
      to the website favicon).

### 7. Provenance (for the reviewer, not stored)
- [ ] `source_url` — the official admissions/fee page you used
- [ ] `date_checked` — YYYY-MM-DD

---

## DO NOT scrape / store
- HEC recognition status (auto-added) — only flag if NOT recognized
- Phone numbers, emails, addresses beyond city
- Marketing copy, rankings from unofficial sources, student-forum claims
- Anything behind a login or not on an official page

---

## Return JSON template (fill this, null what you can't verify)

```json
{
  "name": "",
  "full_name": "",
  "sector": "public | private | military",
  "type": "university | college",
  "city": "",
  "province": "Federal | Punjab | Sindh | KPK | Balochistan | AJK | Gilgit-Baltistan",
  "established": 0,
  "website": "example.edu.pk",

  "fee": "Rs. X–YK/sem",
  "fee_num": 0,
  "fee_year": "Fall 2026",
  "fee_note": "",
  "fee_details": [
    { "label": "Admission Fee (one-time)", "value": "Rs. 0" },
    { "label": "Tuition (per credit hour)", "value": "Rs. 0" }
  ],

  "entry": "",
  "merit": "",
  "seats": "",

  "programs": ["BS Computer Science", "BBA", "..."],
  "tags": ["public", "punjab", "engineering", "cs"],

  "scholarships": "",
  "hostel": null,
  "description": "",
  "highlights": ["", "", ""],

  "source_url": "https://<official>/admissions",
  "date_checked": "2026-06-25"
}
```

---

## Quick QA before submitting (per uni)
1. Fee reality check — public usually cheap, private higher; count the zeros
   so `fee_num` matches `fee`.
2. `fee_year` set to the current cycle.
3. Tags match the program list (no `engineering` tag without engineering programs).
4. `name` is unique and `website` is domain-only.
5. Anything unverified on an official page → `null`, not a guess.

*Hand the filled JSON back; it converts straight into an UPDATE/INSERT SQL.*
