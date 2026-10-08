// Pagine della foundation. La home ha per ora solo l'hero (Fase 2 aggiunge le altre sezioni nell'ordine del Brief §4).
// Le pagine /lavori/ e dei casi mostrano solo i dati verificati: nessun blocco senza contenuto reale.
import { esc, t, img } from './util.mjs';
import { pagina } from './layout.mjs';
import { lavoriIndice, lavoroPerSlug } from '../dati/lavori.mjs';

function titoloHero(hero) {
  return hero.titolo
    .map((g) => {
      const parole = t(g.testo);
      return g.evidenzia ? `<span class="hl">${parole}</span>` : parole;
    })
    .join(' ');
}

export function home(ctx) {
  const { hero } = ctx;
  const corpo = `<section class="hero contenitore" id="top">
<div class="etichetta">${esc(hero.etichetta)}</div>
<h1 class="hero__titolo">${titoloHero(hero)}</h1>
<p class="hero__sotto">${t(hero.sottotitolo)}</p>
<a class="btn" id="hero-cta" href="#contatti" data-track="cta_hero">${t(hero.cta)}</a>
<a class="hero__secondaria" href="#parti" data-track="cta_secondaria">${t(hero.secondaria)}</a>
</section>
<div class="fascia-lavoro">
<div class="contenitore">
<div class="fascia-lavoro__testa"><span>${esc(hero.fascia.etichetta)}</span><span>${esc(hero.fascia.riferimento)}</span></div>
<div class="telefono">${img(ctx, 'acasamia/acm-mobile', { alt: 'Il sito di A casa mia visto dal telefono', sizes: '(min-width: 834px) 380px, 100vw', priorita: true })}</div>
</div>
</div>`;
  return pagina(ctx, {
    percorso: '/',
    titolo: 'Satoshi Web: siti web per attività e professionisti, Civitavecchia',
    descrizione:
      'Costruisco il sito giusto per la tua attività: su misura, pensato per il telefono, con prenotazioni, shop e gestione quando servono. Civitavecchia.',
    corpo,
    conBarra: true,
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: ctx.sito.nome,
      url: ctx.sito.url + '/',
      areaServed: 'Civitavecchia',
      founder: { '@type': 'Person', name: ctx.sito.titolare },
      sameAs: [ctx.sito.instagram],
    },
  });
}

export function indiceLavori(ctx) {
  const voci = lavoriIndice
    .map(
      (l) => `<li><a href="/lavori/${l.slug}/" data-track="portfolio_click">
<div class="etichetta">${esc(l.categoria)}${l.luogo ? ' · ' + esc(l.luogo) : ''}${l.stato === 'anteprima' ? ' · In anteprima' : ''}</div>
<h2>${t(l.nome)}</h2>
<p>${t(l.frase)}</p>
</a></li>`
    )
    .join('\n');
  const corpo = `<section class="testata-pagina contenitore">
<div class="etichetta">Lavori</div>
<h1>Non racconto cosa so fare. Te lo faccio vedere.</h1>
<ul class="indice-lavori">
${voci}
</ul>
</section>`;
  return pagina(ctx, {
    percorso: '/lavori/',
    titolo: 'Lavori: siti e sistemi per attività | Satoshi Web',
    descrizione: 'Sei progetti reali: un caffè, un PR, un club, un barbiere, una federazione. Cosa serviva e cosa ho costruito.',
    corpo,
  });
}

export function caso(ctx, slug) {
  const l = lavoroPerSlug(slug);
  const corpo = `<section class="testata-pagina contenitore">
<div class="etichetta">${esc(l.categoria)}${l.luogo ? ' · ' + esc(l.luogo) : ''}</div>
<h1>${t(l.nome)}</h1>
<p class="lead">${t(l.frase)}</p>
${l.stato === 'anteprima' ? '<span class="stato">In anteprima</span>' : ''}
${l.link ? `<a class="link-forte" href="${l.link.href}" rel="noopener">${esc(l.link.testo)} →</a>` : ''}
</section>
<section class="chiusura su-scuro">
<div class="contenitore">
<h2>${t('Vuoi qualcosa di simile per la tua attività?')}</h2>
<a class="btn" href="/#contatti" data-track="cta_click" data-pos="caso">${t('Parliamo del tuo progetto →')}</a>
<a class="link-forte" href="/lavori/">Tutti i lavori</a>
</div>
</section>`;
  return pagina(ctx, {
    percorso: `/lavori/${slug}/`,
    titolo: `${l.nome}: ${l.categoria.toLowerCase()} | Satoshi Web`,
    descrizione: l.frase.length > 155 ? l.frase.slice(0, 152).trimEnd() + '...' : l.frase,
    corpo,
  });
}

export function grazie(ctx) {
  const corpo = `<section class="testata-pagina contenitore">
<div class="etichetta">Richiesta ricevuta</div>
<h1>Fatto. Ora tocca a me.</h1>
<p class="lead">${t('Ti rispondo personalmente entro 1 giorno lavorativo.')}</p>
<a class="btn" href="${ctx.sito.whatsapp}" data-track="whatsapp_click" data-pos="grazie">Apri WhatsApp →</a>
</section>`;
  return pagina(ctx, {
    percorso: '/grazie/',
    titolo: 'Richiesta ricevuta | Satoshi Web',
    descrizione: 'Ho ricevuto la tua richiesta. Ti rispondo personalmente entro 1 giorno lavorativo.',
    corpo,
    noindex: true,
  });
}

export function non_trovata(ctx) {
  const corpo = `<section class="testata-pagina contenitore">
<h1>Questa pagina non esiste.</h1>
<a class="btn" href="/">Torna alla home</a>
</section>`;
  return pagina(ctx, {
    percorso: '/404.html',
    titolo: 'Pagina non trovata | Satoshi Web',
    descrizione: 'La pagina che cerchi non esiste.',
    corpo,
    noindex: true,
  });
}
