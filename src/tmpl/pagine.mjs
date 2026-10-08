// Pagine della foundation. La home ha per ora solo l'hero (Fase 2 aggiunge le altre sezioni nell'ordine del Brief §4).
// Le pagine /lavori/ e dei casi mostrano solo i dati verificati: nessun blocco senza contenuto reale.
import { esc, t, img } from './util.mjs';
import { sezioneHero, sezioneDaDoveParti, sezioneLavori, sezioneCapacita, sezioneProcesso, sezioneFondatore, sezioneFaq, sezioneContatti } from './sezioni.mjs';
import { pagina } from './layout.mjs';
import { lavoriIndice } from '../dati/lavori.mjs';
import { titoloHome, descrizioneHome, titoloLavori, descrizioneLavori, jsonldHome, jsonldLavori } from './seo.mjs';

export function home(ctx) {
  const corpo = [
    sezioneHero(ctx),
    sezioneDaDoveParti(),
    sezioneLavori(ctx),
    sezioneCapacita(ctx),
    sezioneProcesso(),
    sezioneFondatore(ctx),
    sezioneFaq(),
    sezioneContatti(ctx),
  ].join('\n');
  return pagina(ctx, {
    percorso: '/',
    titolo: titoloHome,
    descrizione: descrizioneHome,
    og: { immagine: ctx.og.home, alt: 'Satoshi Web: costruisco il sito giusto per la tua attività' },
    corpo,
    conBarra: true,
    jsonld: jsonldHome(ctx),
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
    titolo: titoloLavori,
    descrizione: descrizioneLavori,
    og: { immagine: ctx.og.home, alt: 'Satoshi Web: i lavori' },
    corpo,
    jsonld: jsonldLavori(ctx),
  });
}

export function grazie(ctx) {
  const passi = [
    ['Leggo cosa mi hai scritto.', "Guardo anche quello che hai già online, se c'è."],
    ['Ti scrivo su WhatsApp.', 'Ti rispondo personalmente entro 1 giorno lavorativo.'],
    ['Decidi tu.', 'Se andare avanti o no.'],
  ];
  const corpo = `<section class="grazie-testa">
<div class="contenitore grazie">
<div class="etichetta">Richiesta ricevuta</div>
<h1 id="grazie-titolo">${t('Fatto. Ora tocca a me.')}</h1>
<p><span id="grazie-attivita">${t('Ho ricevuto la tua richiesta. Ti scrivo io al numero che mi hai lasciato.')}</span> ${t('Ti rispondo personalmente entro 1 giorno lavorativo.')}</p>
</div>
</section>
<section class="grazie-blocco">
<div class="contenitore grazie">
<h2 class="grazie-etichetta">Cosa succede ora</h2>
<ol class="grazie-passi">
${passi.map((x, i) => `<li><span class="grazie-passi__n">0${i + 1}</span><span><strong>${t(x[0])}</strong> ${t(x[1])}</span></li>`).join('\n')}
</ol>
</div>
</section>
<section class="grazie-blocco">
<div class="contenitore grazie">
<h2 class="grazie-titolo2">Vuoi fare prima?</h2>
<p>${t('Scrivimi adesso e mandami il link del sito o due foto del locale.')}</p>
<a class="btn" href="${ctx.sito.whatsapp}" data-track="whatsapp_click" data-pos="grazie">Apri WhatsApp →</a>
</div>
</section>
<section class="grazie-blocco grazie-ultimo">
<div class="contenitore grazie">
<div class="grazie-chi">
${img(ctx, 'fondatore/edoardo-crop', { alt: 'Edoardo, fondatore di Satoshi Web', sizes: '64px' })}
<div><strong>Ti risponde Edoardo.</strong><br><span>Una persona, non un call center.</span></div>
</div>
<h2 class="grazie-etichetta">Nel frattempo</h2>
<a class="grazie-lavoro" href="/lavori/a-casa-mia/" data-track="portfolio_click">
<span class="grazie-lavoro__img">${img(ctx, 'acasamia/acm-mobile', { alt: '', sizes: '84px' })}</span>
<span><strong>${t('Guarda come ho costruito A casa mia')}</strong><br><span>${t('Caffè e brunch a Civitavecchia →')}</span></span>
</a>
</div>
</section>`;
  return pagina(ctx, {
    percorso: '/grazie/',
    titolo: 'Richiesta ricevuta | Satoshi Web',
    descrizione: 'Ho ricevuto la tua richiesta. Ti rispondo personalmente entro 1 giorno lavorativo.',
    corpo,
    noindex: true,
    testataSemplice: true,
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
