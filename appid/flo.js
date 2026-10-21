/* Food and Flow – Flos Welt (19.10.2026)
   Alles, was Flo zusätzlich kann, aus den Ideen von Diego und Florence:
   Teller statt Zahlen, Wetter-Bilanz, Wasser + Hologramm, Posen, «Wie gestern», Lieblingsmahlzeiten,
   Befinden nach dem Essen, Abendfrage, «Dein Tag in einem Satz», Wochenrückblick als Geschichte,
   Kühlschrank-Modus, Saison Schweiz, Mythos oder Fakt, Wochenplan + Einkaufsliste (auch für 2 oder 4),
   «Was Flo sich merkt», Sicherung, Flo-Server für unbekanntes Essen (nur mit Häkchen).
   Läuft nach dem Hauptskript und nutzt dessen Funktionen (S, parse, render …).
   Alles bleibt auf dem Gerät. Zum Server geht nur, was mit Häkchen erlaubt ist, nie Stimme oder Bild. */
(function(){
"use strict";
const PK="foodflow-plus-v1";
const X={mood:[],zahl:{},ok:{befinden:true,teilen:false,server:false},sanft:false,plan:null,quiz:{},abgehakt:{},geteilt:"",gefragt:{}};
try{const r=localStorage.getItem(PK);if(r){const o=JSON.parse(r);Object.assign(X,o);X.ok=Object.assign({befinden:true,teilen:false,server:false},o.ok||{})}}catch(e){}
function sp(){try{localStorage.setItem(PK,JSON.stringify(X))}catch(e){}}
function zaehl(k){X.zahl[k]=(X.zahl[k]||0)+1;sp()}
const ruhig=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
const WT=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];

/* ---------- Aussehen ---------- */
const css=document.createElement("style");
css.textContent=`
.flo-row{display:flex;gap:8px;overflow-x:auto;padding:12px 2px 2px;scrollbar-width:none}.flo-row::-webkit-scrollbar{display:none}
.flo-lbl{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#F2C14E;font-weight:700;margin:18px 2px 0}
.flo-chip{flex:none;font-size:14px;background:linear-gradient(135deg,#24486a,#1d2c63);color:#f6efe4;border:1px solid #3a4a85;padding:8px 13px;border-radius:99px;white-space:nowrap}
.flo-chip.gold{background:linear-gradient(135deg,#F2C14E,#e0a93a);color:#1a2140;border-color:#F2C14E;font-weight:600}
.holo{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.holo>*{white-space:nowrap;font-size:12.5px;padding:3px 9px;border-radius:99px;background:rgba(111,207,151,.14);border:1px solid rgba(111,207,151,.45);color:#c9f3dc;box-shadow:0 0 12px rgba(111,207,151,.25) inset;animation:holoGlow 3.2s ease-in-out infinite}
.holo>button{cursor:pointer}.holo>*:nth-child(2){animation-delay:.6s}.holo>*:nth-child(3){animation-delay:1.2s}
.holo b{display:inline!important;font-size:inherit!important;font-weight:700;background:none!important;-webkit-text-fill-color:#fff;color:#fff!important}
.holo>span{display:inline-block!important;margin:0!important;color:#c9f3dc!important}
@keyframes holoGlow{0%,100%{box-shadow:0 0 8px rgba(111,207,151,.2) inset}50%{box-shadow:0 0 16px rgba(111,207,151,.5) inset,0 0 10px rgba(111,207,151,.35)}}
.figur-hero .flo-wrap{position:relative;flex:none}
.flo-prop{position:absolute;right:-6px;top:-8px;font-size:26px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.4));opacity:0;transform:scale(.3);transition:opacity .3s,transform .4s cubic-bezier(.3,1.6,.5,1);pointer-events:none}
.flo-prop.on{opacity:1;transform:scale(1)}
.figur-hero img.pose-jubel{animation:poseJubel .9s cubic-bezier(.3,1.5,.5,1) 2!important}
.figur-hero img.pose-jog{animation:poseJog .42s ease-in-out infinite!important}
.figur-hero img.pose-hoert{animation:poseHoert 1.4s ease-in-out infinite!important;box-shadow:0 0 0 4px rgba(242,193,78,.5),0 0 30px rgba(242,193,78,.6)!important}
.figur-hero img.pose-ruhig{animation:poseRuhig 5s ease-in-out infinite!important}
.figur-hero img.pose-winkt{animation:poseWinkt 1.1s ease-in-out 2!important}
.figur-hero img.pose-denkt{animation:poseDenkt 2.4s ease-in-out infinite!important}
@keyframes poseJubel{0%{transform:translateY(0) scale(1)}35%{transform:translateY(-16px) scale(1.12) rotate(-6deg)}60%{transform:translateY(0) scale(.96) rotate(4deg)}100%{transform:none}}
@keyframes poseJog{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-6px) rotate(3deg)}}
@keyframes poseHoert{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes poseRuhig{0%,100%{transform:scale(1);filter:brightness(.92)}50%{transform:scale(1.03);filter:brightness(1)}}
@keyframes poseWinkt{0%,100%{transform:rotate(0)}25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)}}
@keyframes poseDenkt{0%,100%{transform:rotate(0) translateX(0)}50%{transform:rotate(-7deg) translateX(-3px)}}
.sizeq{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:5px;font-size:13px;color:#F2C14E}
.sizeq button{padding:3px 10px;border-radius:99px;border:1px solid #3a4a85;background:#1d2c63;font-size:13px;color:#f6efe4}
.sizeq button.on{background:#F2C14E;color:#1a2140;border-color:#F2C14E;font-weight:600}
.teller{display:flex;gap:16px;align-items:center}
.teller svg{flex:none;width:132px;height:132px;filter:drop-shadow(0 8px 18px rgba(0,0,0,.35))}
.teller .leg{flex:1;font-size:14px;line-height:1.55}
.teller .leg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:middle}
.wetter{font-size:16px;margin-top:12px;padding:10px 12px;border-radius:14px;background:#1d2c63;display:flex;gap:10px;align-items:center}
.wetter span:first-child{font-size:28px;line-height:1}
.flo-say{float:right;width:34px;height:34px;border-radius:50%;background:#1d2c63;border:1px solid #3a4a85;display:grid;place-items:center;font-size:16px;margin:-4px -4px 0 8px}
.quiz .q{font-family:var(--serif);font-size:20px;line-height:1.3;margin:4px 0 12px}
.quiz .ab{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.quiz .ab button{padding:13px;border-radius:16px;font-weight:700;font-size:16px;background:#1d2c63;border:1px solid #3a4a85;color:#f6efe4}
.quiz .ab button.m{background:linear-gradient(135deg,#4a2630,#2a1d3c)}.quiz .ab button.f{background:linear-gradient(135deg,#1f4a3c,#1d2c63)}
.quiz .res{margin-top:12px;padding:12px;border-radius:14px;background:#1b2d5e;animation:filmAuf .45s ease-out both}
.quiz .res b{color:#F2C14E}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
.tile{border-radius:20px;padding:14px;text-align:left;color:#f6efe4;border:1px solid rgba(242,193,78,.35);min-height:96px;position:relative;overflow:hidden;box-shadow:0 10px 26px -14px rgba(0,0,0,.6)}
.tile .e{font-size:30px;display:block;line-height:1;margin-bottom:6px}
.tile b{display:block;font-size:15.5px}.tile small{display:block;font-size:12.5px;color:#d9d3e6;line-height:1.35;margin-top:2px}
.tile:nth-child(1){background:linear-gradient(140deg,#1f5a6e,#17255a)}.tile:nth-child(2){background:linear-gradient(140deg,#7a4a1c,#17255a)}
.tile:nth-child(3){background:linear-gradient(140deg,#2f5d50,#17255a)}.tile:nth-child(4){background:linear-gradient(140deg,#5a2f6e,#17255a)}
.tile::after{content:"";position:absolute;right:-20px;bottom:-20px;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(242,193,78,.25),transparent 70%)}
.slist{list-style:none;padding:0;margin:8px 0 0}.slist li{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid #24346a}.slist li:last-child{border-bottom:0}
.slist .e{font-size:22px;width:28px;text-align:center;flex:none}
.einkauf label{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #24346a;font-size:15px}
.einkauf input{width:20px;height:20px;accent-color:#F2C14E}.einkauf label.ok span{text-decoration:line-through;opacity:.55}
.flo-check{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #24346a;font-size:14.5px;line-height:1.4}
.flo-check:last-of-type{border-bottom:0}.flo-check input{width:20px;height:20px;flex:none;margin-top:1px;accent-color:#F2C14E}
.flofrage{position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 92px);max-width:436px;margin:0 auto;z-index:35;background:linear-gradient(140deg,#22356e,#17255a);border:1px solid #F2C14E;border-radius:22px;padding:12px 14px;box-shadow:0 18px 40px -12px rgba(0,0,0,.7);transform:translateY(160%);transition:transform .45s cubic-bezier(.22,.8,.26,1)}
.flofrage.on{transform:none}
.flofrage .k{display:flex;gap:10px;align-items:center;font-size:15px}
.flofrage img{width:42px;height:42px;border-radius:50%;border:2px solid #F2C14E;object-fit:cover;flex:none}
.flofrage .bt{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}
.flofrage .bt button{padding:8px 2px;border-radius:14px;background:#1d2c63;border:1px solid #3a4a85;font-size:12.5px;color:#f6efe4;line-height:1.2}
.flofrage .bt button span{display:block;font-size:22px}
.flofrage .weg{position:absolute;right:10px;top:8px;color:#a9b1cc;font-size:18px;width:28px;height:28px}
body.flo-sanft .ring,body.flo-sanft #bal,body.flo-sanft #status,body.flo-sanft .mac .row b{display:none}
.story p{margin:0 0 8px;font-size:16px;line-height:1.5}.story p:first-letter{font-family:var(--serif);font-size:1.35em;color:#F2C14E}
/* Startbild: Nova-Pille und Knöpfe lagen über «Los geht's» und öffneten das Gespräch statt der App */
body:has(#figurStart:not([hidden])) :is(.nova-btn,.nova-pille,.sp-knopf,.sp-blase){visibility:hidden!important;pointer-events:none!important}
.story .vor{margin-top:6px;padding:10px 12px;border-radius:14px;background:#1d2c63;font-size:15px}
`;
document.head.appendChild(css);

/* ---------- Helfer ---------- */
const el=(h)=>{const d=document.createElement("div");d.innerHTML=h.trim();return d.firstElementChild};
function sag(t){ // Flo spricht: Figurenstimme über Nova, sonst Handystimme
  zaehl("vorlesen");
  try{if(window.NovaStimme&&window.NovaStimme.sprich){window.NovaStimme.sprich(t);return}}catch(e){}
  try{if("speechSynthesis" in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="de-CH";const v=speechSynthesis.getVoices().find(v=>/^de/i.test(v.lang));if(v)u.voice=v;u.rate=1.02;speechSynthesis.speak(u)}}catch(e){}
}
function floSatz(t){const s=document.getElementById("floSatz");if(!s)return;s.textContent=t;s.classList.remove("film-neu");void s.offsetWidth;s.classList.add("film-neu")}
let poseT;
function pose(name,ms,prop){
  const img=document.querySelector(".figur-hero img");
  if(!img){if(window.FLO_POSEBILD)window.FLO_POSEBILD(name);clearTimeout(poseT);if(ms)poseT=setTimeout(()=>pose(grundPose()[0],0,grundPose()[1]),ms);return}
  img.classList.remove("pose-jubel","pose-jog","pose-joggt","pose-hoert","pose-ruhig","pose-winkt","pose-denkt","film-hops");
  void img.offsetWidth; if(name)img.classList.add("pose-"+name);
  if(window.FLO_POSEBILD)window.FLO_POSEBILD(name);
  const p=document.querySelector(".flo-prop");if(p){if(prop){p.textContent=prop;p.classList.add("on")}else p.classList.remove("on")}
  clearTimeout(poseT); if(ms)poseT=setTimeout(()=>pose(grundPose()[0],0,grundPose()[1]),ms);
}
function grundPose(){const h=new Date().getHours();return h>=21||h<6?["ruhig","🌙"]:h<10?["jog",""]:["",""]}
function portionen(list){let v=0,p=0,s=0;(list||[]).forEach(it=>{if(!it.food)return;const e=BYID[it.food];if(!e)return;const t=e[6]||"",por=Math.min(3,it.g/(e[3]||100));
  if(/(^|,)(v|fr)(,|$)/.test(t))v+=por;else if(/(^|,)(p|fi)(,|$)/.test(t))p+=por;else if(e[5][3]>=15&&!/schoggi|kuchen|guetzli|glace|chips|suessig|cola|bier|wein|cocktail|sirup|konfi|honig|nutella|popcorn|muesliriegel|protriegel/.test(e[0]))s+=por});
  return {v,p,s}}
function wasser(list){return Math.round((list||[]).filter(i=>i.food==="wasser").reduce((a,i)=>a+i.g,0)/250)}
function schritte(list){return (list||[]).filter(i=>i.act==="schritte").reduce((a,i)=>a+i.steps,0)}
function namen(ids){const n=[...new Set(ids)].map(i=>BYID[i]?BYID[i][1]:"").filter(Boolean);return n.length>1?n.slice(0,-1).join(", ")+" und "+n[n.length-1]:(n[0]||"")}
function lsGet(k){try{const v=localStorage.getItem(k);if(v==null)return "";try{return JSON.parse(v)}catch(e){return v}}catch(e){return ""}}
function srv(){const a=lsGet("drlab-hermes-adresse"),k=lsGet("drlab-hermes-passwort");return a&&k?{a:String(a).replace(/\/+$/,""),k:String(k)}:null}
window.FLO_SERVER=()=>!!(X.ok.server&&srv());
function oeffneMit(items,label){
  pending=items.map(i=>Object.assign({},i,{id:uid()}));
  $("#said").textContent=label;renderPending();$("#sheet").classList.add("on");$("#sheetbg").classList.add("on");
}

/* ---------- Flo-Server: unbekanntes Essen nachfragen (nur das Wort, nur mit Häkchen) ---------- */
window.FLO_FRAG=function(it,btn){
  const s=srv();if(!s||!it||!it.unk)return;
  btn.disabled=true;btn.textContent="✨ Flo fragt …";pose("denkt",0,"🤔");zaehl("server");
  const sys="Du schätzt Nährwerte für eine Schweizer Ernährungs-App. Antworte NUR mit JSON, ohne Text: {\"name\":\"Name auf Deutsch (Schweiz)\",\"portion_g\":Zahl,\"einheit\":\"Stück|Portion|Scheibe|Glas|Teller\",\"kcal\":Zahl,\"protein\":Zahl,\"fett\":Zahl,\"kh\":Zahl,\"ballast\":Zahl,\"art\":\"gemuese|frucht|protein|fisch|andere\"}. Nährwerte pro 100 g. Wenn es kein Lebensmittel ist: {\"name\":\"\"}.";
  fetch(s.a+"/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+s.k,"X-Nova-App":"Food and Flow"},
    body:JSON.stringify({model:"sense-engine",messages:[{role:"system",content:sys},{role:"user",content:it.unk}]})})
  .then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})
  .then(j=>{
    const c=(j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||"";const m=c.match(/\{[\s\S]*\}/);const o=m?JSON.parse(m[0]):{};
    const n=x=>{x=parseFloat(x);return isFinite(x)&&x>=0?x:0};
    if(!o.name||!(n(o.kcal)<=950))throw new Error("kein Essen");
    const w=norm(it.unk),id="x"+w.replace(/[^a-z0-9]/g,"").slice(0,14)+Math.random().toString(36).slice(2,5);
    const tag={gemuese:"v",frucht:"fr",protein:"p",fisch:"p,fi"}[o.art]||"";
    const e=[id,String(o.name).slice(0,40),[w],Math.max(5,Math.min(800,n(o.portion_g)||100)),String(o.einheit||"Portion").slice(0,12),[n(o.kcal),n(o.protein),n(o.fett),n(o.kh),n(o.ballast),0,0,0,0,0,0],tag];
    DB.push(e);BYID[id]=e;SYN.push([w,e]);SYN.sort((a,b)=>b[0].length-a[0].length);EIGEN.foods.push(e);try{localStorage.setItem(EIGEN_KEY,JSON.stringify(EIGEN))}catch(x){}
    Object.assign(it,{food:id,qty:1,size:1,g:e[3],est:true,word:w});delete it.unk;renderPending();
    pose("jubel",2200,"✨");toast("Flo kennt jetzt: "+e[1]+" (Schätzung)");
  })
  .catch(()=>{btn.disabled=false;btn.textContent="✨ Flo-Server fragen";pose("",0,"");toast("Der Flo-Server antwortet gerade nicht. Wähle «Ähnlich wie …».")});
};

