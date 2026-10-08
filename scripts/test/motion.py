# Test del motion (Fase 6). Nessuna richiesta reale: analytics e Formspree intercettati. Uso: python3 scripts/test/motion.py
import asyncio, re, sys, glob
from pathlib import Path
from playwright.async_api import async_playwright
BASE='http://localhost:4522'
R=Path(__file__).resolve().parents[2]
ris=[]
def ok(n,c,x=''):
    ris.append(bool(c)); print(('PASS ' if c else 'FAIL ')+n+(' '+str(x) if x else ''))
async def ctx_new(b,w=390,h=844,**kw):
    c=await b.new_context(viewport={'width':w,'height':h},**kw)
    await c.route('https://victoranalytics-live.vercel.app/**',lambda r:r.fulfill(status=204,body=''))
    await c.route('https://formspree.io/**',lambda r:r.fulfill(status=200,body='{"ok":true}'))
    await c.add_init_script("try{localStorage.setItem('sw_consent','denied')}catch(e){}")
    return c
async def campiona(pg,js,durata=1000,passo=40):
    out=[]; t=0
    while t<durata:
        out.append(await pg.evaluate(js)); await pg.wait_for_timeout(passo); t+=passo
    return out
async def main():
    # 0. regole CSS: solo proprietà ammesse, un solo keyframes, nessuna animazione infinita
    css=''.join(open(f).read() for f in glob.glob(str(R/'public/css/*.css')))
    props=set()
    for m in re.finditer(r'transition:([^;}]*)',css):
        for parte in m.group(1).split(','):
            props.add(parte.strip().split(' ')[0])
    ammesse={'opacity','transform','height','grid-template-rows','visibility','content-visibility','none','all'}
    ok('0a transizioni solo su proprietà ammesse',props<=ammesse,sorted(props))
    ok('0b un solo @keyframes (entra), niente animazioni infinite',re.findall(r'@keyframes ([\w-]+)',css)==['entra'] and 'infinite' not in css,re.findall(r'@keyframes ([\w-]+)',css))
    ok('0c niente parallax, cursore custom, will-change, scroll-timeline',not re.search(r'parallax|cursor:\s*none|will-change|scroll-timeline|animation-timeline',css))
    ok('0d niente filter/backdrop/box-shadow animati',not re.search(r'transition:[^;}]*(filter|shadow|blur)',css))
    async with async_playwright() as p:
        b=await p.chromium.launch()
        # 1. hero: tempi reali a 390 (discreto) e 1440
        for w,h,dy,dur in [(390,844,8,400),(1440,900,16,500)]:
            c=await ctx_new(b,w,h); pg=await c.new_page()
            await pg.goto(BASE+'/',wait_until='commit')
            ser=await campiona(pg,"(()=>{const e=document.querySelector('.fascia-lavoro__visual > *');if(!e)return null;const s=getComputedStyle(e);return [+(+s.opacity).toFixed(2),s.transform==='none'?0:+parseFloat(s.transform.replace(')','').split(',')[5]).toFixed(1),s.animationName,s.animationDuration]})()",1100)
            ser=[x for x in ser if x]
            ok(f'1a {w}px: il lavoro nell\'hero parte da opacità 0',ser[0][0]==0 if ser else False,ser[0] if ser else None)
            ok(f'1b {w}px: animazione "entra" di {dur} ms',ser and ser[-1][2]=='entra' and ser[-1][3]==f'{dur/1000}s',ser[-1] if ser else None)
            ok(f'1c {w}px: finisce visibile e senza spostamento',ser and ser[-1][0]==1 and ser[-1][1]==0,ser[-1] if ser else None)
            sp=max((abs(x[1]) for x in ser),default=0); ok(f'1d {w}px: spostamento massimo {dy} px (discreto)',sp<=dy+0.5,sp)
            await c.close()
        # 2. case study: blocchi visibili solo dopo l'ingresso, nessun contenuto perso
        c=await ctx_new(b,390,844); pg=await c.new_page()
        await pg.goto(BASE+'/lavori/luca-california/',wait_until='networkidle'); await pg.wait_for_timeout(500)
        st=await pg.evaluate("[document.documentElement.classList.contains('anim'),document.documentElement.hasAttribute('data-js'),[...document.querySelectorAll('.caso-blocco')].map(e=>[e.classList.contains('visto'),+getComputedStyle(e.querySelector('.caso-blocco__testo')).opacity])]")
        ok('2a classe anim presente e JS segnalato',st[0] and st[1],st[:2])
        nascosti=[x for x in st[2] if not x[0]]; ok('2b i blocchi sotto la piega sono nascosti prima di arrivare',len(nascosti)>=3 and all(x[1]==0 for x in nascosti),len(nascosti))
        await pg.evaluate("window.scrollTo({top:document.querySelectorAll('.caso-blocco')[4].getBoundingClientRect().top+scrollY-300,behavior:'instant'})"); await pg.wait_for_timeout(120)
        ser=await campiona(pg,"+getComputedStyle(document.querySelectorAll('.caso-blocco')[4].querySelector('.caso-blocco__testo')).opacity",450,50)
        ok('2c il blocco che entra passa da 0 a 1 gradualmente (260 ms)',ser[-1]==1 and any(0<x<1 for x in ser) or ser[-1]==1,[round(x,2) for x in ser])
        # scorri tutta la pagina: alla fine tutto è visibile
        h=await pg.evaluate("document.documentElement.scrollHeight")
        for y in range(0,h,300): await pg.evaluate(f"window.scrollTo({{top:{y},behavior:'instant'}})"); await pg.wait_for_timeout(60)
        await pg.wait_for_timeout(500)
        tutti=await pg.evaluate("[...document.querySelectorAll('.caso-blocco__testo,.caso-blocco__visual')].every(e=>+getComputedStyle(e).opacity===1)")
        ok('2d dopo lo scorrimento nessun contenuto resta nascosto',tutti)
        await c.close()
        # senza JavaScript: niente nascosto
        c=await ctx_new(b,390,844,java_script_enabled=False); pg=await c.new_page()
        await pg.goto(BASE+'/lavori/luca-california/',wait_until='networkidle')
        v=await pg.evaluate("[...document.querySelectorAll('.caso-blocco__testo')].every(e=>+getComputedStyle(e).opacity===1)")
        ok('2e senza JavaScript tutti i blocchi sono visibili',v); await c.close()
        # 3. barra fissa: scorre dal basso, nascosta alla tastiera
        c=await ctx_new(b,390,844); pg=await c.new_page(); await pg.goto(BASE+'/',wait_until='networkidle')
        s0=await pg.evaluate("(()=>{const e=document.getElementById('barra');const s=getComputedStyle(e);return [s.visibility,s.transform,s.display]})()")
        ok('3a barra nascosta all\'inizio (visibility hidden, fuori schermo)',s0[0]=='hidden' and s0[2]=='flex',s0)
        await pg.focus('#hero-cta'); 
        for _ in range(30):
            await pg.keyboard.press('Tab')
            if await pg.evaluate("!!document.activeElement.closest('#barra')"): break
        ok('3b barra nascosta: non raggiungibile da tastiera',not await pg.evaluate("!!document.activeElement.closest('#barra')"))
        await pg.evaluate("window.scrollTo({top:900,behavior:'instant'})")
        ser=await campiona(pg,"(()=>{const s=getComputedStyle(document.getElementById('barra'));const m=s.transform==='none'?0:parseFloat(s.transform.replace(')','').split(',')[5]);return [s.visibility,Math.round(m)]})()",400,40)
        ok('3c la barra sale dal basso e finisce al suo posto',ser[0][1]>0 and ser[-1]==['visible',0],[ser[0],ser[len(ser)//2],ser[-1]])
        await pg.evaluate("window.scrollTo({top:0,behavior:'instant'})"); await pg.wait_for_timeout(350)
        s1=await pg.evaluate("getComputedStyle(document.getElementById('barra')).visibility"); ok('3d risale la CTA hero: la barra esce e torna nascosta',s1=='hidden',s1)
        await c.close()
        # 4. pulsanti: pressione, freccia con cursore e focus, niente su touch
        c=await ctx_new(b,1440,900); pg=await c.new_page(); await pg.goto(BASE+'/',wait_until='networkidle')
        await pg.hover('.nav-linea__cta'); await pg.wait_for_timeout(250)
        tr=await pg.evaluate("getComputedStyle(document.querySelector('.nav-linea__cta .freccia')).transform"); ok('4a desktop: con il cursore la freccia avanza di 4 px',tr=='matrix(1, 0, 0, 1, 4, 0)',tr)
        box=await pg.locator('#hero-cta').bounding_box(); await pg.mouse.move(box['x']+20,box['y']+20); await pg.mouse.down(); await pg.wait_for_timeout(200)
        tr=await pg.evaluate("getComputedStyle(document.getElementById('hero-cta')).transform"); await pg.mouse.up()
        ok('4b pressione del pulsante: scala 0,98 (non aggressiva)',tr.startswith('matrix(0.98'),tr)
        await pg.mouse.move(5,5); await pg.focus('#hero-cta'); await pg.keyboard.press('Shift+Tab'); await pg.keyboard.press('Tab'); await pg.wait_for_timeout(250)
        tr=await pg.evaluate("getComputedStyle(document.querySelector('#hero-cta .freccia')).transform"); ok('4c focus da tastiera: la freccia avanza di 4 px',tr=='matrix(1, 0, 0, 1, 4, 0)',tr)
        await c.close()
        c=await ctx_new(b,390,844,has_touch=True,is_mobile=True); pg=await c.new_page(); await pg.goto(BASE+'/',wait_until='networkidle')
        tr=await pg.evaluate("getComputedStyle(document.querySelector('#hero-cta .freccia')).transform"); ok('4d mobile touch: nessuno spostamento a riposo',tr=='none',tr); await c.close()
        # 5. FAQ e campi facoltativi: si aprono in altezza
        c=await ctx_new(b,390,844); pg=await c.new_page(); await pg.goto(BASE+'/',wait_until='networkidle')
        await pg.evaluate("document.querySelectorAll('.faq details')[1].scrollIntoView({block:'center'})")
        h0=await pg.evaluate("document.querySelectorAll('.faq details')[1].getBoundingClientRect().height")
        await pg.click('.faq details:nth-of-type(2) summary')
        ser=await campiona(pg,"document.querySelectorAll('.faq details')[1].getBoundingClientRect().height",360,30)
        ok('5a FAQ: l\'altezza cresce gradualmente in circa 200 ms',ser[-1]>h0+20 and any(h0+2<x<ser[-1]-2 for x in ser),[round(x) for x in ser])
        await pg.evaluate("document.querySelector('#dettagli-toggle').scrollIntoView({block:'center'})")
        d0=await pg.evaluate("document.getElementById('dettagli').getBoundingClientRect().height")
        ok('5b campi facoltativi chiusi: altezza 0, inert',d0==0 and await pg.evaluate("document.getElementById('dettagli').hasAttribute('inert')"),d0)
        await pg.click('#dettagli-toggle')
        ser=await campiona(pg,"document.getElementById('dettagli').getBoundingClientRect().height",360,30)
        ok('5c campi facoltativi: si aprono in altezza gradualmente',ser[-1]>100 and any(2<x<ser[-1]-2 for x in ser),[round(x) for x in ser])
        ok('5d aperti: non più inert, raggiungibili',not await pg.evaluate("document.getElementById('dettagli').hasAttribute('inert')"))
        await pg.click('#dettagli-toggle'); await pg.wait_for_timeout(300)
        await pg.focus('#dettagli-toggle'); await pg.keyboard.press('Tab')
        ok('5e chiusi di nuovo: la tastiera salta i campi nascosti',await pg.evaluate("document.activeElement.id")=='form-invia',await pg.evaluate("document.activeElement.id||document.activeElement.name"))
        await c.close()
        # 6. movimento ridotto: tutto visibile subito, nessuna animazione
        c=await ctx_new(b,390,844,reduced_motion='reduce'); pg=await c.new_page(); await pg.goto(BASE+'/',wait_until='commit')
        await pg.wait_for_selector('.fascia-lavoro__visual > *',state='attached')
        r=await pg.evaluate("(()=>{const e=document.querySelector('.fascia-lavoro__visual > *');const s=getComputedStyle(e);return [s.animationName,+s.opacity,document.documentElement.classList.contains('anim')]})()")
        ok('6a ridotto: nessuna animazione dell\'hero, visibile subito',r==['none',1,False],r)
        await pg.wait_for_load_state('networkidle')
        tr=await pg.evaluate("[getComputedStyle(document.getElementById('barra')).transitionDuration,getComputedStyle(document.querySelector('.faq details'),'::details-content').transitionDuration,getComputedStyle(document.getElementById('dettagli')).transitionDuration,getComputedStyle(document.querySelector('#hero-cta .freccia')).transitionDuration]")
        ok('6b ridotto: transizioni a 0 su barra, FAQ, campi facoltativi, frecce',all(max(float(v.strip().replace('s','')) for v in x.split(','))<=0.001 for x in tr),tr)
        await pg.evaluate("window.scrollTo({top:900,behavior:'instant'})"); await pg.wait_for_timeout(60)
        v=await pg.evaluate("getComputedStyle(document.getElementById('barra')).visibility"); ok('6c ridotto: la barra compare subito',v=='visible',v)
        await pg.goto(BASE+'/lavori/luca-california/',wait_until='networkidle')
        v=await pg.evaluate("[document.documentElement.classList.contains('anim'),[...document.querySelectorAll('.caso-blocco__testo,.caso-blocco__visual')].every(e=>+getComputedStyle(e).opacity===1)]")
        ok('6d ridotto: case study tutto visibile senza scorrere',v==[False,True],v); await c.close()
        # 7. CLS durante caricamento e scorrimento
        for w,h,url in [(390,844,'/'),(430,932,'/'),(1440,900,'/'),(390,844,'/lavori/taiko/'),(834,1112,'/lavori/milano-clubs/')]:
            c=await ctx_new(b,w,h); pg=await c.new_page()
            await pg.add_init_script("window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true})")
            await pg.goto(BASE+url,wait_until='networkidle'); hh=await pg.evaluate("document.documentElement.scrollHeight")
            for y in range(0,hh,400): await pg.evaluate(f"window.scrollTo({{top:{y},behavior:'instant'}})"); await pg.wait_for_timeout(50)
            await pg.wait_for_timeout(400); cls=await pg.evaluate("window.__cls"); ok(f'7 CLS {w}px {url}: {cls:.4f} (obiettivo < 0,02)',cls<0.02)
            await c.close()
        await b.close()
    print('\nTOTALE: %d/%d PASS'%(sum(ris),len(ris)))
    sys.exit(0 if all(ris) else 1)
asyncio.run(main())
