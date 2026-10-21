/* Zahnböcklein: 3D-Mund mit tanzender Zahnbürste.
   Die Kamera fährt mit: aussen, oben drauf, innen. Läuft nur auf dem Gerät (WebGL). */
import * as THREE from "./three.module.min.js";

const RX = 2.6, RZ = 3.0, SPAN = 1.35, GAP = 0.55, N = 7;
const W_ = [0.42, 0.40, 0.42, 0.48, 0.50, 0.62, 0.62];
const H_ = [0.62, 0.58, 0.66, 0.56, 0.52, 0.48, 0.46];
const D_ = [0.24, 0.26, 0.34, 0.42, 0.46, 0.58, 0.60];
const thK = k => (k + 0.5) / N * SPAN;           // Winkel von Zahn k (0 = vorne)
function dims(th) {                                // Masse an beliebiger Stelle des Bogens
  const f = Math.min(N - 1, Math.max(0, Math.abs(th) / SPAN * N - 0.5)), a = Math.floor(f), b = Math.min(N - 1, a + 1), u = f - a;
  return { w: W_[a] + (W_[b] - W_[a]) * u, h: H_[a] + (H_[b] - H_[a]) * u, d: D_[a] + (D_[b] - D_[a]) * u };
}
const arch = th => new THREE.Vector3(RX * Math.sin(th), 0, RZ * Math.cos(th) - RZ);
const outN = th => new THREE.Vector3(RZ * Math.sin(th), 0, RX * Math.cos(th)).normalize();
const toFront = th => { const t = new THREE.Vector3(-RX * Math.cos(th) * Math.sign(th || 1), 0, RZ * Math.abs(Math.sin(th))); return t.add(new THREE.Vector3(0, 0, 0.8)).normalize(); };

function roundedBox(r) {
  const g = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8), p = g.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3(), m = 0.5 - r;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); c.set(Math.max(-m, Math.min(m, v.x)), Math.max(-m, Math.min(m, v.y)), Math.max(-m, Math.min(m, v.z)));
    v.sub(c); if (v.lengthSq() > 0) v.normalize().multiplyScalar(r); v.add(c); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}

