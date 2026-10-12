"""Verifica dell'anteprima v4 protetta. Uso: SW_BYPASS_FILE=/tmp/.bypass_v4 python3 scripts/test/v4-preview.py https://<anteprima>.vercel.app
Il token va solo all'host dell'anteprima. Formspree e ogni altro host esterno sono intercettati: nessuna richiesta reale."""
import os, re, sys, urllib.request, urllib.error
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
U=sys.argv[1].rstrip('/'); HOST=urlparse(U).netloc
TOK=open(os.environ['SW_BYPASS_FILE']).read().strip()
H={'x-vercel-protection-bypass':TOK}
class NoR(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*a,**k): return None
op=urllib.request.build_opener(NoR)
def get(p):
    try: r=op.open(urllib.request.Request(U+p,headers=H),timeout=30); return r.status,dict((k.lower(),v) for k,v in r.headers.items()),r.read()
    except urllib.error.HTTPError as e: return e.code,dict((k.lower(),v) for k,v in e.headers.items()),e.read()
err=[]
def ko(m): err.append(m); print('  ERRORE',m)
print('== route')
att={'/':200,'/lavori':307,'/lavori/':307,'/lavori/luca-california':200,'/lavori/a-casa-mia':200,'/lavori/antitesi':200,'/lavori/milano-clubs-reservation':200,'/lavori/taiko':200,'/lavori/ikta':200,'/privacy':200,'/grazie':200,'/404':404,'/pagina-che-non-esiste':404,
 '/realizzazione-siti-web-civitavecchia/':200,'/realizzazione-siti-web-civitavecchia':200,'/sviluppo-app-civitavecchia/':200,'/chatbot-whatsapp/':200,'/farsi-trovare-dalle-ai/':200,'/pannello':200,'/api/export':401,'/api/pannello':401,
 '/robots.txt':200,'/sitemap.xml':200,'/llms.txt':200,'/favicon.ico':200,'/favicon.svg':200,'/site.webmanifest':200,'/og-image.jpg':200,'/icon-512.png':200,'/apple-touch-icon.png':200,'/consent.js':200}
for p,a in att.items():
    s,h,b=get(p); loc=h.get('location','')
    print(f'   {p:44} {s} {loc[:40]}')
    if s!=a: ko(f'{p}: {s} invece di {a}')
    if p in('/lavori','/lavori/') and loc!='/#lavori': ko(f'{p}: redirect a {loc}')
    if p.startswith('/api/') and s in(301,302,307,308): ko(f'{p}: redirect indesiderato')
    if 'noindex' not in h.get('x-robots-tag','') and s!=307: ko(f'{p}: manca x-robots-tag noindex')
s,h,b=get('/privacy/'); print('   /privacy/ (slash)',s,h.get('location',''))
s,h,b=get('/robots.txt'); 
if b.decode().strip()!='User-agent: *\nDisallow: /': ko('robots non chiuso')
for p in ['/','/lavori/luca-california','/privacy','/grazie','/404']:
    s,h,b=get(p); m=re.search(r'<meta name="robots" content="([^"]*)"',b.decode())
    if not m or 'noindex' not in m.group(1): ko(f'{p}: meta robots')
s,h,b=get('/'); t=b.decode()
print('== home: canonical, og, json-ld, analytics, form')
print('   canonical',re.search(r'rel="canonical" href="([^"]*)"',t).group(1),'| json-ld',t.count('application/ld+json'),'| cloudflareinsights',('cloudflareinsights' in t),'| Arriva a info@',('Arriva a info@' in t))
if 'cloudflareinsights' in t: ko('analytics presente senza token')
s,h,b=get('/sitemap.xml'); urls=re.findall(r'<loc>([^<]*)</loc>',b.decode()); print('== sitemap',len(urls),'URL; duplicati:',len(urls)-len(set(urls)))
for u in urls:
    st,_,_=get(urlparse(u).path)
    if st!=200: ko(f'sitemap {u}: {st}')
if len(urls)!=len(set(urls)): ko('sitemap con duplicati')
s,h,b=get('/llms.txt'); 
if re.search(r'€|euro',b.decode(),re.I): ko('llms.txt con prezzo')
print('== browser (390 e 1440): console, risorse, font, immagini, form intercettato')
with sync_playwright() as p:
    br=p.chromium.launch()
    for w in (390,1440):
        c=br.new_context(viewport={'width':w,'height':900}); posts=[]; est=[]
        def route(r):
            u=r.request.url; host=urlparse(u).netloc
            if host==HOST:
                hd=dict(r.request.headers); hd.update(H); r.continue_(headers=hd)
            elif 'formspree' in u: posts.append(u); r.fulfill(status=200,content_type='application/json',body='{"ok":true}')
            else: est.append(u); r.fulfill(status=204,body='')
        c.route('**/*',route)
        for path in ['/','/lavori/luca-california','/lavori/taiko','/privacy','/grazie','/404']:
            pg=c.new_page(); e=[]
            pg.on('console',lambda m,e=e: e.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda x,e=e: e.append(str(x)))
            pg.on('response',lambda r,e=e: e.append(f'{r.status} {r.url}') if r.status>=400 and r.request.resource_type!='document' else None)
            pg.goto(U+path,wait_until='networkidle'); H_=pg.evaluate('document.documentElement.scrollHeight'); y=0
            while y<H_: pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(60); y+=800
            pg.wait_for_timeout(300)
            fonts=pg.evaluate("[...document.fonts].filter(f=>f.status=='loaded').map(f=>f.family+' '+f.weight)")
            rotte=pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth==0).length"); sw=pg.evaluate('document.documentElement.scrollWidth')
            print(f'   {w} {path:28} errori {e[:2]} font {sorted(set(fonts))} img rotte {rotte} sw {sw}')
            if e or rotte or sw>w: ko(f'{w} {path}: {e[:2]} rotte {rotte} sw {sw}')
            if not any('Satoshi' in f for f in fonts) and path=='/': ko('Satoshi non caricato')
            pg.close()
        if w==390:
            pg=c.new_page(); pg.goto(U+'/',wait_until='networkidle'); pg.evaluate("document.getElementById('form-contatto').scrollIntoView()")
            pg.fill('[name=nome]','Prova Anteprima'); pg.fill('[name=contatto]','3330000000'); pg.fill('[name=messaggio]','Test anteprima'); pg.wait_for_timeout(3300)
            pg.click('#form-contatto button[type=submit]'); pg.wait_for_timeout(1500)
            print('   form (Formspree intercettato): richieste finte',len(posts),'| url finale',pg.url.replace(U,''))
            if len(posts)!=1 or not pg.url.endswith('/grazie'): ko('flusso form')
        print('   host esterni intercettati:',sorted(set(urlparse(u).netloc for u in est)))
        c.close()
    br.close()
print('\nERRORI',len(err)); sys.exit(1 if err else 0)
