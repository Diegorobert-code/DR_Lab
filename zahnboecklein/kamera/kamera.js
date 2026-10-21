/* Kamera-Hilfe für die Glitzer-Putzparty.
   Alles läuft nur auf diesem Gerät: kein Bild wird gespeichert, aufgenommen oder gesendet.
   Erkennt: Gesicht da/weg, Mund offen, Lächeln, Hand (mit Bürste) beim Mund, Bewegung, Nicken, Hand hoch, Winken.
   Die Modelle (.task) tragen die Endung .wasm, damit jeder Webserver sie ausliefert.
   Nicht zuverlässig erkennbar: welche Zahnzone geputzt wird. Darum sagt die App die Zone an. */
import { FilesetResolver, FaceLandmarker, HandLandmarker } from "./vision_bundle.mjs";

const BASE = new URL(".", import.meta.url).href;
let face = null, hand = null, stream = null, video = null, timer = null, onState = null;
let lastHand = null, speed = 0, frame = 0, handsCache = [];
let noseHist = [], waveHist = [];

async function loadModels() {
  if (face) return;
  const files = await FilesetResolver.forVisionTasks(BASE + "wasm");
  face = await FaceLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: BASE + "face_landmarker.task.wasm", delegate: "GPU" },
    runningMode: "VIDEO", numFaces: 1, outputFaceBlendshapes: true
  });
  hand = await HandLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: BASE + "hand_landmarker.task.wasm", delegate: "GPU" },
    runningMode: "VIDEO", numHands: 2
  });
}

function analyse() {
  if (!video || video.readyState < 2) return;
  const t = performance.now();
  const f = face.detectForVideo(video, t);
  // Hände nur jedes zweite Bild, das spart Akku
  if (frame++ % 2 === 0) handsCache = hand.detectForVideo(video, t + 1).landmarks || [];
  const st = { face: false, mouthOpen: 0, smile: 0, handNear: false, speed: 0,
    mx: 0.5, my: 0.6, fw: 0.3, nod: false, handUp: false, wave: false };
  if (f.faceLandmarks && f.faceLandmarks.length) {
    st.face = true;
    const lm = f.faceLandmarks[0];
    const bs = (f.faceBlendshapes && f.faceBlendshapes[0] && f.faceBlendshapes[0].categories) || [];
    const get = n => (bs.find(c => c.categoryName === n) || { score: 0 }).score;
    st.mouthOpen = get("jawOpen");
    st.smile = (get("mouthSmileLeft") + get("mouthSmileRight")) / 2;
    // Mundmitte und Gesichtsbreite
    const mx = (lm[13].x + lm[14].x) / 2, my = (lm[13].y + lm[14].y) / 2;
    const fw = Math.abs(lm[454].x - lm[234].x) || 0.2;
    let best = null;
    for (const h of handsCache) {
      // Fingerspitzen und Fingerknöchel: die Hand hält die Bürste
      for (const i of [4, 8, 12, 5, 9]) {
        const d = Math.hypot(h[i].x - mx, h[i].y - my) / fw;
        if (best === null || d < best.d) best = { d, x: h[9].x / fw, y: h[9].y / fw };
      }
    }
    st.mx = mx; st.my = my; st.fw = fw;
    // Nicken: Nase geht deutlich runter und wieder rauf (gemessen in Gesichtsbreiten)
    noseHist.push({ t, y: lm[1].y / fw });
    while (noseHist.length && t - noseHist[0].t > 1400) noseHist.shift();
    if (noseHist.length > 6) {
      const ys = noseHist.map(n => n.y), lo = Math.min(...ys), hi = Math.max(...ys), first = ys[0], lastY = ys[ys.length - 1];
      if (hi - lo > 0.09 && hi - first > 0.05 && hi - lastY > 0.05) { st.nod = true; noseHist = []; }
    }
    // Hand hoch: Handgelenk über den Augen; Winken: Hand hoch und hin und her
    const eyeY = Math.min(lm[159].y, lm[386].y);
    let up = null;
    for (const h of handsCache) if (h[0].y < eyeY + 0.05 * fw || h[9].y < eyeY - 0.1 * fw) up = h;
    if (up) {
      st.handUp = true;
      waveHist.push({ t, x: up[9].x / fw });
      while (waveHist.length && t - waveHist[0].t > 1600) waveHist.shift();
      let turns = 0, dir = 0, amp = 0;
      for (let i = 1; i < waveHist.length; i++) {
        const dx = waveHist[i].x - waveHist[i - 1].x;
        if (Math.abs(dx) < 0.02) continue;
        const d = Math.sign(dx);
        if (dir && d !== dir) turns++;
        dir = d;
      }
      const xs = waveHist.map(w => w.x); amp = Math.max(...xs) - Math.min(...xs);
      if (turns >= 2 && amp > 0.25) { st.wave = true; waveHist = []; }
    } else waveHist = [];
    if (best && best.d < 0.9) {
      st.handNear = true;
      if (lastHand) speed = speed * 0.7 + 0.3 * Math.hypot(best.x - lastHand.x, best.y - lastHand.y);
      lastHand = best;
    } else { lastHand = null; speed *= 0.8 }
    st.speed = speed;
  }
  onState && onState(st);
}

export async function start(videoEl, cb) {
  onState = cb; video = videoEl;
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
  video.srcObject = stream; video.muted = true; video.playsInline = true;
  await video.play();
  await loadModels();
  clearInterval(timer);
  timer = setInterval(() => { try { analyse() } catch (e) {} }, 100);
}

export function stop() {
  clearInterval(timer); timer = null;
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null;
  if (video) video.srcObject = null;
  lastHand = null; speed = 0; noseHist = []; waveHist = [];
}
