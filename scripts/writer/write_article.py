# Writes one full-length article and publishes it as a static page under /blog/.
#
# The division of labour is deliberate: every fact — fee, merit formula, entry test,
# programme count — comes out of Supabase in topics.py and is rendered into the page
# by this script. Claude is given those facts and writes the prose around them. It is
# never asked for a number, and the comparison table is built from the data, not from
# the model's output. Anything the model does write is checked against the brief
# before the page is published (see validate()).
#
#   ANTHROPIC_API_KEY=... python scripts/writer/write_article.py            # next topic
#   python scripts/writer/write_article.py --topic city-lahore              # a named one
#   python scripts/writer/write_article.py --dry-run                        # no API call
import argparse, datetime, html, io, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import topics as T

ROOT = T.ROOT
MODEL = 'claude-opus-5-5'
MIN_WORDS, MAX_WORDS = 900, 2400
esc = html.escape


# ── Prompt ───────────────────────────────────────────────────────────────────
SYSTEM = """You write admission guides for TaleemPK, a Pakistani university comparison site.
Your readers are students in Pakistan choosing where to apply, and their parents. Many are
the first in their family to go to university.

How to write:
- Plain, direct English. Short sentences. No marketing voice, no "embark on your journey",
  no "in today's competitive landscape".
- Address the reader as "you". Be concrete and practical: what to do, by when, what it costs.
- Acknowledge trade-offs honestly. A cheaper university is not automatically worse, and an
  expensive one is not automatically better. Say what each choice actually costs a student.
- Where the facts are silent, say so plainly ("this university does not publish its fee") —
  never fill a gap with a guess.

Hard rules about facts:
- You are given a FACTS block. Every fee, merit formula, entry test, seat count, founding
  year and programme name you state must come from it, verbatim.
- Do not state any number that is not in the FACTS block. No rankings, percentages,
  acceptance rates, salary figures or student counts of your own.
- Do not name a university that is not in the FACTS block.
- Do not invent deadlines or dates. The site's own calendar covers those.
- A comparison table is rendered separately from the data — do not write one.

Write British-influenced Pakistani English as used in Pakistani education writing
(programme, enrolment, Rs.). Use the university's short name after first mention."""


def build_prompt(topic, year):
    clean = [{k: v for k, v in r.items() if not k.startswith('_')} for r in topic['rows']]
    facts = json.dumps({'universities': clean}, ensure_ascii=False, indent=1)
    single = len(topic['rows']) == 1
    return f"""Write an article for TaleemPK.

TOPIC: {topic['title_hint'].format(year=year)}
ANGLE: {topic['angle']}

FACTS (the only facts you may state):
{facts}

Produce:
- title: under 60 characters, plain, includes {year}. No site name, no colon-heavy SEO phrasing.
- excerpt: one sentence under 155 characters describing what the reader gets.
- intro: 2-3 paragraphs. Open with the decision the reader is actually facing, not with a
  definition of the topic.
- sections: {'5-7' if not single else '5-6'} sections. Each has a heading, 2-4 paragraphs, and
  optionally a short bullet list. {'Group the universities by something a student actually decides on — budget, sector, entry test — rather than walking down the list one by one.' if not single else 'Cover the fee honestly, how the merit formula works in practice, the entry test, the programmes, and who this university suits.'}
  At least one section should deal with cost, and one with merit or the entry test.
- faqs: 3-4 questions a student would really type into Google, with direct answers.
- conclusion: 1-2 paragraphs. End with what to do next, not a summary.

Total length: 1100-1800 words across intro, sections and conclusion."""


SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "excerpt": {"type": "string"},
        "intro": {"type": "array", "items": {"type": "string"}},
        "sections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "heading": {"type": "string"},
                    "paragraphs": {"type": "array", "items": {"type": "string"}},
                    "bullets": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["heading", "paragraphs", "bullets"],
                "additionalProperties": False,
            },
        },
        "faqs": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"q": {"type": "string"}, "a": {"type": "string"}},
                "required": ["q", "a"],
                "additionalProperties": False,
            },
        },
        "conclusion": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["title", "excerpt", "intro", "sections", "faqs", "conclusion"],
    "additionalProperties": False,
}


