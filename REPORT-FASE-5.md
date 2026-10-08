# Satoshi Web V3.1: report Fase 5, SEO e contenuti pre-lancio

Data: 8 ottobre 2026. Branch: `v3.1-foundation` (commit `7cbed98`). `main`, `vercel.json` e il sito live intatti. Le 65 modifiche preesistenti non sono state committate.
**`SW_INDICIZZA` è rimasto a 0 per tutta la fase. Nessun deploy è stato fatto.** Il build di prova con l'indicizzazione accesa è stato eseguito solo per controllare robots, meta e sitemap, poi ripristinato.

## 1. Chiusura della Fase 4 (modifiche applicate)

- Stato di errore (testo in grassetto con "!" e bordo a 2 px) e pagina grazie: invariati.
- Invio rapido: un invio reale entro 3 secondi dal caricamento ora mostra **"Aspetta un momento e riprova."**, non va a buon fine, non spiega il meccanismo e non blocca il pulsante. L'honeypot compilato resta scartato in silenzio.
- Promessa "Ti rispondo personalmente entro 1 giorno lavorativo.": una sola occorrenza nella home, sotto il pulsante. Tolta dal passo 2 di "Cosa succede dopo".
- Test automatici del form: 40 su 40 superati, senza inviare richieste reali.

## 2. Title e meta description

Limiti controllati dal build (title massimo 60, description da 70 a 160, nessun duplicato). Se un limite viene violato il build fallisce.

| Pagina | Title (caratteri) | Description |
|---|---|---|
| Home | Satoshi Web: siti web per attività e professionisti (51) | Costruisco il sito giusto per la tua attività: su misura, pensato per il telefono, con prenotazioni, shop e gestione quando servono. Studio a Civitavecchia. (156) |
| Lavori | Lavori: siti e sistemi per attività \| Satoshi Web (49) | Sei progetti reali: un caffè, un PR, un club, un barbiere, una federazione. Cosa serviva e cosa ho costruito. (109) |
| Luca California | Luca California: sito e pannello richieste \| Satoshi Web (56) | Ho costruito lucacalifornia.it e un pannello da telefono per ricevere e gestire le richieste: conferma, WhatsApp già scritto e lettore all'ingresso. (148) |
| A casa mia | A casa mia: sito per un caffè a Civitavecchia \| Satoshi Web (59) | Un sito pensato per il telefono per un caffè di Civitavecchia: orari con il giorno di oggi, barra contatti sempre visibile, italiano e inglese. (143) |
| Taiko | Taiko: sito e pannello richieste, in anteprima \| Satoshi Web (60) | Anteprima di un sito con richiesta d'accesso e un pannello webapp per gestire richieste ed eventi. Direzione visiva e design su misura. (135) |
| Lazzi | Lazzi Barbershop: shop online con pannello \| Satoshi Web (56) | Il sito e lo shop online di Lazzi Barbershop, a Civitavecchia, con ordini, prodotti e inventario gestiti dal browser attraverso il pannello. (140) |
| Milano Clubs | Milano Clubs Reservation: richieste dal sito \| Satoshi Web (58) | Le richieste di tavolo arrivano dal sito e si gestiscono da un pannello, anche dal telefono: richieste nuove e confermate, e la serata in corso. (144) |
| IKTA | IKTA: un sito che organizza la complessità \| Satoshi Web (56) | Il sito di una federazione di kick boxing e muay thai: discipline, gare ed eventi in ordine, con una navigazione chiara. (120) |
| Privacy | Privacy e cookie policy \| Satoshi Web (37) | Come tratto i dati personali raccolti tramite il sito satoshiweb.it, quali cookie uso e quali diritti hai. (106) |

Ogni frase deriva dai testi già approvati o da ciò che gli screenshot mostrano. Il title della home (51) sostituisce quello da 66 caratteri della bozza. La località sta nella description, nel JSON-LD e nel footer, non nel title.

