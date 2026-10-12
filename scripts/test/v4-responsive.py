"""Matrice responsive v4: ogni pagina a 6 larghezze. Controlla scroll orizzontale, errori JS/console, risorse fallite, immagini rotte. Salva screenshot in /tmp/v4shots."""
import sys, os
from playwright.sync_api import sync_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:4522'
PAGINE=['/','/lavori/luca-california','/lavori/a-casa-mia','/lavori/antitesi','/lavori/milano-clubs-reservation','/lavori/taiko','/lavori/ikta','/privacy','/grazie','/404']
LARG=[360,390,430,834,1024,1440]
os.makedirs('/tmp/v4shots',exist_ok=True)
ko=0
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in LARG:
        c=b.new_context(viewport={'width':w,'height':900},reduced_motion='reduce'); 
        for u in PAGINE:
            pg=c.new_page(); errs=[]
            pg.on('console',lambda m,e=errs: e.append(m.text) if m.type=='error' else None)
            pg.on('pageerror',lambda x,e=errs: e.append(str(x)))
            pg.on('requestfailed',lambda r,e=errs: e.append('FAIL '+r.url))
            pg.on('response',lambda r,e=errs: e.append(f'{r.status} {r.url}') if r.status>=400 and not r.url.endswith('/404') and r.request.resource_type!='document' else None)
            pg.goto(BASE+u,wait_until='networkidle'); H=pg.evaluate('document.documentElement.scrollHeight'); y=0
            while y<H: pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(60); y+=800
            pg.evaluate('scrollTo(0,0)'); pg.wait_for_timeout(300)
            sw=pg.evaluate('document.documentElement.scrollWidth'); rotte=pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth==0).map(i=>i.src)")
            vuoto=pg.evaluate("[...document.images].filter(i=>!i.complete).length")
            bad=sw>w or errs or rotte or vuoto
            if bad: ko+=1
            print(('KO ' if bad else 'ok '),w,u,'h',H,'sw',sw,errs[:3],rotte[:3],vuoto)
            pg.screenshot(path=f'/tmp/v4shots/{u.strip("/").replace("/","-") or "home"}-{w}.png',full_page=True); pg.close()
        c.close()
    b.close()
print('KO totali',ko); sys.exit(1 if ko else 0)
