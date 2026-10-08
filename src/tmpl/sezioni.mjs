// Sezioni della homepage, nell'ordine del Brief §4. Tutto stringhe: il testo sta nel sorgente HTML.
// Classi di visibilità (le tavole V3.1 hanno disposizioni diverse per mobile, tablet e desktop):
//   v-m  solo mobile (< 834)      v-t  solo tablet (834 a 1199)
//   v-mt mobile e tablet (< 1200) v-d  solo desktop (>= 1200)
// Le immagini nascoste con loading="lazy" non vengono scaricate.
import { esc, t, img, gruppi } from './util.mjs';
import { lavoriHome, lavoroPerSlug } from '../dati/lavori.mjs';
import { hero, daDoveParti, lavoriTesta, capacita, processo, fondatore, faq, contatti } from '../dati/home.mjs';

const iconaWhatsapp =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z"/></svg>';

const linkCaso = (l, testo) => `<a href="/lavori/${l.slug}/" data-track="portfolio_click">${testo}</a>`;
const linkEsterno = (l, extra = '') =>
  l.link ? `<a class="lavoro__link${extra ? ' ' + extra : ''}" href="${l.link.href}" rel="noopener" data-track="portfolio_sito">${esc(l.link.testo)} →</a>` : '';

// 1. HERO (header e barra fissa stanno nel layout)
export function sezioneHero(ctx) {
  const f = hero.fascia;
  const titolo = hero.titolo
    .map((g) => (g.evidenzia ? `<span class="hl">${t(g.testo)}</span>` : t(g.testo)))
    .join(' ');
  return `<section class="hero contenitore" id="top">
<div class="etichetta">${esc(hero.etichetta)}</div>
<h1 class="hero__titolo">${titolo}</h1>
<div class="hero__riga">
<p class="hero__sotto">${t(hero.sottotitolo)}</p>
<div class="hero__azioni">
<a class="btn" id="hero-cta" href="#contatti" data-track="cta_hero">${t(hero.cta)}</a>
<a class="hero__secondaria" href="#parti" data-track="cta_secondaria">${t(hero.secondaria)}</a>
</div>
</div>
</section>
<div class="fascia-lavoro">
<div class="contenitore">
<div class="fascia-lavoro__testa">
<span class="fascia-lavoro__chi">${esc(f.etichetta)}<span class="v-d"> · ${esc(f.desktop)}</span></span>
<span class="v-m">${esc(f.mobile)}</span><span class="v-t">${esc(f.tablet)}</span>
<a class="v-d" href="#lavori">${esc(f.altri)}</a>
</div>
<div class="fascia-lavoro__visual">
<div class="telefono">
<picture>
<source media="(min-width: 834px)" srcset="${ctx.immagini['acasamia/acm-desktop'].varianti.map((v) => `${v.url} ${v.w}w`).join(', ')}" sizes="(min-width: 1200px) 760px, 770px" width="${ctx.immagini['acasamia/acm-desktop'].w}" height="${ctx.immagini['acasamia/acm-desktop'].h}">
${img(ctx, 'acasamia/acm-mobile', { alt: 'Il sito di A casa mia visto dal telefono', sizes: '100vw', priorita: true })}
</picture>
</div>
<div class="telefono-affiancato v-d">${img(ctx, 'acasamia/acm-mobile', { alt: 'Il sito di A casa mia visto dal telefono', sizes: '230px' })}</div>
</div>
</div>
</div>`;
}

// 2. DA DOVE PARTI?
export function sezioneDaDoveParti() {
  return `<section class="parti su-scuro" id="parti">
<div class="contenitore parti__riga">
<h2>${t(daDoveParti.titolo)}</h2>
${daDoveParti.percorsi
  .map(
    (p) => `<div class="percorso">
<h3>${t(p.titolo)}</h3>
<p>${t(p.testo)}</p>
<a href="#contatti" data-track="percorso_click">${t(p.link)}</a>
</div>`
  )
  .join('\n')}
</div>
</section>`;
}

// 3. LAVORI: i quattro della homepage, nell'ordine approvato (Q2)
function testaScheda(l, destra) {
  return `<div class="lavoro__testa"><span>${esc(l.scheda.etichetta)}</span>${destra ? `<span>${esc(destra)}</span>` : ''}</div>`;
}
const nomeScheda = (l) => `<h3 class="lavoro__nome">${linkCaso(l, t(l.nome))}</h3>`;