/* ---------- Lern-Zahlen teilen (nur Zählwerte, nur mit Häkchen, einmal pro Tag) ---------- */
function teilen(force){
  const s=srv();if(!X.ok.teilen||!s)return;if(!force&&X.geteilt===dkey())return;
  const tage=Object.values(S.days).filter(l=>l.length).length;
  fetch(s.a+"/erfahrung",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+s.k},
    body:JSON.stringify({app:"Food and Flow",art:"lernzahlen",frage:JSON.stringify({tage,zaehler:X.zahl,befinden:X.mood.length,woerter:Object.keys(EIGEN.alias).length+EIGEN.foods.length}),antwort:""})})
  .then(r=>{if(r.ok){X.geteilt=dkey();sp()}}).catch(()=>{});
}

/* ---------- Hologramm + Posen im Flo-Kasten ---------- */
const hero=document.querySelector(".figur-hero");
if(hero){
  const img=hero.querySelector("img");
  if(img&&!img.parentElement.classList.contains("flo-wrap")){const w=document.createElement("div");w.className="flo-wrap";img.replaceWith(w);w.appendChild(img);w.appendChild(el('<span class="flo-prop" aria-hidden="true"></span>'))}
  hero.querySelector("div:not(.flo-wrap)").appendChild(el('<div class="holo" aria-label="Flos Hologramm"><button type="button" data-holo="wasser">💧 <b id="hW">0</b>/6</button><span>👟 <b id="hS">0</b></span><span>🍏 <b id="hF">0</b>/5</span></div>'));
  hero.querySelector('[data-holo="wasser"]').onclick=e=>{e.stopPropagation();glasWasser()};
}
function glasWasser(){
  today().push({id:uid(),meal:currentMeal(),food:"wasser",qty:1,size:1,g:250,est:false});save();zaehl("wasser");render();
  const n=wasser(today());pose("jubel",1800,"💧");
  floSatz(n>=6?"Sechs Gläser, wunderbar. Dein Körper sagt danke.":n===1?"Das erste Glas Wasser. Prost!":"Glas Nummer "+n+". Schön, dass du an dich denkst.");
}
const mic=document.getElementById("mic");
if(mic){
  mic.addEventListener("click",()=>zaehl("mikrofon"));
  new MutationObserver(()=>{if(mic.classList.contains("rec")){pose("hoert",0,"👂");floSatz("Ich höre zu. Erzähl einfach, ganz in Ruhe.")}else pose(grundPose()[0],0,grundPose()[1])}).observe(mic,{attributes:true,attributeFilter:["class"]});
}
document.getElementById("send")&&document.getElementById("send").addEventListener("click",()=>zaehl("text"));
document.getElementById("examples")&&document.getElementById("examples").addEventListener("click",e=>{if(e.target.closest(".chip"))zaehl("beispiel")});

