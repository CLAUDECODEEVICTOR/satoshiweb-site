# Satoshi Web V3.1: report Fase 4, form e contatti

Data: 8 ottobre 2026. Branch: `v3.1-foundation` (commit `cfac589`). `main`, `vercel.json` e il sito live intatti. Le 65 modifiche preesistenti non sono state committate. `SW_INDICIZZA` spento. `llms.txt`, privacy e `consent.js` non toccati.

**Nessuna richiesta reale è stata inviata.** Tutti i test girano con Formspree, Victor Analytics e Google intercettati da un proxy di prova: la verifica finale dice "richieste esterne non intercettate: nessuna".

## 1. Chiusura della Fase 3 (decisioni applicate)

- Layout tablet e desktop dei case study 5fr/7fr: confermato così com'è.
- **Fascia ambra mobile ridotta da 340 a 262 px** (31% di 844). Ho portato allo stesso limite anche i telefoni nei blocchi (prima 300 px). Su schermi più larghi le proporzioni restano costanti (a 430 px la fascia sta al 31% di 932).
- "Il titolare" per Luca e Milano, foto reale di A casa mia, IKTA senza volti, nomi e numeri di Milano anonimizzati con la didascalia, blocco "Prima" di Luca, nessun URL inventato, chiusura scura con pulsante carta, SEO dei casi rimandata alla Fase 5: tutto invariato.
- Punti pre-lancio annotati: conferma autore e cliente della foto di A casa mia, conferma di Luca sul "Prima", indirizzi di Lazzi, Milano e IKTA.

## 2. Cosa è stato implementato (Fase 4)

**Form nella home** (design invariato). Tre obbligatori (Nome, Attività, Telefono), due opzionali (Sito o Instagram, se li hai; Cosa vorresti ottenere?), placeholder "es. Bar Roma, Civitavecchia". Aggiunti i testi richiesti: in testa al form "Non serve avere già un'idea chiara. Raccontami semplicemente cosa fai e cosa vorresti ottenere." e sotto il pulsante "Ti rispondo personalmente entro 1 giorno lavorativo."

**Validazione accessibile**
- Controllo all'uscita dal campo e all'invio; una volta mostrato, l'errore si aggiorna mentre si digita.
- `aria-invalid="true"` sul campo, `aria-describedby` che punta al messaggio, messaggio con `role="alert"`, focus sul primo campo errato.
- Nome e attività: almeno 2 caratteri. Telefono: da 8 a 15 cifre, con `+`, spazi, trattini e parentesi ammessi.
- Stato errore senza nuovi colori: testo in grassetto con "!" davanti e bordo del campo a 2 px. Non si affida al solo colore.
- Senza JavaScript restano i controlli nativi del browser e l'invio normale a Formspree.

**Invio**
- `fetch` a Formspree con `Accept: application/json`, timeout di 15 secondi.
- Durante l'invio: pulsante "Invio...", disabilitato, `aria-busy`. Un secondo invio mentre il primo è in corso viene ignorato.
- Successo: nome e attività vanno in `sessionStorage`, poi redirect a `/grazie/`. **Nell'URL non c'è nessun dato personale** (nessuna query, nessun hash).
- Errore del server o rete che cade: messaggio "Non è partita. Riprova, oppure scrivimi su WhatsApp." con il link WhatsApp, pulsante riabilitato. Browser offline: messaggio dedicato senza nemmeno tentare l'invio.
- Anti-spam: casella trappola `_gotcha` e controllo del tempo (invio entro 3 secondi dal caricamento). In entrambi i casi l'invio viene scartato in silenzio, senza richiesta.
- Campo nascosto `_subject` ("Nuova richiesta da satoshiweb.it") per riconoscere le email.

**Pagina `/grazie/`** dalla tavola V3.1 n.9: fascia ambra con "Fatto, [nome]. Ora tocca a me." e "Ho i dati di [attività]", tre passi, "Vuoi fare prima?" con WhatsApp, "Ti risponde Edoardo", "Nel frattempo" con A casa mia. Nome e attività sono inseriti come testo (mai come HTML), letti una volta e poi cancellati da `sessionStorage`. Aprendo la pagina direttamente, o ricaricandola, il testo è generico e non resta nessun dato. `noindex`.

**Tracking**
- `form_start` (primo focus), `form_submit` (tentativo valido), `form_success`, `form_error` (con motivo: validazione o rete).
- Alla riuscita parte anche `conversion`: il vecchio sito lo mandava a Victor Analytics a ogni invio, così lo storico non si interrompe.
- Gli altri eventi già definiti (`cta_hero`, `whatsapp_click` con posizione, `portfolio_click`...) restano. Il click su WhatsApp nel messaggio d'errore ha posizione `form_errore`.

**Barra fissa e tastiera mobile.** La barra si nasconde quando la tastiera è aperta (viewport ridotto) e ritorna alla chiusura. In più, `scroll-padding-bottom` evita che un campo in focus finisca sotto la barra.

## 3. Verifiche (37 test automatici, 37 superati)

Test eseguiti con Playwright, Formspree intercettato.

