#!/usr/bin/env python3
"""Build og-image.png from og-image.svg, with the university count taken from the data.

Three things were wrong with the shipped card, and it is the image every WhatsApp,
Facebook and Twitter share of every page displays:

  - "Compare 218 Universities" when there are 270
  - "Pakistan's #1 University Comparison Platform", the claim removed from the site
  - taleempk.com, which is not the domain

The count now comes from uni-data.js, so the card cannot drift from the site again.
The PNG is what the pages reference: Facebook, WhatsApp and Twitter do not render an
SVG og:image, and seventeen pages were pointing at the SVG.

    python scripts/build-og-image.py
"""
import io, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG = os.path.join(ROOT, 'og-image.svg')
PNG = os.path.join(ROOT, 'og-image.png')


def university_count():
    js = (
        "const fs=require('fs');let s=fs.readFileSync(%r,'utf8');"
        "const a=s.indexOf('const UNIVERSITIES'),b=s.indexOf('const DATA_UPDATES');"
        "eval(s.slice(a,b).replace('const UNIVERSITIES','var UNIVERSITIES'));"
        "process.stdout.write(String(UNIVERSITIES.length));"
    ) % os.path.join(ROOT, 'uni-data.js')
    return int(subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout)


def main():
    n = university_count()
    svg = io.open(SVG, encoding='utf-8').read()
    before = svg

    svg = re.sub(r'Compare\s+[\d,]+\s+Universities', f'Compare {n} Universities', svg)
    svg = svg.replace("Pakistan's #1 University Comparison Platform",
                      'Compare Universities in Pakistan')
    svg = re.sub(r'taleempk\.com', 'taleempk.pk', svg)

    if svg != before:
        io.open(SVG, 'w', encoding='utf-8', newline='\n').write(svg)
        print('og-image.svg updated')

    # The card is set in Sora. Without it installed the renderer silently falls back to
    # the system sans and the wordmark comes out in the wrong typeface — say so rather
    # than ship an off-brand card without anyone noticing.
    try:
        have_sora = b'Sora' in subprocess.run(['fc-list'], capture_output=True).stdout
    except FileNotFoundError:
        have_sora = False
    if not have_sora:
        print('WARNING: the Sora font is not installed — the wordmark will render in the '
              'system sans. Install Sora and re-run for the correct typography.')

    import cairosvg
    cairosvg.svg2png(bytestring=svg.encode('utf-8'), write_to='/tmp/og-raw.png',
                     output_width=1200, output_height=630)

    from PIL import Image
    im = Image.open('/tmp/og-raw.png').convert('RGB')
    # A flat brand card quantises with no visible loss; the shipped PNG was 328 KB.
    q = im.quantize(colors=128, method=Image.MEDIANCUT)
    q.save('/tmp/og-q.png', optimize=True)
    im.save('/tmp/og-rgb.png', optimize=True)
    best = min(['/tmp/og-q.png', '/tmp/og-rgb.png'], key=os.path.getsize)
    import shutil
    shutil.copy(best, PNG)
    print(f'og-image.png: {im.size[0]}×{im.size[1]} · {os.path.getsize(PNG)/1024:.0f} KB')
    return 0


if __name__ == '__main__':
    sys.exit(main())
