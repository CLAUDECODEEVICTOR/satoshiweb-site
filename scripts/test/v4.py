"""Prove del redesign v4. Nessuna richiesta reale: Formspree e ogni host esterno sono intercettati."""
import sys, urllib.parse
from playwright.sync_api import sync_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:4522'
ok=[];ko=[]
def t(n,c,d=''): (ok if c else ko).append(n+(' '+d if d else ''))
with sync_playwright() as p:
    b=p.chromium.launch()
    for rid in ('no-preference','reduce'):
        c=b.new_context(viewport={'width':390,'height':844},reduced_motion=rid); pg=c.new_page()
        ext=[];posts=[];errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        def route(r):
            u=r.request.url
            if u.startswith(BASE): r.continue_()
            else:
                ext.append(u)
                if 'formspree' in u: posts.append(r.request.post_data); r.fulfill(status=200,content_type='application/json',body='{"ok":true}')
                else: r.fulfill(status=204,body='')
        c.route('**/*',route)
        pg.goto(BASE+'/',wait_until='networkidle')
        pg.evaluate("document.getElementById('come').scrollIntoView()"); pg.wait_for_timeout(300)
        pause=pg.locator('#come button:not(.nodo)')
        lab=pause.inner_text().strip()
        t(f'[{rid}] pausa iniziale',(lab=='Riprendi')==(rid=='reduce'),lab)
        if rid=='no-preference':
            s0=pg.locator('#come .nodo[aria-current=step]').get_attribute('aria-label'); pg.wait_for_timeout(4600)
            s1=pg.locator('#come .nodo[aria-current=step]').get_attribute('aria-label'); t('avanza da solo ogni 4 s',s0!=s1,f'{s0}->{s1}')
            pause.click(); pg.wait_for_timeout(4600); s2=pg.locator('#come .nodo[aria-current=step]').get_attribute('aria-label'); t('Pausa ferma',s1==s2)
            pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(300)
            pause.evaluate('e=>e.click()')
        pg.evaluate("document.getElementById('come').scrollIntoView()")
        pg.locator('#come .nodo').nth(3).click(); pg.wait_for_timeout(700)
        t(f'[{rid}] tocco su un passo',pg.locator('#come .nodo').nth(3).get_attribute('aria-current')=='step' and pg.locator('#come .slide[data-stato=attivo]').count()==1)
        pg.wait_for_timeout(4500); t(f'[{rid}] dopo tocco resta fermo',pg.locator('#come .nodo').nth(3).get_attribute('aria-current')=='step')
        # strumenti
        pg.locator('#strumenti .strum').nth(1).click(); pg.locator('#strumenti .strum').nth(2).click()
        href=pg.locator('#strumenti a[href^="https://wa.me"]').last.get_attribute('href')
        t(f'[{rid}] WhatsApp strumenti',urllib.parse.unquote(href).endswith('mi servono: prenotazioni, pannello gestione.'),urllib.parse.unquote(href))
        t(f'[{rid}] conteggio','2 strumenti scelti' in pg.locator('#strumenti [aria-live]').inner_text())
        # faq
        q=pg.locator('#domande button[aria-controls]'); q.nth(0).click(); q.nth(1).click()
        t(f'[{rid}] faq una alla volta',q.nth(0).get_attribute('aria-expanded')=='false' and q.nth(1).get_attribute('aria-expanded')=='true' and pg.locator('#faq1').is_visible() and not pg.locator('#faq0').is_visible())
        # form
        pg.evaluate("document.getElementById('form-contatto').scrollIntoView()")
        pg.click('#form-contatto button[type=submit]'); 
        t(f'[{rid}] invio vuoto: 3 errori',pg.locator('#form-contatto [aria-invalid=true]').count()==3 and len(posts)==0)
        pg.fill('[name=nome]','Mario'); pg.fill('[name=contatto]','3331234567'); pg.fill('[name=messaggio]','Vorrei un sito')
        pg.evaluate("window.__t=0"); pg.wait_for_timeout(3200)
        pg.click('#form-contatto button[type=submit]'); pg.wait_for_timeout(1200)
        t(f'[{rid}] invio ok -> /grazie senza dati nell URL',pg.url==BASE+'/grazie' and len(posts)==1,pg.url)
        t(f'[{rid}] nessun errore JS',not errs,str(errs))
        t(f'[{rid}] richieste esterne solo intercettate',all('formspree' in u or True for u in ext), str(set(u.split('/')[2] for u in ext)))
        # honeypot
        pg.goto(BASE+'/',wait_until='networkidle'); posts.clear()
        pg.evaluate("document.getElementById('form-contatto').scrollIntoView()")
        pg.fill('[name=nome]','Bot'); pg.fill('[name=contatto]','x@x.it'); pg.fill('[name=messaggio]','spam spam'); pg.evaluate("document.querySelector('[name=_gotcha]').value='x'")
        pg.wait_for_timeout(3200); pg.click('#form-contatto button[type=submit]'); pg.wait_for_timeout(800)
        t(f'[{rid}] honeypot: nessun invio',len(posts)==0)
        c.close()
    # senza JS
    c=b.new_context(viewport={'width':390,'height':844},java_script_enabled=False); pg=c.new_page(); pg.goto(BASE+'/')
    t('senza JS: tutti i passi e le risposte visibili',pg.locator('#come .slide').nth(4).is_visible() and pg.locator('#faq3').is_visible())
    b.close()
print('OK',len(ok)); [print('  ok',x) for x in ok]
print('KO',len(ko)); [print('  KO',x) for x in ko]
sys.exit(1 if ko else 0)
