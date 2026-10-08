#!/usr/bin/env node
// Build di Satoshi Web: legge src/, scrive public/. Solo Node, nessuna dipendenza, nessuno strumento esterno
// (le immagini si preparano in locale con scripts/immagini.mjs e vivono già in src/img/).
//
//   node build.mjs            compone il sito in public/
//
// Il build FALLISCE se trova: immagini senza alt/width/height, h1 mancante o doppio, trattino lungo nel testo,
// segnaposto non risolti, link interni rotti. Vedi verifica() in fondo.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sito, footer, barraFissa } from './src/dati/sito.mjs';
import { navLinea, navMenu } from './src/dati/home.mjs';
import { lavori } from './src/dati/lavori.mjs';
import { home, indiceLavori, grazie, non_trovata } from './src/tmpl/pagine.mjs';
import { caso } from './src/tmpl/caso.mjs';
import { pagPrivacy } from './src/tmpl/privacy.mjs';
import { llms } from './src/tmpl/llms.mjs';

const RADICE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(RADICE, 'src');
const OUT = path.join(RADICE, 'public');

// Finché non si va online tutte le pagine sono noindex. Si accende da qui, non pagina per pagina.
const INDICIZZA = process.env.SW_INDICIZZA === '1';
// Fase 1: le sezioni della home non esistono ancora, quindi le ancore mancanti sono avvisi, non errori.
const ANCORE_OBBLIGATORIE = process.env.SW_ANCORE === '1';

// File e cartelle del sito attuale che devono restare raggiungibili (Q1). Allowlist esplicita.
const LEGACY_CARTELLE = ['realizzazione-siti-web-civitavecchia', 'sviluppo-app-civitavecchia', 'chatbot-whatsapp', 'farsi-trovare-dalle-ai'];
// (privacy e llms.txt non sono più copiati: li genera il build. Niente file che .vercelignore esclude, come satoshi-*.png.)
const LEGACY_FILE = ['consent.js', 'widows.js', 'favicon.png', 'favicon.svg', 'pannello.html', 'og-image.png', 'logo/satoshidev-removebg-preview.ico'];

const hash = (buf) => createHash('sha1').update(buf).digest('hex').slice(0, 8);
const scrivi = (rel, contenuto) => {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contenuto);
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 1. Legacy: copiato tale e quale.
for (const c of LEGACY_CARTELLE) fs.cpSync(path.join(RADICE, c), path.join(OUT, c), { recursive: true });
for (const f of LEGACY_FILE) {
  fs.mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true });
  fs.copyFileSync(path.join(RADICE, f), path.join(OUT, f));
}

// 2. Font: solo quelli presenti in src/font/ (nome: famiglia-peso.woff2, oppure famiglia-min-max.woff2 per i variabili).
// Satoshi (licenza ITF FFL: self-hosting ok, ridistribuzione e subsetting vietati) resta FUORI da git perché il repo è pubblico:
// il file ufficiale non modificato sta solo in locale e arriva a Vercel con il deploy da cartella.
const FAMIGLIE = { 'bricolage-grotesque': 'Bricolage Grotesque', geist: 'Geist', satoshi: 'Satoshi' };
const PRELOAD = new Set(['bricolage-grotesque-200-800', 'geist-400']);
let cssFont = '';
const fontPreload = [];
const dirFont = path.join(SRC, 'font');
if (fs.existsSync(dirFont)) {
  for (const f of fs.readdirSync(dirFont).filter((x) => x.endsWith('.woff2'))) {
    const base = f.replace('.woff2', '');
    const m = /^(.*?)-(\d{3})(?:-(\d{3}))?$/.exec(base);
    if (!m || !FAMIGLIE[m[1]]) continue;
    const buf = fs.readFileSync(path.join(dirFont, f));
    const nome = `/font/${base}.${hash(buf)}.woff2`;
    scrivi(nome.slice(1), buf);
    cssFont += `@font-face{font-family:"${FAMIGLIE[m[1]]}";font-weight:${m[3] ? `${m[2]} ${m[3]}` : m[2]};font-style:normal;font-display:swap;src:url(${nome}) format("woff2")}\n`;
    if (PRELOAD.has(base)) fontPreload.push(nome);
  }
}