function schedaLuca(ctx, l) {
  const s = l.scheda;
  return `<article class="lavoro lavoro--sistema" id="lavoro-${l.slug}">
${testaScheda(l, l.luogo)}
${nomeScheda(l)}
<div class="lavoro__mestiere">${t(l.mestiere)}</div>
<p class="lavoro__frase">${t(s.frase)}</p>
<div class="luca__visual">
<div class="luca__coppia v-mt">
<div class="tile tile--hero">${img(ctx, 'luca/luca-m-hero', { alt: 'Sito di Luca California dal telefono: scegli la serata, prenota tavolo, bracciale o lista', sizes: '(min-width: 834px) 240px, 170px' })}</div>
<div class="tile">${img(ctx, 'luca/luca-m-serate', { alt: 'Elenco delle serate sul sito di Luca California', sizes: '(min-width: 834px) 240px, 170px' })}</div>
</div>
<div class="luca__coppia luca__coppia--d v-d">
<div class="tile tile--schermo">${img(ctx, 'luca/luca-d-serate', { alt: 'Le serate sul sito di Luca California, vista computer', sizes: '560px' })}</div>
<div class="tile tile--hero">${img(ctx, 'luca/luca-m-hero', { alt: 'Sito di Luca California dal telefono: prenota tavolo, bracciale o lista', sizes: '190px' })}</div>
</div>
</div>
<dl class="prima-ora">
<div><dt>Prima</dt><dd>${t(s.prima)}</dd></div>
<div><dt>Ora</dt><dd>${t(s.ora)}</dd></div>
</dl>
<figure class="pannello">
<div class="pannello__cornice">${img(ctx, 'luca/pannello-richieste', { alt: 'Pannello delle richieste di Luca California: elenco delle richieste nuove con tavolo, sala e budget', sizes: '(min-width: 1200px) 520px, 350px' })}</div>
<figcaption>${t(s.didascaliaPannello)}</figcaption>
</figure>
${linkEsterno(l)}
</article>`;
}

function schedaCasaMia(ctx, l) {
  const s = l.scheda;
  return `<article class="lavoro lavoro--locale" id="lavoro-${l.slug}">
${testaScheda(l, l.luogo)}
${nomeScheda(l)}
<p class="lavoro__testo v-mt">${t(s.testoMt)}</p>
<div class="locale__visual v-mt">
<div class="locale__crop">${img(ctx, 'acasamia/acm-m-orari-crop', { alt: 'Orari del sito A casa mia, con il giorno di oggi in evidenza', sizes: '350px' })}</div>
${img(ctx, 'acasamia/acm-m-bar', { alt: 'Barra fissa con Chiama, WhatsApp e Indicazioni', sizes: '350px' })}
</div>
<p class="locale__punti v-mt"><strong>${t('Italiano e inglese.')}</strong> <strong>${t('Oggi in evidenza')}</strong> ${t('negli orari.')} <strong>${t('Chiama, WhatsApp e indicazioni')}</strong> ${t('sempre in basso.')}</p>
<div class="locale__visual locale__visual--d v-d">${img(ctx, 'acasamia/acm-d-orari', { alt: 'Orari e mappa del sito A casa mia su computer', sizes: '380px' })}</div>
<p class="lavoro__testo v-d">${t(s.testoD)}</p>
${linkEsterno(l)}
</article>`;
}

function schedaTaiko(ctx, l) {
  const s = l.scheda;
  return `<article class="lavoro lavoro--design" id="lavoro-${l.slug}">
<div class="lavoro__testa"><span>${esc(s.etichetta)}</span><span>${esc(s.stato)}</span></div>
${nomeScheda(l)}
<p class="lavoro__testo v-mt">${t(s.testoMt)}</p>
<div class="design__visual">${img(ctx, 'taiko/taiko-d-hero', { alt: 'Schermata iniziale del sito Taiko su computer', sizes: '(min-width: 1200px) 380px, (min-width: 834px) 380px, 350px' })}</div>
<div class="design__riga v-m">
<div class="tile tile--dettaglio">${img(ctx, 'taiko/taiko-m-001', { alt: 'Dettaglio tipografico della pagina evento Taiko 001', sizes: '170px' })}</div>
<p>${t(s.testoLato)}</p>
</div>
<p class="design__lato v-t">${t(s.testoLato)}</p>
<p class="lavoro__testo v-d">${t(s.testoD)}</p>
${linkEsterno(l)}
</article>`;
}

