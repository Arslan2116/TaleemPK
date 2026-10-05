#!/usr/bin/env node
/* ───────────────────────────────────────────────────────────────
   Roll the admission-cycle year on the hand-written pages.

   About 4,200 places on this site name the cycle year. The university and
   comparison pages take it from new Date().getFullYear() whenever their
   generators run, but the ~30 hand-written landing pages have it baked in, and
   in January a site whose titles all say last year loses to one that says this
   year.

   What it touches:
     - the evergreen root pages (city, province, category landing pages and the
       homepage) — last year's number becomes this year's
     - the academic-year dropdown on the merit submission form, which is a fixed
       list that had gone stale

   What it leaves alone, deliberately:
     - blog/ — an article written in 2026 is still from 2026
     - university/ and *-vs-* — their own generators stamp the year
     - privacy, terms, disclaimer — build-legal-pages.js stamps those
     - any year older than last year — "2024-25" in a dropdown is not a typo

     node scripts/roll-year.js            # roll to the current year
     node scripts/roll-year.js --year 2027
     node scripts/roll-year.js --dry
   ─────────────────────────────────────────────────────────────── */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');
const yArg = process.argv.indexOf('--year');
const YEAR = yArg !== -1 ? parseInt(process.argv[yArg + 1], 10) : new Date().getFullYear();
const PREV = YEAR - 1;

if (!Number.isInteger(YEAR) || YEAR < 2020 || YEAR > 2100) {
  console.error('bad --year'); process.exit(1);
}

const SKIP = new Set(['admin.html', 'privacy.html', 'terms.html', 'disclaimer.html', 'university.html']);
const pages = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.html') && !SKIP.has(f) && !f.includes('-vs-'));

let changed = 0, total = 0;
// Not a year that opens an academic span: "2025-26" is one label, and rolling the
// 2025 inside it produced "2026-26". The dropdown below is rewritten as a whole.
const re = new RegExp(`\\b${PREV}\\b(?!-\\d{2})`, 'g');

for (const f of pages) {
  const p = path.join(ROOT, f);
  let html = fs.readFileSync(p, 'utf8');
  const hits = (html.match(re) || []).length;
  if (!hits) continue;
  html = html.replace(re, String(YEAR));
  total += hits; changed++;
  if (!DRY) fs.writeFileSync(p, html);
  console.log(`  ${f.padEnd(44)} ${hits} × ${PREV} → ${YEAR}`);
}
console.log(`${DRY ? 'would update' : 'updated'} ${changed} pages · ${total} year references`);

// ── The merit form's academic-year list ──
// It is a fixed set of <option>s, so it ages out silently: by 2026 the newest
// choice on offer was still 2024-25, and a student submitting this year's merit
// list had no year to pick.
const idx = path.join(ROOT, 'index.html');
let home = fs.readFileSync(idx, 'utf8');
const sel = home.match(/(<select id="msYear">)([\s\S]*?)(<\/select>)/);
if (sel) {
  const yr = n => `${n}-${String((n + 1) % 100).padStart(2, '0')}`;
  const want = [0, 1, 2].map(i => yr(YEAR - i));
  const have = [...sel[2].matchAll(/value="([^"]+)"/g)].map(m => m[1]);
  if (want.join() !== have.join()) {
    const opts = want.map(v => `\n            <option value="${v}">${v}</option>`).join('') + '\n          ';
    home = home.replace(sel[0], sel[1] + opts + sel[3]);
    if (!DRY) fs.writeFileSync(idx, home);
    console.log(`merit form academic years: ${have.join(', ')} → ${want.join(', ')}`);
  } else {
    console.log('merit form academic years already current');
  }
} else {
  console.log('merit form: #msYear select not found — check index.html');
}
