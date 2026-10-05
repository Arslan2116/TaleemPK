#!/usr/bin/env node
/* ───────────────────────────────────────────────────────────────
   Build /compare — an index of every head-to-head comparison page.

   Linking the comparisons from the landing pages brought 103 of 235 to two clicks
   from the homepage. The rest are still at three, which on a site with this little
   crawl budget is where Google stops. An index page linked from the homepage puts
   all of them at two in one move, and it is a page a visitor would want anyway:
   "which of these two should I pick" is the question the whole site exists for.

     node scripts/build-compare-hub.js
   ─────────────────────────────────────────────────────────────── */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://taleempk.pk';
const YEAR = new Date().getFullYear();
const TODAY = new Date().toISOString().slice(0, 10);

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

const pairs = [];
for (const f of fs.readdirSync(ROOT).filter(f => /-vs-.*\.html$/.test(f))) {
  const key = f.replace(/\.html$/, '');
  for (let i = key.indexOf('-vs-'); i !== -1; i = key.indexOf('-vs-', i + 1)) {
    const x = bySlug[key.slice(0, i)], y = bySlug[key.slice(i + 4)];
    if (x && y) { pairs.push({ key, a: x, b: y }); break; }
  }
}
const rank = u => u.rank || 9999;
pairs.sort((x, y) => (rank(x.a) + rank(x.b)) - (rank(y.a) + rank(y.b)));

// Group by field where both sides share one, else by city, else everything else —
// so the page reads as sections rather than one wall of 236 links.
const FIELDS = [['engineering', 'Engineering'], ['medical', 'Medical'],
                ['cs', 'Computer Science'], ['business', 'Business']];
const groups = new Map();
const put = (k, p) => { if (!groups.has(k)) groups.set(k, []); groups.get(k).push(p); };
const seen = new Set();
for (const p of pairs) {
  const field = FIELDS.find(([t]) => (p.a.tags || []).includes(t) && (p.b.tags || []).includes(t));
  if (field) { put(field[1] + ' comparisons', p); seen.add(p.key); }
}
for (const p of pairs) {
  if (seen.has(p.key)) continue;
  const c = city1(p.a);
  put(c && c === city1(p.b) ? `Universities in ${c}` : 'Other comparisons', p);
}

// Only universities that actually have a page, so the picker cannot offer a dead end
const pickable = UNIVERSITIES
  .filter(u => fs.existsSync(path.join(ROOT, 'university', slug(u.name) + '.html')))
  .map(u => ({ i: u.id, n: u.name, f: u.full || u.name, s: slug(u.name) }))
  .sort((x, y) => x.n.localeCompare(y.n));
const pairKeys = pairs.map(p => p.key);

const PICKER = `
  <section class="picker">
    <h2>Compare any two universities</h2>
    <p class="picker-sub">Not in the list below? Pick them yourself — start typing a name.</p>
    <div class="picker-row">
      <input list="uni-list" id="pickA" placeholder="First university" autocomplete="off" aria-label="First university">
      <span class="picker-vs">vs</span>
      <input list="uni-list" id="pickB" placeholder="Second university" autocomplete="off" aria-label="Second university">
      <button id="pickGo" type="button">Compare →</button>
    </div>
    <p class="picker-msg" id="pickMsg" role="status"></p>
    <datalist id="uni-list">${pickable.map(u =>
      `<option value="${esc(u.n)}">${esc(u.f !== u.n ? u.f : '')}</option>`).join('')}</datalist>
  </section>`;

