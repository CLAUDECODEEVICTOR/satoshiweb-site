# Satoshi Web: IMPLEMENTATION-PLAN

Fase 1: analisi, verifica, piano. Nessun file del sito è stato modificato.
Data: 8 ottobre 2026.

Materiale letto per intero: Master Build Brief, Claude Code System, REPORT-V3.1, REPORT-V3 (specifiche invariate), i 3 prototipi di pagina (mobile 390, pagina grazie, struttura case study) più le altre tavole in sintesi, tutti i 27 asset in `assets/` (visti uno per uno), il repo attuale (`index.html`, `api/`, `vercel.json`, `consent.js`, `robots.txt`, `sitemap.xml`). I tre file che hai riallegato nel messaggio sono byte per byte identici a quelli dentro lo zip.

Ordine di priorità applicato: Master Build Brief, poi V3.1, poi Claude Code System, poi asset.

---

## A. Executive summary

**Cosa si costruisce.** Una homepage mobile-first in 10 sezioni (header, hero, da dove parti, lavori, cosa può fare un sito, processo, fondatore, FAQ, CTA e form, footer), più `/lavori`, 6 case study, `/grazie`, la rotta riservata `/demo/<slug>`. Niente altro.

**Come.** HTML e CSS scritti a mano, JavaScript minimo, nessun framework, nessuna libreria di animazione, su Vercel. Le pagine escono come **file HTML già completi nel sorgente**, generati da un piccolo script Node senza dipendenze che legge un file dati e dei template (funzioni pure che restituiscono stringhe). Nessun contenuto disegnato dal browser: i crawler delle AI leggono il testo anche senza eseguire codice. Dettaglio e motivazione in B.

**Cosa NON cambia.** Struttura, copy, palette `#F5A623`, motion a 5 momenti, regole di accessibilità: tutto da V3.1 e Brief.

**Tre cose che richiedono la tua attenzione prima di partire** (sono in N e in "Bloccanti"):
1. Il Brief e il prototipo V3.1 **non coincidono sui 4 lavori in homepage** (vedi M1).
2. Nel repo c'è già un sito live (`index.html`, 224 KB, bilingue, con pagine SEO e un pannello) e 65 file non committati: serve decidere come sostituirlo senza rompere ciò che Google ha già indicizzato (M4).
3. Gli screenshot di Milano Clubs contengono numeri di telefono dal formato reale (M2).

**Stima di struttura del lavoro.** Le 7 fasi del Brief restano nell'ordine del Brief (§29). Costruisco su un branch, con anteprima Vercel, e `index.html` attuale non si tocca finché non dici tu.

---

## B. Architecture

### B1. Scelta di stack e perché

| Domanda | Scelta | Motivo |
|---|---|---|
| Framework? | **No.** | Studio personale, 10 pagine. Brief §21: niente JS non necessario. Regola tua: vanilla su Vercel. |
| Contenuto nel sorgente? | **Sì, sempre.** | Regola tua sul sorgente leggibile senza eseguire codice. |
| Come si compongono le pagine? | **Script di build Node senza dipendenze**, eseguito da Vercel al deploy (`buildCommand`). Output: file HTML statici in `public/`. | Header, footer, card lavoro e form si ripetono su 11+ pagine: scriverle a mano significa copie che divergono. Una sola funzione per pezzo, un solo file dati. |
| Perché non la funzione serverless a ogni richiesta? | Qui non serve. | Quel metodo risolve il caso "il cliente cambia un prezzo dal suo pannello". Satoshi Web non ha contenuti modificabili da terzi. Il file statico è più veloce, costa zero invocazioni e non ha nulla da proteggere dal bordo. Se un domani i lavori si gestiranno dal pannello, le stesse funzioni pure girano in una funzione senza riscriverle. |
| Il codice dei template gira anche nel browser? | Non serve oggi. Scritto comunque senza `document`/`window` e con i dati come parametri, come da tua regola. | Così il passaggio futuro al server è gratis. |

**Eccezione da approvare:** il `CLAUDE.md` del progetto dice "No build step". Questo piano introduce uno script di build di circa 150 righe, zero dipendenze. È l'unica decisione architetturale che cambia una regola scritta, quindi la segnalo (vedi "Decisioni tecniche", T1). Alternativa scartata: 11 file HTML scritti a mano con header e footer incollati.

### B2. Struttura cartelle proposta

```
satoshiweb-site/
  build.mjs                 script unico, Node, nessuna dipendenza
  src/
    dati/
      lavori.mjs            fonte unica: 6 lavori (testi, asset, link, stato)
      sito.mjs              testi comuni: nav, footer, FAQ, processo, WhatsApp
    tmpl/
      layout.mjs            <head>, header, footer, barra fissa
      home.mjs              le 10 sezioni
      lavori.mjs            indice /lavori e card
      caso.mjs              pagina case study (un solo template, 6 dati)
      grazie.mjs
      demo.mjs              solo scheletro (vedi D)
    css/                    base.css, componenti.css, pagine.css (concatenati e minificati dal build)
    js/                     sito.js (barra fissa, menu, form, tracking) < 6 KB
    asset/                  sorgenti immagini (vedi E)
  public/                   OUTPUT del build + file statici legacy copiati tali e quali
  api/                      resta com'è (pannello, export)
  vercel.json               outputDirectory, redirect, header, rewrite
```

`public/` è generato e committato **no**: lo produce Vercel al deploy. In locale `node build.mjs` per provare.

I file attuali (`pannello.html`, `consent.js`, `privacy/`, le 4 pagine SEO, `llms.txt`, `projects/`, `logo/`) vengono copiati in `public/` senza modifiche, finché non si decide diversamente (M4).

### B3. Pagine prodotte dal build

| Pagina | Template | Note |
|---|---|---|
| `/` | home | 10 sezioni, tutte nel sorgente |
| `/lavori/` | lavori | elenco dei 6, ordine come da decisione M1 |
| `/lavori/a-casa-mia/` `luca-california` `taiko` `milano-clubs` `lazzi` `ikta` | caso | un template, 6 record dati |
| `/grazie/` | grazie | `noindex` |
| `/demo/<slug>/` | demo | `noindex`, vedi D |
| `/404.html` | layout | minima |

---

## C. Component tree

Ogni componente è **una funzione** `(dati) => stringa HTML` in `src/tmpl/`. Niente classi, niente stato.

```
layout(pagina)
├─ head(meta)                     title, description, canonical, OG, JSON-LD, preload font + immagine LCP
├─ header(nav)                    marchio, wordmark, pulsante menu
│   └─ menu(nav)                  pannello a tutto schermo, <dialog> o div con focus trap
├─ main
│   ├─ hero                       etichetta, H1, sottotitolo, CTA primaria, link secondario
│   │   └─ fasciaLavoro           fascia ambra con il visual di A Casa Mia
│   ├─ daDoveParti                due percorsi alla pari
│   ├─ lavori                     H2 + n× schedaLavoro
│   │   └─ schedaLavoro           variante per pattern: "sistema" (Luca), "locale" (ACM), "design" (Taiko), "shop" (Lazzi)
│   ├─ cosaPuoFare                elenco 6 voci, ognuna con rimando al lavoro
│   ├─ processo                   <ol> 4 passi
│   ├─ fondatore                  foto 96x120 + testo
│   ├─ faq                        4× <details>
│   └─ contatti                   CTA WhatsApp, form, "cosa succede dopo"
│       └─ form                   campi, errori, stato
├─ footer                         marchio, link, P.IVA, privacy
└─ barraFissa                     WhatsApp + CTA, solo mobile
```

Pagine caso: `layout` + `casoTesta` + 7 blocchi numerati (`casoBlocco`) + `casoChiusura` (CTA e prossimo lavoro). I blocchi senza contenuto verificato **non vengono emessi** (niente segnaposto in produzione).

