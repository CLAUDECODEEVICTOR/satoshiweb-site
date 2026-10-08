#!/usr/bin/env python3
"""Verifica che i font vengano SERVITI davvero (e che il nome non ricada su Bricolage senza che nessuno se ne accorga).
Uso: python3 scripts/verifica-font.py http://localhost:4522/         (locale)
     python3 scripts/verifica-font.py https://<anteprima>.vercel.app/ (dopo un deploy di anteprima: da fare PRIMA del lancio)
Esce con 0 se tutto va, 1 se qualcosa manca. Non invia nulla: legge soltanto la pagina."""
import asyncio, sys
from playwright.async_api import async_playwright
URL=(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:4522/')
ATTESI={'Bricolage Grotesque','Geist','Satoshi'}
async def main():
    ko=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':390,'height':844}); pg=await ctx.new_page()
        font=[]
        pg.on('response',lambda r: font.append((r.status,r.headers.get('content-type',''),r.url,len(r.url))) if '/font/' in r.url else None)
        await ctx.route('**/victoranalytics-live.vercel.app/**',lambda r:r.fulfill(status=204,body=''))
        await pg.add_init_script("try{localStorage.setItem('sw_consent','denied')}catch(e){}")
        await pg.goto(URL,wait_until='networkidle'); await pg.evaluate('document.fonts.ready')
        for st,ct,u,_ in font:
            esito='ok' if st==200 and 'font' in ct else 'ERRORE'
            print(f'  {esito:6} {st} {ct:20} {u.split("/font/")[1]}')
            if esito!='ok': ko.append(u)
        if not font: ko.append('nessun file font richiesto')
        caricati=await pg.evaluate("[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replace(/\"/g,''))")
        print('  famiglie caricate:',sorted(set(caricati)))
        for fam in ATTESI:
            if fam not in caricati: ko.append(f'famiglia non caricata: {fam}')
        uso=await pg.evaluate("({nome:getComputedStyle(document.querySelector('.marchio__nome')).fontFamily,h1:getComputedStyle(document.querySelector('h1')).fontFamily,testo:getComputedStyle(document.body).fontFamily})")
        print('  nome del marchio:',uso['nome'][:60]); print('  titoli:',uso['h1'][:60]); print('  testo:',uso['testo'][:60])
        if not uso['nome'].startswith('Satoshi'): ko.append('il nome non usa Satoshi per primo')
        # il nome deve davvero essere reso con Satoshi: larghezza diversa da quella con il solo fallback
        larg=await pg.evaluate("""async()=>{const e=document.querySelector('.marchio__nome');const a=e.getBoundingClientRect().width;
          e.style.fontFamily='"Bricolage Grotesque"';await document.fonts.ready;const b=e.getBoundingClientRect().width;e.style.fontFamily='';return [a,b]}""")
        print('  larghezza del nome: Satoshi %.1f px, Bricolage %.1f px'%(larg[0],larg[1]))
        if abs(larg[0]-larg[1])<0.5: ko.append('il nome ha la stessa larghezza con Bricolage: possibile ricaduta')
        await b.close()
    print('\nESITO:', 'OK, i font sono serviti e Satoshi è in uso' if not ko else 'PROBLEMI: '+'; '.join(map(str,ko)))
    sys.exit(1 if ko else 0)
asyncio.run(main())