/* ---------- Nach dem Speichern: Flo jubelt und fragt kurz nach dem Befinden ---------- */
const MOOD=[["wach","⚡","Wach"],["gut","🙂","Gut"],["muede","😴","Müde"],["voll","🫧","Bauch voll"]];
const frage=el(`<div class="flofrage" role="dialog" aria-label="Flo fragt"><button class="weg" aria-label="Schliessen">✕</button><div class="k"><img src="figur.jpg" alt=""><div><b>Wie fühlst du dich jetzt?</b><div class="small" style="color:#d9d3e6">Ein Tipp reicht. So lerne ich, was dir guttut.</div></div></div><div class="bt">${MOOD.map(m=>`<button data-m="${m[0]}"><span>${m[1]}</span>${m[2]}</button>`).join("")}</div></div>`);
document.body.appendChild(frage);
let frageFoods=null,frageMeal=null,frageT;
frage.querySelector(".weg").onclick=()=>frage.classList.remove("on");
frage.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{
  if(frageFoods){X.mood.push({d:dkey(),meal:frageMeal,foods:frageFoods,m:b.dataset.m});if(X.mood.length>400)X.mood.shift();zaehl("befinden");sp()}
  frage.classList.remove("on");
  const t={wach:"Schön! Ich merke mir, was dir Energie gibt.",gut:"Fein. Ich merke es mir.",muede:"Danke fürs Sagen. Vielleicht hilft ein kurzer Spaziergang.",voll:"Verstanden. Ich schaue mit dir, ob das ein Muster ist."}[b.dataset.m];
  floSatz(t);pose(b.dataset.m==="muede"?"ruhig":"jubel",2000,b.dataset.m==="wach"?"⚡":"👍");render();
});
document.getElementById("save").addEventListener("click",()=>{
  const foods=pending.filter(i=>i.food&&i.food!=="wasser").map(i=>i.food);
  const acts=pending.filter(i=>i.act);
  if(acts.length&&!foods.length){pose("jog",2600,"👟");floSatz("Bewegung notiert. Stark, dass du dich bewegt hast!");return}
  if(!foods.length)return;
  pose("jubel",2400,"👍");
  floSatz(["Notiert! Danke, dass du es mir erzählt hast.","Mmh, klingt gut. Ich habe alles aufgeschrieben.","Gespeichert. Ganz ohne Stress."][Math.floor(Math.random()*3)]);
  const n=X.mood.filter(m=>m.d===dkey()).length;
  if(X.ok.befinden&&n<3){frageFoods=[...new Set(foods)];frageMeal=pending.find(i=>i.food).meal;clearTimeout(frageT);frageT=setTimeout(()=>frage.classList.add("on"),1400);setTimeout(()=>frage.classList.remove("on"),26000)}
});

/* ---------- Essen + Befinden: Muster (nur Beobachtung, kein Befund) ---------- */
function muster(){
  const by={};X.mood.forEach(r=>(r.foods||[]).forEach(f=>{const o=by[f]||(by[f]={n:0,wach:0,gut:0,muede:0,voll:0});o.n++;o[r.m]=(o[r.m]||0)+1}));
  const out=[];Object.entries(by).forEach(([f,o])=>{if(o.n<3||!BYID[f])return;["muede","voll","wach"].forEach(m=>{if(o[m]/o.n>=.6)out.push({f,m,a:o[m],n:o.n})})});
  return out.sort((a,b)=>b.a-a.a).slice(0,4);
}
function musterSatz(x){const nm=BYID[x.f][1];return x.m==="muede"?`Nach ${nm} warst du oft müde (${x.a} von ${x.n} Mal).`:x.m==="voll"?`Nach ${nm} war der Bauch oft voll (${x.a} von ${x.n} Mal).`:`Nach ${nm} warst du oft wach und frisch (${x.a} von ${x.n} Mal).`}

