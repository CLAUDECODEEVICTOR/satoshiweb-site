# Satoshi Web V3.1: report Fase 3, case study

Data: 8 ottobre 2026. Branch: `v3.1-foundation` (commit `5a70954`). `main`, `vercel.json` e il sito live intatti. Le 65 modifiche preesistenti non sono state committate. `SW_INDICIZZA` spento, form non inviato, `llms.txt`, privacy e `consent.js` non toccati.

## 1. Cosa è stato implementato

**Decisioni della revisione, applicate alla home**
- Processo con i numeri: 01 Guardo, 02 Ti dico cosa serve, 03 Lo costruiamo, 04 Lo mettiamo online. Numero in piccolo davanti al titolo (mobile) o sopra (tablet e desktop), nient'altro cambiato.
- Lazzi: label destra "Shop online" (nessuna località inventata).
- Copy delle schede V3.1, pannello di Luca con didascalia, link sottili sui nomi: invariati.

**Sei case study** in `/lavori/<slug>/`, nell'ordine richiesto: `luca-california`, `a-casa-mia`, `taiko`, `lazzi`, `milano-clubs`, `ikta`.
- Un solo template (`src/tmpl/caso.mjs`), sei record di contenuto (`src/dati/casi.mjs`), CSS in `src/css/caso.css`.
- Struttura dalla tavola V3.1 n.10 e dal Brief §9: header con marchio e "← Tutti i lavori", testata (settore e luogo, nome, frase, link), fascia ambra con il lavoro, blocchi numerati, chiusura scura con "Parliamo del tuo progetto →", WhatsApp e "Prossimo lavoro". L'ultimo (IKTA) rimanda a "Tutti i lavori".
- I blocchi senza contenuto verificato non esistono. Per questo A casa mia non ha "Il punto di partenza" (nella V3.1 era un segnaposto) e Lazzi, Milano e IKTA non hanno "Oggi": mancano indirizzo o fatti verificati.
- Taiko ha l'etichetta "In anteprima" in testata e un blocco finale "Lo stato" che lo dichiara non produzione.
- Nei testi di Luca e Milano il referente è "il titolare". Nessun "Samuele" in nessuna pagina pubblicata.
- Nessuna barra fissa nei case study né in `/lavori/`.
- Pannelli dichiarati: "Schermata con dati di esempio." (Luca, Taiko, Lazzi) e "Schermata con nomi e numeri anonimizzati." (Milano).

**Contenuto per caso** (solo fatti dal Brief, dalla V3.1 o visibili negli screenshot usati)

| Caso | Blocchi |
|---|---|
| Luca California | punto di partenza, cosa serviva (con la spiegazione di webapp del Brief), il sito, richieste nel pannello, dettaglio richiesta, conferma e comunicazione al cliente, ingresso, oggi |
| A casa mia | l'idea (foto reale), la decisione, design dal telefono, dal computer, cosa c'è dentro, oggi |
| Taiko | il sito, la richiesta, pannello richieste, pannello eventi, lo stato |
| Lazzi | lo shop, il pannello, cosa c'è dentro |
| Milano Clubs | punto di partenza (centinaia di messaggi al giorno, dato stimato), il sito, il pannello, la serata |
| IKTA | organizzare la complessità, le discipline, gare ed eventi |

Nessuna metrica, testimonianza o risultato inventato.

## 2. Asset utilizzati

