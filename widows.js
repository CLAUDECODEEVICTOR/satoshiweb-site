/* Anti-orfani tipografici (italiano) per le pagine separate.
   Lega articoli, preposizioni e congiunzioni alla parola che segue con uno
   spazio unificatore, cosi nessuna riga chiude su una parolina. */
(function () {
  var NBSP = String.fromCharCode(160);
  function fixItalianWidows() {
    if ((document.documentElement.lang || 'it').toLowerCase().indexOf('it') !== 0) return;
    var pattern = /\b(il|la|lo|i|le|gli|un|una|uno|di|da|in|con|su|per|e|o|a|al|ai|agli|alla|allo|alle|del|dei|degli|della|dello|delle|dal|dai|dagli|dalla|dallo|dalle|nel|nei|negli|nella|nello|nelle|sul|sui|sugli|sulla|sullo|sulle|col|coi|è|ed|od|non|piu|più|gia|già|poi|tra|fra|ma|se|che|ne|né|come|anche|dove|quando|mentre|senza|sotto|sopra|dopo|prima|fino|verso|cioe|cioè|oppure|quindi|perche|perché|sia|ogni|sua|suo|sue|suoi|mia|mio|tua|tuo)\s+/gi;
    var selectors = 'h1, h2, h3, h4, h5, p, li, td, th, blockquote, figcaption, summary, .lead, .sub, .cap, .bubble, .note, .stat, .tier p, .case-cap';
    var skip = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1 };
    document.querySelectorAll(selectors).forEach(function (el) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          return (n.parentElement && skip[n.parentElement.tagName]) ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
        }
      });
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        var fixed = n.textContent.replace(pattern, function (_, w) { return w + NBSP; });
        if (fixed !== n.textContent) n.textContent = fixed;
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixItalianWidows);
  } else {
    fixItalianWidows();
  }
})();
