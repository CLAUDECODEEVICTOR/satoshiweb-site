// Informativa privacy della V4: BOZZA scritta sul comportamento effettivo del sito (verificato il 12 ottobre 2026), non certificata
// legalmente. Le parti riprese dall'informativa già pubblicata (base giuridica, conservazione, diritti) restano da far confermare.
// Struttura dei blocchi: { p } paragrafo, { b, p } paragrafo con apertura in grassetto, { lista }, { elenco }, { tabella }.

export const privacy = {
  titolo: 'Privacy e cookie',
  lead: 'Come tratto i dati personali raccolti tramite questo sito, quali cookie e strumenti usa e quali diritti hai.',
  aggiornamento: '12 ottobre 2026',
  sezioni: [
    {
      titolo: '1. Chi tratta i tuoi dati',
      blocchi: [
        { elenco: [
          ['Titolare del trattamento', 'Edoardo De Benedictis (Satoshi Web)'],
          ['Partita IVA', '18523731000'],
          ['Sede', 'Civitavecchia (RM), Italia'],
          ['Contatti', 'email info@satoshiweb.it, WhatsApp e telefono +39 334 198 9193'],
        ] },
        { p: 'Questa informativa vale per il sito satoshiweb.it. Mi trovi anche su Instagram e su Google Maps: sono servizi di terzi, con le loro informative.' },
      ],
    },
    {
      titolo: '2. Quali dati raccolgo',
      blocchi: [
        { b: 'Il modulo di contatto.', p: 'Se lo compili mi lasci nome, un contatto (telefono o email) e il messaggio che scrivi. Mi servono solo per risponderti. Compilare il modulo è facoltativo: puoi anche scrivermi su WhatsApp. Senza questi dati, però, non posso rispondere alla richiesta fatta con il modulo.' },
        { b: 'WhatsApp.', p: 'I pulsanti WhatsApp aprono la tua app con un messaggio già scritto. Da quel momento la conversazione passa dal servizio WhatsApp, che ha una propria informativa.' },
        { b: 'Dati tecnici di navigazione.', p: 'Come avviene per ogni sito, il servizio che lo ospita può registrare dati tecnici delle richieste, come indirizzo IP, tipo di browser e pagina richiesta, per far funzionare e proteggere il sito.' },
        { b: 'Nel tuo browser.', p: 'Le pagine principali del sito non impostano cookie e non salvano dati nel browser. Un caso diverso riguarda alcune pagine di approfondimento, descritto nella sezione 5.' },
      ],
    },
    {
      titolo: '3. Perché li uso e con quale base giuridica',
      blocchi: [
        { b: 'Rispondere alle tue richieste ed eventualmente prepararti un preventivo.', p: 'Base giuridica: le misure precontrattuali che chiedi tu stesso scrivendomi e, dove serve, il tuo consenso.' },
        { b: 'Far funzionare e proteggere il sito.', p: 'Base giuridica: il mio legittimo interesse a tenere il sito funzionante e sicuro.' },
        { p: 'Non faccio profilazione e non prendo decisioni basate su trattamenti automatizzati.' },
      ],
    },
    {
      titolo: '4. A chi comunico i dati',
      blocchi: [
        { p: 'Non vendo i tuoi dati. Per far funzionare il sito mi appoggio a questi servizi:' },
        { tabella: {
          intestazione: ['Servizio', 'A cosa serve'],
          righe: [
            ['Vercel', 'Ospita il sito e ne serve le pagine'],
            ['Formspree', 'Riceve i messaggi inviati con il modulo di contatto e me li inoltra'],
            ['WhatsApp', 'Messaggi, se scegli di scrivermi lì'],
          ],
        } },
        { p: 'Alcuni di questi servizi hanno sede o server fuori dall\'Unione Europea, in particolare negli Stati Uniti. Le garanzie per questi trasferimenti sono quelle previste dai rispettivi fornitori nelle loro informative.' },
      ],
    },
    {
      titolo: '5. Cookie e strumenti di analisi',
      blocchi: [
        { b: 'Pagine principali.', p: 'La home, le pagine dei lavori, questa pagina e la pagina di conferma non impostano cookie, non usano strumenti di analisi o di profilazione e caricano i font dal sito stesso, senza richiamare servizi di terzi.' },
        { b: 'Pagine di approfondimento.', p: 'Le pagine sui servizi (siti web a Civitavecchia, app e sistemi, chatbot WhatsApp, farsi trovare dalle AI) mostrano un breve avviso e salvano nel browser soltanto il fatto che lo hai già visto, per non ripeterlo. Non attivano strumenti di statistica o di profilazione. Caricano però i font da Fontshare, un servizio di terzi: per questo il tuo indirizzo IP viene comunicato a quel servizio.' },
        { p: 'Puoi comunque bloccare o cancellare i cookie dalle impostazioni del browser: il sito resta consultabile.' },
      ],
    },
    {
      titolo: '6. Per quanto tempo conservo i dati',
      blocchi: [
        { p: 'I messaggi del modulo restano per il tempo necessario a gestire la tua richiesta e l\'eventuale rapporto che ne nasce, poi vengono cancellati.' },
      ],
    },
    {
      titolo: '7. I tuoi diritti',
      blocchi: [
        { p: 'Secondo il Regolamento europeo 2016/679 (GDPR) puoi in ogni momento:' },
        { lista: [
          'sapere quali tuoi dati tratto e chiederne una copia;',
          'farli correggere o aggiornare;',
          'chiederne la cancellazione;',
          'limitarne il trattamento od opporti;',
          'ricevere i dati che mi hai fornito in un formato di uso comune, dove applicabile;',
          'revocare il consenso che hai dato, senza che questo tocchi ciò che è stato fatto prima.',
        ] },
        { p: 'Per esercitare questi diritti scrivi a info@satoshiweb.it o su WhatsApp al +39 334 198 9193. Ti rispondo io, di persona. Se ritieni che il trattamento non sia corretto, puoi rivolgerti al Garante per la protezione dei dati personali.' },
      ],
    },
    {
      titolo: '8. Modifiche a questa informativa',
      blocchi: [{ p: 'Se cambio i servizi o gli strumenti che uso, aggiorno questa pagina e la data in alto.' }],
    },
  ],
};
