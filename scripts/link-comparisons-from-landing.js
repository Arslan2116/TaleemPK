#!/usr/bin/env node
/* ───────────────────────────────────────────────────────────────
   Link the comparison pages from the landing pages.

   Search Console: 237 URLs are "Discovered – currently not indexed" — Google has
   the URL and has not crawled it. There are 236 comparison pages. Measuring click
   depth from the homepage over static links only:

     landing      1 click   — indexed
     university   2 clicks
     blog         2 clicks
     comparison   3 clicks  — home → city page → university page → comparison

   Depth 3 is where a site with this little authority stops getting crawled. It is
   not a duplicate-content problem: sampled pairwise similarity across the
   comparison pages averages 27%, so they are genuinely distinct pages that Google
   has simply never fetched.

   This links each comparison from the landing pages whose universities it compares,
   which are depth 1 and already crawled — so the comparison pages become depth 2,
   and the links are relevant to someone reading that page anyway.

     node scripts/link-comparisons-from-landing.js --dry
     node scripts/link-comparisons-from-landing.js
   ─────────────────────────────────────────────────────────────── */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');
const MAX_PER_PAGE = 12;

const seed = fs.readFileSync(path.join(ROOT, 'uni-data.js'), 'utf8');
const a = seed.indexOf('const UNIVERSITIES'), b = seed.indexOf('const DATA_UPDATES');
let UNIVERSITIES;
eval(seed.slice(a, b).replace('const UNIVERSITIES', 'UNIVERSITIES'));

const slug = n => (n || '').toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const city1 = u => (u.city || '').split('/')[0].split(',')[0].trim();

const bySlug = {};
UNIVERSITIES.forEach(u => { bySlug[slug(u.name)] = u; });

// Every comparison page on disk, resolved back to the two universities it compares
const pairs = [];
for (const f of fs.readdirSync(ROOT).filter(f => /-vs-.*\.html$/.test(f))) {
  const key = f.replace(/\.html$/, '');
  for (let i = key.indexOf('-vs-'); i !== -1; i = key.indexOf('-vs-', i + 1)) {
    const x = bySlug[key.slice(0, i)], y = bySlug[key.slice(i + 4)];
    if (x && y) { pairs.push({ key, a: x, b: y }); break; }
  }
}

// Which landing page covers what
const CATEGORY = {
  'engineering-universities-in-pakistan': u => (u.tags || []).includes('engineering'),
  'medical-colleges-in-pakistan':         u => (u.tags || []).includes('medical'),
  'computer-science-universities-in-pakistan': u => (u.tags || []).includes('cs'),
  'business-schools-in-pakistan':         u => (u.tags || []).includes('business'),
  'public-universities-in-pakistan':      u => u.type === 'public',
  'private-universities-in-pakistan':     u => u.type !== 'public',
};
const PROVINCE = {
  'universities-in-punjab': 'Punjab', 'universities-in-sindh': 'Sindh',
  'universities-in-kpk': 'KPK', 'universities-in-balochistan': 'Balochistan',
  'universities-in-federal': 'Federal',
};

function matcher(page) {
  if (CATEGORY[page]) return CATEGORY[page];
  if (PROVINCE[page]) return u => u.province === PROVINCE[page];
  if (page.startsWith('universities-in-')) {
    const want = page.replace('universities-in-', '');
    return u => slug(city1(u)) === want;
  }
  return null;
}

const BEGIN = '<!-- compare-block:begin -->', END = '<!-- compare-block:end -->';
const rank = u => u.rank || 9999;

let touched = 0, totalLinks = 0, skipped = [];
for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  const page = f.replace(/\.html$/, '');
  const match = matcher(page);
  if (!match) continue;

  // Both sides must belong to this page, or the link is not relevant to the reader
  const mine = pairs.filter(p => match(p.a) && match(p.b))
    .sort((x, y) => (rank(x.a) + rank(x.b)) - (rank(y.a) + rank(y.b)))
    .slice(0, MAX_PER_PAGE);
  if (mine.length < 3) { skipped.push(`${page} (${mine.length} relevant)`); continue; }

  const block = `${BEGIN}
<section class="related">
  <h2>Compare these side by side</h2>
  <div class="related-grid">${mine.map(p =>
    `<a href="/${esc(p.key)}">${esc(p.a.name)} vs ${esc(p.b.name)}</a>`).join('')}</div>
</section>
${END}`;

  const file = path.join(ROOT, f);
  let html = fs.readFileSync(file, 'utf8');
  const re = new RegExp(BEGIN.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&') + '[\\s\\S]*?'
                      + END.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'));
  if (re.test(html)) {
    html = html.replace(re, block);
  } else {
    // Before the existing "Explore More" block, so the two sit together
    const at = html.indexOf('<section class="related">');
    if (at === -1) { skipped.push(`${page} (no .related section)`); continue; }
    html = html.slice(0, at) + block + '\n  ' + html.slice(at);
  }
  if (!DRY) fs.writeFileSync(file, html);
  touched++; totalLinks += mine.length;
  console.log(`  ${page.padEnd(44)} ${mine.length} comparisons`);
}
console.log(`${DRY ? 'would update' : 'updated'} ${touched} landing pages · ${totalLinks} links`);
if (skipped.length) console.log(`  skipped ${skipped.length}: ${skipped.slice(0, 4).join(', ')}`);
