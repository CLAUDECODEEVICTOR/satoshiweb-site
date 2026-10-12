/* Satoshi Web: JavaScript unico, nessuna libreria. Il contenuto è già nel sorgente HTML: qui c'è solo il comportamento. */
(function () {
  'use strict';
  document.documentElement.setAttribute('data-js', '');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ridotto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NUMERO = '393341989193';

  /* COME FUNZIONA. Scorre da solo ogni 4 secondi solo quando la sezione è visibile. Pausa / Riprendi (WCAG 2.2.2).
     Con "riduci movimento" parte già in pausa. Toccando un passo, l'animazione si ferma. */
  var come = document.getElementById('come');
  if (come) {
    var nodi = $$('.nodo', come), slide = $$('.slide', come), numeri = $$('.numero', come);
    var barra = $('.barra', come), live = $('[aria-live]', come);
    var pausa = $$('button', come).filter(function (b) { return !b.classList.contains('nodo'); })[0];
    var passo = 0, inPausa = ridotto, timer = null;
    var mostra = function (i) {
      passo = i;
      nodi.forEach(function (n, k) {
        if (k === i) n.setAttribute('aria-current', 'step'); else n.setAttribute('aria-current', 'false');
        if (k <= i) n.setAttribute('data-fatto', ''); else n.removeAttribute('data-fatto');
      });
      slide.forEach(function (s, k) {
        s.setAttribute('data-stato', k === i ? 'attivo' : k < i ? 'passato' : 'prossimo');
        s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
      });
      numeri.forEach(function (n, k) { if (k === i) n.setAttribute('data-attivo', ''); else n.removeAttribute('data-attivo'); });
      if (barra) barra.style.setProperty('--p', (i / (nodi.length - 1) * 100) + '%');
    };
    var etichetta = function () {
      if (!pausa) return;
      pausa.lastChild.nodeValue = inPausa ? 'Riprendi' : 'Pausa';
      var d = $('path', pausa);
      if (d) d.setAttribute('d', inPausa ? 'M8 5v14l11-7z' : 'M7 5h4v14H7zM13 5h4v14h-4z');
      /* Mentre scorre da solo l'area non va annunciata a ogni cambio: lo si fa quando è l'utente a scegliere. */
      if (live) live.setAttribute('aria-live', inPausa ? 'polite' : 'off');
    };
    var ferma = function () { if (timer) clearInterval(timer); timer = null; };
    var avvia = function () {
      if (timer || inPausa) return;
      timer = setInterval(function () { mostra((passo + 1) % nodi.length); }, 4000);
    };
    nodi.forEach(function (n, k) {
      n.addEventListener('click', function () { ferma(); inPausa = true; mostra(k); etichetta(); });
    });
    if (pausa) pausa.addEventListener('click', function () {
      inPausa = !inPausa;
      if (inPausa) ferma(); else avvia();
      etichetta();
    });
    mostra(0);
    etichetta();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (v) { if (v[0].isIntersecting) avvia(); else ferma(); }, { threshold: 0.35 }).observe(come);
    } else avvia();
  }

  /* STRUMENTI. La lista scelta diventa il testo precompilato del messaggio WhatsApp. */
  var strumenti = document.getElementById('strumenti');
  if (strumenti) {
    var nomi = ['sito web su misura', 'prenotazioni', 'pannello di gestione', 'area clienti'];
    var bott = $$('.strum', strumenti);
    var conta = $('[aria-live]', strumenti);
    var wa = $$('a[href^="https://wa.me"]', strumenti).pop();
    var aggiorna = function () {
      var scelti = bott.map(function (b, k) { return b.getAttribute('aria-pressed') === 'true' ? nomi[k] : null; }).filter(Boolean);
      var testo = scelti.length ? 'Ciao Edoardo, per la mia attività mi servono: ' + scelti.join(', ') + '.' : 'Ciao Edoardo, vorrei un sito per la mia attività.';
      conta.textContent = scelti.length ? (scelti.length === 1 ? '1 strumento scelto' : scelti.length + ' strumenti scelti') : 'Nessuno strumento scelto';
      wa.href = 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(testo);
      wa.lastChild.nodeValue = ' ' + (scelti.length ? 'Manda la lista su WhatsApp' : 'Scrivimi su WhatsApp');
    };
    bott.forEach(function (b) {
      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        aggiorna();
      });
    });
  }

  /* DOMANDE. Una risposta aperta alla volta. */
  var domande = document.getElementById('domande');
  if (domande) {
    var bq = $$('button[aria-controls]', domande);
    bq.forEach(function (b) {
      b.addEventListener('click', function () {
        var apri = b.getAttribute('aria-expanded') !== 'true';
        bq.forEach(function (x) {
          var aperta = x === b && apri;
          x.setAttribute('aria-expanded', aperta ? 'true' : 'false');
          var r = document.getElementById(x.getAttribute('aria-controls'));
          if (aperta) r.setAttribute('data-aperta', ''); else r.removeAttribute('data-aperta');
        });
      });
    });
  }

  /* FORM DI CONTATTO. Seconda scelta dopo WhatsApp. Invio a Formspree; nessun dato personale nell'URL.
     Senza JavaScript resta il POST nativo. Honeypot _gotcha: se compilato l'invio è scartato in silenzio. */
  var form = document.getElementById('form-contatto');
  if (form) {
    var inviando = false;
    var avvio = Date.now();
    var bottone = $('button[type=submit]', form);
    var etich = bottone.textContent;
    form.noValidate = true;
    var stato = document.createElement('div');
    stato.setAttribute('role', 'alert');
    form.insertBefore(stato, bottone.nextSibling);
    var messaggi = { nome: 'Scrivi il tuo nome.', contatto: 'Scrivi un numero di telefono o un’email.', messaggio: 'Scrivi cosa ti serve, anche in poche parole.' };
    var campi = ['nome', 'contatto', 'messaggio'].map(function (n) { return form.elements[n]; });
    var errore = function (c, testo) {
      var e = document.getElementById('err-' + c.name);
      if (!e) { e = document.createElement('div'); e.id = 'err-' + c.name; e.className = 'form-errore'; c.parentNode.appendChild(e); }
      if (testo) { e.textContent = '! ' + testo; c.setAttribute('aria-invalid', 'true'); c.setAttribute('aria-describedby', e.id); }
      else { e.textContent = ''; c.removeAttribute('aria-invalid'); c.removeAttribute('aria-describedby'); }
    };
    var valido = function (c) { return c.value.replace(/^\s+|\s+$/g, '').length >= 2 ? '' : messaggi[c.name]; };
    campi.forEach(function (c) {
      c.addEventListener('blur', function () { if (c.value || c.getAttribute('aria-invalid')) errore(c, valido(c)); });
      c.addEventListener('input', function () { if (c.getAttribute('aria-invalid')) errore(c, valido(c)); });
    });
    var waForm = 'https://wa.me/' + NUMERO;
    var fallo = function (testo) {
      stato.textContent = '';
      var p = document.createElement('p'); p.className = 'form-errore'; p.textContent = '! ' + testo + ' ';
      var a = document.createElement('a'); a.href = waForm; a.textContent = 'Scrivimi su WhatsApp';
      p.appendChild(a); stato.appendChild(p);
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (inviando) return;
      stato.textContent = '';
      var primo = null;
      campi.forEach(function (c) { var m = valido(c); errore(c, m); if (m && !primo) primo = c; });
      if (primo) { primo.focus(); return; }
      if (form.elements._gotcha.value) { location.assign('/grazie'); return; }
      if (Date.now() - avvio < 3000) { fallo('Aspetta un momento e riprova.'); return; }
      if (navigator.onLine === false) { fallo('Sembra che non ci sia connessione. Riprova tra poco, oppure scrivimi su WhatsApp.'); return; }
      inviando = true; bottone.disabled = true; bottone.setAttribute('aria-busy', 'true'); bottone.textContent = 'Invio...';
      var ctrl = window.AbortController ? new AbortController() : null;
      var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error(r.status); location.assign('/grazie'); })
        .catch(function () {
          clearTimeout(t); inviando = false; bottone.disabled = false; bottone.removeAttribute('aria-busy'); bottone.textContent = etich;
          fallo('Non è partita. Riprova, oppure scrivimi su WhatsApp.');
        });
    });
  }
})();
