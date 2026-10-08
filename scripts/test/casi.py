import asyncio, json, sys
from playwright.async_api import async_playwright
SLUGS=['luca-california','a-casa-mia','taiko','lazzi','milano-clubs','ikta']
W=[(360,740),(390,844),(430,932),(834,1112),(1440,900)]
JS="""() => {
 const out={w:innerWidth,sw:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight};
 out.overflow=[...document.querySelectorAll('main *, header *, footer *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&getComputedStyle(e).display!=='none'&&r.right>innerWidth+1}).slice(0,4).map(e=>e.className||e.tagName);
 out.rotte=[...document.images].filter(i=>getComputedStyle(i).display!=='none'&&i.complete&&i.naturalWidth===0).map(i=>i.src.split('/').pop());
 const vis=[...document.querySelectorAll('.caso-telefono,.caso-tile__cornice,.caso-schermi__img,.caso-barra,.caso-foto > div,.caso-schermo')].filter(e=>e.getBoundingClientRect().width>0).map(e=>Math.round(e.getBoundingClientRect().height));
 out.maxVisual=Math.max(...vis); out.maxTelefonoOTile=Math.max(...[...document.querySelectorAll('.caso-telefono,.caso-tile__cornice')].filter(e=>e.getBoundingClientRect().width>0).map(e=>Math.round(e.getBoundingClientRect().height)),0);
 out.blocchi=document.querySelectorAll('.caso-blocco').length;
 return out; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for (w,h) in W:
            ctx=await b.new_context(viewport={'width':w,'height':h})
            pg=await ctx.new_page()
            errs=[]
            pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
            for s in SLUGS:
                await pg.goto(f'http://localhost:4522/lavori/{s}/',wait_until='networkidle')
                await pg.evaluate("document.fonts.ready")
                await pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); await pg.wait_for_timeout(200)
                r=await pg.evaluate(JS)
                flag='' if (r['sw']<=r['w'] and not r['overflow'] and not r['rotte']) else '  <<< PROBLEMA'
                print(f"{w:>4} {s:<16} h={r['h']:<5} sw={r['sw']} maxVisual={r['maxVisual']:<4} ({round(100*r['maxVisual']/h)}%) tile/tel={r['maxTelefonoOTile']} blocchi={r['blocchi']} {r['overflow']} {r['rotte']}{flag}")
                if w==390: await pg.screenshot(path=f'/tmp/caso-{s}-390.png',full_page=True)
                if w==1440: await pg.screenshot(path=f'/tmp/caso-{s}-1440.png',full_page=True)
                if w==834: await pg.screenshot(path=f'/tmp/caso-{s}-834.png',full_page=True)
            await ctx.close()
        await b.close()
asyncio.run(main())
