/* ton-ios.js – Ton auch bei iPhone-Stumm-Schalter.
   iOS stellt WebAudio (AudioContext) und Vorlesen stumm, solange der Stumm-Schalter an ist.
   1) navigator.audioSession.type = 'playback' (Safari 16.4+): Ton wie bei einem Musik-Player.
   2) Rückfall für ältere iPhones: bei der ersten Berührung ein kurzes stilles <audio> abspielen,
      danach laufen AudioContext und Vorlesen über den Lautsprecher.
   Für Mikrofon (getUserMedia, Spracherkennung) wird kurz auf 'auto' gestellt und danach zurück.
   Ändert keine bestehende Logik: nur Zuhörer mit capture, kein preventDefault. */
(function(){
  "use strict";
  if (window.__tonIOS) return; window.__tonIOS = true;
  var STILL = "data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
  var as = navigator.audioSession, mic = 0;
  function setTyp(t){ try{ if(as && as.type !== t) as.type = t; }catch(e){} }
  function play(){ if(!mic) setTyp("playback"); }
  play();

  /* Rückfall: stilles Audio bei der ersten Geste, bis es einmal geklappt hat */
  var ok = false, busy = false, el = null, EV = ["pointerdown","touchend","click","keydown"];
  function weg(){ EV.forEach(function(t){ window.removeEventListener(t, geste, true); }); }
  function geste(){
    play();
    if (ok || busy) return;
    try{
      if(!el){ el = document.createElement("audio"); el.setAttribute("playsinline",""); el.setAttribute("webkit-playsinline",""); el.preload = "auto"; el.src = STILL; }
      busy = true;
      var p = el.play();
      if (p && p.then) p.then(function(){ ok = true; busy = false; weg(); }, function(){ busy = false; });
      else { ok = true; busy = false; weg(); }
    }catch(e){ busy = false; }
  }
  EV.forEach(function(t){ window.addEventListener(t, geste, {capture:true, passive:true}); });
  document.addEventListener("visibilitychange", function(){ if(!document.hidden) play(); });

  /* Mikrofon: während der Aufnahme 'auto' (iOS wählt dann Aufnahme+Wiedergabe), danach wieder 'playback' */
  if (!as) return;
  function micAn(){ mic++; setTyp("auto"); }
  function micAus(){ mic = Math.max(0, mic-1); if(!mic) setTimeout(play, 0); }
  try{
    var md = navigator.mediaDevices;
    if (md && md.getUserMedia){
      var gum = md.getUserMedia.bind(md);
      md.getUserMedia = function(c){
        if (!(c && c.audio)) return gum(c);
        micAn();
        return gum(c).then(function(s){
          var tr = s.getAudioTracks(), offen = tr.length;
          if (!offen){ micAus(); return s; }
          tr.forEach(function(t){
            var fertig = false, stop = t.stop;
            function ende(){ if(fertig) return; fertig = true; if(--offen === 0) micAus(); }
            t.stop = function(){ var r = stop.apply(t, arguments); ende(); return r; };
            t.addEventListener("ended", ende);
          });
          return s;
        }, function(e){ micAus(); throw e; });
      };
    }
  }catch(e){}
  try{
    ["SpeechRecognition","webkitSpeechRecognition"].forEach(function(n){
      var K = window[n]; if (!K || !K.prototype || K.prototype.__tonIOS) return;
      var st = K.prototype.start; K.prototype.__tonIOS = true;
      K.prototype.start = function(){
        var self = this, aus = false;
        function ende(){ if(aus) return; aus = true; self.removeEventListener("end", ende); micAus(); }
        micAn(); self.addEventListener("end", ende);
        try{ return st.apply(this, arguments); }catch(e){ ende(); throw e; }
      };
    });
  }catch(e){}
})();
