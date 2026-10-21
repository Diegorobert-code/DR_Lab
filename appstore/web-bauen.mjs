// Baut den Web-Teil einer App für die iPhone-App: node web-bauen.mjs mondschein
// Kopiert die App aus dem Repo, nimmt Schriften und benutzte Bausteine (../nova, ../apps/sprechen …) lokal mit
// und hängt die kleine iPhone-Brücke an. Am Ende eine kurze Prüfung (Rechte, fremde Server, Lern-Karte).
// Optional: --quelle <Ordner>  App aus einem anderen Repo-Stand bauen (z. B. Feature-Branch)
//           --ziel <Ordner>    www woanders hinschreiben (z. B. für Screenshots)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
function opt(n) { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; }
const quelle = opt('--quelle');
const ziel = opt('--ziel');
const repo = path.resolve(quelle || path.join(hier, '..'));
const apps = JSON.parse(fs.readFileSync(path.join(hier, 'apps.json'), 'utf8'));
const key = args[0];
const app = apps[key];
if (!app) { console.error('Unbekannte App. Möglich: ' + Object.keys(apps).join(', ')); process.exit(1); }

const projekt = path.join(hier, key);
const www = ziel ? path.resolve(ziel) : path.join(projekt, 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, 'native'), { recursive: true });

let appQuelle = path.join(repo, app.ordner);
// App noch nicht auf main (apps.json «quelleBranch»): Ordner aus dem Feature-Branch holen, nur für diesen Bau.
if (!fs.existsSync(path.join(appQuelle, 'index.html')) && app.quelleBranch) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drlab-quelle-'));
  try {
    execSync(`git fetch --depth=1 origin ${app.quelleBranch}`, { cwd: repo, stdio: 'ignore' });
    execSync(`git archive FETCH_HEAD ${app.ordner} | tar -x -C "${tmp}"`, { cwd: repo, stdio: 'ignore', shell: '/bin/sh' });
    appQuelle = path.join(tmp, app.ordner);
    console.log(`Hinweis: ${app.ordner}/ fehlt auf diesem Stand, genommen aus Branch ${app.quelleBranch}`);
  } catch (e) { /* unten: Platzhalter */ }
}
if (!fs.existsSync(path.join(appQuelle, 'index.html'))) {
  if (!app.quelleBranch) { console.error('Nicht gefunden: ' + path.join(appQuelle, 'index.html')); process.exit(1); }
  // Branch nicht erreichbar: Platzhalter, damit der App-Bau trotzdem geprüft werden kann. So nie einreichen.
  console.log(`::warning::${app.ordner}/ fehlt (weder hier noch im Branch ${app.quelleBranch}). Gebaut wird eine Platzhalter-Seite, so nicht einreichen.`);
  fs.writeFileSync(path.join(www, 'index.html'), `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${app.name}</title></head><body style="margin:0;background:${app.hintergrund}"></body></html>\n`);
  process.exit(0);
}
// Nur die App selbst, ohne Service Worker und ohne das Test-Gesprächsfenster (feedback.js schickt an Diego, gehört zur Testphase).
const RAUS = new Set(['sw.js', 'feedback.js', 'FIGUR.md']);
fs.cpSync(appQuelle, path.join(www, app.ordner), { recursive: true, filter: q => !RAUS.has(path.basename(q)) || path.dirname(q) !== appQuelle });

