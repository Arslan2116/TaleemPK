// Run: node generate-sitemap.js
// Fetches all universities from Supabase and generates sitemap.xml with slug URLs

const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://vpioffkkzwbfnmpxpwgc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW9mZmtrendiZm5tcHhwd2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTc5ODksImV4cCI6MjA5NTczMzk4OX0.IUDmCzw6im094kilaTKw812GkVDC7a85AA4scs1X8YE';

function toSlug(name) {
  return (name || '').toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fetchUniversities() {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/institutions?select=id,name&order=id`;
    const options = {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function generate() {
  console.log('Fetching universities from Supabase...');
  const unis = await fetchUniversities();
  console.log(`Found ${unis.length} universities`);

  const today = new Date().toISOString().split('T')[0];
  // Blog posts
  const blogPosts = [
    { title: "Entry Test Preparation: A Smart Study Plan for ECAT & MDCAT" },
    { title: "How to Calculate Your University Aggregate (Merit) in Pakistan" },
    { title: "Top Scholarships for Pakistani University Students in 2026" },
    { title: "Public vs Private Universities in Pakistan: Which Is Right for You?" }
  ];

  const staticPages = [
    { loc: 'https://taleempk.pk/', priority: '1.0', changefreq: 'weekly' },
    ...blogPosts.map(b => ({ loc: `https://taleempk.pk/blog/${toSlug(b.title)}`, priority: '0.8', changefreq: 'monthly' }))
  ];

  // Deduplicate slugs (two universities may produce same slug)
  const seenSlugs = new Set();
  const uniPages = unis.reduce((acc, u) => {
    let slug = toSlug(u.name);
    if(seenSlugs.has(slug)) slug = slug + '-' + u.id;
    seenSlugs.add(slug);
    acc.push({ loc: `https://taleempk.pk/university/${slug}`, priority: '0.9', changefreq: 'weekly' });
    return acc;
  }, []);

  const allPages = [...staticPages, ...uniPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url><loc>${p.loc}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('sitemap.xml', xml);
  console.log(`sitemap.xml generated with ${allPages.length} URLs`);
}

generate().catch(console.error);
