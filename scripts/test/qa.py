# QA responsive e accessibilità (Fase 6) su tutte le pagine nuove e su quelle legacy incluse nel build.
# Nessuna richiesta reale. Uso: python3 scripts/test/qa.py
import asyncio, sys, json
from playwright.async_api import async_playwright
BASE='http://localhost:4522'
NUOVE=['/','/lavori/','/lavori/luca-california/','/lavori/a-casa-mia/','/lavori/taiko/','/lavori/lazzi/','/lavori/milano-clubs/','/lavori/ikta/','/privacy/','/grazie/','/404.html']
LEGACY=['/realizzazione-siti-web-civitavecchia/','/sviluppo-app-civitavecchia/','/chatbot-whatsapp/','/farsi-trovare-dalle-ai/']
LARGHEZZE=[(360,740),(390,844),(430,932),(834,1112),(1024,768),(1440,900)]
JS="""() => {
 const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
 const nome=e=>{const l=e.getAttribute('aria-labelledby');return (e.getAttribute('aria-label')||(l&&document.getElementById(l)&&document.getElementById(l).textContent)||e.textContent||[...e.querySelectorAll('img')].map(i=>i.getAttribute('alt')||'').join('')||e.getAttribute('title')||'').trim()};
 const o={w:innerWidth,sw:document.documentElement.scrollWidth};
 o.overflow=[...document.querySelectorAll('body *')].filter(e=>vis(e)&&getComputedStyle(e).position!=='fixed'&&e.getBoundingClientRect().right>innerWidth+1&&!e.closest('.legale__tabella')).slice(0,4).map(e=>(e.className&&e.className.baseVal===undefined?e.className:e.tagName)+'');
 o.rotte=[...document.images].filter(i=>vis(i)&&i.complete&&i.naturalWidth===0).map(i=>i.src.split('/').pop());
 o.h1=document.querySelectorAll('h1').length;
 const hs=[...document.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(h=>+h.tagName[1]);o.salti=hs.filter((l,i)=>i>0&&l-hs[i-1]>1).length;
 o.punti=['header','main','footer'].filter(t=>!document.querySelector(t));
 o.lang=document.documentElement.lang;
 o.senzaAlt=[...document.images].filter(i=>!i.hasAttribute('alt')).map(i=>i.src.split('/').pop());
 o.altVuotoNonDecorativo=[...document.images].filter(i=>vis(i)&&i.getAttribute('alt')===''&&!i.closest('a,button')&&i.width>60).map(i=>i.src.split('/').pop());
 o.senzaNome=[...document.querySelectorAll('a[href],button,summary,[role=button]')].filter(e=>vis(e)&&!nome(e)).map(e=>e.outerHTML.slice(0,60));
 const bersagli=[...document.querySelectorAll('a[href],button,summary,input:not([type=hidden]),textarea,select')].filter(e=>vis(e)&&!e.classList.contains('solo-sr')&&!e.classList.contains('salta'));
 o.piccoli=bersagli.filter(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);
   if(e.matches('.faq summary'))return false;                 // area di tocco allargata di 8 px sopra e sotto
   if(e.tagName==='A'&&s.display==='inline'&&e.closest('p,li,dd,figcaption'))return false;  // link dentro il testo: esente (WCAG 2.5.8)
   return r.height<44||r.width<44}).map(e=>{const r=e.getBoundingClientRect();return (e.tagName+'.'+(e.className||'')+' '+Math.round(r.width)+'x'+Math.round(r.height)+' "'+nome(e).slice(0,24)+'"')}).slice(0,6);
 const cta=document.getElementById('hero-cta');o.cta=cta?[Math.round(cta.getBoundingClientRect().top),Math.round(cta.getBoundingClientRect().bottom),innerHeight]:null;
 return o;}"""
