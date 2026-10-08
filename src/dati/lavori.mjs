// Fonte unica dei 6 lavori. Copy dal Brief (§7 homepage, §8 secondari, §9 case study) e dalla V3.1.
//
// Regole:
//  - `home: n` = posizione in homepage (Q2 approvata: Luca, A casa mia, Taiko, Lazzi). Milano e IKTA: nessuna.
//  - `ordine` = posizione nell'indice /lavori/.
//  - `pattern` = quale blocco visivo usa la scheda in homepage (V3.1: sistema, locale, design, shop).
//  - Referente di Luca e Milano: "il titolare" finché il nome non è verificato (Q4). Mai "Samuele".
//  - Taiko resta "In anteprima" (Brief §7). Nessun dato demo presentato come produzione.
//  - Nessuna metrica, testimonianza o risultato inventato. Dove manca un fatto, il campo non c'è
//    e il blocco del case study non viene emesso.
//  - `immagini`: popolato in Fase 2 e 3, dopo la verifica privacy di ogni asset (vedi IMPLEMENTATION-PLAN, E).

export const lavori = [
  {
    slug: 'luca-california',
    nome: 'Luca California',
    categoria: 'Un sistema',
    mestiere: 'PR e organizzatore di eventi',
    luogo: 'Roma',
    pattern: 'sistema',
    home: 1,
    ordine: 1,
    frase:
      'Ho costruito lucacalifornia.it e un sistema gestionale per ricevere e organizzare le richieste direttamente dal suo telefono, con una webapp.',
    spiegazione:
      'In pratica, è un pannello che il titolare può aprire dal telefono e usare per gestire quello che succede.',
    flusso: 'Le richieste vengono raccolte dal sito e gestite dal pannello, con conferma e comunicazione al cliente.',
    link: { href: 'https://lucacalifornia.it', testo: 'lucacalifornia.it' },
    stato: 'produzione',
    daConfermare: ['prima: richieste gestite a mano su WhatsApp', 'autorizzazione del cliente', 'nome del referente'],
  },
  {
    slug: 'a-casa-mia',
    nome: 'A casa mia',
    categoria: "Un'attività locale",
    mestiere: 'Caffè e brunch',
    luogo: 'Civitavecchia',
    pattern: 'locale',
    home: 2,
    ordine: 2,
    frase: 'Un sito pensato per farsi trovare dai turisti e farsi conoscere anche da chi vive in zona.',
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
    pattern: 'design',
    home: 3,
    ordine: 3,
    frase: "Un'esperienza forte davanti, un sistema per gestire le richieste dietro.",
    descrizione: 'Sito con sistema di richiesta e pannello webapp gestionale.',
    flusso:
      'Chi vuole partecipare a un evento invia la richiesta dal sito. Il team la riceve nel pannello e può gestirla da lì.',
    link: { href: 'https://taikoclub.satoshiweb.it', testo: 'Guarda l’anteprima' },
    stato: 'anteprima', // etichetta "In anteprima" sempre visibile
    daConfermare: ['permesso di mostrare l’anteprima', 'autorizzazione del cliente'],
  },
  {
    slug: 'lazzi',
    nome: 'Lazzi Barbershop',
    categoria: 'E-commerce',
    mestiere: 'Barbiere',
    luogo: '',
    pattern: 'shop',
    home: 4,
    ordine: 4,
    frase:
      'Ho progettato e sviluppato il sito e lo shop online di Lazzi Barbershop, con gestione dal pannello.',
    spiegazione: 'Il sito e lo shop possono essere gestiti direttamente dal browser attraverso il pannello.',
    link: null, // da verificare l'indirizzo pubblico prima di linkare
    stato: 'produzione',
    daConfermare: ['indirizzo pubblico del sito', 'autorizzazione del cliente'],
  },
  {
    slug: 'milano-clubs',
    nome: 'Milano Clubs Reservation',
    categoria: 'Un contesto premium',
    mestiere: 'PR e concierge',
    luogo: 'Milano',
    pattern: null,
    home: null,
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
    pattern: null,
    home: null,
    ordine: 6,
    frase:
      'IKTA non aveva bisogno soltanto di una nuova homepage. Il sito doveva mettere ordine tra discipline, persone, palestre, formazione, gare ed eventi.',
    link: null,
    stato: 'produzione',
    daConfermare: ['indirizzo pubblico', 'volti riconoscibili nelle schermate', 'autorizzazione del cliente'],
  },
];

export const lavoriHome = lavori.filter((l) => l.home).sort((a, b) => a.home - b.home);
export const lavoriIndice = [...lavori].sort((a, b) => a.ordine - b.ordine);
export const lavoroPerSlug = (slug) => lavori.find((l) => l.slug === slug);
