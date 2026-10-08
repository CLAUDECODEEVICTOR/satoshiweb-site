// Contenuto dei 6 case study. Struttura V3.1 (tavola 10) e Brief §9: punto di partenza, cosa serviva, decisione,
// soluzione, prova visuale, risultato verificabile, cosa succede oggi.
//
// Regole ferree:
//  - Solo fatti: dal Brief, dalla V3.1, oppure visibili negli screenshot usati. Nessuna metrica, nessun risultato inventato.
//  - Se un blocco non ha contenuto verificato, non esiste (niente segnaposto).
//  - Referente di Luca e Milano: "il titolare". Mai "Samuele".
//  - Taiko sempre "In anteprima". Dati dei pannelli: dichiarati di esempio o anonimizzati.
//  - Nessun trattino lungo.
//
// Tipi di visual:
//  tile    un telefono, ritagliato (aspect 240/330), `pos` = punto del ritaglio in verticale
//  coppia  due telefoni affiancati (aspect 170/300 o `aspect`)
//  schermo uno o più schermi desktop a larghezza piena
//  barra   la barra fissa di A casa mia su fondo carta scura
//  foto    fotografia reale (aspect 4/3)

const ESEMPIO = 'Schermata con dati di esempio.';

export const casi = {
  'luca-california': {
    lead: 'Ho costruito lucacalifornia.it e un sistema gestionale per ricevere e organizzare le richieste direttamente dal suo telefono, con una webapp.',
    fascia: {
      schermo: { img: 'luca/luca-d-serate', alt: 'Le serate sul sito di Luca California, vista computer' },
      telefono: { img: 'luca/luca-m-hero', alt: 'Il sito di Luca California dal telefono: prenota tavolo, bracciale o lista', pos: 30 },
    },
    blocchi: [
      { titolo: 'Il punto di partenza', testo: ['Richieste, liste e tavoli gestiti a mano su WhatsApp.'] },
      {
        titolo: 'Cosa serviva',
        testo: [
          'Ricevere e organizzare le richieste direttamente dal telefono.',
          'Una webapp è semplicemente un programma che apri dal browser del telefono, senza dover installare nulla. In pratica, è un pannello che il titolare può aprire dal telefono e usare per gestire quello che succede.',
        ],
      },
      {
        titolo: 'Il sito',
        testo: ['Serate, tavoli e navetta sul sito. Si prenota da lì: tavolo, bracciale o lista.'],
        visual: {
          tipo: 'coppia',
          items: [
            { img: 'luca/luca-m-hero', alt: 'Il sito di Luca California dal telefono: scegli la serata, prenota tavolo, bracciale o lista', pos: 35 },
            { img: 'luca/luca-m-serate', alt: 'Elenco delle serate sul sito di Luca California', pos: 0 },
          ],
        },
      },
      {
        titolo: 'Le richieste arrivano nel pannello',
        testo: [
          'Le richieste vengono raccolte dal sito e gestite dal pannello.',
          'Si filtrano per nuove, confermate e tutte. Ognuna mostra serata, sala, tipo di tavolo e budget a testa.',
        ],
        visual: { tipo: 'tile', img: 'luca/pannello-richieste', alt: 'Il pannello di Luca California: elenco delle richieste nuove con serata, sala e budget', pos: 0, didascalia: ESEMPIO },
      },
      {
        titolo: 'Il dettaglio di una richiesta',
        testo: ['Aprendo una richiesta si vedono serata, tipo, budget a testa, occasione e le note del cliente. Ci sono anche note private, visibili solo al titolare.'],
        visual: { tipo: 'tile', img: 'luca/pannello-dettaglio', alt: 'Dettaglio di una richiesta nel pannello: serata, tipo di tavolo, budget e occasione', pos: 0, didascalia: ESEMPIO },
      },
      {
        titolo: 'Conferma e comunicazione al cliente',
        testo: ['Con Conferma e scrivi si apre WhatsApp con il messaggio già scritto e il link al biglietto da aggiungere al Wallet. Niente parte da solo.'],
        visual: { tipo: 'tile', img: 'luca/pannello-conferma', alt: 'Richiesta confermata nel pannello: biglietto pronto e pulsante per aprire WhatsApp con il messaggio', pos: 85, didascalia: ESEMPIO },
      },
      {
        titolo: "All'ingresso",
        testo: ["Il lettore mostra l'esito: ENTRA, con nome, tipo di tavolo, sala e serata."],
        visual: { tipo: 'tile', img: 'luca/lettore-ingresso', alt: "Lettore all'ingresso: schermata verde con la scritta ENTRA e i dati della prenotazione", pos: 40, didascalia: ESEMPIO },
      },
    ],
    oggi: { testo: 'Il sito è online. Aprilo dal telefono e giudica tu.' },
  },

  'a-casa-mia': {
    lead: 'Caffè, brunch e aperitivo a pochi passi dal porto. Un sito pensato prima di tutto per il telefono.',
    fascia: {
      schermo: { img: 'acasamia/acm-desktop', alt: 'Il sito di A casa mia su computer' },
      telefono: { img: 'acasamia/acm-mobile', alt: 'Il sito di A casa mia visto dal telefono', pos: 0 },
    },
    blocchi: [
      {
        titolo: "L'idea",
        testo: ['Pensato per farsi trovare dai turisti e per farsi conoscere dalle persone locali.'],
        visual: { tipo: 'foto', img: 'acasamia/foto-reale', alt: 'Cornetti e cappuccino su una tovaglietta con il logo di A casa mia', pos: 40 },
      },
      {
        titolo: 'La decisione',
        testo: ['Ho progettato il sito partendo dal telefono. Le azioni che contano restano fisse in basso; il resto della pagina racconta la giornata del locale.'],
        visual: { tipo: 'barra', img: 'acasamia/acm-m-bar', alt: 'La barra fissa con Chiama, WhatsApp e Indicazioni' },
      },
      {
        titolo: 'Il design, dal telefono',
        visual: {
          tipo: 'coppia',
          aspect: '170 / 215',
          items: [
            { img: 'acasamia/acm-m-giornata', alt: 'La sezione Una giornata a casa mia, dal telefono', pos: 0 },
            { img: 'acasamia/acm-m-orari-crop', alt: 'Gli orari, con il giorno di oggi in evidenza', pos: 0 },
          ],
        },
      },
      {
        titolo: 'E dal computer',
        visual: {
          tipo: 'schermo',
          items: [
            { img: 'acasamia/acm-d-giornata', alt: 'La sezione Una giornata a casa mia su computer' },
            { img: 'acasamia/acm-d-orari', alt: 'Orari e mappa su computer' },
          ],
        },
      },
      {
        titolo: "Cosa c'è dentro",
        elenco: ['Design su misura', 'Barra contatti sempre visibile', 'Italiano e inglese', 'Orari con il giorno di oggi in evidenza', 'Recensioni Google e ordini via Glovo'],
      },
    ],
    oggi: { testo: 'Il sito è online. Aprilo dal telefono e giudica tu.' },
  },

  taiko: {
    lead: "Un'esperienza forte davanti, un sistema per gestire le richieste dietro. Sito con sistema di richiesta e pannello webapp gestionale.",
    fascia: { schermo: { img: 'taiko/sito-hero', alt: 'Schermata iniziale del sito Taiko su computer' } },
    blocchi: [
      {
        titolo: 'Il sito',
        testo: ["Direzione visiva, pagina evento e richiesta d'accesso. Il sito è in inglese."],
        visual: { tipo: 'schermo', items: [{ img: 'taiko/richiesta-evento', alt: "La richiesta d'accesso a un evento sul sito Taiko" }] },
      },
      {
        titolo: 'La richiesta',
        testo: ['Chi vuole partecipare a un evento invia la richiesta dal sito.'],
      },
      {
        titolo: 'Il pannello delle richieste',
        testo: ['Il team la riceve nel pannello e può gestirla da lì: confermare e scrivere, mettere in lista d’attesa o rifiutare.'],
        visual: { tipo: 'schermo', items: [{ img: 'taiko/pannello-requests', alt: 'Il pannello Requests di Taiko: richieste da gestire con Confirm and send message, Waitlist e Reject' }], didascalia: ESEMPIO },
      },
      {
        titolo: 'Il pannello degli eventi',
        testo: ['Dallo stesso pannello si gestiscono gli eventi. L’ordine nel pannello è l’ordine sul sito, e ogni evento si può pubblicare o nascondere.'],
        visual: { tipo: 'schermo', items: [{ img: 'taiko/pannello-events', alt: 'Il pannello Events di Taiko: elenco degli eventi con stato Live o Hidden' }], didascalia: ESEMPIO },
      },
    ],
    oggi: { titolo: 'Lo stato', testo: 'In anteprima: non è un sito in produzione. Le date e i luoghi degli eventi sono ancora da annunciare.' },
  },

  lazzi: {
    lead: 'Ho progettato e sviluppato il sito e lo shop online di Lazzi Barbershop, con gestione dal pannello.',
    fascia: {
      schermo: { img: 'lazzi/vetrina', alt: 'Lo shop online di Lazzi Barbershop su computer: la vetrina' },
      telefono: { img: 'lazzi/scheda-mobile', alt: 'La scheda di un prodotto dello shop Lazzi, dal telefono', pos: 20 },
    },
    blocchi: [
      {
        titolo: 'Lo shop',
        testo: ['Vetrina, catalogo e scheda prodotto, con il carrello. Funziona anche dal telefono.'],
        visual: { tipo: 'schermo', items: [{ img: 'lazzi/catalogo', alt: 'Il catalogo dello shop Lazzi su computer' }] },
      },
      {
        titolo: 'Il pannello',
        testo: [
          'Il sito e lo shop possono essere gestiti direttamente dal browser attraverso il pannello.',
          'Dal pannello si gestiscono ordini, prodotti, inventario, coupon e resi. Gli ordini si filtrano per stato: nuovo, in preparazione, spedito, consegnato.',
        ],
        visual: {
          tipo: 'schermo',
          items: [
            { img: 'lazzi/pannello-ordini', alt: 'Il pannello di Lazzi: ordini del giorno, prodotti, inventario, coupon e resi' },
            { img: 'lazzi/pannello-prodotti', alt: 'La gestione dei prodotti nel pannello di Lazzi' },
          ],
          didascalia: ESEMPIO,
        },
      },
      {
        titolo: "Cosa c'è dentro",
        elenco: ['Gestione di ordini e prodotti dal pannello', 'Prezzi e magazzino controllati lato server'],
      },
    ],
  },

  'milano-clubs': {
    lead: 'Ho trasformato il flusso: oggi le richieste arrivano dal sito e il titolare può gestirle comodamente dal pannello, anche dal telefono.',
    fascia: {
      schermo: { img: 'milano/mcr-d-calendario', alt: 'Il sito di Milano Clubs Reservation su computer: scelta del servizio e calendario della settimana' },
      telefono: { img: 'milano/mcr-m-form', alt: 'Il modulo di richiesta tavolo del sito Milano Clubs Reservation, dal telefono', pos: 0 },
    },
    blocchi: [
      { titolo: 'Il punto di partenza', testo: ['Prima le richieste arrivavano tramite messaggi: centinaia al giorno, dato stimato.'] },
      {
        titolo: 'Il sito',
        testo: ['Otto club, calendario sera per sera, richiesta tavolo in pochi campi.'],
      },
      {
        titolo: 'Il pannello',
        testo: [
          'Oggi le richieste arrivano dal sito e il titolare può gestirle comodamente dal pannello, anche dal telefono.',
          'Si filtrano per nuove, tutte e confermate. Ogni richiesta ha i pulsanti Conferma e Rifiuta, e un tasto per scrivere su WhatsApp.',
        ],
        visual: { tipo: 'schermo', items: [{ img: 'milano/pannello-richieste-web', alt: 'Il pannello delle richieste di Milano Clubs su computer: richieste nuove e confermate' }], didascalia: 'Schermata con nomi e numeri anonimizzati.' },
      },
      {
        titolo: 'La serata',
        testo: ['La vista Stasera mostra quante persone sono entrate, quanti tavoli e quante persone in lista, e quante sono ancora da spuntare.'],
        visual: {
          tipo: 'coppia',
          aspect: '170 / 300',
          items: [
            { img: 'milano/pannello-richieste-mobile', alt: 'Le richieste nel pannello, dal telefono', pos: 0 },
            { img: 'milano/stasera-mobile', alt: 'La vista Stasera: persone entrate, tavoli, lista e nomi da spuntare', pos: 0 },
          ],
          didascalia: 'Schermate con nomi e numeri anonimizzati.',
        },
      },
    ],
  },

  ikta: {
    lead: 'IKTA non aveva bisogno soltanto di una nuova homepage. Il sito doveva mettere ordine tra discipline, persone, palestre, formazione, gare ed eventi.',
    fascia: { schermo: { img: 'ikta/discipline', alt: 'La pagina delle discipline del sito IKTA World' } },
    blocchi: [
      {
        titolo: 'Organizzare la complessità',
        testo: ['Il sito doveva mettere ordine tra discipline, persone, palestre, formazione, gare ed eventi. La navigazione lo dice subito: IKTA Italia, IKTA World, Chi siamo, Formazione, Gare e ranking, Contatti.'],
        visual: { tipo: 'schermo', items: [{ img: 'ikta/home-navigazione', alt: 'La barra di navigazione del sito IKTA World con le sezioni principali' }] },
      },
      {
        titolo: 'Le discipline',
        testo: ['Ogni disciplina ha la sua scheda, con le tecniche e i livelli.'],
      },
      {
        titolo: 'Gare ed eventi',
        testo: ['Le locandine dei prossimi eventi e di quelli passati stanno in una pagina sola.'],
        visual: { tipo: 'schermo', items: [{ img: 'ikta/gare', alt: 'La pagina Gare del sito IKTA World con le locandine degli eventi' }], didascalia: 'Locandine sfocate in questa anteprima.' },
      },
    ],
  },
};