## 3. Immagini OG e icona

- **Sette immagini OG** 1200x630, generate in locale dal design V3.1 con `scripts/og.py` (stessi font, palette e visual dei lavori): home, sei case study. Pesano da 40 a 90 KB l'una. La home usa il visual di A casa mia come nell'hero. Taiko ha il badge "In anteprima". Nessuna immagine con "Samuele", con volti o con dati personali.
- Ogni pagina ha `og:image` con larghezza, altezza e testo alternativo, più `twitter:image` con `summary_large_image`. I file hanno l'hash nel nome, per non restare bloccati nelle cache dei social. La vecchia `og-image.png` non è usata dalle pagine nuove (resta solo per le pagine legacy che la citano).
- **`apple-touch-icon.png`** 180x180: marchio a S ambra, non modificato, su fondo carta. Il build verifica che ogni pagina lo dichiari.
- Lo script `og.py` gira solo in locale (usa Playwright), come `immagini.mjs`: Vercel riceve le immagini già pronte.

## 4. Canonical, sitemap, robots

- **Canonical:** ogni pagina punta a sé stessa con lo slash finale (`https://satoshiweb.it/...`); il build verifica che coincida.
- **Sitemap:** 13 URL: home, `/lavori/`, sei case study, `/privacy/` e le quattro pagine di approfondimento legacy. Esclusi `/grazie/` e `/demo/`. Il build controlla che ogni pagina indicizzabile sia presente.
- **Robots, verificato nelle due modalità.** Spento (come ora): `Disallow: /` e `noindex, nofollow` ovunque. Acceso (simulato): consentito tutto, `Disallow` su `/demo/`, `/grazie/`, `/pannello`, `/api/`, i crawler AI già consentiti (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Bingbot) e il riferimento alla sitemap. `/grazie/` resta `noindex` anche con l'indicizzazione accesa.

## 5. JSON-LD

Tutto nel sorgente HTML, con soli dati verificati. Il build fallisce se trova recensioni, valutazioni o prezzi.
- **Home:** `ProfessionalService` (nome, telefono, email, indirizzo di Civitavecchia con CAP, zona servita, fondatore, Instagram, logo, immagine) e `WebSite`. I dati dell'attività sono quelli che avevi già pubblicato nel JSON-LD del vecchio sito.
- **`/lavori/`:** `CollectionPage` con `ItemList` dei sei lavori e `BreadcrumbList`.
- **Case study:** `CreativeWork` (nome, descrizione, immagine OG, autore) e `BreadcrumbList` Home, Lavori, nome.
- Non ci sono `FAQPage`, `Review`, `AggregateRating`, `Offer` né prezzi. La FAQ è testo normale in pagina: la schema `FAQPage` aspetta che tu confermi le risposte come definitive.
- Validazione: ho controllato che ogni blocco sia JSON valido, abbia `@context` e non contenga campi vietati. **Non ho potuto usare il validatore online di Google/Schema.org** (nessun accesso da qui): da passare a mano prima del lancio.

## 6. `llms.txt`

Ora lo genera il build dai dati del sito (`src/tmpl/llms.mjs`) e sostituisce il file del vecchio sito. Il vecchio file conteneva "A partire da 200 euro" e "risposta entro 24 ore". Il nuovo:
- descrive il posizionamento attuale e la zona servita, i contatti, la risposta personale entro 1 giorno lavorativo;
- sul prezzo dice che non c'è un listino fisso e che la cifra arriva prima di iniziare (stesso testo della FAQ);
- elenca home, `/lavori/`, i sei case study (con la loro description) e le quattro pagine di approfondimento, in modo neutro, senza prezzi né tempi;
- non cita Ordofy né "Developer Apple verificato", perché non fanno parte del posizionamento nuovo e non sono verificabili da qui.
Il build fallisce se `llms.txt` contiene "€", "euro" o "a partire da". Il file originale nella cartella di lavoro non è stato toccato.

