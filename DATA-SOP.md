# TaleemPK — University Data SOP (for AI agent / researcher)

This is the operating manual for keeping university data accurate. Hand this
whole file to any AI agent or person doing data updates. Follow it field by
field. **Accuracy beats completeness — a wrong fee is worse than a blank one.**

---

## 0. GOLDEN RULES (read first, never break)

1. **Never invent data.** If you can't find a figure on an authoritative source,
   leave it blank or write `Not verified`. Do NOT estimate, guess, or copy from
   a random blog/forum.
2. **Always cite the source** in your working notes (URL + date you checked).
   Put the year in the `fee_year` field so users know how fresh the data is.
3. **Official source wins.** University's own website > HEC > reputable news >
   everything else. Never trust a single Facebook post or unofficial aggregator.
4. **Date everything.** Pakistani fees and merit change every admission cycle.
   A 2022 figure presented as current is misleading and a legal risk.
5. **One university at a time, fully.** Finish all fields for one institution,
   QA it, save it, then move on. Don't half-fill 50 unis.
6. **Match the existing tone.** Descriptions are 1–3 plain sentences, factual,
   no marketing fluff, no superlatives you can't back up.

---

## 1. SOURCE HIERARCHY (where to look, in order)

Use the highest-priority source that has the data. Drop to the next only if the
higher one doesn't publish it.

| Priority | Source | Use it for |
|---|---|---|
| 1 | **University official website** → Admissions / Fee Structure / Prospectus page | Fees, programs, merit, entry test, seats, deadlines, scholarships, hostel |
| 2 | **HEC** (hec.gov.pk) — recognized universities list & rankings | Recognition status, official name, sector, ranking, campus locations |
| 3 | **PMC** (pmc.gov.pk) | Medical/dental colleges, MDCAT policy, MBBS/BDS merit |
| 4 | **PEC** (pec.org.pk) | Engineering program accreditation |
| 5 | **Official entry-test bodies** — NTS, ETEA, university test portals (NUST NET, FAST NU-Test, GIKI test, etc.) | Test names, patterns, weightages |
| 6 | **University official social media** (verified pages only) | Admission OPEN/CLOSED status, deadline dates, merit-list announcements |
| 7 | **Reputable news** (Dawn, Tribune education sections) | Cross-checking only, never the sole source for a number |

**Never use as a primary source:** student forums, random YouTube videos,
unofficial "university comparison" sites, WhatsApp forwards, Wikipedia for fees.

---

## 2. FIELD-BY-FIELD GUIDE

These are the exact fields in the `institutions` table (admin panel maps to them).

### Identity (rarely changes)
| Field | What it is | Where to find | Rules |
|---|---|---|---|
| `name` | Short name (e.g. "NUST") | Official site / HEC | Keep it the commonly-used short form |
| `full_name` | Full legal name | HEC recognized list | Exact official spelling |
| `sector` | `public` / `private` / `military` | HEC | One of these three only |
| `type` | `university` / `college` | HEC | — |
| `city` | Main city/cities | Official site | Multiple campuses: `Lahore / Karachi / Islamabad`. Put the **main/founding campus first** |
| `province` | Federal / Punjab / Sindh / KPK / Balochistan / AJK / Gilgit-Baltistan | HEC | Exact label from this list |
| `established` | Founding year | Official site / HEC | 4-digit year only |
| `website` | Domain only, no `https://` | Official site | e.g. `nust.edu.pk` — no protocol, no www, no trailing slash |
| `rank` | National rank number, 0 if unranked | HEC ranking / your editorial call | Lower = better. Use 0 (not blank) if no rank |

