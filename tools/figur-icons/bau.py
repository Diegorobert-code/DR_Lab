# Baut Home-Bildschirm-Icons und Link-Vorschau aus dem Bild der Figur.
# python3 tools/figur-icons/bau.py            (alle Apps aus apps.json)
# Quelle pro App: tools/figur-icons/quellen/<app>.png (quadratisch). Kommt Tinkos Bild, einfach diese Datei ersetzen.
import json, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

hier = os.path.dirname(os.path.abspath(__file__))
repo = os.path.dirname(os.path.dirname(hier))
apps = json.load(open(os.path.join(hier, 'apps.json'), encoding='utf-8'))
SERIF = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
NACHT, GOLD = (16, 24, 52), (232, 190, 92)

def quadrat(im):
    w, h = im.size; s = min(w, h)
    return im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))

def scharf(im, n):
    return im.resize((n, n), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))

def schrift(pfad, n):
    try: return ImageFont.truetype(pfad, n)
    except OSError: return ImageFont.load_default()

def vorschau(fig, name, zeile, ziel, breit=False):
    og = Image.new('RGB', (1200, 630), NACHT)
    d = ImageDraw.Draw(og)
    for y in range(630):  # sanfter Verlauf nach unten
        t = y / 630; d.line([(0, y), (1200, y)], fill=tuple(int(NACHT[i] * (1 - t) + (36, 30, 70)[i] * t) for i in range(3)))
    if breit:
        b = fig.resize((1200, round(fig.height * 1200 / fig.width)), Image.LANCZOS)
        oben = max(0, (b.height - 630) // 2); og.paste(b.crop((0, oben, 1200, oben + 630)), (0, 0))
        band = Image.new('RGBA', (1200, 140), (16, 24, 52, 215)); og.paste(band, (0, 0), band)
        d = ImageDraw.Draw(og)
        d.text((600, 50), name, font=schrift(SERIF, 54), fill=GOLD, anchor='mm')
        d.text((600, 104), zeile, font=schrift(SANS, 26), fill=(240, 236, 228), anchor='mm')
    else:
        f = scharf(fig, 470)
        m = Image.new('L', (470, 470), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 469, 469), 60, fill=255)
        d.rounded_rectangle((74, 74, 556, 556), 66, outline=GOLD, width=6)
        og.paste(f, (80, 80), m)
        d.text((620, 270), name, font=schrift(SERIF, 64), fill=GOLD, anchor='lm')
        d.text((622, 350), zeile, font=schrift(SANS, 30), fill=(240, 236, 228), anchor='lm')
        d.text((622, 520), 'DR Lab', font=schrift(SANS, 24), fill=(170, 170, 200), anchor='lm')
    og.save(ziel, optimize=True)

for key, a in apps.items():
    q = os.path.join(hier, 'quellen', a.get('quelle', key + '.png'))
    if not os.path.exists(q): print('fehlt:', q); continue
    roh = Image.open(q).convert('RGB')
    ordner = os.path.join(repo, a['ordner'])
    if a.get('icons', True):
        fig = quadrat(roh)
        for n in (180, 192, 512): scharf(fig, n).save(os.path.join(ordner, f'icon-{n}.png'), optimize=True)
        vorschau(fig, a['name'], a['zeile'], os.path.join(ordner, 'og.png'))
    else:
        vorschau(roh, a['name'], a['zeile'], os.path.join(ordner, 'og.png'), breit=True)
    print(key, 'ok')