/* ---------- Mythos oder Fakt (Quellen: SGE, EEK; Stand 2026, ohne Heilversprechen) ---------- */
const QUIZ=[
 {q:"Kohlenhydrate am Abend machen dick.",a:"m",e:"Entscheidend ist, wie viel du über den ganzen Tag isst, nicht die Uhrzeit. Ein Znacht mit Kartoffeln ist völlig in Ordnung.",src:"SGE, Schweizer Lebensmittelpyramide"},
 {q:"Tiefkühlgemüse hat kaum noch Vitamine.",a:"m",e:"Gemüse wird oft direkt nach der Ernte schockgefroren. So bleibt viel erhalten, manchmal mehr als nach Tagen im Kühlschrank.",src:"SGE, Merkblatt Gemüse"},
 {q:"Eine Handvoll Nüsse am Tag ist eine gute Wahl.",a:"f",e:"Nüsse haben viele Kalorien, aber auch gute Fette, Ballaststoffe und Magnesium. Die SGE empfiehlt täglich 20–30 g ungesalzene Nüsse.",src:"SGE, Schweizer Lebensmittelpyramide"},
 {q:"Braune Eier sind gesünder als weisse.",a:"m",e:"Die Farbe der Schale hängt nur von der Hühnerrasse ab. Innen sind sie gleich.",src:"Allgemeines Lebensmittelwissen"},
 {q:"Linsen und Bohnen liefern Protein und Ballaststoffe.",a:"f",e:"Hülsenfrüchte sind eine gute Proteinquelle und machen lange satt. Mehrmals pro Woche passt gut.",src:"SGE, Schweizer Lebensmittelpyramide"},
 {q:"Man muss jeden Tag mindestens 3 Liter trinken.",a:"m",e:"Empfohlen sind für Erwachsene rund 1 bis 2 Liter, am besten Wasser oder ungesüsster Tee. Bei Hitze und Sport mehr.",src:"SGE, Schweizer Lebensmittelpyramide"},
 {q:"Brot macht dick.",a:"m",e:"Kein einzelnes Lebensmittel macht dick. Vollkornbrot bringt sogar Ballaststoffe, die lange satt machen.",src:"SGE, Schweizer Lebensmittelpyramide"},
 {q:"Im Winter bildet die Haut in der Schweiz kaum Vitamin D.",a:"f",e:"Von Oktober bis März ist die Sonne zu schwach. Darum empfiehlt die Eidgenössische Ernährungskommission vielen Erwachsenen ein Präparat, am besten mit Fachperson besprochen.",src:"Eidg. Ernährungskommission (EEK)"},
 {q:"Ein Glas Fruchtsaft kann ab und zu eine Portion Früchte ersetzen.",a:"f",e:"Ja, aber nur eine Portion pro Tag. Ganze Früchte machen satter und bringen mehr Ballaststoffe.",src:"SGE, Schweizer Lebensmittelpyramide"},
 {q:"Spinat hat viel mehr Eisen als anderes Gemüse.",a:"m",e:"Spinat hat etwas Eisen, aber nicht aussergewöhnlich viel. Linsen, Hirse oder Haferflocken liefern mehr.",src:"Schweizer Nährwertdatenbank (Orientierung)"},
];
function quizHtml(i,id){const Q=QUIZ[i%QUIZ.length];return `<div class="quiz" id="${id}"><div class="q">«${Q.q}»</div><div class="ab"><button class="m" data-qa="m">Mythos</button><button class="f" data-qa="f">Fakt</button></div><div class="qres"></div></div>`}
function quizBind(root,i,onDone){
  const Q=QUIZ[i%QUIZ.length];
  root.querySelectorAll("[data-qa]").forEach(b=>b.onclick=()=>{
    const ok=b.dataset.qa===Q.a;zaehl("quiz");
    root.querySelector(".qres").innerHTML=`<div class="res"><b>${ok?"Richtig!":"Fast!"} Es ist ${Q.a==="m"?"ein Mythos":"ein Fakt"}.</b><div style="margin-top:4px">${Q.e}</div><div class="src">Quelle: ${Q.src}</div></div>`;
    root.querySelectorAll("[data-qa]").forEach(x=>x.disabled=true);
    if(ok)pose("jubel",1800,"🎉");
    onDone&&onDone(ok);
  });
}
function tagNr(){const d=new Date();return Math.floor((d-new Date(d.getFullYear(),0,0))/864e5)}

/* ---------- Saison Schweiz ---------- */
const SAISON=[
 ["Lauch","Kabis","Rüebli","Randen","Nüsslisalat","Lageräpfel"],
 ["Rosenkohl","Lauch","Rüebli","Randen","Nüsslisalat","Lageräpfel"],
 ["Lauch","Nüsslisalat","Rüebli","Bärlauch","Lageräpfel"],
 ["Bärlauch","Spargel","Rhabarber","Radiesli","Spinat"],
 ["Spargel","Rhabarber","Erdbeeren","Spinat","Kohlrabi"],
 ["Erdbeeren","Kirschen","Zucchetti","Erbsen","Salat"],
 ["Aprikosen","Himbeeren","Tomaten","Gurken","Bohnen"],
 ["Zwetschgen","Tomaten","Peperoni","Mais","Brombeeren"],
 ["Zwetschgen","Trauben","Äpfel","Birnen","Kürbis"],
 ["Kürbis","Marroni","Äpfel","Birnen","Trauben","Randen"],
 ["Kürbis","Marroni","Rosenkohl","Lauch","Äpfel","Nüsslisalat"],
 ["Rosenkohl","Federkohl","Lauch","Randen","Nüsslisalat","Äpfel"],
];
const SAISON_E={Lauch:"🥬",Kabis:"🥬",Rüebli:"🥕",Randen:"🟣",Nüsslisalat:"🥗",Lageräpfel:"🍎",Rosenkohl:"🥬",Bärlauch:"🌿",Spargel:"🌱",Rhabarber:"🌱",Radiesli:"🔴",Spinat:"🥬",Erdbeeren:"🍓",Kohlrabi:"🥬",Kirschen:"🍒",Zucchetti:"🥒",Erbsen:"🫛",Salat:"🥗",Aprikosen:"🍑",Himbeeren:"🫐",Tomaten:"🍅",Gurken:"🥒",Bohnen:"🫘",Zwetschgen:"🫐",Peperoni:"🫑",Mais:"🌽",Brombeeren:"🫐",Trauben:"🍇",Äpfel:"🍎",Birnen:"🍐",Kürbis:"🎃",Marroni:"🌰",Federkohl:"🥬"};
const SAISON_IDEE={Kürbis:"Kürbissuppe mit Ingwer, oder im Ofen mit Feta.",Marroni:"Warm vom Stand, oder mit Rosenkohl in der Pfanne.",Äpfel:"Zum Zvieri mit ein paar Nüssen, oder als Apfelwähe.",Randen:"Gekocht als Salat mit Baumnüssen.",Lauch:"Lauchgemüse zu Kartoffeln, oder als Wähe.",Spargel:"Mit Kartoffeln und einem Ei.",Erdbeeren:"Mit Skyr als Zvieri.",Tomaten:"Mit Mozzarella und Basilikum.",Zwetschgen:"Zwetschgenwähe oder zum Birchermüesli.",Rosenkohl:"Im Ofen gebacken, mit etwas Öl und Salz.",Bärlauch:"Als Pesto zu Pasta.",Aprikosen:"Frisch zum Zmorge oder als Wähe."};
const MONAT=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

