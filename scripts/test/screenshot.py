# Screenshot a pagina intera dopo aver scorso la pagina (così le animazioni di ingresso sono già avvenute). Scrive in /tmp/vqa/.
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright
PAGINE={'home':'/','lavori':'/lavori/','luca':'/lavori/luca-california/','acm':'/lavori/a-casa-mia/','taiko':'/lavori/taiko/','lazzi':'/lavori/lazzi/','milano':'/lavori/milano-clubs/','ikta':'/lavori/ikta/','privacy':'/privacy/','grazie':'/grazie/'}
LARG=[(390,844),(430,932),(834,1112),(1440,900)]
async def main():
    out=Path('/tmp/vqa'); out.mkdir(exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w,h in LARG:
            ctx=await b.new_context(viewport={'width':w,'height':h})
            await ctx.route('https://victoranalytics-live.vercel.app/**',lambda r:r.fulfill(status=204,body=''))
            await ctx.add_init_script("try{localStorage.setItem('sw_consent','denied');sessionStorage.setItem('sw_richiesta',JSON.stringify({nome:'Mario',attivita:'Bar Roma, Civitavecchia'}))}catch(e){}")
            pg=await ctx.new_page()
            for nome,url in PAGINE.items():
                await pg.goto('http://localhost:4522'+url,wait_until='networkidle'); await pg.add_style_tag(content='html{scroll-behavior:auto!important}')
                hh=await pg.evaluate("document.documentElement.scrollHeight")
                for y in range(0,hh,300): await pg.evaluate(f"window.scrollTo({{top:{y},behavior:'instant'}})"); await pg.wait_for_timeout(70)
                await pg.evaluate("window.scrollTo({top:0,behavior:'instant'})"); await pg.wait_for_timeout(700)
                await pg.screenshot(path=str(out/f'{nome}-{w}.png'),full_page=True)
            await ctx.close()
        await b.close()
asyncio.run(main())