function schedaLazzi(ctx, l) {
  const s = l.scheda;
  return `<article class="lavoro lavoro--shop" id="lavoro-${l.slug}">
<div class="shop__corpo">
${testaScheda(l, s.destra)}
${nomeScheda(l)}
<p class="lavoro__testo v-mt">${t(s.testo)}</p>
${linkEsterno(l, 'v-t')}
</div>
<div class="shop__visual">${img(ctx, 'lazzi/vetrina', { alt: 'Lo shop online di Lazzi Barbershop su computer: vetrina con i prodotti', sizes: '(min-width: 1200px) 380px, (min-width: 834px) 440px, 350px' })}</div>
<div class="design__riga v-m">
<div class="tile tile--dettaglio tile--pannello">${img(ctx, 'lazzi/pannello-ordini', { alt: 'Pannello di gestione degli ordini di Lazzi Barbershop: ordini del giorno, prodotti, inventario e coupon', sizes: '170px' })}</div>
<p>${t(s.testoLato)}</p>
</div>
<p class="lavoro__testo v-d">${t(s.testo)}</p>
${linkEsterno(l, 'v-m')}${linkEsterno(l, 'v-d')}
</article>`;
}

const schede = { 'luca-california': schedaLuca, 'a-casa-mia': schedaCasaMia, taiko: schedaTaiko, lazzi: schedaLazzi };

export function sezioneLavori(ctx) {
  const [luca, ...altri] = lavoriHome;
  return `<section class="sezione lavori" id="lavori">
<div class="contenitore">
<div class="lavori__testa">
<h2>${t(lavoriTesta.titolo)}</h2>
<p>${t(lavoriTesta.sotto)}</p>
</div>
${schede[luca.slug](ctx, luca)}
<div class="lavori__griglia">
${altri.map((l) => schede[l.slug](ctx, l)).join('\n')}
</div>
</div>
</section>`;
}

// 4. COSA PUÒ FARE UN SITO
export function sezioneCapacita(ctx) {
  const voci = capacita.voci
    .map((v) => {
      const rimandi = v.rimandi.map((r) => linkCaso(lavoroPerSlug(r.slug), esc(r.testo))).join(', ');
      return `<div><dt>${t(v.titolo)}</dt><dd>${v.pre ? esc(v.pre) : ''}${rimandi}${v.post ? esc(v.post) : ''}</dd></div>`;
    })
    .join('\n');
  return `<section class="capacita" id="capacita">
<div class="contenitore capacita__griglia">
<h2>${t(capacita.titolo)}</h2>
<dl class="capacita__elenco">
${voci}
</dl>
<div class="capacita__ai">
<strong>${t(capacita.ai.titolo)}</strong>
<figure>
${img(ctx, 'ai/ai-dopo-zoom', { alt: capacita.ai.alt, sizes: '(min-width: 1200px) 480px, (min-width: 834px) 360px, 350px' }).replace('<img ', '<img aria-describedby="ai-testo" ')}
<p class="solo-sr" id="ai-testo">${esc(capacita.ai.trascrizione)}</p>
<figcaption>${t(capacita.ai.didascalia)}</figcaption>
</figure>
</div>
</div>
</section>`;
}

// 5. PROCESSO
export function sezioneProcesso() {
  return `<section class="sezione processo" id="processo">
<div class="contenitore">
<h2>${t(processo.titolo)}</h2>
<ol class="processo__passi">
${processo.passi.map((p) => `<li><span class="processo__n">${p.n}</span> <strong>${t(p.titolo)}</strong> <span>${t(p.testo)}</span></li>`).join('\n')}
</ol>
</div>
</section>`;
}

// 6. FONDATORE (foto attuale TEMPORANEA: Q5)
export function sezioneFondatore(ctx) {
  return `<section class="fondatore">
<div class="contenitore">
<div class="fondatore__riga">
${img(ctx, 'fondatore/edoardo-crop', { alt: fondatore.alt, sizes: '120px' })}
<div class="fondatore__testo">
<h2>${t(fondatore.titolo)}</h2>
<p>${t(fondatore.testo)}</p>
</div>
<a class="fondatore__wa v-d" href="${ctx.sito.whatsapp}" data-track="whatsapp_click" data-pos="fondatore">${t(fondatore.whatsapp)}</a>
</div>
</div>
</section>`;
}

