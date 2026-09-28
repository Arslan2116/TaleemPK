#!/usr/bin/env node
/* ───────────────────────────────────────────────────────────────
   Write a static archive list of every /blog/<slug> page into blog.html.

   The listing on /blog is rendered by JS from Supabase, so the only links to
   the article pages existed after a script ran — which left all 14 of them
   with no crawlable internal link anywhere on the site. This block is plain
   markup, and sits outside #articleContent because the page's own render
   overwrites that element.

     node scripts/build-blog-archive.js
   ─────────────────────────────────────────────────────────────── */
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BEGIN = '<!-- blog-archive:begin -->', END = '<!-- blog-archive:end -->';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const posts = fs.readdirSync(path.join(ROOT, 'blog')).filter(f => f.endsWith('.html')).map(f => {
  const h = fs.readFileSync(path.join(ROOT, 'blog', f), 'utf8');
  const t = (h.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [, f])[1]
              .replace(/\s*\|\s*TaleemPK(\s+Blog)?\s*$/, '').trim();
  const d = (h.match(/"datePublished":\s*"([^"]{10})/) || [, ''])[1];
  return { slug: f.replace(/\.html$/, ''), title: t, date: d };
}).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

const fmt = d => {
  if (!d) return '';
  const x = new Date(d + 'T00:00:00');
  return isNaN(x) ? '' : x.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
};

const block = `${BEGIN}
<section class="blog-archive">
  <h2>All articles</h2>
  <ul>
${posts.map(p => `    <li><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a>${p.date ? `<time datetime="${p.date}">${fmt(p.date)}</time>` : ''}</li>`).join('\n')}
  </ul>
</section>
${END}`;

const file = path.join(ROOT, 'blog.html');
let html = fs.readFileSync(file, 'utf8');
const re = new RegExp(BEGIN.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&') + '[\\s\\S]*?' + END.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'));
html = re.test(html) ? html.replace(re, block) : html.replace(/\n<footer>/, `\n${block}\n<footer>`);
fs.writeFileSync(file, html);

console.log(`blog.html: archive block with ${posts.length} article links`);
