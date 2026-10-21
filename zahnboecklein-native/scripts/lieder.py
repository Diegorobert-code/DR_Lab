# Zahnböcklein-Lieder: selbst erzeugte, lizenzfreie Putzmusik (Kinder-Pop, Walzer, Funk, Reggae, Disco).
# Jedes Lied ist genau 32 Takte lang und lässt sich nahtlos wiederholen.
# Aufruf: python3 scripts/lieder.py ../zahnboecklein/musik
import numpy as np, sys, os, subprocess, wave
from scipy.signal import oaconvolve, lfilter

SR = 44100
LIEDER = {
    'glitzerpop':  dict(bpm=118, g=60, takt=4, folge=[0, 7, 9, 5], moll=[2], swing=0.0, stil='pop', seed=3),
    'zahnfeewalzer': dict(bpm=150, g=65, takt=3, folge=[0, 5, 7, 0, 9, 5, 7, 7], moll=[4], swing=0.0, stil='walzer', seed=11),
    'monsterfunk': dict(bpm=104, g=57, takt=4, folge=[0, 0, 5, 7], moll=[], swing=0.18, stil='funk', seed=5),
    'sternenreggae': dict(bpm=84, g=62, takt=4, folge=[0, 5, 0, 7], moll=[], swing=0.12, stil='reggae', seed=8),
    'discodrache': dict(bpm=124, g=64, takt=4, folge=[9, 5, 0, 7], moll=[0], swing=0.0, stil='disco', seed=21),
}
DUR, MOL = [0, 2, 4, 5, 7, 9, 11], [0, 2, 3, 5, 7, 8, 10]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
rng = np.random.default_rng(1)

def env(n, a, d, s, r):
    t = np.arange(n) / SR; dur = n / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    return e * np.clip((dur - t) / max(r, 1e-4), 0, 1)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); return lfilter([1 - a], [1, -a], x)
def hp(x, fc): return x - lp(x, fc)
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; o = 0
    for k in range(1, 14):
        if f * k > 9000: break
        o = o + np.sin(2 * np.pi * f * (1 + det) * k * t) / k
    return o
def kick(n=int(0.35 * SR)):
    t = np.arange(n) / SR; f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 1.1
def snare(n=int(0.25 * SR)):
    t = np.arange(n) / SR; nz = hp(rng.standard_normal(n), 1200) * np.exp(-t * 18)
    return (nz * 0.55 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5)
def clap(n=int(0.22 * SR)):
    t = np.arange(n) / SR; nz = hp(rng.standard_normal(n), 900)
    e = sum(np.exp(-np.maximum(0, t - d) * 60) * (t >= d) for d in (0, 0.012, 0.024)) + np.exp(-t * 14) * 0.6
    return nz * e * 0.35
def hat(open_=False):
    n = int((0.25 if open_ else 0.05) * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t * (12 if open_ else 70)) * 0.22
def bell(f, n):
    t = np.arange(n) / SR; mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 6)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 3.2) + 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 5)
def marimba(f, n):
    t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 20)) * np.exp(-t * 7)
def pluck(f, n):
    return lp(saw(f, n), 900 + 1400) * env(n, 0.004, 0.18, 0.25, 0.05)
def pad(fs, n):
    o = sum(saw(f, n, d) for f in fs for d in (-0.004, 0.004)) / (len(fs) * 2)
    return lp(o, 1800) * env(n, 0.08, 0.6, 0.7, 0.15)

