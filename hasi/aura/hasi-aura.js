/* hasi-aura.js – Hasi im Stil «Aura» (wie Otti): 3D-Posen von Tinko (Satz 43) statt gezeichnetem SVG-Hasen.
   Posen aus aura/*.webp: idle, winkt, freut, schlaeft (alle mit geschlossenem Mund: Hasi spricht nie).
   Atmen (CSS), Blinzeln (Lider-Ebene nur über idle), Antippen mit Lichtblitz und Lichtpunkten,
   Posenwechsel als Schnitt mit Federn und Lichtschein (nie zwei Gesichter übereinander).
   Folgt den Posen der App (data-pose an #hasi, gesetzt von hasi() in hasi.js). Ändert nichts an der App-Logik.
   Die alten Posen-Fotos (posen/*.jpg über der Figur) werden nicht mehr angefragt: window.POSEN_DA = []. */
(function () {
  "use strict";
  var d = document, html = d.documentElement;
  var me = d.currentScript;
  var BASIS = me && me.src ? me.src.replace(/[^\/]*([?#].*)?$/, "") : "aura/";
  var RUHIG = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var POSEN = ["idle", "winkt", "freut", "schlaeft"];
  /* App-Posen (hasi.js) auf die vier Aura-Posen; alles andere ist die Ruhepose */
  var ZU = { winken: "winkt", verbeugen: "winkt", schild: "winkt", passt: "freut", daumen: "freut", huepfen: "freut", nicken: "freut", gaehnen: "schlaeft" };
  window.POSEN_DA = [];

  function los() {
    var buehne = d.getElementById("buehne"), hasi = d.getElementById("hasi");
    if (!buehne || !hasi || hasi.querySelector(".aura-figur")) return;
    html.classList.add("hasi-aura");

    var fig = d.createElement("div"); fig.className = "aura-figur"; fig.setAttribute("aria-hidden", "true"); fig.dataset.pose = "idle";
    fig.innerHTML = '<i class="aura-schein"></i><i class="aura-boden"></i><div class="aura-atem"></div>';
    var atem = fig.querySelector(".aura-atem"), bilder = {};
    POSEN.forEach(function (p) {
      var i = d.createElement("img"); i.className = "aura-pose" + (p === "idle" ? " an" : ""); i.dataset.p = p; i.alt = ""; i.decoding = "async";
      i.src = BASIS + p + ".webp"; atem.appendChild(i); bilder[p] = i;
    });
    var lider = d.createElement("img"); lider.className = "aura-pose aura-lider"; lider.alt = ""; lider.src = BASIS + "lider.webp"; atem.appendChild(lider);
    hasi.appendChild(fig);

    var jetzt = "idle", wechselT = 0;
    function zeige() {
      var p = ZU[hasi.getAttribute("data-pose")] || "idle";
      if (p === jetzt) return;
      lider.classList.remove("zu");
      bilder[jetzt].classList.remove("an"); bilder[p].classList.add("an");
      jetzt = p; fig.dataset.pose = p;
      fig.classList.remove("wechsel"); void fig.offsetWidth; fig.classList.add("wechsel");
      clearTimeout(wechselT); wechselT = setTimeout(function () { fig.classList.remove("wechsel"); }, 520);
    }
    if (window.MutationObserver) new MutationObserver(zeige).observe(hasi, { attributes: true, attributeFilter: ["data-pose"] });
    zeige();

    /* Blinzeln: Lider kurz über die Augen (nur in der Ruhepose) */
    function blinzel() {
      setTimeout(function () {
        if (jetzt === "idle" && !d.hidden) {
          lider.classList.add("zu");
          setTimeout(function () { lider.classList.remove("zu"); }, 130);
          if (Math.random() < .2) setTimeout(function () { lider.classList.add("zu"); setTimeout(function () { lider.classList.remove("zu"); }, 120); }, 300);
        }
        blinzel();
      }, 2600 + Math.random() * 4200);
    }
    blinzel();

    /* Antippen: Lichtblitz, kurzes Federn und Lichtpunkte, die aufsteigen */
    buehne.addEventListener("pointerdown", function (e) {
      fig.classList.remove("blitz"); void fig.offsetWidth; fig.classList.add("blitz");
      if (RUHIG) return;
      var r = buehne.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      for (var i = 0; i < 9; i++) {
        var f = d.createElement("i"), w = Math.random() * Math.PI * 2, s = 30 + Math.random() * 60;
        f.className = "aura-funke" + (i % 3 === 0 ? " v" : "");
        f.style.left = x + "px"; f.style.top = y + "px";
        f.style.setProperty("--dx", Math.round(Math.cos(w) * s) + "px");
        f.style.setProperty("--dy", Math.round(Math.sin(w) * s * .6 - 40 - Math.random() * 40) + "px");
        f.style.setProperty("--t", (0.8 + Math.random() * 0.6).toFixed(2) + "s");
        f.addEventListener("animationend", function () { this.remove(); });
        buehne.appendChild(f);
      }
    }, { passive: true });
    fig.addEventListener("animationend", function (e) { if (e.animationName === "hasiHopp") fig.classList.remove("blitz"); });
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", los); else los();
})();