| Caso | Asset | Lavorazione |
|---|---|---|
| Luca | `luca-d-serate`, `luca-m-hero`, `luca-m-serate` (siti pubblici) | nessuna |
| Luca | `05-richieste-nuove`, `07-richiesta-nuova-prima-di-confermare`, `08-richiesta-dopo-conferma-e-scrivi`, `19-lettore-esito-valido` | dati già di esempio (telefono `340 000 0000`, banner "richieste di esempio"). 07 e 08 ritagliati sopra la barra di navigazione che i fullpage catturano a metà immagine |
| A casa mia | `acm-desktop`, `acm-mobile`, `acm-m-bar`, `acm-m-giornata`, `acm-m-orari-crop`, `acm-d-giornata`, `acm-d-orari`, `acm-real-hero.jpg` | nessuna. La foto reale mostra mano e busto di una persona non riconoscibile |
| Taiko | `taiko-public-desktop-hero`, `taiko-event-request-desktop`, `taiko-admin-requests-desktop`, `taiko-admin-events-desktop` | nessuna: "Giulia M.", `+39 300 000 0001` sono dati di esempio |
| Lazzi | `lazzi-desktop-1-vetrina`, `lazzi-desktop-2-catalogo`, `lazzi-mobile-3-scheda-prodotto`, `lazzi-admin-secondary-desktop` | nessuna (nessun dato personale) |
| Lazzi | `lazzi-admin-dashboard-desktop` | **ritagliato** ai primi 400 px (statistiche, schede, filtri): le righe con nome, email e telefono dei clienti non compaiono |
| Milano | `web-richieste.jpg`, `richieste.jpg`, `stasera.jpg` | **mascherati**: quattro telefoni per immagine sostituiti con `+39 300 000 000N`, cognomi ridotti a iniziale (Giulia F., Marco D., ...). Nella versione web ritagliata la barra del browser, che mostrava il percorso `/pannello` |
| Milano | `mcr-d-calendario`, `mcr-m-form` | nessuna (siti pubblici) |
| IKTA | `ikta-home-desktop` | **ritagliato** alla sola barra di navigazione (primi 122 px) |
| IKTA | `ikta-discipline-desktop` | nessuna (nessuna foto né dato) |
| IKTA | `ikta-gare-desktop` | **locandine sfocate** (raggio 9): volti e numero degli organizzatori non leggibili; titoli e struttura della pagina restano leggibili |

I file originali non sono nel repo. Gli script di lavorazione (`_lavorazione/`) sono locali e non committati, perché contengono il percorso degli originali.

## 3. Asset esclusi e perché

| Asset | Motivo |
|---|---|
| `clienti.jpg` (Milano) | rubrica con 7 nomi e importi spesi per persona. Anche se i nomi fossero di esempio, mostra dati finanziari per cliente |
| `mcr-m-hero`, `mcr-d-hero` (Milano) | il sito pubblico mostra in grande "Samuele Moon". Hai chiesto di non pubblicare "Samuele" nei case study finché non è verificato: li ho esclusi (e rimossi dal repo) e ho usato calendario e modulo, che non mostrano il nome |
| `ikta-home-desktop` (hero), `ikta-home-mobile` | volti di arbitro e atleta in primo piano: non verificabile che ci siano liberatorie. Ho provato a sfocarli, ma i rettangoli di sfocatura rovinavano i titoli e si notavano troppo: preferito non usarli |
| `taiko-admin` mobile ("secondario" nel Brief) | non presente tra gli asset consegnati |

## 4. Misure rispetto alla V3.1

La V3.1 ha una sola tavola del case study (struttura con A casa mia, mobile 390). Tablet e desktop non sono disegnati.

| Pagina | 390 V3.1 | 390 nostra |
|---|---|---|
| A casa mia | 2.901 | 3.378 (+16%) |

Lo scarto viene dal blocco "L'idea" con la foto reale (circa 380 px) che nella V3.1 non c'era, compensato in parte dall'assenza del segnaposto "Il punto di partenza". La fascia ambra è 340 px come nella tavola (40% di uno schermo da 844); i telefoni nei blocchi sono 300 px come i tile V3.1.

Altezze pagina (px):

| Caso | 360 | 390 | 430 | 834 | 1440 |
|---|---|---|---|---|---|
| Luca California | 4.382 | 4.409 | 4.496 | 3.991 | 4.218 |
| A casa mia | 3.347 | 3.378 | 3.453 | 3.329 | 3.829 |
| Taiko | 2.813 | 2.834 | 2.872 | 2.669 | 3.348 |
| Lazzi | 2.544 | 2.521 | 2.499 | 2.213 | 2.741 |
| Milano Clubs | 2.677 | 2.672 | 2.700 | 2.287 | 2.632 |
| IKTA | 2.008 | 2.018 | 2.033 | 1.936 | 2.251 |

Nessuno scroll orizzontale, nessuna immagine rotta e nessun elemento fuori bordo in nessuna delle 30 combinazioni pagina per larghezza.

## 5. Audit

