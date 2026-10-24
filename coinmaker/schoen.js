/* schoen.js – Coin Maker, Schön-Runde (23.10.2026). Nur Darstellung.
   Erwachsenen-App: Coin Maker bleibt ein kleines, lebendiges Zeichen im Kopf (atmet sanft, goldener Schein),
   nie ein grosses Maskottchen. Sobald die Aura-Posen da sind (AURA_DA), zeigt das Zeichen die Aura-Figur
   und folgt den Posen der App (freude/hebel/kuchen = freut, winken/erzaehlen = winkt, sonst idle). */
window.AURA_DA = true;    /* auf true, sobald aura/idle.webp, winkt.webp, freut.webp, schlaeft.webp im Ordner liegen */
(function () {
  "use strict";
  var d = document;
  function los() {
    var fig = d.getElementById("cmfig"); if (!fig) return;
    d.documentElement.classList.add("cm-lebt");
    if (window.AURA_DA) d.documentElement.classList.add("cm-aura");
    /* Die Aura-Posen kommen per CSS (schoen.css, nach data-pose). Kein Eingriff in die Bilder: runde8.js hält dort das Maskottchen fest. */
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", los); else setTimeout(los, 0);
})();