const famigliePresenti = new Set([...cssFont.matchAll(/font-family:"([^"]+)"/g)].map((x) => x[1]));
for (const f of Object.values(FAMIGLIE)) if (!famigliePresenti.has(f)) console.warn(`ATTENZIONE: font "${f}" assente in src/font/, uso il fallback di sistema.`);

// 3. CSS e JS con hash nel nome (cache lunga e sicura).
const minCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
const css = minCss(cssFont + ['base.css', 'componenti.css', 'home.css', 'caso.css', 'motion.css'].map((f) => fs.readFileSync(path.join(SRC, 'css', f), 'utf8')).join('\n'));
const cssNome = `/css/sito.${hash(css)}.css`;
scrivi(cssNome.slice(1), css);
const js = fs.readFileSync(path.join(SRC, 'js/sito.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s+/gm, '').replace(/\n+/g, '\n');
const jsNome = `/js/sito.${hash(js)}.js`;
scrivi(jsNome.slice(1), js);

// 4. Immagini già preparate (scripts/immagini.mjs).
const dirImg = path.join(SRC, 'img');
const immagini = JSON.parse(fs.readFileSync(path.join(dirImg, 'manifest.json'), 'utf8'));
for (const f of fs.readdirSync(dirImg).filter((x) => x !== 'manifest.json')) scrivi(`img/${f}`, fs.readFileSync(path.join(dirImg, f)));

// 4b. Immagini OG (scripts/og.py) con hash nel nome, e apple-touch-icon.
const og = {};
const dirOg = path.join(SRC, 'og');
if (fs.existsSync(dirOg)) {
  for (const f of fs.readdirSync(dirOg).filter((x) => x.endsWith('.jpg'))) {
    const buf = fs.readFileSync(path.join(dirOg, f));
    const nome = `/og/${f.replace('.jpg', '')}.${hash(buf)}.jpg`;
    scrivi(nome.slice(1), buf);
    og[f.replace('.jpg', '')] = nome;
  }
}
scrivi('apple-touch-icon.png', fs.readFileSync(path.join(SRC, 'brand/apple-touch-icon.png')));

// 5. Pagine. Il contesto è un oggetto passato alle funzioni pure: nessuno stato condiviso tra pagine.
const ctx = { sito, navLinea, navMenu, footer, barraFissa, immagini, og, indicizza: INDICIZZA, asset: { css: cssNome, js: jsNome, fontPreload } };
const pagine = new Map(); // percorso URL -> html
pagine.set('/', home(ctx));
pagine.set('/lavori/', indiceLavori(ctx));
for (const l of lavori) pagine.set(`/lavori/${l.slug}/`, caso(ctx, l.slug));
pagine.set('/privacy/', pagPrivacy(ctx));
pagine.set('/grazie/', grazie(ctx));
pagine.set('/404.html', non_trovata(ctx));
const conFrecce = (html) => html.replace(/ →<\/a>/g, '<span class="freccia" aria-hidden="true">&nbsp;→</span></a>');
for (const [url, html] of pagine) pagine.set(url, conFrecce(html));
for (const [url, html] of pagine) scrivi(url.endsWith('/') ? `${url.slice(1)}index.html` : url.slice(1), html);

// 6. robots.txt e sitemap.xml. Prima del lancio: tutto chiuso. Dopo: crawler AI consentiti come oggi.
const CRAWLER_AI = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Bingbot'];
const robots = INDICIZZA
  ? `User-agent: *\nAllow: /\nDisallow: /demo/\nDisallow: /grazie/\nDisallow: /pannello\nDisallow: /api/\n\n# Crawler AI: esplicitamente consentiti (senza questi non possono citarti)\n${CRAWLER_AI.map((c) => `User-agent: ${c}\nAllow: /\nDisallow: /demo/\nDisallow: /grazie/`).join('\n\n')}\n\nSitemap: ${sito.url}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n';
scrivi('robots.txt', robots);
scrivi('llms.txt', llms(ctx));
const urlSitemap = [...[...pagine.keys()].filter((u) => u !== '/grazie/' && u !== '/404.html'), ...LEGACY_CARTELLE.map((c) => `/${c}/`)];
scrivi('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlSitemap.map((u) => `  <url><loc>${sito.url}${u}</loc></url>`).join('\n')}\n</urlset>\n`);

// 7. Verifica: il build fallisce se qualcosa non va.
const errori = [];
const avvisi = [];
const esiste = (url) => {
  const p = url.split('#')[0].split('?')[0];
  if (pagine.has(p)) return true;
  const file = path.join(OUT, p);
  return fs.existsSync(file) && (fs.statSync(file).isFile() || fs.existsSync(path.join(file, 'index.html')));
};
const ancore = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const testoVisibile = (html) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ').trim();

const statistiche = [];
for (const [url, html] of pagine) {
  const dove = (msg) => `${url}: ${msg}`;
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errori.push(dove(`${h1} <h1> (deve essere 1)`));
  for (const tag of html.match(/<img\b[^>]*>/g) || []) {
    for (const a of ['alt', 'width', 'height']) if (!new RegExp(`\\s${a}=`).test(tag)) errori.push(dove(`<img> senza ${a}: ${tag.slice(0, 70)}`));
  }
  const testo = testoVisibile(html);
  if (testo.includes('—')) errori.push(dove('trattino lungo nel testo'));
  if (/\[(DA |TEMPO|SEGNAPOSTO|TODO)/i.test(testo)) errori.push(dove('segnaposto non risolto'));
  for (const campo of [/<html lang="it"/, /<title>[^<]+<\/title>/, /<meta name="description" content="[^"]+"/, /<link rel="canonical" href="https:\/\/satoshiweb\.it/]) {
    if (!campo.test(html)) errori.push(dove(`manca ${campo.source.slice(0, 30)}`));
  }
  for (const m of html.matchAll(/\shref="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    if (href.startsWith('#')) {
      if (!ancore(html).has(href.slice(1))) (ANCORE_OBBLIGATORIE ? errori : avvisi).push(dove(`ancora ${href} non esiste`));
    } else if (!esiste(href)) {
      errori.push(dove(`link interno rotto ${href}`));
    } else if (href.includes('#')) {
      const [p, id] = href.split('#');
      const target = pagine.get(p);
      if (target && id && !ancore(target).has(id)) (ANCORE_OBBLIGATORIE ? errori : avvisi).push(dove(`ancora ${href} non esiste`));
    }
  }
  for (const m of html.matchAll(/\s(?:src|srcset)="([^"]+)"/g)) {
    for (const parte of m[1].split(',')) {
      const u = parte.trim().split(/\s+/)[0];
      if (u.startsWith('/') && !esiste(u)) errori.push(dove(`risorsa mancante ${u}`));
    }
  }
  statistiche.push([url, testo.length]);
}

// SEO: lunghezze, unicità, OG, JSON-LD, sitemap, llms.txt.
const titoli = new Map();
const descrizioni = new Map();
for (const [url, html] of pagine) {
  if (url === '/404.html') continue;
  const dove = (msg) => `${url}: ${msg}`;
  const titolo = (/<title>([^<]*)<\/title>/.exec(html) || [])[1] || '';
  const desc = (/<meta name="description" content="([^"]*)"/.exec(html) || [])[1] || '';
  if (titolo.length > 60) errori.push(dove(`title di ${titolo.length} caratteri (max 60)`));
  if (desc.length < 70 || desc.length > 160) errori.push(dove(`description di ${desc.length} caratteri (70-160)`));
  if (titoli.has(titolo)) errori.push(dove(`title uguale a ${titoli.get(titolo)}`)); else titoli.set(titolo, url);
  if (descrizioni.has(desc)) errori.push(dove(`description uguale a ${descrizioni.get(desc)}`)); else descrizioni.set(desc, url);
  const canonical = (/<link rel="canonical" href="([^"]*)"/.exec(html) || [])[1];
  if (canonical !== sito.url + url) errori.push(dove(`canonical ${canonical}`));
  const imgOg = (/<meta property="og:image" content="https:\/\/satoshiweb\.it([^"]*)"/.exec(html) || [])[1];
  if (url === '/grazie/') { /* pagina di servizio: noindex, nessuna anteprima social */ }
  else if (!imgOg || !fs.existsSync(path.join(OUT, imgOg))) errori.push(dove('immagine OG mancante'));
  else if (fs.statSync(path.join(OUT, imgOg)).size > 300 * 1024) avvisi.push(dove('immagine OG sopra i 300 KB'));
  if (!/rel="apple-touch-icon"/.test(html)) errori.push(dove('apple-touch-icon mancante'));
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const d = JSON.parse(m[1]);
      if (!d['@context']) errori.push(dove('JSON-LD senza @context'));
      if (/AggregateRating|Review|priceRange|"price"/.test(m[1])) errori.push(dove('JSON-LD con recensioni o prezzi'));
    } catch (e) { errori.push(dove('JSON-LD non valido')); }
  }
}
const mappa = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
for (const u of urlSitemap) if (!mappa.includes(`<loc>${sito.url}${u}</loc>`)) errori.push(`sitemap: manca ${u}`);
if (/\/(grazie|demo)\//.test(mappa)) errori.push('sitemap: contiene pagine non indicizzabili');
const testoLlms = fs.readFileSync(path.join(OUT, 'llms.txt'), 'utf8');
if (/€|euro|a partire da/i.test(testoLlms)) errori.push('llms.txt: contiene un prezzo');
if (testoLlms.includes('\u2014')) errori.push('llms.txt: trattino lungo');

// Le pagine legacy devono continuare a trovare tutte le loro risorse locali.
for (const c of LEGACY_CARTELLE) {
  const html = fs.readFileSync(path.join(OUT, c, 'index.html'), 'utf8');
  for (const m of html.matchAll(/\s(?:src|href)="(\/[^"#?]*)"/g)) {
    if (!esiste(m[1])) errori.push(`legacy /${c}/: risorsa mancante ${m[1]}`);
  }
  for (const m of html.matchAll(/https:\/\/satoshiweb\.it(\/[^"' )#?]*)/g)) {
    if (!esiste(m[1])) avvisi.push(`legacy /${c}/: URL assoluto non servito ${m[1]}`);
  }
}

console.log(`\nBuild: ${pagine.size} pagine, css ${(css.length / 1024).toFixed(1)} KB, js ${(js.length / 1024).toFixed(1)} KB, font ${fontPreload.length ? 'sì' : 'FALLBACK DI SISTEMA (src/font/ vuota)'}`);
console.log('Caratteri di testo nel sorgente (soglie: 900 pagina normale, 2500 pagina da farsi trovare):');
for (const [u, n] of statistiche) console.log(`  ${String(n).padStart(5)}  ${u}`);
if (avvisi.length) console.log(`\nAvvisi (${avvisi.length}):\n  ` + [...new Set(avvisi)].join('\n  '));
if (errori.length) {
  console.error(`\nERRORI (${errori.length}):\n  ` + errori.join('\n  '));
  process.exit(1);
}
console.log('\nOK: nessun errore.');
