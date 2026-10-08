// Pagina del case study. Un solo template, sei record in src/dati/casi.mjs.
// Struttura V3.1 (tavola 10): testata, fascia ambra con il lavoro, blocchi numerati, chiusura scura.
// I blocchi senza contenuto verificato non esistono: niente segnaposto.
import { esc, t, img } from './util.mjs';
import { pagina } from './layout.mjs';
import { lavoriIndice, lavoroPerSlug } from '../dati/lavori.mjs';
import { casi } from '../dati/casi.mjs';
import { jsonldCaso } from './seo.mjs';

const num = (i) => String(i + 1).padStart(2, '0');
const pos = (p) => (p === undefined ? '' : ` style="object-position: 50% ${p}%"`);
const conPos = (tag, p) => (p === undefined ? tag : tag.replace('<img ', `<img style="object-position: 50% ${p}%" `));
const didascalia = (d) => (d ? `<figcaption>${t(d)}</figcaption>` : '');

function fascia(ctx, f) {
  const tel = f.telefono;
  const sch = f.schermo;
  const tipo = tel && sch ? 'doppio' : tel ? 'telefono' : 'schermo';
  const schermo = sch
    ? `<div class="caso-schermo">${img(ctx, sch.img, { alt: sch.alt, sizes: '(min-width: 1200px) 760px, (min-width: 834px) 770px, 350px', priorita: tipo !== 'telefono' && !tel })}</div>`
    : '';
  const telefono = tel
    ? `<div class="caso-telefono">${conPos(img(ctx, tel.img, { alt: tel.alt, sizes: '(min-width: 1200px) 230px, 350px', priorita: true }), tel.pos)}</div>`
    : '';
  return `<div class="caso-fascia">
<div class="contenitore">
<div class="caso-fascia__visual caso-fascia__visual--${tipo}">
${schermo}
${telefono}
</div>
</div>
</div>`;
}

function visual(ctx, v) {
  if (!v) return '';
  const cap = didascalia(v.didascalia);
  switch (v.tipo) {
    case 'tile':
      return `<figure class="caso-tile"><div class="caso-tile__cornice">${conPos(img(ctx, v.img, { alt: v.alt, sizes: '(min-width: 834px) 280px, 350px' }), v.pos)}</div>${cap}</figure>`;
    case 'coppia':
      return `<figure class="caso-coppia" style="--aspect: ${v.aspect || '170 / 262'}">
${v.items.map((i) => `<div class="caso-tile__cornice">${conPos(img(ctx, i.img, { alt: i.alt, sizes: '(min-width: 834px) 240px, 170px' }), i.pos)}</div>`).join('\n')}
${cap}</figure>`;
    case 'schermo':
      return `<figure class="caso-schermi">
${v.items.map((i) => `<div class="caso-schermi__img">${img(ctx, i.img, { alt: i.alt, sizes: '(min-width: 1200px) 640px, (min-width: 834px) 460px, 350px' })}</div>`).join('\n')}
${cap}</figure>`;
    case 'barra':
      return `<figure class="caso-barra">${img(ctx, v.img, { alt: v.alt, sizes: '350px' })}</figure>`;
    case 'foto':
      return `<figure class="caso-foto"><div>${conPos(img(ctx, v.img, { alt: v.alt, sizes: '(min-width: 834px) 460px, 350px' }), v.pos)}</div></figure>`;
    default:
      return '';
  }
}

function blocco(ctx, b, i) {
  const testo = (b.testo || []).map((p) => `<p>${t(p)}</p>`).join('\n');
  const elenco = b.elenco ? `<ul class="caso-elenco">${b.elenco.map((x) => `<li>${t(x)}</li>`).join('')}</ul>` : '';
  const vis = visual(ctx, b.visual);
  return `<section class="caso-blocco">
<div class="contenitore">
<div class="caso-blocco__riga${vis ? '' : ' caso-blocco__riga--solo'}">
<div class="caso-blocco__testo">
<h2 class="caso-n">${num(i)} · ${t(b.titolo, { vedova: false })}</h2>
${testo}
${elenco}
</div>
${vis ? `<div class="caso-blocco__visual">${vis}</div>` : ''}
</div>
</div>
</section>`;
}

export function caso(ctx, slug) {
  const l = lavoroPerSlug(slug);
  const c = casi[slug];
  const blocchi = c.blocchi.map((b, i) => blocco(ctx, b, i));
  if (c.oggi) {
    const link = l.link ? `<p><a class="link-forte" href="${l.link.href}" rel="noopener" data-track="portfolio_sito">${esc(l.link.testo)} →</a></p>` : '';
    blocchi.push(`<section class="caso-blocco">
<div class="contenitore">
<div class="caso-blocco__riga caso-blocco__riga--solo">
<div class="caso-blocco__testo">
<h2 class="caso-n">${num(c.blocchi.length)} · ${esc(c.oggi.titolo || 'Oggi')}</h2>
<p>${t(c.oggi.testo)}</p>
${link}
</div>
</div>
</div>
</section>`);
  }
  const indice = lavoriIndice.findIndex((x) => x.slug === slug);
  const prossimo = lavoriIndice[indice + 1];
  const linkProssimo = prossimo
    ? `<a class="chiusura__prossimo" href="/lavori/${prossimo.slug}/" data-track="portfolio_click">Prossimo lavoro: ${esc(prossimo.nome)} →</a>`
    : `<a class="chiusura__prossimo" href="/lavori/">Tutti i lavori →</a>`;
  const corpo = `<section class="caso-testa contenitore">
<div class="etichetta">${esc(l.mestiere)}${l.luogo ? ' · ' + esc(l.luogo) : ''}</div>
<h1>${t(l.nome, { vedova: false })}</h1>
<p class="lead">${t(c.lead)}</p>
${l.stato === 'anteprima' ? '<span class="stato">In anteprima</span>' : ''}
${l.link ? `<a class="link-forte" href="${l.link.href}" rel="noopener" data-track="portfolio_sito">${esc(l.link.testo)} →</a>` : ''}
</section>
${fascia(ctx, c.fascia)}
${blocchi.join('\n')}
<section class="chiusura su-scuro">
<div class="contenitore">
<h2>${t('Vuoi qualcosa di simile per la tua attività?')}</h2>
<a class="btn" href="/#contatti" data-track="cta_click" data-pos="caso">${t('Parliamo del tuo progetto →')}</a>
<a class="btn btn--chiaro" href="${ctx.sito.whatsapp}" data-track="whatsapp_click" data-pos="caso">Scrivimi su WhatsApp</a>
${linkProssimo}
</div>
</section>`;
  return pagina(ctx, {
    percorso: `/lavori/${slug}/`,
    titolo: l.seo.titolo,
    descrizione: l.seo.descrizione,
    og: { immagine: ctx.og[slug], alt: `${l.nome}: ${l.categoria.toLowerCase()}` },
    corpo,
    testataCaso: true,
    jsonld: jsonldCaso(ctx, l, l.seo.descrizione),
  });
}
