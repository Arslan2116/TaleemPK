#!/usr/bin/env node
/* ───────────────────────────────────────────────────────────────
   Put the real content of a university page into its static HTML.

   Search Console: 546 pages discovered, 29 indexed, 437 not. The university
   pages carried a median of 150 words of static markup — a name, a city, a
   one-line description and a list of programme names — because everything a
   student actually searches for (the fee, the merit formula, the entry test,
   seats, scholarships, hostel) was fetched from Supabase and injected by
   university.js, which replaces #content wholesale. Google crawled 270 pages
   that each looked like the same near-empty template and declined to index
   them. The page types that carry real text — blog at 904 words, the landing
   pages at 536 — are the ones that are indexed and the ones GA shows traffic on.

   This writes those facts into the markup. university.js still replaces the
   block at runtime with live data, so a visitor sees the current figures; the
   difference is that a crawler no longer sees an empty page. The visible FAQ
   is the same five questions already in the page's FAQPage JSON-LD, so the
   structured data now matches what is on the page.

     node scripts/prerender-university-pages.js --dry
     node scripts/prerender-university-pages.js
   ─────────────────────────────────────────────────────────────── */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');
const YEAR = new Date().getFullYear();

const seed = fs.readFileSync(path.join(ROOT, 'uni-data.js'), 'utf8');
const a = seed.indexOf('const UNIVERSITIES'), b = seed.indexOf('const DATA_UPDATES');
let UNIVERSITIES;
eval(seed.slice(a, b).replace('const UNIVERSITIES', 'UNIVERSITIES'));

const slug = n => (n || '').toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PLACEHOLDER = /^\s*(|—|-|–|n\/?a|tbd|unknown)\s*$/i;
const has = v => v != null && !PLACEHOLDER.test(String(v));
const NO_FEE = /check\s+university\s+website/i;
const city1 = u => (u.city || '').split('/')[0].split(',')[0].trim();

const BEGIN = '<!-- prerender:begin -->', END = '<!-- prerender:end -->';

function sec(icon, heading, body, count) {
  if (!body) return '';
  return `
      <div class="sec">
        <div class="sec-head"><div class="icn">${icon}</div><h2>${esc(heading)}`
    + (count ? ` <span class="count">${count}</span>` : '') + `</h2></div>
        ${body}
      </div>`;
}

