# Picks the next article topic and assembles the facts it must be written from.
#
# Nothing here calls an LLM. The point is that every number the article can use
# has already been pulled from Supabase by the time the writer runs — the model
# is given the facts and told to use only those, so it has nothing to invent.
#
# A topic is used once; scripts/writer/state.json remembers which ones have run.
import json, os, io, re, datetime, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'state.json')

NO_FEE = re.compile(r'check\s+university\s+website', re.I)
PLACEHOLDER = re.compile(r'^\s*(|—|-|–|n/?a|tbd|unknown)\s*$', re.I)


def has(v):
    return v is not None and not PLACEHOLDER.match(str(v))


def slugify(name):
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', re.sub(r'[()]', '', (name or '').lower())))


COLS = ('id,name,full_name,city,province,type,rank,fee,fee_num,merit,entry,seats,'
        'programs,established,website,scholarships,hostel,tags')


def _from_seed():
    """uni-data.js is generated from the same table, so it is a faithful offline copy.
    Node reads it because the seed is a JS object literal, not JSON."""
    import subprocess
    js = (
        "const fs=require('fs');let s=fs.readFileSync(%r,'utf8');"
        "const a=s.indexOf('const UNIVERSITIES'),b=s.indexOf('const DATA_UPDATES');"
        "eval(s.slice(a,b).replace('const UNIVERSITIES','var UNIVERSITIES'));"
        "process.stdout.write(JSON.stringify(UNIVERSITIES.map(u=>({id:u.id,name:u.name,"
        "full_name:u.full,city:u.city,province:u.province,type:u.type,rank:u.rank,fee:u.fee,"
        "fee_num:u.feeNum,merit:u.merit,entry:u.entry,seats:u.seats,programs:u.programs,"
        "established:u.established,website:u.website,scholarships:u.scholarships,"
        "hostel:u.hostel,tags:u.tags}))));"
    ) % os.path.join(ROOT, 'uni-data.js')
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def load_institutions():
    """Supabase is the source of truth; fall back to the seed when it is unreachable."""
    try:
        cfg = io.open(os.path.join(ROOT, 'config.js'), encoding='utf-8').read()
        base = re.search(r'SUPABASE_URL["\'\s:]+["\'](https://[^"\']+)', cfg).group(1)
        key = re.search(r'SUPABASE_ANON_KEY["\'\s:]+["\']([^"\']+)', cfg).group(1)
        req = urllib.request.Request(
            base + f'/rest/v1/institutions?select={COLS}&order=rank.asc',
            headers={'apikey': key, 'Authorization': 'Bearer ' + key})
        rows = json.load(urllib.request.urlopen(req, timeout=40))
        if rows:
            return rows
    except Exception as e:
        print(f'Supabase unreachable ({e}) — using the uni-data.js seed')
    return _from_seed()


def row(u):
    """The subset of a university the writer is allowed to state as fact."""
    return {
        'name': u.get('name'),
        'full_name': u.get('full_name') or u.get('name'),
        'slug': slugify(u.get('name')),
        'city': (u.get('city') or '').split('/')[0].split(',')[0].strip(),
        'province': u.get('province'),
        'sector': 'public' if u.get('type') == 'public' else 'private',
        'established': u.get('established'),
        'fee': u.get('fee') if has(u.get('fee')) and not NO_FEE.search(u.get('fee') or '') else None,
        'fee_num': u.get('fee_num') or None,
        'merit': u.get('merit') if has(u.get('merit')) else None,
        'entry_test': u.get('entry') if has(u.get('entry')) else None,
        'seats': u.get('seats') if has(u.get('seats')) else None,
        'scholarships': u.get('scholarships') if has(u.get('scholarships')) else None,
        'hostel': u.get('hostel') if has(u.get('hostel')) else None,
        'programs': (u.get('programs') or [])[:12],
        '_all_programs': u.get('programs') or [],
        'program_count': len(u.get('programs') or []),
        'rank': u.get('rank') or None,
    }


CATEGORIES = [
    ('engineering', 'Engineering'), ('medical', 'Medical'),
    ('cs', 'Computer Science'), ('business', 'Business'),
]
# A university's programme list is truncated for the brief, so for a category article
# show the programmes that category is about — otherwise LUMS turns up in an engineering
# guide with twelve non-engineering degrees listed and nothing to write about.
PROG_RE = {
    'engineering': re.compile(r'engineering|\bengg\b|architect', re.I),
    'medical': re.compile(r'\bmbbs\b|\bbds\b|pharm|nursing|\bdpt\b|medical|dental|health', re.I),
    'cs': re.compile(r'computer|software|\bit\b|artificial intelligence|data science|cyber', re.I),
    'business': re.compile(r'business|\bbba\b|\bmba\b|management|account|finance|commerce|economics', re.I),
}


def focus_programs(r, tag):
    """Re-pick the 12 programmes shown so they match what the article is about."""
    rx = PROG_RE.get(tag)
    if not rx:
        return r
    hits = [p for p in (r.get('_all_programs') or r['programs']) if rx.search(p)]
    if not hits:
        return r
    out = dict(r)
    out['programs'] = hits[:12]
    out['relevant_program_count'] = len(hits)
    return out
PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Federal']
TESTS = [('MDCAT', r'mdcat'), ('ECAT', r'ecat'), ('NTS NAT', r'\bnat\b|\bnts\b'), ('NUST NET', r'\bnet\b')]


def _sorted(rows):
    return sorted(rows, key=lambda r: (r['rank'] or 9999, r['name'] or ''))


def build_candidates(unis):
    """Every topic the current data can actually support, best first."""
    out = []
    rows = [row(u) for u in unis]
    tagged = {u['id']: (u.get('tags') or []) for u in unis}
    by_id = {u['id']: r for u, r in zip(unis, rows)}

    def tagged_rows(tag):
        return [by_id[i] for i, t in tagged.items() if tag in (t or [])]

    # 1. Category within a province
    for tag, label in CATEGORIES:
        for prov in PROVINCES:
            sel = [r for r in tagged_rows(tag) if r['province'] == prov and r['fee'] and r['merit']]
            if len(sel) >= 6:
                out.append({
                    'key': f'cat-{tag}-{prov.lower()}',
                    'title_hint': f'Best {label} Universities in {prov} ({{year}})',
                    'angle': (f'A guide for a student in {prov} choosing a degree in {label.lower()}: '
                              f'who is affordable, who is competitive, and what each one asks for.'),
                    'rows': [focus_programs(r, tag) for r in _sorted(sel)[:12]],
                })

    # 2. Budget
    for cap, label in [(50000, 'Rs. 50,000'), (100000, 'Rs. 1 Lakh')]:
        sel = [r for r in rows if r['fee_num'] and r['fee_num'] <= cap and r['merit']]
        if len(sel) >= 8:
            out.append({
                'key': f'budget-{cap}',
                'title_hint': f'Universities Under {label} per Semester ({{year}})',
                'angle': ('A guide for a student whose family budget is the deciding factor — what is '
                          'genuinely affordable, and what the trade-offs are.'),
                'rows': sorted(sel, key=lambda r: r['fee_num'])[:14],
            })

    # 3. City
    cities = {}
    for r in rows:
        if r['city'] and r['fee'] and r['merit']:
            cities.setdefault(r['city'], []).append(r)
    for city, sel in cities.items():
        if len(sel) >= 6:
            out.append({
                'key': f'city-{slugify(city)}',
                'title_hint': f'Universities in {city}: Fees & Merit ({{year}})',
                'angle': (f'A guide for a student who wants to study in {city} — what the city offers '
                          f'across sectors and budgets.'),
                'rows': _sorted(sel)[:12],
            })

    # 4. Entry test
    for label, pattern in TESTS:
        rx = re.compile(pattern, re.I)
        sel = [r for r in rows if r['entry_test'] and rx.search(r['entry_test'])]
        if len(sel) >= 6:
            out.append({
                'key': f'test-{slugify(label)}',
                'title_hint': f'{label} {{year}}: Universities That Accept It',
                'angle': (f'A guide for a student who has taken or is preparing for {label} — where that '
                          f'score can actually be used, and what else each university weighs.'),
                'rows': _sorted(sel)[:14],
            })

    # 5. Single-university deep guide, for the ones people search by name
    for r in _sorted([r for r in rows if r['rank'] and r['fee'] and r['merit'] and r['programs']])[:25]:
        out.append({
            'key': f'uni-{r["slug"]}',
            'title_hint': f'{r["name"]} Admission {{year}}: Fees, Merit & Programs',
            'angle': (f'A complete admission guide to {r["full_name"]} — the fee, how merit is actually '
                      f'calculated, the entry test, and what it offers.'),
            'rows': [r],
        })
    return out


def load_state():
    if os.path.exists(STATE):
        return json.load(io.open(STATE, encoding='utf-8'))
    return {'used': []}


def save_state(st):
    io.open(STATE, 'w', encoding='utf-8', newline='\n').write(
        json.dumps(st, ensure_ascii=False, indent=1))


def pick(unis, force_key=None):
    """Next unused topic, with its facts attached. None when everything is used."""
    st = load_state()
    used = set(st.get('used', []))
    cands = build_candidates(unis)
    if force_key:
        return next((c for c in cands if c['key'] == force_key), None)
    for c in cands:
        if c['key'] not in used:
            return c
    return None


def mark_used(key, slug):
    st = load_state()
    st.setdefault('used', []).append(key)
    st.setdefault('published', []).append(
        {'key': key, 'slug': slug, 'date': datetime.date.today().isoformat()})
    save_state(st)


if __name__ == '__main__':
    unis = load_institutions()
    cands = build_candidates(unis)
    used = set(load_state().get('used', []))
    print(f'{len(unis)} universities · {len(cands)} possible topics · {len(used)} already used')
    for c in cands[:40]:
        mark = 'used' if c['key'] in used else '    '
        print(f'  [{mark}] {c["key"]:28} {c["title_hint"].format(year=datetime.date.today().year)}'
              f'  ({len(c["rows"])} unis)')
