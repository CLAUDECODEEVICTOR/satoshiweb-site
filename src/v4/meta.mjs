// Titoli, descrizioni e dati strutturati delle pagine. Il testo visibile sta nei file di src/v4/pagine/.
export const SITO = 'https://satoshiweb.it';

export const pagine = [
  {
    file: 'home', url: '/',
    titolo: 'Satoshi Web · Siti web su misura a Civitavecchia e Roma',
    descrizione: 'Sito web e strumenti su misura per la tua attività: prenotazioni, pannello di gestione e supporto anche dopo. Da Civitavecchia, per Roma e tutta Italia.',
    ogTitolo: 'Satoshi Web · Sito web e strumenti utili su misura',
    ogDescrizione: 'Sito, prenotazioni e il pannello per gestire tutto. Da Civitavecchia, per attività a Roma e in tutta Italia.',
    jsonld: true,
  },
  { file: 'luca-california', url: '/lavori/luca-california', titolo: 'Luca California · Sito e webapp per le serate | Satoshi Web',
    descrizione: 'Un sito per scegliere la serata e inviare la richiesta, e una webapp per gestirle dal telefono. Il lavoro realizzato per Luca California.' },
  { file: 'a-casa-mia', url: '/lavori/a-casa-mia', titolo: 'A casa mia · Sito bilingue per un locale | Satoshi Web',
    descrizione: 'Un sito in italiano e inglese per un locale di Civitavecchia, con orari, contatti e indicazioni per arrivare. Il lavoro realizzato per A casa mia.' },
  { file: 'antitesi', url: '/lavori/antitesi', titolo: 'Antitesi · Pagina personale e pannello | Satoshi Web',
    descrizione: 'Una pagina personale con date, tracce e link, e un pannello per aggiornarla dal telefono. Il lavoro realizzato per il DJ e producer Antitesi.' },
  { file: 'milano-clubs-reservation', url: '/lavori/milano-clubs-reservation', titolo: 'Milano Clubs Reservation · Sito e richieste | Satoshi Web',
    descrizione: 'Un sito con le serate per data e club, un modulo di richiesta e un pannello per gestirle. Il lavoro realizzato per Milano Clubs Reservation.' },
  { file: 'taiko', url: '/lavori/taiko', titolo: 'Taiko · Sito e gestione di un format house | Satoshi Web',
    descrizione: 'Direzione visiva, sito in inglese con le prossime serate e una webapp per lo staff. Il progetto Taiko, presentato in anteprima.' },
  { file: 'ikta', url: '/lavori/ikta', titolo: 'IKTA · Sito di una federazione internazionale | Satoshi Web',
    descrizione: 'Il sito ufficiale di IKTA, federazione internazionale di sport da combattimento: discipline, palestre affiliate, corsi, gare ed eventi.' },
  { file: 'privacy', url: '/privacy', titolo: 'Privacy e cookie policy | Satoshi Web',
    descrizione: 'Come tratto i dati personali raccolti tramite il sito satoshiweb.it, quali cookie uso e quali diritti hai.' },
  { file: 'grazie', url: '/grazie', titolo: 'Richiesta ricevuta | Satoshi Web',
    descrizione: 'Ho ricevuto la tua richiesta. Ti rispondo entro 1 giorno lavorativo, di persona.', noindex: true },
  { file: '404', url: '/404', titolo: 'Pagina non trovata | Satoshi Web',
    descrizione: 'Questa pagina non esiste. Torna alla home di Satoshi Web oppure guarda i lavori realizzati.', noindex: true, nonInMappa: true },
];

export const jsonldHome = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://satoshiweb.it/#business',
  name: 'Satoshi Web',
  url: 'https://satoshiweb.it/',
  logo: 'https://satoshiweb.it/icon-512.png',
  image: 'https://satoshiweb.it/og-image.jpg',
  description: 'Siti web e strumenti su misura per attività: prenotazioni, pannelli di gestione e supporto dopo la pubblicazione.',
  founder: { '@type': 'Person', name: 'Edoardo De Benedictis' },
  telephone: '+39 334 198 9193',
  email: 'info@satoshiweb.it',
  vatID: 'IT18523731000',
  address: { '@type': 'PostalAddress', addressLocality: 'Civitavecchia', addressRegion: 'RM', addressCountry: 'IT' },
  areaServed: [{ '@type': 'City', name: 'Civitavecchia' }, { '@type': 'City', name: 'Roma' }, { '@type': 'Country', name: 'Italia' }],
  sameAs: ['https://www.instagram.com/satoshidev', 'https://maps.app.goo.gl/2HmMVit1KB2Ns4z69'],
};