/* ---------- Mehr Ideen im Feed (Formate aus dem Brainstorming) ---------- */
if(typeof FEED!=="undefined"&&!FEED.some(x=>x.id==="i1")){
  FEED.push(
   {id:"i1",type:"Inspiration",t:"1 Zutat, 3 Rezepte: Kürbis",d:"Suppe mit Ingwer · Ofenkürbis mit Feta · Kürbis-Risotto. Alle drei in rund 30 Minuten.",tags:["saison","schnell","vegetarisch"],all:[],goals:["bewusst","halten","leichter"],pal:["#3a2a1a","#F2C14E","#e07a3a","#6FCF97"]},
   {id:"i2",type:"Inspiration",t:"5-Minuten-Zvieri",d:"Apfel mit Nussmus · Skyr mit Beeren · Vollkornbrot mit Hüttenkäse · Rüebli mit Hummus · eine Handvoll Nüsse.",tags:["schnell","proteinreich"],all:[],goals:["muskeln","bewusst","halten","leichter"],pal:["#1f3d55","#6FCF97","#F2C14E","#FF8A5B"]},
   {id:"i3",type:"Inspiration",t:"Was isst die Schweiz im Herbst?",d:"Marroni vom Stand, Kürbissuppe, Wild mit Spätzli und Rotkraut, Apfelwähe. Flo mag die Marroni: warm in der Hand und voller Ballaststoffe.",tags:["saison","trends"],all:["gluten"],goals:["bewusst","halten"],pal:["#3a1f2a","#FF8A5B","#F2C14E","#a8e6c4"]},
   {id:"i4",type:"Inspiration",t:"Ein Zmorge, der lange satt macht",d:"Protein und Ballaststoffe zusammen halten länger: Birchermüesli mit Quark, Vollkornbrot mit Ei, Overnight Oats mit Apfel.",tags:["proteinreich","schnell"],all:[],goals:["muskeln","bewusst","leichter"],pal:["#1d2c63","#F2C14E","#6FCF97","#ffffff"]}
  );
}

/* ---------- Heute: Schnell erfassen, Teller, Wetter, Abend, Frage des Tages ---------- */
function gestern(){const d=new Date();d.setDate(d.getDate()-1);return S.days[dkey(d)]||[]}
function lieblinge(){
  const cnt={};history(22).slice(0,21).forEach(x=>{MEAL_ORDER.forEach(m=>{const its=x.list.filter(i=>i.meal===m&&i.food&&i.food!=="wasser");if(!its.length)return;const sig=[...new Set(its.map(i=>i.food))].sort().join("+");const o=cnt[sig]||(cnt[sig]={n:0,its,m});o.n++;o.its=its;o.m=m})});
  return Object.values(cnt).filter(o=>o.n>=2).sort((a,b)=>b.n-a.n).slice(0,3);
}
function schnell(){
  const box=document.getElementById("floSchnell");if(!box)return;
  const cm=currentMeal(),y=gestern().filter(i=>i.meal===cm&&i.food);const chips=[];
  if(y.length)chips.push({l:`↺ ${MEALS[cm]} wie gestern`,its:y,k:"wiegestern",gold:true});
  lieblinge().forEach(o=>{const l=namen(o.its.map(i=>i.food));chips.push({l:"♥ "+(l.length>30?l.slice(0,28)+"…":l),its:o.its,k:"liebling"})});
  box.innerHTML=`<div class="flo-lbl">Schnell erfassen</div><div class="flo-row">${chips.map((c,i)=>`<button class="flo-chip${c.gold?" gold":""}" data-sn="${i}">${esc(c.l)}</button>`).join("")}<button class="flo-chip" data-sn="w">💧 Glas Wasser</button><button class="flo-chip" data-sn="b">👟 Bewegung</button></div>`;
  box.querySelectorAll("[data-sn]").forEach(b=>b.onclick=()=>{const k=b.dataset.sn;
    if(k==="w")return glasWasser(); if(k==="b")return document.getElementById("addact").click();
    const c=chips[+k];zaehl(c.k);oeffneMit(c.its.map(i=>Object.assign({},i,{meal:cm})),c.k==="wiegestern"?`«${MEALS[cm]} wie gestern»`:"«Wie immer»");});
}
function tellerSvg(P){
  const T={v:5,p:3,s:3},C={v:"#6FCF97",p:"#FF8A5B",s:"#F2C14E"},cx=66,cy=66;
  const keil=(a0,a1,r,c)=>{const x0=cx+r*Math.cos(a0),y0=cy+r*Math.sin(a0),x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);return `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${c}"/>`};
  let out=`<svg viewBox="0 0 132 132" role="img" aria-label="Dein Teller"><circle cx="66" cy="66" r="64" fill="#f6efe4"/><circle cx="66" cy="66" r="54" fill="#fffdf8" stroke="#e9dcc4" stroke-width="2"/>`;
  [["v",-Math.PI/2],["p",-Math.PI/2+2*Math.PI/3],["s",-Math.PI/2+4*Math.PI/3]].forEach(([k,a])=>{const f=Math.min(1,P[k]/T[k]);out+=keil(a+.04,a+2*Math.PI/3-.04,52,"rgba(26,33,64,.06)");if(f>0)out+=keil(a+.04,a+2*Math.PI/3-.04,14+38*f,C[k])});
  return out+`<circle cx="66" cy="66" r="9" fill="#fffdf8"/></svg>`;
}
function wetter(list){
  const t=sum(list),E=energy(),A=sumAct(list),rest=E.goal+A-t.kcal,eaten=list.some(i=>i.food&&i.food!=="wasser");
  if(!eaten)return ["🌅","Ein neuer Tag. Dein Teller ist noch leer."];
  if(Math.abs(rest)<=150)return ["☀️","Schön im Gleichgewicht heute."];
  if(rest>150)return [new Date().getHours()>=20?"🌙":"🌤","Da ist noch Platz für etwas Feines."];
  return ["🌦","Heute war es reichlich. Kein Problem, morgen ist ein neuer Tag."];
}
function tagSatz(list){
  const teile=[];MEAL_ORDER.forEach(m=>{const its=list.filter(i=>i.meal===m&&i.food&&i.food!=="wasser");if(its.length)teile.push(`${MEALS[m]} ${namen(its.map(i=>i.food).slice(0,3))}`)});
  if(!teile.length)return "";
  const P=portionen(list),t=sum(list),pg=proteinGoal(),A=list.filter(i=>i.act);
  let s="Heute: "+teile.join(", ")+". ";
  s+=P.v>=4?"Viel Farbe auf dem Teller. ":P.v>=2?"Etwas Gemüse und Früchte war dabei. ":"Gemüse kam heute eher kurz. ";
  s+=t.p>=pg*.85?"Protein gut dabei. ":"Protein eher knapp, morgen vielleicht ein Ei oder Skyr mehr. ";
  if(A.length)s+="Und du hast dich bewegt: "+A.map(i=>actName(i)).join(", ")+". ";
  return s+"Schön, dass du dir Zeit genommen hast.";
}
function heute(){
  schnell();
  const list=today(),P=portionen(list);
  const w=document.getElementById("hW");if(w){w.textContent=wasser(list);document.getElementById("hS").textContent=fmt(schritte(list));document.getElementById("hF").textContent=Math.round(P.v)}
  document.body.classList.toggle("flo-sanft",!!X.sanft);
  // Vorlesen beim Tipp
  const tip=document.getElementById("tipcard");if(tip&&!tip.querySelector(".flo-say")){const b=el('<button class="flo-say" aria-label="Flo liest vor">🔊</button>');b.onclick=()=>sag(Array.from(tip.querySelectorAll("p,li")).map(x=>x.textContent).join(" "));tip.prepend(b)}
  const box=document.getElementById("floHeute");if(!box)return;
  const [we,wt]=wetter(list),h=new Date().getHours();
  let html=`<div class="card"><h3>Dein Teller</h3><div class="teller">${tellerSvg(P)}<div class="leg"><div><i style="background:#6FCF97"></i>Gemüse &amp; Früchte <b>${Math.round(P.v)}</b> von 5</div><div><i style="background:#FF8A5B"></i>Protein <b>${Math.round(P.p)}</b> von 3</div><div><i style="background:#F2C14E"></i>Getreide &amp; Kartoffeln <b>${Math.round(P.s)}</b> von 3</div><div class="small" style="margin-top:4px">Portionen grob geschätzt.</div></div></div><div class="wetter"><span>${we}</span><span>${wt}</span></div></div>`;
  const foods=list.filter(i=>i.food&&i.food!=="wasser").length;
  if(h>=18&&foods<2)html+=`<div class="card tip"><div class="lbl">🌙 Flo fragt</div><p><b>Was gab es heute?</b> Ein Satz reicht, zum Beispiel «Zmittag Pasta, Znacht Suppe und Brot».</p><button class="btn" id="floErz" style="margin-top:10px">Flo erzählen</button></div>`;
  else if(foods>=2&&h>=17){const ts=tagSatz(list);html+=`<div class="card tip"><button class="flo-say" id="floTsS" aria-label="Vorlesen">🔊</button><div class="lbl">✨ Dein Tag in einem Satz</div><p id="floTs">${esc(ts)}</p></div>`}
  const mu=muster();if(mu.length)html+=`<div class="card"><h3>Was Flo bemerkt hat</h3>${mu.slice(0,2).map(x=>`<p style="margin:0 0 6px">${musterSatz(x)}</p>`).join("")}<p class="small" style="margin:6px 0 0">Nur eine Beobachtung aus deinen Antworten, kein Befund.</p></div>`;
  const qi=tagNr(),beantwortet=X.quiz[dkey()];
  html+=`<div class="card"><h3>Flos Frage des Tages</h3>${quizHtml(qi,"floQd")}</div>`;
  box.innerHTML=html;
  const erz=document.getElementById("floErz");if(erz)erz.onclick=()=>{window.scrollTo({top:0,behavior:"smooth"});setTimeout(()=>document.getElementById("mic").click(),50)};
  const tss=document.getElementById("floTsS");if(tss)tss.onclick=()=>sag(document.getElementById("floTs").textContent);
  const qd=document.getElementById("floQd");quizBind(qd,qi,ok=>{X.quiz[dkey()]=ok?"r":"f";sp()});
  if(beantwortet){const Q=QUIZ[qi%QUIZ.length];qd.querySelector(".qres").innerHTML=`<div class="res"><b>Heute schon beantwortet: ${Q.a==="m"?"Mythos":"Fakt"}.</b><div style="margin-top:4px">${Q.e}</div><div class="src">Morgen gibt es eine neue Frage.</div></div>`;qd.querySelectorAll("[data-qa]").forEach(x=>x.disabled=true)}
}

