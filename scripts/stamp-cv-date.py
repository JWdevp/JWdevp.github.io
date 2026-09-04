#!/usr/bin/env python3
"""
Stamp today's date onto the CV's signature line.

A German Lebenslauf ends with a place and a date — "Nürnberg, 3. September
2026" — which is the date the document was signed. This rewrites it to today
so the downloaded PDF never looks stale.

It runs against the BUILD OUTPUT, not the repository. The committed PDF stays
exactly as it came out of Word: a bot rewriting it would replace Jason's own
export with a PyMuPDF re-save, and his next export would then diff against
something he did not write. Stamping a copy also means the ~37 kB the font
costs to re-embed is paid once per build instead of accumulating.

The line is found by its shape rather than its coordinates, so re-exporting
from Word and having the text land somewhere else does not break it. It is
replaced using the document's own embedded font, so the result is the same
glyphs in the same place — only the digits change.

A CV that has no such line, or more than one, is left alone with a warning
rather than failing: the site should not stop deploying over a date.
"""

from __future__ import annotations

import re
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pymupdf

# The CV is written in German and signed in Germany, so "today" is today
# *there*. GitHub's scheduler runs in UTC, and for part of the year that is two
# hours behind Berlin — long enough to stamp a date that has not started yet.
TIMEZONE = ZoneInfo('Europe/Berlin')

MONTHS = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

# "<place>, <day>. <Month> <year>", the closing line of a Lebenslauf. The place
# is captured and kept — only the date is ours to change.
SIGNATURE = re.compile(
    r'^(?P<place>.+?),\s*\d{1,2}\.\s*(?:' + '|'.join(MONTHS) + r')\s*\d{4}\s*$'
)


def find_signature(doc: pymupdf.Document):
    """Every span in the document that reads as a signature line."""
    hits = []
    for page in doc:
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines', []):
                for span in line['spans']:
                    match = SIGNATURE.match(span['text'].strip())
                    if match:
                        hits.append((page, span, match.group('place')))
    return hits


def embedded_font(doc: pymupdf.Document, page: pymupdf.Page, font_name: str):
    """The page's own copy of the font the line is set in.

    Word embeds subsets, so the file inside the PDF is the only thing that is
    certain to carry these exact glyphs. Checked: this subset holds all twelve
    month names, umlaut included, and every digit.
    """
    for xref, *_rest in ((f[0], f) for f in page.get_fonts(full=True)):
        info = doc.extract_font(xref)
        if font_name in info[0]:
            return info[3]
    return None


def stamp(pdf: Path, today) -> bool:
    doc = pymupdf.open(pdf)
    hits = find_signature(doc)

    if len(hits) != 1:
        which = 'no signature line' if not hits else f'{len(hits)} signature lines'
        print(f'stamp-cv-date: {which} in {pdf.name}; leaving it alone', file=sys.stderr)
        return False

    page, span, place = hits[0]
    # Read now: closing the document invalidates the Page, and the read-back
    # below needs to know which page to look at.
    page_number = page.number
    was = span['text'].strip()
    now = f'{place}, {today.day}. {MONTHS[today.month - 1]} {today.year}'
    if was == now:
        print(f'stamp-cv-date: already reads "{now}"')
        return False

    font = embedded_font(doc, page, span['font'])
    if font is None:
        print(f'stamp-cv-date: cannot find the embedded {span["font"]}; leaving it alone',
              file=sys.stderr)
        return False

    with tempfile.NamedTemporaryFile(suffix='.ttf', delete=False) as handle:
        handle.write(font)
        font_path = handle.name

    box = pymupdf.Rect(span['bbox'])
    page.add_redact_annot(box)
    # Text only. The redaction must not touch the images on the page.
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)
    # From the span's own baseline, not the box's top, or the line sits high.
    page.insert_text(
        (box.x0, span['origin'][1]),
        now,
        fontname=span['font'],
        fontfile=font_path,
        fontsize=span['size'],
    )
    # Written beside the target and moved over it: PyMuPDF refuses to save onto
    # the file it has open, and a replace is atomic, so a build that dies
    # mid-save leaves the original rather than half a PDF.
    staged = pdf.with_suffix('.stamped.pdf')
    doc.save(staged, garbage=3, deflate=True)
    doc.close()
    staged.replace(pdf)

    # Read it back. A save that silently produced nothing readable is worse
    # than not stamping at all, because nobody would notice.
    check = pymupdf.open(pdf)
    written = [
        s['text'].strip()
        for b in check[page_number].get_text('dict')['blocks']
        for l in b.get('lines', [])
        for s in l['spans']
    ]
    check.close()
    if now not in written:
        print(f'stamp-cv-date: wrote "{now}" but cannot read it back', file=sys.stderr)
        return False

    print(f'stamp-cv-date: "{was}" -> "{now}"')
    return True


def main() -> int:
    if len(sys.argv) != 2:
        print('usage: stamp-cv-date.py <pdf>', file=sys.stderr)
        return 2
    pdf = Path(sys.argv[1])
    if not pdf.is_file():
        # The CV is optional — see public/cv/README.md.
        print(f'stamp-cv-date: no {pdf}, nothing to stamp')
        return 0
    stamp(pdf, datetime.now(TIMEZONE).date())
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
