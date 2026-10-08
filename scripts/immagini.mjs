#!/usr/bin/env node
// Passo LOCALE (non gira su Vercel): converte src/asset/** in WebP a più larghezze dentro src/img/
// e scrive src/img/manifest.json. src/img/ si committa; il build di Vercel usa solo quello.
// Usa solo strumenti già presenti sul Mac: cwebp e sips. Nessuna dipendenza npm.
//
//   node scripts/immagini.mjs
//
// Regola privacy: in src/asset/ entrano solo file già verificati o mascherati (IMPLEMENTATION-PLAN, E).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGINI = path.join(RADICE, 'src/asset');
const DESTINAZIONE = path.join(RADICE, 'src/img');
const LARGHEZZE = [390, 780, 1440];
const QUALITA = '78';

const dimensioni = (file) => {
  const o = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  return { w: +/pixelWidth: (\d+)/.exec(o)[1], h: +/pixelHeight: (\d+)/.exec(o)[1] };
};

function elenca(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? elenca(p) : [p];
  });
}

fs.mkdirSync(DESTINAZIONE, { recursive: true });
const manifest = {};
const tenuti = new Set(['manifest.json']);

for (const file of elenca(ORIGINI)) {
  const rel = path.relative(ORIGINI, file);
  const ext = path.extname(file).toLowerCase();
  const nome = path.basename(file, ext);
  const gruppo = path.dirname(rel);
  const chiave = `${gruppo}/${nome}`;

  if (ext === '.svg') {
    const dest = path.join(DESTINAZIONE, path.basename(file));
    fs.copyFileSync(file, dest);
    tenuti.add(path.basename(file));
    continue;
  }
  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) continue;

  const { w, h } = dimensioni(file);
  const hash = createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 6);
  const larghezze = [...new Set([...LARGHEZZE.filter((x) => x < w), w])].sort((a, b) => a - b);
  const varianti = [];
  for (const lw of larghezze) {
    const uscita = `${gruppo.replace(/[\\/]/g, '-')}-${nome}-${lw}.${hash}.webp`;
    const dest = path.join(DESTINAZIONE, uscita);
    tenuti.add(uscita);
    if (!fs.existsSync(dest)) {
      const args = ['-quiet', '-q', QUALITA, ...(lw === w ? [] : ['-resize', String(lw), '0']), file, '-o', dest];
      execFileSync('cwebp', args);
    }
    varianti.push({ w: lw, url: `/img/${uscita}` });
  }
  manifest[chiave] = { w, h, varianti };
}

// Pulizia delle varianti vecchie (altro hash o file rimosso).
for (const f of fs.readdirSync(DESTINAZIONE)) if (!tenuti.has(f)) fs.rmSync(path.join(DESTINAZIONE, f));

fs.writeFileSync(path.join(DESTINAZIONE, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Immagini: ${Object.keys(manifest).length} sorgenti, ${fs.readdirSync(DESTINAZIONE).length - 1} file in src/img/`);
