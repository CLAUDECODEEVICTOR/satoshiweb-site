# Satoshi Web V3.1: report Fase 6, motion e QA finale

Data: 8 ottobre 2026. Branch: `v3.1-foundation`.

## 1. Stato della fase

**Chiusa tecnicamente, in attesa della tua approvazione.** Nessun redesign: layout, copy, palette, font, gerarchia e sezioni sono invariati. `SW_INDICIZZA=0` (robots `Disallow: /`, `noindex, nofollow` ovunque). Nessun deploy. `main`, `vercel.json` e le 65 modifiche preesistenti non sono stati toccati.

Criteri di chiusura: motion approvato implementato, movimento ridotto funzionante, zero overflow, test esistenti superati, audit senza errori, nessuna regressione SEO, form funzionante, mobile e desktop verificati.

## 2. Commit

| Commit | Contenuto |
|---|---|
| `ca8cf7d` | Fase 6: motion, QA, test automatici |
| `ce68186` | Report Fase 5 (punto di partenza di questa fase) |

## 3. File modificati

14 file, 620 righe aggiunte e 13 tolte:
- **Nuovi:** `src/css/motion.css`; `scripts/test/form.py`, `motion.py`, `qa.py`, `perf.py`, `casi.py`, `screenshot.py` (i test del form e dei case study, prima solo locali, ora sono nel repo).
- **Modificati:** `build.mjs` (carica il CSS del motion, trasforma la freccia dei link in elemento animabile), `src/css/base.css` (grassetto del testo a 600), `componenti.css` (barra fissa), `home.css` (campi facoltativi, larghezza del link "Lavori"), `src/js/sito.js`, `src/tmpl/layout.mjs`, `src/tmpl/sezioni.mjs`.

## 4. Motion implementato

Solo i cinque momenti approvati. Curva unica `cubic-bezier(0.2, 0.7, 0.2, 1)`. Niente parallax, cursore custom, loader, 3D, WebGL, `will-change`.

| # | Momento | Come | Mobile | Desktop |
|---|---|---|---|---|
| 1 | Il lavoro nell'hero (home e testata dei case study) | sale e passa da opacità 0 a 1, dopo il testo (ritardo 150 ms); la seconda schermata 80 ms dopo la prima | 8 px, 400 ms | 16 px, 500 ms |
| 2 | Blocchi numerati dei case study | entrano uno alla volta quando arrivano nella schermata (testo, poi visual dopo 80 ms) | 8 px, 260 ms | 12 px, 260 ms |
| 3 | Barra fissa | scorre dal basso in 200 ms e rientra quando la CTA hero torna visibile; nascosta con `visibility`, quindi non raggiungibile da tastiera | sì | assente |
| 4 | Pulsanti e link con freccia | pressione `scale(0.98)` in 120 ms; la freccia avanza di 4 px con il cursore e con il focus da tastiera | solo pressione | pressione e freccia |
| 5 | FAQ e campi facoltativi | si aprono in altezza in 200 ms | sì | FAQ sì (i campi sono sempre aperti) |

Dettagli tecnici da sapere:
- **Movimento ridotto.** Un solo blocco globale azzera animazioni e transizioni; con la preferenza attiva lo script non attiva nemmeno la classe `.anim`, quindi tutto è visibile subito e nulla dipende da un'animazione. Verificato con test.
- **Rete di sicurezza:** se lo script non parte, i blocchi dei case study restano visibili (la classe `.anim` viene tolta dopo 3 secondi se `sito.js` non ha dato segno di vita; senza JavaScript non viene nemmeno messa).
- **Barra fissa:** prima non si animava davvero, perché passava da `display: none` a `flex` (le transizioni non partono). Ora resta nel layout e si muove con `transform`.
- **Campi facoltativi:** prima si aprivano di scatto (`hidden`). Ora si espandono con una transizione, sono `inert` da chiusi e il contorno del focus resta visibile.
- **Frecce:** ogni link che finisce con "→" ora ha la freccia in un elemento a parte nascosto ai lettori di schermo (il nome accessibile non include più il simbolo).
- Le transizioni del CSS usano solo `opacity`, `transform`, `height`, `grid-template-rows`, `visibility`: lo verifica un test.