### Money (CHECK EVERY ADMISSION CYCLE)
| Field | What it is | Where to find | Rules |
|---|---|---|---|
| `fee` | Display text, e.g. `Rs. 1.2–1.4L/sem` | Official fee structure PDF | Always a **range per semester**. Use L (lakh) / K notation consistently |
| `fee_num` | A single representative number for the calculator | Same | The **mid-point per semester in rupees** (e.g. 130000). Used by Fee Calculator — must be a real number, not 0, if a fee exists |
| `fee_year` | The cycle the fee belongs to | Same | e.g. `2024-25`. **This is what tells users the data is fresh — never skip it** |
| `fee_note` | Any caveat | Same | e.g. "Engineering programs higher; medical separate" |
| `fee_details` (separate table) | Itemised breakdown rows | Prospectus | Optional. Each row: `label` (e.g. "Admission fee"), `value` (e.g. "Rs. 50,000"), `sort_order` |

> **Fee discipline:** If a uni has wildly different fees per program (e.g. MBBS vs
> BS English), pick the **most-applied-for program's fee** for `fee`/`fee_num` and
> note the variation in `fee_note`. Never average unrelated programs.

### Admissions (CHECK EVERY CYCLE)
| Field | What it is | Where to find | Rules |
|---|---|---|---|
| `entry` | Entry test name | Official admissions page | e.g. `NUST NET`, `ECAT`, `MDCAT`, `IBA Aptitude Test`, `SAT/LCAT`. If interview/SAT-based, say so |
| `merit` | Closing merit / eligibility | Official merit list or admissions criteria | e.g. `85%+ aggregate` or `160+/200 NET`. If only "X% FSc minimum", write that. **Mark estimates clearly** |
| `seats` | Total seats per year | Prospectus | e.g. `~2,000/year`. Approximate is fine if labelled with ~ |
| `programs` | Array of program names | Official programs page | List real offered degrees. Use consistent prefixes: `BS Computer Science`, `BBA`, `MBBS`, `BE Civil`. Don't dump 200 — top ~30 is enough |

> **Merit formula note:** The per-university aggregate calculator uses hardcoded
> weightages in `index.html` (`MERIT_FORMULAS`) and `university.html`. If a uni's
> official formula changed this cycle, flag it — those weightages must be updated
> in code by a developer (see OPS-RUNBOOK.md §2). The agent updates the **text**
> `merit`/`entry` fields; the **formula weights** are a code change.

### Extras
| Field | What it is | Where to find | Rules |
|---|---|---|---|
| `scholarships` | Short scholarship summary | Official financial aid page | e.g. `Need-based + merit; HEC need-based available` |
| `hostel` | Hostel availability | Official site | e.g. `Available (separate male/female)` or `Day-scholar only` |
| `tags` | Array of category tags | Editorial | Lowercase. Use: `public`/`private`/`military`, field tags `engineering`/`medical`/`business`/`cs`/`arts`/`sciences`, region `punjab`/`sindh`/`kpk`/`balochistan`/`ajk`/`gilgitbaltistan`/`federal`. **These drive the predictor filters — be accurate** |
| `description` | 1–3 factual sentences | Official "about" page | Plain, no fluff. What it's known for, founding context |
| `highlights` | Array of 3–4 short selling points | Editorial from facts | e.g. `["PEC accredited", "Strong industry links", "Affordable"]` |
| `logo_url` | Direct image URL (optional) | Official site | If blank, the site falls back to the website favicon automatically |

---

## 3. UPDATE CADENCE (when to touch what)

| Frequency | What to update | Why |
|---|---|---|
| **Each admission cycle (Mar–Sep)** | `fee`, `fee_num`, `fee_year`, `merit`, `entry`, `seats`, deadlines | These change yearly — the core value of the site |
| **When a uni announces admissions open** | Admission status / deadline (Admission Calendar entries) | Time-sensitive, drives traffic |
| **After merit lists publish (Aug–Oct)** | `merit` (closing merit), merit-trend data | Most-searched info |
| **Quarterly** | `programs` (new degrees added), `scholarships` | Slower-changing |
| **Yearly / on event** | `rank`, `description`, `highlights`, `website` | Rarely changes |
| **Yearly (March)** | Re-verify `MERIT_FORMULAS` weightages against prospectus (developer task) | Formula accuracy |

> **Priority order when time is limited:** fees → merit → entry test → deadlines.
> Everything else can wait.

---

## 4. PER-UNIVERSITY RESEARCH CHECKLIST