def render(name, cfg):
    r = np.random.default_rng(cfg['seed'])
    beat = 60 / cfg['bpm']; bar = beat * cfg['takt']; bars = 32; total = bar * bars; N = int(total * SR) + SR * 3
    L = np.zeros(N); Rr = np.zeros(N)
    def add(sig, t, pan=0.5, g=1.0):
        i = int(round(t * SR)); e = min(N, i + len(sig))
        if i < 0 or i >= N: return
        L[i:e] += sig[:e - i] * g * np.sqrt(1 - pan); Rr[i:e] += sig[:e - i] * g * np.sqrt(pan)
    sw = lambda pos16: (pos16 * beat / 4) + (cfg['swing'] * beat / 4 if pos16 % 2 == 1 else 0)
    g0 = cfg['g']; folge = cfg['folge']
    def chord(bi):
        deg = folge[bi % len(folge)]; scale = MOL if (bi % len(folge)) in cfg['moll'] and False else DUR
        root = g0 + deg; minor = deg in (2, 4, 9)
        return root, [root, root + (3 if minor else 4), root + 7]
    # Motiv: 2 Takte, wird über Akkorde verschoben; B-Teil eigenes Motiv
    steps = 4 * cfg['takt'] * 2
    def motif():
        rh = [i for i in range(steps) if r.random() < (0.42 if cfg['stil'] != 'walzer' else 0.3) or i % (4 * cfg['takt']) == 0]
        notes, cur = [], 2
        for _ in rh: cur = int(np.clip(cur + r.choice([-2, -1, -1, 0, 1, 1, 2]), -1, 6)); notes.append(cur)
        return list(zip(rh, notes))
    mA, mB = motif(), motif()
    lead = {'pop': bell, 'walzer': bell, 'funk': marimba, 'reggae': marimba, 'disco': bell}[cfg['stil']]
    for b in range(bars):
        t0 = b * bar; root, tri = chord(b); sec = (b // 8) % 4  # A A B A
        # Drums
        st = cfg['stil']
        for q in range(cfg['takt']):
            tb = t0 + q * beat
            if st == 'walzer':
                if q == 0: add(kick(), tb, g=0.8)
                else: add(hat(), tb, 0.6, 0.8); add(clap() * 0.4, tb, 0.45)
                continue
            if st == 'reggae':
                if q == 2: add(kick(), tb); add(snare() * 0.7, tb, 0.5)
                add(hat(), tb + beat / 2, 0.65)
                continue
            if st in ('pop', 'disco') or q % 2 == 0 or (st == 'funk' and q == 3): add(kick(), tb + (beat * 0.75 if st == 'funk' and q == 3 else 0))
            if q % 2 == 1: add(snare(), tb, 0.5, 0.75); add(clap(), tb, 0.5, 0.6 if st != 'funk' else 0.3)
            for e in range(2 if st != 'funk' else 4):
                add(hat(open_=(st == 'disco' and e == 1)), tb + (sw(e) if st == 'funk' else e * beat / 2), 0.65, 0.8 if e else 0.5)
        # Bass
        bn = root - 24 if root - 24 >= 33 else root - 12
        if st == 'walzer': pats = [(0, 1.0)]
        elif st == 'reggae': pats = [(0.5, 0.4), (1.5, 0.4), (2.75, 0.25), (3.0, 0.5)]
        elif st == 'funk': pats = [(0, 0.3), (0.75, 0.2), (1.5, 0.25), (2.0, 0.3), (2.75, 0.2), (3.25, 0.25), (3.5, 0.3)]
        elif st == 'disco': pats = [(k * 0.5, 0.22) for k in range(8)]
        else: pats = [(0, 0.5), (1.0, 0.4), (1.5, 0.3), (2.0, 0.5), (3.0, 0.45), (3.5, 0.3)]
        for i, (p, d) in enumerate(pats):
            f = hz(bn + (12 if st == 'disco' and i % 2 else 0) + (7 if st == 'funk' and i == 4 else 0))
            add(pluck(f, int(d * beat * SR)) * 0.55, t0 + p * beat, 0.5)
        # Akkorde
        if st == 'reggae':
            for q in (1, 3): add(lp(sum(saw(hz(m), int(0.18 * SR)) for m in tri), 2500) * env(int(0.18 * SR), 0.002, 0.06, 0.2, 0.03) * 0.22, t0 + q * beat, 0.35)
        elif st == 'walzer':
            for q in (1, 2): add(sum(marimba(hz(m), int(0.6 * SR)) for m in tri) * 0.12, t0 + q * beat, 0.35)
            add(pad([hz(m - 12) for m in tri], int(bar * SR)) * 0.25, t0, 0.5)
        elif st == 'funk':
            for p in (0.5, 1.75, 2.5, 3.75): add(lp(sum(saw(hz(m + 12), int(0.12 * SR)) for m in tri), 3000) * env(int(0.12 * SR), 0.002, 0.04, 0.1, 0.02) * 0.18, t0 + p * beat, 0.3)
        else:
            add(pad([hz(m) for m in tri], int(bar * SR)) * 0.32, t0, 0.5)
        # Melodie (A A B A), ab Takt 3 dazu, in jedem 8er-Block
        if b % 8 >= 1:
            mot = mB if sec == 2 else mA; half = (b % 2)
            scale = DUR; base = root + 12
            for pos, deg in mot:
                if (pos // (4 * cfg['takt'])) != half: continue
                pp = pos % (4 * cfg['takt'])
                m = base + scale[deg % 7] + 12 * (deg // 7)
                if r.random() < 0.15 and sec != 2: continue
                add(lead(hz(m), int(0.7 * SR)) * 0.22, t0 + sw(pp), 0.55 + 0.1 * np.sin(b))
        # Glitzer alle 8 Takte
        if b % 8 == 7:
            for k in range(8): add(bell(hz(base + 24 + DUR[k % 7]), int(0.5 * SR)) * 0.06, t0 + bar - beat + k * beat / 8, 0.7)
    # Ende auf den Anfang falten, damit die Schleife nahtlos ist
    n = int(total * SR); L[:N - n] += L[n:]; Rr[:N - n] += Rr[n:]; L, Rr = L[:n], Rr[:n]
    # Hall
    ir_n = int(1.6 * SR); t = np.arange(ir_n) / SR; ir = rng.standard_normal(ir_n) * np.exp(-t * 3.2); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    wl = np.concatenate([L, L[:ir_n]]); wr = np.concatenate([Rr, Rr[:ir_n]])
    revL = oaconvolve(wl, ir)[:len(wl)]; revR = oaconvolve(wr, np.roll(ir, 97))[:len(wr)]
    revL = revL[ir_n:ir_n + n] + revL[:n] * 0; revR = revR[ir_n:ir_n + n]
    L = L + 0.18 * np.roll(revL, ir_n); Rr = Rr + 0.18 * np.roll(revR, ir_n)
    st = np.stack([L, Rr], 1); st = np.tanh(st / (np.abs(st).max() * 0.55)) * 0.89
    return st, total

if __name__ == '__main__':
    ziel = sys.argv[1]; os.makedirs(ziel, exist_ok=True)
    nur = sys.argv[2:] or list(LIEDER)
    for name in nur:
        st, total = render(name, LIEDER[name]); w = os.path.join(ziel, name + '.wav')
        with wave.open(w, 'wb') as f:
            f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((st * 32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', w, '-af', 'loudnorm=I=-15:TP=-1.5:LRA=9', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '112k', os.path.join(ziel, name + '.mp3')], check=True); os.remove(w)
        print(name, round(total, 1), 's')
