// Privacy e cookie policy. Testo dell'informativa già pubblicata (14 settembre 2026), aggiornato al nuovo sito:
// modulo con i campi attuali, dati salvati nel browser, fornitori. NON è una consulenza legale: da far rivedere prima del lancio.

export const privacy = {
  titolo: 'Privacy e Cookie Policy',
  lead: 'Come trattiamo i dati personali raccolti tramite questo sito, quali cookie usiamo e quali diritti hai.',
  aggiornamento: '8 ottobre 2026',
  sezioni: [
    {
      titolo: '1. Chi tratta i tuoi dati',
      blocchi: [
        { elenco: [
          ['Titolare del trattamento', 'Edoardo De Benedictis (Satoshi Web)'],
          ['Partita IVA', '18523731000'],
          ['Sede', 'Civitavecchia (RM), Italia'],
          ['Contatto', 'email info@satoshiweb.it, WhatsApp e telefono +39 334 198 9193, oppure il modulo di contatto del sito.'],
        ] },
        { p: 'Questa informativa vale per il sito satoshiweb.it e spiega, in modo chiaro, quali dati raccogliamo, perché, per quanto tempo e con chi.' },
      ],
    },
    {
      titolo: '2. Quali dati raccogliamo',
      blocchi: [
        { b: 'Dati che ci fornisci tu.', p: 'Quando compili il modulo di contatto ci lasci nome, nome della tua attività e telefono. Se vuoi, anche il tuo sito o profilo Instagram e un messaggio su cosa vorresti ottenere. Ci servono solo per risponderti.' },
        { b: 'Se ci scrivi su WhatsApp.', p: 'I messaggi passano dal servizio WhatsApp, che ha una propria informativa.' },
        { b: 'Dati raccolti in automatico.', p: 'Quando visiti il sito, per motivi di sicurezza e statistica, vengono registrati dati tecnici come indirizzo IP, tipo di browser e dispositivo, pagine viste e provenienza della visita.' },
        { b: 'Dati salvati nel tuo browser.', p: 'Mentre invii il modulo, il nome e l\'attività che hai scritto restano nel browser, solo per la durata della visita, per personalizzare la pagina di conferma. Vengono cancellati subito dopo averla mostrata. Salviamo anche la tua scelta sui cookie, per non ripeterti la domanda.' },
      ],
    },
    {
      titolo: '3. Perché trattiamo i dati e con quale base giuridica',
      blocchi: [
        { b: 'Rispondere alle tue richieste ed eventualmente prepararti un preventivo.', p: 'Base giuridica: il tuo consenso e le misure precontrattuali che chiedi tu stesso scrivendoci.' },
        { b: 'Sicurezza del sito e statistiche di visita.', p: 'Base giuridica: il nostro legittimo interesse a tenere il sito funzionante e a capire come viene usato.' },
        { b: 'Cookie e strumenti di misurazione non essenziali.', p: 'Base giuridica: il tuo consenso, dove richiesto.' },
      ],
    },
    {
      titolo: '4. A chi comunichiamo i dati',
      blocchi: [
        { p: 'Non vendiamo i tuoi dati e non li cediamo a terzi per finalità loro. Per far funzionare il sito ci appoggiamo ad alcuni fornitori, che trattano i dati per nostro conto o come titolari autonomi:' },
        { tabella: {
          intestazione: ['Servizio', 'A cosa serve', 'Dove'],
          righe: [
            ['Vercel', 'Hosting del sito e statistiche di visita', 'USA / UE'],
            ['Formspree', 'Ricezione dei messaggi del modulo di contatto', 'USA'],
            ['Google Analytics 4', 'Statistiche di visita aggregate, solo con il tuo consenso', 'USA / UE'],
            ['Victor Analytics', 'Statistiche di visita proprie, senza cookie', 'UE'],
            ['Fontshare', 'Caricamento dei font in alcune pagine di approfondimento', 'UE / internazionale'],
            ['WhatsApp', 'Messaggi, se scegli di scriverci lì', 'Internazionale'],
          ],
        } },
        { p: 'Alcuni di questi fornitori hanno sede o server negli Stati Uniti. In quei casi il trasferimento avviene sulla base delle garanzie previste dal GDPR, come le clausole contrattuali standard della Commissione Europea.' },
      ],
    },
    {
      titolo: '5. Cookie',
      blocchi: [
        { p: 'Un cookie è un piccolo file che un sito salva nel tuo browser. Su questo sito usiamo:' },
        { lista: [
          'Cookie tecnici, necessari a far funzionare il sito. Non richiedono consenso.',
          'Cookie di statistica di Google Analytics 4, che ci danno numeri aggregati sulle visite. Questi non sono necessari e li usiamo con il tuo consenso.',
        ] },
        { p: 'Le statistiche di Vercel e di Victor Analytics sono progettate per funzionare senza cookie di profilazione. Puoi comunque bloccare o cancellare i cookie dalle impostazioni del tuo browser: il sito resta consultabile.' },
      ],
    },
    {
      titolo: '6. Per quanto tempo li conserviamo',
      blocchi: [
        { lista: [
          'I messaggi del modulo di contatto: per il tempo necessario a gestire la tua richiesta e l\'eventuale rapporto che ne nasce, poi vengono cancellati.',
          'I dati statistici: in forma aggregata, secondo i tempi dei rispettivi strumenti.',
        ] },
      ],
    },
    {
      titolo: '7. I tuoi diritti',
      blocchi: [
        { p: 'Secondo il Regolamento europeo 2016/679 (GDPR) puoi in ogni momento:' },
        { lista: [
          'sapere quali tuoi dati trattiamo e chiederne una copia;',
          'farli correggere o aggiornare;',
          'chiederne la cancellazione;',
          'limitarne o opporti al trattamento;',
          'revocare il consenso che hai dato, senza che questo tocchi ciò che è stato fatto prima.',
        ] },
        { p: 'Per esercitare questi diritti scrivici a info@satoshiweb.it, contattaci su WhatsApp o al +39 334 198 9193, oppure usa il modulo di contatto del sito. Ti rispondiamo noi, di persona.' },
        { p: 'Se ritieni che il trattamento non sia corretto, hai diritto di rivolgerti al Garante per la protezione dei dati personali.' },
      ],
    },
    {
      titolo: '8. Modifiche a questa informativa',
      blocchi: [{ p: 'Se cambieremo i servizi o gli strumenti che usiamo, aggiorneremo questa pagina e la data in alto. Ti invitiamo a rileggerla ogni tanto.' }],
    },
  ],
};
