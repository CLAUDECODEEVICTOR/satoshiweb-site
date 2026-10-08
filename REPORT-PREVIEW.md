# Satoshi Web V3.1: report anteprima Vercel

Data: 8-9 ottobre 2026. Deploy **di anteprima**, non di produzione. `SW_INDICIZZA=0`. `main` non toccato. Nessuna modifica a design, copy, motion, font, struttura, privacy, pagine legacy o slug (`/lavori/lazzi/` invariato). Nessuna richiesta reale a Formspree.

## 1. URL

**Anteprima da usare:** https://satoshiweb-site-72zqimvzq-edo14.vercel.app

- Protetta da **Vercel Authentication**: senza accesso risponde con un redirect al login di Vercel (verificato: 302). Quindi non è raggiungibile né indicizzabile da estranei. Per aprirla devi essere dentro il tuo account Vercel (team `edo14`) o usare un link condiviso (vedi sezione 9).
- Come difesa in più, ogni risposta porta l'header `x-robots-tag: noindex` (lo aggiunge Vercel alle anteprime), l'HTML ha `noindex, nofollow` e `robots.txt` è `Disallow: /`.
- Pannello del deploy: https://vercel.com/edo14/satoshiweb-site (deployment `dpl_...` creato il 9 ottobre 2026 alle 00:11, target `preview`).

**Anteprima precedente, da ignorare:** https://satoshiweb-site-pcgmlijgq-edo14.vercel.app. È il primo tentativo, con una configurazione sbagliata (vedi sezione 5, problema 1). Funziona ma non va usata; puoi cancellarla dal pannello di Vercel.

## 2. Commit e sorgente del deploy