def generate(topic, year):
    try:
        import anthropic
    except ImportError:
        raise SystemExit('the Anthropic SDK is not installed — run: pip install anthropic')
    if not (os.environ.get('ANTHROPIC_API_KEY') or os.environ.get('ANTHROPIC_AUTH_TOKEN')):
        raise SystemExit('ANTHROPIC_API_KEY is not set. Get one at console.anthropic.com, then\n'
                         '  export ANTHROPIC_API_KEY=sk-ant-...\n'
                         'In CI it is the repository secret of the same name.\n'
                         'To see what would be written without calling the API, pass --dry-run.')
    client = anthropic.Anthropic()
    kwargs = dict(
        model=MODEL,
        max_tokens=64000,
        system=SYSTEM,
        messages=[{"role": "user", "content": build_prompt(topic, year)}],
        thinking={"type": "adaptive"},
        output_config={"effort": "high", "format": {"type": "json_schema", "schema": SCHEMA}},
    )
    try:
        # Opus 5.5 can decline a request; the server-side fallback routes it to another
        # model rather than failing the run.
        with client.beta.messages.stream(
                betas=["server-side-fallback-2026-07-01"], fallbacks="default", **kwargs) as stream:
            msg = stream.get_final_message()
    except anthropic.BadRequestError as e:
        # If this deployment doesn't take the fallback beta, the article still matters more.
        print(f'fallback beta rejected ({e}) — retrying without it')
        with client.messages.stream(**kwargs) as stream:
            msg = stream.get_final_message()

    if msg.stop_reason == 'refusal':
        raise SystemExit(f'model declined the request: {getattr(msg, "stop_details", None)}')
    if msg.stop_reason == 'max_tokens':
        raise SystemExit('output hit max_tokens — article truncated, not publishing')
    text = next((b.text for b in msg.content if b.type == 'text'), None)
    if not text:
        raise SystemExit('no text block in the response')
    usage = msg.usage
    print(f'tokens: in {usage.input_tokens} · out {usage.output_tokens}')
    return json.loads(text)


# ── Validation ───────────────────────────────────────────────────────────────
NUM = re.compile(r'\d[\d,.]*')
BANNED = re.compile(r'\bas an AI\b|\bI cannot\b|\bI\'m unable\b|embark on (your|a) journey', re.I)


def prose_of(art):
    parts = list(art['intro']) + list(art['conclusion'])
    for s in art['sections']:
        parts += [s['heading']] + list(s['paragraphs']) + list(s.get('bullets') or [])
    for f in art['faqs']:
        parts += [f['q'], f['a']]
    return parts


def validate(art, topic, year):
    """Refuse to publish an article that states something the facts don't support."""
    problems = []
    body = ' '.join(prose_of(art))
    words = len(body.split())
    if not (MIN_WORDS <= words <= MAX_WORDS):
        problems.append(f'word count {words} outside {MIN_WORDS}-{MAX_WORDS}')
    if len(art['title']) > 60:
        problems.append(f'title is {len(art["title"])} chars (max 60)')
    if len(art['excerpt']) > 155:
        problems.append(f'excerpt is {len(art["excerpt"])} chars (max 155)')
    if BANNED.search(body):
        problems.append('contains assistant boilerplate')
    if len(art['sections']) < 4:
        problems.append(f'only {len(art["sections"])} sections')

    # Every number in the prose must appear somewhere in the facts — or be a plain
    # year, or a small number (counts like "three options") that states nothing factual.
    allowed = set()
    for r in topic['rows']:
        allowed |= set(NUM.findall(json.dumps(r, ensure_ascii=False)))
    allowed |= {str(y) for y in range(year - 6, year + 4)}
    invented = set()
    for tok in NUM.findall(body):
        clean = tok.rstrip('.,')
        if clean in allowed:
            continue
        bare = clean.replace(',', '')
        if bare.isdigit() and int(bare) <= 20:      # "three programmes", "top 10"
            continue
        if any(clean in a or a in clean for a in allowed if len(clean) > 2):
            continue
        invented.add(clean)
    if invented:
        problems.append('numbers not in the facts: ' + ', '.join(sorted(invented)[:8]))

    return problems


# ── Rendering ────────────────────────────────────────────────────────────────
def link_unis(text, rows):
    """Link each university's first mention to its own page."""
    seen = set()
    for r in sorted(rows, key=lambda x: -len(x['full_name'] or '')):
        for name in [r['full_name'], r['name']]:
            if not name or name.lower() in seen:
                continue
            pat = re.compile(r'(?<![\w>])(' + re.escape(esc(name)) + r')(?![\w<])')
            if pat.search(text):
                text = pat.sub(rf'<a href="/university/{r["slug"]}">\1</a>', text, count=1)
                seen.add(name.lower())
                break
    return text