function build(u) {
  const full = u.full || u.name;
  const c = city1(u);
  const progs = u.programs || [];
  const sector = u.type === 'public' ? 'public' : 'private';
  const out = [];

  // About — the seed's own description, not the generic one line the pages carried
  const about = [
    `<p><strong>${esc(full)}</strong>${u.name !== full ? ` (${esc(u.name)})` : ''} is a ${sector} `
    + `university${c ? ` in ${esc(u.city)}` : ''}, recognised by the Higher Education Commission (HEC) `
    + `of Pakistan${u.established ? `, established in ${esc(u.established)}` : ''}.</p>`,
    has(u.description) ? `<p>${esc(u.description)}</p>` : '',
    (u.highlights || []).length
      ? `<ul>${u.highlights.slice(0, 6).map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : '',
  ].filter(Boolean).join('');
  out.push(sec('📖', `About ${u.name}`, `<div class="desc">${about}</div>`));

  // Fee — the single most searched fact about any university here
  if (has(u.fee) && !NO_FEE.test(u.fee)) {
    const rows = (u.feeDetails || []).filter(d => has(d.value))
      .map(d => `<tr><th>${esc(d.label)}</th><td>${esc(d.value)}</td></tr>`).join('');
    const body = `<div class="desc">`
      + `<p>The fee at ${esc(u.name)} is approximately <strong>${esc(u.fee)}</strong>. `
      + `Fees are revised each intake, so confirm the current figure with the university before you apply.</p>`
      + (rows ? `<table class="pr-table"><tbody>${rows}</tbody></table>` : '')
      + `</div>`;
    out.push(sec('💰', `${u.name} Fee Structure ${YEAR}`, body));
  }

  // Merit and the entry test
  if (has(u.merit) || has(u.entry)) {
    const body = `<div class="desc">`
      + (has(u.merit) ? `<p><strong>Merit / eligibility:</strong> ${esc(u.merit)}</p>` : '')
      + (has(u.entry) ? `<p><strong>Entry test:</strong> ${esc(u.entry)}</p>` : '')
      + (has(u.seats) ? `<p><strong>Seats:</strong> about ${esc(u.seats)}.</p>` : '')
      + `<p>Merit closes at a different level every year, depending on how many apply and how `
      + `the test goes. Treat last year's figures as a guide, not a threshold.</p></div>`;
    out.push(sec('📊', `Merit & Admission Criteria`, body));
  }

  // Programmes — kept as pills, the shape the page already used
  if (progs.length) {
    const pills = progs.map(p => `<span class="pill">${esc(p)}</span>`).join('');
    out.push(sec('📚', 'Programs Offered', `<div class="pills">${pills}</div>`, progs.length));
  }

  if (has(u.scholarships)) {
    out.push(sec('🎓', 'Scholarships & Financial Aid',
      `<div class="desc"><p>${esc(u.scholarships)}</p></div>`));
  }
  if (has(u.hostel)) {
    out.push(sec('🏠', 'Hostel & Campus',
      `<div class="desc"><p>${esc(u.hostel)}</p></div>`));
  }

  // Where it sits — computed per university, so no two pages say the same thing, and
  // it links back to the city and category pages that already rank.
  const peers = (byCity[c] || []).filter(x => x.id !== u.id);
  if (peers.length >= 2) {
    const cityPage = 'universities-in-' + slug(c);
    const cityLink = CITY_PAGES.has(cityPage)
      ? `<a href="/${cityPage}">${esc(c)}</a>` : esc(c);
    const bits = [`<p>${esc(u.name)} is one of ${peers.length + 1} universities on TaleemPK `
      + `in ${cityLink}, and one of ${UNIVERSITIES.filter(x => x.type === u.type).length} `
      + `${sector} institutions listed nationally.</p>`];

    if (u.feeNum) {
      const priced = (byCity[c] || []).filter(x => x.feeNum).sort((x, y) => x.feeNum - y.feeNum);
      const rank = priced.findIndex(x => x.id === u.id);
      if (rank !== -1 && priced.length >= 3) {
        const third = priced.length / 3;
        const band = rank < third ? 'among the more affordable'
                   : rank < third * 2 ? 'in the middle of the range' : 'among the more expensive';
        bits.push(`<p>On fee it sits <strong>${band}</strong> of the ${priced.length} universities `
          + `in ${esc(c)} that publish one — ${rank + 1}${['st','nd','rd'][rank] || 'th'} cheapest.</p>`);
      }
    }
    const cat = Object.keys(CAT_PAGES).find(k => (u.tags || []).includes(k));
    if (cat) bits.push(`<p>Browsing by field instead? See `
      + `<a href="/${CAT_PAGES[cat]}">all ${cat === 'cs' ? 'computer science' : cat} universities in Pakistan</a>.</p>`);
    out.push(sec('📍', `${u.name} Compared`, `<div class="desc">${bits.join('')}</div>`));
  }

  // The same five questions as the page's FAQPage JSON-LD, so the markup and the
  // structured data say the same thing.
  const qa = [
    [`Is ${full} recognised by HEC?`,
     `Yes. ${full} is recognised by the Higher Education Commission (HEC) of Pakistan`
     + `${u.established ? `, established in ${u.established}` : ''}${c ? ` in ${u.city}` : ''}.`],
    has(u.fee) && !NO_FEE.test(u.fee) ? [`What is the fee structure of ${full}?`,
     `The fee at ${full} is approximately ${u.fee} per semester. See the full breakdown above.`] : null,
    has(u.merit) ? [`What is the merit for admission at ${full}?`,
     `Admission at ${full}: ${u.merit}`] : null,
    has(u.scholarships) ? [`Does ${full} offer scholarships?`, `Yes. ${u.scholarships}`] : null,
    progs.length ? [`What programs are offered at ${full}?`,
     `${full} offers ${progs.length} programmes including ${progs.slice(0, 5).join(', ')} and more.`] : null,
  ].filter(Boolean);
  out.push(sec('❓', 'Frequently Asked Questions',
    `<div class="desc">${qa.map(([q, ans]) =>
      `<p><strong>${esc(q)}</strong><br>${esc(ans)}</p>`).join('')}</div>`));

  return `${BEGIN}${out.join('')}
      ${END}`;
}

