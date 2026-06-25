// ════════════════════════════════════════════════════════════════════
// TaleemPK — University page PRE-RENDERER
// Generates a static HTML file per university at  university/<slug>.html
// with the title, meta, canonical, JSON-LD schema, AND the visible content
// (name, HEC line, fee, merit, programs) baked into the initial HTML — so
// Googlebot indexes full content WITHOUT executing JavaScript.
//
// On load, /university.js re-fetches from Supabase and re-renders #content
// into the full interactive page (reviews, calculator, chart, similar unis).
// Cloudflare Pages serves university/<slug>.html at /university/<slug>,
// taking precedence over the _redirects fallback to university.html.
//
// Run:  node build-university-pages.js
// ════════════════════════════════════════════════════════════════════

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vpioffkkzwbfnmpxpwgc.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW9mZmtrendiZm5tcHhwd2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTc5ODksImV4cCI6MjA5NTczMzk4OX0.IUDmCzw6im094kilaTKw812GkVDC7a85AA4scs1X8YE';
const SITE = 'https://taleempk.pk';
const YEAR = new Date().getFullYear();

function get(p) {
  return new Promise((res, rej) => {
    https.get(`${SUPABASE_URL}/rest/v1/${p}`, { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { if (r.statusCode !== 200) return rej(new Error('HTTP ' + r.statusCode)); try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = n => (n || '').toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const firstCity = c => (c || '').split('/')[0].trim();

// Replace the content/href attr of a tag identified by id="<id>"
function setAttrById(html, id, attr, value) {
  const re = new RegExp(`(id="${id}"[^>]*${attr}=")[^"]*(")`);
  return html.replace(re, `$1${esc(value)}$2`);
}

// Baked, crawlable content for #content (mirrors the JS render output's key text)
function bakedContent(u) {
  const city = firstCity(u.city);
  const sectorLabel = u.sector === 'public' ? '🏛️ Public' : u.sector === 'military' ? '⚔️ Military' : '🏢 Private';
  const sectorWord = u.sector === 'private' ? 'private' : u.sector === 'military' ? 'military' : 'public';
  const typeWord = u.type === 'college' ? 'college' : 'university';
  const cleanTags = (u.tags || []).filter(t => !['public','private','military','federal','punjab','sindh','kpk','balochistan','ajk','gilgitbaltistan'].includes(t)).slice(0, 3);
  const sideRow = (icn, k, v) => v ? `<div class="side-row"><div class="side-icn">${icn}</div><div><div class="side-k">${esc(k)}</div><div class="side-v">${esc(v)}</div></div></div>` : '';
  const programs = (u.programs || []).slice(0, 40);

  return `
  <div class="hero-band">
    <div class="hero-inner">
      <div class="crumbs"><a href="/">Universities</a> &nbsp;›&nbsp; ${esc(u.name)}</div>
      <div class="hero-top">
        <div class="hero-tags">
          ${u.rank ? `<div class="hero-rank-tag">🏆 Rank #${u.rank} in Pakistan</div>` : ''}
          ${u.fee_year ? `<div class="verified-tag">✓ Verified data · ${esc(u.fee_year)}</div>` : ''}
        </div>
      </div>
      <h1 class="hero-name">${esc(u.full_name || u.name)}</h1>
      <div class="hero-meta">
        <span>📍 <b>${esc(u.city || '')}</b></span>
        ${u.established ? `<span>· Est. <b>${u.established}</b></span>` : ''}
      </div>
      <div class="hero-badges">
        <span class="hec-badge">✓ HEC Recognized</span>
        <span class="green">${sectorLabel}</span>
        ${cleanTags.map(t => `<span>${esc(t)}</span>`).join('')}
      </div>
    </div>
  </div>
  <div class="layout">
    <div class="main">
      <div class="sec">
        <div class="sec-head"><div class="icn">📖</div><h2>About ${esc(u.name)}</h2></div>
        <div class="desc">
          <p style="margin:0 0 10px;"><strong>${esc(u.full_name || u.name)}</strong> is a ${sectorWord} ${typeWord} in ${esc(city || 'Pakistan')}, recognized by the Higher Education Commission (HEC) of Pakistan${u.established ? ', established in ' + u.established : ''}.</p>
          ${u.description ? `<p style="margin:0;">${esc(u.description)}</p>` : ''}
        </div>
      </div>
      ${programs.length ? `
      <div class="sec">
        <div class="sec-head"><div class="icn">📚</div><h2>Programs Offered <span class="count">${(u.programs || []).length}</span></h2></div>
        <div class="pills">${programs.map(p => `<span class="pill">${esc(p)}</span>`).join('')}</div>
      </div>` : ''}
    </div>
    <aside class="sidebar">
      <div class="side-card">
        <h3>Quick Facts</h3>
        ${sideRow('💰', 'Fee / Semester', u.fee)}
        ${sideRow('🎯', 'Merit / Eligibility', u.merit)}
        ${sideRow('📝', 'Entry Test', u.entry)}
        ${sideRow('👥', 'Seats', u.seats)}
        ${sideRow('🎓', 'Scholarships', u.scholarships)}
        ${sideRow('🏠', 'Hostel', u.hostel)}
        <div class="side-cta">
          ${u.website ? `<a class="btn" href="https://www.${esc(u.website)}" target="_blank" rel="noopener">🌐 Visit Official Site</a>` : ''}
        </div>
      </div>
    </aside>
  </div>`;
}

function buildJsonLd(u, canonical) {
  const city = firstCity(u.city);
  const d = `${u.full_name || u.name}${city ? ' (' + city + ')' : ''} ${YEAR} admissions: fee structure${u.fee ? ' (' + u.fee + ')' : ''}, merit list, entry test. HEC-recognized.`;
  const org = {
    '@context': 'https://schema.org', '@type': 'CollegeOrUniversity',
    name: u.full_name || u.name, alternateName: u.name, url: canonical,
    description: u.description || d,
    foundingDate: u.established ? String(u.established) : undefined,
    sameAs: u.website ? ['https://www.' + u.website] : undefined,
    address: city ? { '@type': 'PostalAddress', addressLocality: city, addressRegion: u.province || '', addressCountry: 'PK' } : undefined
  };
  Object.keys(org).forEach(k => { if (org[k] === undefined) delete org[k]; });

  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: u.name, item: canonical }
    ]
  };

  const faqs = [];
  faqs.push({ q: `Is ${u.full_name || u.name} recognized by HEC?`, a: `Yes. ${u.full_name || u.name} is recognized by the Higher Education Commission (HEC) of Pakistan${u.established ? ', established in ' + u.established : ''}${city ? ' and located in ' + city : ''}.` });
  if (u.fee) faqs.push({ q: `What is the fee structure of ${u.full_name || u.name}?`, a: `The fee at ${u.full_name || u.name} is approximately ${u.fee}${u.fee_note ? ' (' + u.fee_note + ')' : ''}. See the full fee breakdown on TaleemPK.` });
  if (u.merit) faqs.push({ q: `What is the merit for admission at ${u.full_name || u.name}?`, a: `The closing merit at ${u.full_name || u.name} is around ${u.merit}. Check TaleemPK for the latest merit trends.` });
  if (u.scholarships) faqs.push({ q: `Does ${u.full_name || u.name} offer scholarships?`, a: `Yes. ${u.scholarships}` });
  if ((u.programs || []).length) faqs.push({ q: `What programs are offered at ${u.full_name || u.name}?`, a: `${u.full_name || u.name} offers ${u.programs.length} programs including ${u.programs.slice(0, 5).join(', ')}${u.programs.length > 5 ? ' and more' : ''}.` });
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };

  return [org, breadcrumb, faqLd].map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
}

async function main() {
  const template = fs.readFileSync('university.html', 'utf8');
  if (!template.includes('id="content"')) { console.error('template missing #content'); process.exit(1); }

  console.log('Fetching institutions…');
  const all = await get('institutions?select=id,name,full_name,city,province,sector,type,tags,programs,fee,fee_year,fee_note,merit,entry,seats,scholarships,hostel,rank,established,website&order=id&limit=500');
  console.log(`  ${all.length} universities`);

  if (!fs.existsSync('university')) fs.mkdirSync('university');

  const seen = new Set();
  let written = 0;
  for (const u of all) {
    let s = slug(u.name);
    if (!s) continue;
    if (seen.has(s)) s = s + '-' + u.id;
    seen.add(s);
    const canonical = `${SITE}/university/${s}`;
    const city = firstCity(u.city);
    const title = `${u.full_name || u.name}${city ? ' — ' + city : ''} Fee Structure ${YEAR}, Merit List & Admissions | TaleemPK`;
    const metaDesc = `${u.full_name || u.name}${city ? ' (' + city + ')' : ''} ${YEAR} admissions: fee structure${u.fee ? ' (' + u.fee + ')' : ''}, merit list, entry test${(u.programs || []).length ? ', ' + u.programs.length + '+ programs' : ''}. HEC-recognized. Compare on TaleemPK.`;

    let html = template;
    html = html.replace('<title>University — TaleemPK</title>', `<title>${esc(title)}</title>`);
    html = setAttrById(html, 'metaDesc', 'content', metaDesc);
    html = setAttrById(html, 'ogTitle', 'content', `${u.full_name || u.name} | TaleemPK`);
    html = setAttrById(html, 'ogDesc', 'content', metaDesc);
    html = setAttrById(html, 'twTitle', 'content', title);
    html = setAttrById(html, 'twDesc', 'content', metaDesc);
    html = setAttrById(html, 'canonicalUrl', 'href', canonical);
    // inject JSON-LD just before </head>
    html = html.replace('</head>', buildJsonLd(u, canonical) + '\n</head>');
    // bake visible content
    html = html.replace('<div id="content"><div class="loading">Loading university…</div></div>', `<div id="content">${bakedContent(u)}</div>`);

    fs.writeFileSync(path.join('university', s + '.html'), html);
    written++;
  }
  console.log(`\nPre-rendered ${written} university pages → /university/<slug>.html`);
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