/* ---------- Für dich: Kühlschrank, Saison, Wochenplan, Mythos ---------- */
function entdecken(){
  const box=document.getElementById("floEntdecken");if(!box||box.dataset.ok)return;box.dataset.ok="1";
  box.innerHTML=`<div class="tiles">
   <button class="tile" data-t="kuehl"><span class="e">🧊</span><b>Kühlschrank</b><small>Sag, was du hast. Flo findet Rezepte.</small></button>
   <button class="tile" data-t="saison"><span class="e">🍂</span><b>Saison Schweiz</b><small>Was jetzt reif ist.</small></button>
   <button class="tile" data-t="plan"><span class="e">🗓️</span><b>Wochenplan</b><small>5 Rezepte + Einkaufsliste.</small></button>
   <button class="tile" data-t="quiz"><span class="e">❓</span><b>Mythos oder Fakt</b><small>Kurz raten, kurz lernen.</small></button></div>`;
  box.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>({kuehl,saison,plan,quiz:quizAlle})[b.dataset.t]());
}
function rezepte(){return FEED.filter(it=>it.type==="Rezept"&&!it.all.some(x=>S.profile.allergies.includes(x)))}
function kuehl(){
  zaehl("kuehlschrank");
  openS2(`<h2 style="font-size:22px">🧊 Kühlschrank-Modus</h2><p class="small" style="margin:4px 0 10px">Sag oder schreib, was du da hast. Tipp: Mikrofon der Tastatur.</p>
   <textarea class="inp" id="kText" rows="2" placeholder="z.B. Eier, Spinat und Reis"></textarea><button class="btn" id="kGo">Rezepte finden</button><div id="kRes"></div>`);
  const go=()=>{const ids=[...new Set(parse(document.getElementById("kText").value).filter(i=>i.food).map(i=>i.food))];
    const res=document.getElementById("kRes");if(!ids.length){res.innerHTML=`<p class="empty">Ich habe noch nichts erkannt. Versuch es mit z.B. «Eier, Spinat, Reis».</p>`;return}
    const R=rezepte().map(r=>{const ri=[...new Set(parse(r.ing).filter(i=>i.food).map(i=>i.food))];const hit=ri.filter(x=>ids.includes(x));return {r,ri,hit}}).filter(x=>x.hit.length).sort((a,b)=>b.hit.length/b.ri.length-a.hit.length/a.ri.length).slice(0,3);
    res.innerHTML=(R.length?`<h3 style="font-size:17px;margin-top:16px">Passt zu dem, was du hast</h3><ul class="slist">${R.map(x=>`<li><span class="e">🍽️</span><div style="flex:1"><b>${x.r.t}</b><div class="small">Du hast ${x.hit.length} von ${x.ri.length} Zutaten${x.ri.length>x.hit.length?" · fehlt: "+esc(namen(x.ri.filter(i=>!ids.includes(i)))):""}</div><button class="more" data-op="${x.r.id}">Rezept ansehen →</button></div></li>`).join("")}</ul>`:"")
      +`<div class="card tip" style="margin-top:14px"><div class="lbl">Flos schnelle Idee</div><p>${esc(namen(ids))}: kurz in der Pfanne anbraten, mit Salz, Pfeffer und Kräutern abschmecken. ${ids.some(i=>/p|fi/.test(BYID[i][6]||""))?"Protein ist schon dabei.":"Ein Ei oder etwas Käse dazu bringt Protein."} ${ids.some(i=>/v|fr/.test(BYID[i][6]||""))?"":"Ein paar Tomaten oder Rüebli bringen Farbe."}</p></div>`;
    res.querySelectorAll("[data-op]").forEach(b=>b.onclick=()=>openPost(b.dataset.op));};
  document.getElementById("kGo").onclick=go;
}
function saison(){
  zaehl("saison");const m=new Date().getMonth(),n=(m+1)%12;
  const li=a=>`<ul class="slist">${a.map(x=>`<li><span class="e">${SAISON_E[x]||"🌿"}</span><div><b>${x}</b>${SAISON_IDEE[x]?`<div class="small">${SAISON_IDEE[x]}</div>`:""}</div></li>`).join("")}</ul>`;
  openS2(`<h2 style="font-size:22px">🍂 Jetzt reif in der Schweiz</h2><p class="small" style="margin:4px 0 0">${MONAT[m]} · vom Markt statt von weit her</p>${li(SAISON[m])}
   <h3 style="font-size:17px;margin-top:16px">Bald im ${MONAT[n]}</h3><p class="small" style="margin:4px 0 0">${SAISON[n].filter(x=>!SAISON[m].includes(x)).join(", ")||"ähnlich wie jetzt"}</p>
   <p class="small" style="margin-top:14px">Grober Saisonkalender, je nach Region und Wetter etwas früher oder später.</p>`);
}
function menge(ing,f){ // «170 g Skyr» -> {n:"Skyr",g:170}
  return ing.split(",").map(x=>x.trim()).map(x=>{const m=x.match(/^(\d+[.,]?\d*)\s*(g|ml|dl)?\s+(.+)$/);if(!m)return {n:x,k:x.toLowerCase()};const z=parseFloat(m[1].replace(",","."))*f;return m[2]?{n:m[3],g:z,u:m[2],k:m[3].toLowerCase()}:{n:m[3],st:z,k:m[3].toLowerCase()}});
}
function planNeu(pers){
  const R=rezepte();const sc=R.map(r=>({r,s:(S.profile.saved.includes(r.id)?10:0)+(r.min>=15?4:0)+feedScore(r).sc+Math.random()*2})).sort((a,b)=>b.s-a.s);
  X.plan={pers,ids:sc.slice(0,5).map(x=>x.r.id),done:{},am:dkey()};sp();
}
function plan(){
  zaehl("wochenplan");if(!X.plan)planNeu(1);
  const draw=()=>{const P=X.plan,R=P.ids.map(id=>FEED.find(x=>x.id===id)).filter(Boolean);const tage=["Montag","Dienstag","Mittwoch","Donnerstag","Freitag"];
    const sumL={};R.forEach(r=>menge(r.ing,P.pers).forEach(z=>{const o=sumL[z.k]||(sumL[z.k]={n:z.n,g:0,u:z.u,st:0});if(z.g)o.g+=z.g;if(z.st)o.st+=z.st}));
    const L=Object.entries(sumL).sort((a,b)=>a[1].n.localeCompare(b[1].n,"de"));
    openS2(`<h2 style="font-size:22px">🗓️ Dein Wochenplan</h2><p class="small" style="margin:4px 0 8px">5 Rezepte für deine Woche, passend zu deinem Ziel, ohne deine Allergene.</p>
     <div class="pills">${[1,2,4].map(n=>`<button class="pill ${P.pers===n?"on":""}" data-pers="${n}">${n===1?"Für mich":n===2?"Zu zweit":"Familie (4)"}</button>`).join("")}</div>
     <ul class="slist">${R.map((r,i)=>`<li><span class="e">${["🥗","🍝","🐟","🥣","🍛"][i%5]}</span><div style="flex:1"><div class="small">${tage[i]}</div><b>${r.t}</b> <span class="small">· ${r.min} Min.</span><br><button class="more" data-op="${r.id}" style="margin-top:2px">Rezept →</button></div></li>`).join("")}</ul>
     <h3 style="font-size:17px;margin-top:16px">🛒 Einkaufsliste${P.pers>1?" für "+P.pers:""}</h3>
     <div class="einkauf">${L.map(([k,o])=>`<label class="${P.done[k]?"ok":""}"><input type="checkbox" data-ek="${esc(k)}" ${P.done[k]?"checked":""}><span>${o.g?fmt(o.g)+" "+(o.u||"g")+" ":o.st?fmt(o.st)+" ":""}${esc(o.n)}</span></label>`).join("")}</div>
     <button class="btn" id="plShare">Liste teilen</button><button class="btn ghost" id="plNeu">Neuen Plan machen</button>
     <p class="small">Mengen sind Schätzungen. Gespeicherte Rezepte kommen zuerst in den Plan.</p>`);
    document.querySelectorAll("[data-pers]").forEach(b=>b.onclick=()=>{X.plan.pers=+b.dataset.pers;X.plan.done={};sp();draw()});
    document.querySelectorAll("[data-op]").forEach(b=>b.onclick=()=>openPost(b.dataset.op));
    document.querySelectorAll("[data-ek]").forEach(c=>c.onchange=()=>{X.plan.done[c.dataset.ek]=c.checked;sp();c.parentElement.classList.toggle("ok",c.checked)});
    document.getElementById("plNeu").onclick=()=>{planNeu(X.plan.pers);draw();pose("jubel",1800,"🗓️")};
    document.getElementById("plShare").onclick=()=>{const t="Einkaufsliste Food and Flow\n"+L.filter(([k])=>!X.plan.done[k]).map(([k,o])=>"– "+(o.g?fmt(o.g)+" "+(o.u||"g")+" ":o.st?fmt(o.st)+" ":"")+o.n).join("\n");
      if(navigator.share)navigator.share({title:"Einkaufsliste",text:t}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>toast("Liste kopiert"),()=>{});};
  };draw();
}
function quizAlle(){
  let i=Math.floor(Math.random()*QUIZ.length),richtig=0,n=0;
  const draw=()=>{openS2(`<h2 style="font-size:22px">❓ Mythos oder Fakt</h2><p class="small" style="margin:4px 0 12px">${n?`${richtig} von ${n} richtig`:"Wisch dich durch, ganz ohne Punkte-Druck."}</p>${quizHtml(i,"qa")}<button class="btn" id="qWeiter" style="display:none">Nächste Frage →</button>`);
    quizBind(document.getElementById("qa"),i,ok=>{n++;if(ok)richtig++;document.getElementById("qWeiter").style.display="block"});
    document.getElementById("qWeiter").onclick=()=>{i++;draw()};};
  draw();
}

