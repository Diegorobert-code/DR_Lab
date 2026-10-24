/* schoen.js – Rosa, Schön-Runde (23.10.2026): Rosa als Aura-Figur im Herzen des Startbilds. Nur Darstellung.
   Startbild: warme Bühne (Küche mit Fenster, sobald Tinkos Szene da ist), Rosa atmet, winkt zur Begrüssung,
   freut sich beim Antippen. Auf der Bühne der App zeigt #gfig die Aura-Posen, sobald AURA_DA gesetzt ist;
   bis dahin bleibt das bisherige Bild. */
window.AURA_DA = true;    /* auf true, sobald aura/idle.webp, winkt.webp, freut.webp, schlaeft.webp und szene.webp im Ordner liegen */
window.AURA_LIDER = false;
(function () {
  "use strict";
  var d = document;
  function start() {
    var st = d.getElementById("figurStart"), bild = st && st.querySelector(":scope > img");
    if (!st || !bild || !window.Aura || st.querySelector(".aura-buehne")) return;
    d.documentElement.classList.add("rosa-aura");
    var b = d.createElement("div");
    b.className = "aura-buehne aura-start";
    b.setAttribute("role", "img");
    b.setAttribute("aria-label", "Rosa, eine freundliche Grossmutter mit roter Brille, winkt dir zu");
    if (window.AURA_DA) { b.classList.add("mit-szene"); b.style.setProperty("--aura-szene", 'url("' + new URL("aura/szene.webp", d.baseURI).href + '")'); }
    bild.parentNode.insertBefore(b, bild);
    var f = Aura.baue(b, { ersatz: bild.getAttribute("src") });
    setTimeout(function () { f.pose("winkt", 2400); }, 700);
    b.addEventListener("pointerdown", function (e) { f.blitz(e); f.pose(f.jetzt === "freut" ? "winkt" : "freut", 1900); }, { passive: true });
  }
  function buehne() {
    if (!window.AURA_DA) return;
    var im = d.querySelector("#gfig img"); if (!im) return;
    var B = Aura.basis;
    d.documentElement.classList.add("rosa-aura-fig");
    var ZU = { winken: "winkt", lachen: "freut", herz: "freut", nicken: "freut", kerze: "schlaeft" };
    function zeige() {
      var m = /posen\/([a-z]+)\.jpg/.exec(im.getAttribute("src") || "");
      var z = m ? (ZU[m[1]] || "idle") : (/aura\/[a-z]+\.webp$/.test(im.src) ? null : "idle");
      if (z) im.src = B + z + ".webp";
    }
    zeige();
    new MutationObserver(zeige).observe(im, { attributes: true, attributeFilter: ["src"] });
  }
  function los() { try { start(); } catch (e) {} try { buehne(); } catch (e) {} }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", los); else los();
})();