// 7. FAQ: elementi nativi details/summary
export function sezioneFaq() {
  return `<section class="sezione faq">
<div class="contenitore faq__riga">
<h2>${gruppi(faq.gruppi)}</h2>
<div class="faq__elenco">
${faq.voci
  .map((v) => `<details${v.aperta ? ' open' : ''}><summary>${t(v.d)}</summary><p>${t(v.r)}</p></details>`)
  .join('\n')}
</div>
</div>
</section>`;
}

// 8. CTA + FORM. Invio con fetch a Formspree (sito.js), pagina /grazie/ dopo il successo, WhatsApp come alternativa.
export function sezioneContatti(ctx) {
  const f = contatti.form;
  const obbligatorio = '<span aria-hidden="true"> *</span><span class="solo-sr"> (obbligatorio)</span>';
  const testoCampo = (nome, extra = '') => `<span class="campo__testo">${esc(nome)}${extra}</span>`;
  const gruppo = (id, etichetta, controllo, opzioni = {}) => `<div class="campo-gruppo">
<label class="campo${opzioni.facoltativo ? ' campo--facoltativo' : ''}">${etichetta}${controllo}</label>
${opzioni.errore ? `<p class="campo__errore" id="err-${id}" hidden></p>` : ''}
</div>`;
  const dir = (id) => `id="f-${id}" aria-describedby="err-${id}"`;
  return `<section class="contatti" id="contatti">
<div class="contenitore contatti__griglia">
<h2 class="contatti__titolo">${t(contatti.titolo)}</h2>
<div class="contatti__testo">
<p class="contatti__sotto">${t(contatti.sotto)}</p>
<a class="btn" href="${ctx.sito.whatsapp}" data-track="whatsapp_click" data-pos="contatti">${iconaWhatsapp}${esc(contatti.whatsapp)}</a>
<div class="contatti__oppure v-m">${esc(contatti.oppure)}</div>
<div class="contatti__dopo">
<div class="contatti__dopo-titolo">${esc(contatti.dopoTitolo)}</div>
<ol>
${contatti.dopo.map((x) => `<li>${t(x)}</li>`).join('\n')}
</ol>
</div>
</div>
<form class="form" id="form-contatto" action="${ctx.sito.formAction}" method="POST" aria-label="Scrivimi">
<p class="form__intro">${t(f.intro)}</p>
${gruppo('nome', testoCampo(f.nome, obbligatorio), `<input ${dir('nome')} type="text" name="nome" autocomplete="name" maxlength="80" required>`, { errore: true })}
${gruppo('attivita', testoCampo(f.attivita, obbligatorio), `<input ${dir('attivita')} type="text" name="attivita" placeholder="${esc(f.attivitaEsempio)}" autocomplete="organization" maxlength="120" required>`, { errore: true })}
${gruppo('telefono', testoCampo(f.telefono, obbligatorio), `<input ${dir('telefono')} type="tel" name="telefono" inputmode="tel" autocomplete="tel" maxlength="30" required>`, { errore: true })}
<button class="dettagli__toggle" id="dettagli-toggle" type="button" aria-expanded="false" aria-controls="dettagli" hidden>${esc(f.dettagli)}</button>
<div class="dettagli" id="dettagli">
<label class="campo campo--facoltativo">${testoCampo(f.sito, '<span class="v-d"> (facoltativo)</span>')}<input type="text" name="sito" autocomplete="url" maxlength="200"></label>
<label class="campo campo--facoltativo">${testoCampo(f.nota, '<span class="v-d"> (facoltativo)</span>')}<textarea name="nota" rows="2" maxlength="1000"></textarea></label>
</div>
<input class="solo-sr" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" aria-label="Lascia vuoto">
<input type="hidden" name="_subject" value="Nuova richiesta da satoshiweb.it">
<button class="btn" type="submit" id="form-invia" data-etichetta="${esc(f.invia)}">${t(f.invia)}</button>
<div class="form__stato" id="form-stato" role="status" aria-live="polite"></div>
<p class="form__promessa">${t(contatti.promessa)}</p>
<p class="form__privacy">${esc(f.privacyPre)}<a href="/privacy/">${esc(f.privacyLink)}</a>.</p>
</form>
</div>
</section>`;
}
