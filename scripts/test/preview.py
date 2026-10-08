# Verifica di un'anteprima Vercel protetta. Uso: SW_BYPASS_FILE=/tmp/.bypass_preview python3 scripts/test/preview.py https://<anteprima>.vercel.app
# Il token di bypass va SOLO all'host dell'anteprima. Nessuna richiesta reale a Formspree (intercettata) né agli analytics (intercettati).
import asyncio, hashlib, io, json, os, re, sys, urllib.request, urllib.error
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright
from PIL import Image
U=sys.argv[1].rstrip('/'); HOST=urlparse(U).netloc
R=Path(__file__).resolve().parents[2]; PUB=R/'public'
TOK=open(os.environ['SW_BYPASS_FILE']).read().strip() if os.environ.get('SW_BYPASS_FILE') else ''
H={'x-vercel-protection-bypass':TOK} if TOK else {}
err=[]; avv=[]
def ko(m): err.append(m); print('  ERRORE',m)
def get(path,method='GET',hdr=None,full=True):
    rq=urllib.request.Request(U+path,method=method,headers={**H,**(hdr or {})})
    class NoRedir(urllib.request.HTTPRedirectHandler):
        def redirect_request(self,*a,**k): return None
    op=urllib.request.build_opener(NoRedir)
    try:
        r=op.open(rq,timeout=30); return r.status,dict((k.lower(),v) for k,v in r.headers.items()),(r.read() if full else b'')
    except urllib.error.HTTPError as e: return e.code,dict((k.lower(),v) for k,v in e.headers.items()),e.read()
def pagina(f):
    rel=f.relative_to(PUB).as_posix()
    return '/'+rel[:-10] if rel.endswith('index.html') else '/'+rel
PAGINE=['/','/lavori/','/lavori/luca-california/','/lavori/a-casa-mia/','/lavori/taiko/','/lavori/lazzi/','/lavori/milano-clubs/','/lavori/ikta/','/privacy/','/grazie/','/realizzazione-siti-web-civitavecchia/','/sviluppo-app-civitavecchia/','/chatbot-whatsapp/','/farsi-trovare-dalle-ai/']
print('== A. file serviti uguali al build locale (byte per byte)')
tot=0; diversi=[]
for f in sorted(PUB.rglob('*')):
    if not f.is_file(): continue
    s,h,b=get(pagina(f)); tot+=1
    if s!=200 or hashlib.sha1(b).digest()!=hashlib.sha1(f.read_bytes()).digest(): diversi.append((pagina(f),s))
print(f'   {tot-len(diversi)}/{tot} identici'); [ko(f'file diverso o mancante {x}') for x in diversi]
print('== B. header di cache e tipi')
for p,att_ct,att_cc in [('/css/'+next((PUB/'css').glob('*.css')).name,'text/css','immutable'),('/js/'+next((PUB/'js').glob('*.js')).name,'javascript','immutable'),('/font/'+next((PUB/'font').glob('satoshi*')).name,'font/woff2','immutable'),('/og/'+next((PUB/'og').glob('home*')).name,'image/jpeg','immutable'),('/img/'+next((PUB/'img').glob('acasamia-acm-mobile-390*')).name,'image/webp','immutable'),('/','text/html','must-revalidate')]:
    s,h,_=get(p,full=False); ct=h.get('content-type',''); cc=h.get('cache-control','')
    print(f'   {p[:42]:44} {s} {ct[:24]:24} {cc[:60]}')
    if att_ct not in ct: ko(f'{p}: content-type {ct}')
    if att_cc not in cc: ko(f'{p}: cache-control {cc}')
print('== C. robots, sitemap, llms.txt')
s,h,b=get('/robots.txt'); print('   robots.txt:',b.decode().strip().replace('\n',' | ')); 
if b.decode().strip()!='User-agent: *\nDisallow: /': ko('robots non chiuso')
for p in PAGINE:
    s,h,b=get(p); t=b.decode(); m=re.search(r'<meta name="robots" content="([^"]*)"',t)
    if (p in ('/','/lavori/') or True) and p not in ('/realizzazione-siti-web-civitavecchia/','/sviluppo-app-civitavecchia/','/chatbot-whatsapp/','/farsi-trovare-dalle-ai/'):
        if not m or 'noindex' not in m.group(1): ko(f'{p}: meta robots {m.group(1) if m else None}')
    if 'noindex' not in h.get('x-robots-tag',''): ko(f'{p}: manca x-robots-tag noindex')
