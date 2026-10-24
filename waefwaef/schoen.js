/* schoen.js – Wäf Wäf, Schön-Runde (23.10.2026): Wäf Wäf als Aura-Figur im Herzen des Startbilds. Nur Darstellung.
   Startbild: Bühne in warmem Abendlicht, Wäf Wäf atmet, winkt zur Begrüssung, freut sich beim Antippen.
   Tag-Kopf: Sind die Aura-Posen da (AURA_DA), zeigt #pup die freigestellte Figur und wechselt mit der Stimmung
   der App die Pose (hop/wiggle = freut, r4-wink = winkt, schlaf = schlaeft). Ohne Posen bleibt das bisherige Bild.
   Wäf Wäf bleibt die Figur der App: kein bestimmter echter Hund. */
window.AURA_DA = true;    /* auf true, sobald aura/idle.webp, winkt.webp, freut.webp, schlaeft.webp und szene.webp im Ordner liegen */
window.AURA_LIDER = false;
if (window.AURA_DA) window.POSEN_DA = [];
(function () {
  "use strict";
  var d = document;
  function start() {
    var st = d.getElementById("start"), ring = st && st.querySelector(".ring");
    if (!st || !ring || !window.Aura || st.querySelector(".aura-buehne")) return;
    d.documentElement.classList.add("waef-aura");
    var bild = ring.querySelector("img");
    var b = d.createElement("div");
    b.className = "aura-buehne aura-start";
    b.setAttribute("role", "img");
    b.setAttribute("aria-label", "Wäf Wäf, ein kleiner weisser Hund mit blauem Halstuch, freut sich auf dich");
    if (window.AURA_DA) { b.classList.add("mit-szene"); b.style.setProperty("--aura-szene", 'url("' + new URL("aura/szene.webp", d.baseURI).href + '")'); }
    ring.parentNode.insertBefore(b, ring);
    var f = Aura.baue(b, { ersatz: bild ? bild.getAttribute("src") : "figur.jpg" });
    setTimeout(function () { f.pose("winkt", 2400); }, 700);
    b.addEventListener("pointerdown", function (e) { f.blitz(e); f.pose(f.jetzt === "freut" ? "winkt" : "freut", 1900); }, { passive: true });
  }
  function pup() {
    if (!window.AURA_DA) return;
    var p = d.getElementById("pup"); if (!p) return;
    var B = window.Aura ? Aura.basis : "aura/";
    d.documentElement.classList.add("waef-aura-pup");
    p.src = B + "idle.webp"; p.dataset.grundbild = B + "idle.webp";
    var ZU = [["schlaf", "schlaeft"], ["r4-wink", "winkt"], ["hop", "freut"], ["wiggle", "freut"]];
    var jetzt = "idle";
    function zeige() {
      var z = "idle";
      for (var i = 0; i < ZU.length; i++) if (p.classList.contains(ZU[i][0])) { z = ZU[i][1]; break; }
      if (z === jetzt && /aura\/[a-z]+\.webp$/.test(p.src)) return;
      jetzt = z; p.src = B + z + ".webp";
    }
    new MutationObserver(zeige).observe(p, { attributes: true, attributeFilter: ["class", "src"] });
  }
  function los() { try { start(); } catch (e) {} try { pup(); } catch (e) {} }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", los); else los();
})();