JavaScript (un solo file, `defer`, meno di 6 KB senza compressione):
`barraFissa` (IntersectionObserver), `menu` (apri, chiudi, Esc, focus trap), `form` (validazione, invio, stati), `track` (eventi), `reveal` (momenti 1 e 2 di motion). Il resto è CSS puro.

---

## D. Routing

| Route | Indicizzabile | Note |
|---|---|---|
| `/` | sì | canonical `https://satoshiweb.it/` |
| `/lavori/` | sì | |
| `/lavori/<slug>/` (6) | sì | slug: `a-casa-mia`, `luca-california`, `taiko`, `milano-clubs`, `lazzi`, `ikta` |
| `/grazie/` | no (`noindex`, esclusa dalla sitemap) | |
| `/demo/<slug>/` | no (`noindex, nofollow` via `X-Robots-Tag` e meta, `Disallow` in robots, esclusa dalla sitemap) | Brief §17: non costruire un sistema enorme. In questa fase: solo la rotta, il template minimo come da tavola 09 e **nessuna demo reale**. Una demo = un file JSON in `src/dati/demo/`, slug non indovinabile (nome + 6 caratteri casuali). Si attiva quando serve la prima. |
| `/privacy/` | sì | esiste già; testo legale da rivedere (M7) |
| `/pannello`, `/api/*` | no | invariati |

**Trailing slash:** tutte le URL finiscono con `/` (`cleanUrls` + `trailingSlash: true` in `vercel.json`), per coerenza con canonical e sitemap.

**Pagine legacy** (`/realizzazione-siti-web-civitavecchia/`, `/sviluppo-app-civitavecchia/`, `/chatbot-whatsapp/`, `/farsi-trovare-dalle-ai/`): restano raggiungibili all'indirizzo di oggi. Cosa farne dopo è una domanda in N, non una decisione mia.

---

## E. Asset map

Convenzioni: i sorgenti restano in `src/asset/<progetto>/`; il build (script `cwebp`, già installato sul Mac, più `sips` per i ridimensionamenti) produce WebP a 2 o 3 larghezze. **AVIF non è disponibile** (`avifenc` assente): WebP basta e non aggiungo strumenti. Ogni immagine con `width`/`height` dichiarati.

Legenda rischio privacy: **ALTO** = dati dal formato reale, da mascherare prima di usare. **MEDIO** = da confermare. **BASSO** = pulito.

### E1. A Casa Mia

| File | Formato | Ruolo | Dove | Lavorazione | Rischio |
|---|---|---|---|---|---|
| `acasamia/acm-mobile.webp` | 780×1688 WebP 81 KB | visual hero | hero (fascia ambra), scheda lavoro, anteprima in `/grazie` | crop in rapporto 350:215 dall'alto, cornice telefono solo qui. **Unica immagine con `fetchpriority=high`** | basso |
| `acasamia/acm-real-hero.jpg` | 1280×1600 JPEG 178 KB | fotografia reale | testata del case study, eventuale crop nella scheda lavoro | WebP a 640 e 1280. Il Brief §7 dice "sito mobile + fotografia reale": la foto sta nella scheda, non nell'hero | **medio**: è una foto professionale del locale con una persona di spalle (mano e busto, non riconoscibile). Serve conferma che la foto sia usabile (autore e cliente) |
| `acasamia/acm-desktop.webp` | 1440×900 WebP 68 KB | schermata desktop | case study, blocco "e dal computer" | resize 960 e 1440 | basso |
| dal prototipo: `acm-m-orari-crop`, `acm-m-bar`, `acm-m-giornata`, `acm-d-giornata`, `acm-d-orari` | WebP | dettagli | scheda lavoro e case study | come sono, già ritagliati | basso |

Il report V3.1 dice "ricatturare al lancio" perché il giorno evidenziato negli orari cambia con la data: lo faccio nella fase QA, a mano.

### E2. Luca California

| File | Formato | Ruolo | Dove | Lavorazione | Rischio |
|---|---|---|---|---|---|
| `luca/05-richieste-nuove.png` | 780×1688 PNG 100 KB | pannello richieste | scheda lavoro (visual principale), case study passo 2 | WebP 390 e 780 | **basso**: nomi e numeri sono dichiarati finti ("Anteprima: queste richieste sono di esempio", telefono `340 000 0000`) |
| `luca/07-richiesta-nuova-prima-di-confermare.png` | 780×2032 | dettaglio | case study passo 3 | crop a 780×1500 (scarto la zona sotto la barra) | basso, ma contiene la nota privata "tavolo pagato senza problemi": la tengo, è dato finto |
| `luca/08-richiesta-dopo-conferma-e-scrivi.png` | 780×1918 | conferma e WhatsApp | case study passo 4 | come sopra | basso |
| `luca/19-lettore-esito-valido.png` | 780×1688 | lettore ingresso | case study passo 5 | WebP, nessun crop | basso |
| dal prototipo: `luca-m-hero`, `luca-m-serate`, `luca-d-serate` | WebP | sito pubblico | scheda lavoro, case study passo 1 | come sono | basso |

Il segnaposto "PANNELLO DELLE RICHIESTE" del prototipo si sostituisce con `05-richieste-nuove`. In didascalia: **"Schermata con dati di esempio."** (Brief §10: i dati demo restano solo se chiaramente tali.)

### E3. Taiko