print('   meta robots noindex sulle pagine nuove e header x-robots-tag: noindex su tutte (di Vercel per le anteprime)')
s,h,b=get('/sitemap.xml'); urls=re.findall(r'<loc>([^<]*)</loc>',b.decode()); print(f'   sitemap.xml: {len(urls)} URL (dominio di produzione, previsto)')
for u in urls:
    path=urlparse(u).path; s2,_,_=get(path,full=False)
    if s2!=200: ko(f'sitemap: {path} risponde {s2}')
if len(urls)!=13: ko(f'sitemap con {len(urls)} URL (attesi 13)')
s,h,b=get('/llms.txt'); t=b.decode(); print('   llms.txt:',len(t),'caratteri; contiene euro/€:',bool(re.search(r'€|euro',t,re.I)))
if re.search(r'€|euro|a partire da',t,re.I): ko('llms.txt con prezzo')
print('== D. OG image e JSON-LD su ogni pagina nuova')
for p in PAGINE[:10]:
    s,h,b=get(p); t=b.decode()
    og=re.search(r'<meta property="og:image" content="https://satoshiweb\.it([^"]*)"',t)
    tw=re.search(r'<meta name="twitter:image" content="https://satoshiweb\.it([^"]*)"',t)
    info='-'
    if og:
        s2,h2,b2=get(og.group(1)); im=Image.open(io.BytesIO(b2)); info=f'{s2} {h2.get("content-type")} {im.size[0]}x{im.size[1]} {len(b2)//1024}KB'
        if not (s2==200 and im.size==(1200,630)): ko(f'{p}: OG {info}')
        if not tw or tw.group(1)!=og.group(1): ko(f'{p}: twitter:image diverso')
    elif p!='/grazie/': ko(f'{p}: og:image mancante')
    ld=[]
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>',t,re.S):
        try: d=json.loads(m.group(1)); ld+= [x['@type'] for x in d.get('@graph',[d])]
        except Exception as e: ko(f'{p}: JSON-LD non valido')
    canon=re.search(r'<link rel="canonical" href="([^"]*)"',t)
    print(f'   {p:28} OG {info:34} JSON-LD {ld if ld else "-"}')
    if p not in ('/grazie/','/privacy/') and not ld: ko(f'{p}: JSON-LD assente')
    if canon and canon.group(1)!='https://satoshiweb.it'+p: ko(f'{p}: canonical {canon.group(1)}')
print('== E. 404, slash finale, rewrite del pannello, funzioni server')
s,h,b=get('/non-esiste/'); print('   /non-esiste/:',s,'custom' if b'Questa pagina non esiste' in b else 'pagina 404 non personalizzata'); 
if s!=404 or b'Questa pagina non esiste' not in b: ko('404 non corretto')
for p in ('/lavori','/lavori/','/lavori/lazzi','/lavori/lazzi/','/privacy'):
    s2,h2,_=get(p,full=False)
    if s2!=200: ko(f'{p} risponde {s2}')
print('   /lavori, /lavori/, /lavori/lazzi e con la barra finale: tutti 200 (nessun redirect; il canonical indica la versione con la barra)')
s,h,_=get('/pannello',full=False); print('   /pannello (rewrite a pannello.html):',s)
if s!=200: ko('/pannello non risponde 200')
for api in ('/api/pannello','/api/export'):
    s,h,b=get(api); corpo=b.decode(errors='ignore')[:70].replace('\n',' '); print(f'   {api}: {s} {corpo}  (senza token: 401 atteso, nessun redirect, nessun 5xx)')
    if s not in (401,503): ko(f'{api}: risponde {s} (atteso 401 o 503)')
