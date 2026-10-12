// Baut den Web-Teil einer App für die iPhone-App: node web-bauen.mjs mondschein
// Kopiert die App aus dem Repo, nimmt die Schriften lokal mit und hängt die kleine iPhone-Brücke an.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(hier, '..');
const apps = JSON.parse(fs.readFileSync(path.join(hier, 'apps.json'), 'utf8'));
const key = process.argv[2];
const app = apps[key];
if (!app) { console.error('Unbekannte App. Möglich: ' + Object.keys(apps).join(', ')); process.exit(1); }

const projekt = path.join(hier, key);
const www = path.join(projekt, 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, 'native'), { recursive: true });

fs.cpSync(path.join(repo, app.ordner), path.join(www, app.ordner), { recursive: true });
if (app.nova && fs.existsSync(path.join(repo, 'nova'))) fs.cpSync(path.join(repo, 'nova'), path.join(www, 'nova'), { recursive: true });
fs.cpSync(path.join(hier, 'shared', 'fonts'), path.join(www, 'native', 'fonts'), { recursive: true });
fs.copyFileSync(path.join(hier, 'shared', 'native.js'), path.join(www, 'native', 'native.js'));
const core = path.join(projekt, 'node_modules', '@capacitor', 'core', 'dist', 'capacitor.js');
if (fs.existsSync(core)) fs.copyFileSync(core, path.join(www, 'native', 'capacitor.js'));
else console.warn('Hinweis: @capacitor/core fehlt noch, zuerst npm install.');

const datei = path.join(www, app.ordner, 'index.html');
let html = fs.readFileSync(datei, 'utf8');
html = html.replace(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '');
// Im App Store keine Hinweise auf «Testphase» (Apple lehnt Test- und Beta-Hinweise ab).
html = html.replace(/DR Lab · Testphase/g, 'DR Lab').replace(/Testphase gratis\./g, 'Gratis.');
if (!app.nova) html = html.replace(/<script src="\.\.\/nova\/[^"]+"[^>]*><\/script>\s*/g, '');
const kopf = '<link rel="stylesheet" href="../native/fonts/fonts.css">\n' +
  (fs.existsSync(core) ? '<script src="../native/capacitor.js"></script>\n' : '') +
  '<script src="../native/native.js"></script>\n' +
  (app.css ? `<style>${app.css}</style>\n` : '');
html = html.replace(/<head>/i, m => m + '\n' + kopf);
fs.writeFileSync(datei, html);
fs.rmSync(path.join(www, app.ordner, 'sw.js'), { force: true });

fs.writeFileSync(path.join(www, 'index.html'),
  `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html,body{margin:0;background:${app.hintergrund}}</style><script>location.replace('${app.ordner}/index.html')</script></head><body></body></html>\n`);
console.log(`${app.name}: Web-Teil bereit in ${path.relative(repo, www)}`);
