// Prüft Whisper in Mondschein mit dem echten Modell: espeak-ng spricht einen deutschen Satz, Whisper muss ihn erkennen.
import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const wav = fs.readFileSync(process.argv[2]);
const pcm = []; for (let i = 44; i + 1 < wav.length; i += 2) pcm.push(wav.readInt16LE(i) / 32768);
const srv = http.createServer((q, r) => { const f = path.join(ROOT, q.url.split('?')[0]); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(8127);
const b = await chromium.launch();
const p = await b.newPage();
p.on('console', m => console.log('[page]', m.text()));
await p.goto('http://localhost:8127/mondschein/index.html');
const t0 = Date.now();
const res = await p.evaluate(async a => { await window.MS_WH.load(); const s = performance.now(); const t = await window.MS_WH.text(new Float32Array(a)); return { t, ms: Math.round(performance.now() - s) }; }, pcm);
console.log(`Laden+Erkennen ${Date.now() - t0} ms, Erkennen ${res.ms} ms: «${res.t}»`);
await b.close(); srv.close();
if (!/hund/i.test(res.t)) { console.error('Whisper hat «Hund» nicht erkannt'); process.exit(1); }