| Area | Esito |
|---|---|
| Invio vuoto | 3 campi `aria-invalid`, messaggi visibili con `role="alert"`, `aria-describedby` corretto, focus sul primo campo, nessuna richiesta |
| Telefono non valido | messaggio di formato; l'errore sparisce correggendo, senza reinviare |
| Rete lenta (900 ms) | pulsante "Invio...", disabilitato, `aria-busy="true"` |
| Doppio invio | una sola richiesta |
| Redirect | `/grazie/` senza query né hash; payload con i campi e honeypot vuoto |
| `/grazie/` | personalizzata dai dati; `sessionStorage` svuotato; ricarica = testo generico |
| Errore 500 | messaggio, link WhatsApp, pulsante riabilitato, resta sul form; riprova va a buon fine |
| Rete assente | richiesta abortita: errore con WhatsApp. Browser offline: messaggio dedicato, nessun tentativo |
| Honeypot e invio rapido | nessuna richiesta inviata |
| Tastiera | ordine di tab nome, attività, telefono, dettagli, invia; toggle dettagli da tastiera; contorno di focus a 3 px; Invio invia il form |
| Barra fissa | visibile dopo la CTA hero; nascosta con tastiera aperta; di nuovo visibile alla chiusura; campo in focus sopra la barra |
| Layout con errori | nessun overflow a 360, 390, 430, 834 e 1440 |
| Richieste esterne | nessuna non intercettata |

## 4. Misure e audit

Altezza della home dopo l'aggiunta di intro, promessa e righe di errore:

| Larghezza | V3.1 | Fase 2 | Ora |
|---|---|---|---|
| 360 | 7.120 | 7.446 | 7.573 |
| 390 | 7.136 | 7.515 | 7.622 |
| 430 | 7.087 | 7.536 | 7.622 |
| 834 | 5.277 | 5.526 | 5.658 |
| 1440 | 5.263 | 5.577 | 5.690 |

La sezione contatti cresce di circa 95 px per il copy richiesto. Siamo al 7% sopra la V3.1 (a 390 px 7.563 senza il margine della barra fissa). Nessuno scroll orizzontale a nessuna larghezza.

Case study dopo la fascia a 262 px: nessun overflow né immagine rotta in 30 combinazioni; il visual più alto è il 31% dello schermo (262 px a 390, 293 px a 430 che è il 31% di 932).

- **`audit-design.py`** su home e `/grazie/`: **0 errori**, 40 avvisi (etichette da 11 px e spaziature fuori scala delle tavole, `apple-touch-icon` in Fase 5, e le domande FAQ, la cui area di tocco ho allargato con un elemento invisibile che lo strumento non conta).
- **`controlla-testi.py`**: zero problemi nel contenuto nuovo. I rilievi rimasti sono tutti il banner cookie di `consent.js`.
- **JavaScript:** 7,6 KB non compresso, 2,8 KB compresso (budget 6 KB compresso).

## 5. Difetti trovati e corretti

- Un test sbagliato: il titolo di default della grazie contiene spazi indivisibili e il confronto no. Corretto il test, e lego le parole brevi anche nel testo personalizzato ("a me", "di", "al numero").
- "Guarda come ho costruito A / casa mia" andava a capo dopo "A": il testo non passava dalla legatura tipografica. Corretto.
- I telefoni dei case study avevano un'altezza predefinita di 300 px, ereditata dalla Fase 3, che dava il 36%: ora 262 px.
- Il contenitore della grazie aveva un margine che lo spostava al bordo della pagina: corretto.

## 6. Decisioni e punti aperti

1. **Stato di errore.** Non esistono colori di errore nella palette V3.1. Ho usato testo in grassetto con "!" e bordo a 2 px, senza introdurre un rosso. Va approvato.
2. **Testo dei passi in `/grazie/`.** La tavola V3.1 n.9 dice "Guardo il tuo sito" e "ti preparo una demo e un preventivo". Con la home riposizionata (anche chi non ha un sito) ho allineato i tre passi a quelli della home: "Leggo cosa mi hai scritto", "Ti scrivo su WhatsApp", "Decidi tu".
3. **Scarto silenzioso.** Un invio entro 3 secondi dal caricamento, o con la casella trappola compilata, viene scartato come se fosse riuscito. Un utente molto veloce potrebbe credere di aver scritto. È il comportamento definito nel piano; se preferisci un messaggio visibile lo cambio.
4. **La promessa compare due volte** nella sezione: sotto il pulsante e nel passo 2 di "Cosa succede dopo" (testo V3.1). Posso toglierne una.
5. **Formspree da verificare dal tuo pannello**, perché da qui non l'ho toccato: che il modulo accetti richieste JSON, che reCAPTCHA non sia attivo (bloccherebbe `fetch`), che le email arrivino a te, e i limiti del piano. **Serve un invio di prova reale, fatto da te, prima del lancio.**
6. **Tastiera su dispositivo reale.** L'ho simulata riducendo il viewport. Va controllata su iPhone con Safari (la tastiera di iOS cambia il viewport in modo diverso) e su un Android.
7. **Privacy.** Il form dice "Inviando accetti la privacy policy" ma la privacy attuale non è stata riletta né aggiornata (resta un requisito pre-lancio): deve nominare Formspree come destinatario dei dati.
8. **Pre-lancio, invariati:** `llms.txt` con il prezzo di 200 euro, foto di A casa mia, "Prima" di Luca, indirizzi mancanti, Satoshi servito in produzione senza ricaduta su Bricolage.

## 7. Stato del repo

Branch `v3.1-foundation`, commit di lavoro `c99867e`, `4d28705`, `5a70954`, `cfac589`. In attesa di approvazione: non inizio la Fase 5.
