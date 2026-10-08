// llms.txt generato dai dati: nessun prezzo, nessuna promessa non approvata. Sostituisce quello del vecchio sito (che citava un prezzo).
import { lavoriIndice } from '../dati/lavori.mjs';
import { descrizioneHome } from './seo.mjs';

export function llms(ctx) {
  const s = ctx.sito;
  const u = (p) => s.url + p;
  return `# Satoshi Web

> Studio personale di ${s.titolare} a Civitavecchia: costruisco siti web su misura per attività e professionisti, pensati per il telefono. Quando serve, il sito è collegato a prenotazioni, vendite e gestione. Parli direttamente con chi costruisce il tuo sito.

- Zona: Civitavecchia e Roma nord, progetti in tutta Italia.
- Contatti: WhatsApp e telefono +39 334 198 9193, email ${s.email}, Instagram @satoshidev.
- Risposta: personale, entro 1 giorno lavorativo.
- Prezzi: nessun listino fisso. Il prezzo dipende da dove parti, da cosa vuoi ottenere, dalle funzioni che servono e da quanto è complesso. La cifra precisa arriva prima di iniziare.

## Pagine principali

- [Home](${u('/')}): ${descrizioneHome}
- [Lavori](${u('/lavori/')}): sei progetti reali, con cosa serviva e cosa ho costruito.

## Lavori

${lavoriIndice.map((l) => `- [${l.nome}](${u('/lavori/' + l.slug + '/')}): ${l.seo.descrizione}`).join('\n')}

## Approfondimenti

- [Realizzazione siti web a Civitavecchia](${u('/realizzazione-siti-web-civitavecchia/')}): siti per attività locali che non hanno un sito o ne hanno uno da rifare.
- [Sviluppo app a Civitavecchia](${u('/sviluppo-app-civitavecchia/')}): app iOS e Android per attività locali.
- [Chatbot WhatsApp](${u('/chatbot-whatsapp/')}): chatbot per prenotazioni e assistenza.
- [Farsi trovare dalle AI (Radar AI)](${u('/farsi-trovare-dalle-ai/')}): come comparire quando i clienti chiedono consiglio a ChatGPT, Gemini e Perplexity.

## Legale

- [Privacy e cookie policy](${u('/privacy/')}): come tratto i dati personali.
`;
}
