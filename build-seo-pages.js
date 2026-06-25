// ════════════════════════════════════════════════════════════════════
// TaleemPK — SEO landing-page generator
// Builds STATIC, content-baked HTML pages for high-volume head terms:
//   • City pages      → /universities-in-lahore        ("universities in lahore")
//   • Province pages  → /universities-in-punjab
//   • Category pages  → /engineering-universities-in-pakistan, /medical-colleges-in-pakistan ...
//   • Sector pages    → /public-universities-in-pakistan, /private-universities-in-pakistan
//
// Each page bakes a real, useful comparison table of universities into the HTML
// (NOT a thin doorway page) plus ItemList + BreadcrumbList + FAQPage schema,
// so Googlebot indexes full content on the first crawl — no client render needed.
//
// Run:  node build-seo-pages.js
// Output: *.html files in repo root (Cloudflare Pages serves them at extensionless URLs)
// ════════════════════════════════════════════════════════════════════

const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://vpioffkkzwbfnmpxpwgc.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW9mZmtrendiZm5tcHhwd2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTc5ODksImV4cCI6MjA5NTczMzk4OX0.IUDmCzw6im094kilaTKw812GkVDC7a85AA4scs1X8YE';
const SITE = 'https://taleempk.pk';
const YEAR = new Date().getFullYear();