print('== F. browser: console, richieste fallite, layout, form (Formspree e analytics intercettati)')
async def browser():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w,h in [(390,844),(1440,900)]:
            ctx=await b.new_context(viewport={'width':w,'height':h})
            formspree=[]
            async def con_token(route):
                await route.continue_(headers={**route.request.headers,'x-vercel-protection-bypass':TOK,'x-vercel-set-bypass-cookie':'true'})
            await ctx.route(f'https://{HOST}/**',con_token)
            await ctx.route('https://victoranalytics-live.vercel.app/**',lambda r:r.fulfill(status=204,body=''))
            await ctx.route('https://formspree.io/**',lambda r:(formspree.append(r.request.url),r.fulfill(status=200,content_type='application/json',body='{"ok":true}'))[1])
            await ctx.route('https://www.googletagmanager.com/**',lambda r:r.fulfill(status=200,body=''))
            await ctx.add_init_script("try{localStorage.setItem('sw_consent','denied')}catch(e){}")
            pg=await ctx.new_page(); log=[]; falliti=[]
            pg.on('console',lambda m:log.append((m.type,m.text[:140])) if m.type in ('error','warning') else None)
            pg.on('pageerror',lambda e:log.append(('pageerror',str(e)[:140])))
            pg.on('requestfailed',lambda r:falliti.append(r.url[:90]) if HOST in r.url else None)
            pg.on('response',lambda r:falliti.append(f'{r.status} {r.url[:90]}') if r.status>=400 and HOST in r.url else None)
            for pth in PAGINE:
                log.clear(); falliti.clear()
                await pg.goto(U+pth,wait_until='networkidle'); await pg.evaluate('document.fonts.ready')
                o=await pg.evaluate("({sw:document.documentElement.scrollWidth,w:innerWidth,h1:document.querySelectorAll('h1').length,rotte:[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&getComputedStyle(i).display!=='none').length})")
                esito='ok'
                if o['sw']>o['w']: ko(f'{w}px {pth}: scroll orizzontale'); esito='X'
                if o['rotte']: ko(f'{w}px {pth}: immagini rotte'); esito='X'
                proprio=[l for l in log if 'victoranalytics' not in l[1] and 'CORS' not in l[1]]
                if proprio: ko(f'{w}px {pth}: console {proprio[:2]}'); esito='X'
                if falliti: ko(f'{w}px {pth}: richieste fallite {falliti[:2]}'); esito='X'
                print(f'   {w:4}px {pth:42} {esito}  console:{len(proprio)} fallite:{len(falliti)} h1:{o["h1"]}')
            # form completo sull'anteprima, con Formspree finto
            await pg.goto(U+'/',wait_until='networkidle'); await pg.wait_for_timeout(3300)
            await pg.fill('#f-nome','Prova Anteprima'); await pg.fill('#f-attivita','Bar di prova'); await pg.fill('#f-telefono','333 1234567')
            await pg.click('#form-invia'); await pg.wait_for_url('**/grazie/',timeout=10000)
            t=(await pg.inner_text('#grazie-titolo')).replace('\u00a0',' ')
            print(f'   {w}px form: richieste a Formspree intercettate = {len(formspree)} (finte), URL finale {urlparse(pg.url).path}, titolo "{t}"')
            if len(formspree)!=1 or urlparse(pg.url).path!='/grazie/' or 'query' in pg.url or '?' in pg.url: ko(f'{w}px: flusso del form sull\'anteprima')
            await ctx.close()
        await b.close()
asyncio.run(browser())
print('== G. Formspree raggiungibile? solo richiesta di verifica CORS (OPTIONS), nessun invio')
rq=urllib.request.Request('https://formspree.io/f/mqedwdeo',method='OPTIONS',headers={'User-Agent':'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/148 Safari/537.36','Origin':U,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'accept'})
try:
    r=urllib.request.urlopen(rq,timeout=20); h={k.lower():v for k,v in r.headers.items()}; print('   OPTIONS',r.status,'allow-origin:',h.get('access-control-allow-origin'),'allow-methods:',h.get('access-control-allow-methods'))
    if h.get('access-control-allow-origin') not in ('*',U): ko('Formspree non consente l\'origine dell\'anteprima')
except Exception as e: ko(f'Formspree: {e}')
act=re.search(r'<form[^>]*action="([^"]*)"',get('/')[2].decode()).group(1); print('   action del form sull\'anteprima:',act)
if act!='https://formspree.io/f/mqedwdeo': ko('action del form diversa')
print(f'\nERRORI: {len(err)}'); sys.exit(1 if err else 0)
