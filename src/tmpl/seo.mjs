// SEO: JSON-LD e testi meta. Solo dati verificati: nessuna recensione, nessun prezzo, nessun AggregateRating.
// Dati dell'attività presi dal JSON-LD che Edoardo ha già pubblicato sul sito attuale (telefono, indirizzo, zona servita, Instagram).
import { lavoriIndice } from '../dati/lavori.mjs';

export const titoloHome = 'Satoshi Web: siti web per attività e professionisti';
export const descrizioneHome =
  'Costruisco il sito giusto per la tua attività: su misura, pensato per il telefono, con prenotazioni, shop e gestione quando servono. Studio a Civitavecchia.';
export const titoloLavori = 'Lavori: siti e sistemi per attività | Satoshi Web';
export const descrizioneLavori =
  'Sei progetti reali: un caffè, un PR, un club, un barbiere, una federazione. Cosa serviva e cosa ho costruito.';

const url = (ctx, p) => ctx.sito.url + p;

export function organizzazione(ctx) {
  const s = ctx.sito;
  return {
    '@type': 'ProfessionalService',
    '@id': url(ctx, '/#studio'),
    name: s.nome,
    url: url(ctx, '/'),
    telephone: '+39 334 198 9193',
    email: s.email,
    logo: url(ctx, '/apple-touch-icon.png'),
    image: ctx.og && ctx.og.home ? url(ctx, ctx.og.home) : undefined,
    address: { '@type': 'PostalAddress', addressLocality: 'Civitavecchia', addressRegion: 'RM', postalCode: '00053', addressCountry: 'IT' },
    areaServed: [
      { '@type': 'City', name: 'Civitavecchia' },
      { '@type': 'City', name: 'Roma' },
      { '@type': 'State', name: 'Lazio' },
      { '@type': 'Country', name: 'Italia' },
    ],
    founder: { '@type': 'Person', name: s.titolare },
    sameAs: [s.instagram],
  };
}

export const jsonldHome = (ctx) => ({
  '@context': 'https://schema.org',
  '@graph': [
    organizzazione(ctx),
    { '@type': 'WebSite', '@id': url(ctx, '/#sito'), url: url(ctx, '/'), name: ctx.sito.nome, inLanguage: 'it-IT', publisher: { '@id': url(ctx, '/#studio') } },
  ],
});

const briciole = (ctx, voci) => ({
  '@type': 'BreadcrumbList',
  itemListElement: voci.map((v, i) => ({ '@type': 'ListItem', position: i + 1, name: v[0], item: url(ctx, v[1]) })),
});

export const jsonldLavori = (ctx) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      url: url(ctx, '/lavori/'),
      name: 'Lavori',
      inLanguage: 'it-IT',
      isPartOf: { '@id': url(ctx, '/#sito') },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: lavoriIndice.map((l, i) => ({ '@type': 'ListItem', position: i + 1, name: l.nome, url: url(ctx, `/lavori/${l.slug}/`) })),
      },
    },
    briciole(ctx, [['Home', '/'], ['Lavori', '/lavori/']]),
  ],
});

export const jsonldCaso = (ctx, l, descrizione) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CreativeWork',
      url: url(ctx, `/lavori/${l.slug}/`),
      name: l.nome,
      description: descrizione,
      inLanguage: 'it-IT',
      creator: { '@id': url(ctx, '/#studio') },
      image: ctx.og && ctx.og[l.slug] ? url(ctx, ctx.og[l.slug]) : undefined,
      isPartOf: { '@id': url(ctx, '/#sito') },
    },
    briciole(ctx, [['Home', '/'], ['Lavori', '/lavori/'], [l.nome, `/lavori/${l.slug}/`]]),
  ],
});