/* ---------- Verlauf: Woche als Geschichte ---------- */
function woche(){
  const box=document.getElementById("floWoche");if(!box)return;
  const h=history(7),tage=h.filter(x=>x.list.some(i=>i.food&&i.food!=="wasser"));
  if(!tage.length){box.innerHTML=`<div class="card story"><h3>Deine Woche als Geschichte</h3><p>Erzähl mir ein paar Tage, was du isst. Dann schreibe ich dir hier deine Woche in drei Sätzen.</p></div>`;return}
  const freq={};tage.forEach(x=>x.list.forEach(i=>{if(i.food&&!["wasser","kaffee","tee"].includes(i.food))freq[i.food]=(freq[i.food]||0)+1}));
  const top=Object.entries(freq).sort((a,b)=>b[1]-a[1])[0];
  const best=tage.map(x=>({x,v:portionen(x.list).v})).sort((a,b)=>b.v-a.v)[0];
  let min=0,st=0;h.forEach(x=>x.list.forEach(i=>{if(i.act==="schritte")st+=i.steps;else if(i.act)min+=i.min}));
  const a=analyse();
  const s1=`Diese Woche hast du mir an ${tage.length} von 7 Tagen erzählt, was du isst.${top?` ${BYID[top[0]][1]} war dein treuer Begleiter (${top[1]} Mal).`:""}`;
  const s2=best&&best.v>=1?`Am ${WT[best.x.d.getDay()]} gab es am meisten Farbe auf dem Teller: rund ${Math.round(best.v)} Portionen Gemüse und Früchte.`:"Gemüse und Früchte kamen diese Woche eher kurz. Eine Handvoll Rüebli zum Zmittag ist schon ein Anfang.";
  const s3=min||st?`Bewegt hast du dich ${min?fmt(min)+" Minuten":""}${min&&st?" und ":""}${st?"mit rund "+fmt(st)+" Schritten":""}. Dein Körper hat das gemerkt.`:"Bewegung kam diese Woche eher kurz. Ein Spaziergang zählt auch.";
  const vor=a.days>=5&&a.pMiss>=a.days*.5?proteinIdeas(a)[0]:a.days>=5&&a.fishDays<=1?"Einmal Fisch, zum Beispiel Ofenlachs mit Härdöpfeln.":best&&best.v<3?"Jeden Tag eine Portion Gemüse mehr, zum Beispiel Tomaten zum Brot.":"Mach einfach weiter so, ganz ohne Druck.";
  const mu=muster();
  box.innerHTML=`<div class="card story"><button class="flo-say" id="wkS" aria-label="Vorlesen">🔊</button><h3>Deine Woche als Geschichte</h3><div id="wkT"><p>${esc(s1)}</p><p>${esc(s2)}</p><p>${esc(s3)}</p></div><div class="vor">💡 Kleiner Vorschlag für nächste Woche: ${esc(vor)}</div></div>`
   +`<div class="card"><h3>Essen &amp; Befinden</h3>${mu.length?mu.map(x=>`<p style="margin:0 0 6px">${musterSatz(x)}</p>`).join(""):`<p class="small" style="margin:0">Nach dem Speichern fragt Flo kurz: «Wie fühlst du dich?» Nach ein paar Antworten siehst du hier, was dir Energie gibt. Bisher ${X.mood.length} Antworten.</p>`}<p class="small" style="margin:8px 0 0">Nur Beobachtungen aus deinen eigenen Antworten, kein Befund.</p></div>`;
  document.getElementById("wkS").onclick=()=>sag(document.getElementById("wkT").textContent+" Kleiner Vorschlag: "+vor);
}

