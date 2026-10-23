/* aura.js – Figur im Stil «Aura» (wie Otti und Hasi): atmet, blinzelt, reagiert auf Antippen, wechselt die Pose.
   Ohne Tinko-Posen (window.AURA_DA nicht gesetzt) zeigt der Platz das bisherige Figurenbild rund im Lichtschein,
   mit Atmen, Lichtpunkten und kleinen Bewegungen. Sobald die Posen da sind, reicht AURA_DA in schoen.js:
   dann kommen aura/idle.webp, winkt.webp, freut.webp, schlaeft.webp (und lider.webp, falls vorhanden).
   Nur Darstellung, ändert nichts an der App-Logik.
   Nutzung: var f = Aura.baue(platz, { ersatz: 'figur.jpg', alt: '' }); f.pose('winkt', 2200); */
(function () {
  "use strict";
  if (window.Aura) return;
  var d = document;
  var me = d.currentScript;
  var BASIS = me && me.src ? me.src.replace(/[^\/]*([?#].*)?$/, "") : "aura/";
  var RUHIG = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var POSEN = ["idle", "winkt", "freut", "schlaeft"];

  function funken(buehne, x, y, n) {
    if (RUHIG) return;
    for (var i = 0; i < (n || 9); i++) {
      var f = d.createElement("i"), w = Math.random() * Math.PI * 2, s = 30 + Math.random() * 60;
      f.className = "aura-funke" + (i % 3 === 0 ? " v" : "");
      f.style.left = x + "px"; f.style.top = y + "px";
      f.style.setProperty("--dx", Math.round(Math.cos(w) * s) + "px");
      f.style.setProperty("--dy", Math.round(Math.sin(w) * s * .6 - 40 - Math.random() * 40) + "px");
      f.style.setProperty("--t", (0.8 + Math.random() * 0.6).toFixed(2) + "s");
      f.addEventListener("animationend", function () { this.remove(); });
      buehne.appendChild(f);
    }
  }

  function baue(platz, o) {
    o = o || {};
    var da = !!window.AURA_DA;
    var fig = d.createElement("div");
    fig.className = "aura-figur" + (da ? "" : " aura-ersatz");
    fig.setAttribute("aria-hidden", "true"); fig.dataset.pose = "idle";
    fig.innerHTML = '<i class="aura-schein"></i><i class="aura-boden"></i><div class="aura-atem"></div>';
    var atem = fig.querySelector(".aura-atem"), bilder = {}, lider = null;
    if (da) {
      POSEN.forEach(function (p) {
        var i = d.createElement("img"); i.className = "aura-pose" + (p === "idle" ? " an" : ""); i.alt = ""; i.decoding = "async";
        i.src = BASIS + p + ".webp"; atem.appendChild(i); bilder[p] = i;
      });
      if (window.AURA_LIDER) { lider = d.createElement("img"); lider.className = "aura-pose aura-lider"; lider.alt = ""; lider.src = BASIS + "lider.webp"; atem.appendChild(lider); }
    } else {
      var e = d.createElement("img"); e.className = "aura-pose aura-rund an"; e.alt = ""; e.decoding = "async"; e.src = o.ersatz || "figur.jpg";
      atem.appendChild(e);
    }
    platz.appendChild(fig);

    var jetzt = "idle", zurueckT = 0, wechselT = 0;
    function pose(p, dauer) {
      if (POSEN.indexOf(p) < 0) p = "idle";
      clearTimeout(zurueckT);
      if (dauer) zurueckT = setTimeout(function () { pose("idle"); }, dauer);
      if (p === jetzt) return;
      if (lider) lider.classList.remove("zu");
      if (da) { bilder[jetzt].classList.remove("an"); bilder[p].classList.add("an"); }
      jetzt = p; fig.dataset.pose = p;
      fig.classList.remove("wechsel"); void fig.offsetWidth; fig.classList.add("wechsel");
      clearTimeout(wechselT); wechselT = setTimeout(function () { fig.classList.remove("wechsel"); }, 520);
    }
    function blinzel() {
      setTimeout(function () {
        if (lider && jetzt === "idle" && !d.hidden) {
          lider.classList.add("zu");
          setTimeout(function () { lider.classList.remove("zu"); }, 130);
        }
        blinzel();
      }, 2600 + Math.random() * 4200);
    }
    if (lider) blinzel();
    function blitz(e) {
      fig.classList.remove("blitz"); void fig.offsetWidth; fig.classList.add("blitz");
      var r = platz.getBoundingClientRect();
      var x = e && e.clientX != null ? e.clientX - r.left : r.width / 2, y = e && e.clientY != null ? e.clientY - r.top : r.height / 2;
      funken(platz, x, y);
    }
    fig.addEventListener("animationend", function (e) { if (e.animationName === "auraHopp") fig.classList.remove("blitz"); });
    return { el: fig, pose: pose, blitz: blitz, get jetzt() { return jetzt; }, da: da };
  }
  window.Aura = { baue: baue, funken: funken, basis: BASIS, ruhig: RUHIG };
})();
