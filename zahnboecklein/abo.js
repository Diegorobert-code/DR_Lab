/* Zahnböcklein-Abo (nur in der nativen App für Android und iOS).
   Im Browser (Web-App, GitHub Pages) macht diese Datei nichts: kein Abo, keine Bezahl-Seite.
   Kauf und Prüfung laufen direkt über Apple bzw. Google auf dem Gerät (Plugin @capgo/native-purchases).
   Kein eigener Server, kein RevenueCat, keine Daten an Dritte.
   Den Gratis-Monat zählt der Store (Einführungsangebot), nicht die App. */
(function(){
"use strict";
var C=window.Capacitor;
var nativ=!!(C&&(typeof C.isNativePlatform==="function"?C.isNativePlatform():(C.getPlatform&&C.getPlatform()!=="web")));
if(!nativ)return;

var PRODUKT="ch.zahnboecklein.app.monat"; /* Apple und Google */
var BASIS="monatlich";                      /* Google Basis-Abo */
var ANGEBOT="gratis-monat";                 /* Google Angebot (1 Monat gratis) */
var PLATT=C.getPlatform?C.getPlatform():"";
var IOS=PLATT==="ios";
var MERK="zb-abo-ok";                       /* Zeitpunkt der letzten bestätigten Abo-Prüfung (nur auf dem Gerät) */
var OFFLINE_TAGE=7;                         /* so lange gilt ein bestätigtes Abo ohne Verbindung zum Store */

function np(methode,optionen){
  try{return C.nativePromise("NativePurchases",methode,optionen||{})}
  catch(e){return Promise.reject(e)}
}
function merkLesen(){try{return parseInt(localStorage.getItem(MERK)||"0",10)||0}catch(e){return 0}}
function merkSetzen(v){try{if(v)localStorage.setItem(MERK,String(v));else localStorage.removeItem(MERK)}catch(e){}}
function kuerzlichBestaetigt(){var t=merkLesen();return t>0&&Date.now()-t<OFFLINE_TAGE*864e5}

/* ---------- Aussehen ---------- */
var css=""+
"#abo{position:fixed;inset:0;z-index:9999;overflow-y:auto;background:radial-gradient(120% 80% at 50% 0%,var(--night2,#2a2f6e),var(--night,#1b1f4b) 70%);background-color:var(--night,#1b1f4b);color:var(--ink,#fdf8ee);-webkit-overflow-scrolling:touch}"+
"#abo .abo-in{min-height:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:max(24px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(24px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}"+
"#abo .abo-goat{width:min(46vw,190px);aspect-ratio:1;border-radius:28%;overflow:hidden;box-shadow:0 0 0 6px rgba(242,197,92,.35),0 0 60px rgba(242,197,92,.25)}"+
"#abo .abo-goat img{width:100%;height:100%;object-fit:cover;display:block}"+
"#abo h1{font-size:clamp(2rem,8vw,2.8rem)}"+
"#abo h2{font-family:var(--display);color:var(--gold,#f2c55c);margin:.2em 0 0;font-size:1.4rem}"+
"#abo p{margin:0 auto;max-width:34ch;line-height:1.45;color:var(--muted,#b9bde6)}"+
"#abo .abo-eltern{width:min(100%,420px);box-sizing:border-box;background:rgba(255,255,255,.07);border:1px solid rgba(185,189,230,.25);border-radius:22px;padding:18px 16px;display:flex;flex-direction:column;gap:12px;text-align:left}"+
"#abo .abo-eltern p{max-width:none}"+
"#abo .abo-preis{font-size:1.15rem;color:var(--ink,#fdf8ee);font-weight:700}"+
"#abo ul{margin:0;padding-left:1.2em;color:var(--muted,#b9bde6);line-height:1.45}"+
"#abo .abo-klein{font-size:.85rem}"+
"#abo .abo-kauf{align-self:center;font-size:1.25rem}"+
"#abo .abo-kauf[disabled]{opacity:.5}"+
"#abo .abo-links{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}"+
"#abo .abo-links button{font-size:.9rem}"+
"#abo .abo-msg{min-height:1.2em;color:var(--pink,#f7a8c4);text-align:center}"+
"#abo .abo-tor input{font-size:1.2rem;width:90px;padding:8px;border-radius:12px;border:0}"+
"#abo .hold{position:relative;overflow:hidden}"+
"#abo .hold i{position:absolute;left:0;bottom:0;height:4px;width:0;background:var(--gold,#f2c55c)}"+
"#aboDoc{position:fixed;inset:0;z-index:10000;background:#fff;display:flex;flex-direction:column}"+
"#aboDoc iframe{flex:1;border:0;width:100%;background:#fff}"+
"#aboDoc button{margin:max(10px,env(safe-area-inset-top,0px)) auto 10px;font-size:1rem}"+
"#aboStatus .row{margin-top:8px}";

function el(tag,attr,kinder){
  var e=document.createElement(tag);
  if(attr)for(var k in attr){if(k==="text")e.textContent=attr[k];else if(k==="cls")e.className=attr[k];else e.setAttribute(k,attr[k])}
  (kinder||[]).forEach(function(c){if(c)e.appendChild(c)});
  return e;
}
function knopf(text,cls,fn){var b=el("button",{type:"button",cls:cls||"",text:text});b.addEventListener("click",fn);return b}

/* ---------- Bezahl-Seite ---------- */
var ov=null,teile={},gesperrt=false,produkt=null,android={};

function baue(){
  if(ov)return;
  var st=el("style",{text:css});document.head.appendChild(st);
  teile.warten=el("p",{text:"Einen Moment, das Zahnböcklein schaut nach …"});
  teile.kind=el("div",{},[
    el("p",{text:"Das Zahnböcklein freut sich schon auf dich! Bitte hol Mama oder Papa. Sie können das Zahnböcklein-Abo einschalten."})
  ]);
  teile.holdBar=el("i");
  teile.hold=el("button",{type:"button",cls:"ghost hold",text:"Für Eltern: 3 Sekunden drücken"},[teile.holdBar]);
  teile.torFrage=el("b");
  teile.torA=el("input",{inputmode:"numeric",autocomplete:"off","aria-label":"Antwort"});
  teile.tor=el("div",{cls:"abo-tor"},[
    el("p",{},[document.createTextNode("Für Eltern: Wie viel ist "),teile.torFrage,document.createTextNode("?")]),
    el("div",{cls:"row"},[teile.torA,knopf("OK","",torPruefen)])
  ]);
  teile.tor.hidden=true;

  teile.preis=el("p",{cls:"abo-preis",text:"Preis wird geladen …"});
  teile.kauf=knopf("Abo starten","abo-kauf",kaufen);teile.kauf.disabled=true;
  teile.hinweis=el("p",{cls:"abo-klein"});
  teile.msg=el("p",{cls:"abo-msg","aria-live":"polite"});
  teile.eltern=el("section",{cls:"abo-eltern"},[
    el("h2",{text:"Zahnböcklein Monat"}),
    teile.preis,
    el("ul",{},[
      el("li",{text:"Alle Putz-Abenteuer, Glitzer-Putzparty, Reise nach Hause, Putz-Spiegel."}),
      el("li",{text:"Keine Werbung, kein Login."})
    ]),
    teile.kauf,
    teile.msg,
    teile.hinweis,
    el("div",{cls:"abo-links"},[
      knopf("Käufe wiederherstellen","ghost",wiederherstellen),
      knopf("Nutzungsbedingungen","ghost",function(){dokument("agb-kurz.html")}),
      knopf("Datenschutz","ghost",function(){dokument("datenschutz.html")})
    ])
  ]);
  teile.eltern.hidden=true;

  ov=el("div",{id:"abo",role:"dialog","aria-modal":"true","aria-label":"Zahnböcklein-Abo"},[
    el("div",{cls:"abo-in"},[
      el("div",{cls:"abo-goat"},[el("img",{src:"icons/icon-512.png",alt:""})]),
      el("h1",{text:"Zahnböcklein-Abo"}),
      teile.warten,teile.kind,teile.hold,teile.tor,teile.eltern
    ])
  ]);
  ov.hidden=true;
  document.body.appendChild(ov);

  var t=null,s=0;
  function stop(){clearInterval(t);t=null;teile.holdBar.style.width="0"}
  teile.hold.addEventListener("pointerdown",function(e){
    e.preventDefault();
    if(!teile.eltern.hidden||!teile.tor.hidden){teile.eltern.hidden=true;teile.tor.hidden=true;return}
    s=performance.now();
    t=setInterval(function(){var p=(performance.now()-s)/3000;teile.holdBar.style.width=Math.min(100,p*100)+"%";if(p>=1){stop();torFragen()}},50);
  });
  ["pointerup","pointerleave","pointercancel"].forEach(function(ev){teile.hold.addEventListener(ev,stop)});
}

/* Eltern-Tor: 3 Sekunden drücken plus Rechenaufgabe (gleich wie gateAsk in index.html) */
var torR=0;
function torFragen(){var a=6+Math.floor(Math.random()*4),b=7+Math.floor(Math.random()*5);torR=a*b;teile.torFrage.textContent=a+" × "+b;teile.torA.value="";teile.tor.hidden=false;teile.torA.focus()}
function torPruefen(){
  teile.tor.hidden=true;
  if(parseInt(teile.torA.value,10)===torR){teile.eltern.hidden=false;teile.msg.textContent="";ladeProdukt();if(teile.eltern.scrollIntoView)teile.eltern.scrollIntoView({behavior:"smooth"})}
}

function zeigeModus(modus){
  baue();
  teile.warten.hidden=modus!=="warten";
  var sperre=modus==="sperre";
  teile.kind.hidden=!sperre;teile.hold.hidden=!sperre;
  if(!sperre){teile.tor.hidden=true;teile.eltern.hidden=true}
}

function sperren(){
  baue();gesperrt=true;
  zeigeModus("sperre");
  ov.hidden=false;
  medienStopp();
}
function warten(){baue();gesperrt=true;zeigeModus("warten");ov.hidden=false;medienStopp()}
function freigeben(){gesperrt=false;if(ov){ov.hidden=true;teile.eltern.hidden=true;teile.tor.hidden=true}}

function medienStopp(){document.querySelectorAll("video,audio").forEach(function(m){try{m.pause()}catch(e){}})}
/* solange die Bezahl-Seite offen ist, startet hinten kein Film und kein Ton */
document.addEventListener("play",function(e){if(gesperrt&&e.target&&e.target.pause)e.target.pause()},true);

/* Datenschutz und Nutzungsbedingungen liegen in der App, kein Link nach aussen */
function dokument(datei){
  var d=el("div",{id:"aboDoc"},[]);
  d.appendChild(knopf("Schliessen","",function(){d.remove()}));
  d.appendChild(el("iframe",{src:datei,title:datei}));
  document.body.appendChild(d);
}

/* ---------- Store ---------- */
function ladeProdukt(){
  teile.preis.textContent="Preis wird geladen …";teile.kauf.disabled=true;teile.hinweis.textContent="";
  return np("getProducts",{productIdentifiers:[PRODUKT],productType:"subs"}).then(function(r){
    var liste=(r&&r.products)||[];
    var p=null,probe=false;
    if(IOS){
      p=liste.find(function(x){return x.identifier===PRODUKT})||liste[0]||null;
      probe=!!(p&&p.introductoryPrice&&p.introEligibility!==1);
      android={};
    }else{
      var plan=liste.filter(function(x){return (x.planIdentifier===PRODUKT||!x.planIdentifier)&&x.identifier===BASIS});
      if(!plan.length)plan=liste;
      var angebot=plan.find(function(x){return x.offerId===ANGEBOT});
      var basis=plan.find(function(x){return !x.offerId})||plan[0];
      p=angebot||basis||null;
      probe=!!angebot;
      android=p?{planIdentifier:BASIS,offerToken:p.offerToken}:{};
    }
    produkt=p;
    if(!p){fehlerPreis();return}
    var preis=p.priceString;
    teile.preis.textContent=probe?("1 Monat gratis, danach "+preis+" pro Monat."):(preis+" pro Monat.");
    teile.kauf.textContent=probe?"1 Monat gratis starten":"Abo starten";
    teile.kauf.disabled=false;
    var konto=IOS?"Ihr Apple-ID-Konto":"Ihr Google-Konto";
    teile.hinweis.textContent=(probe?"Nach dem Gratis-Monat verlängert sich das Abo automatisch für "+preis+" pro Monat":"Das Abo verlängert sich automatisch jeden Monat für "+preis)+
      ", wenn es nicht mindestens 24 Stunden vorher gekündigt wird. Die Zahlung läuft über "+konto+". Kündigen jederzeit in den Konto-Einstellungen"+(IOS?" des App Store.":" von Google Play.");
  }).catch(fehlerPreis);
}
function fehlerPreis(){
  produkt=null;teile.kauf.disabled=true;
  teile.preis.textContent="Das Abo ist im Moment nicht erreichbar.";
  teile.msg.textContent="Bitte Internet prüfen und die Seite nochmals öffnen.";
}

function kaufen(){
  if(!produkt)return;
  teile.kauf.disabled=true;teile.msg.textContent="Einen Moment …";
  var o={productIdentifier:PRODUKT,productType:"subs"};
  if(!IOS){o.planIdentifier=android.planIdentifier;if(android.offerToken)o.offerToken=android.offerToken}
  np("purchaseProduct",o).then(function(){
    return pruefen().then(function(aktiv){
      teile.msg.textContent=aktiv?"Danke! Das Abo ist eingeschaltet.":"Danke! Sobald der Store den Kauf bestätigt, geht es los.";
    });
  }).catch(function(e){
    var t=String((e&&(e.message||e.code))||e||"");
    teile.msg.textContent=/cancel|abbr/i.test(t)?"Kauf abgebrochen.":(/pending|ausstehend/i.test(t)?"Die Zahlung ist noch offen. Sobald sie bestätigt ist, geht es los.":"Der Kauf hat nicht geklappt. Bitte später nochmals versuchen.");
  }).then(function(){teile.kauf.disabled=!produkt});
}

function wiederherstellen(){
  var meldung=teile.msg||{};
  meldung.textContent="Käufe werden gesucht …";
  return np("restorePurchases",{}).catch(function(){}).then(function(){return pruefen()}).then(function(aktiv){
    var t=aktiv?"Abo gefunden. Viel Spass beim Putzen!":"Kein aktives Abo gefunden.";
    if(teile.msg)teile.msg.textContent=t;
    if(statusText)statusText.textContent=aktiv?"Abo aktiv.":t;
  });
}

/* Ist ein Abo aktiv? true / false; bei Store-Fehler: null */
function aboAktiv(){
  var o=IOS?{onlyCurrentEntitlements:true}:{productType:"subs"};
  return np("getPurchases",o).then(function(r){
    var jetzt=Date.now();
    return ((r&&r.purchases)||[]).some(function(t){
      if(!t||t.productIdentifier!==PRODUKT)return false;
      if(IOS){
        if(t.revocationDate)return false;
        if(t.isActive===true)return true;
        return !!(t.expirationDate&&Date.parse(t.expirationDate)>jetzt);
      }
      return String(t.purchaseState)==="1";
    });
  },function(){return null});
}

var laeuft=null;
function pruefen(){
  if(laeuft)return laeuft;
  laeuft=aboAktiv().then(function(aktiv){
    laeuft=null;
    if(aktiv===true){merkSetzen(Date.now());freigeben()}
    else if(aktiv===false){merkSetzen(0);sperren()}
    else{ /* Store nicht erreichbar */
      if(kuerzlichBestaetigt())freigeben();else sperren();
    }
    statusZeigen(aktiv);
    return aktiv===true||(aktiv===null&&kuerzlichBestaetigt());
  });
  return laeuft;
}

/* ---------- Eltern-Bereich: Abo-Status, verwalten, wiederherstellen ---------- */
var statusText=null;
function elternBereich(){
  var karte=document.getElementById("whyCard");
  if(!karte||document.getElementById("aboStatus"))return;
  statusText=el("p",{text:"Abo wird geprüft …"});
  var sek=el("div",{id:"aboStatus"},[
    el("h2",{text:"Abo"}),
    statusText,
    el("div",{cls:"row"},[
      knopf("Abo verwalten","ghost",function(){np("manageSubscriptions",{}).catch(function(){})}),
      knopf("Käufe wiederherstellen","ghost",wiederherstellen)
    ])
  ]);
  var h=karte.querySelector("h2:nth-of-type(4)");
  karte.insertBefore(sek,h||null);
}
function statusZeigen(aktiv){
  if(!statusText)return;
  statusText.textContent=aktiv===true?"Abo aktiv.":(aktiv===false?"Kein aktives Abo.":"Der Store ist im Moment nicht erreichbar.");
}

/* ---------- Start ---------- */
function start(){
  baue();
  elternBereich();
  if(!kuerzlichBestaetigt())warten();
  pruefen();
  try{
    if(typeof C.addListener==="function")C.addListener("NativePurchases","transactionUpdated",function(){pruefen()});
  }catch(e){}
  document.addEventListener("visibilitychange",function(){if(!document.hidden)pruefen()});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();

window.ZahnboeckleinAbo={pruefen:pruefen,wiederherstellen:wiederherstellen};
})();
