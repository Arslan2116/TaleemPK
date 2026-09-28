#!/usr/bin/env node
/* ───────────────────────────────────────────────────────────────
   Rewrite the <title> and the description/og/twitter meta tags on every
   /university/<slug>.html page, from the seed record matched by EXACT slug.

   Two problems this fixes:

   1. Wrong university. Whatever generated these pages matched by slug PREFIX,
      so "uol" (University of Lahore) also matched uolayyah, uolm and uolor;
      "uos" matched uoshangla and uosa. 19 pages carried another university's
      description — and og:title/twitter:title with it, so a share of the
      Layyah page read "UOL". Matching here is `slug(u.name) === <filename>`.

   2. Truncation. Titles ran to 147 characters (median 85) and Google cuts at
      roughly 60, so "Fee Structure 2026, Merit List & Admissions" — the part
      people actually search — never appeared in the result. Titles now pick
      the longest variant that fits, preferring the full name (what people
      search for a lesser-known university) and falling back to the
      abbreviation (what they search for NUST, LUMS, GIKI).

   The site name is deliberately left off these titles: the 60 characters are
   worth more spent on the university's own name and the intent keywords.

     node scripts/fix-page-meta.js --dry    # report, change nothing
     node scripts/fix-page-meta.js
   ─────────────────────────────────────────────────────────────── */
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY  = process.argv.includes('--dry');
const YEAR = new Date().getFullYear();
const TITLE_MAX = 60, DESC_MAX = 155;

const seed = fs.readFileSync(path.join(ROOT, 'uni-data.js'), 'utf8');
const a = seed.indexOf('const UNIVERSITIES'), b = seed.indexOf('const DATA_UPDATES');
let UNIVERSITIES;
eval(seed.slice(a, b).replace('const UNIVERSITIES', 'UNIVERSITIES'));

const slug = n => (n || '').toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc  = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const city1 = u => (u.city || '').split('/')[0].split(',')[0].trim();
const NO_FEE = /check\s+university\s+website/i;

const bySlug = {};
UNIVERSITIES.forEach(u => { bySlug[slug(u.name)] = u; });

function buildTitle(u) {
  const full = (u.full || u.name || '').trim();
  const abbr = (u.name || '').trim();
  // "University of Layyah Layyah" — skip the city when the name already carries it
  const raw = city1(u);
  const c = raw && !full.toLowerCase().includes(raw.toLowerCase()) ? raw : '';
  const variants = [
    c ? `${full} ${c} — Admission, Fees & Merit ${YEAR}` : `${full} — Admission, Fees & Merit ${YEAR}`,
    `${full} — Admission, Fees & Merit ${YEAR}`,
    `${full} — Fees & Merit ${YEAR}`,
    c ? `${abbr} ${c} — Admission, Fees & Merit ${YEAR}` : `${abbr} — Admission, Fees & Merit ${YEAR}`,
    `${abbr} — Admission, Fees & Merit ${YEAR}`,
    `${abbr} — Fees & Merit ${YEAR}`,
    `${abbr} ${YEAR} Admission`,
  ];
  return variants.find(v => v.length <= TITLE_MAX) || variants[variants.length - 1];
}

function buildDesc(u) {
  const full = (u.full || u.name || '').trim();
  const raw = city1(u);
  const c = raw && !full.toLowerCase().includes(raw.toLowerCase()) ? `, ${raw}` : '';
  const n = (u.programs || []).length;
  const fee = u.fee && !NO_FEE.test(u.fee) ? `fee ${u.fee}, ` : '';
  const variants = [
    `${full}${c}. ${YEAR} admission: ${fee}merit criteria, entry test and ${n} programs. HEC-recognized — compare on TaleemPK.`,
    `${full}${c}. ${YEAR} admission: ${fee}merit criteria and ${n} programs. HEC-recognized.`,
    `${full}${c} — ${YEAR} admission, ${fee}merit and ${n} programs. HEC-recognized.`,
    `${full}${c} — ${YEAR} admission, merit and fee details. HEC-recognized.`,
  ];
  const pick = variants.find(v => v.length <= DESC_MAX) || variants[variants.length - 1];
  return pick.length <= DESC_MAX ? pick : pick.slice(0, DESC_MAX - 1).replace(/[\s,–—-]+$/, '') + '…';
}

// Replace the content="" of one tag, leaving every other attribute untouched
function setMeta(html, matcher, value) {
  const re = new RegExp(`(<meta[^>]*${matcher}[^>]*content=")[^"]*(")`, 'i');
  return re.test(html) ? html.replace(re, `$1${value}$2`) : html;
}

let fixedWrong = 0, shortened = 0, touched = 0, missing = [];
const dir = path.join(ROOT, 'university');
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const key = file.replace(/\.html$/, '');
  const u = bySlug[key];
  if (!u) { missing.push(key); continue; }

  const p = path.join(dir, file);
  let html = fs.readFileSync(p, 'utf8');
  const before = html;

  const oldTitle = (html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1];
  const oldDesc  = (html.match(/name="description"[^>]*content="([^"]*)"/) || [, ''])[1];

  const title = buildTitle(u), desc = buildDesc(u);
  const T = esc(title), D = esc(desc);

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${T}</title>`);
  html = setMeta(html, 'name="description"',        D);
  html = setMeta(html, 'property="og:description"', D);
  html = setMeta(html, 'name="twitter:description"',D);
  html = setMeta(html, 'property="og:title"',       T);
  html = setMeta(html, 'name="twitter:title"',      T);

  if (html !== before) {
    touched++;
    if (oldTitle.length > TITLE_MAX) shortened++;
    // Did the old description name a different university?
    const lead = oldDesc.split(' (')[0].replace(/&amp;/g, '&').trim().toLowerCase();
    const mine = [(u.full || '').toLowerCase(), (u.name || '').toLowerCase()];
    if (lead && !mine.some(m => m && (lead === m || lead.includes(m) || m.includes(lead)))) fixedWrong++;
    if (!DRY) fs.writeFileSync(p, html);
  }
}
console.log(`${DRY ? 'would update' : 'updated'} ${touched} university pages`);
console.log(`  wrong university in the description : ${fixedWrong}`);
console.log(`  titles that were over ${TITLE_MAX} chars      : ${shortened}`);
if (missing.length) console.log(`  no seed record (left alone)        : ${missing.length} — ${missing.slice(0, 6).join(', ')}`);
