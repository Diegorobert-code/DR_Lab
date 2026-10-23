/* aura-figur.js – Otti im Stil «Aura» auf der Bühne: 3D-Posen aus aura/*.webp (idle, winkt, lacht, schlaeft) als Ebenen.
   Atmen (CSS), Blinzeln (Lider-Ebene über idle), Antippen mit Lichtblitz und Lichtpunkten, weiche Posenwechsel (0,3 s).
   Folgt der unsichtbar mitlaufenden Puppe (nova/puppe.js, Ereignis «puppe-zustand») und den Posen der App (#pose).
   Ändert nichts an der App-Logik. Nur aktiv mit html.tfw-aura (trickfilmwelt.js data-stil="aura"). */
(function () {
  "use strict";
  var d = document, html = d.documentElement;
  var me = d.currentScript;
  var BASIS = me && me.src ? me.src.replace(/[^\/]*([?#].*)?$/, "") : "aura/";
  var RUHIG = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var POSEN = ["idle", "winkt", "lacht", "schlaeft"];

  function los() {
    if (!html.classList.contains("tfw-aura")) return;
    var buehne = d.getElementById("buehne"), fw = d.getElementById("fw"), puppe = d.getElementById("puppe"), pose = d.getElementById("pose");
    if (!buehne || !fw || fw.querySelector(".aura-figur")) return;

    var fig = d.createElement("div"); fig.className = "aura-figur"; fig.setAttribute("aria-hidden", "true"); fig.dataset.pose = "idle";
    fig.innerHTML = '<i class="aura-schein"></i><i class="aura-boden"></i><div class="aura-atem"></div>';
    var atem = fig.querySelector(".aura-atem"), bilder = {};
    POSEN.forEach(function (p) {
      var i = d.createElement("img"); i.className = "aura-pose" + (p === "idle" ? " an" : ""); i.dataset.p = p; i.alt = ""; i.decoding = "async";
      i.src = BASIS + p + ".webp"; atem.appendChild(i); bilder[p] = i;
    });
    var lider = d.createElement("img"); lider.className = "aura-pose aura-lider"; lider.alt = ""; lider.src = BASIS + "lider.webp"; atem.appendChild(lider);
    fw.insertBefore(fig, fw.firstChild);

    /* Welche Pose? App-Pose (#pose) vor Schlaf vor Puppen-Zustand */
    var zustand = "ruhig", jetzt = "idle";
    function ausPuppe(z) { return z === "winkt" ? "winkt" : z === "freut" ? "lacht" : z === "schlaeft" ? "schlaeft" : "idle"; }
    function ausApp() {
      if (!pose || pose.style.opacity !== "1") return null;
      var m = /(winkt|lacht|schlaeft)/.exec(pose.getAttribute("src") || "");
      return m ? m[1] : null;
    }
    function zeige() {
      var p = ausApp() || (buehne.classList.contains("schlaeft") ? "schlaeft" : ausPuppe(zustand));
      if (p === jetzt) return;
      bilder[jetzt].classList.remove("an"); bilder[p].classList.add("an");
      jetzt = p; fig.dataset.pose = p;
    }
    if (puppe) puppe.addEventListener("puppe-zustand", function (e) { zustand = (e.detail && e.detail.zustand) || "ruhig"; zeige(); });
    if (window.MutationObserver) {
      if (pose) new MutationObserver(zeige).observe(pose, { attributes: true, attributeFilter: ["src", "style"] });
      new MutationObserver(zeige).observe(buehne, { attributes: true, attributeFilter: ["class"] });
    }

    /* Blinzeln: Lider kurz über die Augen (nur in der Ruhepose) */
    function blinzel() {
      var warte = 2600 + Math.random() * 4200;
      setTimeout(function () {
        if (jetzt === "idle" && !d.hidden) {
          lider.classList.add("zu");
          setTimeout(function () { lider.classList.remove("zu"); }, 130);
          if (Math.random() < .2) setTimeout(function () { lider.classList.add("zu"); setTimeout(function () { lider.classList.remove("zu"); }, 120); }, 300);
        }
        blinzel();
      }, warte);
    }
    blinzel();

    /* Antippen: Lichtblitz und Lichtpunkte, die aufsteigen */
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
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", los); else los();
})();
