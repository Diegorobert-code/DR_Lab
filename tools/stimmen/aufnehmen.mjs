// Nimmt Ottis (und der anderen Figuren) feste Sätze einmal mit ElevenLabs auf.
// Aufruf:  node tools/stimmen/aufnehmen.mjs mondschein [--probe] [--nur otti]
//   ohne Schlüssel (ELEVENLABS_API_KEY) wird nur gezählt: Sätze, Zeichen, Kosten.
//   --probe nimmt nur 3 Sätze pro Figur auf (zum Anhören).
// Der Schlüssel kommt nur aus der Umgebung (GitHub-Secret), nie in eine Datei.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const app = process.argv[2] || 'mondschein';
const probe = process.argv.includes('--probe');
const nurIdx = process.argv.indexOf('--nur');
const nur = nurIdx > 0 ? process.argv[nurIdx + 1].split(',') : null;
const KEY = process.env.ELEVENLABS_API_KEY || '';
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/stimmen/stimmen.json'), 'utf8'));
const appDir = path.join(ROOT, app);
const outDir = path.join(appDir, 'stimme');

// Feste Sätze direkt im Code (TTS.speak('…'), callSay('…'), camSay('…')).
const src = fs.readFileSync(path.join(appDir, 'index.html'), 'utf8');
const literale = [...src.matchAll(/(?:TTS\.speak|callSay|camSay)\(\s*'([^'\\\n]{6,})'/g)].map(m => m[1]);

// App kurz im Browser öffnen und die Satzliste holen.
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage();
await page.addInitScript(l => { window.MS_LITERALE = l; }, literale);
await page.goto(`http://localhost:${port}/${app}/index.html`);
await page.waitForFunction(() => typeof window.MS_TEXTE === 'function');
let saetze = await page.evaluate(() => window.MS_TEXTE());
await browser.close(); server.close();

if (nur) saetze = saetze.filter(s => nur.includes(s.who));
const fehlt = [...new Set(saetze.map(s => s.who))].filter(w => !cfg.figuren[w]);
if (fehlt.length) { console.error('Keine Stimme eingetragen für: ' + fehlt.join(', ')); process.exit(1); }

const proFigur = {};
saetze.forEach(s => { (proFigur[s.who] ||= { n: 0, z: 0 }); proFigur[s.who].n++; proFigur[s.who].z += s.text.length; });
const total = saetze.reduce((a, s) => a + s.text.length, 0);
console.log(`${saetze.length} Sätze, ${total} Zeichen`);
Object.entries(proFigur).forEach(([w, x]) => console.log(`  ${w}: ${x.n} Sätze, ${x.z} Zeichen`));
fs.writeFileSync(path.join(ROOT, 'tools/stimmen', app + '-saetze.json'), JSON.stringify(saetze, null, 1));
if (!KEY) { console.log('Kein Schlüssel: nur gezählt, nichts aufgenommen.'); process.exit(0); }

// Stimmen-Namen → IDs aus Diegos Konto.
const api = (p, o = {}) => fetch('https://api.elevenlabs.io' + p, { ...o, headers: { 'xi-api-key': KEY, 'content-type': 'application/json', ...(o.headers || {}) } });
const vr = await api('/v1/voices'); if (!vr.ok) { console.error('ElevenLabs: Stimmen nicht lesbar', vr.status); process.exit(1); }
const voices = (await vr.json()).voices || [];
const idOf = name => (voices.find(v => v.name.toLowerCase() === name.toLowerCase()) || voices.find(v => v.name.toLowerCase().startsWith(name.toLowerCase())) || {}).voice_id;

fs.mkdirSync(outDir, { recursive: true });
const index = new Set(fs.existsSync(path.join(outDir, 'index.json')) ? JSON.parse(fs.readFileSync(path.join(outDir, 'index.json'), 'utf8')) : []);
const zaehler = {}; let neu = 0, fehler = 0;
for (const s of saetze) {
  if (probe && (zaehler[s.who] = (zaehler[s.who] || 0) + 1) > 3) continue;
  const f = cfg.figuren[s.who], id = f.id || idOf(f.stimme);
  if (!id) { console.error(`Stimme «${f.stimme}» (${s.who}) nicht im Konto, übersprungen.`); fehler++; continue; }
  const file = path.join(outDir, s.key + '.mp3');
  if (fs.existsSync(file)) { index.add(s.key); continue; }
  const r = await api(`/v1/text-to-speech/${id}?output_format=${cfg.format}`, { method: 'POST', body: JSON.stringify({
    text: s.text, model_id: cfg.modell, language_code: 'de',
    voice_settings: { stability: f.stabil, similarity_boost: 0.75, style: f.stil, use_speaker_boost: true, speed: f.tempo } }) });
  if (!r.ok) { console.error(`Fehler ${r.status} bei ${s.key}: ${(await r.text()).slice(0, 200)}`); fehler++; if (r.status === 401 || r.status === 402 || r.status === 429) break; continue; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  index.add(s.key); neu++;
}
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify([...index].sort()));
console.log(`Neu aufgenommen: ${neu}, Fehler: ${fehler}, total im Index: ${index.size}`);