function monsterTex(col) {
  const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
  x.fillStyle = col; x.beginPath(); x.arc(64, 64, 40, 0, 7); x.fill();
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; x.beginPath(); x.arc(64 + Math.cos(a) * 40, 64 + Math.sin(a) * 40, 11, 0, 7); x.fill(); }
  x.fillStyle = "#fff"; x.beginPath(); x.arc(51, 56, 12, 0, 7); x.arc(77, 56, 12, 0, 7); x.fill();
  x.fillStyle = "#1b1f4b"; x.beginPath(); x.arc(53, 58, 6, 0, 7); x.arc(79, 58, 6, 0, 7); x.fill();
  x.strokeStyle = "#1b1f4b"; x.lineWidth = 4; x.beginPath(); x.arc(64, 72, 12, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function sparkTex() {
  const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,245,200,1)"); g.addColorStop(0.35, "rgba(242,193,78,.8)"); g.addColorStop(1, "rgba(242,193,78,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const SUBTXT = { aussen: "Aussen", kau: "Kauflächen", innen: "Innen", zf: "Am Zahnfleisch", zunge: "Zunge" };

export function create(canvas, hintEl) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.toneMapping = THREE.ACESFilmicToneMapping; R.outputColorSpace = THREE.SRGBColorSpace;
  const S = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, 1.5, 0.1, 60);
  S.add(new THREE.HemisphereLight(0xfff4e6, 0xc0708c, 1.5)); S.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 7); S.add(key);
  const rim = new THREE.DirectionalLight(0x9fd8ff, 0.8); rim.position.set(-5, 2, -4); S.add(rim);
  const inner = new THREE.PointLight(0xffe2c4, 6, 9); inner.position.set(0, 0, -0.6); S.add(inner);

  // Mundhöhle, Gaumen, Zunge
  const cav = new THREE.Mesh(new THREE.SphereGeometry(14, 32, 24), new THREE.MeshBasicMaterial({ color: 0x3a0c22, side: THREE.BackSide }));
  cav.position.set(0, 0, -1); S.add(cav);
  const gumMat = new THREE.MeshPhysicalMaterial({ color: 0xf07c9c, roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.4 });
  const up = new THREE.Group(), lo = new THREE.Group(); S.add(up, lo);
  const palate = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), gumMat); palate.scale.set(2.3, 0.7, 2.6); palate.position.set(0, GAP + 0.55, -1.3); up.add(palate);
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), new THREE.MeshPhysicalMaterial({ color: 0xff7aa2, roughness: 0.5, sheen: 1, sheenColor: new THREE.Color(0xffc0d6), clearcoat: 0.3 }));
  tongue.scale.set(1.5, 0.45, 1.8); tongue.position.set(0, -GAP - 0.3, -1.6); lo.add(tongue);
  const floor = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), gumMat); floor.scale.set(2.3, 0.6, 2.6); floor.position.set(0, -GAP - 0.5, -1.3); lo.add(floor);

  // Zahnfleisch-Bogen
  const pts = []; for (let i = 0; i <= 40; i++) pts.push(arch(-1.45 + 2.9 * i / 40));
  const curve = new THREE.CatmullRomCurve3(pts);
  [[up, 1], [lo, -1]].forEach(([g, s]) => { const tb = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.36, 16), gumMat); tb.scale.set(1, 0.9, 1); tb.position.y = s * (GAP + 0.62); g.add(tb); });

  // Zähne: vier Quadranten (0 oben links, 1 oben rechts, 2 unten links, 3 unten rechts; links = Bildschirm links)
  const geo = roundedBox(0.2), qMat = [0, 1, 2, 3].map(() => new THREE.MeshPhysicalMaterial({ color: 0xfffdf4, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, emissive: 0xf2c14e, emissiveIntensity: 0 }));
  for (const q of [0, 1, 2, 3]) {
    const upper = q < 2, side = q % 2 === 0 ? -1 : 1, g = upper ? up : lo;
    for (let k = 0; k < N; k++) {
      const th = side * thK(k), p = arch(th), m = new THREE.Mesh(geo, qMat[q]);
      m.scale.set(W_[k], H_[k], D_[k] * (k > 2 ? 1 : 1));
      m.position.set(p.x, (upper ? 1 : -1) * (GAP + H_[k] / 2), p.z);
      m.rotation.y = th; g.add(m);
    }
  }

  // Lippen
  const lips = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.36, 24, 80), new THREE.MeshPhysicalMaterial({ color: 0xf29bb8, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 }));
  lips.scale.set(1.22, 0.84, 0.55); lips.position.set(0, 0, 0.55); S.add(lips);

  // Zahnbürste: Borsten zeigen nach -Y, Stiel nach +X
  const brush = new THREE.Group(), bi = new THREE.Group(); brush.add(bi); S.add(brush);
  const blue = new THREE.MeshPhysicalMaterial({ color: 0x4f8cff, roughness: 0.25, clearcoat: 1 });
  const head = new THREE.Mesh(roundedBox(0.3), blue); head.scale.set(0.8, 0.18, 0.34); head.position.set(0.22, 0.2, 0); bi.add(head);
  const tuftG = new THREE.CylinderGeometry(0.045, 0.05, 0.24, 8), white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), mint = new THREE.MeshStandardMaterial({ color: 0x8fe3c8, roughness: 0.6 });
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const t = new THREE.Mesh(tuftG, (i + j) % 2 ? mint : white); t.position.set(-0.08 + i * 0.12, 0.0, -0.1 + j * 0.1); bi.add(t); }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.0, 12), blue); neck.rotation.z = Math.PI / 2 - 0.12; neck.position.set(1.05, 0.26, 0); bi.add(neck);
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 2.0, 8, 16), blue); handle.rotation.z = Math.PI / 2 - 0.12; handle.position.set(2.6, 0.45, 0); bi.add(handle);
  const grip = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.06, 10, 24), new THREE.MeshPhysicalMaterial({ color: 0xf2c14e, roughness: 0.3, clearcoat: 1 })); grip.rotation.y = Math.PI / 2; grip.rotation.x = 0.12; grip.position.set(2.0, 0.38, 0); bi.add(grip);
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), new THREE.MeshPhysicalMaterial({ color: 0xf2c14e, emissive: 0xf2c14e, emissiveIntensity: 0.4, clearcoat: 1 })); star.position.set(3.75, 0.62, 0); bi.add(star);

  // Zuckermonster als Sprites, Glitzer beim Verschwinden
  const COLS = ["#ff8fb3", "#8fe3c8", "#f2c55c", "#b49cff"], mtex = COLS.map(monsterTex), stex = sparkTex();
  const msprites = new Map(), sparks = [];
  function monsterPos(q, i) {
    const upper = q < 2, side = q % 2 === 0 ? -1 : 1, s = upper ? 1 : -1;
    if (i === 0) { const th = side * thK(4), d = dims(th); return arch(th).add(outN(th).multiplyScalar(d.d / 2 + 0.28)).setY(s * (GAP + d.h * 0.5)); }
    if (i === 1) { const th = side * thK(5); return arch(th).setY(s * (GAP - 0.18)); }
    const th = side * thK(3), d = dims(th); return arch(th).add(outN(th).multiplyScalar(-(d.d / 2 + 0.26))).setY(s * (GAP + d.h * 0.5));
  }
  function syncMonsters(list) {
    const cnt = {};
    for (const m of list) {
      const i = cnt[m.q] = (cnt[m.q] || 0) + 1; let sp = msprites.get(m);
      if (!sp) { sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mtex[COLS.indexOf(m.c) < 0 ? 0 : COLS.indexOf(m.c)], transparent: true, depthTest: true })); sp.position.copy(monsterPos(m.q, i - 1)); (m.q < 2 ? up : lo).add(sp); msprites.set(m, sp); sp.userData.base = sp.position.clone(); }
      if (m.gone) { if (sp.visible) { sp.visible = false; for (let k = 0; k < 14; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: stex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.position.copy(sp.getWorldPosition(new THREE.Vector3())); s.userData.v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.2, Math.random() - 0.5).multiplyScalar(2.2); s.userData.l = 1; s.scale.setScalar(0.25); S.add(s); sparks.push(s); } } continue; }
      sp.visible = true; const sc = 0.32 + 0.3 * m.life; sp.scale.setScalar(sc); sp.material.opacity = 0.35 + 0.65 * m.life;
    }
    for (const [m, sp] of msprites) if (!list.includes(m)) { sp.parent && sp.parent.remove(sp); msprites.delete(m); }
  }

  // Ziel je Phase: Zahnbürste, Kamera, sichtbare Bögen
  const camPos = new THREE.Vector3(0, 0.6, 9), camLook = new THREE.Vector3(0, 0, -0.5), tPos = camPos.clone(), tLook = camLook.clone();
  const bPos = new THREE.Vector3(1, 0, 3), bQ = new THREE.Quaternion(), tB = { p: new THREE.Vector3(1.4, -1.6, 3), n: new THREE.Vector3(0, 1, 0), h: new THREE.Vector3(1, 0, 0.3), on: false };
  function orient(n, h) {
    const Y = n.clone().normalize(), X = h.clone().sub(Y.clone().multiplyScalar(h.dot(Y)));
    if (X.lengthSq() < 0.04) X.set(0, 0, 1).sub(Y.clone().multiplyScalar(Y.z)); X.normalize();
    const Z = new THREE.Vector3().crossVectors(X, Y); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
  }
  function quadTarget(q, s, t) {
    const upper = q < 2, side = q % 2 === 0 ? -1 : 1, sy = upper ? 1 : -1, part = s < 1 / 3 ? "aussen" : s < 2 / 3 ? "kau" : "innen", u = (s * 3) % 1;
    const th = side * (thK(6) + (thK(1) - thK(6)) * u), d = dims(th), p = arch(th), o = outN(th);
    let pt, n, h, cp, look, vis = { up: true, lo: true, lips: false };
    if (part === "aussen") {
      pt = p.clone().add(o.clone().multiplyScalar(d.d / 2)).setY(sy * (GAP + d.h * 0.5)); n = o.clone(); h = toFront(th);
      cp = pt.clone().add(o.clone().multiplyScalar(4.6)).add(new THREE.Vector3(0, sy * 0.5, 2.2)); look = pt.clone(); vis.lips = Math.abs(th) < 0.5;
    } else if (part === "kau") {
      pt = p.clone().setY(sy * GAP); n = new THREE.Vector3(0, -sy, 0); h = new THREE.Vector3(-p.x * 0.25, 0, 1);
      cp = pt.clone().add(new THREE.Vector3(-side * 0.5, -sy * 3.8, 1.1)); look = pt.clone(); if (upper) vis.lo = false; else vis.up = false;
    } else {
      pt = p.clone().add(o.clone().multiplyScalar(-d.d / 2)).setY(sy * (GAP + d.h * 0.5)); n = o.clone().negate(); h = new THREE.Vector3(0, -sy * 0.4, 1);
      cp = upper ? pt.clone().add(o.clone().multiplyScalar(-3.0)).add(new THREE.Vector3(0, -0.5, 0.9)) : pt.clone().add(o.clone().multiplyScalar(-2.0)).add(new THREE.Vector3(0, 2.6, 0.5)); look = pt.clone(); if (upper) vis.lo = false; else vis.up = false;
    }
    return { pt, n, h, cp, look, vis, part };
  }
  function target(key, s, t) {
    if (key === "q0" || key === "q1" || key === "q2" || key === "q3") return quadTarget(+key[1], s, t);
    const front = { cp: new THREE.Vector3(0, 0.4, 6.4), look: new THREE.Vector3(0, 0, -0.7), vis: { up: true, lo: true, lips: true } };
    if (key === "kau") { // erst unten, dann oben, von links nach rechts über die Backenzähne
      const upper = s >= 0.5, u = (s * 2) % 1, sy = upper ? 1 : -1, th = (u < 0.5 ? -1 : 1) * (thK(6) - (thK(6) - thK(3)) * ((u * 2) % 1)), p = arch(th);
      return { pt: p.clone().setY(sy * GAP), n: new THREE.Vector3(0, -sy, 0), h: new THREE.Vector3(-p.x * 0.25, 0, 1), cp: new THREE.Vector3(p.x * 0.4, -sy * 4.2, p.z + 2.6), look: p.clone().setY(sy * GAP), vis: { up: upper, lo: !upper, lips: false }, part: "kau" };
    }
    if (key === "zf") { const th = -thK(4) + 2 * thK(4) * s, sy = Math.sin(s * Math.PI * 4) > 0 ? 1 : -1, p = arch(th), o = outN(th), d = dims(th);
      return { pt: p.clone().add(o.clone().multiplyScalar(d.d / 2 + 0.05)).setY(sy * (GAP + d.h - 0.02)), n: o, h: new THREE.Vector3(1, 0, 0.6), ...front, part: "zf" }; }
    if (key === "zunge") { const p = new THREE.Vector3(Math.sin(t * 2.2) * 0.5, -GAP + 0.32, -0.9 - 0.6 * ((Math.sin(t * 1.4) + 1) / 2));
      return { pt: p, n: new THREE.Vector3(0, 1, 0.15), h: new THREE.Vector3(0.4, 0.2, 1), cp: new THREE.Vector3(0, 2.6, 6.6), look: new THREE.Vector3(0, -0.8, -1.2), vis: { up: true, lo: true, lips: true }, part: "zunge" }; }
    return { pt: new THREE.Vector3(1.6, -2.4, 2.6), n: new THREE.Vector3(0, 1, 0), h: new THREE.Vector3(1, 0, 0.4), ...front, off: true, part: key };
  }

  let last = performance.now(), lastPart = "", T = 0;
  function frame(info, monsters) {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
    const w = canvas.clientWidth | 0, h = canvas.clientHeight | 0;
    if (w && h && (canvas.width !== Math.round(w * R.getPixelRatio()) || canvas.height !== Math.round(h * R.getPixelRatio()))) { R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    const tg = info ? target(info.key, info.s, T) : (() => { const a = T * 0.25; return { pt: new THREE.Vector3(1.8, -2.6, 2.8), n: new THREE.Vector3(0, 1, 0), h: new THREE.Vector3(1, 0, 0.3), cp: new THREE.Vector3(Math.sin(a) * 1.8, 0.6 + Math.sin(a * 0.7) * 0.4, 6.8), look: new THREE.Vector3(0, 0, -0.8), vis: { up: true, lo: true, lips: true }, off: true, part: "" }; })();
    tPos.copy(tg.cp); tLook.copy(tg.look); const k = 1 - Math.exp(-dt * 2.6); camPos.lerp(tPos, k); camLook.lerp(tLook, k);
    cam.position.copy(camPos); cam.lookAt(camLook);
    up.visible = tg.vis.up; lo.visible = tg.vis.lo; lips.visible = tg.vis.lips;
    // Zahnbürste: kleine Kreise auf der Zahnfläche, sonst sanft schweben
    const q = orient(tg.n, tg.h), X = new THREE.Vector3(1, 0, 0).applyQuaternion(q), Z = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const circ = tg.off ? new THREE.Vector3(0, Math.sin(T * 2) * 0.12, 0) : X.multiplyScalar(Math.cos(T * 11) * 0.09).add(Z.multiplyScalar(Math.sin(T * 11) * 0.07));
    const want = tg.pt.clone().add(tg.n.clone().normalize().multiplyScalar(tg.off ? 0 : 0.13)).add(circ);
    const kb = 1 - Math.exp(-dt * 5); bPos.lerp(want, kb); bQ.slerp(tg.off ? orient(new THREE.Vector3(Math.sin(T) * 0.3, 1, 0.4), new THREE.Vector3(1, 0.3, 0.2)) : q, kb);
    brush.position.copy(bPos); brush.quaternion.copy(bQ); bi.rotation.x = tg.off ? Math.sin(T * 3) * 0.25 : 0;
    // aktive Zone leuchtet sanft
    qMat.forEach((m, i) => { const on = info && (info.key === "q" + i || info.key === "all" || (info.key === "kau" && (tg.vis.up ? i < 2 : i >= 2))); m.emissiveIntensity = on ? 0.10 + 0.07 * Math.sin(T * 4) : 0; });
    tongue.position.y = -GAP - 0.3 + (info && info.key === "zunge" ? 0.12 : 0); tongue.scale.z = 1.8 + (info && info.key === "zunge" ? 0.3 : 0);
    if (monsters) { syncMonsters(monsters); for (const [, sp] of msprites) if (sp.visible) sp.position.y = sp.userData.base.y + Math.sin(T * 3 + sp.userData.base.x) * 0.05; }
    for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.userData.l -= dt * 1.3; s.position.addScaledVector(s.userData.v, dt); s.material.opacity = Math.max(0, s.userData.l); if (s.userData.l <= 0) { S.remove(s); sparks.splice(i, 1); } }
    if (hintEl) { const txt = SUBTXT[tg.part] || ""; if (txt !== lastPart) { lastPart = txt; hintEl.textContent = txt; hintEl.hidden = !txt; } }
    R.render(S, cam);
  }
  return { frame, part: () => lastPart };
}