## 5. Test eseguiti (tutti superati)

| Test | Esito |
|---|---|
| `scripts/test/form.py`: validazione, aria, focus sul primo errore, telefono, doppio invio, loading, errore Formspree, offline, honeypot, invio sotto 3 secondi, redirect `/grazie/`, `sessionStorage` e cancellazione, tastiera, barra fissa con tastiera aperta, layout con errori a 5 larghezze | **40 su 40**, nessuna richiesta reale (tutte intercettate) |
| `scripts/test/motion.py`: tempi reali, movimento ridotto, senza JavaScript, barra fissa, pulsanti e frecce (cursore, pressione, focus, touch), FAQ e campi facoltativi, CLS, regole CSS ammesse | **39 su 39** |
| `scripts/test/qa.py`: 11 pagine nuove e 4 legacy a 360, 390, 430, 834, 1024, 1440 (90 combinazioni): overflow, immagini, titoli, landmark, alt, nomi accessibili, bersagli di tocco, CTA nel primo schermo; 86 link interni; link WhatsApp; etichette del form; tastiera su 4 pagine; menu mobile | **0 errori** |
| `scripts/test/casi.py`: 6 case study a 5 larghezze, overflow, immagini rotte | 0 problemi |
| `scripts/test/perf.py`: peso, LCP, CLS, immagini, lazy, asset inutilizzati | nessun problema |
| `audit-design.py` su 10 pagine a 6 larghezze | **0 errori**, 155 avvisi (vedi sotto) |
| `controlla-testi.py` su 10 pagine a 6 larghezze | zero problemi nel contenuto; restano solo i rilievi del banner cookie di `consent.js` |
| `verifica-font.py` in locale | OK: file serviti 200, Satoshi in uso (105,5 px contro 111,2 con Bricolage) |
| Build con i controlli SEO di Fase 5 | senza errori |

## 6. Risultati responsive

- **Overflow:** nessuno scroll orizzontale e nessun elemento fuori dal bordo, a nessuna larghezza, su nessuna pagina.
- **Immagini:** nessuna rotta, tutte con `alt` (o vuoto se decorative), larghezza e altezza dichiarate.
- **CTA hero** dentro il primo schermo a 360, 390 e 430.
- **Link interni:** 86 controllati, 86 rispondono 200; tutte le ancore esistono. Tutti i link WhatsApp sono `https://wa.me/393341989193`.
- **Menu mobile:** il focus resta dentro il pannello, Esc lo chiude e riporta il focus sul pulsante, lo scroll del body si sblocca.
- **Barra fissa con tastiera aperta** (simulata riducendo il viewport): si nasconde e ritorna. Il campo in focus resta sopra la barra.
- **Visivo:** controllato su home (390 e 430), lavori, Luca, Milano, Taiko (834), privacy e grazie, dopo aver scorso la pagina: nessun contenuto invisibile, nessun salto.
- **Pagina intera di prova a 1024:** nessun overflow (non ha una tavola dedicata).

## 7. Accessibilità

- Un solo `h1` per pagina nuova e nessun salto nella gerarchia dei titoli; `header`, `main` e `footer` ovunque; `lang="it"`.
- Nessun link o pulsante senza nome accessibile; nessuna immagine senza `alt`.
- Tastiera: ogni elemento raggiunto con il Tab ha un contorno visibile (3 px) ed è in schermo; home 40 elementi, case study 14, privacy 10, grazie 10. Nessuna trappola.
- Form: etichette su tutti i campi, errori collegati con `aria-describedby`, `aria-invalid`, `role="alert"`, focus sul primo errore.
- **Corretto in questa fase:** il link "Lavori" dell'header (tablet) era largo 42 px: ora 44. Le domande della FAQ hanno un'area di tocco allargata di 8 px sopra e sotto senza cambiare l'aspetto.
- Contrasto: l'audit non segnala errori su nessuna pagina e larghezza.

