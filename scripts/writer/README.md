# Automatic article writer

Writes one long-form admission guide a week and publishes it as a static page
under `/blog/`, the same shape as every hand-written article.

## How the facts stay right

The model is never asked for a number.

| | Comes from |
|---|---|
| Fee, merit formula, entry test, seats, programmes, founding year | Supabase (`institutions`), via `topics.py` |
| The comparison table on the page | The same data, rendered by `write_article.py` |
| Prose — intro, sections, FAQs, conclusion | Claude, given those facts and told to use only them |

Before anything is published, `validate()` re-reads the draft and refuses it if:

- a number appears that is not in the facts brief (years and counts under 20 are allowed)
- the word count is outside 900–2400
- the title is over 60 characters, or the excerpt over 155
- there are fewer than four sections, or assistant boilerplate leaked in

A failed draft exits non-zero and publishes nothing. Nothing half-written reaches the site.

## Topics

`topics.py` builds every topic the current data can actually support — currently 44,
which is about ten months of weekly articles. Each one is used once; `state.json`
remembers which.

```
python scripts/writer/topics.py        # list them, and what has been used
```

Five kinds, all data-derived:

- `cat-<field>-<province>` — Best Engineering Universities in Punjab
- `budget-<amount>` — Universities Under Rs. 50,000 per Semester
- `city-<city>` — Universities in Lahore: Fees & Merit
- `test-<test>` — MDCAT 2026: Universities That Accept It
- `uni-<slug>` — COMSATS Admission 2026: Fees, Merit & Programs

A topic only appears when there is enough data behind it (at least six universities
with a published fee and merit), so no article is written about a table of blanks.

## Running it

```bash
# See the brief a topic would produce — no API call, no cost
python scripts/writer/write_article.py --dry-run

# Write and publish the next unused topic
ANTHROPIC_API_KEY=sk-ant-... python scripts/writer/write_article.py

# Force a particular topic
ANTHROPIC_API_KEY=sk-ant-... python scripts/writer/write_article.py --topic city-lahore
```

In CI it runs from `.github/workflows/write-article.yml` — Tuesdays, and on demand from
the Actions tab (where you can also force a topic or do a dry run). It needs the
repository secret `ANTHROPIC_API_KEY`.

Cost is about **$0.15 an article** on `claude-opus-5-5` — roughly $0.60 a month.

## After it publishes

The workflow re-runs `build-blog-archive.js` (so the new article is linked from
`/blog` in static markup) and `update-sitemap.js`, then commits. Cloudflare deploys
from `main` as usual.

## Adding a topic kind

Add a branch to `build_candidates()` in `topics.py` that returns `{key, title_hint,
angle, rows}`. `rows` must be built with `row()`, so the writer and the validator see
the same facts. Nothing else needs to change.
