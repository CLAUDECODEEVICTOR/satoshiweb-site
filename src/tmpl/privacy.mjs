// Pagina /privacy/ nel design V3.1 (nessun elemento nuovo: etichetta, titolo, testo, filetti).
import { esc, t } from './util.mjs';
import { pagina } from './layout.mjs';
import { privacy } from '../dati/privacy.mjs';

function blocco(b) {
  const lead = b.b ? `<strong>${t(b.b)}</strong> ` : '';
  if (b.p !== undefined) return `<p>${lead}${t(b.p)}</p>`;
  if (b.lista) return `<ul class="legale__lista">${b.lista.map((x) => `<li>${t(x)}</li>`).join('')}</ul>`;
  if (b.elenco) return `<dl class="legale__elenco">${b.elenco.map((r) => `<div><dt>${t(r[0])}</dt><dd>${t(r[1])}</dd></div>`).join('')}</dl>`;
  if (b.tabella) {
    const tb = b.tabella;
    return `<div class="legale__tabella"><table><thead><tr>${tb.intestazione.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${tb.righe
      .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`)
      .join('')}</tbody></table></div>`;
  }
  return '';
}

export function pagPrivacy(ctx) {
  const corpo = `<section class="legale contenitore">
<div class="etichetta">Documento legale</div>
<h1>${t(privacy.titolo, { vedova: false })}</h1>
<p class="lead">${t(privacy.lead)}</p>
<p class="legale__data">Ultimo aggiornamento: ${esc(privacy.aggiornamento)}</p>
${privacy.sezioni.map((s) => `<h2>${t(s.titolo, { vedova: false })}</h2>\n${s.blocchi.map(blocco).join('\n')}`).join('\n')}
</section>`;
  return pagina(ctx, {
    percorso: '/privacy/',
    titolo: 'Privacy e cookie policy | Satoshi Web',
    descrizione: 'Come tratto i dati personali raccolti tramite il sito satoshiweb.it, quali cookie uso e quali diritti hai.',
    og: { immagine: ctx.og.home, alt: 'Satoshi Web' },
    corpo,
    testataSemplice: true,
    indietro: { href: '/', testo: '← Torna al sito' },
  });
}
