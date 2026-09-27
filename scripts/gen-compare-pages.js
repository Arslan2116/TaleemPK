#!/usr/bin/env node
/* ───────────────────────────────────────────────────────────────
   Generate the "<A> vs <B>" comparison landing pages.

   Reads the UNIVERSITIES seed (which sync-uni-data.py generates from Supabase),
   picks pairs a student would plausibly search for, and writes one static page
   per pair at the repo root, matching the hand-written pages that already exist.

   The CSS and page shell are copied from nust-vs-giki.html — that file stays the
   reference design. Hand-written pages are never overwritten.

     node scripts/gen-compare-pages.js          # write pages
     node scripts/gen-compare-pages.js --dry    # list what it would write

   Afterwards: add the new URLs to sitemap.xml (the script prints them).
   ─────────────────────────────────────────────────────────────── */
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY  = process.argv.includes('--dry');

// ── Load the seed array out of uni-data.js ──
const seed = fs.readFileSync(path.join(ROOT, 'uni-data.js'), 'utf8');
const a = seed.indexOf('const UNIVERSITIES'), b = seed.indexOf('const DATA_UPDATES');
if (a < 0 || b < 0) { console.error('Could not find UNIVERSITIES in uni-data.js'); process.exit(1); }
let UNIVERSITIES;
eval(seed.slice(a, b).replace('const UNIVERSITIES', 'UNIVERSITIES'));

// Same slug rule the /university/<slug> pages are generated with
const slug = n => (n || '').toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc  = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonEsc = s => JSON.stringify(String(s == null ? '' : s)).slice(1, -1);

// ── Which universities are worth a comparison page ──
// A page only earns its place if both sides have real numbers to compare; a table
// of "Check university website" helps nobody and reads as thin content to Google.
// 186 of 270 rows carry a literal "—" for seats, so a plain truthiness check is not
// enough to tell "we have this" from "we don't".
const PLACEHOLDER = /^\s*(|—|-|–|n\/?a|tbd|unknown)\s*$/i;
const has = v => v != null && !PLACEHOLDER.test(String(v));

const NO_FEE = /check\s+university\s+website/i;
const usable = UNIVERSITIES.filter(u =>
  has(u.name) && has(u.full) && has(u.city) && has(u.established) &&
  has(u.fee) && !NO_FEE.test(u.fee) &&
  has(u.merit) && (u.programs || []).length &&
  // Obscure pairs used to produce tables that were a third em-dashes — thin content,
  // and no help to anyone. Seats is deliberately not required: only 33 universities
  // publish it, so that row is dropped per page instead (see rows() below).
  has(u.entry) && has(u.scholarships) && has(u.hostel)
);

// Broad categories a student actually chooses between
const CATS = ['engineering', 'medical', 'cs', 'business'];
const catsOf = u => CATS.filter(c => (u.tags || []).includes(c));
const cityOf = u => (u.city || '').split('/')[0].split(',')[0].trim().toLowerCase();

// ── Pair selection ──
// Three kinds of pair get searched: same-tier rivals, same-city rivals, and the
// famous cross-city names. Rank is the tier proxy (only the notable ~30 carry one).
// A distance-learning university and a campus one are not a real choice a student
// weighs — "NUST vs AIOU" helps nobody. They pair only with each other.
const isDistance = u => (u.tags || []).includes('distance-learning');
const comparable = (x, y) => isDistance(x) === isDistance(y);

const pairs = new Map();
// Better-known university first — it matches the hand-written pages (nust-vs-lums,
// not lums-vs-nust) and the way people actually type the query.
const addPair = (x, y, why) => {
  if (x.id === y.id || !comparable(x, y)) return;
  const rx = x.rank || 999, ry = y.rank || 999;
  const [p, q] = rx !== ry ? (rx < ry ? [x, y] : [y, x])
                           : (x.name.toLowerCase() < y.name.toLowerCase() ? [x, y] : [y, x]);
  const key = `${slug(p.name)}-vs-${slug(q.name)}`;
  if (!pairs.has(key) && !pairs.has(`${slug(q.name)}-vs-${slug(p.name)}`)) pairs.set(key, { a: p, b: q, why });
};

