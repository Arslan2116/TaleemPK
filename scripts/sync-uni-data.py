# Regenerates the UNIVERSITIES seed in uni-data.js from Supabase.
# Makes the DB the single source of truth — run after any data change in Supabase:
#   python scripts/sync-uni-data.py
# Then bump ?v=N on uni-data.js in index.html + sw.js PRECACHE_URLS + CACHE_VERSION.
#
# Mapping mirrors mapInstitution() in app.js — keep the two in sync.
import json, re, io, urllib.request, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

cfg = io.open(os.path.join(ROOT, 'config.js'), encoding='utf-8').read()
BASE = re.search(r'SUPABASE_URL["\'\s:]+["\'](https://[^"\']+)', cfg).group(1)
KEY  = re.search(r'SUPABASE_ANON_KEY["\'\s:]+["\']([^"\']+)', cfg).group(1)

req = urllib.request.Request(
    BASE + '/rest/v1/institutions?select=*,fee_details(label,value,sort_order)&order=rank.asc.nullslast,id.asc',
    headers={'apikey': KEY, 'Authorization': 'Bearer ' + KEY})
rows = json.load(urllib.request.urlopen(req, timeout=60))
print(f'fetched {len(rows)} institutions')

# Curated MERIT_MAP (kept in uni-data.js tail) wins over free-text parsing,
# mirroring mapInstitution() in app.js.
_ud = io.open(os.path.join(ROOT, 'uni-data.js'), encoding='utf-8').read()
_mm_block = re.search(r'const MERIT_MAP = \{(.*?)\};', _ud, re.S).group(1)
MERIT_MAP = {int(k): float(v) for k, v in re.findall(r'(\d+)\s*:\s*(\d+(?:\.\d+)?)', _mm_block)}

def merit_min(s, uid=None):
    if uid in MERIT_MAP: return MERIT_MAP[uid]
    # mirrors _parseMeritMin() in app.js
    if not s: return 50
    nums = [float(n) for n in re.findall(r'\d+(?:\.\d+)?', str(s))]
    valid = [n for n in nums if 10 <= n <= 99]
    return min(valid) if valid else 50

def map_row(r):
    u = {
        'id': r['id'], 'rank': r.get('rank') or 0, 'name': r['name'], 'full': r.get('full_name'),
        'city': r.get('city'), 'province': r.get('province'), 'type': r.get('sector'),
        'icon': r.get('icon'), 'tags': r.get('tags') or [], 'fee': r.get('fee'),
        'feeNum': r.get('fee_num') or 0, 'merit': r.get('merit'),
        'meritMin': merit_min(r.get('merit'), r['id']), 'entry': r.get('entry'),
        'programs': r.get('programs') or [], 'seats': r.get('seats'),
        'established': r.get('established'), 'website': r.get('website'),
        'logoUrl': r.get('logo_url') or '', 'description': r.get('description'),
        'highlights': r.get('highlights') or [], 'scholarships': r.get('scholarships'),
        'hostel': r.get('hostel'),
        'feeDetails': [{'label': f['label'], 'value': f['value']}
                       for f in sorted(r.get('fee_details') or [], key=lambda f: f.get('sort_order') or 0)],
    }
    if r.get('fee_year'): u['feeYear'] = r['fee_year']
    if r.get('fee_note'): u['feeNote'] = r['fee_note']
    return u

unis = [map_row(r) for r in rows]
arr = ',\n'.join('  ' + json.dumps(u, ensure_ascii=False) for u in unis)

path = os.path.join(ROOT, 'uni-data.js')
src = io.open(path, encoding='utf-8').read()

# Replace everything from "const UNIVERSITIES" through the DATA_UPDATES merge line,
# keeping the tail (LOGO_OVERRIDES, logo helpers, MERIT_MAP) untouched.
tail_marker = 'UNIVERSITIES.forEach(u=>{ if(DATA_UPDATES[u.id]) Object.assign(u, DATA_UPDATES[u.id]); });'
idx = src.index(tail_marker)
head_idx = src.index('const UNIVERSITIES = [')

new_block = (
    'const UNIVERSITIES = [\n' + arr + '\n];\n'
    '// DATA_UPDATES intentionally empty — Supabase is the single source of truth.\n'
    '// Regenerate this file with: python scripts/sync-uni-data.py\n'
    'const DATA_UPDATES = {};\n'
)
out = src[:head_idx] + new_block + src[idx:]
io.open(path, 'w', encoding='utf-8', newline='\n').write(out)
print(f'uni-data.js regenerated: {len(unis)} universities, {os.path.getsize(path)//1024}KB')
print('REMINDER: bump ?v=N in index.html and sw.js (PRECACHE_URLS + CACHE_VERSION)')