const PICKER_JS = `
<script>
// Both lists come from the same build as the pages themselves, so the picker can only
// offer universities that exist and can tell whether a pair already has its own page.
const UNIS = ${JSON.stringify(pickable)};
const PAIRS = new Set(${JSON.stringify(pairKeys)});
const byName = new Map(UNIS.map(u => [u.n.toLowerCase(), u]));
function resolve(v){
  v = (v || '').trim().toLowerCase();
  if (!v) return null;
  return byName.get(v) || UNIS.find(u => u.n.toLowerCase() === v || u.f.toLowerCase() === v)
      || UNIS.find(u => u.n.toLowerCase().startsWith(v) || u.f.toLowerCase().startsWith(v)) || null;
}
function go(){
  const msg = document.getElementById('pickMsg');
  const a = resolve(document.getElementById('pickA').value);
  const b = resolve(document.getElementById('pickB').value);
  if (!a || !b) { msg.textContent = 'Pick two universities from the list.'; return; }
  if (a.i === b.i) { msg.textContent = 'Pick two different universities.'; return; }
  msg.textContent = '';
  // Prefer the dedicated page when one exists, either way round
  if (PAIRS.has(a.s + '-vs-' + b.s)) { location.href = '/' + a.s + '-vs-' + b.s; return; }
  if (PAIRS.has(b.s + '-vs-' + a.s)) { location.href = '/' + b.s + '-vs-' + a.s; return; }
  // Otherwise the homepage opens the full side-by-side from the ids
  location.href = '/?compare=' + a.i + ',' + b.i;
}
document.getElementById('pickGo').addEventListener('click', go);
['pickA','pickB'].forEach(id => document.getElementById(id)
  .addEventListener('keydown', e => { if (e.key === 'Enter') go(); }));
<\/script>`;

const sections = [...groups.entries()]
  .sort((x, y) => y[1].length - x[1].length)
  .map(([title, list]) => `
  <section class="cmp-group">
    <h2>${esc(title)} <span class="n">${list.length}</span></h2>
    <div class="cmp-grid">${list.map(p =>
      `<a href="/${esc(p.key)}"><strong>${esc(p.a.name)}</strong> <span>vs</span> <strong>${esc(p.b.name)}</strong></a>`
    ).join('')}</div>
  </section>`).join('');

const title = `Compare Universities in Pakistan Side by Side (${YEAR})`;
const desc = `${pairs.length} head-to-head comparisons of Pakistani universities — fees, `
           + `merit, entry tests and programmes next to each other.`;

