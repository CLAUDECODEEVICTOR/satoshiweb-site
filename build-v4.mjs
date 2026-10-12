#!/usr/bin/env node
// Build del redesign "Direzione 2 · Di persona": legge src/v4/ (e src/font/ per Satoshi), scrive public/.
// Solo Node, nessuna dipendenza. Il contenuto è già nell'HTML sorgente: nessuna pagina si disegna col JavaScript.
//
//   node build-v4.mjs            compone il sito in public/
//   SW_INDICIZZA=1               solo al lancio: toglie noindex e apre robots.txt
//   SW_CF_TOKEN=...              token di Cloudflare Web Analytics (senza, lo script non viene inserito)
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { legaParole } from './src/lib/lega-parole.mjs';
import { pagine, jsonldHome, SITO } from './src/v4/meta.mjs';
import { privacy } from './src/v4/privacy.mjs';

const RADICE = path.dirname(fileURLToPath(import.meta.url));
const V4 = path.join(RADICE, 'src/v4');
const OUT = path.join(RADICE, 'public');
const INDICIZZA = process.env.SW_INDICIZZA === '1';
const CF_TOKEN = process.env.SW_CF_TOKEN || '';

// Pagine e cartelle del sito attuale che restano raggiungibili (allowlist esplicita, come nel build precedente).
const LEGACY_CARTELLE = ['realizzazione-siti-web-civitavecchia', 'sviluppo-app-civitavecchia', 'chatbot-whatsapp', 'farsi-trovare-dalle-ai'];
const LEGACY_FILE = ['consent.js', 'widows.js', 'favicon.png', 'pannello.html', 'og-image.png', 'logo/satoshidev-removebg-preview.ico'];

const hash = (buf) => createHash('sha1').update(buf).digest('hex').slice(0, 8);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const scrivi = (rel, contenuto) => {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contenuto);
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 1. Legacy copiato tale e quale. I file del nuovo sito (favicon, og-image) vengono scritti dopo e prevalgono.
for (const c of LEGACY_CARTELLE) fs.cpSync(path.join(RADICE, c), path.join(OUT, c), { recursive: true });
for (const f of LEGACY_FILE) {
  fs.mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true });
  fs.copyFileSync(path.join(RADICE, f), path.join(OUT, f));
}
for (const f of fs.readdirSync(path.join(V4, 'public'))) fs.copyFileSync(path.join(V4, 'public', f), path.join(OUT, f));

// 2. Font. Satoshi 700 è il file ufficiale non modificato, tenuto fuori da git (licenza ITF FFL: niente subsetting né
// ridistribuzione): sta in src/font/ e arriva a Vercel con il deploy da cartella. Gli altri sono in src/v4/font/.
const FAMIGLIE = { satoshi: 'Satoshi', 'hanken-grotesk': 'Hanken Grotesk', 'geist-mono': 'Geist Mono' };
const PRELOAD = new Set(['satoshi-700', 'hanken-grotesk-400']);
const fontFile = [
  ...fs.readdirSync(path.join(V4, 'font')).map((f) => path.join(V4, 'font', f)),
  ...['satoshi-700.woff2'].map((f) => path.join(RADICE, 'src/font', f)).filter((f) => fs.existsSync(f)),
];
let cssFont = '';
const fontPreload = [];
for (const file of fontFile.filter((x) => x.endsWith('.woff2'))) {
  const base = path.basename(file, '.woff2');
  const m = /^(.*)-(\d{3})$/.exec(base);
  if (!m || !FAMIGLIE[m[1]]) continue;
  const buf = fs.readFileSync(file);
  const nome = `/font/${base}.${hash(buf)}.woff2`;
  scrivi(nome.slice(1), buf);
  cssFont += `@font-face{font-family:"${FAMIGLIE[m[1]]}";font-weight:${m[2]};font-style:normal;font-display:swap;src:url(${nome}) format("woff2")}\n`;
  if (PRELOAD.has(base)) fontPreload.push(nome);
}
for (const f of Object.values(FAMIGLIE)) if (!cssFont.includes(`"${f}"`)) console.warn(`ATTENZIONE: font "${f}" assente, uso il fallback di sistema.`);

