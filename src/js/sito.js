/* Satoshi Web: JavaScript unico. Nessuna libreria. Il contenuto è già nel sorgente HTML. */
(function () {
  'use strict';
  var cfg = window.SW || {};
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

  /* Campi facoltativi del form: senza JavaScript sono sempre visibili. Su mobile e tablet (< 1200) si chiudono
     dietro "Aggiungi dettagli", sul desktop restano aperti (come nelle tavole V3.1). */
  var det = document.getElementById('dettagli');
  var tog = document.getElementById('dettagli-toggle');
  if (det && tog && window.matchMedia) {
    var largo = matchMedia('(min-width: 1200px)');
    var aggiorna = function () {
      if (largo.matches) { det.hidden = false; tog.hidden = true; }
      else { tog.hidden = false; det.hidden = tog.getAttribute('aria-expanded') !== 'true'; }
    };
    tog.addEventListener('click', function () {
      tog.setAttribute('aria-expanded', tog.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
      aggiorna();
    });
    if (largo.addEventListener) largo.addEventListener('change', aggiorna);
    aggiorna();
  }

  /* Pagina grazie: nome e attività arrivano da sessionStorage, mai dall'URL (Fase 4). */
  void ridotto;
})();