const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/compare">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/compare">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@TaleemPK_">
<meta name="twitter:title" content="${esc(title)}">
<link rel="icon" type="image/png" href="/favicon.png">
<meta name="theme-color" content="#0A1628">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1T7ZYZFGZ2"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-1T7ZYZFGZ2');</script>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: 'Compare Universities', item: SITE + '/compare' }]})}</script>
<style>
  :root{--navy:#0A1628;--navy-2:#112240;--green:#00C853;--green-dark:#0a6632;
        --g100:#F4F6F9;--g200:#E3E8EF;--g400:#9BA5B5;--g600:#5A6474;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Sora',system-ui,sans-serif;color:var(--navy);background:#fff;line-height:1.7;}
  a{color:var(--green-dark);text-decoration:none;}
  nav{background:var(--navy);padding:0 5%;height:60px;display:flex;align-items:center;
      justify-content:space-between;position:sticky;top:0;z-index:10;}
  nav .logo{color:#fff;font-weight:800;font-size:1.2rem;} nav .logo span{color:var(--green);}
  nav a.home{color:rgba(255,255,255,.8);font-size:.85rem;}
  .hero{background:linear-gradient(135deg,var(--navy),var(--navy-2));color:#fff;padding:44px 5% 34px;}
  .hero-in{max-width:980px;margin:0 auto;}
  .crumbs{font-size:.78rem;color:rgba(255,255,255,.55);margin-bottom:12px;}
  .crumbs a{color:var(--green);}
  h1{font-size:clamp(1.5rem,4vw,2.1rem);font-weight:800;}
  .intro{color:rgba(255,255,255,.8);margin-top:12px;font-size:.95rem;max-width:640px;}
  main{max-width:980px;margin:0 auto;padding:30px 5% 70px;}
  .picker{background:var(--g100);border-radius:14px;padding:20px 22px;margin-bottom:34px;}
  .picker h2{font-size:1.05rem;font-weight:800;margin-bottom:4px;border:none;padding:0;}
  .picker-sub{color:var(--g600);font-size:.87rem;margin-bottom:14px;}
  .picker-row{display:flex;gap:9px;align-items:center;flex-wrap:wrap;}
  .picker-row input{flex:1 1 210px;min-width:0;padding:11px 13px;border:1.5px solid var(--g200);
    border-radius:10px;font-family:inherit;font-size:.9rem;background:#fff;color:var(--navy);}
  .picker-row input:focus{outline:none;border-color:var(--green);}
  .picker-vs{font-weight:800;color:var(--green-dark);font-size:.82rem;}
  .picker-row button{background:var(--green);color:var(--navy);border:none;border-radius:10px;
    padding:11px 22px;font-family:inherit;font-weight:800;font-size:.9rem;cursor:pointer;white-space:nowrap;}
  .picker-row button:hover{filter:brightness(1.05);}
  .picker-msg{color:#b91c1c;font-size:.84rem;margin-top:9px;min-height:1.2em;}
  @media(max-width:560px){.picker-vs{display:none;} .picker-row button{width:100%;}}
  .cmp-group{margin-bottom:34px;}
  .cmp-group h2{font-size:1.05rem;font-weight:800;margin-bottom:13px;
    padding-bottom:9px;border-bottom:1px solid var(--g200);}
  .cmp-group h2 .n{color:var(--g400);font-weight:600;font-size:.8rem;margin-left:6px;}
  .cmp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:8px;}
  .cmp-grid a{display:block;background:var(--g100);border:1.5px solid transparent;border-radius:10px;
    padding:10px 14px;font-size:.87rem;color:var(--navy);transition:border-color .18s,background .18s;}
  .cmp-grid a:hover{border-color:var(--green);background:#fff;}
  .cmp-grid span{color:var(--green-dark);font-weight:800;font-size:.76rem;margin:0 3px;}
  .cta{margin-top:34px;text-align:center;background:linear-gradient(135deg,var(--navy),var(--navy-2));
       color:#fff;padding:28px;border-radius:16px;}
  .cta h2{color:#fff;font-size:1.1rem;margin-bottom:7px;border:none;}
  .cta p{color:rgba(255,255,255,.7);margin-bottom:14px;font-size:.9rem;}
  .cta a{display:inline-block;background:var(--green);color:var(--navy);font-weight:800;
         padding:11px 24px;border-radius:10px;font-size:.9rem;}
  footer{background:var(--navy);color:rgba(255,255,255,.55);text-align:center;padding:24px;font-size:.82rem;}
  footer a{color:var(--green);}
</style>
</head>
<body>
<nav><a class="logo" href="/">Taleem<span>PK</span></a><a class="home" href="/">← All Universities</a></nav>
<div class="hero"><div class="hero-in">
  <div class="crumbs"><a href="/">Home</a> › Compare Universities</div>
  <h1>Compare Universities Side by Side</h1>
  <p class="intro">${pairs.length} head-to-head comparisons — fee, merit, entry test, seats and
  programmes for two universities next to each other, so you can see what actually separates them.</p>
</div></div>
<main>
${PICKER}
${sections}
  <div class="cta">
    <h2>Not sure which two to compare?</h2>
    <p>Enter your marks and see which universities you can realistically get into.</p>
    <a href="/?action=predictor">Try the Admission Predictor →</a>
  </div>
</main>
${PICKER_JS}
<footer>© ${YEAR} TaleemPK · <a href="/">Compare Universities in Pakistan</a> ·
  <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/disclaimer">Disclaimer</a></footer>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'compare.html'), page);
console.log(`compare.html: ${pairs.length} comparisons in ${groups.size} sections`);

// Sitemap
const sm = path.join(ROOT, 'sitemap.xml');
let xml = fs.readFileSync(sm, 'utf8');
if (!xml.includes(`<loc>${SITE}/compare</loc>`)) {
  xml = xml.replace('</urlset>', `<url><loc>${SITE}/compare</loc><lastmod>${TODAY}</lastmod>`
    + `<changefreq>weekly</changefreq><priority>0.8</priority></url></urlset>`);
  fs.writeFileSync(sm, xml);
  console.log('sitemap: /compare added');
}
