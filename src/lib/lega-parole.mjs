/* Porting JS di tipografia-web/scripts/lega-parole.ts: stessa logica, nessuna dipendenza.
   Usata dal build: gli spazi indivisibili sono già nel sorgente HTML. */

const NB = "\u00A0";

const PAROLE_BREVI_IT = [
  // articoli
  "il", "lo", "la", "i", "gli", "le", "un", "uno", "una",
  // preposizioni semplici e articolate
  "di", "a", "da", "in", "con", "su", "per", "tra", "fra",
  "del", "dello", "della", "dei", "degli", "delle",
  "al", "allo", "alla", "ai", "agli", "alle",
  "dal", "dallo", "dalla", "dai", "dagli", "dalle",
  "nel", "nello", "nella", "nei", "negli", "nelle",
  "sul", "sullo", "sulla", "sui", "sugli", "sulle", "col",
  // congiunzioni
  "e", "ed", "o", "od", "ma", "né", "che", "se", "perché", "quando", "come", "dove", "mentre", "anche",
  // pronomi atoni e negazione
  "mi", "ti", "ci", "vi", "si", "ne", "li", "non",
  // parole corte che reggono la successiva
  "ogni", "più", "meno", "senza", "sotto", "sopra", "dopo", "prima", "tu", "io",
];

const PAROLE_BREVI_EN = [
  "a", "an", "the", "of", "to", "in", "on", "at", "by", "for", "with", "from",
  "and", "or", "but", "if", "as", "is", "it", "my", "your", "our", "no", "not", "i",
];

/** Parole che seguono un numero e devono restare con lui. */
const UNITA = [
  "€", "%", "euro", "ore", "ora", "minuti", "min", "secondi", "sere", "sera", "giorni", "giorno",
  "notti", "anni", "mesi", "km", "m", "kg", "g", "persone", "posti", "gennaio", "febbraio", "marzo",
  "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

/** Parole che precedono un numero e devono restare con lui. */
const PRIMA_DEL_NUMERO = ["room", "pack", "sala", "giorno", "pagina", "capitolo", "n.", "nr.", "art.", "via", "ore", "alle", "dalle"];


const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const cache = new Map();
function regexParole(lista) {
  const chiave = lista.join("|");
  let re = cache.get(chiave);
  if (!re) {
    // Parola breve preceduta da inizio testo, spazio, apostrofo o apertura di parentesi/virgolette,
    // seguita da uno o più spazi normali e poi da un'altra parola.
    re = new RegExp(`(?<=^|[\\s(«"“'’\\[])(${lista.map(escape).join("|")})[ \\t\\n]+(?=\\S)`, "giu");
    cache.set(chiave, re);
  }
  return re;
}

export function legaParole(testo, opzioni = {}) {
  if (!testo) return testo;
  const lingua = opzioni.lingua ?? "it";
  const brevi = [...(lingua === "it" ? PAROLE_BREVI_IT : PAROLE_BREVI_EN)];
  if (opzioni.titolo && lingua === "it") brevi.push("è", "ho", "ha");

  let t = testo;

  // 1. parole brevi legate alla successiva
  t = t.replace(regexParole(brevi), `$1${NB}`);

  // 2. numero + unità ("25 €", "4 sere", "23 settembre")
  t = t.replace(new RegExp(`(\\d)[ \\t]+(?=(${UNITA.map(escape).join("|")})(?![\\p{L}]))`, "giu"), `$1${NB}`);

  // 3. parola + numero ("Room 26", "Pack 2", "alle 23:30")
  t = t.replace(new RegExp(`(?<=^|\\s)(${PRIMA_DEL_NUMERO.map(escape).join("|")})[ \\t]+(?=\\d)`, "giu"), `$1${NB}`);

  // 4. iniziale puntata + cognome ("L. Curella")
  t = t.replace(/(?<=^|\s)(\p{Lu}\.)[ \t]+(?=\p{Lu})/gu, `$1${NB}`);

  // 5. niente parola sola in fondo: lega le ultime due parole se l'ultima è corta
  const vedova = opzioni.vedova ?? t.length > 40;
  if (vedova) t = t.replace(/[ \t\n]+(\S{1,12})\s*$/u, `${NB}$1`);

  return t;
}

/**
 * Per i titoli con virgole generati da dati (CMS): divide in frasi da mettere
 * ciascuna in un <span class="cl">. Restituisce le frasi già legate.
 *
 *   {frasiTitolo(titolo).map((f, i) => <span key={i} className="cl">{f}</span>)}
 */
export function frasiTitolo(titolo, opzioni = {}) {
  return titolo
    .split(/(?<=[,;:.])\s+/u)
    .filter(Boolean)
    .map((f) => legaParole(f, { ...opzioni, titolo: true, vedova: false }));
}
