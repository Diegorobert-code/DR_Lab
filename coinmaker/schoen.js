/* schoen.js – Coin Maker, Schön-Runde (23.10.2026). Nur Darstellung.
   Erwachsenen-App: Coin Maker bleibt ein kleines, lebendiges Zeichen im Kopf (atmet sanft, goldener Schein),
   nie ein grosses Maskottchen. Sobald die Aura-Posen da sind (AURA_DA), zeigt das Zeichen die Aura-Figur
   und folgt den Posen der App (freude/hebel = freut, winken = winkt, leer = schlaeft, sonst idle). */
window.AURA_DA = false;   /* auf true, sobald aura/idle.webp, winkt.webp, freut.webp, schlaeft.webp im Ordner liegen */
(function () {
  "use strict";
  var d = document;
  function los() {
    var fig = d.getElementById("cmfig"); if (!fig) return;
    d.documentElement.classList.add("cm-lebt");
    if (!window.AURA_DA) return;
    var B = "aura/";
    d.documentElement.classList.add("cm-aura");
    var ZU = { freude: "freut", hebel: "freut", winken: "winkt", leer: "schlaeft" };
    function setz(im) {
      var s = im.getAttribute("src") || "";
      if (/aura\/[a-z]+\.webp$/.test(s)) return;
      var m = /posen\/([a-z]+)\.jpg/.exec(s);
      im.setAttribute("src", B + ((m && ZU[m[1]]) || "idle") + ".webp");
    }
    function alle() { [].forEach.call(fig.querySelectorAll(".cm-fig-in img"), setz); }
    alle();
    new MutationObserver(alle).observe(fig, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", los); else setTimeout(los, 0);
})();
