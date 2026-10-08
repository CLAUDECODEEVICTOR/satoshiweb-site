// Helper dei template. Funzioni pure: nessun `document`, nessuna variabile di modulo con stato.
import { legaParole } from '../lib/lega-parole.mjs';

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Testo con spazi indivisibili (tipografia-web) ed escape HTML.
export const t = (testo, opz) => esc(legaParole(testo, opz));

// Immagine dal manifest: srcset, dimensioni dichiarate, alt obbligatorio.
// opz: { alt, sizes, priorita, classe }. `priorita` = unica immagine LCP: fetchpriority alta, niente lazy.
export function img(ctx, chiave, opz) {
  const m = ctx.immagini[chiave];
  if (!m) throw new Error(`Immagine non nel manifest: ${chiave} (esegui node scripts/immagini.mjs)`);
  if (opz.alt === undefined) throw new Error(`alt mancante per ${chiave}`);
  const src = m.varianti[m.varianti.length - 1];
  const srcset = m.varianti.map((v) => `${v.url} ${v.w}w`).join(', ');
  const attr = [
    `src="${src.url}"`,
    m.varianti.length > 1 ? `srcset="${srcset}"` : '',
    m.varianti.length > 1 ? `sizes="${esc(opz.sizes || '100vw')}"` : '',
    `width="${m.w}"`,
    `height="${m.h}"`,
    `alt="${esc(opz.alt)}"`,
    opz.classe ? `class="${opz.classe}"` : '',
    opz.priorita ? 'fetchpriority="high"' : 'loading="lazy"',
    'decoding="async"',
  ].filter(Boolean);
  return `<img ${attr.join(' ')}>`;
}

export const assoluto = (ctx, percorso) => ctx.sito.url + percorso;

// Titolo a gruppi (skill tipografia-web): ogni gruppo non si spezza, il browser va a capo solo tra un gruppo e l'altro.
export const gruppi = (lista) => lista.map((g) => `<span class="ph">${t(g, { vedova: false })}</span>`).join(' ');