def facts_table(rows):
    """Built from the data, never from the model."""
    if len(rows) < 2:
        r = rows[0]
        cells = [('Full name', r['full_name']), ('City', r['city']),
                 ('Sector', r['sector'].title()), ('Established', r['established']),
                 ('Fee per semester', r['fee']), ('Merit / eligibility', r['merit']),
                 ('Entry test', r['entry_test']), ('Seats', r['seats']),
                 ('Programmes', r['program_count'] or None)]
        body = ''.join(f'<tr><th>{esc(k)}</th><td>{esc(str(v))}</td></tr>'
                       for k, v in cells if v)
        return f'<div class="art-table-wrap"><table class="art-table"><tbody>{body}</tbody></table></div>'
    head = '<tr><th>University</th><th>City</th><th>Sector</th><th>Fee / semester</th><th>Merit</th></tr>'
    body = ''.join(
        f'<tr><td><a href="/university/{r["slug"]}">{esc(r["name"])}</a></td>'
        f'<td>{esc(r["city"] or "—")}</td><td>{esc(r["sector"].title())}</td>'
        f'<td>{esc(r["fee"] or "Not published")}</td>'
        f'<td>{esc((r["merit"] or "—")[:70])}</td></tr>' for r in rows)
    return ('<div class="art-table-wrap"><table class="art-table">'
            f'<thead>{head}</thead><tbody>{body}</tbody></table></div>')


def render_body(art, rows):
    p = lambda t: f'<p>{link_unis(esc(t), rows)}</p>'
    out = [p(t) for t in art['intro']]
    out.append(f'<h3>{esc("At a glance" if len(rows) > 1 else "Key facts")}</h3>')
    out.append(facts_table(rows))
    for s in art['sections']:
        out.append(f'<h3>{esc(s["heading"])}</h3>')
        out += [p(t) for t in s['paragraphs']]
        if s.get('bullets'):
            items = ''.join(f'<li>{link_unis(esc(b), rows)}</li>' for b in s['bullets'])
            out.append(f'<ul>{items}</ul>')
    if art['faqs']:
        out.append('<h3>Frequently asked questions</h3>')
        for f in art['faqs']:
            out.append(f'<p><strong>{esc(f["q"])}</strong><br>{link_unis(esc(f["a"]), rows)}</p>')
    out += [p(t) for t in art['conclusion']]
    out.append('<p><em>Fees and merit criteria change every intake. Confirm on the '
               'university\'s own website before you apply — and use the '
               '<a href="/">comparison tools on TaleemPK</a> to check the latest.</em></p>')
    return ''.join(out)


TABLE_CSS = """
  /* The comparison table has five columns; on a phone it must scroll rather than
     lose its right-hand columns off the edge. */
  .art-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 0 22px;}
  .art-table{width:100%;min-width:520px;border-collapse:collapse;font-size:.86rem;
    border:1px solid var(--gray-200,#E8ECF2);border-radius:10px;overflow:hidden;}
  .art-table thead th{background:var(--navy,#0A1628);color:#fff;text-align:left;
    padding:10px 12px;font-size:.8rem;font-weight:700;}
  .art-table th{text-align:left;padding:10px 12px;font-weight:700;vertical-align:top;width:30%;}
  .art-table td{padding:10px 12px;border-top:1px solid var(--gray-200,#E8ECF2);vertical-align:top;}
  .art-table tbody tr:nth-child(even){background:var(--gray-100,#F5F7FA);}
  @media(max-width:600px){.art-table{font-size:.78rem;} .art-table th,.art-table td{padding:8px 9px;}}
"""


