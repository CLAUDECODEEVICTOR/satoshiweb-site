// Layout condiviso: <head>, header, menu, footer, barra fissa. Tutto stringhe, nessuno stato.
import { esc, t } from './util.mjs';

const iconaWhatsapp =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z"/></svg>';

function head(ctx, p) {
  const { sito, asset } = ctx;
  const url = sito.url + p.percorso;
  const indicizzabile = ctx.indicizza && !p.noindex;
  const robots = indicizzabile ? 'index, follow' : 'noindex, nofollow';
  const og = p.og || {};
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.titolo)}</title>
<meta name="description" content="${esc(p.descrizione)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#F6F3EC">
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="${esc(sito.nome)}">
<meta property="og:title" content="${esc(og.titolo || p.titolo)}">
<meta property="og:description" content="${esc(og.descrizione || p.descrizione)}">
<meta property="og:url" content="${url}">
${og.immagine ? `<meta property="og:image" content="${sito.url}${og.immagine}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="${esc(og.alt || p.titolo)}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${sito.url}${og.immagine}">` : '<meta name="twitter:card" content="summary">'}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${asset.fontPreload.map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join('\n')}
<link rel="stylesheet" href="${asset.css}">
${p.jsonld ? `<script type="application/ld+json">${JSON.stringify(p.jsonld).replace(/</g, '\\u003c')}</script>` : ''}
<script>(function(d){if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){d.classList.add('anim');setTimeout(function(){if(!d.hasAttribute('data-js'))d.classList.remove('anim')},3000)}})(document.documentElement)</script>
<script>window.SW=${JSON.stringify({ sito: sito.tracking.sito, beacon: sito.tracking.beacon })};window.SW_GA_ID=${JSON.stringify(sito.gaId)};</script>
<script src="${sito.tracking.script}" data-site="${sito.tracking.sito}" defer></script>
<script src="/consent.js" defer></script>
<script src="${asset.js}" defer></script>
</head>`;
}

function testataCaso(ctx, indietro = { href: '/lavori/', testo: '← Tutti i lavori' }) {
  const { sito } = ctx;
  return `<header class="testata testata--caso">
<div class="contenitore testata__riga">
<a class="marchio" href="/" aria-label="${esc(sito.nome)}, home"><img src="/img/satoshi-mark.svg" alt="" width="26" height="28"><span class="marchio__nome">${esc(sito.nome)}</span></a>
${indietro ? `<a class="testata__indietro" href="${indietro.href}">${esc(indietro.testo)}</a>` : ''}
</div>
</header>`;
}

function testata(ctx) {
  const { sito, navLinea, navMenu } = ctx;
  const voci = navLinea
    .map((v) =>
      v.whatsapp
        ? `<a href="${sito.whatsapp}" data-track="whatsapp_click" data-pos="header">${t(v.testo)}</a>`
        : `<a${v.solo === 'd' ? ' class="v-d"' : ''} href="${v.href}">${t(v.testo)}</a>`
    )
    .join('');
  return `<header class="testata">
<div class="contenitore testata__riga">
<a class="marchio" href="/" aria-label="${esc(sito.nome)}, home"><img src="/img/satoshi-mark.svg" alt="" width="26" height="28"><span class="marchio__nome">${esc(sito.nome)}</span></a>
<nav class="nav-linea" aria-label="Principale">${voci}<a class="nav-linea__cta" href="/#contatti" data-track="cta_click" data-pos="header">${t(ctx.barraFissa.cta)}</a></nav>
<button class="btn-menu" id="apri-menu" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
</div>
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
<div class="menu__testa"><a class="marchio" href="/" aria-label="${esc(sito.nome)}, home"><img src="/img/satoshi-mark.svg" alt="" width="26" height="28"><span class="marchio__nome">${esc(sito.nome)}</span></a>
<button class="btn-menu" id="chiudi-menu" type="button" aria-label="Chiudi il menu" aria-expanded="true"><span></span><span></span></button></div>
<ul class="menu__voci">${navMenu.map((v) => `<li><a href="${v.href}">${t(v.testo)}</a></li>`).join('')}</ul>
<div class="menu__contatto"><a class="btn" href="${sito.whatsapp}" data-track="whatsapp_click" data-pos="menu">${iconaWhatsapp}Scrivimi su WhatsApp</a></div>
</div>`;
}

function pie(ctx) {
  const { sito, footer } = ctx;
  return `<footer class="pie">
<div class="contenitore pie__griglia">
<div class="pie__chi">
<div class="pie__marchio"><img src="/img/satoshi-mark.svg" alt="" width="24" height="26" loading="lazy"><span class="pie__nome">${esc(sito.nome)}</span></div>
<p class="pie__desc">${t(footer.descrizione)}</p>
</div>
${footer.colonne.map((c, i) => `<nav class="pie__nav" aria-label="Footer ${i + 1}">${c.map((l) => `<a href="${l.href}">${t(l.testo)}</a>`).join('')}</nav>`).join('\n')}
<p class="pie__legale">© ${sito.anno} ${esc(sito.nome)} · ${esc(sito.titolare)} · P.IVA&nbsp;${esc(sito.piva)}</p>
</div>
</footer>`;
}

function barra(ctx) {
  const { sito, barraFissa } = ctx;
  return `<div class="barra" id="barra" data-visibile="false">
<a class="barra__wa" href="${sito.whatsapp}" aria-label="Scrivimi su WhatsApp" data-track="whatsapp_click" data-pos="barra">${iconaWhatsapp}${esc(barraFissa.whatsapp)}</a>
<a class="barra__cta" href="/#contatti" data-track="cta_click" data-pos="barra">${t(barraFissa.cta)}</a>
</div>`;
}

// p: { percorso, titolo, descrizione, og, noindex, corpo, conBarra, jsonld }
export function pagina(ctx, p) {
  return `<!doctype html>
<html lang="${ctx.sito.lingua}">
${head(ctx, p)}
<body${p.conBarra ? ' class="con-barra"' : ''}>
<a class="salta" href="#principale">Vai al contenuto</a>
${p.testataCaso ? testataCaso(ctx) : p.testataSemplice ? testataCaso(ctx, p.indietro || null) : testata(ctx)}
<main id="principale">
${p.corpo}
</main>
${pie(ctx)}
${p.conBarra ? barra(ctx) : ''}
</body>
</html>
`;
}
