// Fonte unica dei 6 lavori. Copy dal Brief (§7 homepage, §8 secondari, §9 case study) e dalla V3.1.
//
// Regole:
//  - `homePos` = posizione in homepage (Q2: Luca, A casa mia, Taiko, Lazzi). Milano e IKTA: nessuna.
//  - `ordine` = posizione nell'indice /lavori/.
//  - `scheda` = copy della scheda in homepage, preso dai prototipi V3.1 (testi misurati e approvati).
//    `brief` = frase equivalente del Master Build Brief §7, tenuta qui per un eventuale cambio di copy in una riga.
//  - Referente di Luca e Milano: "il titolare" finché il nome non è verificato (Q4). Mai "Samuele".
//  - Taiko resta "In anteprima" (Brief §7). Nessun dato demo presentato come produzione.
//  - Nessuna metrica, testimonianza o risultato inventato. Dove manca un fatto il campo non c'è
//    e il blocco del case study non viene emesso.

export const lavori = [
  {
    slug: 'luca-california',
    nome: 'Luca California',
    categoria: 'Un sistema',
    mestiere: 'PR e organizzatore di eventi',
    luogo: 'Roma',
    homePos: 1,
    ordine: 1,
    frase:
      'Ho costruito lucacalifornia.it e un sistema gestionale per ricevere e organizzare le richieste direttamente dal suo telefono, con una webapp.',
    brief: {
      frase: 'Ho costruito lucacalifornia.it e un sistema gestionale per ricevere e organizzare le richieste direttamente dal suo telefono, con una webapp.',
      spiegazione: 'In pratica, è un pannello che il titolare può aprire dal telefono e usare per gestire quello che succede.',
      flusso: 'Le richieste vengono raccolte dal sito e gestite dal pannello, con conferma e comunicazione al cliente.',
    },
    scheda: {
      etichetta: '01 · Un sistema',
      frase: 'Da WhatsApp a un sistema che lavora con lui.',
      prima: 'Richieste, liste e tavoli gestiti a mano su WhatsApp.',
      ora: 'Serate, tavoli e navetta sul sito. Si prenota da lì, e le richieste arrivano a Luca in un pannello da cui le gestisce.',
      didascaliaPannello: 'Schermata con dati di esempio.',
    },
    link: { href: 'https://lucacalifornia.it', testo: 'lucacalifornia.it' },
    stato: 'produzione',
    daConfermare: ['"Prima": richieste gestite a mano su WhatsApp (conferma di Luca)', 'autorizzazione del cliente', 'nome del referente'],
  },
  {
    slug: 'a-casa-mia',
    nome: 'A casa mia',
    categoria: "Un'attività locale",
    mestiere: 'Caffè e brunch',
    luogo: 'Civitavecchia',
    homePos: 2,
    ordine: 2,
    frase: 'Un sito pensato per farsi trovare dai turisti e farsi conoscere anche da chi vive in zona.',
    brief: { frase: 'Un sito pensato per farsi trovare dai turisti e farsi conoscere anche da chi vive in zona.' },
    scheda: {
      etichetta: "02 · Un'attività locale",
      testoMt: 'Caffè e brunch. Progettato partendo dal telefono: orari, contatti e indicazioni si trovano subito.',
      testoD: 'Caffè e brunch. Progettato partendo dal telefono: italiano e inglese, oggi in evidenza negli orari, contatti e indicazioni sempre a portata.',
    },
    link: { href: 'https://acasamiacivitavecchia.it', testo: 'acasamiacivitavecchia.it' },
    stato: 'produzione',
    daConfermare: ['funzionalità sviluppate da Satoshi Web', 'uso della fotografia reale', 'autorizzazione del cliente'],
  },
  {
    slug: 'taiko',
    nome: 'Taiko',
    categoria: 'Design e sistema',
    mestiere: 'Serate house',
    luogo: '',
    homePos: 3,
    ordine: 3,
    frase: "Un'esperienza forte davanti, un sistema per gestire le richieste dietro.",
    descrizione: 'Sito con sistema di richiesta e pannello webapp gestionale.',
    flusso:
      'Chi vuole partecipare a un evento invia la richiesta dal sito. Il team la riceve nel pannello e può gestirla da lì.',
    brief: { frase: "Un'esperienza forte davanti, un sistema per gestire le richieste dietro." },
    scheda: {
      etichetta: '03 · Il design',
      stato: 'In anteprima',
      testoMt: 'Serate house. Quando contano atmosfera, tipografia e fotografia.',
      testoLato: "Direzione visiva, pagina evento e richiesta d'accesso.",
      testoD: "Serate house. Quando contano atmosfera, tipografia e fotografia: direzione visiva, pagina evento e richiesta d'accesso.",
    },
    link: { href: 'https://taikoclub.satoshiweb.it', testo: "Guarda l'anteprima" },
    stato: 'anteprima', // etichetta "In anteprima" sempre visibile
    daConfermare: ["permesso di mostrare l'anteprima", 'autorizzazione del cliente'],
  },
  {
    slug: 'lazzi',
    nome: 'Lazzi Barbershop',
    categoria: 'E-commerce',
    mestiere: 'Barbiere',
    luogo: '',
    homePos: 4,
    ordine: 4,
    frase: 'Ho progettato e sviluppato il sito e lo shop online di Lazzi Barbershop, con gestione dal pannello.',
    brief: {
      frase: 'Ho progettato e sviluppato il sito e lo shop online di Lazzi Barbershop, con gestione dal pannello.',
      spiegazione: 'Il sito e lo shop possono essere gestiti direttamente dal browser attraverso il pannello.',
    },
    // Lazzi non ha una scheda disegnata nella V3.1: applica lo stesso schema delle altre (etichetta, nome, frase, visual).
    // Il luogo non è nei materiali: la parte destra dell'etichetta resta vuota, non si inventa.
    scheda: {
      etichetta: '04 · E-commerce',
      destra: 'Shop online',
      testo: 'Ho progettato e sviluppato il sito e lo shop online di Lazzi Barbershop, con gestione dal pannello.',
      testoLato: 'Il sito e lo shop possono essere gestiti direttamente dal browser attraverso il pannello.',
    },
    link: null, // indirizzo pubblico da verificare prima di linkare
    stato: 'produzione',
    daConfermare: ['indirizzo pubblico del sito', 'autorizzazione del cliente', 'luogo per l’etichetta'],
  },
  {
    slug: 'milano-clubs',
    nome: 'Milano Clubs Reservation',
    categoria: 'Un contesto premium',
    mestiere: 'PR e concierge',
    luogo: 'Milano',
    homePos: null,
    ordine: 5,
    frase:
      'Ho trasformato il flusso: oggi le richieste arrivano dal sito e il titolare può gestirle comodamente dal pannello, anche dal telefono.',
    contesto: 'Prima le richieste arrivavano tramite messaggi: centinaia al giorno, dato stimato.',
    link: null, // dominio da verificare: milanoclubreservation.it o milanoclubsreservation.it
    stato: 'produzione',
    daConfermare: ['dominio corretto', 'nome del referente', 'autorizzazione del cliente', 'mascheramento numeri nelle schermate'],
  },
  {
    slug: 'ikta',
    nome: 'IKTA',
    categoria: 'Organizzare la complessità',
    mestiere: 'Federazione sportiva',
    luogo: '',
    homePos: null,
    ordine: 6,
    frase:
      'IKTA non aveva bisogno soltanto di una nuova homepage. Il sito doveva mettere ordine tra discipline, persone, palestre, formazione, gare ed eventi.',
    link: null,
    stato: 'produzione',
    daConfermare: ['indirizzo pubblico', 'volti riconoscibili nelle schermate', 'autorizzazione del cliente'],
  },
];

export const lavoriHome = lavori.filter((l) => l.homePos).sort((a, b) => a.homePos - b.homePos);
export const lavoriIndice = [...lavori].sort((a, b) => a.ordine - b.ordine);
export const lavoroPerSlug = (slug) => lavori.find((l) => l.slug === slug);