/* ---------- Ich: Was Flo sich merkt, Einstellungen, Sicherung ---------- */
function merkt(){
  const box=document.getElementById("floMerkt");if(!box)return;
  const alle=Object.values(S.days),tage=alle.filter(l=>l.some(i=>i.food)).length;
  const freq={},zm={};alle.forEach(l=>l.forEach(i=>{if(i.food&&!["wasser"].includes(i.food)){freq[i.food]=(freq[i.food]||0)+1;if(i.meal==="fr")zm[i.food]=(zm[i.food]||0)+1}}));
  const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>BYID[x[0]]&&BYID[x[0]][1]).filter(Boolean);
  const z=Object.entries(zm).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>BYID[x[0]]&&BYID[x[0]][1]).filter(Boolean);
  const wo=Object.keys(EIGEN.alias).concat(EIGEN.foods.map(e=>e[1]));
  const Z=X.zahl,mu=muster(),s=srv();
  const rows=[["📅","Erzählte Tage",tage?tage+" Tage":"noch keine"],["🍽️","Am liebsten",top.join(", ")||"–"],["☕","Typischer Zmorge",z.join(" und ")||"–"],
    ["🧠","Neue Wörter gelernt",wo.length?wo.slice(-6).join(", "):"noch keine (bei Unbekanntem «Ähnlich wie …» wählen)"],
    ["💛","Befinden",X.mood.length?X.mood.length+" Antworten"+(mu.length?" · "+musterSatz(mu[0]):""):"noch keine"],
    ["🎙️","Wie du erzählst",`Mikrofon ${Z.mikrofon||0}× · getippt ${Z.text||0}× · wie gestern ${(Z.wiegestern||0)+(Z.liebling||0)}× · Wasser ${Z.wasser||0}×`]];
  box.innerHTML=`<div class="card"><h3>Was Flo sich merkt</h3>${rows.map(r=>`<div class="habit"><div class="ic">${r[0]}</div><div><b style="font-weight:600">${r[1]}</b><div class="small" style="color:var(--ink2)">${esc(r[2])}</div></div></div>`).join("")}
   <p class="small" style="margin:8px 0 0">Alles bleibt nur auf diesem Handy. Keine Tonaufnahmen, keine Bilder.</p></div>
   <div class="card"><h3>Flo einstellen</h3>
   <label class="flo-check"><input type="checkbox" data-ok="befinden" ${X.ok.befinden?"checked":""}><span>Nach dem Essen kurz fragen: «Wie fühlst du dich?»</span></label>
   <label class="flo-check"><input type="checkbox" data-ok="sanft" ${X.sanft?"checked":""}><span>Sanfte Ansicht: Teller und Wetter statt Kalorien-Zahlen</span></label>
   <label class="flo-check"><input type="checkbox" data-ok="server" ${X.ok.server?"checked":""}><span>Unbekanntes Essen beim Flo-Server nachfragen. Es geht nur das eine Wort weg, z.B. «Bündnerfleisch». <span class="small">${s?"Verbindung da.":"Noch nicht verbunden: über den runden Knopf unten rechts verbinden."}</span></span></label>
   <label class="flo-check"><input type="checkbox" data-ok="teilen" ${X.ok.teilen?"checked":""}><span>Lern-Zahlen an DR Lab senden, damit Flo besser wird. Nur Zählwerte wie «Mikrofon 12×», nie dein Essen, nie Stimme oder Bild. Ohne Server-Verbindung teilst du sie unten als Text.</span></label>
   </div>
   <div class="card"><h3>Sicherung</h3><p class="small" style="margin:0">Deine Daten liegen nur hier. Mit einer Sicherung kannst du sie auf ein neues Handy mitnehmen.</p>
   <button class="btn" id="bkDown">Sicherung herunterladen</button><button class="btn ghost" id="bkUp">Sicherung laden</button><input type="file" id="bkFile" accept="application/json,.json" hidden>
   <button class="btn ghost" id="flVerg">Flo alles Gelernte vergessen lassen</button></div>`;
  box.querySelectorAll("[data-ok]").forEach(c=>c.onchange=()=>{const k=c.dataset.ok;if(k==="sanft")X.sanft=c.checked;else X.ok[k]=c.checked;sp();if(k==="teilen"&&c.checked)teilen(true);render();toast(c.checked?"Eingeschaltet":"Ausgeschaltet")});
  document.getElementById("bkDown").onclick=()=>{const o={app:"Food and Flow",am:new Date().toISOString(),"appid-v1":lsGet("appid-v1"),[PK]:X,[EIGEN_KEY]:EIGEN};
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:"application/json"}));a.download="food-and-flow-sicherung-"+dkey()+".json";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);zaehl("sicherung")};
  document.getElementById("bkUp").onclick=()=>document.getElementById("bkFile").click();
  document.getElementById("bkFile").onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const o=JSON.parse(t);if(o.app!=="Food and Flow")throw 0;
    try{if(o["appid-v1"])localStorage.setItem("appid-v1",JSON.stringify(o["appid-v1"]));if(o[PK])localStorage.setItem(PK,JSON.stringify(o[PK]));if(o[EIGEN_KEY])localStorage.setItem(EIGEN_KEY,JSON.stringify(o[EIGEN_KEY]))}catch(x){}
    toast("Sicherung geladen");setTimeout(()=>location.reload(),900)}).catch(()=>toast("Das ist keine Food-and-Flow-Sicherung."))};
  let vg=0;document.getElementById("flVerg").onclick=function(){if(!vg){vg=1;this.textContent="Nochmals tippen zum Vergessen";setTimeout(()=>{vg=0;this.textContent="Flo alles Gelernte vergessen lassen"},3000);return}
    X.mood=[];X.zahl={};X.quiz={};EIGEN.foods=[];EIGEN.alias={};sp();try{localStorage.setItem(EIGEN_KEY,JSON.stringify(EIGEN))}catch(x){}toast("Flo hat alles Gelernte vergessen");merkt()};
}

/* ---------- In die bestehenden Ansichten einhängen ---------- */
function haken(name,fn){const o=window[name];if(typeof o!=="function")return;window[name]=function(){const r=o.apply(this,arguments);try{fn()}catch(e){console.error("Flo:",e)}return r}}
haken("render",heute);haken("renderFeed",entdecken);haken("renderVerlauf",woche);haken("renderIch",merkt);
try{heute()}catch(e){console.error("Flo:",e)}
window.FLO={pose,sag,floSatz,zaehl,X,sp,heute,entdecken};
const gp=grundPose();setTimeout(()=>pose(gp[0]||"winkt",gp[0]?0:2400,gp[1]||"👋"),900);
setTimeout(()=>teilen(false),4000);
})();
