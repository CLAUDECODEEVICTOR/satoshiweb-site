# Test del form SENZA inviare richieste reali: Formspree e analytics sono intercettati (route), nessuna richiesta esce.
import asyncio, json, sys
from playwright.async_api import async_playwright
BASE='http://localhost:4522'
esterni=[]   # richieste verso host esterni che NON sono state intercettate (deve restare vuoto)
mock={'mode':'ok','delay':0}
reali_formspree=[]
async def prepara(ctx):
    async def formspree(route):
        reali_formspree.append(route.request.post_data or '')
        if mock['delay']: await asyncio.sleep(mock['delay']/1000)
        if mock['mode']=='ok': await route.fulfill(status=200,content_type='application/json',body='{"ok":true}')
        elif mock['mode']=='500': await route.fulfill(status=500,content_type='application/json',body='{"error":"x"}')
        else: await route.abort('failed')
    await ctx.route('https://formspree.io/**',formspree)
    await ctx.route('https://victoranalytics-live.vercel.app/**',lambda r:r.fulfill(status=204,body=''))
    await ctx.route('https://www.googletagmanager.com/**',lambda r:r.fulfill(status=200,body=''))
    ctx.on('request',lambda r: esterni.append(r.url) if not r.url.startswith(BASE) and not r.url.startswith('data:') and 'formspree.io' not in r.url and 'victoranalytics' not in r.url and 'googletagmanager' not in r.url else None)
    await ctx.add_init_script("""
      window.__beacons=[]; const sb=navigator.sendBeacon?navigator.sendBeacon.bind(navigator):null;
      navigator.sendBeacon=function(u,d){try{d.text().then(t=>window.__beacons.push(t))}catch(e){} return true};
      try{localStorage.setItem('sw_consent','denied')}catch(e){}
    """)
ris=[]
def ok(nome,cond,extra=''):
    ris.append((nome,bool(cond))); print(('PASS ' if cond else 'FAIL ')+nome+(' '+str(extra) if extra else ''))
async def nuova(b,w=390,h=844):
    ctx=await b.new_context(viewport={'width':w,'height':h}); await prepara(ctx); pg=await ctx.new_page(); return ctx,pg
