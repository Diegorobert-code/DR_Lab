/* Food and Flow – Runde 2 (19.10.2026)
   Kennenlernen beim ersten Start, Bewegung im Alltag mit einem Tipp (Treppe, Velo zur Arbeit, Hund),
   Kochen mit Kindern und Freunden, Flo grüsst auf Schweizerdeutsch, Tinko-Posen als Bilder
   (posen/<pose>.jpg + posen/posen.json), freundlicher Offline-Hinweis, Offline-Cache.
   Läuft nach index.html und flo.js und nutzt deren Funktionen. Alles bleibt auf dem Gerät. */
(function(){
"use strict";
const F=window.FLO||{};
const $$=s=>document.querySelector(s);
const KK="foodflow-runde2";
const R2={kennen:false,alltag:{},kinder:0};
try{Object.assign(R2,JSON.parse(localStorage.getItem(KK)||"{}"))}catch(e){}
function sp2(){try{localStorage.setItem(KK,JSON.stringify(R2))}catch(e){}}
function zaehl(k){if(F.zaehl)F.zaehl(k)}

const css=document.createElement("style");
css.textContent=`
.alltag{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.alltag button{min-height:56px;border-radius:16px;border:1px solid rgba(242,193,78,.35);background:linear-gradient(135deg,#24486a,#1d2c63);color:#f6efe4;font:600 14px/1.25 inherit;text-align:left;padding:8px 12px;display:flex;gap:8px;align-items:center;cursor:pointer}
.alltag button span{font-size:22px;flex:none}
.alltag button small{display:block;font-weight:400;color:#cfd6ea;font-size:12px}
.kenn-pills{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 4px}
.kenn-pills button{min-height:44px;padding:0 14px;border-radius:99px;border:1px solid #3a4a85;background:#1d2c63;color:#f6efe4;font-size:15px;cursor:pointer}
.kenn-pills button.on{background:linear-gradient(135deg,#F2C14E,#e0a93a);color:#1a2140;border-color:#F2C14E;font-weight:700}
.kinder-li{border-top:1px solid rgba(242,193,78,.25);padding:10px 0}
.kinder-li b{display:block}
.offline-band{position:fixed;left:50%;top:max(10px,env(safe-area-inset-top));transform:translateX(-50%);z-index:9000;background:#2a3566;color:#f6efe4;border:1px solid #F2C14E;border-radius:99px;padding:6px 14px;font-size:13px;max-width:92vw;text-align:center}
`;
document.head.appendChild(css);

/* ---------- Tinko-Posen: echtes Bild, wenn vorhanden ---------- */
let POSEN=[];
fetch("posen/posen.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.posen))POSEN=j.posen.map(String)}).catch(()=>{});
const heroImg=()=>$$(".figur-hero img");
/* Seit der Bühne (nova/buehne.js) gibt es oft keinen .figur-hero mehr: dann zeigt das grosse Bühnenbild die Pose
   und kehrt ohne Pose zu seinem eigenen Bild zurück (Tinko-Posen 21.10.). */
window.FLO_POSEBILD=function(name){
  const hero=heroImg();
  if(hero){const n=name||"ruhe",src=POSEN.includes(n)?"posen/"+n+".jpg":"figur.jpg";if(hero.getAttribute("src")!==src)hero.setAttribute("src",src);return}
  const img=document.querySelector(".nb-buehne img");if(!img)return;
  if(!img.dataset.grund)img.dataset.grund=img.getAttribute("src");
  const src=name&&POSEN.includes(name)?"posen/"+name+".jpg":img.dataset.grund;if(img.getAttribute("src")!==src)img.setAttribute("src",src)};

/* ---------- Flo grüsst auf Schweizerdeutsch ---------- */
function gruss(){const h=new Date().getHours();return h<10?"Guete Morge! Was gab es zum Zmorge?":h<14?"En Guete! Erzähl mir vom Zmittag.":h<17?"Zvieri-Zeit. Ein Apfel und ein paar Nüsse?":h<21?"Guete Abig. Was kommt zum Znacht auf den Teller?":"Gueti Nacht bald. Morgen erzählst du mir weiter."}
setTimeout(()=>{const s=$$("#floSatz");if(s&&/Erzähl mir einfach/.test(s.textContent)&&F.floSatz)F.floSatz(gruss())},1200);

/* ---------- Bewegung im Alltag: ein Tipp genügt ---------- */
const ALLTAG=[["treppe","🪜","Treppe statt Lift","5 Min.",5],["velo","🚲","Velo zur Arbeit","15 Min.",15],["spazieren","🐕","Runde mit dem Hund","30 Min.",30],["yoga","🧘","Kurz dehnen","10 Min.",10],["spazieren","🚶","Eine Station zu Fuss","10 Min.",10],["haushalt","🧺","Aufräumen, Putzen","20 Min.",20]];
function alltagKarte(){
  const box=$$("#floHeute");if(!box||box.querySelector("#floAlltag"))return;
  const c=document.createElement("div");c.className="card";c.id="floAlltag";
  c.innerHTML=`<h3>Bewegung im Alltag</h3><p class="small" style="margin:2px 0 0">Ein Tipp, und Flo zählt es mit. Jede Treppe zählt.</p><div class="alltag">${ALLTAG.map((a,i)=>`<button data-alltag="${i}"><span>${a[1]}</span><div>${a[2]}<small>${a[3]}</small></div></button>`).join("")}</div>`;
  box.prepend(c);
  c.querySelectorAll("[data-alltag]").forEach(b=>b.onclick=()=>{
    const a=ALLTAG[+b.dataset.alltag];
    try{today().push({id:uid(),meal:"act",act:a[0],min:a[4],est:false});save()}catch(e){toast("Das ging gerade nicht. Versuch es nochmals.");return}
    R2.alltag[a[2]]=(R2.alltag[a[2]]||0)+1;sp2();zaehl("alltag");
    if(F.pose)F.pose("jog",2200,a[1]);
    toast(`${a[2]} gezählt. Schön!`);
    try{render()}catch(e){}
  });
}

/* ---------- Kochen mit Kindern und Freunden ---------- */
const KINDER=[
 ["🥞","Zmorge-Pfannkuchen","Mehl, Milch, Ei, eine Prise Salz. Mit Apfelschnitzen.","Kinder rühren den Teig und legen die Äpfel."],
 ["🥪","Brot-Gesichter","Vollkornbrot, Frischkäse, Gurke, Rüebli, Tomaten.","Kinder legen lustige Gesichter aufs Brot."],
 ["🍝","Gemüse-Pasta","Pasta, Zucchetti, Rüebli, Erbsen, Reibkäse.","Kinder waschen das Gemüse und streuen den Käse."],
 ["🥣","Birchermüesli","Haferflocken, Joghurt, geriebener Apfel, Beeren, Nüsse.","Kinder reiben den Apfel (mit Hilfe) und mischen."],
 ["🌮","Wraps zum Selberfüllen","Tortillas, Poulet oder Bohnen, Salat, Mais, Joghurtsauce.","Alle füllen ihren eigenen Wrap, ideal mit Freunden."],
 ["🍕","Blech-Pizza","Fertigteig, Tomatensauce, Mozzarella, Gemüse nach Wahl.","Jedes Kind belegt sein eigenes Viertel."]
];
function kinder(){
  zaehl("kinder");R2.kinder++;sp2();
  openS2(`<h2 style="font-size:22px">👨‍👩‍👧 Zusammen kochen</h2><p class="small" style="margin:4px 0 6px">Einfache Ideen für Kinder, Familie und Freunde. Jede Aufgabe so, dass Kleine mithelfen können.</p>
   ${KINDER.map((k,i)=>`<div class="kinder-li"><b>${k[0]} ${k[1]}</b><div class="small">${k[2]}</div><div class="small" style="color:#F2C14E;margin-top:3px">Aufgabe: ${k[3]}</div><button class="flo-chip" data-kz="${i}" style="margin-top:6px">Zur Einkaufsliste kopieren</button></div>`).join("")}
   <p class="small" style="margin-top:10px">Messer und Herd bleiben bei den Erwachsenen.</p>`);
  document.querySelectorAll("[data-kz]").forEach(b=>b.onclick=()=>{const k=KINDER[+b.dataset.kz];const t=k[1]+": "+k[2];
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>toast("Kopiert"),()=>toast(t));else toast(t)});
}
function kinderKachel(){
  const tiles=$$("#floEntdecken .tiles");if(!tiles||tiles.querySelector("[data-t2=kinder]"))return;
  const b=document.createElement("button");b.className="tile";b.dataset.t2="kinder";
  b.innerHTML=`<span class="e">👨‍👩‍👧</span><b>Zusammen kochen</b><small>Mit Kindern und Freunden.</small>`;
  b.onclick=kinder;tiles.appendChild(b);
}

/* ---------- Kennenlernen beim ersten Start ---------- */
function kennenlernen(){
  if(R2.kennen)return;
  const P=S.profile;let ziel=P.goal||"bewusst",all=(P.allergies||[]).slice(),sanft=!!(F.X&&F.X.sanft);
  const draw=()=>{openS2(`<h2 style="font-size:22px">Schön, dass du da bist</h2><p class="small" style="margin:4px 0 8px">Drei kurze Fragen, dann passt Flo alles für dich an. Du kannst es später unter «Ich» ändern.</p>
    <b>Was ist dir wichtig?</b><div class="kenn-pills">${[["bewusst","Bewusst essen"],["leichter","Etwas leichter"],["muskeln","Mehr Kraft"]].map(([k,n])=>`<button data-kg="${k}" class="${ziel===k?"on":""}">${n}</button>`).join("")}</div>
    <b>Was verträgst du nicht?</b><div class="kenn-pills">${ALLERG.map(([k,n])=>`<button data-ka="${k}" class="${all.includes(k)?"on":""}">${n}</button>`).join("")}</div>
    <b>Wie möchtest du es sehen?</b><div class="kenn-pills"><button data-ks="0" class="${sanft?"":"on"}">Mit Zahlen</button><button data-ks="1" class="${sanft?"on":""}">Sanft, ohne Kalorien</button></div>
    <button class="btn" id="kennOk" style="margin-top:12px">Fertig</button>`);
    document.querySelectorAll("[data-kg]").forEach(b=>b.onclick=()=>{ziel=b.dataset.kg;draw()});
    document.querySelectorAll("[data-ka]").forEach(b=>b.onclick=()=>{const k=b.dataset.ka;all=all.includes(k)?all.filter(x=>x!==k):all.concat(k);draw()});
    document.querySelectorAll("[data-ks]").forEach(b=>b.onclick=()=>{sanft=b.dataset.ks==="1";draw()});
    document.getElementById("kennOk").onclick=()=>{P.goal=ziel;P.allergies=all;if(F.X){F.X.sanft=sanft;F.sp()}save();R2.kennen=true;sp2();closeSheet();try{render()}catch(e){}
      if(F.pose)F.pose("jubel",2000,"🎉");toast("Danke! Flo hat sich alles gemerkt.");if(F.floSatz)F.floSatz("Super, jetzt kenne ich dich ein bisschen. Erzähl mir, was du isst.")};
  };
  draw();
}
const go=document.getElementById("figurStartGo");
const startOffen=()=>{const s=document.getElementById("figurStart");return s&&!s.hidden};
if(!R2.kennen){
  const hasData=Object.keys(S.days||{}).some(k=>(S.days[k]||[]).length);
  if(hasData){R2.kennen=true;sp2()}
  else if(startOffen()&&go)go.addEventListener("click",()=>setTimeout(kennenlernen,700));
  else setTimeout(kennenlernen,1500);
}

/* ---------- Offline freundlich ---------- */
function band(t){let b=$$(".offline-band");if(!t){if(b)b.remove();return}if(!b){b=document.createElement("div");b.className="offline-band";document.body.appendChild(b)}b.textContent=t}
addEventListener("offline",()=>band("Offline. Flo rechnet trotzdem weiter, alles bleibt gespeichert."));
addEventListener("online",()=>{band("");toast("Wieder online")});
if(navigator.onLine===false)band("Offline. Flo rechnet trotzdem weiter, alles bleibt gespeichert.");

/* ---------- Erfahrung teilen ohne Server: Lern-Zahlen als Text (nur mit Häkchen) ---------- */
function lernText(){
  const X=F.X||{zahl:{},mood:[]},tage=Object.values(S.days||{}).filter(l=>l&&l.length).length;
  const z=Object.entries(X.zahl||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}: ${v}`);
  return `Food and Flow · Lern-Zahlen (nur Zählwerte, kein Essen, keine Stimme, kein Bild)\nTage mit Einträgen: ${tage}\nBefinden-Antworten: ${(X.mood||[]).length}\n${z.join("\n")||"noch keine Zählungen"}\nStand: ${new Date().toLocaleDateString("de-CH")}`;
}
function teilenKnopf(){
  const cb=document.querySelector('[data-ok="teilen"]');if(!cb)return;
  const lbl=cb.closest("label")||cb.parentElement;let b=document.getElementById("floTeilenText");
  if(!b){b=document.createElement("button");b.id="floTeilenText";b.className="btn ghost";b.style.marginTop="8px";b.textContent="Lern-Zahlen als Text teilen";lbl.after(b);
    b.onclick=()=>{if(!(F.X&&F.X.ok.teilen)){toast("Erst das Häkchen setzen");return}const t=lernText();zaehl("lerntext");
      if(navigator.share)navigator.share({title:"Food and Flow · Lern-Zahlen",text:t}).catch(()=>{});
      else if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>toast("Lern-Zahlen kopiert"),()=>toast("Kopieren ging nicht"));
      else toast("Teilen geht auf diesem Gerät nicht")};
    cb.addEventListener("change",()=>{b.hidden=!cb.checked});}
  b.hidden=!cb.checked;
}

/* ---------- In die Ansichten einhängen ---------- */
function haken(name,fn){const o=window[name];if(typeof o!=="function")return;window[name]=function(){const r=o.apply(this,arguments);try{fn()}catch(e){console.error("Flo 2:",e)}return r}}
haken("render",alltagKarte);haken("renderFeed",kinderKachel);haken("renderIch",teilenKnopf);
try{alltagKarte();kinderKachel();teilenKnopf()}catch(e){console.error("Flo 2:",e)}
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
