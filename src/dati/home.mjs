// Testi delle sezioni della homepage. Copy dai prototipi V3.1 (mobile, tablet, desktop) e dal Brief. Non riscrivere.

export const navLinea = [
  { href: '/lavori/', testo: 'Lavori' },
  { href: '/#processo', testo: 'Come lavoro', solo: 'd' },
  { whatsapp: true, testo: 'WhatsApp' },
];
export const navMenu = [
  { href: '/lavori/', testo: 'Lavori' },
  { href: '/#processo', testo: 'Come lavoro' },
  { href: '/#contatti', testo: 'Contatti' },
];

export const hero = {
  etichetta: 'Siti web per attività e professionisti',
  titolo: [{ testo: 'Costruisco' }, { testo: 'il sito giusto', evidenzia: true }, { testo: 'per la tua attività.' }],
  sottotitolo: 'Su misura e pensato per il telefono. Quando serve, collegato a prenotazioni, vendite e gestione.',
  cta: 'Parliamo del tuo progetto →',
  secondaria: 'Hai già un sito? Ti dico cosa migliorerei, gratis',
  fascia: {
    etichetta: 'Un mio lavoro',
    mobile: 'A casa mia · Civitavecchia',
    tablet: 'A casa mia · caffè e brunch a Civitavecchia',
    desktop: 'A casa mia, caffè e brunch a Civitavecchia',
    altri: 'Guarda gli altri ↓',
  },
};

export const daDoveParti = {
  titolo: 'Da dove parti?',
  percorsi: [
    {
      titolo: 'Non hai ancora un sito?',
      testo: 'Partiamo da zero e costruiamo quello che serve davvero alla tua attività.',
      link: 'Raccontami la tua attività →',
    },
    {
      titolo: 'Hai già un sito?',
      testo: 'Partiamo da quello che hai. Ti dico cosa terrei, cosa cambierei e cosa rifarei. Gratis.',
      link: 'Mandami il link →',
    },
  ],
};

export const lavoriTesta = {
  titolo: 'Non racconto cosa so fare. Te lo faccio vedere.',
  sotto: 'Quattro lavori, quattro problemi diversi.',
};

// "Un sito può essere molto più di una vetrina": ogni voce rimanda ai lavori (Brief §11).
export const capacita = {
  titolo: 'Un sito può essere molto più di una vetrina.',
  voci: [
    { titolo: 'Può raccogliere prenotazioni.', rimandi: [{ testo: 'Luca California', slug: 'luca-california' }, { testo: 'Milano Clubs Reservation', slug: 'milano-clubs' }] },
    { titolo: 'Può organizzare il lavoro.', pre: 'Il pannello con cui ', rimandi: [{ testo: 'Luca', slug: 'luca-california' }], post: ' gestisce le richieste' },
    { titolo: 'Può vendere.', rimandi: [{ testo: 'Lazzi Barbershop', slug: 'lazzi' }], post: ', shop online' },
    { titolo: "Può costruire un'identità.", rimandi: [{ testo: 'Taiko', slug: 'taiko' }] },
    { titolo: 'Può semplicemente fare bene il suo lavoro.', rimandi: [{ testo: 'A casa mia', slug: 'a-casa-mia' }] },
  ],
  ai: {
    titolo: 'Può farsi capire anche oltre Google.',
    alt: 'Risposta di ChatGPT: a Civitavecchia, quello che valuterei per primo è Satoshi Web',
    trascrizione:
      'A Civitavecchia, quello che valuterei per primo è Satoshi Web: sul sito dichiara esplicitamente sviluppo di siti, web app e app iOS/Android, oltre a chatbot, automazioni, integrazioni con Google Calendar/WhatsApp, riconoscimento immagini e strumenti AI personalizzati. Mostra anche alcuni progetti AI già realizzati.',
    didascalia: 'Un esempio: come ChatGPT ha descritto Satoshi Web. Non è una promessa di posizionamento.',
  },
};

export const processo = {
  titolo: 'Come lavoro.',
  passi: [
    { n: '01', titolo: 'Guardo.', testo: "La tua attività e quello che hai già online, se c'è." },
    { n: '02', titolo: 'Ti dico cosa serve.', testo: 'Se hai già qualcosa, partiamo da lì. Se non hai niente, partiamo da zero.' },
    { n: '03', titolo: 'Lo costruiamo.', testo: 'Sito, prenotazioni, shop o gli strumenti che servono davvero.' },
    { n: '04', titolo: 'Lo mettiamo online.', testo: 'E da lì possiamo continuare a migliorarlo.' },
  ],
};

export const fondatore = {
  titolo: 'Dietro Satoshi Web ci sono io.',
  testo: 'Sono Edoardo, sviluppatore. Parli direttamente con chi costruisce il tuo sito.',
  alt: 'Edoardo, fondatore di Satoshi Web',
  whatsapp: 'Scrivimi su WhatsApp →',
};

export const faq = {
  titolo: 'Prima di scrivermi',
  gruppi: ['Prima', 'di scrivermi'],
  voci: [
    {
      d: 'Quanto costa?',
      r: 'Non ho un listino fisso: un sito vetrina e uno con prenotazioni o shop non sono lo stesso lavoro. Il prezzo dipende da dove parti, da cosa vuoi ottenere, dalle funzioni che servono e da quanto è complesso. Ti do una cifra precisa prima di iniziare.',
      aperta: true,
    },
    { d: 'Quanto ci vuole?', r: 'Dipende dal progetto: un sito semplice è più rapido, uno con prenotazioni o shop richiede più tempo. Ti dico i tempi insieme al preventivo.' },
    { d: 'Non ho ancora un sito: possiamo partire da zero?', r: "Sì. Mi racconti l'attività e costruiamo quello che serve: a volte basta un sito chiaro, a volte servono prenotazioni o uno shop." },
    { d: 'Ho già un sito: devo rifarlo tutto?', r: 'Non per forza. Parto da quello che hai e ti dico, gratis, cosa terrei, cosa cambierei e cosa rifarei.' },
  ],
};

export const contatti = {
  titolo: 'Parliamo del tuo progetto.',
  sotto: 'Che tu parta da zero o da un sito che hai già. Senza impegno.',
  whatsapp: 'Scrivimi su WhatsApp',
  oppure: 'oppure lascia i tuoi dati',
  promessa: 'Ti rispondo personalmente entro 1 giorno lavorativo.',
  dopoTitolo: 'Cosa succede dopo',
  dopo: [
    "Leggo cosa mi hai scritto e guardo quello che hai già online, se c'è.",
    'Ti scrivo io su WhatsApp. Ti rispondo personalmente entro 1 giorno lavorativo.',
    'Decidi tu se andare avanti.',
  ],
  form: {
    intro: "Non serve avere già un'idea chiara. Raccontami semplicemente cosa fai e cosa vorresti ottenere.",
    nome: 'Nome',
    attivita: 'Attività',
    attivitaEsempio: 'es. Bar Roma, Civitavecchia',
    telefono: 'Telefono / WhatsApp',
    dettagli: 'Aggiungi dettagli (facoltativo)',
    sito: 'Sito o Instagram, se li hai',
    nota: 'Cosa vorresti ottenere?',
    invia: 'Parliamo del tuo progetto →',
    privacyPre: 'Inviando accetti la ',
    privacyLink: 'privacy policy',
  },
};
