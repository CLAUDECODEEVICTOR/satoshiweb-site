// Libreria condivisa delle funzioni /api del pannello.
// Due responsabilità: parlare con Upstash Redis (REST, via fetch, zero
// dipendenze) e proteggere la password (blocco tentativi per IP).
//
// La difesa completa è a due strati, come da regola:
//  1) bordo di rete  -> python3 ~/.claude/strumenti/proteggi-api.py  (limiti Vercel)
//  2) questa funzione -> blocco tentativi qui sotto                   (la password)
// Servono ENTRAMBI: questo da solo non salva i limiti del piano.

// ---- Upstash Redis (REST) ---------------------------------------------
const U_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const U_TOK = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export function dbConfigurato() {
  return !!(U_URL && U_TOK);
}

// Esegue un comando Redis: cmd è un array tipo ["GET","chiave"].
async function redis(cmd) {
  if (!dbConfigurato()) throw new Error('Upstash non configurato (mancano le env)');
  const r = await fetch(U_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${U_TOK}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error('Upstash ' + r.status);
  const j = await r.json();
  return j.result;
}

// Le collezioni del pannello, ognuna una chiave Redis con dentro un JSON.
// clienti/attivita/strumenti/analytics = mappa { id: documento }.
// studio = un singolo oggetto di progressi.
// 'allegati' tiene i PDF (base64) per cliente: pesante, quindi NON entra in
// leggiTutto (si carica solo a richiesta, un allegato alla volta).
export const COLLEZIONI = ['clienti', 'attivita', 'strumenti', 'analytics', 'studio', 'allegati'];
const LEGGERE = ['clienti', 'attivita', 'strumenti', 'analytics', 'studio'];
const chiave = (c) => 'sw:' + c;

export async function leggiTutto() {
  const out = {};
  await Promise.all(LEGGERE.map(async (c) => {
    const v = await redis(['GET', chiave(c)]);
    out[c] = v ? JSON.parse(v) : {};
  }));
  return out;
}

// Un singolo allegato (PDF) per cliente, caricato a richiesta.
export async function leggiAllegato(id) {
  const mappa = await leggiColl('allegati');
  return mappa[id] || null;
}

export async function leggiColl(c) {
  const v = await redis(['GET', chiave(c)]);
  return v ? JSON.parse(v) : {};
}

// Upsert di un documento dentro una collezione (read-modify-write: alla
// tua scala è semplice e affidabile).
export async function scriviDoc(c, id, data) {
  if (!COLLEZIONI.includes(c)) throw new Error('collezione ignota');
  if (c === 'studio') { // studio è un oggetto unico, non una mappa di doc
    await redis(['SET', chiave(c), JSON.stringify(data || {})]);
    return;
  }
  const mappa = await leggiColl(c);
  mappa[id] = data;
  await redis(['SET', chiave(c), JSON.stringify(mappa)]);
}

export async function cancellaDoc(c, id) {
  if (!COLLEZIONI.includes(c) || c === 'studio') throw new Error('non cancellabile');
  const mappa = await leggiColl(c);
  delete mappa[id];
  await redis(['SET', chiave(c), JSON.stringify(mappa)]);
}

// ---- Blocco tentativi sulla password (da blocco-tentativi.js) ---------
const TENTATIVI_MAX = 5;
const FINESTRA = Number(process.env.AUTH_LOCK_WINDOW || 600) * 1000;
const tentativi = new Map();

function indirizzo(req) {
  const inoltrato = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return inoltrato || req.headers['x-real-ip'] || 'ignoto';
}
function scaduto(voce) { return !voce || (Date.now() - voce.da) > FINESTRA; }

export function bloccato(req) {
  const voce = tentativi.get(indirizzo(req));
  if (scaduto(voce)) { tentativi.delete(indirizzo(req)); return false; }
  return voce.n >= TENTATIVI_MAX;
}
export function attesaResidua(req) {
  const voce = tentativi.get(indirizzo(req));
  if (scaduto(voce)) return 0;
  return Math.ceil((FINESTRA - (Date.now() - voce.da)) / 1000);
}
export function authed(req) {
  const tok = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const atteso = process.env.ADMIN_TOKEN;
  const ip = indirizzo(req);
  if (bloccato(req)) return false;
  const ok = !!tok && !!atteso && tok === atteso;
  if (ok) { tentativi.delete(ip); return true; }
  const voce = tentativi.get(ip);
  if (scaduto(voce)) tentativi.set(ip, { n: 1, da: Date.now() });
  else voce.n += 1;
  return false;
}

// Guardia da mettere in cima a ogni endpoint protetto. Ritorna true se ha
// già risposto (bloccato o non autorizzato): in tal caso l'endpoint esce.
export function fermato(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (bloccato(req)) {
    const attesa = attesaResidua(req);
    res.setHeader('Retry-After', String(attesa));
    res.status(429).json({ error: 'too many attempts', attesa });
    return true;
  }
  if (!authed(req)) { res.status(401).json({ error: 'unauthorized' }); return true; }
  return false;
}