- **Sorgente del deploy: la cartella locale**, non git. Il CLI ha caricato 425 file (secondo il tuo `.vercelignore`) e ha costruito il sito sui server di Vercel con `node build.mjs`.
- **Codice del sito:** commit `4745981` (Report Fase 6) sul branch `v3.1-foundation`.
- **Configurazione e script di verifica:** commit `f0f750f` (`vercel.v31.json` corretto, `verifica-font.py` che legge un'anteprima protetta, `scripts/test/preview.py`).
- La cartella conteneva anche i file **non tracciati in git** che il sito richiede: `src/font/satoshi-700.woff2`, `consent.js`, `widows.js`, favicon, `pannello.html`, le quattro pagine legacy e `api/`. Controllati uno per uno prima del deploy: presenti. Il file Satoshi è identico, byte per byte, a quello ufficiale scaricato da Fontshare (non modificato).

## 3. Configurazione Vercel

- Progetto: `satoshiweb-site` (**è il progetto di produzione di satoshiweb.it**; un deploy senza `--prod` non tocca il dominio). Framework "Other", Node 24, regione di build Washington (iad1).
- Comando: `vercel deploy --local-config vercel.v31.json --yes` (senza `--prod`). `vercel.json` non è stato né letto dal deploy né modificato da me (ha una modifica tua non committata, 4 righe aggiunte e 1 tolta, che non ho toccato).
- Contenuto di `vercel.v31.json`: `buildCommand: node build.mjs`, `outputDirectory: public`, rewrite `/pannello` → `/pannello.html` (come il sito live), header di cache lunga e `immutable` su `/css`, `/js`, `/img`, `/font`, `/og` (file con hash nel nome), `X-Robots-Tag: noindex` su `/demo/`.
- **Variabili d'ambiente:** esistono solo per Production (`ADMIN_TOKEN`, `COCKPIT_TOKEN`, `EXPORT_TOKEN`, `KV_*`, `REDIS_URL`). `SW_INDICIZZA` non è impostata da nessuna parte, quindi il build usa lo 0 di default. Conseguenza: nell'anteprima le funzioni `/api/pannello` e `/api/export` rispondono 401 (senza token) e non hanno il database. È atteso: il pannello CRM non funziona in anteprima.
- Log del build su Vercel: build in 2 secondi, "font sì" (Satoshi presente), nessun avviso, nessun errore.

**Effetto collaterale da sapere.** Per verificare l'anteprima protetta ho usato `vercel curl`, che ha **generato un "protection bypass token" per il progetto** (una chiamata alle impostazioni di protezione del progetto di produzione). Il token serve solo ad aprire le anteprime protette; l'ho usato solo nei miei comandi locali, senza stamparlo né scriverlo nel repo o nei report, e inviato solo all'host dell'anteprima. Se non lo vuoi: Vercel, Project Settings, Deployment Protection, Protection Bypass for Automation, rimuovilo. Ho cancellato il file locale temporaneo che lo conteneva.

## 4. Verifiche eseguite

Tutte con `scripts/test/preview.py` e `scripts/verifica-font.py` (nel repo), sull'URL dell'anteprima.

| Verifica | Esito |
|---|---|
| File serviti uguali al build locale | **143 su 143 identici byte per byte** |
| **Satoshi e font** (`verifica-font.py`) | OK. 5 file font, tutti 200 con `font/woff2`; famiglie caricate Bricolage Grotesque, Geist, Satoshi; il nome del marchio parte da Satoshi; larghezza del nome 105,5 px con Satoshi contro 111,2 px con Bricolage, quindi **nessuna ricaduta silenziosa**. Stesso risultato su home e su un case study (Lazzi). Nome del file con lo stesso hash della prova locale (`e3dfe79f`) |
| Home, `/lavori/`, case study | 200, un solo `h1`, nessuno scroll orizzontale, nessuna immagine rotta, a 390 e 1440 px, su tutte le 14 pagine (10 nuove e 4 legacy) |
| Header di cache | CSS, JS, font, immagini e OG: `public, max-age=31536000, immutable`. HTML: `max-age=0, must-revalidate`. Tipi corretti (css, js, woff2, webp, jpeg) |
| **robots / noindex** | `robots.txt` = `User-agent: *` e `Disallow: /`; meta `noindex, nofollow` su tutte le pagine nuove; `x-robots-tag: noindex` su ogni risposta |
| **Sitemap** | 13 URL (home, lavori, sei case study, privacy, quattro pagine legacy), tutti raggiungibili sull'anteprima. Gli URL indicano `satoshiweb.it` (dominio di produzione, previsto) |
| **OG image** | 9 pagine su 10 con `og:image` e `twitter:image` coincidenti; ogni immagine risponde 200, `image/jpeg`, **1200x630**, 40-90 KB. (`/grazie/` non ne ha, è una pagina di servizio) |
| **JSON-LD** | Presente e valido su home (`ProfessionalService`, `WebSite`), `/lavori/` (`CollectionPage`, `BreadcrumbList`) e sui sei case study (`CreativeWork`, `BreadcrumbList`). Canonical corretto su ogni pagina |
| `llms.txt` | 2.890 caratteri, nessun prezzo |
| 404 | `/non-esiste/` risponde 404 con la pagina personalizzata |
| `/pannello` | 200 (rewrite a `pannello.html`, come sul sito live) |
| Funzioni server | `/api/pannello` e `/api/export` rispondono 401 `{"error":"unauthorized"}` senza token: atteso, nessun errore 5xx |
| Console e richieste | **0 errori e 0 avvisi del sito, 0 richieste fallite** su 28 caricamenti (14 pagine a 2 larghezze) |
| Formspree | Vedi sotto |

**Form e Formspree: cosa ho fatto e cosa no.**
- **Non ho inviato nessuna richiesta reale.** Nel browser di prova Formspree era intercettato: il flusso completo (validazione, invio, `/grazie/` con "Fatto, Prova Anteprima. Ora tocca a me.") passa sull'anteprima a 390 e 1440 px con **una sola richiesta, finta**, e senza dati nell'URL.
- Per sapere se Formspree è raggiungibile dall'anteprima ho fatto solo una richiesta di verifica `OPTIONS` (il "preflight" del browser), che non porta dati e non crea nessun messaggio: risposta 200, `access-control-allow-origin` uguale all'origine dell'anteprima e `POST` consentito. L'`action` del form sull'anteprima è `https://formspree.io/f/mqedwdeo`.
- Il test reale lo fai tu (sezione 9).

## 5. Problemi trovati

1. **Configurazione sbagliata, corretta.** Nel primo deploy `vercel.v31.json` aveva `trailingSlash: true`. Effetto: `/pannello` veniva rimandato a `/pannello/`, che dà **404** (il pannello CRM si sarebbe rotto al lancio), e `/api/*` veniva rimandato a `/api/*/`. Sul sito live questo non succede. Ho tolto `trailingSlash`, ridistribuito e verificato: `/pannello` 200, `/api/*` 401 senza redirect. **Questo problema in locale non si vedeva.**
2. Le immagini OG non avevano la cache lunga (`must-revalidate`), pur avendo l'hash nel nome. Aggiunto `og` alla regola: ora `immutable`.
3. Il controllo di Formspree dal mio script rispondeva 403, ma era il mio client (user-agent di Python). Con uno normale: 200 e CORS corretto. Non era un problema del sito.

Nessun altro errore: console pulita, nessun 4xx/5xx sulle risorse del sito, nessun file diverso dal build locale.

**Comportamenti da sapere (non sono errori):**
- Senza `trailingSlash`, `/lavori` e `/lavori/` (e `/lavori/lazzi` e `/lavori/lazzi/`) rispondono entrambi 200, senza redirect. Il canonical e la sitemap indicano la versione con la barra, quindi non c'è rischio di duplicati. Se preferisci un redirect esplicito, si aggiunge con poche righe prima del lancio.
- Canonical, sitemap e OG puntano a `satoshiweb.it`: sul dominio dell'anteprima le anteprime social non si vedranno finché il dominio non è quello vero. Le immagini OG si possono comunque verificare aprendole dal percorso `/og/...` dell'anteprima.
- Le tue visite di prova dall'anteprima **caricano lo script di Victor Analytics** (`site=satoshiweb`): compariranno nelle sue statistiche come visite di prova. Google Analytics parte solo se accetti i cookie.

## 6. Cosa devi testare a mano su iPhone e Android

Apri l'anteprima (link condiviso, sezione 9) su un telefono vero, in verticale, con la tastiera:

1. **Prima schermata (home).** Il titolo "Costruisco il sito giusto per la tua attività." va a capo come nelle tavole; la CTA "Parliamo del tuo progetto →" è visibile senza scorrere; il lavoro di A casa mia entra con un movimento leggero e non lampeggia.
2. **Barra fissa.** Compare dopo che la CTA hero è uscita dallo schermo, scorre dal basso e non copre nulla; con la **tastiera aperta** (tocca un campo del form) sparisce e il campo resta visibile sopra; torna quando chiudi la tastiera. (Safari su iOS cambia il viewport in modo diverso dalla simulazione: è il test più importante.)
3. **Menu.** Si apre, il testo è leggibile, "Chiudi" funziona, lo scroll della pagina sotto si blocca e poi si sblocca.
4. **Form.** Prova gli errori (invio vuoto, telefono sbagliato), la tastiera numerica sul telefono, i campi facoltativi dietro "Aggiungi dettagli (facoltativo)", lo stato "Invio...". **Invio reale (solo tu):** compila con dati di prova e invia **una volta**; deve portarti a `/grazie/` con il tuo nome e arrivarti l'email. Controlla anche la cartella spam e il pannello di Formspree. Poi prova a ricaricare `/grazie/`: il nome non deve restare.
5. **WhatsApp.** I pulsanti (sezione contatti, barra, errore del form) aprono WhatsApp sul numero giusto.
6. **FAQ.** Si aprono con un'animazione leggera su Chrome/Android; su Safari possono aprirsi di scatto (normale).
7. **Case study.** Scorri Luca, Milano e Taiko: i blocchi entrano senza saltare; gli screenshot sono leggibili; "Prossimo lavoro" funziona.
8. **Font.** Il nome "Satoshi Web" accanto al marchio ha le lettere Satoshi (le "a" e le "t" arrotondate), non quelle larghe del titolo.
9. **Movimento ridotto.** Attivalo nelle impostazioni di accessibilità del telefono: tutto deve comparire subito, senza animazioni.
10. **Link.** Prova almeno i link esterni dei lavori (lucacalifornia.it, acasamiacivitavecchia.it, taikoclub.satoshiweb.it, lazzibarbershop.it, milanoclubsreservation.it, iktaworld.com).

## 7. Checklist per il lancio

Da fare solo dopo la tua approvazione.

**Prima della produzione**
- [ ] Test manuale su iPhone e Android (sezione 6) e invio reale del form fatto da te.
- [ ] Controllo di Formspree dal tuo pannello: richieste JSON accettate, reCAPTCHA spento, email in arrivo, limiti del piano.
- [ ] Revisione legale della privacy.
- [ ] Autorizzazione di tutti i clienti a comparire (nome, schermate, link).
- [ ] Foto di A casa mia: autore e cliente.
- [ ] "Prima: richieste gestite a mano su WhatsApp" confermato da Luca.
- [ ] "Samuele": decidere cosa scrivere per Milano e per Luca.
- [ ] Liberatorie IKTA per gli hero con i volti (ora esclusi).
- [ ] Dati di Milano anonimizzati: confermare se erano di esempio.
- [ ] Validatore di dati strutturati di Google su home, lavori e un case study (non l'ho potuto usare).
- [ ] Pagine legacy: decidere se correggere i prezzi e i tempi non approvati ("poche centinaia di euro", "1-2 settimane") e i title/description fuori misura.
- [ ] Decidere se aggiungere i redirect alla versione con la barra finale.

**Il giorno del lancio**
- [ ] Impostare `SW_INDICIZZA=1` solo per il build di produzione (variabile d'ambiente o comando), verificare robots (`Allow: /`, sitemap, crawler AI) e meta (`index, follow`) con una build di prova.
- [ ] Sostituire `vercel.json` con la configurazione di `vercel.v31.json` (oppure deploy con `--local-config`). La modifica attuale di `vercel.json` è tua: controllare cosa contiene prima di sovrascriverlo.
- [ ] Deploy **dalla cartella locale** (`vercel --prod --local-config vercel.v31.json`), con il file Satoshi presente; non da git.
- [ ] Verificare dopo il deploy: `python3 scripts/verifica-font.py https://satoshiweb.it/` e `scripts/test/preview.py` (serve il dominio senza protezione, quindi senza `SW_BYPASS_FILE`).
- [ ] Controllare `/pannello` e `/api/*` in produzione (qui le variabili `KV_*`, `ADMIN_TOKEN` ci sono).
- [ ] Search Console: inviare la sitemap e richiedere l'indicizzazione di home e `/lavori/`.
- [ ] Controllare le anteprime social (OG) con i debugger di Facebook/LinkedIn/WhatsApp.
- [ ] Rimuovere il bypass di protezione creato per i test, se non serve più.
- [ ] Cancellare le anteprime vecchie dal pannello di Vercel.

Mi fermo qui. Nessun deploy in produzione, `SW_INDICIZZA=0`.
