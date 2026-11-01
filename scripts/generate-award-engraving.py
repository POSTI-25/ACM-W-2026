"""Build handwritten award outlines. Requires fonttools and uharfbuzz."""
from pathlib import Path
import json
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.svgLib.path import parse_path

ROOT = Path(__file__).resolve().parents[1]
FONT = ROOT / 'public/fonts/AquilineTwo.ttf'
LINES = ['Best Emerging', 'Chapter Award']
font = TTFont(FONT)
glyphs = font.getGlyphSet()
upm = font['head'].unitsPerEm
factor = 150 / upm
hfont = hb.Font(hb.Face(FONT.read_bytes()))
hfont.scale = (upm, upm)
rows = []
for text in LINES:
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hfont, buf, {'kern': True, 'liga': True})
    rows.append((buf, sum(p.x_advance for p in buf.glyph_positions) * factor))

width = max(w for _, w in rows) + 40
out = []
for line, (buf, row_width) in enumerate(rows):
    advance = 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        transform = (factor, 0, 0, -factor,
                     (width-row_width)/2 + (advance+pos.x_offset)*factor,
                     165 + line*235 - pos.y_offset*factor)
        glyph = glyphs[font.getGlyphName(info.codepoint)]
        pen = SVGPathPen(glyphs, ntos=lambda x: f'{x:.2f}'.rstrip('0').rstrip('.') if x else '0')
        glyph.draw(TransformPen(pen, transform))
        if pen.getCommands():
            bounds = BoundsPen(glyphs)
            glyph.draw(TransformPen(bounds, transform))
            x0, y0, x1, y1 = bounds.bounds
            out.append({'d': pen.getCommands(), 'line': line,
                        'word': sum(len(text.split()) for text in LINES[:line]) + LINES[line][:info.cluster].count(' '),
                        'bounds': [round(v, 2) for v in (x0, y0, x1-x0, y1-y0)]})
        advance += pos.x_advance
# Preserve the long handwritten ascenders and descenders, including overhangs.
row_bounds = []
for line in range(len(LINES)):
    boxes = [g['bounds'] for g in out if g['line'] == line]
    row_bounds.append((min(b[0] for b in boxes), max(b[0]+b[2] for b in boxes)))
width = max(right-left for left, right in row_bounds) + 40
top = min(g['bounds'][1] for g in out)
bottom = max(g['bounds'][1]+g['bounds'][3] for g in out)
height = bottom-top+36
for glyph in out:
    left, right = row_bounds[glyph['line']]
    dx, dy = (width-(right-left))/2-left, 18-top
    pen = SVGPathPen(None, ntos=lambda x: f'{x:.2f}'.rstrip('0').rstrip('.') if x else '0')
    parse_path(glyph['d'], TransformPen(pen, (1, 0, 0, 1, dx, dy)))
    glyph['d'] = pen.getCommands()
    glyph['bounds'][0] = round(glyph['bounds'][0]+dx, 2)
    glyph['bounds'][1] = round(glyph['bounds'][1]+dy, 2)
artifact = {'text': 'Best Emerging Chapter Award', 'width': round(width, 2),
            'height': round(height, 2), 'glyphs': out}
path = ROOT / 'src/assets/award/award-engraving.json'
path.write_text(json.dumps(artifact, separators=(',', ':')))
print(f'{len(out)} glyphs, {artifact["width"]} x {artifact["height"]}, {path.stat().st_size} bytes')