- **`controlla-testi.py`** su `/lavori/` e sui sei case study a 360/390/430/834/1440: zero problemi nel contenuto nuovo. I 28 rilievi rimasti sono tutti il testo del banner cookie di `consent.js` (legacy, non toccato).
- **`audit-design.py`** sui sei case study alle cinque larghezze: **0 errori**, 96 avvisi. Sono: etichette da 11 px e spaziature fuori scala che vengono dalle tavole V3.1, `apple-touch-icon` (Fase 5), e una richiesta con esito 403 che il browser di prova non riproduce: ho verificato che nessuna risorsa del sito risponde con errore.
- **Build:** nessun errore (alt, dimensioni, `h1`, trattini, segnaposto, link interni). Nessuna occorrenza di "Samuele" nelle pagine pubblicate.
- **Testo nel sorgente:** da 1.032 (IKTA) a 1.964 (Luca) caratteri per pagina. Sopra la soglia di 900 per una pagina normale, sotto la soglia di 2.500 per una scheda che deve farsi trovare: non ho aggiunto testo per raggiungerla (sarebbe inventare). È una decisione di Fase 5.

## 6. Difetti trovati e corretti

- Tile dei telefoni a 240 px lasciavano un vuoto a destra: ora a larghezza piena su mobile, stretti su tablet e desktop.
- Ritaglio sbagliato del secondo telefono di A casa mia (mostrava un frammento di testo): proporzioni corrette.
- Mascheramento di Milano: il primo passaggio lasciava "Laur" di "Laurea" e mangiava il separatore prima del numero. Ho misurato i confini colonna per colonna e rifatto.
- Sfocatura dei volti IKTA: i rettangoli coprivano parte dei titoli. Strategia cambiata (esclusione degli hero).
- Linea sopra i blocchi che copriva solo la colonna del testo: ora a tutta larghezza.
- Immagini Milano con il nome del referente rimosse dal repo.
- Screenshot di Luca 07 e 08 con la barra di navigazione finita a metà immagine: ritagliati.

## 7. Decisioni ancora aperte

1. **Layout tablet e desktop dei case study.** Non è disegnato nella V3.1. Ho scalato la tavola mobile: testo a sinistra e visual a destra (5fr/7fr), fascia ambra come nella home, titolo più grande. Va approvato o corretto.
2. **Fascia da 340 px su mobile.** È la misura della tavola V3.1 n.10, ma è il 40% di uno schermo da 844 px, sopra il 31% che avevamo fissato per la home. Se vuoi tenerla al 31% la riduco a circa 262 px.
3. **"Samuele".** Il sito di Milano mostra "Samuele Moon" in grande: per Milano il nome è quindi quasi certamente corretto. Il Brief lo usa anche per Luca, dove è probabilmente un errore. Resta "il titolare" nei testi; dimmi quando posso sostituirlo e per quale dei due.
4. **Foto reale di A casa mia.** Usata come da Brief. Servono conferma su autore e cliente.
5. **IKTA.** Per ora niente hero con volti e locandine sfocate. Se ci sono le liberatorie posso usare gli screenshot originali; senza, la proposta resta questa. Non ho usato `ikta-home-mobile`.
6. **Dati di Milano.** Ho anonimizzato nomi e numeri perché non sono dichiarati di esempio. Se invece sono dati inventati dal pannello demo, la didascalia può dirlo.
7. **"Prima: richieste gestite a mano su WhatsApp" (Luca).** Resta da confermare con Luca (punto 8.1 della V3.1). È nel blocco "Il punto di partenza".
8. **Indirizzi.** Nessun link a Lazzi, Milano e IKTA finché non si verificano (Milano: con o senza "s" in "clubs").
9. **Chiusura scura.** Il prototipo n.10 aveva un pulsante ambra su fondo nero con il vecchio copy "Fai analizzare il mio sito". Ho usato il pulsante carta su fondo nero (regola ambra-solo-come-fondo di `design.md`) e il copy approvato "Parliamo del tuo progetto →".
10. **Titoli e descrizioni** delle pagine dei casi: proposte mie, da rivedere in Fase 5.

## 8. Stato del repo

Branch `v3.1-foundation`, tre commit di lavoro più questo (`c99867e`, `4d28705`, `4f7e449`, `5a70954`). Il file Satoshi resta fuori da git. In attesa di approvazione prima della Fase 4.
