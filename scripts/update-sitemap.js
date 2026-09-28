#!/usr/bin/env node
/* ───────────────────────────────────────────────────────────────
   Keep sitemap.xml honest: every <url> gets a <lastmod> taken from the file's
   own modification time, so a page that actually changed tells Google so, and
   one that did not keeps its old date.

   It also drops <loc>s whose file no longer exists, and query-string URLs that
   only canonicalise back to a page already listed.

     node scripts/update-sitemap.js
   ─────────────────────────────────────────────────────────────── */
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://taleempk.pk';
const xml  = path.join(ROOT, 'sitemap.xml');

const iso = t => new Date(t).toISOString().slice(0, 10);

// /university/nust → university/nust.html · / → index.html
function fileFor(loc) {
  let p = loc.replace(SITE, '').split('?')[0].split('#')[0];
  if (p === '' || p === '/') return 'index.html';
  p = p.replace(/^\/+|\/+$/g, '');
  for (const c of [p + '.html', path.join(p, 'index.html')]) {
    if (fs.existsSync(path.join(ROOT, c))) return c;
  }
  return null;
}

let s = fs.readFileSync(xml, 'utf8');
const blocks = s.match(/<url>[\s\S]*?<\/url>/g) || [];

let stamped = 0, dropped = [], kept = [];
for (const block of blocks) {
  const loc = (block.match(/<loc>([^<]*)<\/loc>/) || [, ''])[1];
  if (loc.includes('?')) { dropped.push(loc + '  (query string — canonicalises elsewhere)'); continue; }
  const file = fileFor(loc);
  if (!file) { dropped.push(loc + '  (no such file)'); continue; }

  const mtime = iso(fs.statSync(path.join(ROOT, file)).mtime);
  let out = block;
  if (/<lastmod>/.test(out)) {
    const had = (out.match(/<lastmod>([^<]*)<\/lastmod>/) || [, ''])[1];
    if (had !== mtime) stamped++;
    out = out.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${mtime}</lastmod>`);
  } else {
    out = out.replace('</loc>', `</loc><lastmod>${mtime}</lastmod>`);
    stamped++;
  }
  kept.push(out);
}

s = s.replace(/<url>[\s\S]*?<\/url>\s*/g, '').replace('</urlset>', kept.join('') + '</urlset>');
fs.writeFileSync(xml, s);

console.log(`sitemap: ${kept.length} urls · ${stamped} lastmod added or refreshed · ${dropped.length} dropped`);
dropped.forEach(d => console.log('  dropped ' + d));
