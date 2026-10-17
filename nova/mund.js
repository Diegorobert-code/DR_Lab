// Mund: lässt eine Figur auf einem Standbild sprechen.
// Der Bereich unter der Mundlinie wird je nach Lautstärke nach unten gezogen (Kiefer),
// die Lücke füllt sich mit dem dunklen Mundinneren. Läuft komplett im Gerät, ohne Server.
// Nutzung: var m = NovaMund(canvas, bild, { linie: [[x, y], ...], lippe, kinn, max }); m.setze(0..1);
// linie: Punkte entlang der Mitte des offenen Mundes, von Mundwinkel zu Mundwinkel.
(function () {
  window.NovaMund = function (canvas, bild, cfg) {
    var W = bild.naturalWidth, H = bild.naturalHeight;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bild, 0, 0);
    var L = cfg.linie, xa = L[0][0], xb = L[L.length - 1][0], lip = cfg.lippe, kinn = cfg.kinn, max = cfg.max || 30;
    var rw = xb - xa, lin = new Float32Array(rw), fx = new Float32Array(rw), oben = 1e9;
    for (var i = 0, j = 0; i < rw; i++) {
      var X = xa + i; while (j < L.length - 2 && X > L[j + 1][0]) j++;
      var t = (X - L[j][0]) / (L[j + 1][0] - L[j][0]);
      lin[i] = L[j][1] + (L[j + 1][1] - L[j][1]) * t; oben = Math.min(oben, lin[i]);
      fx[i] = Math.pow(Math.sin(Math.PI * (i + 0.5) / rw), 1.4);
    }
    var rx = xa, ry = Math.floor(oben) - 4, rh = kinn - ry + 2;
    var src = ctx.getImageData(rx, ry, rw, rh), S = src.data;
    var out = ctx.createImageData(rw, rh), O = out.data;
    var jetzt = -1;

    function zeichne(d) {
      for (var x = 0; x < rw; x++) {
        var dm = d * fx[x], ym = lin[x];
        var k = dm / (kinn - lip);
        var gi = ((Math.round(ym) + 2 - ry) * rw + x) * 4; // Farbe des Mundinneren
        for (var y = 0; y < rh; y++) {
          var Y = y + ry, o = (y * rw + x) * 4, s;
          if (Y < ym) { O[o] = S[o]; O[o + 1] = S[o + 1]; O[o + 2] = S[o + 2]; O[o + 3] = 255; continue; }
          if (dm > 0 && Y < ym + dm) {
            var t = (Y - ym) / dm, f = 0.28 + 0.3 * t;
            O[o] = Math.max(S[gi] * f, 70 * t + 30); O[o + 1] = S[gi + 1] * f * 0.7 + 8; O[o + 2] = S[gi + 2] * f * 0.7 + 8; O[o + 3] = 255; continue;
          }
          if (Y < lip + dm) s = Y - dm;
          else s = (Y - k * kinn) / (1 - k);
          var sy = s - ry, y0 = Math.floor(sy), a = sy - y0;
          if (y0 < 0) { y0 = 0; a = 0; } if (y0 >= rh - 1) { y0 = rh - 2; a = 1; }
          var p = (y0 * rw + x) * 4, q = p + rw * 4;
          O[o] = S[p] + (S[q] - S[p]) * a; O[o + 1] = S[p + 1] + (S[q + 1] - S[p + 1]) * a;
          O[o + 2] = S[p + 2] + (S[q + 2] - S[p + 2]) * a; O[o + 3] = 255;
        }
      }
      ctx.putImageData(out, rx, ry);
    }

    return {
      // offen: 0 = Ruhe, 1 = weit offen; leicht negativ schliesst den Mund ein wenig.
      setze: function (offen) {
        var d = Math.round(Math.max(-0.3, Math.min(1, offen)) * max * 2) / 2;
        if (d === jetzt) return;
        jetzt = d; zeichne(d);
      }
    };
  };
})();