| File | Formato | Ruolo | Dove | Lavorazione | Rischio |
|---|---|---|---|---|---|
| `taiko/taiko-public-desktop-hero.png` | 2880×1800 **PNG 2,6 MB** | sito, visual forte | scheda lavoro, testata case study | WebP 960/1440/1920 (circa 60 KB l'uno) | basso |
| `taiko/taiko-event-request-desktop.png` | 2880×1800 PNG 1 MB | richiesta evento | case study | idem | basso |
| `taiko/taiko-admin-requests-desktop.png` | 2880×1800 PNG 158 KB | pannello Requests | scheda lavoro (secondo visual), case study | idem | basso: "Giulia M.", telefoni `+39 300 000 0001`, dichiarabili come esempio |
| `taiko/taiko-admin-events-desktop.png` | 2880×1800 PNG 274 KB | pannello Events | case study | idem | basso. Mostra "Sat 24 Oct 2026 · To be announced": coerente con l'etichetta "in anteprima" |
| dal prototipo: `taiko-m-001`, `taiko-m-hero` (in `asset-ricatturati`) | WebP | mobile | scheda lavoro | come sono | basso |

Il Brief §8 e §9: Taiko è un'anteprima, quindi etichetta **"In anteprima"** sempre visibile e nessun dato presentato come produzione. Le immagini admin sono desktop: su mobile le mostro a larghezza piena come ritagli orizzontali, non come telefoni.

### E4. Milano Clubs

| File | Formato | Ruolo | Dove | Lavorazione | Rischio |
|---|---|---|---|---|---|
| `milano/web-richieste.jpg` | 1400×952 JPEG | pannello desktop | case study (principale) | **mascherare**: numeri `+39 347 221 8940`, `+39 335 907 4412`, `+39 340 118 2277`, `+39 349 663 1105`; ritaglio della barra del browser (mostra `milanoclubreservation.it/pannello`, vedi M3) | **ALTO** |
| `milano/richieste.jpg` | 658×1424 JPEG | richieste mobile | case study | stessi numeri da mascherare. **Risoluzione bassa** (658 px): la pubblico a 330 CSS px max, mai a doppia densità | **ALTO** |
| `milano/stasera.jpg` | 658×1424 | serata, ingressi | case study | nessun telefono, solo nomi (probabilmente finti, vedi M2) | medio |
| `milano/clienti.jpg` | 658×1424 | rubrica clienti con "speso" in euro | opzionale | **non lo uso**, salvo tua decisione: mostra importi spesi per persona, anche se finti suggerisce dati sensibili | medio |
| dal prototipo: `mcr-m-hero`, `mcr-m-form`, `mcr-d-calendario`, `mcr-d-hero` | WebP | sito pubblico | scheda lavoro e case study | come sono | basso |

Il mascheramento lo faccio sostituendo le cifre con `000`, come negli asset di Luca e Taiko, non con un blur (un blur tradisce che c'era un dato; il formato `+39 3xx 000 0000` dichiara che è di esempio).

### E5. Lazzi Barbershop

| File | Formato | Ruolo | Dove | Lavorazione | Rischio |
|---|---|---|---|---|---|
| `lazzi/lazzi-desktop-1-vetrina.png` | 2880×1800 PNG 502 KB | vetrina | scheda lavoro, testata case study | WebP | basso |
| `lazzi/lazzi-desktop-2-catalogo.png` | 2880×1800 | catalogo | case study | WebP | basso |
| `lazzi/lazzi-mobile-3-scheda-prodotto.png` | 780×1688 | scheda prodotto mobile | scheda lavoro | WebP; l'header del sito è tagliato in alto (si vede "LAZZI" a metà): crop dall'alto di circa 80 px | basso |
| `lazzi/lazzi-admin-dashboard-desktop.png` | 1339×741 PNG | pannello Ordini | scheda lavoro, case study | **risoluzione bassa** (1339 px): non oltre 100% di larghezza. Contiene "Marco B.", `marcob@esempio.it`, `+39 320 100 1000`: sono finti, ma **ritaglio la colonna CLIENTE** per sicurezza | basso/medio |
| `lazzi/lazzi-admin-secondary-desktop.png` | 1339×741 | gestione prodotti | case study | idem, nessun dato personale | basso |

### E6. IKTA

| File | Formato | Ruolo | Dove | Lavorazione | Rischio |
|---|---|---|---|---|---|
| `ikta/ikta-home-desktop.png` | 2048×1280 **PNG 2,5 MB** | home | testata case study | WebP | **medio**: hero con volti di un arbitro e un atleta in primo piano. Sito pubblico del cliente, ma serve conferma per volti riconoscibili |
| `ikta/ikta-discipline-desktop.png` | 2048×1280 PNG 254 KB | discipline | case study | WebP | da verificare (non guardata a pieno: controllo in implementazione) |
| `ikta/ikta-gare-desktop.png` | 2048×1280 PNG 1,3 MB | gare | case study | WebP | **medio**: locandine con volti di atleti e il numero `338 4012397`, che è il numero pubblico degli organizzatori, già stampato nelle locandine pubbliche |
| `ikta/ikta-home-mobile.png` | 946×2048 PNG 1,9 MB | home mobile | case study | WebP, crop dall'alto | medio, come sopra |

Se gli atleti sono minorenni, vanno ritagliati o sfocati. Non lo posso verificare dal materiale (M).

### E7. Mappa sezione per sezione (homepage mobile)

| Sezione | Asset | Peso stimato dopo WebP |
|---|---|---|
| Header | `satoshi-mark.svg` (già in `logo/`) + wordmark | 3 KB |
| Hero | `acm-mobile` in cornice telefono, 350:215 | circa 25 KB a 390 CSS px |
| Da dove parti | nessuna immagine | 0 |
| Lavori, ACM | `acm-m-orari-crop` + `acm-m-bar` | 25 KB |
| Lavori, Luca | `05-richieste-nuove` (visual principale) + `luca-m-hero` | 55 KB |
| Lavori, Taiko | `taiko-d-hero` + `taiko-m-001` | 90 KB |
| Lavori, Lazzi | `lazzi-desktop-1-vetrina` + `lazzi-admin-dashboard` (ritaglio) | 70 KB |
| Cosa può fare | `ai-dopo-zoom.webp` (ChatGPT, vedi M5) | 27 KB |
| Fondatore | `edoardo-crop.webp` 96×120 | 15 KB |
| **Totale immagini homepage** | | **circa 310 KB** |

`loading="lazy"` e `decoding="async"` su tutto tranne l'immagine hero.

### E8. Marchio e font

`logo/satoshi-mark.svg` e `satoshi-mark.png` esistono già nel repo. La V3.1 segnala che **sulle fasce ambra il marchio ambra sparisce**: nella V3.1 non compare mai su ambra, quindi non serve una variante scura. La verifico in QA.

---

## F. Responsive strategy

**Metodo:** il CSS di base è quello mobile. Le regole `@media (min-width: …)` aggiungono, non tolgono. Breakpoint: **`min-width: 600px`** (tablet in verticale, 2 colonne dove serve), **`min-width: 834px`** (tablet della tavola), **`min-width: 1200px`** (desktop). 1024 non ha tavola propria: la V3.1 dice di rifinirlo in implementazione, parte dal layout 834 allargato con colonna di testo a 68ch, e lo controllo a mano.

| Tema | Strategia |
|---|---|
| **Tipografia fluida** | `clamp()` solo sui titoli. H1: `clamp(40px, 11.6vw, 52px)` a mobile (come prototipo), sale a `clamp(52px, 5.4vw, 84px)` da 834. Corpo fisso 16 px (17 nel sottotitolo hero). Mai sotto 16 px nei campi del form (evita lo zoom di iOS). |
| **Spaziatura** | scala unica a variabili CSS: 4, 8, 12, 16, 20, 32, 44, 64, 96. Gutter laterale 20 px a mobile, 32 a 834, contenitore max 1200 centrato. Le sezioni verticali: 44 px a mobile (come prototipo), 80 a 834, 112 a 1440. |
| **Griglie** | mobile: una colonna, e coppie di screenshot in `grid 2 colonne minmax(0,1fr)`. 834: lavori in 2 colonne, cosa può fare in 2. 1440: schede lavoro a 12 colonne con visual a destra o sinistra alternati, form a due colonne con "cosa succede dopo" accanto. |
| **Immagini** | contenitori con `aspect-ratio` dichiarato e `object-fit`, `srcset` con `sizes` onesti. Ritagli di crop nel CSS, non nel file, così un cambio di crop non richiede nuove esportazioni. Nessun visual oltre il 31% dell'altezza schermo a mobile (obiettivo V3.1: massimo 278 px a 430). |
| **Case study** | mobile: una colonna, un visual alla volta, legenda sotto, coppie di screenshot mobile in 2 colonne. 834: testo 5 colonne, visual 7. 1440: testo sticky a sinistra, visual che scorrono a destra. |
| **Barra fissa** | solo sotto 834 px (`display: none` sopra). `position: sticky; bottom: 0`, 44 px di altezza, comparsa con IntersectionObserver sulla CTA hero. `padding-bottom: env(safe-area-inset-bottom)`. Non deve coprire il campo attivo: a tastiera aperta (evento `visualViewport.resize`) la barra si nasconde. |
| **Form** | mobile: una colonna, campi alti 48 px, i due opzionali dentro `<details>` come da prototipo. 834 e oltre: **opzionali sempre visibili** (lo spazio c'è, il report V3 nota che nascosti nessuno li apre). |
| **Header e menu** | mobile: marchio + wordmark + pulsante 44×44. Menu a tutto schermo con 5 voci (Lavori, Come lavoro, Contatti, WhatsApp, Instagram). Da 834: voci in riga nell'header, nessun pulsante. **Il menu aperto non è stato progettato nella V3.1**: lo costruisco con le stesse regole del resto (carta, filetti neri, Bricolage 28 px), senza inventare altro. |
| **Breakpoint** | 360 / 390 / 430 sono la stessa mise-en-page fluida, non tre layout. 834 è il tablet vero della tavola. 1440 la tavola desktop. |

**Punti di rischio già noti, con soluzione:**
- A 360 px il titolo hero va su 3 righe piene e il lavoro scende sotto il primo schermo (V3 §10). Soluzione che conserva l'intento: ridurre il padding verticale della fascia ambra e tenere `clamp` minimo 38 px solo sotto 375. La CTA deve restare visibile (V3.1 la misura a 394 px su 740 di schermo).
- Il link "Hai già un sito? Ti dico cosa migliorerei, gratis" a 360 px sfora di pochi pixel (V3.1 §8). Lo tengo su una riga con `text-wrap: balance` e, solo sotto 375, font 14 px.

---

## G. Form architecture

Copy esatto dal Brief §15: obbligatori Nome, Attività, Telefono; opzionali "Sito o Instagram, se li hai" e "Cosa vorresti ottenere?"; placeholder `es. Bar Roma, Civitavecchia`; testo di accompagnamento e promessa "Ti rispondo personalmente entro 1 giorno lavorativo."

| Aspetto | Piano |
|---|---|
| **Campi** | `nome` (`autocomplete="name"`), `attivita` (`autocomplete="organization"`), `telefono` (`type="tel"`, `inputmode="tel"`, `autocomplete="tel"`), `sito` (`type="text"`, non `url`, perché accetta anche `@instagram`), `nota` (textarea, 1000 caratteri max). Etichette sempre visibili, mai solo placeholder. |
| **Validazione** | HTML nativo (`required`, `maxlength`) come base che funziona senza JS, poi JS che aggiunge messaggi. Telefono: accetta cifre, spazi, `+`, trattini, 8 a 15 cifre. Controllo al `blur` e all'invio, mai mentre si digita. |
| **Errori** | testo sotto il campo, collegato con `aria-describedby`, `aria-invalid="true"`, non solo colore (V3 §7). Al primo errore il focus va sul primo campo sbagliato. Un riepilogo non serve con 3 campi. Errore di rete: messaggio sotto il pulsante con un link WhatsApp come via alternativa ("Non è partita? Scrivimi su WhatsApp"). |
| **Loading** | pulsante `aria-busy="true"`, testo "Invio…", disabilitato per evitare doppio invio; torna normale in caso di errore. |
| **Successo** | si va a `/grazie/`. Nome e attività nella pagina grazie arrivano da `sessionStorage`, **mai dall'URL** (regola privacy: niente dati personali in query string). Se `sessionStorage` è vuoto (apertura diretta), la pagina dice "Fatto. Ora tocca a me." senza nome. |
| **Anti-spam** | campo trappola nascosto (`_gotcha` per Formspree) più controllo del tempo (invio sotto 3 secondi dal caricamento = scartato). Niente CAPTCHA: aggiunge attrito e non basta per un modulo con 3 campi. |
| **Privacy** | riga sotto il pulsante: "Inviando accetti la privacy policy" con link a `/privacy/`. Testo informativa da far rivedere (M7). Raccolgo solo i campi visibili, nessun tracciamento nascosto nel payload. Nessun dato nel `localStorage`. |
| **Backend** | **Proposta: tenere Formspree** (`https://formspree.io/f/mqedwdeo`, già funzionante nel sito attuale, già con handler `fetch` con `Accept: application/json`). Zero nuova infrastruttura, zero funzioni da proteggere. Alternativa scartata per ora: un endpoint `/api/contatto` con email Resend e salvataggio nel pannello (Upstash). È più bello perché le richieste finirebbero nel CRM, ma porta con sé le due protezioni obbligatorie (regola sul bordo e blocco tentativi) e un servizio email nuovo. Domanda Q3. |
| **Tracking** | eventi `form_start` (primo focus), `form_submit_click`, `form_success`, `form_error`. Vedi sezione tracking in K. |
| **Senza JavaScript** | il form fa un POST normale a Formspree, che reindirizza a `/grazie/` se la redirect è configurata nel pannello Formspree (da verificare, M6). Altrimenti mostra la pagina di Formspree: accettabile come caso limite. |

---

## H. Motion plan

Cinque momenti, esattamente quelli della V3 §4 (invariati, come dice la V3.1). Solo `opacity` e `transform`. Curva unica `cubic-bezier(0.2, 0.7, 0.2, 1)`. Nessuna libreria: CSS più 14 righe di IntersectionObserver.

| # | Dove | Trigger | Movimento | Durata | Mobile / Desktop | Reduced motion | Funzione |
|---|---|---|---|---|---|---|---|
| 1 | Lavoro nell'hero | caricamento, dopo il testo | sale di 16 px e passa da opacità 0 a 1 | 500 ms, ritardo 150 ms | una schermata / tre in sequenza a 80 ms (solo se esistono tre immagini hero, altrimenti una) | nessun movimento, visibile subito | dare peso al lavoro reale |
| 2 | Punti numerati del case study | schermata dentro per il 40% | ogni punto da 0,6 a 1, riga di legenda evidenziata | 250 ms, 200 ms tra punti | uguale | punti statici | guidare la lettura |
| 3 | Barra fissa | la CTA hero esce dallo schermo | sale dal basso, rientra quando la CTA torna visibile | 200 ms | sì / assente | compare senza transizione | contatto sempre disponibile |
| 4 | Pulsanti | tap o cursore | pressione `scale(0.98)`, freccia avanza di 4 px | 120 ms | solo pressione / pressione + cursore | solo cambio colore | feedback |
| 5 | FAQ e campi opzionali | tap | altezza che si apre | 200 ms | sì | apertura immediata | chiarezza di stato |

**Perché solo questi:** ciascuno risponde alla domanda del Claude Code System ("cosa migliora?"): peso del lavoro, orientamento, disponibilità, feedback, stato. Esclusi per Brief §19: parallax, cursore custom, loader, 3D, WebGL, testo lettera per lettera, video.

**Implementazione di `prefers-reduced-motion`:** un solo blocco `@media (prefers-reduced-motion: reduce)` che azzera `transition` e `animation` e imposta lo stato finale. Il JS non aggiunge classi di animazione se `matchMedia` lo segnala.

**Dettaglio tecnico per il 5:** `<details>` non anima l'altezza in modo nativo. Uso `interpolate-size: allow-keywords` e `::details-content` dove supportati (Chrome); dove non lo sono (Safari) si apre senza animazione, che è accettabile e coerente con "leggera". Da verificare in QA su Safari.

Si implementa nella **Fase 6**, a layout stabile (Brief §29).

---

## I. SEO plan

### I1. Pagina per pagina

| Pagina | Title (max 60) | Meta description (max 155) | Note |
|---|---|---|---|
| `/` | **Satoshi Web: siti web per attività e professionisti, Civitavecchia** (59) | **Costruisco il sito giusto per la tua attività: su misura, pensato per il telefono, con prenotazioni, shop e gestione quando servono. Civitavecchia.** (143) | titolo e descrizione da approvare, sono una proposta mia: il Brief non li fornisce |
| `/lavori/` | **Lavori: siti e sistemi per attività | Satoshi Web** | **Sei progetti reali: un caffè, un PR, un club, un barbiere, una federazione. Cosa serviva e cosa ho costruito.** | |
| `/lavori/<slug>/` | `<Nome>: <categoria> | Satoshi Web` | una frase dal punto di partenza del case study | un title per caso, da dati |
| `/grazie/` | `Richiesta ricevuta | Satoshi Web` | n/a | `noindex` |
| `/demo/*` | n/a | n/a | `noindex, nofollow` |

La parola "Civitavecchia" è nel title della home: il report V3 segnala che "da Google capisco che è per attività locali" è il punto debole. Segnalo però una tensione: l'etichetta hero dice "attività e professionisti" senza località (scelta V3.1, per aprire a un pubblico più largo). Il mio piano tiene la località **nel title, nel JSON-LD e nel footer**, non nella headline, quindi **non tocca il design**.

### I2. Tecnico

| Voce | Piano |
|---|---|
| **Canonical** | `https://satoshiweb.it/<path>/` su ogni pagina |
| **Open Graph / Twitter** | `og:title`, `og:description`, `og:image` (1200×630), `og:locale it_IT`, `twitter:card summary_large_image`. L'`og-image.png` esistente (638 KB) è del vecchio design: va rifatta con la V3.1 (Q6). Per ogni case study l'immagine OG è la sua testata ritagliata, generata dal build |
| **Sitemap** | generata dal build da un elenco di pagine indicizzabili; esclude `/grazie/` e `/demo/`. Le 4 pagine SEO legacy e `/privacy/` restano finché non decidi (Q1) |
| **Robots** | tiene la lista dei crawler AI già consentiti (GPTBot, ClaudeBot, ecc.: sono una scelta tua precedente e coerente con la regola "i clienti devono comparire in ChatGPT"). Aggiungo `Disallow: /demo/`, `/grazie/`, `/pannello`, `/api/` |
| **Dati strutturati** | in **JSON-LD** nel sorgente: `ProfessionalService` (nome, URL, logo, `areaServed` Civitavecchia, `founder` Person, `sameAs` Instagram), `WebSite`, e per ogni case study `CreativeWork` o `Article` con `about`. **Niente `AggregateRating`, `Review`, prezzi o `FAQPage` con risposte non approvate**. La FAQ con 4 risposte è testo reale nella pagina: `FAQPage` lo aggiungo solo se confermi le risposte come definitive (M6) |
| **Gerarchia** | un H1 per pagina, H2 per sezione, H3 per lavoro/capacità/percorso. In home l'H1 è il titolo hero; il titolo "Non racconto cosa so fare. Te lo faccio vedere." è un H2 |
| **Alt** | testi descrittivi dati nel file `lavori.mjs`, uno per immagine, controllo automatico nel build (build fallisce se manca). Vuoto (`alt=""`) sul marchio accanto al wordmark |
| **Internal linking** | scheda lavoro della home → case study → `/lavori/` → prossimo caso; ogni caso link a "Parliamo del tuo progetto". "Cosa può fare un sito" rimanda a ogni caso corrispondente (Brief §11). Footer con Lavori, Come lavoro, Contatti, Privacy |
| **URL** | slug italiani corti, minuscolo, trattini, trailing slash |
| **Performance SEO** | vedi K |
| **Controllo carattere per carattere** | il build stampa i caratteri di testo del sorgente ripulito da `script` e `style` (soglia tua: 900 pagina normale, 2500 scheda che deve farsi trovare). Obiettivo: home sopra 2500, casi sopra 900 |

Non creo pagine SEO vuote: nessun `/siti-web-civitavecchia`, nessuna pagina per settore. Le 4 pagine legacy non sono mie da giudicare qui (Q1).

---

## J. Accessibility plan

Checklist tecnica, tutta ricavata da V3 §7 e Brief §20.

- [ ] **HTML semantico:** `header`, `nav`, `main`, `section` con titolo, `footer`; `ol` per il processo, `ul` per l'elenco capacità; `dl` per Prima / Ora; `details/summary` nativi per la FAQ.
- [ ] **Skip link** "Vai al contenuto" come primo elemento, visibile al focus.
- [ ] **Focus:** contorno 3 px `#17130F`, offset 3 px, `:focus-visible`; sulle sezioni scure `#F6F3EC`. Mai `outline: none` senza sostituto.
- [ ] **Tastiera:** ordine DOM uguale all'ordine visivo. Menu mobile: `aria-expanded` sul pulsante, focus trap, Esc chiude, il focus torna al pulsante. Barra fissa raggiungibile ma non intrusiva.
- [ ] **Contrasto** (da ricalcolare sul sito costruito, non fidarsi del report): `#17130F` su `#F6F3EC` 16,7:1; secondario `#3F3A32` 10,2:1; `#5F594F` 6,3:1; testo scuro su ambra 9,1:1; testo ambra su carta solo come `#9A5D00` (4,8:1). **Mai** testo bianco su ambra, **mai** ambra come colore del testo.
- [ ] **Aree di tocco:** minimo 44×44 px. Il report V3 segnala di correggere i link di testo nel footer e "privacy policy": padding verticale 11 px sul footer (già nel prototipo) e link privacy dentro un'area di 44 px.
- [ ] **Form:** `<label>` sempre visibile, `aria-describedby` per errori, `aria-invalid`, `autocomplete`, `required` e asterisco con spiegazione. Errore non solo colore. Esito invio annunciato con `role="status"`.
- [ ] **ARIA solo dove serve:** `aria-expanded` sul menu, `aria-busy` sul pulsante invio, `aria-label` sul pulsante WhatsApp icona. Nient'altro.
- [ ] **Alt:** descrittivi per le schermate, vuoti per il marchio. Per i punti numerati il significato sta nella **legenda testuale**, non nei numeri sull'immagine (V3 §7).
- [ ] **Reduced motion:** vedi H.
- [ ] **Barra fissa:** non copre il campo attivo a tastiera aperta.
- [ ] **Lingua:** `<html lang="it">`.
- [ ] **Zoom:** nessun `user-scalable=no`, funziona a 200% senza scroll orizzontale.
- [ ] **Testo come immagine:** la prova ChatGPT (`ai-dopo-zoom.webp`) è un'immagine di testo (V3 §10 lo segnala). Aggiungo la trascrizione come testo visibile o in `<figcaption>`, così è selezionabile e leggibile da screen reader e crawler.
- [ ] **Verifica:** axe-core in console (strumento da sviluppo, non entra nel sito), navigazione solo tastiera su tutte le pagine, VoiceOver su iOS sulle pagine home e grazie.

---

## K. Performance plan

**Budget (misurabili, da controllare a ogni fase):**

| Metrica | Obiettivo (mobile, 4G lento) |
|---|---|
| LCP | sotto 2,0 s; l'elemento LCP è il titolo hero (testo), non l'immagine, per scelta |
| CLS | sotto 0,02: dimensioni dichiarate su tutte le immagini, font con `size-adjust` |
| INP | sotto 100 ms: nessun lavoro lungo, JS minimo |
| Peso HTML home | sotto 40 KB compresso |
| JS totale | sotto 6 KB compresso, un solo file `defer` |
| CSS totale | sotto 25 KB compresso, inline il critico (sopra la piega) e un file per il resto |
| Immagini homepage | circa 310 KB (vedi E7) |
| Richieste al primo caricamento | sotto 15 |

**Font:** Bricolage Grotesque (titoli, 700 e 800) e Geist (testo, 400, 500, 600): **due famiglie, 5 pesi**, come richiede V3 §8. Il prototipo li carica da Google Fonts: lo sostituisco con **WOFF2 ospitati in proprio** (niente richiesta a terzi, niente problema di privacy GDPR), subset latino con accenti italiani, `font-display: swap`, `<link rel="preload">` solo per Bricolage 800 e Geist 400, `size-adjust` e `ascent-override` sul fallback per CLS vicino a zero. **Peso previsto: circa 80 KB totali.** Wordmark "Satoshi Web": proposta in T3.

**Immagini:** WebP, 2 o 3 larghezze (`srcset` con `sizes`), conversione con `cwebp` nello script di build (nessuna dipendenza npm). Solo l'immagine hero ha `fetchpriority="high"` e niente `loading="lazy"`. Resto `lazy` e `decoding="async"`. Dimensioni sempre dichiarate.

**JavaScript:** vedi C. Niente librerie. Nessun GSAP, Motion, Rive, Three: il Brief §19 vieta ciò che richiederebbe una libreria, e V3 §8 conferma "bastano CSS e IntersectionObserver". `IntersectionObserver` condiviso per i momenti 1, 2, 3.

**CSS:** variabili per palette e scala, nessuna utility library. Il CSS critico (header, hero, fascia lavoro) è inline nell'`<head>`, il resto in un file con `rel="preload"` poi `stylesheet`.

**Caching e header** (`vercel.json`): HTML `public, max-age=0, must-revalidate` (Vercel lo serve già dalla CDN), asset con hash nel nome `public, max-age=31536000, immutable`. Il build aggiunge un hash al nome di CSS, JS, immagini e font.

**Terze parti:** il sito attuale carica Vercel Web Analytics, Victor Analytics (script `t.js`) e GA4 solo dopo consenso (`consent.js`). Nella V3.1 proporrei di **tenere solo i primi due senza cookie** e GA4 dopo consenso come oggi: non cambio la tua scelta. `consent.js` (4,5 KB) resta com'è.

**Misurare, non stimare:** a ogni fase Lighthouse mobile (3 passate, mediana) sulla preview Vercel, e `curl` + conteggio dei caratteri di testo del sorgente.

---

## L. QA plan

### L1. Viewport (Brief §24, §6)

360, 390, 430, 834, 1440, più 1024 (non ha tavola, vedi F). Per ciascuno controllo: hero, headline, CTA, visual, portfolio, case study, form, barra fissa, FAQ, immagini, **zero scroll orizzontale** (`document.documentElement.scrollWidth <= innerWidth` verificato via JS).

### L2. Browser (Brief §25)

| Browser | Come | Limiti |
|---|---|---|
| Chromium | Browser pane integrato, tutti i viewport | nessuno |
| Chrome desktop | Claude in Chrome se serve verificare consenso e tracking | nessuno |
| Safari desktop | **non verificabile da me**: serve il tuo Mac e il tuo occhio | M (bloccante?) no |
| Safari iOS | **non verificabile da me** su dispositivo reale. Posso usare il Simulatore iOS (tool disponibile) per un primo controllo: non sostituisce l'iPhone | M |
| Chromium mobile | emulazione del pane (`resize_window` mobile, user agent Android) | emulazione, non dispositivo |

Cosa mi serve da te per Safari iOS reale: aprire la preview Vercel dal telefono e dirmi cosa non va. Lo metto in lista, non è un bloccante per iniziare.

### L3. Cosa si testa (Brief §25)

Menu (apri, chiudi, Esc, focus), form (campi vuoti, telefono errato, invio ok, invio con rete spenta, doppio click), barra fissa (appare dopo la CTA, scompare in cima, non copre il form con tastiera), WhatsApp (link e testo precompilato), tutti i link interni ed esterni (script che controlla i 200), immagini (nessuna rotta, nessun crop che taglia testo importante), focus visibile, solo tastiera, reduced motion (emulazione della preferenza).

### L4. Controlli automatici nel build

Il build **fallisce** se: un'immagine non ha `alt`, `width` o `height`; un link interno punta a una pagina inesistente; un `<h1>` manca o è doppio; il testo contiene `—` (em dash, regola tua); un file dato contiene `[DA …]` o `[TEMPO …]` (segnaposto del prototipo non risolti); un asset della lista "da mascherare" non ha la versione ripulita.

Più, a ogni fase: `scripts/controlla-testi.py` e `audit-design.py` delle skill `tipografia-web` e `design-web` (regola tua: zero problemi di sfori, parole brevi a fine riga, vedove), `node --check` e **console del browser senza errori** (regola tua: `node --check` non vede un commento a blocco aperto).

### L5. Confronto con la V3.1 (Brief §26)

Dopo ogni fase importante: screenshot a 390, 430, 834, 1440 e confronto affiancato con `screenshot/` della V3.1. Per il confronto numerico: altezza pagina (V3.1: **7.136 px a 390, 7.120 a 360, 7.087 a 430; 5.277 a 834; 5.263 a 1440**) con tolleranza ±8% perché cambia l'ordine dei lavori e aggiungo Lazzi (M1). Il Brief indica "circa 7.000 a 7.500" a mobile.

### L6. Agenti e skill

Il Claude Code System propone agenti (`satoshi-mobile-qa`, `satoshi-design-critic`, ecc.) e skill permanenti. **Non li creo in Fase 1.** Per la regola tua di proporre prima: quando arriveremo a QA proporrò `design-review` (con chrome-devtools) e l'agente Accessibility Auditor, spiegando perché.

---

## M. Potential blockers

Tutto ciò che **non posso verificare dal materiale** o che non coincide tra i documenti.

**M1. Brief e V3.1 non coincidono sui 4 lavori in homepage.** Il Brief §7 (priorità 1): **A Casa Mia, Luca California, Taiko, Lazzi Barbershop**. Il prototipo V3.1 e il suo report: **Luca, A Casa Mia, Taiko, Milano Clubs**, con Lazzi solo come testo sotto "Può vendere". Anche il tuo messaggio dice Lazzi in home e Milano in `/lavori`: seguo Brief e messaggio. Conseguenze:
  - **Lazzi non ha un blocco progettato**: serve costruirne uno con lo stesso schema degli altri (etichetta, nome, frase del Brief, visual, link), usando `lazzi-desktop-1-vetrina` più `lazzi-admin-dashboard`. È l'applicazione di un pattern esistente, non una nuova direzione, ma è la cosa più vicina a "design nuovo" del piano: segnalo.
  - **Milano Clubs sparisce dalla home**: la voce "Può raccogliere prenotazioni" in "Cosa può fare un sito" cita già "Luca California, Milano Clubs Reservation": si mantiene, con link al case study Milano.
  - **Ordine delle schede:** Brief elenca ACM, Luca, Taiko, Lazzi; V3.1 mette Luca primo ("caso principale e completo"). Propongo di seguire l'**ordine V3.1 con Luca per primo** (il Brief dice che il messaggio "sistema" regge solo con Luca, il report V3.1 §8 lo conferma), con Lazzi per ultimo. Domanda Q2.

**M2. Dati personali e dati finti.** Luca, Taiko e Lazzi: nomi e numeri sono chiaramente di esempio (`000`, `esempio.it`, banner "sono di esempio"). **Milano Clubs**: numeri come `+39 347 221 8940` hanno formato reale e non sono marcati come demo. Non so se siano dati inventati. Li maschero comunque (vedi E4). Se sono dati reali di clienti reali, il problema è già nel progetto originale.

**M3. Dominio di Milano Clubs.** `web-richieste.jpg` mostra nella barra del browser `milanoclubreservation.it/pannello`. Il prototipo e il report scrivono `milanoclubsreservation.it` (con la **s**). Uno dei due è sbagliato: devo verificarlo prima di inserire il link. Inoltre quella barra del browser rivela il percorso del pannello: la ritaglio.

**M4. Il sito attuale e il lavoro non committato.** `git status` mostra **65 modifiche non committate** (index.html, vercel.json, sitemap, nuove cartelle `api/`, `privacy/`, pagine SEO, `pannello.html`, ecc.). Non so se sono lavoro finito. Prima di costruire sul branch serve che il tuo stato sia salvato (commit su un branch di backup o stash). Non lo faccio io senza il tuo ok. Inoltre `index.html` oggi è bilingue (IT/EN, con `translations-extra.js` da 128 KB) e ha un posizionamento diverso ("App & Sistemi"): la V3.1 è solo in italiano. Domanda Q1.

**M5. Prova ChatGPT** (`ai-dopo-zoom.webp`): il report V3.1 dice "data e domanda esatta da annotare". Non le ho. Se non sono confermate, quella voce di "Cosa può fare un sito" resta con l'avviso "non è una promessa di posizionamento" ma non posso datarla.

**M6. Cose che dipendono da servizi esterni e non verifico ora.** Se Formspree supporta il redirect a `/grazie/` sul tuo piano; se le risposte FAQ sono definitive (per `FAQPage`); se `Satoshi` come font ufficiale è scaricabile con licenza che permetta il self-hosting (il prototipo non lo caricava, V3 §1).

**M7. Testi legali.** Informativa privacy e cookie: segnaposto nel prototipo (`[TESTO INFORMATIVA - DA INSERIRE]`). Esiste già `/privacy/` nel repo (157 righe): non l'ho validata. Il form non può andare in produzione con un testo che non hai approvato.

**M8. Contenuti ancora da confermare** (V3.1 §6, ripresi, nessuno bloccante per iniziare ma bloccanti per il lancio):
  1. Luca: "richieste, liste e tavoli gestiti a mano su WhatsApp" approvato da lui.
  2. Il Brief §8 dice che per Milano "prima le richieste arrivavano via messaggi, centinaia al giorno, dato stimato": il report V3.1 dice di **non** averlo scritto "perché non mostrabile". Seguo il Brief ma lo scrivo come stima ("centinaia di messaggi al giorno, stima") e solo nel case study.
  3. Nome del referente: il Brief scrive "Samuele può aprire il pannello" nel testo di **Luca California** e anche in quello di **Milano**. Può essere lo stesso Samuele in entrambi, o un errore. Va confermato prima di scrivere il copy (Q4).
  4. Autorizzazioni dei clienti a comparire sul sito.
  5. Funzionalità ACM sviluppate da te, e che la foto sia usabile.
  6. Tempo di risposta: il Brief lo ha deciso ("entro 1 giorno lavorativo"): considero la questione chiusa, rimuovo il segnaposto.
  7. Taiko come "anteprima" (domanda 4 V3.1): il Brief §7 dice di non presentarla come produzione se è demo: etichetta fissa.

**M9. Non verificabile da me:** Safari iOS reale e Safari desktop, VoiceOver su dispositivo, comportamento su rete lenta reale. Vedi L2.

**M10. Fondatore.** `edoardo-crop.webp` è la foto formale "temporanea" (V3.1). Brief §13 vieta posa da CEO e completo. La foto attuale è usata solo finché non ne hai una nuova: è un segnaposto accettato dal report, non dal Brief. Il blocco fondatore a 96×120 px è abbastanza piccolo da reggere. Q5.

---

## N. Questions

Solo domande che il materiale non risolve e che cambiano l'implementazione. Per ognuna ho già una **risposta di default**: se non dici nulla, procedo con quella.

**Q1. Il sito attuale: cosa ne facciamo?** `index.html` (bilingue, posizionamento App & Sistemi), le 4 pagine SEO, `llms.txt`, `pannello.html`.
Default: la V3.1 sostituisce solo la homepage `/`, in italiano; l'inglese di `index.html` non viene riportato (il Brief non lo cita); le 4 pagine SEO, `/privacy/`, `/pannello`, `llms.txt` restano intatte e raggiungibili; **nessun redirect** finché non lo decidi. Il vecchio `index.html` si archivia in `_archivio/` fuori dal build.
Ti chiedo conferma perché è l'unica azione del progetto con effetto su pagine già indicizzate.

**Q2. Ordine delle 4 schede in home.**
Default: Luca, A Casa Mia, Taiko, Lazzi (ordine V3.1, con Lazzi al posto di Milano).

**Q3. Backend del form.**
Default: Formspree (esistente). Alternativa: endpoint proprio che scrive nel pannello. La scelta cambia le protezioni da installare.

**Q4. "Samuele": chi è, per Luca e per Milano?** Il Brief usa lo stesso nome per due clienti diversi.
Default: scrivo "il titolare" finché non me lo dici, nei due testi.

**Q5. Foto fondatore.** Attendi il nuovo scatto o parti con quella attuale?
Default: parto con quella attuale in piccolo, come nel prototipo, e la sostituisco quando arriva.

**Q6. Immagine social (OG) e foto OG dei casi.** Posso generarla dal design V3.1 (hero con titolo e lavoro) oppure ne hai già una nuova.
Default: la genero io dal build con screenshot dell'hero.

**Q7. Wordmark.** Satoshi originale o Bricolage? (V3 §12 punto 1, V3.1 non lo chiude, Brief §18: "Satoshi quando disponibile/verificato").
Default: **Bricolage Grotesque 700 in forma di SVG** (nessun file font in più), da sostituire con Satoshi se scarichi tu il file e ne verifichi la licenza. Vedi T3.

---

## DECISIONI CHE NON HO MODIFICATO

Tutto quello che segue è rispettato come scritto.

**Posizionamento e copy**
- Messaggio principale: "Costruisco il sito giusto per la tua attività." Prima persona singolare.
- Etichetta hero "Siti web per attività e professionisti"; sottotitolo "Su misura e pensato per il telefono. Quando serve, collegato a prenotazioni, vendite e gestione."
- CTA primaria "Parliamo del tuo progetto →"; secondaria "Hai già un sito? Ti dico cosa migliorerei, gratis".
- "Parli direttamente con chi costruisce il tuo sito."
- Voce: termini tecnici spiegati in modo semplice.

**Struttura**
- 10 sezioni nell'ordine del Brief §4, nessuna aggiunta.
- "Da dove parti?" con due percorsi alla pari.
- "Un sito può essere molto più di una vetrina", come elenco che rimanda ai lavori (Brief §11: prove reali, non lista astratta).
- Processo in 4 passi: Guardo / Ti dico cosa serve / Lo costruiamo / Lo mettiamo online.
- Fondatore compatto, 96×120 px accanto al testo.
- FAQ: 4 domande (costo, tempi, partire da zero, rifare tutto), senza prezzi né tempi inventati.
- Ambra solo come fondo; pulsante primario nero; barra fissa nera.

**Brand e design**
- Palette di partenza `#F5A623` + neutri `#17130F`, `#F6F3EC`, `#9A5D00` per testo ambra. **Non** sostituita con `#FF5A1F` o `#FFD60A`.
- Marchio a S originale.
- Bricolage Grotesque e Geist (come V3.1).
- Direzione A, editoriale, non SaaS, non template.

**Portfolio e case study**
- 4 lavori in home, Milano e IKTA in `/lavori` e nei casi.
- Struttura case study in 7 passi (Brief §9).
- A Casa Mia come visual hero.
- Nessun testimonial, numero, metrica o pricing inventato.
- Taiko non presentato come produzione.
- Dati personali reali anonimizzati, dati demo ammessi se dichiarati.

**Mobile e conversione**
- Mobile, poi tablet, poi desktop; 360, 390, 430, 834, 1440.
- Nessun visual oltre il 31% dello schermo, pagina mobile circa 7.000 a 7.500 px.
- Barra fissa WhatsApp + CTA, solo dopo che la CTA hero esce dalla viewport, senza ombra pesante.
- Form con 3 obbligatori + 2 opzionali, testo e promessa del Brief, thank-you page.
- Nessuna sezione prezzi, blog, team, manifesto, "perché sceglierci".

**Motion, accessibilità, performance**
- I 5 momenti di motion della V3, `prefers-reduced-motion` su ognuno, nessun parallax, cursore, loader, WebGL.
- Requisiti di accessibilità V3 §7 (focus 3 px, 44 px, `details` nativi, label visibili).
- 2 famiglie di font, 5 pesi, WOFF2, niente video, niente librerie di animazione.

**Processo**
- Ordine delle 7 fasi del Brief §29, motion solo a layout stabile.
- Non riscrivo i database dei progetti originali.

---

## DECISIONI TECNICHE CHE PROPONGO

| # | Decisione | Perché | Se la rifiuti |
|---|---|---|---|
| T1 | **Script di build Node senza dipendenze** che compone HTML statico dai file dati, eseguito al deploy. Contraddice "No build step" del `CLAUDE.md` di progetto. | Evita 11 pagine con header e footer duplicati; contenuto sempre nel sorgente; zero invocazioni a pagamento. | HTML scritti a mano, con una manutenzione molto peggiore. |
| T2 | **Output in `public/`**, `outputDirectory` in `vercel.json`, file legacy copiati identici. | Separa sorgente e generato senza toccare le pagine esistenti. | Generare nella radice: mescola file scritti e generati. |
| T3 | **Wordmark come SVG** (Bricolage 700 convertito in tracciati) finché non c'è il file Satoshi verificato. | Un font in meno da caricare, nessun salto di layout, decisione reversibile. Brief: "Satoshi quando disponibile/verificato". | Caricare Satoshi da Fontshare (come il sito attuale): richiede una richiesta a terzi o un download da autorizzare. |
| T4 | **Font in self-hosting**, WOFF2, subset latino, `size-adjust`. | Prestazioni, privacy, nessuna dipendenza da Google Fonts. | Tenere Google Fonts come nel prototipo: più lento e richiede informativa. |
| T5 | **WebP con `cwebp`** (già installato), nessun AVIF, nessun `sharp`. | Nessuna dipendenza nuova. | Installare `sharp`: più comodo, ma un pacchetto in più. |
| T6 | **JavaScript unico, minimo, `defer`**, nessuna libreria. Un solo `IntersectionObserver` condiviso. | Brief §21, V3 §8. | n/a |
| T7 | **Form su Formspree** esistente, `fetch` con `Accept: application/json`, honeypot, controllo del tempo, nome e attività passati a `/grazie/` con `sessionStorage`. | Zero infrastruttura nuova, nessun dato in URL. | Endpoint proprio (richiede le due protezioni delle funzioni). |
| T8 | **Tracking a eventi con `data-track`** sugli elementi e un solo gestore, che invia al beacon Victor Analytics (già attivo) e a `gtag` solo se `consent.js` ha il consenso. Eventi: `cta_hero`, `cta_secondaria`, `whatsapp_click` (con `posizione`: hero, barra, form, footer, grazie), `form_start`, `form_submit`, `form_success`, `portfolio_click`, `caso_view`, `demo_view`. | Brief §23, riusa ciò che c'è. | n/a |
| T9 | **`/demo/<slug>/` solo scheletro**: rotta, `noindex`, nessuna demo. | Brief §17: non costruire un sistema enorme. | Niente rotta ora. |
| T10 | **Build che fallisce** su alt/dimensioni mancanti, link rotti, segnaposto non risolti, em dash nel testo. | Trasforma i controlli in cose che non si possono dimenticare. | Controlli solo manuali in QA. |
| T11 | **Mascheramento dei numeri di telefono con `000`**, non con blur (E4). | Il formato `000` dichiara il dato come esempio. | Sfocatura: nasconde ma suggerisce un dato reale. |
| T12 | **Sviluppo su un branch dedicato** con anteprima Vercel; `main` e il sito live non si toccano finché non approvi. | Il lavoro non committato (M4) e il sito attuale sono al sicuro. | Lavorare su `main`. |
| T13 | **Lazzi con lo stesso schema degli altri lavori** (M1): etichetta, nome, frase del Brief, visual, link. | Il Brief lo richiede in home e la V3.1 non lo disegna. | Ti segnalo, non lo invento: se vuoi che lo disegni Claude Design, aspetto. |
| T14 | **`/design-review`, `design-web`, `tipografia-web`** come da regola tua per UI: `design.md` di progetto assente nel repo (esiste solo il master globale). Prima di scrivere codice ti propongo di copiare il master in `.claude/design.md` e compilare i token con te. | Regola tua: succede senza che tu lo chieda. | Procedere senza. |

---

## BLOCCANTI

Solo ciò che impedirebbe **davvero** di iniziare l'implementazione.

1. **Stato del repository.** 65 modifiche non committate su `main`. Prima di creare il branch di lavoro serve il tuo ok su come metterle al sicuro (commit di backup sul branch, o lasciarle dove sono e partire da un clone). Senza questo rischio di perdere lavoro.
2. **Conferma di Q1**: cosa succede al sito attuale e alle pagine già indicizzate. Posso iniziare la Fase 1 (foundation) in un branch senza saperlo; **non posso mettere online** la V3.1 senza.

Non sono bloccanti per **iniziare** (lo sono per il **lancio**): Q4 (Samuele), testi legali (M7), conferme clienti (M8.4), dominio di Milano (M3), data della prova ChatGPT (M5), Safari reale (M9).

---

*Fine del piano. Mi fermo qui e aspetto la tua revisione. Nessun file del sito è stato toccato, nessun branch creato, nessuna immagine ritoccata.*

---

## REVISIONE 1 (8 ottobre 2026): decisioni approvate e variazioni emerse nella foundation

**Approvate da Edoardo**
- **Q1:** la V3.1 sostituisce solo la homepage `/`, in italiano. Pagine SEO, `/privacy/`, `/pannello`, `llms.txt` e route legacy restano raggiungibili, nessun redirect. Il vecchio `index.html` è archiviato in `_archivio/index-app-sistemi-2026-09-28.html` (copia dello stato del 28 settembre, non cancellato).
- **Q2:** ordine homepage Luca California, A casa mia, Taiko, Lazzi Barbershop. A casa mia resta il visual hero. Milano e IKTA solo in `/lavori/` e nei case study. Lazzi con ESATTAMENTE il pattern degli altri lavori.
- **Q3:** Formspree esistente, `fetch`, honeypot, controllo anti-spam, redirect a `/grazie/`, tracking, WhatsApp come alternativa. Nessun endpoint proprio.
- **Q4:** "il titolare" nei testi di Luca e Milano, mai "Samuele" finché non è verificato.
- **Q5:** foto fondatore attuale, TEMPORANEA, blocco piccolo e secondario.
- **Q6:** OG generate dal design V3.1: home coerente con l'hero, una per ogni case study. Niente vecchia `og-image.png` sulle pagine nuove.
- **Q7 (modificata):** priorità 1 wordmark ufficiale già nel progetto, 2 font Satoshi originale solo se disponibile e con licenza verificata, 3 Bricolage solo in assenza.
- Nessuna nuova decisione di design senza approvazione. Menu mobile ammesso, con le regole visive V3.1. Taiko sempre "In anteprima". Asset a rischio privacy: verificati o mascherati prima dell'uso.

**Esito sul wordmark (Q7).** Nel repo non esiste un file wordmark separato. Il "wordmark" del sito attuale è il marchio a S in SVG (`logo/satoshi-mark.svg`, già copiato) più il testo "Satoshi Web" composto in carattere Satoshi 700 (ora da Fontshare). `logo2*` è il logo di Lazzi, non di Satoshi Web. Quindi: marchio SVG ufficiale usato così com'è, non modificato; testo del nome in Satoshi 700 appena il file è disponibile con licenza verificata. Nel frattempo il nome ricade su Bricolage tramite `--f-wordmark` (una sola variabile da cambiare). **T3 (wordmark come SVG di Bricolage) è ritirata.**

**Variazioni tecniche rispetto al piano**
- **T5 cambiata:** `cwebp` e `sips` non esistono sui server di Vercel, quindi le immagini non si convertono nel build. `scripts/immagini.mjs` gira in locale e scrive `src/img/` (WebP a 390/780/1440 con hash nel nome, più `manifest.json`), che si committa. Il build di Vercel usa solo Node puro.
- **T2 precisata:** il build scrive in `public/` (ignorato da git). La configurazione Vercel del nuovo sito è in `vercel.v31.json`. **`vercel.json` attuale non è stato toccato**, così un `vercel --prod` fatto per sbaglio da questa cartella non rompe il sito live. Si attiva solo al go-live.
- **Tutte le pagine sono `noindex` e `robots.txt` è `Disallow: /`** finché non si imposta `SW_INDICIZZA=1`. Una preview non può finire su Google per errore.
- **Barra fissa:** solo sulla home (dopo la CTA hero). Sulle pagine interne non c'è, perché la V3.1 non la prevede lì. Se la vuoi anche nei case study è una decisione di design.
- **Dati di Lazzi e Milano:** `link: null` finché non verifico indirizzo e dominio (M3).
- **`llms.txt` legacy** dice "A partire da 200 euro" per i siti. Il Brief vieta prezzi non approvati. Il file resta com'è finché non decidi; lo segnalo.
