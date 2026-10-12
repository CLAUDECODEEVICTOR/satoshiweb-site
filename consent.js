/* Cookie consent — Satoshi Web
   Banner informativo: nessuno strumento di statistica è attivo. Il codice GA4 resta solo se in futuro verrà definito SW_GA_ID (oggi non lo è).
   Salva nel browser solo l'avviso già visto (chiave sw_consent). */
(function () {
  var KEY = 'sw_consent';

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadGA() {
    var id = window.SW_GA_ID;
    if (!id || window.__swGaLoaded) return;
    window.__swGaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true });
  }

  function removeBanner() {
    var b = document.getElementById('sw-cookie');
    if (b) b.parentNode.removeChild(b);
  }

  function accept() { set('seen'); removeBanner(); }

  var choice = get();
  if (choice === 'granted') { loadGA(); return; }
  if (choice === 'denied' || choice === 'seen') { return; }

  // Nessuna scelta ancora: mostra il banner
  var en = (document.documentElement.lang || 'it').toLowerCase().indexOf('en') === 0;
  var T = en ? {
    text: 'This page uses only technical storage and no statistics or profiling tools. Fonts are loaded from Fontshare, a third-party service.',
    accept: 'OK', link: 'Privacy Policy'
  } : {
    text: 'Questa pagina usa solo memorizzazione tecnica e non attiva strumenti di statistica o profilazione. I font sono caricati da Fontshare, un servizio di terzi.',
    accept: 'Ho capito', link: 'Privacy Policy'
  };

  function render() {
    if (document.getElementById('sw-cookie')) return;

    var css = '#sw-cookie{position:fixed;right:16px;bottom:16px;z-index:9999;'
      + 'width:min(400px,calc(100vw - 32px));background:#fff;color:#17130f;'
      + 'border:1px solid rgba(23,19,15,.14);border-radius:16px;'
      + 'box-shadow:0 20px 50px -20px rgba(23,19,15,.35);'
      + 'padding:18px 20px;font-family:"Satoshi",system-ui,sans-serif;line-height:1.5;'
      + 'animation:sw-ck-in .3s ease both}'
      + '@keyframes sw-ck-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}'
      + '#sw-cookie p{margin:0 0 14px;font-size:.92rem;color:#3a352f}'
      + '#sw-cookie a{color:#9a5d00;font-weight:600;text-decoration:underline}'
      + '#sw-cookie .sw-ck-row{display:flex;gap:10px;flex-wrap:wrap}'
      + '#sw-cookie button{flex:1;min-width:120px;cursor:pointer;font-family:inherit;font-weight:700;'
      + 'font-size:.92rem;padding:11px 16px;border-radius:999px;border:1px solid rgba(23,19,15,.18);'
      + 'transition:transform .12s ease,box-shadow .12s ease}'
      + '#sw-cookie button:active{transform:scale(.98)}'
      + '#sw-cookie .sw-ck-accept{background:#F5A623;border-color:#F5A623;color:#17130f}'
      + '#sw-cookie .sw-ck-reject{background:transparent;color:#17130f}'
      + '@media(max-width:400px){#sw-cookie .sw-ck-row{flex-direction:column}}';

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.id = 'sw-cookie';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', en ? 'Cookie consent' : 'Consenso cookie');

    var p = document.createElement('p');
    p.textContent = T.text + ' ';
    var a = document.createElement('a');
    a.href = '/privacy/';
    a.textContent = T.link;
    p.appendChild(a);
    p.appendChild(document.createTextNode('.'));

    var row = document.createElement('div');
    row.className = 'sw-ck-row';
    var bAccept = document.createElement('button');
    bAccept.type = 'button';
    bAccept.className = 'sw-ck-accept';
    bAccept.textContent = T.accept;
    bAccept.addEventListener('click', accept);
    row.appendChild(bAccept);

    wrap.appendChild(p);
    wrap.appendChild(row);
    document.body.appendChild(wrap);
  }

  if (document.body) render();
  else document.addEventListener('DOMContentLoaded', render);
})();
