# Satoshi Web V3.1: report Fase 1 e Fase 2

Data: 8 ottobre 2026. Branch: `v3.1-foundation` (commit `c99867e` foundation, `4d28705` homepage).
`main`, `vercel.json` e il sito live non sono stati toccati. Le 65 modifiche preesistenti non sono state committate.

## 1. Cosa è stato fatto

**Fase 1, analisi e piano.** Letti Master Build Brief, Claude Code System, REPORT-V3 e V3.1, i prototipi e tutti i 27 asset. Prodotto `IMPLEMENTATION-PLAN.md` (sezioni A-N, decisioni rispettate, decisioni tecniche, bloccanti). Approvate poi Q1-Q7.

**Foundation.**
- Script `build.mjs` (Node puro, nessuna dipendenza) che compone le pagine in `public/` da `src/`.
- Pipeline immagini locale `scripts/immagini.mjs` (WebP a 390/780/1440 con hash, manifest committato).
- Dati in `src/dati/`, template in `src/tmpl/`, CSS mobile-first, un solo JavaScript da circa 3 KB.
- Pagine legacy copiate tali e quali, con controllo che trovino ancora le loro risorse.
- Vecchia home archiviata in `_archivio/index-app-sistemi-2026-09-28.html`.
- Tutto `noindex`, `robots.txt` chiuso, `SW_INDICIZZA` spento.

**Font.** Bricolage Grotesque (variabile `wght 200-800` con `opsz`) e Geist 400/500/600, latin, self-hosted, da Fontsource (OFL). Satoshi 700 dal pacchetto ufficiale Fontshare, non modificato.

**`.claude/design.md`.** Fonte tecnica operativa: palette, tipografia, spacing, breakpoint, griglie, visual sizing, bottoni, bordi, motion, accessibilità, mobile-first, vincoli, deroghe al master. Nessuna nuova decisione di design. Resta locale perché `.claude/` è ignorato da git.

**Homepage, nell'ordine approvato.** Header, hero, Da dove parti, Lavori (Luca, A casa mia, Taiko, Lazzi), Cosa può fare un sito, Processo, Fondatore, FAQ, CTA con form, Footer, barra fissa solo in homepage. Costruita dalle tre tavole V3.1 (mobile 390, tablet 834, desktop 1440).

## 2. Licenza Satoshi

La licenza ITF FFL 2.0 permette il self-hosting con `@font-face` e l'uso commerciale. Vieta subsetting, conversione e ridistribuzione. Il repo GitHub è pubblico, quindi il file Satoshi non è committato: sta in `src/font/` ma è escluso da git (`.git/info/exclude`) e arriva a Vercel col deploy da cartella. Se manca, il nome ricade su Bricolage e il build lo segnala. Il logo ufficiale (marchio a S in SVG) non è stato modificato.

## 3. Misure contro la V3.1

Stesso browser, stesse larghezze, font veri.

| Larghezza | Altezza V3.1 | Nostra | CTA hero (V3.1 / nostra) |
|---|---|---|---|
| 360 | 7.120 | 7.446 | 394 / 396 |
| 390 | 7.136 | 7.515 (7.456 senza il margine della barra fissa) | 405 / 407 |
| 430 | 7.087 | 7.536 | 394 / 396 |
| 834 | 5.277 | 5.526 | |
| 1440 | 5.263 | 5.577 | |

Lo scarto del 5-6% viene da tre cose: lo screenshot del pannello di Luca al posto del segnaposto, lo schema di Lazzi al posto di Milano, le aree di tocco a 44 px sui link. Nessuno scroll orizzontale a nessuna larghezza. Il visual più alto è identico alla V3.1: la scheda A casa mia è 298 px a 430.

## 4. Audit