## 8. Performance

Rete simulata a 1,6 Mbps con 150 ms di latenza e CPU 4 volte più lenta (peso proprio, escluse le terze parti):

| Pagina | FCP | LCP | CLS | Peso | Richieste |
|---|---|---|---|---|---|
| Home 390 | 804 ms | 1.776 ms (immagine hero) | 0,007 | 324 KB | 14 |
| Home 1440 | 644 ms | 644 ms (titolo) | 0,011 | 296 KB | 14 |
| Luca 390 | 624 ms | 1.268 ms | 0 | 324 KB | 14 |
| Taiko 390 | 624 ms | 1.296 ms | 0 | 216 KB | 13 |
| Privacy 390 | 592 ms | 592 ms | 0 | 147 KB | 9 |

- **Il motion non costa nulla in LCP:** home 390 misurata con e senza movimento: 1.804 contro 1.836 ms. Il tempo dipende dalla rete simulata, non dall'animazione.
- **CLS** tra 0 e 0,011, sotto il nostro limite di 0,02. Il residuo (0,007-0,011) viene dalla sostituzione dei font quando arrivano; le animazioni non producono spostamenti.
- **JS e CSS:** 5 KB di JavaScript e 9 KB di CSS sulla rete (compressi). Font 128-141 KB. Immagini 71-178 KB per pagina; la più pesante del sito è 119 KB.
- Nessuna immagine ha l'attributo `lazy` sopra la piega tranne il piccolo marchio SVG nel footer (innocuo). Nessuna immagine è più grande del necessario, eccetto lo stesso SVG (vettoriale). **Nessun asset inutilizzato** nel build.
- Pesi dei font: **corretto** un caso reale. Quindici testi chiedevano Geist 700, che non è caricato (400, 500, 600): Chrome usa il 600, ma altri browser potrebbero sintetizzare il grassetto. Ora `strong` è 600 (nessun cambiamento visibile in Chrome). Verificato: tutte le combinazioni usate sono caricate.

## 9. Regressione SEO

Il build ricontrolla a ogni esecuzione: title (max 60) e description (70-160) unici, canonical, immagine OG presente, `twitter:image`, `apple-touch-icon`, JSON-LD valido e senza recensioni o prezzi, sitemap (13 URL, senza `/grazie/` né `/demo/`), `llms.txt` senza prezzi, link interni, nessun segnaposto, nessun trattino lungo. Tutto superato. Nelle pagine nuove non compaiono prezzi né "Samuele"; l'unica occorrenza di "recensioni" è la voce "Recensioni Google e ordini via Glovo" del sito di A casa mia (testo V3.1, funzionalità del cliente). Robots verificato: spento (`Disallow: /`).

## 10. Problemi trovati e corretti in questa fase

1. **Movimento ridotto non rispettato dalla FAQ.** La regola globale non raggiunge lo pseudo-elemento `::details-content`: la FAQ si animava anche con la preferenza attiva. Corretto e coperto da test.
2. **Regressione dei campi facoltativi** (mia): il contenitore con margini negativi sforava di 6 px a 1440. Riscritto con `clip-path`, il contorno del focus resta intero.
3. **Barra fissa senza animazione** (era `display: none`): ora scorre davvero.
4. **Campi facoltativi senza animazione** (era `hidden`): ora si aprono in altezza.
5. **Geist 700 non caricato**: ora 600.
6. **Link "Lavori" a 42 px**: ora 44.
7. Falsi allarmi del test della tastiera (scorrimento morbido non finito, link con lo stesso testo): corretto il test, non il sito.

## 11. Problemi rimasti e decisioni per Edoardo

