# Generates an "Admission Updates" digest blog post from recently scraped items.
# Runs in CI right after scrape.py. Creates:
#   blog/admission-updates-YYYY-MM-DD.html   (static article page)
#   blog-index.json                          (blog.html merges this into its listing)
#   sitemap.xml                              (appends the new URL)
# Skips generation when fewer than MIN_ITEMS new items exist (avoid thin content).
import json, re, io, os, sys, urllib.request, datetime, html

try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception: pass

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MIN_ITEMS = 5
DAYS_BACK = 16   # one scraper cycle

cfg = io.open(os.path.join(ROOT, 'config.js'), encoding='utf-8').read()
BASE = re.search(r'SUPABASE_URL["\'\s:]+["\'](https://[^"\']+)', cfg).group(1)
KEY  = re.search(r'SUPABASE_ANON_KEY["\'\s:]+["\']([^"\']+)', cfg).group(1)

since = (datetime.datetime.utcnow() - datetime.timedelta(days=DAYS_BACK)).isoformat()
req = urllib.request.Request(
    BASE + f"/rest/v1/uni_updates?select=uni_name,title,url,kind,found_at&status=neq.dismissed&found_at=gte.{since}&order=uni_name.asc,found_at.desc",
    headers={'apikey': KEY, 'Authorization': 'Bearer ' + KEY})
items = json.load(urllib.request.urlopen(req, timeout=30))
print(f'items in window: {len(items)}')
if len(items) < MIN_ITEMS:
    print('below threshold — no digest generated'); sys.exit(0)

today = datetime.date.today()
slug  = f'admission-updates-{today.isoformat()}'
title = f'University Admission Updates — {today.strftime("%d %B %Y")}'
page_path = os.path.join(ROOT, 'blog', slug + '.html')
if os.path.exists(page_path):
    print('digest for today already exists'); sys.exit(0)

# Categorise each item, then group by category → university
esc = html.escape
def category(it):
    t = (it['title'] or '')
    if it['kind'] == 'fee' or re.search(r'fee', t, re.I): return 'fees'
    if re.search(r'scholarship|financial aid|endowment|stipend', t, re.I): return 'scholarships'
    if it['kind'] == 'deadline' or re.search(r'entry\s*test|mdcat|ecat|\bnet\b|\bnat\b|\bgat\b|deadline|last\s*date|merit\s*list|result', t, re.I): return 'tests'
    return 'admissions'

CATS = [
    ('admissions',   '🎓 Admissions & Announcements'),
    ('scholarships', '💰 Scholarships & Financial Aid'),
    ('fees',         '🧾 Fee Updates'),
    ('tests',        '📝 Tests, Deadlines & Merit Lists'),
]
by_cat = {}
for it in items:
    by_cat.setdefault(category(it), {}).setdefault(it['uni_name'] or 'Other', []).append(it)

sections = []
for key, label in CATS:
    unis = by_cat.get(key)
    if not unis: continue
    sections.append(f'<h3>{label}</h3>')
    for uni in sorted(unis):
        rows = ''.join(
            (f'<a href="{esc(it["url"])}" target="_blank" rel="noopener nofollow">{esc(it["title"])}</a>' if it.get('url') else esc(it['title']))
            .join(['<li>', '</li>'])
            for it in unis[uni][:6])
        sections.append(f'<p><strong>{esc(uni)}</strong></p><ul>{rows}</ul>')

uni_count = len({it['uni_name'] for it in items})
excerpt = (f'Latest admission announcements, deadlines and fee updates from '
           f'{uni_count} Pakistani universities — collected from official websites.')
body = (f'<p>Here are the latest updates our system collected from official university websites '
        f'over the past two weeks — {len(items)} announcements across <strong>{uni_count} universities</strong>. '
        f'Links go to the original source pages; always confirm details there.</p>'
        + ''.join(sections)
        + '<p><em>This digest is generated automatically from official university websites. '
        'Use the <a href="/">university comparison tools on TaleemPK</a> to check fees, merit and deadlines.</em></p>')

TEMPLATE = io.open(os.path.join(ROOT, 'blog', 'university-aggregate-merit-pakistan.html'), encoding='utf-8').read()
# reuse the existing article shell: swap head metadata + article content
page = TEMPLATE
page = re.sub(r'<title>.*?</title>', lambda m: f'<title>{esc(title)} | TaleemPK Blog</title>', page, flags=re.S)
page = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + esc(excerpt), page)
page = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + esc(title) + ' | TaleemPK', page)
page = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + esc(excerpt), page)
page = re.sub(r'(<meta name="twitter:title" content=")[^"]*', lambda m: m.group(1) + esc(title) + ' | TaleemPK', page)
page = re.sub(r'(<meta name="twitter:description" content=")[^"]*', lambda m: m.group(1) + esc(excerpt), page)
page = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + f'https://taleempk.pk/blog/{slug}', page)
page = re.sub(r'<script type="application/ld\+json">.*?</script>',
    lambda m: '<script type="application/ld+json">' + json.dumps({
        "@context":"https://schema.org","@type":"Article","headline":title,
        "description":excerpt,"author":{"@type":"Organization","name":"TaleemPK Team"},
        "publisher":{"@type":"Organization","name":"TaleemPK","url":"https://taleempk.pk"},
        "datePublished":today.isoformat(),"url":f"https://taleempk.pk/blog/{slug}"}) + '</script>',
    page, count=1, flags=re.S)
# swap the visible article header + body
page = re.sub(r'<div class="article-cat">.*?</div>', '<div class="article-cat">Admission Updates</div>', page, count=1, flags=re.S)
page = re.sub(r'<h1 class="article-title">.*?</h1>', lambda m: f'<h1 class="article-title">{esc(title)}</h1>', page, count=1, flags=re.S)
page = re.sub(r'<div class="article-meta">.*?</div>',
    lambda m: f'<div class="article-meta"><span>🤖 Auto-generated from official sources</span><span>📅 {today.strftime("%d %b %Y")}</span></div>',
    page, count=1, flags=re.S)
page = re.sub(r'<div class="article-body">.*?</div>\s*</article>',
    lambda m: f'<div class="article-body">{body}</div></article>', page, count=1, flags=re.S)
# breadcrumb tail
page = re.sub(r'(<span>)University Aggregate \(Merit\)(</span>)', r'\g<1>Admission Updates\g<2>', page)

io.open(page_path, 'w', encoding='utf-8', newline='\n').write(page)
print('wrote', page_path)

# blog-index.json (newest first)
idx_path = os.path.join(ROOT, 'blog-index.json')
idx = json.load(io.open(idx_path, encoding='utf-8')) if os.path.exists(idx_path) else []
idx.insert(0, {"title": title, "category": "Admission Updates", "icon": "🗞️",
               "date": today.isoformat(), "excerpt": excerpt, "url": f"/blog/{slug}"})
io.open(idx_path, 'w', encoding='utf-8', newline='\n').write(json.dumps(idx, ensure_ascii=False, indent=1))
print('blog-index.json updated:', len(idx), 'digest posts')

# sitemap
sm_path = os.path.join(ROOT, 'sitemap.xml')
sm = io.open(sm_path, encoding='utf-8').read()
loc = f'https://taleempk.pk/blog/{slug}'
if loc not in sm:
    sm = sm.replace('</urlset>', f'<url><loc>{loc}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url></urlset>')
    io.open(sm_path, 'w', encoding='utf-8', newline='\n').write(sm)
    print('sitemap updated')
