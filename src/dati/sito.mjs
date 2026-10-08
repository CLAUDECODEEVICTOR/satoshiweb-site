// Fonte unica dei testi comuni. Copy dal Master Build Brief e dalla V3.1: non riscrivere qui.
// Nessun trattino lungo, nessun segnaposto: il build fallisce se ne trova.

export const sito = {
  url: 'https://satoshiweb.it',
  nome: 'Satoshi Web',
  lingua: 'it',
  whatsapp: 'https://wa.me/393341989193',
  instagram: 'https://instagram.com/satoshidev',
  email: 'info@satoshiweb.it',
  piva: '18523731000',
  titolare: 'Edoardo De Benedictis',
  anno: 2026,
  gaId: 'G-1DDL4FX44N',
  formAction: 'https://formspree.io/f/mqedwdeo',
  tracking: {
    // Endpoint già in uso sul sito attuale (Victor Analytics).
    beacon: 'https://victoranalytics-live.vercel.app/api/track',
    script: 'https://victoranalytics-live.vercel.app/t.js',
    sito: 'satoshiweb',
  },
};

export const nav = [
  { href: '/lavori/', testo: 'Lavori' },
  { href: '/#processo', testo: 'Come lavoro' },
  { href: '/#contatti', testo: 'Contatti' },
];

export const hero = {
  etichetta: 'Siti web per attività e professionisti',
  // Gruppi che non si spezzano; l'evidenziatore ambra sta su "il sito giusto".
  titolo: [
    { testo: 'Costruisco' },
    { testo: 'il sito giusto', evidenzia: true },
    { testo: 'per la tua attività.' },
  ],
  sottotitolo: 'Su misura e pensato per il telefono. Quando serve, collegato a prenotazioni, vendite e gestione.',
  cta: 'Parliamo del tuo progetto →',
  secondaria: 'Hai già un sito? Ti dico cosa migliorerei, gratis',
  fascia: { etichetta: 'Un mio lavoro', riferimento: 'A casa mia · Civitavecchia' },
};

export const footer = {
  descrizione: 'Siti web su misura per attività e professionisti. Civitavecchia.',
  link: [
    { href: '/lavori/', testo: 'Lavori' },
    { href: 'https://instagram.com/satoshidev', testo: 'Instagram' },
    { href: '/#processo', testo: 'Come lavoro' },
    { href: 'https://wa.me/393341989193', testo: 'WhatsApp' },
    { href: '/#contatti', testo: 'Contatti' },
    { href: '/privacy/', testo: 'Privacy e cookie' },
  ],
};

export const barraFissa = {
  whatsapp: 'WhatsApp',
  cta: 'Parliamo del tuo progetto →',
};