1. **Slug di Lazzi.** Nell'elenco dei controlli c'era `/lavori/lazzi-barbershop/`. Lo slug reale (da Brief e piano) è `/lavori/lazzi/`: ho controllato quello. Se vuoi lo slug lungo basta una riga nei dati; dimmelo (cambia anche sitemap, llms.txt e link).
2. **Pagine legacy** (non modificate): mancano il landmark `main`, alcuni link e pulsanti sotto i 44 px di altezza (anche il logo, 30-34 px; "Preventivo gratuito" 41 px), nessun errore bloccante tecnico (nessun overflow, immagini ok, link ok). Come deciso, non le tocco.
3. **CLS residuo da sostituzione dei font** (0,007-0,011). Si potrebbe azzerare con font di riserva dalle metriche corrette (`size-adjust`), ma significa aggiungere regole al sistema font: non l'ho fatto. Il valore è già nel "buono" di Web Vitals.
4. **FAQ e campi facoltativi** si animano solo dove il browser supporta `::details-content` (Chrome e derivati): altrove si aprono subito, senza errori. Non provato su Safari e Firefox reali.
5. **Blocchi dei case study con ingresso graduale:** il testo è comunque nel sorgente HTML e visibile senza JavaScript e con movimento ridotto. Chi stampa la pagina senza scorrerla può vedere i blocchi più bassi nascosti fino a che non entrano (limite noto di questo tipo di effetto). Se preferisci togliere il momento 2 dalla stampa, è una regola CSS.
6. **Avvisi dell'audit (155):** etichette da 11 px e spaziature fuori scala che vengono dalle tavole V3.1; richieste di analytics bloccate dal CORS solo perché la prova gira su `localhost`.
7. **Ancora aperti dalla Fase 5** (nessun cambiamento): revisione legale della privacy, autorizzazione dei clienti, foto di A casa mia, "Prima" di Luca, "Samuele", liberatorie IKTA, dati di Milano, Formspree, validatore JSON-LD, pagine legacy con prezzi e tempi non approvati.

## 12. Checklist pre-preview

- [x] `SW_INDICIZZA=0`, robots chiuso, `noindex` ovunque.
- [x] Build e test automatici senza errori.
- [x] Il pacchetto che arriverebbe a Vercel (con il tuo `.vercelignore`) costruisce correttamente (verificato in Fase 5).
- [ ] **Deploy dalla cartella locale** (`vercel`/`vercel --prod`), non da git: `consent.js`, `widows.js`, favicon, `pannello.html`, le quattro pagine legacy e `api/` non sono tracciati.
- [ ] Configurazione: usare `vercel.v31.json` (`--local-config`) per l'anteprima; `vercel.json` attuale resta com'è.
- [ ] Il file Satoshi (`src/font/satoshi-700.woff2`) deve essere nella cartella al momento del deploy (non è in git).
- [ ] Dopo il deploy di anteprima: `python3 scripts/verifica-font.py <url-anteprima>` per verificare che Satoshi sia servito e non ci sia ricaduta su Bricolage.
- [ ] Sull'anteprima: provare i form con una richiesta reale (tua), controllare Formspree (JSON, reCAPTCHA spento, email).
- [ ] Sull'anteprima: provare su iPhone e Android reali (tastiera, barra fissa, menu, FAQ).
- [ ] Sull'anteprima: validatore JSON-LD di Google su home, lavori e un case study; controllare le anteprime social.
- [ ] Verificare che l'anteprima non sia indicizzabile (noindex) e che la protezione dell'anteprima di Vercel sia attiva.
- [ ] Confermare le autorizzazioni e i contenuti elencati al punto 11.7.
- [ ] Solo dopo la tua approvazione del lancio: `SW_INDICIZZA=1`, sostituire `vercel.json`, deploy in produzione.

Non ho fatto deploy, non ho impostato `SW_INDICIZZA=1` e non inizio nessuna Fase 7. In attesa della tua approvazione.
