# Переводит надписи логотипа шрифтом UnifrakturMaguntia (OFL, пакет @fontsource/unifrakturmaguntia) в кривые
# для src/data/wordmark.ts. Сам шрифт сайт не загружает: в нём нет кириллицы, а логотип латиницей.
#   python3 tools/wordmark.py путь/к/unifrakturmaguntia-latin-400-normal.woff2 > src/data/wordmark.ts
import re, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

font = TTFont(sys.argv[1])
glyphs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]

def outline(text, pad=30):
    pen, bounds, x = SVGPathPen(glyphs), BoundsPen(glyphs), 0
    for ch in text:
        g = cmap[ord(ch)]
        glyphs[g].draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))
        glyphs[g].draw(TransformPen(bounds, (1, 0, 0, -1, x, 0)))
        x += hmtx[g][0]
    x0, y0, x1, y1 = bounds.bounds
    d = re.sub(r"-?\d+\.\d+", lambda m: str(round(float(m.group()))), pen.getCommands())
    return f"{x0 - pad:.0f} {y0 - pad:.0f} {x1 - x0 + 2 * pad:.0f} {y1 - y0 + 2 * pad:.0f}", d

print("// Сгенерировано tools/wordmark.py, руками не править")
for name, text in (("wordmark", "Russian Gothic Club"), ("monogram", "RGC")):
    vb, d = outline(text)
    print(f'export const {name} = {{ viewBox: "{vb}", d: "{d}" }};')
