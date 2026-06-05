// Run: node generate-sitemap.js
// Fetches all universities from Supabase and generates sitemap.xml with slug URLs

const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://vpioffkkzwbfnmpxpwgc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW9mZmtrendiZm5tcHhwd2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTc5ODksImV4cCI6MjA5NTczMzk4OX0.IUDmCzw6im094kilaTKw812GkVDC7a85AA4scs1X8YE';

function toSlug(name) {
  return (name || '').toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Generic Supabase fetcher
function sbFetch(path) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const options = {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Supabase HTTP ${res.statusCode} on ${path}: ${data.slice(0,200)}`));
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Malformed JSON from Supabase on ' + path + ': ' + e.message)); }
      });
    }).on('error', reject);
  });
}

function fetchUniversities() {
  return sbFetch('institutions?select=id,name&order=id');
}
function fetchPublishedBlogPosts() {
  // Pull every published post — the publish flag is the RLS gate too
  return sbFetch('blog_posts?select=title,created_at&published=eq.true&order=created_at.desc&limit=500')
    .catch(err => { console.warn('Blog fetch failed (continuing without blog URLs):', err.message); return []; });
}

async function generate() {
  console.log('Fetching data from Supabase...');
  const [unis, blogPosts] = await Promise.all([
    fetchUniversities(),
    fetchPublishedBlogPosts()
  ]);
  console.log(`  ${unis.length} universities  ·  ${blogPosts.length} blog posts`);

  const today = new Date().toISOString().split('T')[0];
  function lastmod(post) {
    const d = post.created_at;
    if (!d) return today;
    try { return new Date(d).toISOString().split('T')[0]; } catch { return today; }
  }

  const staticPages = [
    { loc: 'https://taleempk.pk/',                lastmod: today, priority: '1.0', changefreq: 'daily' },
    { loc: 'https://taleempk.pk/?action=predictor',   lastmod: today, priority: '0.7', changefreq: 'monthly' },
    { loc: 'https://taleempk.pk/?action=merit',       lastmod: today, priority: '0.7', changefreq: 'monthly' },
    { loc: 'https://taleempk.pk/?action=scholarships',lastmod: today, priority: '0.7', changefreq: 'monthly' },
  ];

  // Dedupe blog slugs too
  const seenBlogSlugs = new Set();
  const blogPages = blogPosts.reduce((acc, b) => {
    let slug = toSlug(b.title);
    if (!slug) return acc;
    if (seenBlogSlugs.has(slug)) slug = slug + '-' + acc.length;
    seenBlogSlugs.add(slug);
    acc.push({ loc: `https://taleempk.pk/blog/${slug}`, lastmod: lastmod(b), priority: '0.8', changefreq: 'monthly' });
    return acc;
  }, []);

  // Dedupe uni slugs
  const seenSlugs = new Set();
  const uniPages = unis.reduce((acc, u) => {
    let slug = toSlug(u.name);
    if (!slug) return acc;
    if (seenSlugs.has(slug)) slug = slug + '-' + u.id;
    seenSlugs.add(slug);
    acc.push({ loc: `https://taleempk.pk/university/${slug}`, lastmod: today, priority: '0.9', changefreq: 'weekly' });
    return acc;
  }, []);

  const allPages = [...staticPages, ...blogPages, ...uniPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url><loc>${p.loc}</loc><lastmod>${p.lastmod}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('sitemap.xml', xml);
  console.log(`sitemap.xml generated with ${allPages.length} URLs (${staticPages.length} static + ${blogPages.length} blog + ${uniPages.length} unis)`);
}

generate().catch(err => {
  console.error('sitemap generation failed:', err);
  process.exit(1); // Fail the CI/build so we don't ship an empty sitemap
});