const ranked = usable.filter(u => u.rank).sort((x, y) => x.rank - y.rank);
for (let i = 0; i < ranked.length; i++) {
  for (let j = i + 1; j < ranked.length; j++) {
    const [x, y] = [ranked[i], ranked[j]];
    const sharesCat  = catsOf(x).some(c => catsOf(y).includes(c));
    const sameCity   = cityOf(x) === cityOf(y);
    const closeRank  = Math.abs(x.rank - y.rank) <= 8;
    if ((sharesCat && closeRank) || (sameCity && sharesCat) || Math.abs(x.rank - y.rank) <= 4) addPair(x, y, 'ranked');
  }
}
// Same city + same category, beyond the ranked set — this is where the long tail lives
const byCityCat = {};
usable.forEach(u => catsOf(u).forEach(c => (byCityCat[`${cityOf(u)}|${c}`] ||= []).push(u)));
Object.values(byCityCat).forEach(group => {
  const g = group.slice().sort((x, y) => (x.rank || 999) - (y.rank || 999)).slice(0, 6);
  for (let i = 0; i < g.length; i++)
    for (let j = i + 1; j < Math.min(g.length, i + 4); j++) addPair(g[i], g[j], 'city');
});

// Never touch a page somebody wrote by hand
const handWritten = new Set();
fs.readdirSync(ROOT).filter(f => /-vs-.*\.html$/.test(f)).forEach(f => {
  const name = f.replace(/\.html$/, '');
  handWritten.add(name);
  // …and the reverse spelling, so we never publish the same comparison at two URLs
  const m = name.match(/^(.+)-vs-(.+)$/);
  if (m) handWritten.add(`${m[2]}-vs-${m[1]}`);
});
const generatedMark = '<!-- generated by scripts/gen-compare-pages.js -->';
for (const name of [...handWritten]) {
  const file = path.join(ROOT, name + '.html');
  if (!fs.existsSync(file)) continue;                            // reverse spelling, no file
  if (fs.readFileSync(file, 'utf8').includes(generatedMark)) {   // ours: safe to rewrite
    handWritten.delete(name);
    const m = name.match(/^(.+)-vs-(.+)$/);
    if (m) handWritten.delete(`${m[2]}-vs-${m[1]}`);
  }
}

// ── Page template ──
const STYLE = fs.readFileSync(path.join(ROOT, 'nust-vs-giki.html'), 'utf8')
  .match(/<style>[\s\S]*?<\/style>/)[0];

// A row is written only if at least one side has something real to say
function row(label, x, y) {
  if (!has(x) && !has(y)) return null;
  return `      <tr><th>${esc(label)}</th><td>${has(x) ? esc(x) : '—'}</td><td>${has(y) ? esc(y) : '—'}</td></tr>`;
}