## 7. Indirizzi verificati dal vivo (8 ottobre 2026)

| Lavoro | Indirizzo | Risposta | Titolo della pagina |
|---|---|---|---|
| Luca California | lucacalifornia.it | 200 | Luca California, liste e tavoli al ROOM26 di Roma |
| A casa mia | acasamiacivitavecchia.it | 200 | A casa mia · caffè · brunch · aperitivo · Civitavecchia |
| Taiko | taikoclub.satoshiweb.it | 200 | TAIKO · Independent house music |
| Lazzi | **lazzibarbershop.it** | 200 | LAZZI Barbershop Civitavecchia |
| Milano Clubs | **milanoclubsreservation.it** (con la "s") | 200 | Milano Clubs Reservation · Samuele Moon |
| IKTA | **iktaworld.com** | 200 | IKTA Italia, Federazione Kick Boxing, Muay Thai, MMA e Krav Maga |

I tre in grassetto prima non erano linkati: ora lo sono (nei case study e, per Lazzi, anche nella scheda in home). Gli indirizzi li ho ricavati dal portfolio del vecchio sito e verificati con una richiesta reale. La versione di Milano senza "s" non risponde, quindi la "s" è confermata. Il titolo di Lazzi dice anche "Civitavecchia": l'ho usato nel case study e nella description, mentre nella scheda in home resta la label "Shop online". Aggiunto anche il blocco "Oggi" ("Il sito è online. Aprilo dal telefono e giudica tu.") a Lazzi, Milano e IKTA, ora che il fatto è verificato.
**Verifica tecnica, non autorizzazione:** che i siti rispondano non dice che i clienti abbiano dato il permesso di comparire.

## 8. Privacy e Formspree

La pagina `/privacy/` ora la genera il build nel design V3.1 (prima era una pagina a parte nel vecchio stile), a partire dal testo già pubblicato, aggiornato al sito attuale:
- campi del modulo: nome, attività, telefono, e (facoltativi) sito o Instagram e messaggio. Tolti email, "quando vuoi partire" e "tipo di progetto", che il modulo non raccoglie più;
- nuovo paragrafo sui **dati salvati nel browser**: nome e attività restano solo per la durata della visita per la pagina di conferma e vengono cancellati subito dopo; più la scelta sui cookie;
- tabella dei fornitori: **Formspree** (ricezione dei messaggi del modulo, USA), Vercel, Google Analytics 4 (solo con consenso), Victor Analytics, Fontshare (ora solo "in alcune pagine di approfondimento", perché il sito nuovo ospita i font in proprio ma le pagine legacy usano ancora Fontshare) e WhatsApp;
- data di aggiornamento: 8 ottobre 2026.
**Va fatta rivedere da un consulente legale prima del lancio.** Ho adattato il testo senza cambiare le basi giuridiche né inventare pratiche (per esempio non ho scritto per quanto Formspree conservi i dati).

## 9. Satoshi in produzione

Non ho potuto verificarlo in produzione: non c'è un deploy, e non ne ho fatti perché non devono essercene di indicizzabili. Cosa ho fatto invece:
- **Script `scripts/verifica-font.py <url>`**: controlla che ogni file font risponda 200 con `font/woff2`, che le tre famiglie risultino caricate, che il nome del marchio usi Satoshi come prima scelta e che la sua larghezza differisca da quella con Bricolage (se coincidesse, c'è una ricaduta silenziosa). In locale: **tutto ok**, Satoshi in uso (105,5 px contro 111,2 px con Bricolage).
- **Simulazione dell'upload a Vercel** applicando il tuo `.vercelignore`: arrivano 279 file su 334 e il build riesce. `src/font/satoshi-700.woff2` ci arriva (il file non è in git ma non è escluso dall'upload). Avevo un problema: il build copiava `logo/satoshi-mark.png`, che il tuo `.vercelignore` esclude con `satoshi-*.png`, e sarebbe fallito su Vercel. Rimosso (le pagine nuove non lo usano).
- **Da fare prima del lancio:** lanciare lo script sull'URL di un deploy di anteprima. Servono il tuo ok per quel deploy (non indicizzabile, ma pubblico) oppure lo fai tu.