// 3. CSS e JS con hash nel nome.
const minCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
const css = minCss(cssFont + ['base.css', 'pagine.css', 'extra.css'].map((f) => fs.readFileSync(path.join(V4, f), 'utf8')).join('\n'));
const cssNome = `/css/sito.${hash(css)}.css`;
scrivi(cssNome.slice(1), css);
const js = fs.readFileSync(path.join(V4, 'sito.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s+/gm, '').replace(/\n+/g, '\n');
const jsNome = `/js/sito.${hash(js)}.js`;
scrivi(jsNome.slice(1), js);

// 4. Immagini già preparate (scripts/immagini-v4.py): AVIF + WebP in due larghezze.
for (const f of fs.readdirSync(path.join(V4, 'img')).filter((x) => x !== 'manifest.json')) scrivi(`img/${f}`, fs.readFileSync(path.join(V4, 'img', f)));

// 5. Testo: spazi indivisibili sulle parole brevi (tipografia-web), solo nei nodi di testo del corpo.
function legaHtml(html, vedova = false) {
  let fuori = 0; // dentro <script>, <style>, <svg>, <textarea>
  return html
    .split(/(<[^>]+>)/)
    .map((pezzo) => {
      if (pezzo.startsWith('<')) {
        if (/^<(script|style|svg|textarea)\b/i.test(pezzo)) fuori++;
        else if (/^<\/(script|style|svg|textarea)\b/i.test(pezzo)) fuori--;
        return pezzo;
      }
      return fuori > 0 || !pezzo.trim() ? pezzo : legaParole(pezzo, { vedova });
    })
    .join('');
}

// 6. Privacy: struttura del design, testo della bozza in src/v4/privacy.mjs (non certificata legalmente).
function corpoPrivacy(frammento) {
  const cls = (re) => (re.exec(frammento) || [])[1] || '';
  const sez = cls(/<section class="([^"]+)"><h2/);
  const h2 = cls(/<section class="[^"]+"><h2 class="([^"]+)"/);
  const div = cls(/<\/h2><div class="([^"]+)"/);
  const blocco = (b) => {
    const lead = b.b ? `<strong>${esc(b.b)}</strong> ` : '';
    if (b.p !== undefined) return `<p class="leg-p">${lead}${esc(b.p)}</p>`;
    if (b.lista) return `<ul class="leg-lista">${b.lista.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (b.elenco) return `<dl class="leg-elenco">${b.elenco.map((r) => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>`;
    if (b.tabella) {
      const tb = b.tabella;
      return `<div class="leg-tab"><table><thead><tr>${tb.intestazione.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${tb.righe
        .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`)
        .join('')}</tbody></table></div>`;
    }
    return '';
  };
  const sezioni = privacy.sezioni.map((s) => `<section class="${sez}"><h2 class="${h2}">${esc(s.titolo)}</h2><div class="${div}">${s.blocchi.map(blocco).join('')}</div></section>`).join('\n');
  // dal blocco "Segnaposto" (incluso) fino alla chiusura di <main>: sostituito da lead, data e sezioni
  const iniz = frammento.indexOf('<div class="', frammento.indexOf('</h1>'));
  const fine = frammento.indexOf('</main>');
  const lead = `<p class="leg-p">${esc(privacy.lead)}</p><p class="leg-data">Ultimo aggiornamento: ${esc(privacy.aggiornamento)}</p>`;
  return frammento.slice(0, iniz) + lead + '\n' + sezioni + '\n' + frammento.slice(fine);
}

// 7. Pagine.
const analitica = CF_TOKEN ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: CF_TOKEN })}'></script>` : '';
function testa(p) {
  const url = SITO + (p.url === '/' ? '/' : p.url);
  const indicizzabile = INDICIZZA && !p.noindex;
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.titolo)}</title>
<meta name="description" content="${esc(p.descrizione)}">
<meta name="robots" content="${indicizzabile ? 'index, follow' : 'noindex, nofollow'}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
${fontPreload.map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join('\n')}
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="Satoshi Web">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.ogTitolo || p.titolo)}">
<meta property="og:description" content="${esc(p.ogDescrizione || p.descrizione)}">
<meta property="og:image" content="${SITO}/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Satoshi Web: sito e pannello di gestione su misura">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="${cssNome}">
${p.jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonldHome).replace(/</g, '\\u003c')}</script>` : ''}
<script src="${jsNome}" defer></script>
${analitica}
</head>`;
}

