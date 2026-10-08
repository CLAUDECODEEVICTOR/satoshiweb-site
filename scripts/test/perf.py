# Performance (Fase 6): peso per tipo, LCP/CLS con rete e CPU rallentate, immagini sovradimensionate, lazy loading, asset inutilizzati.
# Nessuna richiesta esterna reale (analytics intercettati). Uso: python3 scripts/test/perf.py
import asyncio, re, sys
from pathlib import Path
from playwright.async_api import async_playwright
BASE='http://localhost:4522'; R=Path(__file__).resolve().parents[2]; PUB=R/'public'
PAGINE=[('/',390,844),('/',1440,900),('/lavori/luca-california/',390,844),('/lavori/taiko/',390,844),('/privacy/',390,844)]
problemi=[]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for url,w,h in PAGINE:
            ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2 if w<500 else 1,is_mobile=w<500,has_touch=w<500)
            await ctx.route('https://victoranalytics-live.vercel.app/**',lambda r:r.fulfill(status=204,body=''))
            await ctx.route('https://www.googletagmanager.com/**',lambda r:r.fulfill(status=200,body=''))
            await ctx.add_init_script("try{localStorage.setItem('sw_consent','denied')}catch(e){}")
            pg=await ctx.new_page(); cdp=await ctx.new_cdp_session(pg)
            await cdp.send('Network.enable')
            await cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':150,'downloadThroughput':1600*1024/8,'uploadThroughput':750*1024/8})
            await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
            tip={}; richieste=[]; mappa={}
            cdp.on('Network.responseReceived',lambda e: mappa.__setitem__(e['requestId'],(e['response']['url'],e['type'])))
            def fin(e):
                u,t=mappa.get(e['requestId'],('?','?')); richieste.append((u,t,e['encodedDataLength']))
            cdp.on('Network.loadingFinished',fin)
            await pg.add_init_script("""window.__m={lcp:null,cls:0,fcp:null};
              new PerformanceObserver(l=>{for(const e of l.getEntries())window.__m.lcp={t:Math.round(e.startTime),tag:e.element?e.element.tagName:'',url:(e.url||'').split('/').pop(),size:e.size}}).observe({type:'largest-contentful-paint',buffered:true});
              new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__m.cls+=e.value}).observe({type:'layout-shift',buffered:true});
              new PerformanceObserver(l=>{for(const e of l.getEntries())if(e.name==='first-contentful-paint')window.__m.fcp=Math.round(e.startTime)}).observe({type:'paint',buffered:true});""")
            await pg.goto(BASE+url,wait_until='networkidle'); await pg.wait_for_timeout(600)
            m=await pg.evaluate("window.__m")
            for t in ('Document','Stylesheet','Script','Font','Image'):
                tip[t]=(sum(1 for r in richieste if r[1]==t and r[0].startswith(BASE)),sum(r[2] for r in richieste if r[1]==t and r[0].startswith(BASE)))
            tot=sum(r[2] for r in richieste if r[0].startswith(BASE))
            # immagini: sovradimensionate e lazy sopra la piega (dopo aver scorso la pagina)
            info=await pg.evaluate("""async()=>{const hh=document.documentElement.scrollHeight;for(let y=0;y<hh;y+=500){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,40))}window.scrollTo(0,0);
              const dpr=devicePixelRatio;const out={sovra:[],lazySopra:[],totale:0};
              for(const i of document.images){const r=i.getBoundingClientRect();if(r.width<2||getComputedStyle(i).display==='none'||!i.currentSrc)continue;out.totale++;
                const nat=i.naturalWidth;const serve=r.width*dpr;if(nat>serve*2.2&&nat>400)out.sovra.push(i.currentSrc.split('/').pop()+' '+nat+'px per '+Math.round(serve)+'px');
                if(i.loading==='lazy'&&r.top<innerHeight&&r.bottom>0)out.lazySopra.push(i.currentSrc.split('/').pop())}return out}""")
            print(f'\\n== {url} a {w}px (rete 1,6 Mbps / 150 ms, CPU 4x)')
            print(f'   FCP {m["fcp"]} ms  LCP {m["lcp"]["t"] if m["lcp"] else None} ms ({m["lcp"]["tag"]} {m["lcp"]["url"]})  CLS {m["cls"]:.4f}')
            print('   richieste/peso proprio: '+'  '.join(f'{k} {v[0]}/{v[1]/1024:.0f}KB' for k,v in tip.items())+f'  TOTALE {tot/1024:.0f} KB, {sum(v[0] for v in tip.values())} richieste')
            if info['sovra']: print('   immagini molto più grandi del necessario:',info['sovra'])
            if info['lazySopra']: print('   lazy sopra la piega:',info['lazySopra'])
            if m['cls']>0.02: problemi.append(f'{url}@{w}: CLS {m["cls"]}')
            if m['lcp'] and m['lcp']['tag']=='IMG' and info['lazySopra'] and m['lcp']['url'] in info['lazySopra']: problemi.append(f'{url}@{w}: l\'elemento LCP è lazy')
            await ctx.close()
        await b.close()
    # asset inutilizzati nel build
    testo=''.join(f.read_text(errors='ignore') for f in PUB.rglob('*') if f.suffix in ('.html','.css','.js') and 'node_modules' not in str(f))
    non=[]
    for cart in ('img','og','font','css','js'):
        for f in (PUB/cart).glob('*'):
            if f.name not in testo and f.suffix!='.svg' or (f.suffix=='.svg' and f.name not in testo): non.append(str(f.relative_to(PUB)))
    leg=[f for f in non]
    print('\\n== asset nel build non referenziati da nessuna pagina:',leg if leg else 'nessuno')
    pes=sorted(((f.stat().st_size,f.name) for f in (PUB/'img').glob('*.webp')),reverse=True)[:5]
    print('== le 5 immagini più pesanti:',[(n,s//1024) for s,n in pes])
    print('== font:',[(f.name.split('.')[0],f.stat().st_size//1024) for f in (PUB/'font').glob('*')])
    print('\\nPROBLEMI:',problemi if problemi else 'nessuno'); sys.exit(1 if problemi else 0)
asyncio.run(main())
