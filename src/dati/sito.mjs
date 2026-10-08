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

export const footer = {
  descrizione: 'Siti web su misura per attività e professionisti. Civitavecchia.',
  colonne: [
    [
      { href: '/lavori/', testo: 'Lavori' },
      { href: '/#processo', testo: 'Come lavoro' },
      { href: '/#contatti', testo: 'Contatti' },
    ],
    [
      { href: 'https://instagram.com/satoshidev', testo: 'Instagram' },
      { href: 'https://wa.me/393341989193', testo: 'WhatsApp' },
      { href: '/privacy/', testo: 'Privacy e cookie' },
    ],
  ],
};

export const barraFissa = {
  whatsapp: 'WhatsApp',
  cta: 'Parliamo del tuo progetto →',
};
