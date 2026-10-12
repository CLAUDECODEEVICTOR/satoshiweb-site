// Endpoint dati del pannello. Tutto dietro password (ADMIN_TOKEN).
//  GET    -> ritorna tutte le collezioni { clienti, attivita, strumenti, analytics, studio }
//  POST   -> upsert  body: { coll, id, data }
//  DELETE -> rimuove body: { coll, id }
import { fermato, leggiTutto, leggiAllegato, scriviDoc, cancellaDoc, dbConfigurato } from './_lib.js';

export default async function handler(req, res) {
  if (fermato(req, res)) return; // 429/401 già mandati

  if (!dbConfigurato()) {
    return res.status(503).json({ error: 'db non configurato' });
  }

  try {
    if (req.method === 'GET') {
      const idAll = req.query && req.query.allegato;
      if (idAll) {
        const a = await leggiAllegato(String(idAll));
        if (!a) return res.status(404).json({ error: 'nessun allegato' });
        return res.status(200).json(a);
      }
      const dati = await leggiTutto();
      return res.status(200).json(dati);
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (!b.coll) return res.status(400).json({ error: 'coll mancante' });
      await scriviDoc(b.coll, b.id, b.data);
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (!b.coll || !b.id) return res.status(400).json({ error: 'coll/id mancante' });
      await cancellaDoc(b.coll, b.id);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'metodo non ammesso' });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