## 10. Rischi emersi sul deploy

- **Il deploy deve partire dalla cartella locale** (`vercel --prod`, come scritto nel `CLAUDE.md`), non da un push su GitHub. Molti file che il sito usa sono **non tracciati in git** (`consent.js`, `widows.js`, favicon, `pannello.html`, le quattro pagine di approfondimento, tutta `api/`): con un deploy da git il build fallirebbe (e `api/` non verrebbe pubblicata). Non li ho committati perché fanno parte delle tue 65 modifiche.
- La configurazione nuova è `vercel.v31.json` (build, `public/`, header di cache). `vercel.json` attuale non è stato toccato: va sostituito o richiamato con `--local-config` al lancio.
- Vercel riceve anche `_archivio/` e `_lavorazione/` (script e vecchia home): non vengono serviti, perché pubblica solo `public/`.

## 11. Contenuti ancora da confermare, pre-lancio

1. **Privacy:** revisione legale (sezione 8).
2. **Autorizzazione di tutti i clienti** a comparire con nome, schermate e link.
3. **Foto reale di A casa mia:** autore e cliente.
4. **"Prima: richieste gestite a mano su WhatsApp" (Luca):** conferma di Luca.
5. **"Samuele":** per Milano il nome è pubblico sul sito del cliente; per Luca resta da chiarire. Nei testi vale ancora "il titolare".
6. **IKTA:** liberatorie per usare gli hero con i volti (ora esclusi).
7. **Dati di Milano:** nomi e numeri anonimizzati; confermare se erano dati di esempio.
8. **Formspree:** controllo dal tuo pannello (richieste JSON accettate, reCAPTCHA spento, email in arrivo, limiti del piano) e un invio di prova reale fatto da te.
9. **Tastiera mobile** su iPhone e Android reali.
10. **Validatore JSON-LD** di Google su home, lavori e un case study.
11. **Pagine legacy** (non toccate, restano online): la pagina "Realizzazione siti web a Civitavecchia" dichiara "poche centinaia di euro" e "online in 1-2 settimane", cioè prezzi e tempi che il Brief non approva; il title della pagina Chatbot WhatsApp (75 caratteri) e le description di tre pagine (189, 175 e 170 caratteri) superano i limiti che abbiamo fissato; `consent.js` manda a capo male il suo testo. Tutte usano ancora Fontshare. Decidere se sistemarle prima del lancio.
12. **Testo delle pagine dei case study:** da 1.136 a 1.979 caratteri, sopra la soglia di 900 per una pagina normale e sotto i 2.500 che avevamo indicato per una scheda che deve farsi trovare. Non ho aggiunto testo per arrivarci (sarebbe inventare): se serve più contenuto, va scritto con te.
13. **Satoshi servito in produzione:** verifica con `verifica-font.py` su un'anteprima.

## 12. Controlli finali

- Build senza errori con le nuove regole SEO.
- `controlla-testi.py` su home, privacy, lavori, Lazzi, Milano e IKTA alle cinque larghezze: zero problemi nel contenuto. I rilievi rimasti sono il banner cookie di `consent.js`.
- `audit-design.py` su home, privacy, lavori e Lazzi: **0 errori**; l'avviso `apple-touch-icon` è sparito.
- Test del form 40 su 40, layout dei case study senza problemi, nessun overflow.
- Stato del repo: branch `v3.1-foundation`, commit di lavoro `c99867e`, `4d28705`, `5a70954`, `cfac589`, `2c01341`, `7cbed98`. In attesa di approvazione: non inizio la Fase 6.