- **`controlla-testi.py`** sulla home a 360, 390, 430, 834 e 1440: zero problemi nel contenuto nuovo. I 16 rilievi rimasti sono tutti il testo del banner cookie di `consent.js`, che non è stato toccato su tua richiesta.
- **`audit-design.py`:** zero errori. Restano avvisi voluti dalla V3.1 (etichette da 11 px, spaziature fuori scala delle tavole) e da Fase 5 (titolo home di 66 caratteri, `apple-touch-icon`).
- **Build:** fallisce su immagini senza `alt`/dimensioni, `h1` mancante o doppio, trattino lungo, segnaposto, link interni rotti. Verificato che fallisce davvero.
- **Testo nel sorgente:** home 5.205 caratteri (soglia 2.500).
- **Barra fissa:** vista comparire a pane visibile; la logica è verificata anche con un osservatore simulato. Non testata in modo sistematico con il vero `IntersectionObserver`.

## 5. Difetti trovati e corretti durante la costruzione

- Blocchi desktop visibili su mobile (conflitto di specificità CSS).
- Gutter raddoppiato nella fascia ambra, visual alto 190 px invece di 215.
- Asterisco dei campi su una riga a sé (+27 px per campo).
- Titolo "Prima di scrivermi" legato in un blocco da 384 px che sforava la colonna da 300 px.
- "negli / orari" a fine riga (testo scritto a mano senza `legaParole`).
- Colonna di "Da dove parti?" troppo stretta a 1440.
- Elenco "Cosa può fare" riscritto come lista di definizioni (stesso aspetto, semantica corretta).
- Margini negativi sul FAQ che accorciavano le domande a due righe: sostituiti con un'area di tocco invisibile.

## 6. Decisioni che servono a te

1. **Copy delle schede.** Per Luca, A casa mia e Taiko ho usato i testi dei prototipi V3.1, diversi da quelli del Brief §7. Le frasi del Brief sono già nei dati (`brief` in `src/dati/lavori.mjs`). Per Lazzi, non disegnato dalla V3.1, ho usato il testo del Brief.
2. **Pannello di Luca.** `05-richieste-nuove.png` (dati di esempio) al posto del segnaposto, con didascalia "Schermata con dati di esempio." Ritaglio mio; su mobile aggiunge circa 215 px.
3. **Lazzi.** Etichetta a destra vuota (luogo non nei materiali). Secondo visual: ritaglio del pannello ordini, solo statistiche e filtri, senza righe con clienti. Nessun link al sito finché non verifico l'indirizzo.
4. **Link ai case study.** Nome del progetto e voci di "Cosa può fare" resi link, con sottolineatura sottile. Nella V3.1 non lo erano.
5. **Processo.** Il Brief scrive "01 Guardo…", il prototipo non mostra i numeri. Ho seguito il prototipo.

## 7. Da fare prima del lancio (obbligatorio)

- **`llms.txt`:** contiene ancora "A partire da 200 euro" per i siti. Il Brief vieta prezzi non approvati.
- Informativa privacy e testo di consenso del form da rivedere; verificare che `/privacy/` descriva Formspree.
- Impostare `SW_INDICIZZA=1` solo dopo l'approvazione del lancio e passare a `vercel.v31.json`.
- Deploy da cartella locale (il file Satoshi non è in git).
- Sostituire la foto temporanea del fondatore.
- Immagini OG per home e case study, `apple-touch-icon`, titolo home sotto i 60 caratteri (Fase 5).
- Verificare gli indirizzi di Lazzi, Milano (con o senza "s") e IKTA.
- Conferme dei clienti (M8 del piano).
- Rivedere il banner cookie di `consent.js` quando si potrà toccare.

## 8. Avvertenze

- **Non provare l'invio del form:** punta al Formspree reale e la logica di invio è Fase 4.
- **Asset a rischio privacy** (Milano: numeri di telefono dal formato reale; IKTA: volti di atleti) non sono nel repo e vanno mascherati prima della Fase 3.

## 9. Prossimi passi

Fase 3 case study (Luca, A casa mia, Taiko, Lazzi, Milano, IKTA), poi Fase 4 form, Fase 5 SEO, Fase 6 motion, Fase 7 QA. In attesa delle tue decisioni sui cinque punti della sezione 6.