// Bausteine ausserhalb des App-Ordners, die die App benutzt (../nova/intro.js, ../apps/sprechen/sprechen.js, Figurenbilder …).
// Ohne Nova (nova: false) bleibt alles weg, was mit dem Server redet: nova.js, mund.js, reden.html, ElevenLabs.
const NOVA_SERVER = /^nova\/(nova\.js|mund\.js|reden\.html|elevenlabs[^/]*)$/;
const textDatei = f => /\.(html|js|css|json)$/i.test(f);
function alleDateien(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? alleDateien(path.join(d, e.name)) : [path.join(d, e.name)]);
}
const kopiert = new Set();
function bausteineHolen(datei) {
  const text = fs.readFileSync(datei, 'utf8');
  const re = /(["'(])((?:\.\.\/)+[^"'()\s?#]+)/g;
  let m;
  while ((m = re.exec(text))) {
    const imWww = path.resolve(path.dirname(datei), m[2]);
    const rel = path.relative(www, imWww).split(path.sep).join('/');
    if (rel.startsWith('..') || rel.startsWith(app.ordner + '/') || kopiert.has(rel)) continue;
    if (!app.nova && NOVA_SERVER.test(rel)) continue;
    const q = path.join(repo, rel);
    if (!fs.existsSync(q) || !fs.statSync(q).isFile()) continue; // Ordner = Link zu einer anderen App, die blendet store.js aus
    kopiert.add(rel);
    fs.mkdirSync(path.dirname(imWww), { recursive: true });
    fs.copyFileSync(q, imWww);
    if (textDatei(q)) bausteineHolen(imWww);
  }
}
const appDateien = alleDateien(path.join(www, app.ordner)).filter(textDatei);
appDateien.forEach(bausteineHolen);

fs.cpSync(path.join(hier, 'shared', 'fonts'), path.join(www, 'native', 'fonts'), { recursive: true });
fs.copyFileSync(path.join(hier, 'shared', 'native.js'), path.join(www, 'native', 'native.js'));
fs.copyFileSync(path.join(hier, 'shared', 'store.js'), path.join(www, 'native', 'store.js'));
const core = path.join(projekt, 'node_modules', '@capacitor', 'core', 'dist', 'capacitor.js');
if (fs.existsSync(core)) fs.copyFileSync(core, path.join(www, 'native', 'capacitor.js'));
else console.warn('Hinweis: @capacitor/core fehlt noch, zuerst npm install.');

// Feste Ersetzungen pro App (apps.json «ersetzen»: [Datei, alt, neu]). Ändert nur die Kopie im Build, nie den App-Code.
const hinweise = [];
for (const [datei, alt, neu] of app.ersetzen || []) {
  const f = path.join(www, app.ordner, datei);
  if (!fs.existsSync(f)) { hinweise.push(`Ersetzen: ${datei} fehlt`); continue; }
  const t = fs.readFileSync(f, 'utf8');
  if (!t.includes(alt)) { hinweise.push(`Ersetzen: «${alt.slice(0, 50)}» nicht gefunden in ${datei}`); continue; }
  fs.writeFileSync(f, t.split(alt).join(neu));
}

const store = { ordner: app.ordner, kinder: !!app.kinder, verstecken: app.verstecken || [] };
const css = (app.css || '') + (app.nova ? '' : '.nb-reden{display:none!important}');
const kopf = '<link rel="stylesheet" href="../native/fonts/fonts.css">\n' +
  (fs.existsSync(core) ? '<script src="../native/capacitor.js"></script>\n' : '') +
  '<script src="../native/native.js"></script>\n' +
  `<script>window.DRLAB_STORE=${JSON.stringify(store)}</script>\n<script src="../native/store.js"></script>\n` +
  (css ? `<style>${css}</style>\n` : '') +
  // TradePing-Wache: die iPhone-App nimmt nur die Adresse aus apps.json (leer = aus), nie die der Web-Version.
  (typeof app.wache === 'string' ? `<script>window.TP_WACHE=${JSON.stringify(app.wache)}</script>\n` : '');

for (const datei of fs.readdirSync(path.join(www, app.ordner)).filter(f => f.endsWith('.html'))) {
  const voll = path.join(www, app.ordner, datei);
  let html = fs.readFileSync(voll, 'utf8');
  html = html.replace(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '');
  html = html.replace(/<link[^>]+rel="manifest"[^>]*>\s*/g, '');
  // Im App Store keine Hinweise auf «Testphase» oder «Prototyp» (Apple lehnt Test- und Beta-Hinweise ab).
  html = html.replace(/DR Lab · Testphase/g, 'DR Lab').replace(/Testphase gratis\./g, 'Gratis.')
    .replace(/<span class="tag">(DR Lab · )?Prototyp<\/span>/g, '');
  html = html.replace(/<script[^>]+src="feedback\.js"[^>]*><\/script>\s*/g, '');
  if (!app.nova) html = html.replace(/<script[^>]+src="\.\.\/nova\/(nova|mund)\.js"[^>]*><\/script>\s*/g, '');
  // Nach <meta charset> einfügen, damit die Zeichenkodierung zuerst kommt (Umlaute).
  if (/<meta charset[^>]*>/i.test(html)) html = html.replace(/<meta charset[^>]*>/i, m => m + '\n' + kopf);
  else html = html.replace(/<head>/i, m => m + '\n' + kopf);
  fs.writeFileSync(voll, html);
}

fs.writeFileSync(path.join(www, 'index.html'),
  `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html,body{margin:0;background:${app.hintergrund}}</style><script>location.replace('${app.ordner}/index.html')</script></head><body></body></html>\n`);

// ---------- Kurze Prüfung ----------
const gebaut = alleDateien(www).filter(f => /\.(html|js)$/i.test(f) && !/elevenlabs|capacitor\.js$|\.min\.js$/.test(f));
const alles = gebaut.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const plistDatei = path.join(projekt, 'ios', 'App', 'App', 'Info.plist');
const plist = fs.existsSync(plistDatei) ? fs.readFileSync(plistDatei, 'utf8') : '';
const braucht = [
  [/getUserMedia\(\s*\{[^}]*video|facingMode|capture="/, 'NSCameraUsageDescription', 'Kamera'],
  [/getUserMedia|SpeechRecognition/, 'NSMicrophoneUsageDescription', 'Mikrofon'],
  [/SpeechRecognition/, 'NSSpeechRecognitionUsageDescription', 'Spracherkennung'],
];
for (const [re, k, name] of braucht) if (re.test(alles) && !plist.includes(k)) hinweise.push(`Info.plist: ${k} fehlt (App benutzt ${name})`);
const OK_HOSTS = /^(www\.w3\.org|diegorobert-code\.github\.io|github\.com|developer\.mozilla\.org)$/;
const hosts = new Set();
for (const m of alles.matchAll(/["'`(]https:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) if (!OK_HOSTS.test(m[1])) hosts.add(m[1]);
if (hosts.size) hinweise.push('Adressen im Code (Links oder Abrufe, prüfen ob Daten rausgehen): ' + [...hosts].sort().join(', '));
if (!/sich merkt/.test(alles)) hinweise.push('Lern-Karte «Was … sich merkt» nicht gefunden');
if (/drlab-hermes-adresse/.test(alles) && !app.nova) hinweise.push('Server-Weitergabe ist im Code, bleibt aber aus (ohne nova.js keine Server-Adresse)');
const fehlend = [];
for (const f of gebaut.filter(f => f.endsWith('.html') && path.dirname(f) === path.join(www, app.ordner))) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/(?:src|href)="(\.\.\/[^"?#]+)"/g)) {
    const z = path.resolve(path.dirname(f), m[1]);
    if (!fs.existsSync(z) && /\.(js|css|jpe?g|png|svg|mp4|mp3)$/i.test(z) && !(!app.nova && NOVA_SERVER.test(path.relative(www, z).split(path.sep).join('/')))) fehlend.push(m[1]);
  }
}
if (fehlend.length) hinweise.push('Fehlt im Build: ' + [...new Set(fehlend)].join(', '));

if (app.wache) console.log(`Wache an: ${app.wache}\nDatenschutz nicht vergessen: PrivacyInfo.xcprivacy und App Store Connect anpassen (siehe server/TRADEPING-WACHE.md).`);
console.log(`${app.name}: Web-Teil bereit in ${path.relative(process.cwd(), www) || '.'}` + (kopiert.size ? ` (mit ${[...kopiert].join(', ')})` : ''));
for (const h of hinweise) console.log('  Prüfung: ' + h);
