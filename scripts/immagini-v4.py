#!/usr/bin/env python3
"""Prepara le immagini del redesign: da pacchetto (webp) a AVIF + WebP in due larghezze. Scrive src/v4/img/ e manifest.json."""
import json, os, sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
man = {}
SALTA = {'n-og3.webp', 'n-tex.webp'}
for f in sorted(os.listdir(src)):
    if not f.endswith('.webp') or f in SALTA: continue
    nome = f[:-5]
    im = Image.open(os.path.join(src, f)).convert('RGBA' if 'lg-' in nome or 'avatar' in nome else 'RGB')
    w, h = im.size
    if w >= 1000: larg = [800, w]
    elif w >= 700: larg = [400, w]
    else: larg = [w]
    voci = []
    for L in larg:
        im2 = im if L == w else im.resize((L, round(h * L / w)), Image.LANCZOS)
        for ext, kw in (('avif', dict(quality=55, speed=4)), ('webp', dict(quality=80, method=6))):
            im2.save(os.path.join(dst, f'{nome}-{L}.{ext}'), **kw)
        voci.append(L)
    man[nome] = {'w': w, 'h': h, 'larghezze': voci}
json.dump(man, open(os.path.join(dst, 'manifest.json'), 'w'), indent=1)
print(len(man), 'immagini')