Copy this for each university you work on. Tick only what you **verified on an
official source today.**

```
University: ____________________     Date checked: __________

SOURCE (paste official admissions/fee URL): ____________________

[ ] full_name matches HEC exactly
[ ] sector / type / province correct
[ ] city — main campus first, all campuses listed
[ ] fee (range/sem) — from official fee structure
[ ] fee_num (mid-point rupees) — real number, not 0
[ ] fee_year — set to current cycle (e.g. 2024-25)
[ ] fee_note — any program-specific caveat
[ ] entry — correct test name
[ ] merit — closing merit OR eligibility, estimate clearly marked
[ ] seats — approximate ok, labelled with ~
[ ] programs — real offered degrees, consistent naming
[ ] tags — field + sector + region, accurate (drives predictor)
[ ] scholarships — short summary
[ ] hostel — availability
[ ] description — 1–3 factual sentences
[ ] website — domain only, no https/www
[ ] highlights — 3–4 short points, all factual

QA: re-read every number. Any that you couldn't source on an official
page → blank it or mark "Not verified". DO NOT GUESS.
```

---

## 5. QUALITY CHECKS BEFORE SAVING

Run these every time:

1. **Reality check the fee.** A public uni at "Rs. 8L/sem" or a private at
   "Rs. 5K/sem" is almost certainly wrong. Public unis are usually far cheaper.
2. **fee_num matches fee.** If `fee` says "1.2–1.4L" then `fee_num` should be
   ~130000, not 13000 or 1300000. Count the zeros.
3. **Tags match reality.** Don't tag a pure arts college as `engineering`. The
   predictor uses tags + programs — wrong tags = wrong recommendations to students.
4. **Programs are real.** No placeholder lists. If you only found 5 real programs,
   list 5, don't pad with generic ones.
5. **No copy-paste artifacts.** Strip stray emojis, weird Unicode, double spaces.
6. **Merit is dated/labelled.** "85%" alone is ambiguous — prefer
   "85%+ aggregate (2024 closing)" or mark as estimate.
7. **Spelling of full_name** matches HEC, not a casual version.

---

## 6. HOW TO ENTER THE DATA

1. Go to **taleempk.pk/admin.html** and log in (admin account only — RLS blocks
   everyone else from writing).
2. **Institutions** tab → fill the form field by field using your verified notes.
3. Tags and programs are **comma-separated** in the form (e.g.
   `public, engineering, punjab`).
4. Save. It appears on the live site immediately.
5. To edit an existing one: the admin panel currently supports add + delete-recent.
   For bulk edits, a developer can update directly in Supabase.

> **Scholarships, blog posts, results, notes** have their own admin tabs — same
> rules apply: official source, no invention, cite in notes.

---

## 7. RED FLAGS — STOP AND DON'T SAVE IF:

- ❌ You found the figure on a forum / WhatsApp / unofficial site only
- ❌ The fee seems off by a factor of 10 (zero-counting error)
- ❌ You're "pretty sure" but can't find the source page again
- ❌ The data is older than the last admission cycle and you're presenting it as current
- ❌ A medical college's MBBS merit looks low (<80%) — double-check, it's usually high
- ❌ Tags don't match the programs you listed

When in doubt: **leave it blank and flag it for human review.** A blank field is
honest; a wrong field damages a student's real decision and the site's credibility.

---

## 8. AGENT PROMPT TEMPLATE (paste this to start a session)

> You are a data researcher for TaleemPK, a Pakistani university comparison
> platform. Your job is to verify and update university data following the rules
> in DATA-SOP.md. For the university I name:
> 1. Find its OFFICIAL website admissions/fee page (cite the URL).
> 2. Extract only the fields in the per-university checklist, from official
>    sources only.
> 3. For anything you can't verify officially, write "Not verified" — never guess.
> 4. Return the data as a filled checklist with the source URL and the date.
> 5. Flag any field where the official formula/policy changed this cycle.
> Start with: [UNIVERSITY NAME]

---

*Keep this file in the repo so every data session uses the same standard.*
*Last reviewed: June 2026.*