errori=[]; avvisi=[]; n=0
def segna(liv,msg):
    (errori if liv=='E' else avvisi).append(msg)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w,h in LARGHEZZE:
            ctx=await b.new_context(viewport={'width':w,'height':h})
            await ctx.route('https://victoranalytics-live.vercel.app/**',lambda r:r.fulfill(status=204,body=''))
            await ctx.route('https://fonts.googleapis.com/**',lambda r:r.abort()); await ctx.route('https://api.fontshare.com/**',lambda r:r.abort()); await ctx.route('https://cdn.fontshare.com/**',lambda r:r.abort())
            await ctx.add_init_script("try{localStorage.setItem('sw_consent','denied')}catch(e){}")
            pg=await ctx.new_page()
            for u in NUOVE+LEGACY:
                leg=u in LEGACY
                await pg.goto(BASE+u,wait_until='networkidle'); await pg.evaluate('document.fonts.ready')
                r=await pg.evaluate(JS); tag=f'{w}px {u}'
                global n; n+=1
                if r['sw']>r['w']: segna('E',f'{tag}: scroll orizzontale {r["sw"]}>{r["w"]}')
                if r['overflow']: segna('E',f'{tag}: elementi fuori dal bordo {r["overflow"]}')
                if r['rotte']: segna('E',f'{tag}: immagini rotte {r["rotte"]}')
                if u!='/404.html' and r['h1']!=1: segna('E' if not leg else 'W',f'{tag}: {r["h1"]} h1')
                if r['salti']: segna('W' if leg else 'E',f'{tag}: {r["salti"]} salti nella gerarchia dei titoli')
                if r['punti']: segna('W' if leg else 'E',f'{tag}: mancano landmark {r["punti"]}')
                if r['lang']!='it': segna('E',f'{tag}: lang={r["lang"]}')
                if r['senzaAlt']: segna('E',f'{tag}: immagini senza alt {r["senzaAlt"]}')
                if r['altVuotoNonDecorativo']: segna('W',f'{tag}: alt vuoto su immagini grandi {r["altVuotoNonDecorativo"]}')
                if r['senzaNome']: segna('E',f'{tag}: link o pulsanti senza nome {r["senzaNome"]}')
                if r['piccoli'] and w<=834: segna('W' if not leg else 'L',f'{tag}: bersagli sotto 44 px {r["piccoli"]}')
                if r['cta'] and w<=430 and not (0<=r['cta'][0] and r['cta'][1]<=r['cta'][2]): segna('E',f'{tag}: CTA hero fuori dal primo schermo {r["cta"]}')
            await ctx.close()
        # link interni, WhatsApp, form, tastiera, menu (390)
        ctx=await b.new_context(viewport={'width':390,'height':844})
        await ctx.route('https://victoranalytics-live.vercel.app/**',lambda r:r.fulfill(status=204,body=''))
        await ctx.add_init_script("try{localStorage.setItem('sw_consent','denied')}catch(e){}")
        pg=await ctx.new_page(); tutti=set(); wa=set(); form_ko=[]
        for u in NUOVE:
            await pg.goto(BASE+u,wait_until='networkidle')
            hs=await pg.evaluate("[...document.querySelectorAll('a[href]')].map(a=>[a.getAttribute('href'),a.getAttribute('rel')||'',a.getAttribute('data-track')||'',a.getAttribute('target')||''])")
            for h,rel,tr,tg in hs:
                if h.startswith('https://wa.me'): wa.add(h)
                if h.startswith('/') or h.startswith('#'): tutti.add((u,h))
                if h.startswith('http') and not h.startswith('https://wa.me') and 'noopener' not in rel and 'satoshiweb' not in h and 'instagram' not in h: segna('W',f'{u}: link esterno senza rel=noopener {h}')
            fm=await pg.evaluate("""[...document.querySelectorAll('input:not([type=hidden]):not(.solo-sr),textarea')].filter(e=>!e.labels||e.labels.length===0).map(e=>e.name)""")
            if fm: form_ko.append((u,fm))
            ds=await pg.evaluate("[...document.querySelectorAll('[aria-describedby]')].filter(e=>!document.getElementById(e.getAttribute('aria-describedby'))).map(e=>e.id)")
            if ds: form_ko.append((u,ds))
        ok_link=0
        for u,h in sorted(tutti):
            if h.startswith('#'): path=u+h
            else: path=h
            pth=path.split('#')[0] or u
            r=await ctx.request.get(BASE+pth)
            if r.status!=200: segna('E',f'link interno {path} (da {u}) risponde {r.status}')
            else: ok_link+=1
            if '#' in path:
                idv=path.split('#')[1]
                ok_id=await pg.evaluate("async([p,i])=>{const t=await (await fetch(p)).text();return t.includes('id=\"'+i+'\"')}",[pth,idv])
                if not ok_id: segna('E',f'ancora #{idv} inesistente in {pth}')
        print(f'link interni controllati: {len(tutti)} ({ok_link} ok); link WhatsApp distinti: {sorted(wa)}')
        for x in wa:
            if x!='https://wa.me/393341989193': segna('E',f'link WhatsApp inatteso {x}')
        if form_ko: segna('E',f'form senza etichetta o descrizione orfana {form_ko}')
        # tastiera: ogni elemento raggiunto col Tab ha un contorno visibile; nessuna trappola
        for u in ['/','/lavori/luca-california/','/privacy/','/grazie/']:
            await pg.goto(BASE+u,wait_until='networkidle'); await pg.add_style_tag(content='html{scroll-behavior:auto!important}'); await pg.evaluate("document.body.focus()")
            visti=[];ko=[]
            for i in range(140):
                await pg.keyboard.press('Tab')
                info=await pg.evaluate("""(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const s=getComputedStyle(e);const r=e.getBoundingClientRect();
                  return {t:e.tagName+(e.id?'#'+e.id:'')+' '+(e.textContent||e.name||'').trim().slice(0,22),ow:parseFloat(s.outlineWidth),os:s.outlineStyle,sh:s.boxShadow!=='none',vis:r.bottom>0&&r.top<innerHeight}})()""")
                if info is None: break
                gia=await pg.evaluate("(()=>{const e=document.activeElement;const g=e.hasAttribute('data-qa');e.setAttribute('data-qa','');return g})()")
                if gia: break
                visti.append(info['t'])
                if not ((info['os']!='none' and info['ow']>=2) or info['sh']): ko.append(info['t'])
                if not info['vis']: ko.append('fuori schermo: '+info['t'])
            print(f'tastiera {u}: {len(visti)} elementi raggiunti')
            if ko: segna('E',f'tastiera {u}: focus non visibile o fuori schermo su {ko}')
            if len(visti)<3: segna('E',f'tastiera {u}: troppo pochi elementi raggiungibili ({len(visti)})')
        # menu mobile: apre, tiene il focus dentro, Esc chiude e rimette il focus sul pulsante
        await pg.goto(BASE+'/',wait_until='networkidle'); await pg.click('#apri-menu')
        dentro=True
        for _ in range(10):
            await pg.keyboard.press('Tab'); dentro=dentro and await pg.evaluate("!!document.activeElement.closest('#menu')")
        if not dentro: segna('E','menu: il focus esce dal pannello aperto')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
        if not (await pg.evaluate("document.getElementById('menu').hidden") and await pg.evaluate("document.activeElement.id")=='apri-menu'): segna('E','menu: Esc non chiude o non riporta il focus')
        if await pg.evaluate("document.body.classList.contains('menu-aperto')"): segna('E','menu: scroll del body ancora bloccato dopo la chiusura')
        await ctx.close(); await b.close()
    print(f'\nCONTROLLI: {n} combinazioni pagina per larghezza')
    leg=[a for a in avvisi if a[0:1]!='']
    for e in errori: print('ERRORE',e)
    for a in avvisi: print('AVVISO',a)
    print(f'\nERRORI: {len(errori)}   AVVISI: {len(avvisi)}')
    sys.exit(1 if errori else 0)
asyncio.run(main())