// ── helpers ──
function get(path) {
  return new Promise((res, rej) => {
    https.get(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { if (r.statusCode !== 200) return rej(new Error('HTTP ' + r.statusCode + ': ' + d.slice(0, 200))); try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = n => (n || '').toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const firstCity = c => (c || '').split('/')[0].trim();

// ── shared page template ──
function pageHTML({ slugName, title, metaDesc, h1, intro, unis, faqs, related, crumb }) {
  const canonical = `${SITE}/${slugName}`;
  // ItemList schema of the universities
  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    'itemListElement': unis.slice(0, 25).map((u, i) => ({
      '@type': 'ListItem', 'position': i + 1,
      'url': `${SITE}/university/${slug(u.name)}`,
      'name': u.full_name || u.name
    }))
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/' },
      { '@type': 'ListItem', 'position': 2, 'name': crumb, 'item': canonical }
    ]
  };
  const faqSchema = faqs.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({ '@type': 'Question', 'name': f.q, 'acceptedAnswer': { '@type': 'Answer', 'text': f.a } }))
  } : null;

  const rows = unis.map((u, i) => `
      <tr>
        <td class="r-rank">${u.rank ? '#' + u.rank : i + 1}</td>
        <td class="r-name"><a href="/university/${slug(u.name)}">${esc(u.name)}</a><span class="r-full">${esc(u.full_name || '')}</span></td>
        <td>${esc(firstCity(u.city))}</td>
        <td><span class="r-tag ${u.sector === 'public' ? 'pub' : 'priv'}">${u.sector === 'public' ? 'Public' : u.sector === 'military' ? 'Military' : 'Private'}</span></td>
        <td>${esc(u.fee || '—')}</td>
        <td>${esc((u.merit || '—').slice(0, 40))}</td>
      </tr>`).join('');

  const faqHTML = faqs.length ? `
    <section class="faq">
      <h2>Frequently Asked Questions</h2>
      ${faqs.map(f => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('')}
    </section>` : '';

  const relatedHTML = related.length ? `
    <section class="related">
      <h2>Explore More</h2>
      <div class="related-grid">
        ${related.map(r => `<a href="/${r.slug}">${esc(r.label)}</a>`).join('')}
      </div>
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:site_name" content="TaleemPK">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(metaDesc)}">
<link rel="icon" type="image/png" href="/favicon.png">
<meta name="theme-color" content="#0A1628">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(itemList)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
${faqSchema ? `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>` : ''}
<style>
  :root{--navy:#0A1628;--green:#00C853;--green-dark:#00A040;--g100:#F5F7FA;--g200:#E8ECF2;--g600:#5A6478;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Sora',system-ui,sans-serif;color:var(--navy);background:#fff;line-height:1.6;}
  a{color:var(--green-dark);text-decoration:none;}
  nav{background:var(--navy);padding:0 5%;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;}
  nav .logo{color:#fff;font-weight:800;font-size:1.2rem;}
  nav .logo span{color:var(--green);}
  nav a.home{color:rgba(255,255,255,.8);font-size:.85rem;}
  .hero{background:linear-gradient(135deg,#0A1628,#112240);color:#fff;padding:48px 5% 40px;}
  .crumbs{font-size:.78rem;color:rgba(255,255,255,.55);margin-bottom:14px;}
  .crumbs a{color:var(--green);}
  h1{font-size:clamp(1.5rem,4vw,2.3rem);font-weight:800;line-height:1.2;margin-bottom:14px;}
  h1 span{color:var(--green);}
  .intro{color:rgba(255,255,255,.82);max-width:760px;font-size:1rem;}
  main{max-width:1100px;margin:0 auto;padding:36px 5% 60px;}
  .count-line{font-size:.9rem;color:var(--g600);margin-bottom:16px;}
  .count-line b{color:var(--navy);}
  table{width:100%;border-collapse:collapse;font-size:.88rem;background:#fff;border:1px solid var(--g200);border-radius:12px;overflow:hidden;}
  thead{background:var(--navy);color:#fff;}
  th{text-align:left;padding:12px 14px;font-size:.74rem;text-transform:uppercase;letter-spacing:.04em;font-weight:700;}
  td{padding:12px 14px;border-top:1px solid var(--g200);vertical-align:top;}
  tbody tr:hover{background:var(--g100);}
  .r-rank{font-weight:800;color:var(--green-dark);white-space:nowrap;}
  .r-name a{font-weight:700;color:var(--navy);}
  .r-name a:hover{color:var(--green-dark);}
  .r-full{display:block;font-size:.72rem;color:var(--g600);font-weight:400;}
  .r-tag{font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:10px;}
  .r-tag.pub{background:#E3F2FD;color:#1565C0;}
  .r-tag.priv{background:#FCE4EC;color:#C62828;}
  .table-wrap{overflow-x:auto;}
  .faq{margin-top:48px;}
  .faq h2,.related h2{font-size:1.3rem;font-weight:800;margin-bottom:18px;}
  .faq-item{margin-bottom:18px;padding:16px 18px;background:var(--g100);border-radius:12px;border-left:3px solid var(--green);}
  .faq-item h3{font-size:1rem;margin-bottom:6px;}
  .faq-item p{color:var(--g600);font-size:.92rem;}
  .related{margin-top:48px;}
  .related-grid{display:flex;flex-wrap:wrap;gap:10px;}
  .related-grid a{background:var(--g100);border:1px solid var(--g200);padding:8px 16px;border-radius:30px;font-size:.85rem;font-weight:600;color:var(--navy);}
  .related-grid a:hover{border-color:var(--green);color:var(--green-dark);}
  .cta{margin-top:40px;text-align:center;background:linear-gradient(135deg,#0A1628,#112240);color:#fff;padding:32px;border-radius:16px;}
  .cta h2{color:#fff;font-size:1.3rem;margin-bottom:8px;}
  .cta p{color:rgba(255,255,255,.7);margin-bottom:16px;font-size:.92rem;}
  .cta a{display:inline-block;background:var(--green);color:var(--navy);font-weight:800;padding:12px 26px;border-radius:10px;font-size:.92rem;}
  footer{background:var(--navy);color:rgba(255,255,255,.55);text-align:center;padding:24px;font-size:.82rem;}
  footer a{color:var(--green);}
</style>
</head>
<body>
<nav>
  <a class="logo" href="/">Taleem<span>PK</span></a>
  <a class="home" href="/">← All Universities</a>
</nav>
<div class="hero">
  <div class="crumbs"><a href="/">Home</a> › ${esc(crumb)}</div>
  <h1>${h1}</h1>
  <p class="intro">${esc(intro)}</p>
</div>
<main>
  <div class="count-line">Comparing <b>${unis.length}</b> HEC-recognized universities — fees, merit & programs, updated ${YEAR}.</div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>University</th><th>City</th><th>Type</th><th>Fee / Semester</th><th>Merit / Entry</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  ${faqHTML}
  ${relatedHTML}
  <div class="cta">
    <h2>Not sure which university fits you?</h2>
    <p>Use our free Admission Predictor — enter your percentage and field, get matched instantly.</p>
    <a href="/?action=predictor">Try the Admission Predictor →</a>
  </div>
</main>
<footer>© ${YEAR} TaleemPK · <a href="/">Compare ${218}+ Universities in Pakistan</a></footer>
</body>
</html>`;
}

// ── main ──
async function main() {
  console.log('Fetching institutions…');
  const all = await get('institutions?select=id,name,full_name,city,province,sector,tags,programs,fee,merit,rank,established&order=rank.asc.nullslast,id.asc&limit=500');
  console.log(`  ${all.length} universities`);
  // Program-based matchers (for categories where the tag is sparse but programs exist)
  const hasProgram = (u, re) => (u.programs || []).some(p => re.test(p));

  const sortByRank = a => a.slice().sort((x, y) => (x.rank || 999) - (y.rank || 999));
  const pages = [];

  // ── City pages ──
  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Multan', 'Faisalabad', 'Rawalpindi', 'Quetta'];
  const cityRelated = cities.map(c => ({ slug: 'universities-in-' + slug(c), label: 'Universities in ' + c }));
  cities.forEach(city => {
    const list = sortByRank(all.filter(u => firstCity(u.city).toLowerCase() === city.toLowerCase()));
    if (list.length < 2) return;
    const top3 = list.slice(0, 3).map(u => u.name).join(', ');
    pages.push({
      slugName: 'universities-in-' + slug(city),
      title: `Universities in ${city} ${YEAR} — Fees, Merit & Admissions | TaleemPK`,
      metaDesc: `List of ${list.length} HEC-recognized universities in ${city}, Pakistan. Compare fee structures, merit, and programs of top universities including ${top3}. Updated ${YEAR}.`,
      h1: `Universities in <span>${city}</span>`,
      intro: `Looking for universities in ${city}? There are ${list.length} HEC-recognized universities and colleges in ${city}, Pakistan — including top names like ${top3}. Compare their ${YEAR} fee structures, merit requirements, entry tests, and programs below to find the right fit.`,
      crumb: `Universities in ${city}`,
      unis: list,
      faqs: [
        { q: `How many universities are there in ${city}?`, a: `There are ${list.length} HEC-recognized universities and degree-awarding institutions in ${city}, Pakistan, across public and private sectors.` },
        { q: `Which is the best university in ${city}?`, a: `Top-ranked universities in ${city} include ${top3}. The best choice depends on your field, budget, and merit — compare them on TaleemPK.` },
        { q: `What is the fee structure of universities in ${city}?`, a: `Fees vary widely — public universities in ${city} are generally more affordable, while private universities charge more. See the per-semester fees in the table above.` }
      ],
      related: cityRelated.filter(r => r.slug !== 'universities-in-' + slug(city)).slice(0, 6)
        .concat([{ slug: 'engineering-universities-in-pakistan', label: 'Engineering Universities' }, { slug: 'medical-colleges-in-pakistan', label: 'Medical Colleges' }])
    });
  });

  // ── Province pages ──
  const provinces = [['Punjab', 'Punjab'], ['Sindh', 'Sindh'], ['KPK', 'Khyber Pakhtunkhwa'], ['Balochistan', 'Balochistan'], ['Federal', 'Islamabad Capital Territory']];
  provinces.forEach(([prov, label]) => {
    const list = sortByRank(all.filter(u => u.province === prov));
    if (list.length < 3) return;
    const top3 = list.slice(0, 3).map(u => u.name).join(', ');
    pages.push({
      slugName: 'universities-in-' + slug(prov),
      title: `Universities in ${label} ${YEAR} — Complete List, Fees & Merit | TaleemPK`,
      metaDesc: `Complete list of ${list.length} HEC-recognized universities in ${label}, Pakistan. Compare fees, merit & programs of top universities like ${top3}. Updated ${YEAR}.`,
      h1: `Universities in <span>${label}</span>`,
      intro: `${label} is home to ${list.length} HEC-recognized universities, including ${top3}. Whether you're looking at public or private institutions, this page lets you compare their ${YEAR} fees, merit requirements, and programs side by side.`,
      crumb: `Universities in ${prov}`,
      unis: list,
      faqs: [
        { q: `How many universities are in ${label}?`, a: `${label} has ${list.length} HEC-recognized universities and degree-awarding institutions.` },
        { q: `What are the top universities in ${label}?`, a: `Leading universities in ${label} include ${top3}. Compare all of them by fee, merit, and program on TaleemPK.` }
      ],
      related: cityRelated.slice(0, 5).concat([{ slug: 'public-universities-in-pakistan', label: 'Public Universities' }])
    });
  });

  // ── Category pages ──
  const categories = [
    { tag: 'engineering', slugName: 'engineering-universities-in-pakistan', label: 'Engineering Universities', noun: 'engineering universities' },
    { tag: 'medical', slugName: 'medical-colleges-in-pakistan', label: 'Medical Colleges', noun: 'medical colleges' },
    { tag: 'business', slugName: 'business-schools-in-pakistan', label: 'Business Schools', noun: 'business schools' },
    // CS tag is sparse, but many unis offer BS Computer Science — match by program instead.
    { match: u => hasProgram(u, /computer science|software engineer|\bbs\s*cs\b|\bbscs\b|information technology|\bbs\s*it\b|data science|artificial intelligence/i), slugName: 'computer-science-universities-in-pakistan', label: 'Computer Science Universities', noun: 'computer science (CS/IT) universities' },
    { tag: 'arts', slugName: 'arts-design-universities-in-pakistan', label: 'Arts & Design Universities', noun: 'arts and design universities' },
  ];
  const catRelated = categories.map(c => ({ slug: c.slugName, label: c.label }));
  categories.forEach(cat => {
    const list = sortByRank(all.filter(cat.match ? cat.match : (u => (u.tags || []).includes(cat.tag))));
    if (list.length < 2) return;
    const top3 = list.slice(0, 3).map(u => u.name).join(', ');
    pages.push({
      slugName: cat.slugName,
      title: `Top ${cat.label} in Pakistan ${YEAR} — Fees, Merit & Ranking | TaleemPK`,
      metaDesc: `List of the best ${cat.noun} in Pakistan (${list.length} HEC-recognized). Compare fees, merit & admission of top ${cat.noun} including ${top3}. Updated ${YEAR}.`,
      h1: `Top <span>${cat.label}</span> in Pakistan`,
      intro: `Pakistan has ${list.length} HEC-recognized ${cat.noun}, including ${top3}. This page compares the fees, merit requirements, entry tests, and programs of the best ${cat.noun} in Pakistan — updated for ${YEAR} admissions.`,
      crumb: cat.label,
      unis: list,
      faqs: [
        { q: `What are the best ${cat.noun} in Pakistan?`, a: `Top ${cat.noun} in Pakistan include ${top3}. Compare all ${list.length} by fee, merit, and program on TaleemPK.` },
        { q: `How many ${cat.noun} are in Pakistan?`, a: `There are ${list.length} HEC-recognized ${cat.noun} listed on TaleemPK, across all provinces.` }
      ],
      related: catRelated.filter(r => r.slug !== cat.slugName).concat(cityRelated.slice(0, 3))
    });
  });

  // ── Sector pages ──
  [['public', 'Public Universities', 'public-universities-in-pakistan'], ['private', 'Private Universities', 'private-universities-in-pakistan']].forEach(([sec, label, sn]) => {
    const list = sortByRank(all.filter(u => u.sector === sec));
    const top3 = list.slice(0, 3).map(u => u.name).join(', ');
    pages.push({
      slugName: sn,
      title: `${label} in Pakistan ${YEAR} — Complete List, Fees & Merit | TaleemPK`,
      metaDesc: `Complete list of ${list.length} ${label.toLowerCase()} in Pakistan. Compare fees, merit & programs including ${top3}. HEC-recognized. Updated ${YEAR}.`,
      h1: `${label.replace(' Universities', '')} <span>Universities</span> in Pakistan`,
      intro: `There are ${list.length} HEC-recognized ${label.toLowerCase()} in Pakistan, including ${top3}. ${sec === 'public' ? 'Public universities are government-funded and generally more affordable.' : 'Private universities often offer modern facilities and flexible programs.'} Compare their ${YEAR} fees and merit below.`,
      crumb: label,
      unis: list,
      faqs: [
        { q: `How many ${label.toLowerCase()} are in Pakistan?`, a: `There are ${list.length} HEC-recognized ${label.toLowerCase()} listed on TaleemPK.` }
      ],
      related: catRelated.concat(cityRelated.slice(0, 3))
    });
  });

  // ── write files ──
  let written = 0;
  pages.forEach(p => {
    fs.writeFileSync(p.slugName + '.html', pageHTML(p));
    written++;
  });
  console.log(`\nGenerated ${written} SEO landing pages:`);
  pages.forEach(p => console.log(`  /${p.slugName}  (${p.unis.length} unis)`));

  // emit the list of slugs for the sitemap generator
  fs.writeFileSync('.seo-pages.json', JSON.stringify(pages.map(p => p.slugName)));
  console.log('\nWrote .seo-pages.json (consumed by generate-sitemap.js)');
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