const STELLE = '<svg class="stelle" viewBox="0 0 120 24" width="5em" height="1em" aria-hidden="true" focusable="false"><polygon points="12.0,1.6 14.8,8.8 22.5,9.2 16.5,14.1 18.5,21.5 12.0,17.3 5.5,21.5 7.5,14.1 1.5,9.2 9.2,8.8"/><polygon points="36.0,1.6 38.8,8.8 46.5,9.2 40.5,14.1 42.5,21.5 36.0,17.3 29.5,21.5 31.5,14.1 25.5,9.2 33.2,8.8"/><polygon points="60.0,1.6 62.8,8.8 70.5,9.2 64.5,14.1 66.5,21.5 60.0,17.3 53.5,21.5 55.5,14.1 49.5,9.2 57.2,8.8"/><polygon points="84.0,1.6 86.8,8.8 94.5,9.2 88.5,14.1 90.5,21.5 84.0,17.3 77.5,21.5 79.5,14.1 73.5,9.2 81.2,8.8"/><polygon points="108.0,1.6 110.8,8.8 118.5,9.2 112.5,14.1 114.5,21.5 108.0,17.3 101.5,21.5 103.5,14.1 97.5,9.2 105.2,8.8"/></svg>';
const html = new Map(); // percorso URL -> html
for (const p of pagine) {
  let frammento = fs.readFileSync(path.join(V4, 'pagine', `${p.file}.html`), 'utf8');
  if (p.file === 'privacy') frammento = corpoPrivacy(frammento);
  // Stelle delle recensioni: grafica vettoriale con contorno scuro (il testo ★ arancione su bianco dà 2:1), arancione ufficiale invariato.
  frammento = frammento.replaceAll('★★★★★', STELLE).replaceAll(' aria-label="5 stelle su 5"', ' role="img" aria-label="5 stelle su 5"');
  frammento = legaHtml(frammento, p.file === 'privacy');
  // Link verso altri siti (non WhatsApp): si aprono in una nuova scheda, il visitatore resta sul portfolio.
  frammento = frammento.replace(/<a href="(https?:\/\/(?!wa\.me)[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
  html.set(p.url, `<!doctype html>\n<html lang="it">\n${testa(p)}\n<body${p.file === 'home' ? '' : ` class="int pg-${p.file}"`}>\n<a class="salta" href="#principale">Vai al contenuto</a>\n${frammento}\n</body>\n</html>\n`);
}
// Con cleanUrls di Vercel, /lavori/taiko è servito da lavori/taiko.html; la 404 è 404.html.
for (const [url, h] of html) scrivi(url === '/' ? 'index.html' : `${url.slice(1)}.html`, h);

// 8. robots.txt, sitemap.xml, llms.txt. Prima del lancio tutto chiuso.
scrivi('robots.txt', INDICIZZA ? `User-agent: *\nAllow: /\nDisallow: /grazie\nDisallow: /pannello\nDisallow: /api/\n\nSitemap: ${SITO}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
const inMappa = [...pagine.filter((p) => !p.noindex && !p.nonInMappa).map((p) => p.url), ...LEGACY_CARTELLE.map((c) => `/${c}/`)];
scrivi('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${inMappa.map((u) => `  <url><loc>${SITO}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
const lavori = pagine.filter((p) => p.url.startsWith('/lavori/'));
scrivi('llms.txt', `# Satoshi Web

> Siti web e strumenti su misura per attività: prenotazioni, pannello di gestione e supporto anche dopo la pubblicazione. Di Edoardo De Benedictis, da Civitavecchia, per attività a Roma e in tutta Italia.

Contatto principale: WhatsApp +39 334 198 9193. Email: info@satoshiweb.it. P.IVA 18523731000.

## Lavori

${lavori.map((p) => `- [${p.titolo.split(' | ')[0]}](${SITO}${p.url}): ${p.descrizione}`).join('\n')}

## Altro

- [Home](${SITO}/): come funziona, strumenti e domande frequenti.
- [Privacy e cookie](${SITO}/privacy)
`);

// 9. Verifica: il build fallisce se qualcosa non va.
const errori = [];
const avvisi = [];
const filePubblico = (u) => {
  const p = u.split('#')[0].split('?')[0];
  if (html.has(p)) return true;
  const f = path.join(OUT, p);
  return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html')));
};
const ancore = (h) => new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const testoVisibile = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ').trim();
const statistiche = [];
const titoli = new Map();
for (const p of pagine) {
  const h = html.get(p.url);
  const dove = (m) => `${p.url}: ${m}`;
  const n1 = (h.match(/<h1[\s>]/g) || []).length;
  if (n1 !== 1) errori.push(dove(`${n1} <h1> (deve essere 1)`));
  for (const tag of h.match(/<img\b[^>]*>/g) || []) for (const a of ['alt', 'width', 'height']) if (!new RegExp(`\\s${a}=`).test(tag)) errori.push(dove(`<img> senza ${a}: ${tag.slice(0, 70)}`));
  const testo = testoVisibile(h);
  if (testo.includes('—')) errori.push(dove('trattino lungo nel testo'));
  if (/€|\beuro\b|a partire da/i.test(testo)) errori.push(dove('prezzo o riferimento ai prezzi nel testo'));
  if (/\[[^\]]*(completare|DA |TODO|SEGNAPOSTO)[^\]]*\]|\{\{|Segnaposto/i.test(testo)) errori.push(dove('segnaposto non risolto'));
  if (h.includes('../assets') || h.includes('.dc.html')) errori.push(dove('riferimento a file del pacchetto di design'));
  if (p.titolo.length > 60) errori.push(dove(`title di ${p.titolo.length} caratteri (max 60)`));
  if (p.descrizione.length < 70 || p.descrizione.length > 160) errori.push(dove(`description di ${p.descrizione.length} caratteri (70-160)`));
  if (titoli.has(p.titolo)) errori.push(dove(`title uguale a ${titoli.get(p.titolo)}`)); else titoli.set(p.titolo, p.url);
  for (const m of h.matchAll(/\shref="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    if (href.startsWith('#')) { if (!ancore(h).has(href.slice(1))) errori.push(dove(`ancora ${href} non esiste`)); continue; }
    if (!filePubblico(href)) { errori.push(dove(`link interno rotto ${href}`)); continue; }
    const [pp, id] = href.split('#');
    if (id && html.has(pp) && !ancore(html.get(pp)).has(id)) errori.push(dove(`ancora ${href} non esiste`));
  }
  for (const m of h.matchAll(/\s(?:src|srcset)="([^"]+)"/g)) {
    for (const parte of m[1].split(',')) {
      const u = parte.trim().split(/\s+/)[0];
      if (u.startsWith('/') && !filePubblico(u)) errori.push(dove(`risorsa mancante ${u}`));
    }
  }
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const d = JSON.parse(m[1]); if (!d['@context']) errori.push(dove('JSON-LD senza @context')); } catch { errori.push(dove('JSON-LD non valido')); }
    if (/AggregateRating|"Review"|priceRange|"price"/.test(m[1])) errori.push(dove('JSON-LD con recensioni o prezzi'));
  }
  for (const rimossi of ['consent.js', 'gtag', 'googletagmanager', 'fonts.googleapis', 'fontshare']) if (h.includes(rimossi)) errori.push(dove(`contiene ${rimossi}`));
  statistiche.push([p.url, testo.length]);
}
for (const u of inMappa) if (!fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8').includes(`<loc>${SITO}${u}</loc>`)) errori.push(`sitemap: manca ${u}`);
if (/€|euro|a partire da/i.test(fs.readFileSync(path.join(OUT, 'llms.txt'), 'utf8'))) errori.push('llms.txt: contiene un prezzo');
for (const c of LEGACY_CARTELLE) {
  const h = fs.readFileSync(path.join(OUT, c, 'index.html'), 'utf8');
  for (const m of h.matchAll(/\s(?:src|href)="(\/[^"#?]*)"/g)) if (!filePubblico(m[1])) errori.push(`legacy /${c}/: risorsa mancante ${m[1]}`);
}
if (!fontPreload.some((f) => f.includes('satoshi'))) avvisi.push('Satoshi 700 assente: il titolo cade sul fallback. Metti il file ufficiale in src/font/satoshi-700.woff2.');
if (!CF_TOKEN) avvisi.push('SW_CF_TOKEN non impostato: lo script di Cloudflare Web Analytics non è inserito.');

console.log(`\nBuild v4: ${html.size} pagine, css ${(css.length / 1024).toFixed(1)} KB, js ${(js.length / 1024).toFixed(1)} KB, indicizzazione ${INDICIZZA ? 'APERTA' : 'chiusa (noindex)'}`);
console.log('Caratteri di testo nel sorgente (soglie: 900 pagina normale, 2500 pagina da farsi trovare):');
for (const [u, n] of statistiche) console.log(`  ${String(n).padStart(5)}  ${u}`);
if (avvisi.length) console.log(`\nAvvisi (${avvisi.length}):\n  ` + avvisi.join('\n  '));
if (errori.length) { console.error(`\nERRORI (${errori.length}):\n  ` + errori.join('\n  ')); process.exit(1); }
console.log('\nOK: nessun errore.');