def publish(art, topic, slug, today):
    title, excerpt = art['title'], art['excerpt']
    body = render_body(art, topic['rows'])
    url = f'https://taleempk.pk/blog/{slug}'

    shell = io.open(os.path.join(ROOT, 'blog', 'university-aggregate-merit-pakistan.html'),
                    encoding='utf-8').read()
    page = shell
    # The shell has no table styles — carry our own rather than depend on it.
    if '.art-table' not in page:
        page = page.replace('</style>', TABLE_CSS + '</style>', 1)
    page = re.sub(r'<title>.*?</title>', lambda m: f'<title>{esc(title)}</title>', page, flags=re.S)
    for attr, val in [('name="description"', excerpt), ('property="og:description"', excerpt),
                      ('name="twitter:description"', excerpt), ('property="og:title"', title),
                      ('name="twitter:title"', title)]:
        page = re.sub(rf'(<meta[^>]*{attr}[^>]*content=")[^"]*(")',
                      lambda m: m.group(1) + esc(val) + m.group(2), page, count=1)
    page = re.sub(r'(<link rel="canonical"[^>]*href=")[^"]*', lambda m: m.group(1) + url, page)
    page = re.sub(r'<script type="application/ld\+json">.*?</script>',
                  lambda m: '<script type="application/ld+json">' + json.dumps({
                      "@context": "https://schema.org", "@type": "Article", "headline": title,
                      "description": excerpt,
                      "author": {"@type": "Organization", "name": "TaleemPK Team"},
                      "publisher": {"@type": "Organization", "name": "TaleemPK",
                                    "url": "https://taleempk.pk"},
                      "datePublished": today.isoformat(), "dateModified": today.isoformat(),
                      "url": url}) + '</script>', page, count=1, flags=re.S)
    page = re.sub(r'<div class="article-cat">.*?</div>',
                  '<div class="article-cat">Admission Guide</div>', page, count=1, flags=re.S)
    page = re.sub(r'<h1 class="article-title">.*?</h1>',
                  lambda m: f'<h1 class="article-title">{esc(title)}</h1>', page, count=1, flags=re.S)
    page = re.sub(r'<div class="article-meta">.*?</div>',
                  lambda m: ('<div class="article-meta"><span>TaleemPK Team</span>'
                             f'<span>{today.strftime("%d %b %Y")}</span></div>'),
                  page, count=1, flags=re.S)
    page = re.sub(r'<div class="article-body">.*?</div>\s*</article>',
                  lambda m: f'<div class="article-body">{body}</div></article>',
                  page, count=1, flags=re.S)
    page = re.sub(r'(<span>)University Aggregate \(Merit\)(</span>)',
                  lambda m: m.group(1) + esc(title[:40]) + m.group(2), page)

    path = os.path.join(ROOT, 'blog', slug + '.html')
    io.open(path, 'w', encoding='utf-8', newline='\n').write(page)
    print('wrote', path)

    idx_path = os.path.join(ROOT, 'blog-index.json')
    idx = json.load(io.open(idx_path, encoding='utf-8')) if os.path.exists(idx_path) else []
    idx.insert(0, {"title": title, "category": "Admission Guide", "icon": "🎓",
                   "date": today.isoformat(), "excerpt": excerpt, "url": f"/blog/{slug}"})
    io.open(idx_path, 'w', encoding='utf-8', newline='\n').write(
        json.dumps(idx, ensure_ascii=False, indent=1))

    sm_path = os.path.join(ROOT, 'sitemap.xml')
    sm = io.open(sm_path, encoding='utf-8').read()
    if url not in sm:
        sm = sm.replace('</urlset>', f'<url><loc>{url}</loc><lastmod>{today.isoformat()}</lastmod>'
                                     f'<changefreq>monthly</changefreq><priority>0.7</priority></url></urlset>')
        io.open(sm_path, 'w', encoding='utf-8', newline='\n').write(sm)
        print('sitemap updated')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--topic', help='force a topic key (see: python scripts/writer/topics.py)')
    ap.add_argument('--dry-run', action='store_true', help='show the brief, call nothing')
    args = ap.parse_args()

    today = datetime.date.today()
    unis = T.load_institutions()
    topic = T.pick(unis, args.topic)
    if not topic:
        print('every topic has been used — add more in topics.py'); return 0
    print(f'topic: {topic["key"]} · {len(topic["rows"])} universities')

    if args.dry_run:
        print('\n' + build_prompt(topic, today.year)[:1800])
        return 0

    art = generate(topic, today.year)
    problems = validate(art, topic, today.year)
    if problems:
        print('NOT PUBLISHING — the draft failed validation:')
        for p in problems:
            print('  ·', p)
        return 1

    slug = re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', art['title'].lower()))
    if os.path.exists(os.path.join(ROOT, 'blog', slug + '.html')):
        slug = f'{slug}-{today.isoformat()}'
    publish(art, topic, slug, today)
    T.mark_used(topic['key'], slug)
    print(f'published /blog/{slug}  ({len(" ".join(prose_of(art)).split())} words)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
