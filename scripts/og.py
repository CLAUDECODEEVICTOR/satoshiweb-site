#!/usr/bin/env python3
"""Genera le immagini OG (1200x630) e l'apple-touch-icon dal design V3.1. Passo LOCALE (non gira su Vercel):
scrive src/og/*.jpg e src/brand/apple-touch-icon.png, che si committano. Usa Playwright (già presente) e i font di src/font/.
Il file Satoshi serve solo per rendere il nome nell'immagine (il risultato è un'immagine, non il font).
Uso: python3 scripts/og.py"""
import asyncio, glob, os, sys
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright

R=Path(__file__).resolve().parent.parent
FONT=R/'src/font'
def f(nome):
    g=glob.glob(str(FONT/nome)); return Path(g[0]).as_uri() if g else None
CSS_FONT=''.join(f'@font-face{{font-family:"{fam}";font-weight:{w};src:url({u}) format("woff2")}}' for fam,w,u in [
    ('Bricolage Grotesque','200 800',f('bricolage-grotesque-200-800.woff2')),('Geist','400',f('geist-400.woff2')),
    ('Geist','600',f('geist-600.woff2')),('Satoshi','700',f('satoshi-700.woff2'))] if u)
def img(chiave):
    for ext in ('webp','png','jpg'):
        p=R/'src/asset'/f'{chiave}.{ext}'
        if p.exists(): return p.as_uri()
    raise SystemExit('immagine non trovata: '+chiave)
MARK=(R/'src/asset/brand/satoshi-mark.svg').as_uri()

# (file, etichetta, titolo, riga, immagine, tipo, badge, dimensione titolo)
VOCI=[
 ('home','Siti web per attività e professionisti',None,'Su misura e pensato per il telefono.','acasamia/acm-mobile','telefono',None,80),
 ('luca-california','PR e organizzatore di eventi · Roma','Luca California','Un sito e un pannello per gestire le richieste dal telefono.','luca/luca-m-hero','telefono',None,92),
 ('a-casa-mia','Caffè e brunch · Civitavecchia','A casa mia','Un sito pensato prima di tutto per il telefono.','acasamia/acm-mobile','telefono',None,100),
 ('taiko','Serate house','Taiko','Sito con richiesta d\'accesso e pannello per gestirle.','taiko/sito-hero','schermo','In anteprima',100),
 ('lazzi','Barbiere · Civitavecchia','Lazzi Barbershop','Il sito e lo shop online, con gestione dal pannello.','lazzi/scheda-mobile','telefono',None,80),
 ('milano-clubs','PR e concierge · Milano','Milano Clubs Reservation','Le richieste arrivano dal sito e si gestiscono dal pannello.','milano/pannello-richieste-mobile','telefono',None,66),
 ('ikta','Federazione sportiva','IKTA','Mettere ordine tra discipline, gare ed eventi.','ikta/discipline','schermo',None,100),
]
def html(v):
    file,eti,titolo,riga,chiave,tipo,badge,dim=v
    if titolo is None:
        tit=f'<h1 style="font-size:{dim}px">Costruisco <span class="hl">il sito giusto</span> per la tua attività.</h1>'
    else:
        tit=f'<h1 style="font-size:{dim}px">{titolo}</h1>'
    b=f'<span class="badge">{badge}</span>' if badge else ''
    cornice=('<div class="tel"><img src="%s"></div>'%img(chiave)) if tipo=='telefono' else ('<div class="sch"><img src="%s"></div>'%img(chiave))
    return f'''<!doctype html><meta charset=utf-8><style>{CSS_FONT}
*{{box-sizing:border-box;margin:0}}body{{width:1200px;height:630px;background:#F6F3EC;color:#17130F;font-family:Geist,sans-serif;position:relative;overflow:hidden}}
.sx{{position:absolute;left:64px;top:56px;bottom:52px;width:620px;display:flex;flex-direction:column}}
.marchio{{display:flex;align-items:center;gap:14px;font-family:Satoshi,'Bricolage Grotesque',sans-serif;font-weight:700;font-size:32px;letter-spacing:-.02em}}
.marchio img{{width:44px;height:48px}}
.mezzo{{margin-top:auto;margin-bottom:auto}}
.et{{font-size:17px;font-weight:600;letter-spacing:.14em;text-transform:uppercase}}
h1{{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;line-height:.96;letter-spacing:-.04em;margin-top:18px;text-wrap:balance}}
.hl{{background:#F5A623;padding:0 .1em}}
.riga{{margin-top:22px;font-size:27px;line-height:1.3;max-width:560px}}
.pie{{display:flex;align-items:center;gap:18px;font-size:22px;font-weight:600}}
.badge{{border:2px solid #17130F;padding:3px 12px;font-size:16px;letter-spacing:.08em;text-transform:uppercase}}
.dx{{position:absolute;right:0;top:0;bottom:0;width:516px;background:#F5A623}}
.tel{{position:absolute;left:88px;top:92px;width:340px;height:620px;border:5px solid #17130F;border-radius:38px 38px 0 0;overflow:hidden;background:#17130F}}
.tel img{{width:100%;height:auto;display:block}}
.sch{{position:absolute;left:44px;top:150px;width:520px;height:560px;border:5px solid #17130F;overflow:hidden;background:#17130F}}
.sch img{{height:100%;width:auto;min-width:100%;object-fit:cover;object-position:0 0}}
</style><div class=sx><div class=marchio><img src="{MARK}"><span>Satoshi Web</span></div>
<div class=mezzo><div class=et>{eti}</div>{tit}<p class=riga>{riga}</p></div>
<div class=pie><span>satoshiweb.it</span>{b}</div></div><div class=dx>{cornice}</div>'''

async def main():
    out=R/'src/og'; out.mkdir(exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':630})
        for v in VOCI:
            tmph=out/'_tmp.html'; tmph.write_text(html(v)); await pg.goto(tmph.as_uri(),wait_until='load')
            await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(300); tmph.unlink()
            tmp=out/f'{v[0]}.png'; await pg.screenshot(path=str(tmp))
            Image.open(tmp).convert('RGB').save(out/f'{v[0]}.jpg',quality=86,optimize=True); tmp.unlink()
            print(v[0], (out/f'{v[0]}.jpg').stat().st_size//1024,'KB')
        await b.close()
    # apple-touch-icon 180x180: marchio ambra su carta
    m=Image.open(R/'logo/satoshi-mark.png').convert('RGBA'); s=118/ max(m.size)
    m=m.resize((round(m.width*s),round(m.height*s)),Image.LANCZOS)
    ic=Image.new('RGB',(180,180),(246,243,236)); ic.paste(m,((180-m.width)//2,(180-m.height)//2),m)
    (R/'src/brand').mkdir(exist_ok=True); ic.save(R/'src/brand/apple-touch-icon.png',optimize=True); print('apple-touch-icon.png')
asyncio.run(main())
