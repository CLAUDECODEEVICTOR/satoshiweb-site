// Export in sola lettura per il cockpit del second brain (VICTOR).
// Protetto da token SEPARATI dalla password del pannello, uno per lettore:
//   EXPORT_TOKEN  → second brain
//   COCKPIT_TOKEN → Victor Cockpit (server-to-server)
// Così ognuno si revoca da solo, e se uno trapela è solo lettura.
// Il rate-limit di bordo (proteggi-api.py) copre gli abusi.
//   GET /api/export?token=XXX   oppure   Authorization: Bearer XXX
import { timingSafeEqual } from 'node:crypto';
import { leggiTutto, dbConfigurato } from './_lib.js';

function uguale(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const accettati = [process.env.EXPORT_TOKEN, process.env.COCKPIT_TOKEN].filter(Boolean);
  const dato = (req.query && req.query.token)
    || (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!dato || !accettati.some((t) => uguale(t, dato))) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (!dbConfigurato()) return res.status(503).json({ error: 'db non configurato' });

  try {
    const dati = await leggiTutto();
    return res.status(200).json({ generatedAt: new Date().toISOString(), ...dati });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