function page(key, A, B) {
  const url   = `https://taleempk.pk/${key}`;
  const title = `${A.name} vs ${B.name} — Fees, Merit & Comparison ${new Date().getFullYear()} | TaleemPK`;
  const desc  = `${A.name} vs ${B.name}: compare fees, merit, programs, and admissions side by side. `
              + `${A.full} vs ${B.full} — which is better for you?`;
  const sector = u => u.type === 'public' ? 'Public' : 'Private';

  const faqs = [
    { q: `Is ${A.name} better than ${B.name}?`,
      a: `Both ${A.full} and ${B.full} are HEC-recognized universities. ${A.name} is ${sector(A).toLowerCase()} `
       + `(est. ${A.established || 'n/a'}) in ${A.city}, while ${B.name} is ${sector(B).toLowerCase()} `
       + `(est. ${B.established || 'n/a'}) in ${B.city}. The better choice depends on your field, budget, and merit — `
       + `compare the details above.` },
    { q: `What is the fee difference between ${A.name} and ${B.name}?`,
      a: `${A.name}'s fee is approximately ${A.fee} per semester, while ${B.name}'s is ${B.fee}. `
       + `See the full comparison above.` },
    { q: `What is the merit for ${A.name} and ${B.name}?`,
      a: `${A.name}: ${A.merit}. ${B.name}: ${B.merit}.` },
  ];

  const ld = {
    breadcrumb: {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
      {'@type':'ListItem','position':1,'name':'Home','item':'https://taleempk.pk/'},
      {'@type':'ListItem','position':2,'name':`${A.name} vs ${B.name}`,'item':url}]},
    faq: {'@context':'https://schema.org','@type':'FAQPage','mainEntity':faqs.map(f=>(
      {'@type':'Question','name':f.q,'acceptedAnswer':{'@type':'Answer','text':f.a}}))}
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
${generatedMark}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="https://taleempk.pk/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<link rel="icon" type="image/png" href="/favicon.png">
<meta name="theme-color" content="#0A1628">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1T7ZYZFGZ2"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-1T7ZYZFGZ2');</script>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(ld.breadcrumb)}</script>
<script type="application/ld+json">${JSON.stringify(ld.faq)}</script>
${STYLE}
</head>
<body>
<nav><a class="logo" href="/">Taleem<span>PK</span></a><a class="home" href="/">← All Universities</a></nav>
<div class="hero">
  <div class="crumbs"><a href="/">Home</a> › ${esc(A.name)} vs ${esc(B.name)}</div>
  <h1>${esc(A.name)}<span class="vs">vs</span>${esc(B.name)}</h1>
  <p class="intro">Comparing <b>${esc(A.full)}</b> and <b>${esc(B.full)}</b> side by side — fees, merit, programs, and admissions. Both are HEC-recognized universities in Pakistan.</p>
</div>
<main>
  <table>
    <thead><tr><th></th><th>${esc(A.name)}<br><a class="uni-link" href="/university/${slug(A.name)}" style="color:#9BE6BC">View profile →</a></th><th>${esc(B.name)}<br><a class="uni-link" href="/university/${slug(B.name)}" style="color:#9BE6BC">View profile →</a></th></tr></thead>
    <tbody>
${[
  row('Full Name',           A.full, B.full),
  row('City',                A.city, B.city),
  row('Sector',              sector(A), sector(B)),
  row('Established',         A.established || '—', B.established || '—'),
  row('Fee / Semester',      A.fee, B.fee),
  row('Merit / Eligibility', A.merit, B.merit),
  row('Entry Test',          A.entry || '—', B.entry || '—'),
  row('Seats',               A.seats || '—', B.seats || '—'),
  row('Scholarships',        A.scholarships || '—', B.scholarships || '—'),
  row('Hostel',              A.hostel || '—', B.hostel || '—'),
  row('Total Programs',      (A.programs || []).length, (B.programs || []).length),
].filter(Boolean).join('\n')}
    </tbody>
  </table>
  <section class="faq">
    <h2>Frequently Asked Questions</h2>
    ${faqs.map(f => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('')}
  </section>
  <div class="cta">
    <h2>Compare more universities</h2>
    <p>Add up to 3 universities and see them side by side, or use the Admission Predictor.</p>
    <a href="/?action=predictor">Try the Admission Predictor →</a>
  </div>
</main>
<footer>© ${new Date().getFullYear()} TaleemPK · <a href="/">Compare ${UNIVERSITIES.length}+ Universities in Pakistan</a></footer>
</body>
</html>
`;
}

// ── Write ──
let written = 0, skipped = 0;
const urls = [];
for (const [key, { a: A, b: B }] of pairs) {
  if (handWritten.has(key)) { skipped++; continue; }
  urls.push(`https://taleempk.pk/${key}`);
  if (!DRY) fs.writeFileSync(path.join(ROOT, key + '.html'), page(key, A, B));
  written++;
}
// ── Internal links ──
// Without this the comparison pages are orphans: in the sitemap, linked from nowhere.
// university.js reads this index and renders a "Compare with" block on each profile,
// which is the page a visitor is on when the comparison is actually useful.
const index = {};
const everyPair = [...pairs.entries()];
fs.readdirSync(ROOT).filter(f => /-vs-.*\.html$/.test(f)).forEach(f => {
  const key = f.replace(/\.html$/, '');
  if (!everyPair.some(([k]) => k === key)) {
    const m = key.match(/^(.+)-vs-(.+)$/);           // hand-written page: keep it linked too
    if (m) {
      const A = UNIVERSITIES.find(u => slug(u.name) === m[1]);
      const B = UNIVERSITIES.find(u => slug(u.name) === m[2]);
      if (A && B) everyPair.push([key, { a: A, b: B }]);
    }
  }
});
for (const [key, { a: A, b: B }] of everyPair) {
  (index[slug(A.name)] ||= []).push({ u: '/' + key, n: B.name });
  (index[slug(B.name)] ||= []).push({ u: '/' + key, n: A.name });
}
Object.values(index).forEach(list => list.sort((x, y) => x.n.localeCompare(y.n)));

console.log(`${DRY ? 'would write' : 'wrote'} ${written} pages · skipped ${skipped} hand-written · ${usable.length}/${UNIVERSITIES.length} universities had enough data`);
if (DRY) { urls.slice(0, 20).forEach(u => console.log('  ' + u)); }
else {
  fs.writeFileSync(path.join(ROOT, 'compare-index.json'), JSON.stringify(index));
  fs.writeFileSync(path.join(__dirname, 'compare-urls.txt'), urls.join('\n') + '\n');
  console.log(`compare-index.json: ${Object.keys(index).length} universities linked`);
}
