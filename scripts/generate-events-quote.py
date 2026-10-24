"""Generate shaped Great Vibes outlines (SIL OFL) for the decorative watermark.
Build-only requirements: fonttools, uharfbuzz. No runtime dependencies.
"""
from pathlib import Path
import json
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parents[1]
TEXT = 'little sparks, limitless dreams'
FONT = ROOT / 'public/fonts/GreatVibes-Regular.ttf'
font = TTFont(FONT)
glyphs = font.getGlyphSet()
upm = font['head'].unitsPerEm
factor = 200 / upm
hfont = hb.Font(hb.Face(FONT.read_bytes()))
hfont.scale = (upm, upm)
buf = hb.Buffer()
buf.add_str(TEXT)
buf.guess_segment_properties()
hb.shape(hfont, buf, {'kern': True, 'liga': True})

out = []
advance = 0
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    transform = (factor, 0, 0, -factor,
                 (advance + pos.x_offset) * factor + 20, 230 - pos.y_offset * factor)
    pen = SVGPathPen(glyphs, ntos=lambda x: f'{x:.2f}'.rstrip('0').rstrip('.') if x else '0')
    glyphs[font.getGlyphName(info.codepoint)].draw(TransformPen(pen, transform))
    if pen.getCommands():
        bounds = BoundsPen(glyphs)
        glyphs[font.getGlyphName(info.codepoint)].draw(TransformPen(bounds, transform))
        x0, y0, x1, y1 = bounds.bounds
        out.append({'d': pen.getCommands(), 'word': TEXT[:info.cluster].count(' '),
                    'bounds': [round(v, 2) for v in (x0, y0, x1 - x0, y1 - y0)]})
    advance += pos.x_advance
artifact = {'text': TEXT, 'width': round(advance * factor + 50, 2), 'height': 340, 'glyphs': out}
path = ROOT / 'src/assets/decor/events-quote.json'
path.write_text(json.dumps(artifact, separators=(',', ':')))
print(f'{len(out)} glyphs, {path.stat().st_size} bytes')