async def riempi(pg,nome='Mario Rossi',att='Bar Roma, Civitavecchia',tel='333 1234567'):
    await pg.fill('#f-nome',nome); await pg.fill('#f-attivita',att); await pg.fill('#f-telefono',tel)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        # 1. invio vuoto: tre errori, aria, focus sul primo, nessuna richiesta
        ctx,pg=await nuova(b); await pg.goto(BASE+'/',wait_until='networkidle'); await pg.wait_for_timeout(3200)
        await pg.click('#form-invia')
        inv=await pg.evaluate("[...document.querySelectorAll('#form-contatto [aria-invalid=true]')].map(e=>e.name)")
        ok('1a invio vuoto: 3 campi aria-invalid',inv==['nome','attivita','telefono'],inv)
        vis=await pg.evaluate("['nome','attivita','telefono'].map(n=>{const e=document.getElementById('err-'+n);return !e.hidden&&e.textContent.length>0&&e.getAttribute('role')==='alert'})")
        ok('1b messaggi visibili con role=alert',all(vis),vis)
        desc=await pg.evaluate("['nome','attivita','telefono'].every(n=>{const i=document.getElementById('f-'+n);return i.getAttribute('aria-describedby')==='err-'+n})")
        ok('1c aria-describedby collega campo ed errore',desc)
        foc=await pg.evaluate("document.activeElement.id")
        ok('1d focus sul primo campo errato',foc=='f-nome',foc)
        ok('1e nessuna richiesta partita',len(reali_formspree)==0)
        # 2. telefono non valido, poi corretto
        await pg.fill('#f-nome','Mario'); await pg.fill('#f-attivita','Bar'); await pg.fill('#f-telefono','abc')
        await pg.click('#form-invia')
        m=await pg.inner_text('#err-telefono'); ok('2a telefono non valido: messaggio di formato',('8 a 15' in m),m)
        await pg.fill('#f-telefono','333 1234567')
        inv=await pg.evaluate("document.getElementById('f-telefono').getAttribute('aria-invalid')")
        ok('2b correzione in tempo reale toglie l\'errore',inv is None,inv)
        # tracking
        bea=await pg.evaluate("window.__beacons.map(x=>JSON.parse(x).event)")
        ok('2c eventi form_start e form_error tracciati',('form_start' in bea and 'form_error' in bea),bea)
        await ctx.close()
        # 3. invio valido con rete lenta: stato Invio..., doppio invio, redirect senza dati nell'URL
        reali_formspree.clear(); mock.update(mode='ok',delay=900)
        ctx,pg=await nuova(b); await pg.goto(BASE+'/',wait_until='networkidle'); await pg.wait_for_timeout(3200)
        await riempi(pg)
        await pg.click('#form-invia'); await pg.click('#form-invia',force=True,timeout=1000) if False else None
        await pg.wait_for_timeout(150)
        loading=await pg.evaluate("({t:document.getElementById('form-invia').textContent,d:document.getElementById('form-invia').disabled,b:document.getElementById('form-invia').getAttribute('aria-busy')})")
        ok('3a stato Invio... con bottone disabilitato e aria-busy',loading=={'t':'Invio...','d':True,'b':'true'},loading)
        await pg.evaluate("document.getElementById('form-contatto').requestSubmit()")  # tentativo di doppio invio
        await pg.wait_for_url('**/grazie/',timeout=8000)
        ok('3b una sola richiesta nonostante il doppio invio',len(reali_formspree)==1,len(reali_formspree))
        ok('3c URL /grazie/ senza query né hash',pg.url==BASE+'/grazie/',pg.url)
        corpo=reali_formspree[0]
        ok('3d payload con i campi, honeypot vuoto',('name="nome"' in corpo and 'Mario Rossi' in corpo and 'name="_gotcha"' in corpo),'')
        h1=await pg.inner_text('#grazie-titolo'); att=await pg.inner_text('#grazie-attivita')
        n=lambda x:x.replace('\u00a0',' ')
        ok('3e grazie personalizzata da sessionStorage',n(h1)=='Fatto, Mario Rossi. Ora tocca a me.' and 'Bar Roma' in att,(h1,att))
        ss=await pg.evaluate("sessionStorage.getItem('sw_richiesta')")
        ok('3f sessionStorage ripulito dopo la lettura',ss is None,ss)
        await pg.reload(); h1b=await pg.inner_text('#grazie-titolo')
        ok('3g ricarica /grazie/: testo generico, nessun dato residuo',n(h1b)=='Fatto. Ora tocca a me.',h1b)
        await ctx.close()
        # 4. errore 500: messaggio, WhatsApp, bottone riabilitato, riprova ok
        reali_formspree.clear(); mock.update(mode='500',delay=0)
        ctx,pg=await nuova(b); await pg.goto(BASE+'/',wait_until='networkidle'); await pg.wait_for_timeout(3200)
        await riempi(pg); await pg.click('#form-invia'); await pg.wait_for_selector('.form__errore',timeout=5000)
        msg=await pg.inner_text('#form-stato'); wa=await pg.evaluate("document.querySelector('#form-stato a')?.href")
        btn=await pg.evaluate("({t:document.getElementById('form-invia').textContent,d:document.getElementById('form-invia').disabled})")
        ok('4a errore server: messaggio e link WhatsApp',('Non è partita' in msg and wa and wa.startswith('https://wa.me/')),(msg,wa))
        ok('4b bottone riabilitato',btn['d'] is False and btn['t'].startswith('Parliamo'),btn)
        ok('4c pagina ancora sul form (nessun redirect)',pg.url.endswith('/'),pg.url)
        mock.update(mode='ok'); await pg.click('#form-invia'); await pg.wait_for_url('**/grazie/',timeout=8000)
        ok('4d riprova dopo l\'errore va a buon fine',True)
        await ctx.close()
        # 5. rete assente (richiesta abortita) e browser offline
        reali_formspree.clear(); mock.update(mode='abort',delay=0)
        ctx,pg=await nuova(b); await pg.goto(BASE+'/',wait_until='networkidle'); await pg.wait_for_timeout(3200)
        await riempi(pg); await pg.click('#form-invia'); await pg.wait_for_selector('.form__errore',timeout=5000)
        ok('5a rete che fallisce: errore con WhatsApp',('Non è partita' in await pg.inner_text('#form-stato')))
        await ctx.set_offline(True); await pg.evaluate("document.getElementById('form-stato').textContent=''")
        await pg.click('#form-invia'); await pg.wait_for_selector('.form__errore',timeout=5000)
        m=await pg.inner_text('#form-stato'); ok('5b browser offline: messaggio dedicato',('connessione' in m),m)
        n=len(reali_formspree); ok('5c offline: nessun tentativo di invio',n==1,n)
        await ctx.close()
        # 6. honeypot e invio troppo rapido: scartati in silenzio, nessuna richiesta
        reali_formspree.clear(); mock.update(mode='ok',delay=0)
        ctx,pg=await nuova(b); await pg.goto(BASE+'/',wait_until='networkidle'); await pg.wait_for_timeout(3200)
        await riempi(pg); await pg.evaluate("document.querySelector('[name=_gotcha]').value='bot'")
        await pg.click('#form-invia'); await pg.wait_for_url('**/grazie/',timeout=5000)
        ok('6a honeypot compilato: nessuna richiesta inviata',len(reali_formspree)==0,len(reali_formspree))
        await ctx.close()
        ctx,pg=await nuova(b); await pg.goto(BASE+'/',wait_until='domcontentloaded')
        await riempi(pg); await pg.click('#form-invia'); await pg.wait_for_selector('.form__errore',timeout=3000)
        msg=await pg.inner_text('#form-stato')
        ok('6b invio sotto 3 secondi: messaggio semplice, nessuna richiesta, resta sul form',(msg.strip()=='Aspetta un momento e riprova.' and len(reali_formspree)==0 and pg.url.endswith('/')),(msg,len(reali_formspree)))
        ok('6c il messaggio non spiega l\'anti-spam',not any(x in msg.lower() for x in ['spam','bot','sicurezza','honeypot']))
        btn=await pg.evaluate("document.getElementById('form-invia').disabled"); ok('6d pulsante non bloccato dopo il messaggio',btn is False)
        await pg.wait_for_timeout(3200); await pg.click('#form-invia'); await pg.wait_for_url('**/grazie/',timeout=8000)
        ok('6e dopo 3 secondi lo stesso invio parte (una richiesta)',len(reali_formspree)==1,len(reali_formspree))
        await ctx.close()
        # 7. tastiera: ordine, focus visibile, toggle dettagli, Invio per inviare
        reali_formspree.clear()
        ctx,pg=await nuova(b); await pg.goto(BASE+'/',wait_until='networkidle'); await pg.wait_for_timeout(3200)
        await pg.focus('#f-nome')
        ordine=[]
        for _ in range(6):
            ordine.append(await pg.evaluate("document.activeElement.id||document.activeElement.name||document.activeElement.tagName"))
            await pg.keyboard.press('Tab')
        ok('7a ordine di tab: nome, attività, telefono, dettagli, invia',ordine[:5]==['f-nome','f-attivita','f-telefono','dettagli-toggle','form-invia'],ordine)
        await pg.focus('#dettagli-toggle'); await pg.keyboard.press('Enter')
        esp=await pg.evaluate("[document.getElementById('dettagli-toggle').getAttribute('aria-expanded'),document.getElementById('dettagli').hasAttribute('data-chiuso')]")
        ok('7b toggle dettagli da tastiera',esp==['true',False],esp)
        out=await pg.evaluate("(()=>{document.getElementById('f-nome').focus();const c=getComputedStyle(document.getElementById('f-nome'));return [c.outlineStyle,c.outlineWidth]})()")
        ok('7c focus visibile (contorno 3px) sul campo',out[0]!='none' and out[1]=='3px',out)
        await riempi(pg); await pg.focus('#f-telefono'); await pg.keyboard.press('Enter'); await pg.wait_for_url('**/grazie/',timeout=8000)
        ok('7d Invio da tastiera invia il form',len(reali_formspree)==1)
        await ctx.close()
        # 8. sticky: tastiera mobile aperta
        ctx,pg=await nuova(b,390,844); await pg.goto(BASE+'/',wait_until='networkidle')
        await pg.evaluate("window.scrollTo({top:900,behavior:'instant'})"); await pg.wait_for_timeout(400)
        await pg.wait_for_timeout(400)
        vis=await pg.evaluate("[getComputedStyle(document.getElementById('barra')).display,getComputedStyle(document.getElementById('barra')).visibility]")
        ok('8a barra fissa visibile dopo la CTA hero',vis==['flex','visible'],vis)
        await pg.evaluate("document.getElementById('f-nome').scrollIntoView({block:'center'})"); await pg.focus('#f-nome')
        await pg.set_viewport_size({'width':390,'height':380}); await pg.wait_for_timeout(500)
        vis=await pg.evaluate("[document.body.classList.contains('tastiera-aperta'),getComputedStyle(document.getElementById('barra')).display]")
        ok('8b tastiera aperta (viewport ridotto): barra nascosta',vis==[True,'none'],vis)
        await pg.set_viewport_size({'width':390,'height':844}); await pg.wait_for_timeout(500)
        vis=await pg.evaluate("[document.body.classList.contains('tastiera-aperta'),getComputedStyle(document.getElementById('barra')).display,getComputedStyle(document.getElementById('barra')).visibility]")
        ok('8c tastiera chiusa: barra di nuovo visibile',vis==[False,'flex','visible'],vis)
        # il campo in focus non è coperto dalla barra
        await pg.focus('#f-telefono'); await pg.wait_for_timeout(300)
        r=await pg.evaluate("(()=>{const f=document.getElementById('f-telefono').getBoundingClientRect(),b=document.getElementById('barra').getBoundingClientRect();return [Math.round(f.bottom),Math.round(b.top)]})()")
        ok('8d campo in focus sopra la barra fissa',r[0]<=r[1],r)
        await ctx.close()
        # 9. layout con errori a tutte le larghezze
        for w,h in [(360,740),(390,844),(430,932),(834,1112),(1440,900)]:
            ctx,pg=await nuova(b,w,h); await pg.goto(BASE+'/',wait_until='networkidle'); await pg.wait_for_timeout(3200)
            await pg.click('#form-invia')
            sw=await pg.evaluate("[document.documentElement.scrollWidth,innerWidth]")
            ov=await pg.evaluate("[...document.querySelectorAll('.form *')].filter(e=>e.getBoundingClientRect().right>document.querySelector('.form').getBoundingClientRect().right+1&&getComputedStyle(e).position!=='absolute').length")
            ok(f'9 {w}px: form con errori senza overflow',sw[0]<=sw[1] and ov==0,(sw,ov))
            if w in (390,1440): await pg.locator('#form-contatto').screenshot(path=f'/tmp/form-errori-{w}.png')
            await ctx.close()
        await b.close()
    print('\nRICHIESTE ESTERNE NON INTERCETTATE:',esterni)
    print('TOTALE: %d/%d PASS'%(sum(1 for _,x in ris if x),len(ris)))
asyncio.run(main())
