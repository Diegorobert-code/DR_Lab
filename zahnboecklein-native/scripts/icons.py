#!/usr/bin/env python3
"""Erzeugt App-Icons und Startbilder für Android und iOS aus ../zahnboecklein/icons/icon-1024.png.
Einmalig ausführen, wenn sich das Icon ändert: python3 scripts/icons.py  (braucht Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw

HIER = Path(__file__).resolve().parent.parent
QUELLE = HIER.parent / "zahnboecklein" / "icons" / "icon-1024.png"
RES = HIER / "android" / "app" / "src" / "main" / "res"
IOS = HIER / "ios" / "App" / "App" / "Assets.xcassets"
NACHT = (27, 31, 75)        # #1b1f4b, Hintergrund der App
ICON_RAND = (13, 28, 51)     # #0d1c33, Randfarbe des Icons

icon = Image.open(QUELLE).convert("RGB")

def rund(im, radius_anteil):
    m = Image.new("L", im.size, 0)
    r = int(im.size[0] * radius_anteil)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], r, fill=255)
    out = im.convert("RGBA"); out.putalpha(m); return out

# Android: klassische Icons, runde Icons, adaptive Vordergründe
DICHTE = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
for d, f in DICHTE.items():
    ordner = RES / f"mipmap-{d}"
    s = int(48 * f)
    rund(icon.resize((s, s), Image.LANCZOS), 0.18).save(ordner / "ic_launcher.png")
    kreis = Image.new("L", (s, s), 0); ImageDraw.Draw(kreis).ellipse([0, 0, s - 1, s - 1], fill=255)
    r = icon.resize((s, s), Image.LANCZOS).convert("RGBA"); r.putalpha(kreis); r.save(ordner / "ic_launcher_round.png")
    g = int(108 * f); inner = int(78 * f)
    fg = Image.new("RGBA", (g, g), ICON_RAND + (255,))
    fg.paste(icon.resize((inner, inner), Image.LANCZOS), ((g - inner) // 2, (g - inner) // 2))
    fg.save(ordner / "ic_launcher_foreground.png")
(RES / "values" / "ic_launcher_background.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0D1C33</color>\n</resources>\n')

def startbild(w, h):
    bild = Image.new("RGB", (w, h), NACHT)
    s = int(min(w, h) * 0.32)
    ic = rund(icon.resize((s, s), Image.LANCZOS), 0.22)
    bild.paste(ic, ((w - s) // 2, (h - s) // 2), ic)
    return bild

for p in RES.glob("drawable*/splash.png"):
    w, h = Image.open(p).size
    startbild(w, h).save(p)

# iOS: App-Icon 1024 (ohne Transparenz) und Startbild
icon.save(IOS / "AppIcon.appiconset" / "AppIcon-512@2x.png")
for n in ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]:
    startbild(2732, 2732).save(IOS / "Splash.imageset" / n)
print("Icons und Startbilder erzeugt.")