// ── Styles the pre-rendered fee table needs (university.css has no table rule) ──
const TABLE_CSS = `
/* ── Pre-rendered fee breakdown (scripts/prerender-university-pages.js) ── */
.pr-table{width:100%;border-collapse:collapse;margin:12px 0 4px;font-size:.88rem;}
.pr-table th{text-align:left;padding:9px 11px;font-weight:600;color:var(--g600,#5A6474);
  width:58%;vertical-align:top;border-top:1px solid var(--g200,#E8ECF2);}
.pr-table td{padding:9px 11px;vertical-align:top;border-top:1px solid var(--g200,#E8ECF2);font-weight:600;}
.pr-table tr:first-child th,.pr-table tr:first-child td{border-top:none;}
@media(max-width:600px){.pr-table{font-size:.8rem;} .pr-table th,.pr-table td{padding:7px 8px;}}
`;
const cssPath = path.join(ROOT, 'university.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.pr-table') && !DRY) {
  fs.writeFileSync(cssPath, css.trimEnd() + '\n' + TABLE_CSS);
  console.log('university.css: pre-render table styles added');
}

// ── Rewrite each page's main column ──
const bySlug = {};
UNIVERSITIES.forEach(u => { bySlug[slug(u.name)] = u; });

// Peers by city, so a page can place the university among the others a student in
// that city is choosing between — real comparative information, different on every
// page, and it links to the city page, which is what already ranks.
const byCity = {};
UNIVERSITIES.forEach(u => { const c = city1(u); if (c) (byCity[c] ||= []).push(u); });
const CITY_PAGES = new Set(fs.readdirSync(ROOT)
  .filter(f => f.startsWith('universities-in-') && f.endsWith('.html'))
  .map(f => f.replace(/\.html$/, '')));
const CAT_PAGES = {
  engineering: 'engineering-universities-in-pakistan',
  medical: 'medical-colleges-in-pakistan',
  cs: 'computer-science-universities-in-pakistan',
  business: 'business-schools-in-pakistan',
};

const words = html => {
  const t = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
  return t.split(/\s+/).filter(Boolean).length;
};

const dir = path.join(ROOT, 'university');
let done = 0, before = [], after = [], missing = [];
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const key = file.replace(/\.html$/, '');
  const u = bySlug[key];
  if (!u) { missing.push(key); continue; }

  const p = path.join(dir, file);
  let html = fs.readFileSync(p, 'utf8');
  before.push(words(html.slice(html.indexOf('<div id="content">'), html.indexOf('<footer'))));

  const block = build(u);
  const re = new RegExp(BEGIN.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&') + '[\\s\\S]*?'
                      + END.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'));
  if (re.test(html)) {
    html = html.replace(re, block);
  } else {
    // First run: replace everything between <div class="main"> and the sidebar
    const i = html.indexOf('<div class="main">');
    const j = html.indexOf('<aside class="sidebar">', i);
    if (i === -1 || j === -1) { missing.push(key + ' (markup not recognised)'); continue; }
    const tail = html.lastIndexOf('</div>', j);            // closes .main
    html = html.slice(0, i + '<div class="main">'.length) + '\n' + block + '\n    '
         + html.slice(tail);
  }
  after.push(words(html.slice(html.indexOf('<div id="content">'), html.indexOf('<footer'))));
  if (!DRY) fs.writeFileSync(p, html);
  done++;
}

const med = arr => { const s = [...arr].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
console.log(`${DRY ? 'would update' : 'updated'} ${done} university pages`);
console.log(`  static words in #content: median ${med(before)} → ${med(after)}`);
console.log(`  smallest page: ${Math.min(...before)} → ${Math.min(...after)}`);
if (missing.length) console.log(`  skipped: ${missing.length} — ${missing.slice(0, 5).join(', ')}`);
