# TaleemPK university-updates scraper.
# Visits every university's website, discovers admission/news pages, extracts
# announcement-like links, diffs against the previous run, and inserts NEW items
# into Supabase `uni_updates` (status=pending) for admin review.
#
# Run locally:   python scripts/scraper/scrape.py
# Runs in CI:    .github/workflows/scrape.yml (1st & 16th of every month)
#
# Env:
#   SUPABASE_SERVICE_KEY  — service-role key (writes bypass RLS). Falls back to
#                           read-only mode (prints findings, no insert) if absent.
import json, re, io, os, ssl, sys, hashlib, urllib.request, urllib.parse
import concurrent.futures
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATE_PATH = os.path.join(ROOT, 'scripts', 'scraper', 'state.json')

CTX = ssl.create_default_context(); CTX.check_hostname=False; CTX.verify_mode=ssl.CERT_NONE
UA = {'User-Agent': 'Mozilla/5.0 (compatible; TaleemPKBot/1.0; +https://taleempk.pk)'}

cfg = io.open(os.path.join(ROOT, 'config.js'), encoding='utf-8').read()
BASE = re.search(r'SUPABASE_URL["\'\s:]+["\'](https://[^"\']+)', cfg).group(1)
ANON = re.search(r'SUPABASE_ANON_KEY["\'\s:]+["\']([^"\']+)', cfg).group(1)
SERVICE = os.environ.get('SUPABASE_SERVICE_KEY', '')

# Candidate sub-pages to probe on every site (first that respond get scraped)
PROBE_PATHS = ['', '/admissions', '/admission', '/news', '/announcements', '/notices',
               '/notice', '/events', '/news-events', '/latest-news']

# A link is interesting if its text hits one of these
KEYWORDS = re.compile(
    r'admission|apply|deadline|merit\s*list|entry\s*test|fee|scholarship|'
    r'schedule|last\s*date|registration|prospectus|notification|result|'
    r'spring\s*20|fall\s*20|intake', re.I)
# ...but not if it's obvious chrome/nav noise
NOISE = re.compile(r'^(home|about|contact|login|apply now\W*$|read more|click here|more)$', re.I)

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self._href=None; self._buf=[]
    def handle_starttag(self, tag, attrs):
        if tag=='a':
            self._href=dict(attrs).get('href'); self._buf=[]
    def handle_data(self, data):
        if self._href is not None: self._buf.append(data)
    def handle_endtag(self, tag):
        if tag=='a' and self._href is not None:
            text=' '.join(''.join(self._buf).split())
            if text: self.links.append((text, self._href))
            self._href=None

def fetch(url, timeout=10):
    req=urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        if 'text/html' not in (r.headers.get('Content-Type') or 'text/html'): return None
        return r.read(400_000).decode('utf-8', 'ignore')

def scrape_uni(u):
    """Return list of (title, url) announcement candidates for one university."""
    site='https://www.'+u['website'].strip().strip('/')
    found={}
    pages=0
    for path in PROBE_PATHS:
        if pages>=4: break            # politeness: max 4 pages per site
        try:
            html=fetch(site+path)
            if not html: continue
            pages+=1
            p=LinkParser()
            try: p.feed(html)
            except Exception: pass
            for text, href in p.links:
                if len(text)<15 or len(text)>160: continue
                if NOISE.match(text) or not KEYWORDS.search(text): continue
                absu=urllib.parse.urljoin(site+path+'/', href or '')
                if urllib.parse.urlparse(absu).netloc.replace('www.','') not in site:
                    # keep only same-site links
                    if u['website'] not in absu: continue
                found.setdefault(text, absu)
                if len(found)>=12: break
        except Exception:
            continue
    return [(t, url) for t, url in found.items()]

def main():
    req=urllib.request.Request(BASE+'/rest/v1/institutions?select=id,name,website&website=not.is.null&order=id',
                               headers={'apikey':ANON,'Authorization':'Bearer '+ANON})
    unis=json.load(urllib.request.urlopen(req, timeout=30))
    print(f'scraping {len(unis)} universities...')

    state={}
    if os.path.exists(STATE_PATH):
        state=json.load(io.open(STATE_PATH, encoding='utf-8'))

    new_items=[]
    def work(u):
        items=scrape_uni(u)
        out=[]
        for title, url in items:
            h=hashlib.md5(f"{u['id']}|{title}".encode()).hexdigest()
            if h in state: continue
            state[h]={'uni':u['id'],'t':title[:80]}
            kind=('deadline' if re.search(r'deadline|last\s*date', title, re.I)
                  else 'fee' if re.search(r'fee', title, re.I) else 'announcement')
            out.append({'uni_id':u['id'],'uni_name':u['name'],'kind':kind,
                        'title':title,'url':url,'content_hash':h})
        return out

    with concurrent.futures.ThreadPoolExecutor(12) as ex:
        for items in ex.map(work, unis):
            new_items.extend(items)

    print(f'new items found: {len(new_items)}')
    for it in new_items[:40]:
        print(f"  [{it['kind']}] {it['uni_name']}: {it['title'][:70]}")

    if new_items and SERVICE:
        body=json.dumps(new_items).encode()
        req=urllib.request.Request(BASE+'/rest/v1/uni_updates', data=body, method='POST',
            headers={'apikey':SERVICE,'Authorization':'Bearer '+SERVICE,
                     'Content-Type':'application/json','Prefer':'resolution=ignore-duplicates'})
        urllib.request.urlopen(req, timeout=60)
        print('inserted into uni_updates (pending review)')
    elif new_items:
        print('SUPABASE_SERVICE_KEY not set — dry run, nothing inserted')

    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    io.open(STATE_PATH,'w',encoding='utf-8',newline='\n').write(json.dumps(state, ensure_ascii=False))
    print('state saved:', len(state), 'known items')

if __name__=='__main__':
    main()
