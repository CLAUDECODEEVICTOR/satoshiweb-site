/* Satoshi Web: JavaScript unico. Nessuna libreria. Il contenuto è già nel sorgente HTML. */
(function () {
  'use strict';
  var cfg = window.SW || {};
  document.documentElement.setAttribute('data-js', '');
  var ridotto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Tracking: [data-track="evento"] su qualunque elemento. Beacon già in uso (Victor Analytics)
     e gtag solo se consent.js l'ha caricato dopo il consenso. */
  function track(evento, extra) {
    try {
      var corpo = { site: cfg.sito, event: evento, page: location.pathname };
      if (extra) for (var k in extra) corpo[k] = extra[k];
      if (cfg.beacon && navigator.sendBeacon) navigator.sendBeacon(cfg.beacon, new Blob([JSON.stringify(corpo)], { type: 'text/plain' }));
      if (typeof window.gtag === 'function') window.gtag('event', evento, extra || {});
    } catch (e) {}
  }
  window.swTrack = track;
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'), { posizione: el.getAttribute('data-pos') || undefined });
  });

  /* Barra fissa: compare quando la CTA hero esce dallo schermo, sparisce quando rientra. */
  var cta = document.getElementById('hero-cta');
  var barra = document.getElementById('barra');
  if (cta && barra && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (voci) {
      barra.setAttribute('data-visibile', voci[0].isIntersecting ? 'false' : 'true');
    }).observe(cta);
  }
  /* Con la tastiera aperta la barra non deve coprire il campo attivo. */
  if (barra && window.visualViewport) {
    var base = window.innerHeight;
    visualViewport.addEventListener('resize', function () {
      document.body.classList.toggle('tastiera-aperta', visualViewport.height < base * 0.75);
    });
  }

  /* Menu mobile: aria-expanded, focus chiuso dentro il pannello, Esc chiude, il focus torna al pulsante. */
  var apri = document.getElementById('apri-menu');
  var menu = document.getElementById('menu');
  var chiudi = document.getElementById('chiudi-menu');
  if (apri && menu && chiudi) {
    var focalizzabili = 'a[href], button:not([disabled])';
    function imposta(aperto) {
      menu.hidden = !aperto;
      apri.setAttribute('aria-expanded', aperto ? 'true' : 'false');
      document.body.classList.toggle('menu-aperto', aperto);
      if (aperto) chiudi.focus(); else apri.focus();
    }
    apri.addEventListener('click', function () { imposta(true); });
    chiudi.addEventListener('click', function () { imposta(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) imposta(false); });
    document.addEventListener('keydown', function (e) {
      if (menu.hidden) return;
      if (e.key === 'Escape') { imposta(false); return; }
      if (e.key !== 'Tab') return;
      var el = menu.querySelectorAll(focalizzabili);
      var primo = el[0], ultimo = el[el.length - 1];
      if (e.shiftKey && document.activeElement === primo) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primo.focus(); }
    });
  }

  /* Case study: i blocchi numerati entrano quando arrivano nella schermata (solo con .anim, cioè senza movimento ridotto). */
  var blocchi = document.querySelectorAll('.caso-blocco');
  if (blocchi.length && document.documentElement.classList.contains('anim')) {
    var vista = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) { if (v.isIntersecting) { v.target.classList.add('visto'); vista.unobserve(v.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    blocchi.forEach(function (b) { vista.observe(b); });
  }

  /* Campi facoltativi del form: senza JavaScript sono sempre visibili. Su mobile e tablet (< 1200) si chiudono
     dietro "Aggiungi dettagli", sul desktop restano aperti (come nelle tavole V3.1). Chiusi = inert, fuori dalla tastiera. */
  var det = document.getElementById('dettagli');
  var tog = document.getElementById('dettagli-toggle');
  if (det && tog && window.matchMedia) {
    var largo = matchMedia('(min-width: 1200px)');
    var chiudi = function (si) {
      if (si) { det.setAttribute('data-chiuso', ''); det.setAttribute('inert', ''); }
      else { det.removeAttribute('data-chiuso'); det.removeAttribute('inert'); }
    };
    var aggiorna = function () {
      if (largo.matches) { chiudi(false); tog.hidden = true; }
      else { tog.hidden = false; chiudi(tog.getAttribute('aria-expanded') !== 'true'); }
    };
    tog.addEventListener('click', function () {
      tog.setAttribute('aria-expanded', tog.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
      aggiorna();
    });
    if (largo.addEventListener) largo.addEventListener('change', aggiorna);
    aggiorna();
  }

  /* FORM DI CONTATTO (Fase 4). Invio con fetch a Formspree. Nessun dato personale nell'URL: nome e attività
     per la pagina /grazie/ passano da sessionStorage. Senza JavaScript resta il POST nativo con la validazione del browser. */
  var form = document.getElementById('form-contatto');
  if (form) {
    var avvio = Date.now();
    var invia = document.getElementById('form-invia');
    var stato = document.getElementById('form-stato');
    var inviando = false;
    var iniziato = false;
    var WA = (document.querySelector('.contatti__testo a[href^="https://wa.me"]') || {}).href || 'https://wa.me/393341989193';
    form.noValidate = true;

    var messaggi = {
      nome: 'Scrivi il tuo nome.',
      attivita: 'Scrivi il nome della tua attività.',
      telefono: 'Scrivi un numero di telefono, con o senza prefisso.',
      telefonoFormato: 'Controlla il numero: servono da 8 a 15 cifre.'
    };
    function controlla(campo) {
      var v = campo.value.replace(/^\s+|\s+$/g, '');
      var n = campo.name;
      if (n === 'nome' || n === 'attivita') return v.length < 2 ? messaggi[n] : '';
      if (n === 'telefono') {
        if (!v) return messaggi.telefono;
        var cifre = v.replace(/[^0-9]/g, '').length;
        if (!/^[0-9+()\s.\-]+$/.test(v) || cifre < 8 || cifre > 15) return messaggi.telefonoFormato;
      }
      return '';
    }
    function mostra(campo, testo) {
      var err = document.getElementById('err-' + campo.name);
      if (!err) return;
      if (testo) {
        err.textContent = testo;
        err.setAttribute('role', 'alert');
        err.hidden = false;
        campo.setAttribute('aria-invalid', 'true');
      } else {
        err.hidden = true;
        err.textContent = '';
        campo.removeAttribute('aria-invalid');
      }
    }
    function obbligatori() { return [form.elements.nome, form.elements.attivita, form.elements.telefono]; }
    obbligatori().forEach(function (c) {
      c.addEventListener('blur', function () { if (c.value || c.getAttribute('aria-invalid')) mostra(c, controlla(c)); });
      c.addEventListener('input', function () { if (c.getAttribute('aria-invalid')) mostra(c, controlla(c)); });
    });
    form.addEventListener('focusin', function () {
      if (!iniziato) { iniziato = true; track('form_start'); }
    });

    function messaggio(html, conWhatsapp) {
      stato.textContent = '';
      var p = document.createElement('p');
      p.className = 'form__errore';
      p.textContent = html;
      stato.appendChild(p);
      if (conWhatsapp) {
        var a = document.createElement('a');
        a.href = WA;
        a.className = 'form__wa';
        a.textContent = 'Scrivimi su WhatsApp';
        a.setAttribute('data-track', 'whatsapp_click');
        a.setAttribute('data-pos', 'form_errore');
        stato.appendChild(a);
      }
    }
    function riabilita() {
      inviando = false;
      invia.disabled = false;
      invia.removeAttribute('aria-busy');
      invia.textContent = invia.getAttribute('data-etichetta');
    }
    function finito(dati) {
      try { sessionStorage.setItem('sw_richiesta', JSON.stringify({ nome: dati.nome, attivita: dati.attivita })); } catch (e) {}
      location.assign('/grazie/');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (inviando) return;
      stato.textContent = '';
      var primo = null;
      obbligatori().forEach(function (c) {
        var m = controlla(c);
        mostra(c, m);
        if (m && !primo) primo = c;
      });
      if (primo) { track('form_error', { motivo: 'validazione' }); primo.focus(); return; }
      var dati = {
        nome: form.elements.nome.value.replace(/^\s+|\s+$/g, ''),
        attivita: form.elements.attivita.value.replace(/^\s+|\s+$/g, '')
      };
      track('form_submit');
      /* Casella trappola compilata: scartato in silenzio. Invio troppo rapido: messaggio semplice, nessun invio. */
      if (form.elements._gotcha.value) { finito(dati); return; }
      if (Date.now() - avvio < 3000) { messaggio('Aspetta un momento e riprova.', false); return; }
      if (navigator.onLine === false) {
        track('form_error', { motivo: 'rete' });
        messaggio('Sembra che non ci sia connessione. Riprova tra poco, oppure scrivimi su WhatsApp.', true);
        return;
      }
      inviando = true;
      invia.disabled = true;
      invia.setAttribute('aria-busy', 'true');
      invia.textContent = 'Invio...';
      var ctrl = window.AbortController ? new AbortController() : null;
      var tempo = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) {
        clearTimeout(tempo);
        if (r.ok) { track('form_success'); track('conversion'); finito(dati); return; }
        throw new Error('stato ' + r.status);
      }).catch(function () {
        clearTimeout(tempo);
        track('form_error', { motivo: 'rete' });
        riabilita();
        messaggio('Non è partita. Riprova, oppure scrivimi su WhatsApp.', true);
      });
    });
  }

  /* Pagina /grazie/: nome e attività da sessionStorage (mai dall'URL), inseriti come testo. */
  var grazieNome = document.getElementById('grazie-titolo');
  if (grazieNome) {
    try {
      var r = JSON.parse(sessionStorage.getItem('sw_richiesta') || 'null');
      if (r && r.nome) {
        grazieNome.textContent = 'Fatto, ' + r.nome + '. Ora tocca a\u00A0me.';
        var att = document.getElementById('grazie-attivita');
        if (att && r.attivita) att.textContent = 'Ho i dati di\u00A0' + r.attivita + '. Ti scrivo io al\u00A0numero che mi hai lasciato.';
      }
      sessionStorage.removeItem('sw_richiesta');
    } catch (e) {}
  }

  void ridotto;
})();
