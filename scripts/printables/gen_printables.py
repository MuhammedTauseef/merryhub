#!/usr/bin/env python3
"""MerryHub Printable Pack generator.

Builds print-ready A4 HTML for every pack item, prints to PDF with the
box's headless Chromium, and writes masters to
~/workspace/your_files/merryhub-printables/ plus the free sample into
the site's public/printables/ folder.

Print spec (consistent across the pack):
- Cards: one A4 portrait sheet per card. Bottom half = card front,
  top half (printed upside down) = card back. Fold in half along the
  middle -> an A5 landscape greeting card with a blank inside.
- Everything else: A4 portrait sheets, 10mm safe margins, dashed cut
  guides where cutting is needed.
"""
import json, math, random, subprocess, os, sys

random.seed(42)
DATA = json.load(open("/tmp/print_data.json"))

GREEN900 = "#0b3d2e"; GREEN950 = "#06231a"; GREEN700 = "#14634a"
RED600 = "#b91c1c"; RED500 = "#c0272d"; GOLD = "#e3b341"; GOLDDEEP = "#b8860b"
CREAM = "#fff9f0"; PAPER = "#fffdf8"; INK = "#22302a"; MUTED = "#5b6b62"
FOOTER = "Made with MerryHub • merryhub.vercel.app"

BASE_CSS = """
@page { size: A4 portrait; margin: 0; }
* { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
html,body { font-family:'Segoe UI','Noto Sans',Arial,sans-serif; color:#22302a; }
.serif { font-family: Georgia,'Noto Serif','Times New Roman',serif; }
.page { width:210mm; height:297mm; position:relative; overflow:hidden; page-break-after:always; background:#fffdf8; }
.page:last-child { page-break-after:avoid; }
.sheetfoot { position:absolute; left:0; right:0; bottom:4mm; text-align:center; font-size:7.5pt; color:#93a197; letter-spacing:.5px; }
.sheethead { text-align:center; margin-bottom:5mm; }
.sheethead h1 { font-family:Georgia,'Noto Serif',serif; font-size:21pt; color:#0b3d2e; }
.sheethead p { font-size:9.5pt; color:#5b6b62; margin-top:1.5mm; }
.padded { padding:11mm 10mm 12mm; }
"""

def doc(title, body, extra_css=""):
    return ("<!doctype html><html><head><meta charset='utf-8'><title>" + title +
            "</title><style>" + BASE_CSS + extra_css + "</style></head><body>" +
            body + "</body></html>")

# ---------------------------------------------------------------- SVG helpers
def dots(seed, n, w, h, fill, op, rmin, rmax, yfrac=1.0):
    rng = random.Random(seed)
    out = []
    for _ in range(n):
        r = rmin + rng.random() * (rmax - rmin)
        out.append(f'<circle cx="{rng.random()*w:.0f}" cy="{rng.random()*h*yfrac:.0f}" r="{r:.1f}" fill="{fill}" opacity="{op}"/>')
    return "".join(out)

def pine(x, base, s, color):
    w = s * 0.36
    parts = []
    for t in range(3):
        hw = w * (1 - t * 0.24)
        top = base - s * (0.98 - t * 0.26)
        bot = base - s * (0.52 - t * 0.26)
        parts.append(f"M{x:.0f} {top:.0f} L{x-hw:.0f} {bot:.0f} L{x+hw:.0f} {bot:.0f} Z")
    trunk = f'<rect x="{x - s*0.045:.0f}" y="{base - s*0.06:.0f}" width="{s*0.09:.0f}" height="{s*0.08:.0f}" fill="{color}"/>'
    return f'<path d="{" ".join(parts)}" fill="{color}"/>' + trunk

def tree_row(seed, w, base, color, smin, smax):
    rng = random.Random(seed)
    out = []
    x = -16
    while x < w + 16:
        s = smin + rng.random() * (smax - smin)
        out.append(pine(x, base + rng.random() * 6, s, color))
        x += s * (0.55 + rng.random() * 0.5)
    return "".join(out)

def string_lights(w):
    rng = random.Random(7)
    colors = ["#f0c75e", "#e4572e", "#7fb069", "#fff3d6", "#e63946"]
    out = []
    for row in range(3):
        yb = 14 + row * 24
        sag = 18 + rng.random() * 12
        out.append(f'<path d="M-5 {yb} Q {w/2} {yb + sag*2} {w+5} {yb}" stroke="rgba(255,255,255,.35)" stroke-width="1.4" fill="none"/>')
        for i in range(17):
            t = i / 16
            x = -5 + (w + 10) * t
            y = (1-t)*(1-t)*yb + 2*(1-t)*t*(yb + sag*2) + t*t*yb
            c = colors[int(rng.random() * len(colors))]
            out.append(f'<circle cx="{x:.0f}" cy="{y+4:.0f}" r="3.6" fill="{c}"/>')
    return "".join(out)

def wreath(cx, cy, r):
    out = []
    for ring_r, off in ((r, 0.0), (r * 0.8, 0.09)):
        leaves = 40
        for i in range(leaves):
            a = (i / leaves) * 360 + off * 57
            x = cx + math.cos(math.radians(a)) * ring_r
            y = cy + math.sin(math.radians(a)) * ring_r
            col = "#14634a" if i % 3 else "#0b3d2e"
            out.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="4.6" ry="11" fill="{col}" transform="rotate({a+90:.0f} {x:.0f} {y:.0f})"/>')
    for i in range(13):
        a = (i / 13) * 2 * math.pi + 0.2
        x = cx + math.cos(a) * r * 0.92
        y = cy + math.sin(a) * r * 0.92
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="3.6" fill="#c0272d"/><circle cx="{x-1:.0f}" cy="{y-1:.0f}" r="1.1" fill="rgba(255,255,255,.55)"/>')
    bx, by = cx, cy + r * 1.04
    out.append(f'<path d="M{bx} {by} L{bx-17} {by-8} L{bx-17} {by+9} Z" fill="#e3b341"/>')
    out.append(f'<path d="M{bx} {by} L{bx+17} {by-8} L{bx+17} {by+9} Z" fill="#e3b341"/>')
    out.append(f'<circle cx="{bx}" cy="{by}" r="4.6" fill="#b8860b"/>')
    return "".join(out)

def star4(cx, cy, r, fill):
    r2 = r * 0.22
    pts = []
    for i in range(8):
        ang = math.radians(i * 45 - 90)
        rad = r if i % 2 == 0 else r2
        pts.append(f"{cx + math.cos(ang)*rad:.0f},{cy + math.sin(ang)*rad:.0f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'

# ------------------------------------------------------------------- the cards
# Scene viewBox: 0 0 396 273 (the front design box at 2 units per mm).

def scene_midnight():
    return (dots(11, 70, 396, 273, "#f0c75e", .8, .8, 2.2, .55)
            + '<circle cx="352" cy="38" r="18" fill="#f7e7bd"/><circle cx="347" cy="35" r="3.8" fill="rgba(4,21,14,.10)"/><circle cx="358" cy="44" r="2.6" fill="rgba(4,21,14,.10)"/>'
            + dots(12, 110, 396, 273, "#ffffff", .8, .8, 2.4)
            + tree_row(13, 396, 279, "#020d08", 80, 140))

def scene_crimson():
    return (dots(21, 40, 396, 273, "#f0c75e", .12, 5, 18)
            + dots(22, 80, 396, 273, "#ffffff", .7, .8, 2.2)
            + tree_row(23, 396, 277, "rgba(255,243,214,.92)", 50, 92))

def scene_golden():
    return (dots(31, 50, 396, 273, "#f0c75e", .8, .8, 2, .5)
            + string_lights(396)
            + dots(33, 95, 396, 273, "#ffffff", .75, .8, 2.2)
            + tree_row(34, 396, 279, "#050f1c", 64, 110))

def scene_snowy():
    hills = ('<ellipse cx="87" cy="290" rx="218" ry="82" fill="#ffffff"/>'
             '<ellipse cx="337" cy="295" rx="198" ry="88" fill="#ffffff"/>')
    rng = random.Random(41)
    trees = ""
    for i in range(11):
        x = rng.random() * 396
        y = 226 + rng.random() * 38
        trees += pine(x, y, 32 + rng.random() * 36, "#b91c1c" if i % 3 == 0 else "#14634a")
    return ('<circle cx="52" cy="41" r="20" fill="rgba(240,199,94,.85)"/>' + hills + trees
            + dots(42, 110, 396, 273, "#ffffff", .95, .8, 2.4))

def scene_wreath():
    return dots(51, 22, 396, 273, "#e3b341", .5, .8, 1.8, .6) + wreath(198, 74, 46)

def scene_candy():
    return (dots(61, 36, 396, 273, "#f0c75e", .16, 3, 8)
            + dots(62, 70, 396, 273, "#ffffff", .8, .8, 2.2))

def scene_fireplace():
    s = []
    s.append('<rect x="0" y="252" width="396" height="21" fill="#4a2410"/>')
    # garland along the top of the scene band
    for i in range(13):
        x = 108 + i * 15
        s.append(f'<circle cx="{x}" cy="98" r="6" fill="#14634a"/>')
        if i % 3 == 0:
            s.append(f'<circle cx="{x+3}" cy="101" r="2.6" fill="#c0272d"/>')
    # mantel + firebox
    s.append('<rect x="112" y="104" width="172" height="9" rx="2" fill="#6b3a1e"/>')
    s.append('<path d="M132 252 L132 138 Q132 118 152 118 L244 118 Q264 118 264 138 L264 252 Z" fill="#1f120a"/>')
    s.append('<path d="M144 252 L144 144 Q144 130 158 130 L238 130 Q252 130 252 144 L252 252 Z" fill="#31160a"/>')
    # logs + flames
    s.append('<rect x="168" y="232" width="60" height="10" rx="5" fill="#5a3016" transform="rotate(-7 198 237)"/>')
    s.append('<rect x="168" y="232" width="60" height="10" rx="5" fill="#6b3a1e" transform="rotate(6 198 237)"/>')
    s.append('<ellipse cx="198" cy="216" rx="17" ry="26" fill="#e4572e"/>')
    s.append('<ellipse cx="198" cy="224" rx="10" ry="17" fill="#f0a13c"/>')
    s.append('<ellipse cx="198" cy="231" rx="5" ry="9" fill="#f7e7bd"/>')
    # stockings
    for x, col in ((140, "#c0272d"), (186, "#14634a"), (232, "#e3b341")):
        s.append(f'<rect x="{x}" y="113" width="17" height="7" fill="#fff9f0"/>')
        s.append(f'<path d="M{x} 120 L{x} 146 Q{x} 152 {x+6} 154 L{x+15} 158 Q{x+21} 160 {x+21} 153 Q{x+21} 148 {x+17} 146 L{x+17} 120 Z" fill="{col}"/>')
    # candles on the mantel
    for x in (122, 262):
        s.append(f'<rect x="{x}" y="90" width="7" height="14" fill="#fff3d6"/><ellipse cx="{x+3.5}" cy="86" rx="2.6" ry="4.4" fill="#f0c75e"/>')
    return "".join(s)

def scene_gingerbread():
    s = [dots(71, 26, 396, 273, "#ffffff", .35, 2, 5)]
    cx, cy = 198, 158
    brown = "#7c4a1e"; icing = "#fff7ed"
    s.append(f'<rect x="{cx-52}" y="{cy+18}" width="104" height="13" rx="6.5" fill="{brown}" transform="rotate(24 {cx-52} {cy+24})"/>')
    s.append(f'<rect x="{cx-52}" y="{cy+18}" width="104" height="13" rx="6.5" fill="{brown}" transform="rotate(156 {cx+52} {cy+24})"/>')
    s.append(f'<rect x="{cx-15}" y="{cy+30}" width="13" height="52" rx="6" fill="{brown}" transform="rotate(14 {cx-8} {cy+30})"/>')
    s.append(f'<rect x="{cx+2}" y="{cy+30}" width="13" height="52" rx="6" fill="{brown}" transform="rotate(-14 {cx+8} {cy+30})"/>')
    s.append(f'<rect x="{cx-21}" y="{cy-16}" width="42" height="52" rx="12" fill="{brown}"/>')
    s.append(f'<circle cx="{cx}" cy="{cy-32}" r="19" fill="{brown}"/>')
    s.append(f'<circle cx="{cx-6.5}" cy="{cy-35}" r="2.2" fill="{icing}"/><circle cx="{cx+6.5}" cy="{cy-35}" r="2.2" fill="{icing}"/>')
    s.append(f'<path d="M{cx-6} {cy-26} Q {cx} {cy-21} {cx+6} {cy-26}" stroke="{icing}" stroke-width="2" fill="none" stroke-linecap="round"/>')
    for dy, col in ((-6, "#c0272d"), (6, "#14634a"), (18, "#e3b341")):
        s.append(f'<circle cx="{cx}" cy="{cy+dy}" r="3" fill="{col}"/>')
    s.append(f'<path d="M{cx-21} {cy+2} Q {cx} {cy+9} {cx+21} {cy+2}" stroke="{icing}" stroke-width="2.4" fill="none" stroke-dasharray="4 3.4"/>')
    for x, y, col in ((70, 90, "#c0272d"), (322, 84, "#14634a"), (58, 214, "#e3b341"), (336, 208, "#c0272d"), (96, 40, "#fff7ed"), (306, 36, "#fff7ed")):
        s.append(f'<circle cx="{x}" cy="{y}" r="6" fill="{col}" opacity=".85"/><circle cx="{x}" cy="{y}" r="2.4" fill="#fff7ed" opacity=".8"/>')
    return "".join(s)

def scene_silentnight():
    s = [dots(81, 60, 396, 273, "#ffffff", .75, .7, 1.8, .6)]
    s.append('<circle cx="348" cy="34" r="26" fill="rgba(240,199,94,.16)"/>')
    s.append(star4(348, 34, 18, "#f0c75e"))
    s.append(f'<path d="M348 50 L348 72" stroke="#f0c75e" stroke-width="2.2" opacity=".7"/>')
    sky = []
    sky.append('<rect x="0" y="216" width="46" height="57" fill="#04060d"/>')
    sky.append('<rect x="38" y="198" width="52" height="75" fill="#04060d"/>')
    sky.append('<path d="M38 198 A26 15 0 0 1 90 198 Z" fill="#04060d"/>')
    sky.append('<rect x="88" y="226" width="40" height="47" fill="#04060d"/>')
    sky.append('<rect x="126" y="186" width="16" height="87" fill="#04060d"/>')
    sky.append('<path d="M126 186 L134 168 L142 186 Z" fill="#04060d"/>')
    sky.append('<rect x="146" y="208" width="58" height="65" fill="#04060d"/>')
    sky.append('<path d="M146 208 A29 16 0 0 1 204 208 Z" fill="#04060d"/>')
    sky.append('<rect x="206" y="222" width="44" height="51" fill="#04060d"/>')
    sky.append('<rect x="252" y="196" width="50" height="77" fill="#04060d"/>')
    sky.append('<path d="M252 196 A25 14 0 0 1 302 196 Z" fill="#04060d"/>')
    sky.append('<rect x="304" y="214" width="42" height="59" fill="#04060d"/>')
    sky.append('<rect x="348" y="228" width="48" height="45" fill="#04060d"/>')
    s.append("".join(sky))
    rng = random.Random(83)
    for _ in range(9):
        x = 12 + rng.random() * 372
        y = 232 + rng.random() * 30
        s.append(f'<rect x="{x:.0f}" y="{y:.0f}" width="4.4" height="6" fill="#f0c75e" opacity=".9"/>')
    return "".join(s)

def scene_robin():
    s = [dots(91, 16, 396, 273, "#e3b341", .45, .8, 1.7, .5)]
    # holly branch top-left
    for (x, y, a) in ((34, 26, 30), (56, 18, 70), (20, 44, -10), (76, 30, 100)):
        s.append(f'<ellipse cx="{x}" cy="{y}" rx="6" ry="13" fill="#14634a" transform="rotate({a} {x} {y})"/>')
    for (x, y) in ((46, 34), (56, 42), (38, 46)):
        s.append(f'<circle cx="{x}" cy="{y}" r="4.4" fill="#c0272d"/><circle cx="{x-1.4}" cy="{y-1.4}" r="1.3" fill="rgba(255,255,255,.6)"/>')
    cx, cy = 198, 168
    s.append(f'<path d="M96 {cy+52} Q 198 {cy+30} 300 {cy+54}" stroke="#6b4a2a" stroke-width="5" fill="none" stroke-linecap="round"/>')
    s.append(f'<path d="M150 {cy+44} Q 160 {cy+26} 178 {cy+20}" stroke="#6b4a2a" stroke-width="3.4" fill="none" stroke-linecap="round"/>')
    s.append(f'<rect x="{cx+16}" y="{cy+6}" width="52" height="11" rx="5" fill="#5d4630" transform="rotate(38 {cx+16} {cy+10})"/>')
    s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="37" ry="30" fill="#8a6f55"/>')
    s.append(f'<ellipse cx="{cx-9}" cy="{cy+7}" rx="24" ry="21" fill="#c0272d"/>')
    s.append(f'<ellipse cx="{cx+6}" cy="{cy-4}" rx="19" ry="13" fill="#6e5741" transform="rotate(-14 {cx+6} {cy-4})"/>')
    s.append(f'<circle cx="{cx-26}" cy="{cy-24}" r="17.5" fill="#7d6350"/>')
    s.append(f'<path d="M{cx-41} {cy-26} L{cx-55} {cy-22} L{cx-41} {cy-18} Z" fill="#e3b341"/>')
    s.append(f'<circle cx="{cx-30}" cy="{cy-27}" r="2.6" fill="#14100c"/><circle cx="{cx-31}" cy="{cy-28}" r=".9" fill="#ffffff"/>')
    s.append(f'<path d="M{cx-14} {cy+27} L{cx-14} {cy+38} M{cx-4} {cy+29} L{cx-4} {cy+39}" stroke="#3d2c1c" stroke-width="2.2" stroke-linecap="round"/>')
    return "".join(s)

def scene_sleigh():
    s = [dots(101, 80, 396, 273, "#ffffff", .8, .7, 1.9, .7)]
    s.append('<circle cx="50" cy="36" r="17" fill="#f2e8f7"/><circle cx="44" cy="32" r="3.2" fill="rgba(21,11,46,.08)"/><circle cx="57" cy="41" r="2.4" fill="rgba(21,11,46,.08)"/>')
    s.append('<ellipse cx="205" cy="146" rx="158" ry="54" fill="rgba(255,255,255,.07)"/>')
    sil = "#0a0518"
    # reindeer (stylised leaping silhouette)
    s.append(f'<g fill="{sil}"><ellipse cx="316" cy="126" rx="30" ry="12.5" transform="rotate(-16 316 126)"/>'
             f'<ellipse cx="342" cy="109" rx="12" ry="7" transform="rotate(-38 342 109)"/>'
             f'<path d="M350 100 L359 84 M354 99 L366 90 M348 102 L352 86" stroke="{sil}" stroke-width="3.2" stroke-linecap="round"/>'
             f'<path d="M298 137 L284 155 M307 140 L300 160 M327 135 L332 157 M336 130 L348 148" stroke="{sil}" stroke-width="4" stroke-linecap="round"/>'
             f'<path d="M290 120 L272 111 L288 131 Z"/></g>')
    s.append(f'<circle cx="354" cy="111" r="2.8" fill="#e63946"/>')
    # sleigh
    s.append(f'<path d="M292 126 Q 240 139 196 137" stroke="{sil}" stroke-width="3" fill="none"/>')
    s.append(f'<path d="M84 168 Q 96 194 138 194 L 208 194 Q 232 194 240 172 L 243 158 L 224 158 Q 220 176 200 178 L 118 178 Q 92 178 84 156 Z" fill="{sil}"/>')
    s.append(f'<path d="M84 158 Q 92 178 118 178 L 200 178 Q 220 176 224 158" stroke="#e3b341" stroke-width="2.2" fill="none" opacity=".8"/>')
    s.append(f'<path d="M76 202 Q 130 190 196 200 L 246 200" stroke="#e3b341" stroke-width="3" fill="none" stroke-linecap="round"/>')
    s.append(f'<path d="M104 194 L 100 203 M 216 196 L 222 204" stroke="#e3b341" stroke-width="3" stroke-linecap="round"/>')
    s.append(f'<ellipse cx="196" cy="152" rx="24" ry="17" fill="{sil}"/>')
    s.append(f'<circle cx="142" cy="140" r="11" fill="{sil}"/>')
    s.append(f'<path d="M132 134 Q 142 118 154 132 L 146 134 Q 142 126 138 134 Z" fill="#c0272d"/>')
    s.append('<ellipse cx="198" cy="250" rx="230" ry="44" fill="#cfc3ec"/>')
    s.append('<ellipse cx="60" cy="258" rx="150" ry="36" fill="#e6def8"/>')
    return "".join(s)

def scene_goldscript():
    return (dots(111, 30, 396, 273, "#f0c75e", .55, .8, 2, .8)
            + star4(52, 42, 9, "#e3b341") + star4(344, 42, 9, "#e3b341")
            + star4(52, 231, 9, "#e3b341") + star4(344, 231, 9, "#e3b341"))

CARDS = [
    dict(id="midnight-pines", name="Midnight Pines", layout="top",
         bg="linear-gradient(180deg,#04150e,#0b3d2e 45%,#14532d)", scene=scene_midnight,
         head="#f0c75e", text="#fff9f0", foot="rgba(255,249,240,.75)", backbg="#eaf3ec", motif="pine", msgw="76%",
         msg="Wishing you a Christmas filled with warmth, laughter and love — and a New Year that treats you kindly."),
    dict(id="crimson-cheer", name="Crimson Cheer", layout="top",
         bg="radial-gradient(circle at 50% 32%,#d43a31,#b91c1c 55%,#7f1d1d)", scene=scene_crimson,
         head="#ffe9a8", text="#fff7ed", foot="rgba(255,247,237,.8)", backbg="#fbeaea", motif="star",
         msg="May your days be merry, your table be full, and your laugh be the loudest one in the room. Merry Christmas, friend!"),
    dict(id="golden-lights", name="Golden Lights", layout="top",
         bg="linear-gradient(180deg,#081426,#0a1f38 60%,#123152)", scene=scene_golden,
         head="#f0c75e", text="#fdf6e3", foot="rgba(253,246,227,.7)", backbg="#e9eef7", motif="star",
         msg="Here's to twinkling lights, full hearts, and the people who make the season bright. Merry Christmas!"),
    dict(id="snowy-day", name="Snowy Day", layout="top",
         bg="linear-gradient(180deg,#bfdbfe,#e3efff 55%,#ffffff)", scene=scene_snowy,
         head="#991b1b", text="#22302a", foot="rgba(34,48,42,.6)", backbg="#eef3fb", motif="snow",
         msg="May your Christmas be snowy, cosy and full of hot chocolate. Have the merriest day ever!"),
    dict(id="classic-wreath", name="Classic Wreath", layout="wreath",
         bg="linear-gradient(180deg,#fffdf6,#f7ecd2)", scene=scene_wreath,
         head="#0b3d2e", text="#22302a", foot="rgba(34,48,42,.55)", backbg="#f7ecd2", motif="wreath",
         msg="Warmest wishes for a joyful Christmas and a peaceful, prosperous New Year."),
    dict(id="candy-stripes", name="Candy Stripes", layout="candy",
         bg="#0b3d2e", scene=scene_candy,
         head="#f0c75e", text="#fff9f0", foot="rgba(255,249,240,.75)", backbg="#fbeaea", motif="cane",
         msg="Calories don't count at Christmas. That isn't official — but we're all agreeing to it anyway. Merry Christmas!"),
    dict(id="cosy-fireplace", name="Cosy Fireplace", layout="mid",
         bg="linear-gradient(180deg,#241108,#3d1e0e 55%,#542a10)", scene=scene_fireplace,
         head="#f0c75e", text="#ffedd5", foot="rgba(255,237,213,.7)", backbg="#f7e8d8", motif="flame",
         msg="Home is wherever we're together. Thank you for making every Christmas feel just like this one."),
    dict(id="gingerbread-fun", name="Gingerbread Fun", layout="mid",
         bg="linear-gradient(180deg,#b57e3e,#96622a 60%,#7c4a1e)", scene=scene_gingerbread,
         head="#fff7ed", text="#fff7ed", foot="rgba(255,247,237,.8)", backbg="#f3e2c7", motif="ginger",
         msg="You're one smart cookie! Have a sweet, sprinkle-covered, giggly Christmas!"),
    dict(id="silent-night", name="Silent Night", layout="top",
         bg="linear-gradient(180deg,#050914,#0a1a3a 60%,#13294f)", scene=scene_silentnight,
         head="#f0c75e", text="#fdf6e3", foot="rgba(253,246,227,.65)", backbg="#e9eef7", motif="star",
         headline="Silent Night, Holy Night",
         msg="May the wonder of that first silent night fill your home with peace this Christmas. God bless you and yours."),
    dict(id="robin-holly", name="Robin & Holly", layout="mid",
         bg="linear-gradient(180deg,#fffdf6,#f7ecd2)", scene=scene_robin,
         head="#991b1b", text="#22302a", foot="rgba(34,48,42,.55)", backbg="#f7ecd2", motif="holly",
         msg="A little bird told me this year is going to be a good one. Wishing you a gentle, joyful Christmas."),
    dict(id="santas-sleigh", name="Santa's Sleigh", layout="top",
         bg="linear-gradient(180deg,#150b2e,#241047 55%,#3b1a63)", scene=scene_sleigh,
         head="#f0c75e", text="#f2e8f7", foot="rgba(43,28,74,.8)", backbg="#eee9f7", motif="star", msgw="70%",
         msg="He's making a list and checking it twice — and you, superstar, are firmly on the nice one. Merry Christmas!"),
    dict(id="golden-script", name="Golden Script", layout="gold",
         bg="#0b3d2e", scene=scene_goldscript,
         head="#e3b341", text="#fff9f0", foot="rgba(255,249,240,.7)", backbg="#eaf3ec", motif="star",
         msg="With warmest wishes for a truly golden Christmas — may it shine from the first carol to the last mince pie."),
]

CARD_CSS = """
.half { position:absolute; left:0; width:210mm; height:148.5mm; }
.half.back { top:0; transform:rotate(180deg); }
.half.front { top:148.5mm; }
.design { position:absolute; left:6mm; right:6mm; top:5.5mm; bottom:5.5mm; border-radius:4mm; overflow:hidden; }
.design svg.scene { position:absolute; inset:0; width:100%; height:100%; }
.overlay { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; text-align:center; padding:9mm 14mm 7mm; }
.overlay h1 { font-family:Georgia,'Noto Serif',serif; font-size:25pt; line-height:1.12; }
.overlay .msg { font-family:Georgia,'Noto Serif',serif; font-size:11.5pt; line-height:1.45; max-width:82%; margin-top:3.5mm; }
.overlay .cardfoot { margin-top:auto; font-size:6.8pt; letter-spacing:.6px; font-weight:600; }
.backdesign { position:absolute; left:6mm; right:6mm; top:5.5mm; bottom:5.5mm; border-radius:4mm; border:.45mm solid #e8ddc9; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4mm; }
.backdesign .bname { font-size:8pt; letter-spacing:2.2px; color:#5b6b62; text-transform:uppercase; }
.backdesign .bfoot { font-size:7.5pt; color:#8a978e; letter-spacing:.5px; }
.foldline { position:absolute; top:148.5mm; left:0; right:0; border-top:.35mm dashed #b9c4bb; }
.foldtag { position:absolute; top:145.6mm; font-size:6pt; color:#93a197; }
.frame-gold { position:absolute; inset:4.2mm; border:.55mm solid #e3b341; border-radius:2.6mm; pointer-events:none; }
.frame-gold2 { position:absolute; inset:6mm; border:.25mm solid rgba(227,179,65,.75); border-radius:2mm; pointer-events:none; }
.candyframe { position:absolute; left:0; right:0; height:11mm; background:repeating-linear-gradient(45deg,#c0272d 0 7mm,#fff7ed 7mm 14mm); }
.candyframe.top { top:0; } .candyframe.bottom { bottom:0; }
.candyframe.side { top:0; bottom:0; height:auto; width:11mm; }
.candyframe.left { left:0; right:auto; } .candyframe.right { right:0; left:auto; }
"""

BACK_MOTIFS = {
    "pine": '<svg width="46" height="46" viewBox="0 0 48 48">' + pine(24, 42, 34, "#14634a") + star4(24, 5, 5, "#e3b341") + "</svg>",
    "star": '<svg width="46" height="46" viewBox="0 0 48 48">' + star4(24, 24, 15, "#e3b341") + "</svg>",
    "snow": '<svg width="46" height="46" viewBox="0 0 48 48"><g stroke="#7aa7c7" stroke-width="2.4" stroke-linecap="round"><path d="M24 6 V42 M9 15 L39 33 M39 15 L9 33"/></g><circle cx="24" cy="24" r="3" fill="#7aa7c7"/></svg>',
    "wreath": '<svg width="52" height="52" viewBox="0 0 48 48">' + wreath(24, 23, 13) + "</svg>",
    "cane": '<svg width="46" height="46" viewBox="0 0 48 48"><path d="M30 42 L30 16 A8 8 0 0 0 14 16" stroke="#c0272d" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M30 42 L30 16 A8 8 0 0 0 14 16" stroke="#fff7ed" stroke-width="6" fill="none" stroke-dasharray="4.5 6.5" stroke-linecap="round"/></svg>',
    "flame": '<svg width="46" height="46" viewBox="0 0 48 48"><ellipse cx="24" cy="29" rx="10" ry="15" fill="#e4572e"/><ellipse cx="24" cy="33" rx="6" ry="9" fill="#f0a13c"/><ellipse cx="24" cy="37" rx="3" ry="5" fill="#f7e7bd"/></svg>',
    "ginger": '<svg width="46" height="46" viewBox="0 0 48 48"><circle cx="24" cy="15" r="8" fill="#a9713a"/><rect x="16" y="22" width="16" height="17" rx="6" fill="#a9713a"/><circle cx="21.5" cy="14" r="1.4" fill="#fff7ed"/><circle cx="26.5" cy="14" r="1.4" fill="#fff7ed"/><circle cx="24" cy="28" r="1.7" fill="#c0272d"/><circle cx="24" cy="34" r="1.7" fill="#14634a"/></svg>',
    "holly": '<svg width="46" height="46" viewBox="0 0 48 48"><ellipse cx="17" cy="18" rx="6" ry="12" fill="#14634a" transform="rotate(-32 17 18)"/><ellipse cx="31" cy="18" rx="6" ry="12" fill="#0b3d2e" transform="rotate(32 31 18)"/><circle cx="24" cy="30" r="5" fill="#c0272d"/><circle cx="19" cy="35" r="4" fill="#b91c1c"/><circle cx="29" cy="35" r="4" fill="#c0272d"/></svg>',
}

def card_sheet(card):
    scene_svg = f'<svg class="scene" viewBox="0 0 396 273" preserveAspectRatio="xMidYMid slice">{card["scene"]()}</svg>'
    extra = ""
    if card["layout"] == "candy":
        extra = ('<div class="candyframe top"></div><div class="candyframe bottom"></div>'
                 '<div class="candyframe side left"></div><div class="candyframe side right"></div>'
                 '<div class="frame-gold" style="inset:13.5mm;border-color:rgba(227,179,65,.85)"></div>')
    if card["layout"] == "gold":
        extra = '<div class="frame-gold"></div><div class="frame-gold2"></div>'
    pad = {"top": "9mm", "wreath": "62mm", "mid": "8mm", "candy": "16mm", "gold": "13mm"}[card["layout"]]
    padb = "14mm" if card["layout"] == "candy" else "7mm"
    justify = "center" if card["layout"] == "gold" else "flex-start"
    headline = card.get("headline", "Merry Christmas")
    hstyle = 'font-style:italic; font-size:29pt;' if card["layout"] == "gold" else ""
    front = f"""
    <div class="half front">
      <div class="design" style="background:{card['bg']}">
        {scene_svg}{extra}
        <div class="overlay" style="padding-top:{pad};padding-bottom:{padb};justify-content:{justify}">
          <h1 style="color:{card['head']};{hstyle}">{headline}</h1>
          <p class="msg" style="color:{card['text']};max-width:{card.get('msgw','82%')}">{card['msg']}</p>
          <div class="cardfoot" style="color:{card['foot']}">{FOOTER}</div>
        </div>
      </div>
    </div>"""
    back = f"""
    <div class="half back">
      <div class="backdesign" style="background:{card['backbg']}">
        {BACK_MOTIFS[card['motif']]}
        <div class="bname">{card['name']}</div>
        <div class="bfoot">{FOOTER}</div>
      </div>
    </div>"""
    return f'<div class="page">{back}{front}<div class="foldline"></div><div class="foldtag" style="left:2mm">✂ fold</div></div>'

CARDS_HTML = "".join(card_sheet(c) for c in CARDS)

# ------------------------------------------------------------------ gift tags
TAG_CSS = """
.tags { display:grid; grid-template-columns:repeat(3,1fr); gap:4mm; }
.tag { height:59mm; border:.32mm dashed #aebbae; border-radius:2mm; padding:1.6mm; }
.tagin { height:100%; border-radius:3mm; position:relative; display:flex; flex-direction:column; align-items:center; padding:3mm 4mm 2.5mm; overflow:hidden; }
.tagin .tmotif { height:17mm; display:flex; align-items:center; justify-content:center; font-size:25pt; }
.tagin .tmotif svg { height:15mm; width:15mm; }
.tline { display:flex; align-items:flex-end; gap:2mm; width:100%; margin-top:2.6mm; font-size:8.5pt; color:#5b6b62; }
.tline i { flex:1; border-bottom:.32mm dotted #9db09f; height:4.4mm; }
.tag .hole { position:absolute; top:2.6mm; left:50%; margin-left:-2.2mm; width:4.4mm; height:4.4mm; border-radius:50%; background:#fffdf8; border:.35mm solid #c9bfa8; }
.tag.s1 .tagin { border-radius:3mm; }
.tag.s2 .tagin { border-radius:8mm 3mm 8mm 3mm; }
.tag.s3 .tagin { border-radius:50% 50% 4mm 4mm / 22% 22% 4mm 4mm; }
.tag.s4 .tagin { border-radius:3mm 3mm 10mm 10mm; }
.tag .tband { position:absolute; top:0; left:0; right:0; height:3mm; }
"""

MINI_SVG = dict(BACK_MOTIFS)
MINI_SVG.update({
    "gift": '<svg viewBox="0 0 48 48"><rect x="10" y="20" width="28" height="22" fill="#c0272d"/><rect x="7" y="13" width="34" height="8" fill="#b91c1c"/><rect x="21.5" y="13" width="5" height="29" fill="#e3b341"/><path d="M24 13 Q12 4 16 12 Q18 15 24 13 Q30 15 32 12 Q36 4 24 13" fill="#e3b341"/></svg>',
    "bell": '<svg viewBox="0 0 48 48"><path d="M24 8 a3.4 3.4 0 1 1 .1 0 Z" fill="#b8860b"/><path d="M24 12 Q36 16 36 30 L38 36 L10 36 L12 30 Q12 16 24 12" fill="#e3b341"/><circle cx="24" cy="40" r="3.6" fill="#b8860b"/><rect x="10" y="33.4" width="28" height="2.6" fill="#b8860b"/></svg>',
    "bauble": '<svg viewBox="0 0 48 48"><rect x="20" y="4" width="8" height="6" fill="#b8860b"/><circle cx="24" cy="27" r="16" fill="#14634a"/><path d="M10 22 Q24 30 38 22" stroke="#e3b341" stroke-width="2.6" fill="none"/><circle cx="18" cy="20" r="3" fill="rgba(255,255,255,.35)"/></svg>',
    "bauble-red": '<svg viewBox="0 0 48 48"><rect x="20" y="4" width="8" height="6" fill="#b8860b"/><circle cx="24" cy="27" r="16" fill="#c0272d"/><path d="M10 22 Q24 30 38 22" stroke="#fff3d6" stroke-width="2.6" fill="none"/><circle cx="18" cy="20" r="3" fill="rgba(255,255,255,.4)"/></svg>',
})

TAG_MOTIFS = ["pine","star","snow","wreath","cane","flame","ginger","holly",
              "🦌","gift","bell","bauble","⛄","cane","bauble-red","🎅",
              "holly","🧦","star","🍪","wreath","🐧","snow","gift"]
TAG_BGS = ["#fdf3e3", "#e9f2ec", "#fbeaea", "#fffdf8", "#eef3fb", "#f7ecd2"]
TAG_SHAPES = ["s1", "s2", "s3", "s4"]

def tag_html(i):
    motif = TAG_MOTIFS[i]
    mhtml = MINI_SVG[motif] if motif in MINI_SVG else f'<span>{motif}</span>'
    bg = TAG_BGS[i % len(TAG_BGS)]
    shape = TAG_SHAPES[i % len(TAG_SHAPES)]
    hole = '<div class="hole"></div>' if i % 3 == 0 else ""
    band_cols = ["#c0272d", "#14634a", "#e3b341", "#b91c1c"]
    band = f'<div class="tband" style="background:{band_cols[i % 4]}"></div>' if i % 4 == 1 else ""
    return (f'<div class="tag {shape}"><div class="tagin" style="background:{bg}">{band}{hole}'
            f'<div class="tmotif">{mhtml}</div>'
            f'<div class="tline"><span>To</span><i></i></div>'
            f'<div class="tline"><span>From</span><i></i></div>'
            f'</div></div>')

def tags_sheet(indices, label):
    tags = "".join(tag_html(i) for i in indices)
    return (f'<div class="page padded"><div class="sheethead"><h1>Christmas Gift Tags</h1>'
            f'<p>{label} • Print on card or thick paper, cut along the dashed lines, punch the ringed hole if you like, and tie on with ribbon or string.</p></div>'
            f'<div class="tags">{tags}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

TAGS_HTML = (tags_sheet(range(0, 12), "Sheet 1 of 2 — 12 tags")
             + tags_sheet(range(12, 24), "Sheet 2 of 2 — 12 more tags"))

# ------------------------------------------------------------------ quiz sheets
import re
_qsrc = open(os.path.join(os.path.dirname(__file__), "..", "..", "lib", "quiz.ts")).read()
QUIZ = []
for m in re.finditer(r'question:\s*"((?:[^"\\]|\\.)*)",\s*answer:\s*"((?:[^"\\]|\\.)*)",\s*fact:\s*"((?:[^"\\]|\\.)*)"', _qsrc):
    QUIZ.append(tuple(g.replace('\\"', '"') for g in m.groups()))
assert len(QUIZ) == 12, f"expected 12 quiz questions, parsed {len(QUIZ)}"

QUIZ_CSS = """
.qband { background:#0b3d2e; border-radius:4mm; padding:6mm 8mm; text-align:center; margin-bottom:6mm; }
.qband h1 { font-family:Georgia,'Noto Serif',serif; color:#f0c75e; font-size:22pt; }
.qband p { color:#fff9f0; font-size:9.5pt; margin-top:1.6mm; }
.qmeta { display:flex; gap:8mm; font-size:10.5pt; margin-bottom:5mm; }
.qmeta .fill { flex:1; border-bottom:.35mm dotted #9db09f; height:5mm; }
.qmeta .score { width:30mm; border-bottom:.35mm dotted #9db09f; height:5mm; }
.qitem { margin-bottom:4.6mm; }
.qitem .qq { font-size:11pt; }
.qitem .qq b { color:#b91c1c; }
.qitem .aline { border-bottom:.32mm dotted #9db09f; height:5.6mm; margin-top:1mm; }
.kitem { margin-bottom:4.2mm; font-size:10.5pt; }
.kitem b { color:#0b3d2e; }
.kitem .num { color:#b91c1c; font-weight:700; }
.kitem .fact { display:block; font-size:9pt; color:#5b6b62; font-style:italic; margin-top:.6mm; }
"""

def quiz_player():
    items = "".join(
        f'<div class="qitem"><div class="qq"><b>{i+1}.</b> {q}</div><div class="aline"></div></div>'
        for i, (q, a, f) in enumerate(QUIZ))
    return (f'<div class="page padded"><div class="qband"><h1>🎄 The Big Christmas Quiz 🎄</h1>'
            f'<p>Player sheet — 12 questions. Write your answers on the lines… and no peeking at the answer key!</p></div>'
            f'<div class="qmeta"><span>Name</span><span class="fill"></span><span>Score</span><span class="score"></span><span>/ 12</span></div>'
            f'{items}'
            f'<div class="sheetfoot">{FOOTER} • Play it online too, at merryhub.vercel.app/christmas-quiz</div></div>')

def quiz_key():
    items = "".join(
        f'<div class="kitem"><span class="num">{i+1}.</span> <b>{a}</b><span class="fact">{f}</span></div>'
        for i, (q, a, f) in enumerate(QUIZ))
    return (f'<div class="page padded"><div class="qband" style="background:#991b1b"><h1>🔑 Answer Key</h1>'
            f'<p>The Big Christmas Quiz — answers and the story behind each one. Quizmasters only!</p></div>'
            f'{items}'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

QUIZ_HTML = quiz_player() + quiz_key()

# ---------------------------------------------------------------- party games
GAMES_CSS = """
.ws-wrap { display:flex; justify-content:center; margin:4mm 0 5mm; }
table.ws { border-collapse:collapse; }
table.ws td { width:9.6mm; height:9.6mm; text-align:center; font-size:12.5pt; font-weight:600; border:.25mm solid #d8cfb8; color:#22302a; }
table.ws td.sol { background:#fdf0c9; color:#991b1b; border-color:#e3b341; }
.ws-words { columns:3; font-size:10.5pt; line-height:1.9; list-style:none; text-align:center; }
.ws-words li::before { content:"☐ "; color:#b8860b; }
.pic-row { display:flex; align-items:flex-end; gap:5mm; margin-bottom:6.4mm; }
.pic-row .num { font-weight:700; color:#b91c1c; font-size:12pt; width:8mm; }
.pic-row .clue { font-size:21pt; letter-spacing:2px; white-space:nowrap; }
.pic-row .aline { flex:1; border-bottom:.32mm dotted #9db09f; height:6mm; }
.pic-answers { position:absolute; left:10mm; right:10mm; bottom:11mm; transform:rotate(180deg); font-size:8pt; color:#8a978e; text-align:center; line-height:1.7; border-top:.3mm dashed #d8cfb8; padding-top:2.4mm; }
.bingo { display:grid; grid-template-columns:repeat(5,1fr); gap:2.6mm; margin-top:4mm; }
.bcell { height:36mm; border:.45mm solid #0b3d2e; border-radius:3mm; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.2mm; background:#fffdf8; padding:1mm; }
.bcell .be { font-size:23pt; line-height:1; }
.bcell .bn { font-size:7.6pt; text-align:center; color:#22302a; font-weight:600; }
.bcell.free { background:#0b3d2e; }
.bcell.free .bn { color:#f0c75e; font-size:10pt; letter-spacing:1.5px; }
.bingo-title { display:flex; justify-content:center; gap:2mm; margin-bottom:2mm; }
.bingo-title span { font-family:Georgia,'Noto Serif',serif; font-weight:700; font-size:19pt; color:#fff9f0; width:11mm; height:11mm; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.caller { display:grid; grid-template-columns:repeat(5,1fr); gap:3mm; margin-top:4mm; }
.ccell { height:29mm; border:.32mm dashed #aebbae; border-radius:2mm; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1mm; }
.ccell .be { font-size:19pt; } .ccell .bn { font-size:7.4pt; font-weight:600; }
"""

def ws_table(solution=False):
    solset = set()
    if solution:
        for cells in DATA["solution"].values():
            for r, c in cells:
                solset.add((r, c))
    rows = []
    for r, row in enumerate(DATA["grid"]):
        tds = "".join(f'<td class="{"sol" if (r,c) in solset else ""}">{ch}</td>' for c, ch in enumerate(row))
        rows.append(f"<tr>{tds}</tr>")
    return f'<table class="ws">{"".join(rows)}</table>'

def word_list(words):
    return '<ul class="ws-words">' + "".join(f"<li>{w.title()}</li>" for w in words) + "</ul>"

def games_wordsearch():
    return (f'<div class="page padded"><div class="sheethead"><h1>🔍 Christmas Word Search</h1>'
            f'<p>15 festive words are hiding in the grid — forwards, backwards, up, down and diagonally. Circle each one you find!</p></div>'
            f'<div class="ws-wrap">{ws_table()}</div>{word_list(DATA["words"])}'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

def games_wordsearch_solution():
    return (f'<div class="page padded"><div class="sheethead"><h1>🔍 Word Search — Solution</h1>'
            f'<p>Every hidden word, revealed. (For grown-ups checking answers — or crafty elves.)</p></div>'
            f'<div class="ws-wrap">{ws_table(True)}</div>{word_list(DATA["words"])}'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

PICT = [
    ("🔔 🔔 🔔", "Jingle Bells"),
    ("🤫 🌙 ✨", "Silent Night"),
    ("🎅 ➡️ 🏙️", "Santa Claus Is Coming to Town"),
    ("🦌 🔴 👃", "Rudolph the Red-Nosed Reindeer"),
    ("⛄ 🎩 💃", "Frosty the Snowman"),
    ("1️⃣2️⃣ 📅 🎄", "The Twelve Days of Christmas"),
    ("🌍 😄 🎉", "Joy to the World"),
    ("🎄 🌿 🎀", "Deck the Halls"),
    ("❄️ 🚶‍♂️ 🌲", "Winter Wonderland"),
    ("👶 🌟 🛖", "Away in a Manger"),
]

def games_pictionary():
    rows = "".join(
        f'<div class="pic-row"><span class="num">{i+1}.</span><span class="clue">{clue}</span><span class="aline"></span></div>'
        for i, (clue, ans) in enumerate(PICT))
    answers = " • ".join(f"{i+1}. {ans}" for i, (clue, ans) in enumerate(PICT))
    return (f'<div class="page padded"><div class="sheethead"><h1>🎵 Guess the Christmas Song!</h1>'
            f'<p>Each row of pictures hides a famous Christmas song. Work out the title and write it on the line. Answers are upside-down at the bottom — no peeking!</p></div>'
            f'{rows}'
            f'<div class="pic-answers">ANSWERS: {answers}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

def bingo_card(cells, label):
    cols = ["#b91c1c", "#14634a", "#b8860b", "#14634a", "#b91c1c"]
    title = "".join(f'<span style="background:{cols[i]}">{ch}</span>' for i, ch in enumerate("BINGO"))
    grid = ""
    for cell in cells:
        if cell["name"] == "FREE":
            grid += '<div class="bcell free"><span class="be">🎄</span><span class="bn">FREE</span></div>'
        else:
            grid += f'<div class="bcell"><span class="be">{cell["emoji"]}</span><span class="bn">{cell["name"]}</span></div>'
    return (f'<div class="page padded"><div class="bingo-title">{title}</div>'
            f'<div class="sheethead"><h1>Christmas Bingo — {label}</h1>'
            f'<p>Cover each picture as it is called out (a coin, button or sweet works perfectly). First to finish a row — up, down or across — or the whole card, shouts BINGO!</p></div>'
            f'<div class="bingo">{grid}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

def bingo_caller():
    cells = "".join(
        f'<div class="ccell"><span class="be">{it["emoji"]}</span><span class="bn">{it["name"]}</span></div>'
        for it in DATA["bingo"]["pool"])
    return (f'<div class="page padded"><div class="sheethead"><h1>📣 Bingo Caller Sheet</h1>'
            f'<p>Cut along the dashed lines, fold the pieces into a hat, and pull one out at a time. 30 pictures — every one appears on the bingo cards.</p></div>'
            f'<div class="caller">{cells}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

GAMES_HTML = ""  # superseded by the full games-bundle assembly in Part 6 below

# --------------------------------------------------------------- santa letters
SANTA_CSS = """
.letter { position:absolute; left:8mm; right:8mm; top:8mm; bottom:8mm; border:.55mm solid #0b3d2e; border-radius:3mm; padding:9mm 11mm; }
.letter::before { content:""; position:absolute; inset:2.2mm; border:.25mm solid #e3b341; border-radius:2.2mm; pointer-events:none; }
.letter h1 { font-family:Georgia,'Noto Serif',serif; text-align:center; font-size:20pt; color:#991b1b; }
.letter .from { text-align:center; font-size:9pt; letter-spacing:2.4px; color:#b8860b; text-transform:uppercase; margin-bottom:2mm; }
.letter p { font-family:Georgia,'Noto Serif',serif; font-size:12pt; line-height:1.85; margin-bottom:4.5mm; }
.letter .blank { display:inline-block; border-bottom:.35mm dotted #9db09f; min-width:38mm; height:5.4mm; }
.letter .blank.wide { min-width:70mm; }
.letter .rule { border-bottom:.32mm dotted #c4bda8; height:7.4mm; }
.letter .sig { font-family:Georgia,'Noto Serif',serif; font-style:italic; font-size:19pt; color:#991b1b; margin-top:2mm; }
.letter .ps { font-size:10.5pt; font-style:italic; color:#5b6b62; }
.seal { position:absolute; right:12mm; bottom:14mm; width:30mm; height:30mm; border-radius:50%; border:.7mm double #b8860b; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#991b1b; transform:rotate(-9deg); background:rgba(253,240,201,.5); }
.seal b { font-size:9.5pt; letter-spacing:.6px; } .seal span { font-size:7pt; letter-spacing:1.2px; }
.np-head { display:flex; align-items:center; justify-content:center; gap:4mm; margin-bottom:4mm; }
.q { font-family:Georgia,'Noto Serif',serif; font-size:11.5pt; margin:4mm 0 1.4mm; color:#0b3d2e; }
"""

def santa_from():
    return f'''<div class="page"><div class="letter">
      <div class="from">✦ Official North Pole Post ✦</div>
      <h1>A Letter from Santa</h1>
      <p style="margin-top:5mm">Dear <span class="blank"></span>,</p>
      <p>Ho ho ho! I was checking my Nice List this morning — the very big one, written in gold ink —
      and there was your name, shining brightly. Mrs Claus says I should write to every
      <span class="blank" style="min-width:16mm"></span>-year-old who has had a year as good as yours, so here I am!</p>
      <p>The elves and I were especially proud when we heard about this:</p>
      <div class="rule"></div><div class="rule" style="margin-bottom:4.5mm"></div>
      <p>That is exactly the kind of kindness that keeps the sleigh flying. Keep it up, and give
      <span class="blank"></span> a big Christmas hug from me.</p>
      <p>The elves are busy in the workshop right now with something special that I think you are
      going to love. I can't say more — Santa rules! — but do keep an eye on the tree on Christmas morning.</p>
      <p>Now, one small job for you: an early night on Christmas Eve, please. I work much faster
      when the whole house is asleep, and the reindeer do enjoy the quiet.</p>
      <p style="margin-bottom:1mm">With a belly full of laughs and a sleigh full of joy,</p>
      <div class="sig">Santa Claus</div>
      <p class="ps">P.S. If there happen to be biscuits by the fireplace, the reindeer and I won't say no. Rudolph is partial to a mince pie.</p>
      <div class="seal"><span>★ OFFICIAL ★</span><b>NICE LIST</b><span>CHRISTMAS 2026</span></div>
      <div class="sheetfoot" style="bottom:-6.5mm">{FOOTER}</div>
    </div></div>'''

def santa_to():
    rules = '<div class="rule"></div>' * 3
    wishes = "".join(f'<p class="q" style="margin-top:2.6mm">{n}. <span class="blank wide" style="min-width:130mm"></span></p>' for n in (1, 2, 3))
    return f'''<div class="page"><div class="letter">
      <div class="from">✦ For the North Pole — by fastest reindeer ✦</div>
      <h1>My Letter to Santa</h1>
      <p style="margin-top:5mm">Dear Santa,</p>
      <p>My name is <span class="blank"></span> and I am <span class="blank" style="min-width:16mm"></span> years old.
      I live in <span class="blank"></span>.</p>
      <p class="q">This year, I have been… (circle one) &nbsp; very good &nbsp;•&nbsp; mostly good &nbsp;•&nbsp; good-ish &nbsp;•&nbsp; let's not dwell on it</p>
      <p class="q">Something kind I did this year:</p>
      <div class="rule"></div><div class="rule"></div>
      <p class="q">Three things I am wishing for:</p>
      {wishes}
      <p class="q">One question I have always wanted to ask you:</p>
      <div class="rule"></div>
      <p class="q">A promise for next year:</p>
      <div class="rule"></div>
      <p style="margin-top:6mm">Lots of love from</p>
      <div class="rule" style="width:60mm"></div>
      <p class="ps" style="margin-top:5mm">P.S. There will be <span class="blank" style="min-width:30mm"></span> waiting for you by the fireplace. The reindeer get the carrots, obviously.</p>
      <div class="sheetfoot" style="bottom:-6.5mm">{FOOTER}</div>
    </div></div>'''

SANTA_HTML = santa_from() + santa_to()

# ---------------------------------------------------------------- place cards
PLACE_CSS = """
.places { display:grid; grid-template-columns:1fr 1fr; gap:0; border:.3mm dashed #aebbae; }
.pcell { height:62mm; position:relative; border:.3mm dashed #aebbae; overflow:hidden; }
.pcell .half2 { position:absolute; left:0; right:0; height:50%; }
.pcell .back2 { top:0; transform:rotate(180deg); display:flex; align-items:center; justify-content:center; gap:2.4mm; font-family:Georgia,'Noto Serif',serif; font-style:italic; font-size:9.5pt; color:#991b1b; }
.pcell .front2 { bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2mm 6mm; }
.pcell .fold2 { position:absolute; top:50%; left:0; right:0; border-top:.3mm dashed #c4bda8; }
.pcell .pname { width:78%; border-bottom:.35mm dotted #9db09f; height:6.5mm; }
.pcell .pmotif { font-size:12pt; margin-bottom:1.6mm; }
.pcell .frame2 { position:absolute; inset:2mm; border:.3mm solid #e8ddc9; pointer-events:none; }
"""

PLACE_MOTIFS = ["🎄", "⭐", "🕯️", "🔔", "❄️", "🎀", "🦌", "🍪"]

def place_cards():
    cells = ""
    for i, mot in enumerate(PLACE_MOTIFS):
        cells += (f'<div class="pcell"><div class="frame2"></div>'
                  f'<div class="half2 back2"><span>{mot}</span><span>Merry Christmas</span></div>'
                  f'<div class="fold2"></div>'
                  f'<div class="half2 front2"><div class="pmotif">{mot}</div><div class="pname"></div></div></div>')
    return (f'<div class="page padded"><div class="sheethead"><h1>🍽️ Table Place Cards</h1>'
            f'<p>Cut along the outer dashed lines, fold each card in half along its middle dashed line, and write your guest\'s name on the dotted line. The card stands up like a little tent — name facing your guest.</p></div>'
            f'<div class="places">{cells}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

PLACE_HTML = place_cards()

# ------------------------------------------------------------- the games bundle
GAMES2_CSS = """
.scr-row { display:flex; align-items:center; gap:5mm; margin-bottom:5.6mm; }
.scr-row .num { font-weight:700; color:#b91c1c; width:8mm; font-size:11.5pt; }
.scr-row .scr { font-family:Georgia,'Noto Serif',serif; font-size:14.5pt; letter-spacing:3.5px; font-weight:700; color:#0b3d2e; width:52mm; }
.scr-row .aline { flex:1; border-bottom:.32mm dotted #9db09f; height:6mm; }
table.cats { border-collapse:collapse; width:100%; margin-top:3mm; }
table.cats th, table.cats td { border:.3mm solid #d8cfb8; padding:2.4mm 2.6mm; font-size:10pt; }
table.cats th { background:#0b3d2e; color:#f0c75e; font-family:Georgia,'Noto Serif',serif; font-size:11pt; }
table.cats td.cat { font-weight:600; width:52mm; background:#fdf6e3; }
table.cats td.cell { height:11.5mm; }
.gprose p { font-size:11pt; line-height:1.75; margin-bottom:4mm; }
.gprose .lr { color:#b91c1c; font-weight:800; }
table.outcomes { border-collapse:collapse; width:100%; margin:3mm 0 5mm; }
table.outcomes td { border:.3mm solid #d8cfb8; padding:3mm 3.4mm; font-size:10.5pt; line-height:1.55; }
table.outcomes td.die { font-size:17pt; text-align:center; width:16mm; background:#fdf6e3; }
ol.grules { font-size:11pt; line-height:1.8; margin-left:6mm; margin-bottom:4mm; }
ol.grules li { margin-bottom:2mm; }
.tipbox { background:#fdf6e3; border:.35mm solid #e3b341; border-radius:3mm; padding:4mm 5mm; font-size:10pt; line-height:1.65; margin-top:4mm; }
.phrase-row { display:flex; align-items:flex-end; gap:3mm; margin-bottom:6.2mm; font-family:Georgia,'Noto Serif',serif; font-size:12pt; }
.phrase-row .num { font-weight:700; color:#b91c1c; font-family:'Segoe UI','Noto Sans',sans-serif; font-size:11pt; }
.phrase-row .fill { flex:1; border-bottom:.32mm dotted #9db09f; height:5.6mm; min-width:34mm; }
.compact .qitem { margin-bottom:2.3mm; }
.compact .qq { font-size:10.5pt; }
.compact .aline { height:3.7mm; margin-top:.5mm; }
"""

def upside_answers(items):
    return " • ".join(f"{i+1}. {a}" for i, a in enumerate(items))

TRIVIA = [
    ("What do children hang by the fireplace on Christmas Eve for Santa to fill?", "Stockings"),
    ("Which of Santa's reindeer is famous for having a shiny red nose?", "Rudolph"),
    ("Under which plant are people traditionally supposed to kiss at Christmas?", "Mistletoe"),
    ("Which country is credited with starting the tradition of the decorated Christmas tree?", "Germany"),
    ("What is Santa Claus traditionally called in the United Kingdom?", "Father Christmas"),
    ("Which red-and-white striped sweet is shaped like a little walking cane?", "The candy cane"),
    ("What do children on the 'naughty list' supposedly find in their stocking?", "A lump of coal"),
    ("Which magical ballet, featuring the Sugar Plum Fairy, is a Christmas classic?", "The Nutcracker"),
    ("In 'A Christmas Carol', how many spirits visit Scrooge after Jacob Marley's ghost?", "Three"),
    ("In 'The Twelve Days of Christmas', what does my true love give on the seventh day?", "Seven swans a-swimming"),
    ("What colour are mistletoe berries?", "White"),
    ("Which reindeer's name is the German word for thunder?", "Donner"),
    ("On the first day of Christmas, what is sitting in the pear tree?", "A partridge"),
    ("What is Frosty the Snowman's nose made from?", "A button"),
    ("Which country gives London a Christmas tree for Trafalgar Square every year?", "Norway"),
    ("How many points (arms) does a snowflake have?", "Six"),
]

def games_trivia():
    items = "".join(
        f'<div class="qitem"><div class="qq"><b>{i+1}.</b> {q}</div><div class="aline"></div></div>'
        for i, (q, a) in enumerate(TRIVIA))
    answers = upside_answers([a for q, a in TRIVIA])
    return (f'<div class="page padded"><div class="qband"><h1>🧠 Christmas Trivia</h1>'
            f'<p>The big round — 16 questions, one point each. Answers are upside-down at the bottom, so the quizmaster stays honest.</p></div>'
            f'<div class="compact">{items}</div>'
            f'<div class="pic-answers">ANSWERS: {answers}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

SCRAMBLE_WORDS = ["SNOWMAN", "REINDEER", "PRESENT", "SLEIGH", "WREATH", "TINSEL",
                  "CAROL", "STOCKING", "JINGLE", "HOLLY", "CHIMNEY", "MISTLETOE"]

def scramble_of(word, seed):
    rng = random.Random(seed)
    letters = list(word)
    for _ in range(60):
        rng.shuffle(letters)
        s = "".join(letters)
        if s != word:
            return s
    return word[::-1]

def games_scramble():
    rows = ""
    for i, w in enumerate(SCRAMBLE_WORDS):
        rows += (f'<div class="scr-row"><span class="num">{i+1}.</span>'
                 f'<span class="scr">{scramble_of(w, 500 + i)}</span><span class="aline"></span></div>')
    answers = upside_answers([w.title() for w in SCRAMBLE_WORDS])
    return (f'<div class="page padded"><div class="sheethead"><h1>🔀 Christmas Word Scramble</h1>'
            f'<p>Twelve festive words have had their letters all jumbled up. Unscramble each one and write it on the line. Answers upside-down at the bottom!</p></div>'
            f'{rows}'
            f'<div class="pic-answers">ANSWERS: {answers}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

CATS = ["A Christmas song", "A festive food or drink", "A gift for a child", "Something red",
        "Something you can see in the sky", "A Christmas film", "A word that rhymes with “snow”",
        "A decoration", "Something Santa wears", "A place to spend Christmas"]

def games_categories():
    rows = "".join(f'<tr><td class="cat">{i+1}. {c}</td><td class="cell"></td><td class="cell"></td><td class="cell"></td></tr>'
                   for i, c in enumerate(CATS))
    return (f'<div class="page padded"><div class="sheethead"><h1>🔤 Christmas Categories</h1>'
            f'<p>Three rounds, one letter each. You have <b>one minute</b> per round to fill every row with an answer starting with that letter. '
            f'One point per answer — <b>two</b> if nobody else has it. No proper-name shortcuts unless the table agrees!</p></div>'
            f'<table class="cats"><tr><th style="text-align:left">Category</th><th>Round 1 — letter S</th><th>Round 2 — letter C</th><th>Round 3 — letter M</th></tr>{rows}</table>'
            f'<div class="tipbox">🏆 <b>Scoring:</b> read answers aloud after each round. Cross out duplicates — only unique answers earn the 2-point bonus. Highest total after three rounds wins the last mince pie.</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

PHRASES = [
    "All I want for Christmas is",
    "’Twas the night before Christmas, and all through the",
    "Rockin’ around the",
    "I’m dreaming of a white",
    "Santa Claus is coming to",
    "You know Dasher and Dancer and",
    "Frosty the Snowman was a jolly, happy",
    "All I want for Christmas is my two",
    "Grandma got run over by a",
    "Have yourself a merry little",
]

def games_finish_phrase():
    rows = ""
    for i, p in enumerate(PHRASES):
        rows += (f'<div class="phrase-row"><span class="num">{i+1}.</span><span>“{p}</span><span class="fill"></span><span>”</span></div>')
    return (f'<div class="page padded"><div class="sheethead"><h1>✍️ Finish the Phrase</h1>'
            f'<p>Ten famous Christmas lines — but the ending is up to you. You can write the real ending… or a much funnier one. '
            f'Read them aloud and vote: one point for every ending that makes the table laugh.</p></div>'
            f'{rows}'
            f'<div class="tipbox">🎄 <b>House rule:</b> the true ending scores nothing — this game rewards imagination. Best overall phrase wins the title of Christmas Poet (until next year).</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

CAROL_QUIZ = [
    ("“Silent night, holy night, all is calm, all is ______”", "bright"),
    ("“O come, all ye faithful, joyful and ______”", "triumphant"),
    ("“Jingle bells, jingle bells, jingle all the ______”", "way"),
    ("Which carol tells you to deck the halls with boughs of holly?", "Deck the Halls"),
    ("“Hark! The herald angels sing — glory to the ______ king”", "newborn"),
    ("“We wish you a Merry Christmas and a ______ New Year”", "happy"),
    ("Which carol is famous for “five gold rings”?", "The Twelve Days of Christmas"),
    ("“Away in a manger, no ______ for a bed”", "crib"),
    ("“O Christmas tree, O Christmas tree, how lovely are thy ______”", "branches"),
    ("In “Good King Wenceslas”, the king looks out on the Feast of ______", "Stephen"),
]

def games_carol_quiz():
    items = "".join(
        f'<div class="qitem"><div class="qq"><b>{i+1}.</b> {q}</div><div class="aline"></div></div>'
        for i, (q, a) in enumerate(CAROL_QUIZ))
    answers = upside_answers([a for q, a in CAROL_QUIZ])
    return (f'<div class="page padded"><div class="sheethead"><h1>🎶 The Carol Quiz</h1>'
            f'<p>Finish the famous lines and name the carols. Singing your answer is allowed — and worth absolutely no extra points, but please do it anyway.</p></div>'
            f'{items}'
            f'<div class="pic-answers">ANSWERS: {answers}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

def games_left_right():
    story = """<p>It was Christmas Eve at the Berry house, and everything had gone slightly <span class="lr">LEFT</span>-field. Mum had put the turkey in the oven and immediately left it — no, <span class="lr">LEFT</span> it — while she went <span class="lr">RIGHT</span> back to the shops for the cranberry sauce she had <span class="lr">LEFT</span> on the list.</p>
    <p>“There's no time to lose!” she cried, and drove off — turning <span class="lr">LEFT</span> at the lights, then <span class="lr">RIGHT</span> at the corner shop, which had exactly one jar of cranberry sauce <span class="lr">LEFT</span>. She grabbed it, paid, and hugged the shopkeeper, who was quite surprised but agreed it was the <span class="lr">RIGHT</span> thing to do.</p>
    <p>Back home, Dad was putting the star on the tree. “A little to the <span class="lr">LEFT</span>,” said Gran. “No — <span class="lr">RIGHT</span>,” said Grandad. The star went <span class="lr">LEFT</span>, then <span class="lr">RIGHT</span>, then <span class="lr">LEFT</span> again, until the cat knocked it <span class="lr">RIGHT</span> off the tree and under the sofa, where it stayed until Boxing Day.</p>
    <p>When Mum got back, she put the sauce <span class="lr">RIGHT</span> in the middle of the table. “Everything is under control,” she said, just as the smoke alarm went off. The turkey was fine — mostly — and what was <span class="lr">LEFT</span> of it was declared delicious by everyone, which was exactly the <span class="lr">RIGHT</span> verdict.</p>
    <p>And the moral of the Berry family Christmas is this: it doesn't matter if things go <span class="lr">LEFT</span> or <span class="lr">RIGHT</span> — as long as there's something good <span class="lr">LEFT</span> to share at the end of it.</p>"""
    return (f'<div class="page padded"><div class="sheethead"><h1>🔄 The Left–Right Gift Game</h1>'
            f'<p>Everyone sits in a circle, holding a wrapped gift. One person reads the story aloud. Every time you hear <b style="color:#b91c1c">LEFT</b>, pass your gift to the person on your left; every <b style="color:#b91c1c">RIGHT</b>, pass it right. When the story ends, the gift in your hands is yours to unwrap!</p></div>'
            f'<div class="gprose">{story}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

def games_dice():
    rows_data = [
        ("1", "Take a gift from the pile. If the pile is empty, steal any wrapped gift instead."),
        ("2", "Swap your gift with the player on your left."),
        ("3", "EVERYONE passes their gift to the person on their right. Chaos. Embrace it."),
        ("4", "Steal any unwrapped gift. Its owner takes a fresh one from the pile."),
        ("5", "Unwrap your gift! (No gift? Take one from the pile and unwrap that.)"),
        ("6", "Pick two other players and make them swap gifts with each other."),
    ]
    rows = "".join(f'<tr><td class="die">⚀</td><td>{t}</td></tr>' if False else
                   f'<tr><td class="die">{["⚀","⚁","⚂","⚃","⚄","⚅"][int(n)-1]}</td><td><b>Roll a {n}:</b> {t}</td></tr>' for n, t in rows_data)
    return (f'<div class="page padded"><div class="sheethead"><h1>🎲 The Dice Gift Exchange</h1>'
            f'<p>All you need: one wrapped gift per player, a pile in the middle, and one dice. Fast, loud and gloriously unfair.</p></div>'
            f'<ol class="grules"><li>Everyone brings a wrapped gift (agree a budget first!) and puts it in the middle pile. Sit in a circle.</li>'
            f'<li>Going around the circle, each player takes a gift from the pile — no shaking, squeezing or sniffing. Yet.</li>'
            f'<li>Now roll the dice in turn and follow the table below. Play <b>three full rounds</b>.</li>'
            f'<li>After round three, unwrap everything in front of you. Whatever you are holding is yours!</li></ol>'
            f'<table class="outcomes">{rows}</table>'
            f'<div class="tipbox">🎁 <b>Grown-up in charge?</b> Set a timer for extra drama: when it rings mid-round, the game ends instantly after the current roll — gifts where they lie.</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

def games_white_elephant():
    return (f'<div class="page padded"><div class="sheethead"><h1>🐘 White Elephant — The Rules</h1>'
            f'<p>The classic gift-stealing game. Bring a wrapped gift that is funny, odd or delightful (agree a budget first) — the sillier, the better the game.</p></div>'
            f'<ol class="grules">'
            f'<li><b>Set up.</b> All gifts go in one pile. Count the players and put matching numbered slips in a hat — everyone draws one.</li>'
            f'<li><b>Player 1</b> picks any gift from the pile and unwraps it. Show everyone. Accept the applause.</li>'
            f'<li><b>Each next player</b> may either take a fresh gift from the pile <i>or</i> STEAL an unwrapped gift from someone who went before.</li>'
            f'<li><b>If your gift is stolen,</b> you immediately go again: take from the pile or steal from someone else — but you cannot steal your own gift straight back.</li>'
            f'<li><b>Three-steal freeze:</b> a gift stolen three times in one round is frozen — its holder keeps it for good.</li>'
            f'<li><b>The final twist:</b> after the last player, Player 1 gets one bonus move — keep their gift, or swap it for any unfrozen gift in the room.</li>'
            f'<li>When the swapping settles, whatever you are holding is yours. Treasure it. Display it proudly. Regift it next year (we will not tell).</li></ol>'
            f'<div class="tipbox">🏆 <b>House rules worth agreeing first:</b> the budget, whether gifts should be funny or genuinely nice, and the prize for “most stolen gift” — we suggest the holder chooses the next Christmas film.</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

_bingo_pages = "".join(
    bingo_card(DATA["bingo"]["cards"][i], f"Card {'ABCDEFGHIJ'[i]}") for i in range(10))

GAMES_HTML = (games_trivia() + games_wordsearch() + games_wordsearch_solution()
              + games_pictionary() + games_scramble() + games_categories()
              + games_finish_phrase() + games_carol_quiz()
              + _bingo_pages + bingo_caller()
              + games_left_right() + games_dice() + games_white_elephant())

# ------------------------------------------------------- elf kit + advent + extras
EXTRA_CSS = """
.enotes { display:grid; grid-template-columns:1fr 1fr; gap:3.4mm; }
.enote { height:60mm; border:.32mm dashed #aebbae; border-radius:2.6mm; padding:3.6mm 4.4mm; position:relative; overflow:hidden; }
.enote .eday { position:absolute; top:2.6mm; right:3.2mm; font-size:7pt; letter-spacing:1.2px; color:#b8860b; font-weight:700; }
.enote .ehead { font-size:8pt; letter-spacing:1.6px; color:#991b1b; text-transform:uppercase; font-weight:700; margin-bottom:2.2mm; }
.enote .ebody { font-family:Georgia,'Noto Serif',serif; font-size:10.5pt; line-height:1.55; }
.enote .esign { position:absolute; bottom:3mm; right:4.4mm; font-family:Georgia,'Noto Serif',serif; font-style:italic; font-size:9.5pt; color:#14634a; }
.rrow { display:flex; align-items:center; gap:4mm; margin-bottom:4.6mm; }
.rrow .rlabel { width:44mm; font-size:11pt; font-weight:600; }
.rrow .rstars { font-size:15pt; letter-spacing:3px; color:#b8860b; }
.rrow .rline { flex:1; border-bottom:.32mm dotted #9db09f; height:5mm; }
.adv { display:grid; grid-template-columns:1fr 1fr; gap:3mm; }
.acard { height:81mm; border:.32mm dashed #aebbae; border-radius:3mm; padding:4mm 5mm; position:relative; overflow:hidden; }
.acard .ahead { display:flex; align-items:center; gap:3.4mm; margin-bottom:2.6mm; }
.acard .aday { background:#b91c1c; color:#fff9f0; font-family:Georgia,'Noto Serif',serif; font-weight:700; font-size:15pt; width:12.5mm; height:12.5mm; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.acard .adate { font-size:7.5pt; letter-spacing:1.6px; color:#b8860b; font-weight:700; text-transform:uppercase; }
.acard .aemoji { margin-left:auto; font-size:19pt; }
.acard h3 { font-family:Georgia,'Noto Serif',serif; font-size:13pt; color:#0b3d2e; margin-bottom:1.8mm; }
.acard p { font-size:10pt; line-height:1.55; color:#22302a; }
.acard .adone { position:absolute; bottom:3.4mm; right:4.6mm; font-size:8.5pt; color:#b8860b; font-weight:600; }
.acard.diy h3 { color:#991b1b; }
.acard .rule { border-bottom:.32mm dotted #c4bda8; height:7mm; }
.cert-wrap { text-align:center; padding-top:6mm; }
.cert-wrap h1 { font-family:Georgia,'Noto Serif',serif; font-size:27pt; color:#0b3d2e; }
.cert-name { border-bottom:.5mm solid #b8860b; height:13mm; margin:4mm 14mm 2mm; }
.cert-sigs { display:flex; justify-content:space-between; margin-top:12mm; padding:0 6mm; }
.cert-sigs .sig2 { width:62mm; text-align:center; }
.cert-sigs .sline { border-bottom:.35mm dotted #9db09f; height:8mm; font-family:Georgia,'Noto Serif',serif; font-style:italic; font-size:13pt; color:#991b1b; }
.cert-sigs .slabel { font-size:8pt; letter-spacing:1.6px; color:#5b6b62; text-transform:uppercase; margin-top:1.6mm; }
.seal2 { width:32mm; height:32mm; border-radius:50%; border:.8mm double #b8860b; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#991b1b; background:rgba(253,240,201,.55); margin:7mm auto 0; transform:rotate(-7deg); }
.seal2 b { font-size:10pt; letter-spacing:.6px; } .seal2 span { font-size:7pt; letter-spacing:1.2px; }
.ssq-row { display:flex; align-items:flex-end; gap:3mm; margin-bottom:4.4mm; font-size:10.5pt; }
.ssq-row .lab { font-weight:600; color:#0b3d2e; white-space:nowrap; }
.ssq-row .fill { flex:1; border-bottom:.32mm dotted #9db09f; height:5.4mm; }
.ssq-note { font-size:9pt; color:#5b6b62; font-style:italic; margin:-2mm 0 3.6mm; }
"""

def elf_arrival():
    return f'''<div class="page"><div class="letter">
      <div class="from">✦ North Pole — Elf Department ✦</div>
      <h1>Your Elf Has Arrived!</h1>
      <p style="margin-top:5mm">Dear <span class="blank"></span> family,</p>
      <p>Surprise! I've come all the way from the North Pole — and I brought my best behaviour, my
      pointiest ears and only a <i>little</i> bit of mischief. Santa picked me specially for your family,
      and I'll be staying from today until Christmas Eve, when I fly back to report in person.</p>
      <p>My name is <span class="blank"></span> — though if you'd like to give me a
      magic name of your own, I answer to most things. (Especially silly ones.)</p>
      <p><b>Three very important elf rules:</b></p>
      <p style="line-height:1.7">1. Please don't touch me during the day — cuddles make my magic wobbly.
      (Grown-ups may rescue me with kitchen tongs in a true emergency.)<br>
      2. Talk to me! Tell me everything. I remember it all, and every night I whisper it to Santa.<br>
      3. Kindness is my favourite snack. Feed me often.</p>
      <p>Every morning I'll be hiding somewhere new. Finding me is your first job of the day —
      before breakfast, if you can manage it. Good luck!</p>
      <p style="margin-bottom:1mm">Your new (very small) friend,</p>
      <div class="sig" style="color:#14634a">Your Scout Elf</div>
      <p class="ps">P.S. Official Scout Elf, Badge No. 24. Yes, the badge is tiny. So am I.</p>
      <div class="sheetfoot" style="bottom:-6.5mm">{FOOTER}</div>
    </div></div>'''

def elf_goodbye():
    return f'''<div class="page"><div class="letter">
      <div class="from">✦ North Pole — Elf Department ✦</div>
      <h1>A Goodbye (For Now)</h1>
      <p style="margin-top:5mm">Dear <span class="blank"></span>,</p>
      <p>Well, here we are — Christmas Day! Last night I hitched a ride on the sleigh, helped with
      the deliveries (I held the list; very important job), and now it's time for me to head home
      to the North Pole for a well-earned rest and roughly forty hot chocolates.</p>
      <p>What a December we had. I will never forget the time you</p>
      <div class="rule"></div><div class="rule" style="margin-bottom:4.5mm"></div>
      <p>— and Santa was so proud when I told him about</p>
      <div class="rule"></div><div class="rule" style="margin-bottom:4.5mm"></div>
      <p>You have been officially wonderful. Keep being kind, keep being curious, and keep an eye
      on the Nice List — I have a very good feeling about your name staying right at the top.</p>
      <p>I'll be back on the first of December next year, in a brand-new hiding place. You'll
      never find me. (You probably will. You're annoyingly good at it.)</p>
      <p style="margin-bottom:1mm">All my love and a pocketful of snow,</p>
      <div class="sig" style="color:#14634a">Your Scout Elf</div>
      <p class="ps">P.S. If you find glitter in odd places until about March… that was me. Sorry. (Not sorry.)</p>
      <div class="sheetfoot" style="bottom:-6.5mm">{FOOTER}</div>
    </div></div>'''

ELF_NOTES = [
    "Good morning! I told Santa you were kind yesterday. He did a little happy dance.",
    "Mission of the day: make someone smile before breakfast is over.",
    "Why did the elf sit on the clock? To be ON TIME for Christmas! (Sorry. Elf jokes are like that.)",
    "I counted your good deeds last night. I ran out of fingers AND toes.",
    "Psst — tidy-up race today. Can you beat yesterday's time?",
    "Santa asked me to check on the Nice List situation. My report says: YES, still on it.",
    "I hid an extra smile somewhere in this room. It's yours now — pass it on.",
    "Why do elves make such good listeners? We're all ears. (Pointy ones.)",
    "Mission: draw a picture for someone and leave it where they'll find it.",
    "You shared so nicely yesterday. Even the reindeer were impressed.",
    "Grown-ups work very hard at Christmas. Today's mission: one enormous thank-you.",
    "I tried to wrap myself as a present. The sticky tape won. Send help. (And biscuits.)",
    "Halfway to Christmas! Santa says you're doing brilliantly. I agree with Santa.",
    "Mission: read a story out loud — bonus points for very silly voices.",
    "Your kindness is my favourite thing to report. Please keep it coming.",
    "Why did the snowman call his dog Frost? Because Frost bites! (I'm here all month.)",
    "Mission: help with one Christmas job without being asked first.",
    "I guarded your dreams all night. Verdict: excellent dreams. Five stars.",
    "Not many sleeps to go now — I've lost count. Excitement does that to an elf.",
    "Mission: write down one thing you're thankful for and stick it on the fridge.",
    "Santa polished the sleigh today. Your name got an extra sparkle on the list.",
    "Why are elves such good singers? Perfect pointy pitch. Obviously.",
    "Nearly Christmas Eve! Tomorrow's mission: an early night. Big day coming.",
    "My last note of the year — thank you for the best December ever. See you next year!",
]

def elf_notes_sheet(notes, label):
    cards = ""
    for n, text in notes:
        cards += (f'<div class="enote"><div class="eday">NOTE {n} / 24</div>'
                  f'<div class="ehead">🧝 A note from your elf</div>'
                  f'<div class="ebody">{text}</div>'
                  f'<div class="esign">— your elf</div></div>')
    return (f'<div class="page padded"><div class="sheethead"><h1>🧝 Daily Elf Notes</h1>'
            f'<p>{label} • Cut along the dashed lines. One note per morning, left with the elf — 24 notes, one for every day of the visit.</p></div>'
            f'<div class="enotes">{cards}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

def elf_report():
    rows_data = ["Kindness", "Listening", "Sharing", "A tidy bedroom", "Bedtime behaviour", "Giggles & good cheer"]
    rows = "".join(
        f'<div class="rrow"><span class="rlabel">{label}</span><span class="rstars">☆ ☆ ☆ ☆ ☆</span><span class="rline"></span></div>'
        for label in rows_data)
    return f'''<div class="page padded">
      <div class="qband"><h1>📋 Official Elf Report Card</h1>
      <p>Filled in by your Scout Elf and reported directly to Santa. Colour in the stars!</p></div>
      <div class="qmeta"><span>Child's name</span><span class="fill"></span><span>Reporting elf</span><span class="fill"></span></div>
      {rows}
      <p class="q" style="font-family:Georgia,'Noto Serif',serif;font-size:11.5pt;color:#0b3d2e;margin:5mm 0 1.6mm">Elf's final comments:</p>
      <div class="rule" style="border-bottom:.32mm dotted #c4bda8;height:7.4mm"></div>
      <div class="rule" style="border-bottom:.32mm dotted #c4bda8;height:7.4mm"></div>
      <div class="rule" style="border-bottom:.32mm dotted #c4bda8;height:7.4mm;margin-bottom:6mm"></div>
      <div style="display:flex;align-items:center;gap:8mm">
        <div style="flex:1;font-family:Georgia,'Noto Serif',serif;font-size:13pt">Reported to Santa: <b style="color:#991b1b">YES ✓ — Nice List confirmed</b></div>
        <div class="seal2" style="margin:0"><span>★ NORTH POLE ★</span><b>ELF DEPT</b><span>APPROVED</span></div>
      </div>
      <div class="sheetfoot">{FOOTER}</div></div>'''

ELF_HTML = (elf_arrival() + elf_goodbye()
            + elf_notes_sheet(list(enumerate(ELF_NOTES[0:8], 1)), "Sheet 1 of 3 — notes 1–8")
            + elf_notes_sheet(list(enumerate(ELF_NOTES[8:16], 9)), "Sheet 2 of 3 — notes 9–16")
            + elf_notes_sheet(list(enumerate(ELF_NOTES[16:24], 17)), "Sheet 3 of 3 — notes 17–24")
            + elf_report())

# ------------------------------------------------------------- advent activities
ADVENT = [
    ("🎄", "The countdown begins", "Hang up the Advent calendar, put on the first Christmas song of the year, and tell everyone your Christmas wish — out loud, for luck."),
    ("💌", "Card for a neighbour", "Make a Christmas card for a neighbour or someone on your street, and deliver it by hand (posted through the letterbox counts)."),
    ("☕", "Hot chocolate ceremony", "Hot chocolate with all the toppings you can find, plus a singalong to your family's favourite carol. Marshmallows are not optional."),
    ("❄️", "Snowflake blizzard", "Cut ten paper snowflakes — no two alike — and tape them to one window to make your own indoor blizzard."),
    ("🎁", "The giving box", "Fill a box with toys, books or clothes you've outgrown and give it to a charity shop or a family who'd love it."),
    ("🗣️", "Three languages", "Learn to say “Merry Christmas” in three other languages and teach them to the whole family at dinner."),
    ("🍪", "Biscuit day", "Bake or decorate biscuits together. One must be shaped like a star. One must be eaten immediately, for quality control."),
    ("🔦", "Lights walk", "After dinner, wrap up warm and walk the neighbourhood on a Christmas-lights hunt. Award points for the twinkliest house."),
    ("🧝", "Family of elves", "Draw your whole family as Santa's elves — pointy ears, workshop jobs and all. Give everyone an official elf name."),
    ("✉️", "A thank-you note", "Write a real thank-you note to someone who helps you all year — a teacher, a postie, a grandparent — and send it today."),
    ("🧣", "Blanket-fort cinema", "Build a blanket fort, pick a Christmas story or film, and hold the screening inside. Tickets: one hug each."),
    ("🎶", "Freeze dance", "Christmas songs on, everyone dances; when the music stops, FREEZE. Last one wobbling is out — until the next song."),
    ("💛", "Secret kindness", "Leave a kind note somewhere for someone in your family to find — in a shoe, a pocket or under a pillow."),
    ("🐦", "Feed the birds", "Make simple bird feeders (a pine cone, some peanut butter and seed works beautifully) and hang them where you can watch."),
    ("🎬", "Movie night vote", "Everyone nominates a Christmas film, the family votes, and the winner is watched with popcorn. Losers get to pick the snacks."),
    ("😂", "Invent a joke", "Invent a brand-new Christmas joke and test it at dinner. Groans count as applause. Write the best one down for next year."),
    ("🏷️", "Tag team", "Turn last year's Christmas cards into this year's gift tags — cut out the prettiest pictures and add string or ribbon."),
    ("⭐", "Wish on a star", "Find the brightest star in the evening sky and let everyone make one quiet wish. No telling — wishes are shy."),
    ("🙌", "Wrap star", "Help wrap a present properly — holding the paper, mastering the tape, and signing the tag in your best handwriting."),
    ("📞", "Carol call", "Sing a carol to grandparents or far-away family over the phone or a video call. Costumes encouraged, rehearsal optional."),
    ("🏠", "Gingerbread HQ", "Build a gingerbread house — real biscuits or the cardboard-and-glue edition. Every headquarters needs a biscuit door."),
    ("🎅", "Floor angel", "No snow? No problem. Lie on a rug and make a “floor angel”, or draw one in chalk outside. Photograph the evidence."),
    ("🕯️", "The fancy table", "Set tonight's table like a celebration: candles (grown-ups light them), the good glasses, and everyone's name in place."),
    ("🎁", "Santa's snack squad", "Prepare Santa's snack plate and a note for the reindeer. Then: pyjamas, teeth, bed — an early night is part of the magic."),
    ("🎉", "MERRY CHRISTMAS!", "Today's activity: open presents one at a time, say every thank-you out loud, and soak up the whole day. You did it — Merry Christmas!"),
]

def advent_sheet(cards, label):
    cells = ""
    for day, emoji, title, text in cards:
        cells += (f'<div class="acard"><div class="ahead"><span class="aday">{day}</span>'
                  f'<span class="adate">December</span><span class="aemoji">{emoji}</span></div>'
                  f'<h3>{title}</h3><p>{text}</p><div class="adone">☐ Done it!</div></div>')
    return (f'<div class="page padded"><div class="sheethead"><h1>📅 Advent Activity Cards</h1>'
            f'<p>{label} • Cut along the dashed lines. Draw one card each morning from 1 December — or hide them in an Advent calendar.</p></div>'
            f'<div class="adv">{cells}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

def advent_last_sheet():
    emoji, title, text = ADVENT[24]
    cells = (f'<div class="acard"><div class="ahead"><span class="aday">25</span>'
             f'<span class="adate">December</span><span class="aemoji">{emoji}</span></div>'
             f'<h3>{title}</h3><p>{text}</p><div class="adone">☐ Done it!</div></div>')
    for _ in range(2):
        cells += ('<div class="acard diy"><div class="ahead"><span class="aday" style="background:#14634a">✎</span>'
                  '<span class="adate">Your day</span><span class="aemoji">✨</span></div>'
                  '<h3>Make your own!</h3><div class="rule"></div><div class="rule"></div><div class="rule"></div></div>')
    cells += ('<div class="acard"><div class="ahead"><span class="aemoji" style="margin-left:0">💡</span></div>'
              '<h3>A note for grown-ups</h3><p>Swap any card for an easier day whenever you need to — '
              'the magic is in the drawing of the card, not in completing every mission. Quiet days are Christmas too.</p></div>')
    return advent_sheet_raw(cells, "Sheet 5 of 5 — Christmas Day, plus make-your-own cards")

def advent_sheet_raw(cells, label):
    return (f'<div class="page padded"><div class="sheethead"><h1>📅 Advent Activity Cards</h1>'
            f'<p>{label} • Cut along the dashed lines. Draw one card each morning from 1 December — or hide them in an Advent calendar.</p></div>'
            f'<div class="adv">{cells}</div>'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

_adv_cards = [(i + 1,) + a for i, a in enumerate(ADVENT)]
ADVENT_HTML = ("".join(advent_sheet(_adv_cards[j:j+6], f"Sheet {j//6 + 1} of 5 — December {j + 1}–{j + 6}")
                       for j in range(0, 24, 6))
               + advent_last_sheet())

# ------------------------------------------------------------- nice list certificate
def nice_list_certificate():
    return f'''<div class="page"><div class="letter"><div class="cert-wrap">
      <div class="from">✦ The North Pole • Official Document ✦</div>
      <div style="font-size:24pt;margin:2mm 0">⭐</div>
      <h1>Nice List Certificate</h1>
      <p style="font-size:12.5pt;margin-top:6mm">This is to certify that</p>
      <div class="cert-name"></div>
      <p style="font-size:12.5pt">has been officially placed on</p>
      <p class="serif" style="font-size:17pt;color:#991b1b;font-weight:700;margin:1.5mm 0">Santa's Nice List for Christmas 2026</p>
      <p style="font-size:11.5pt;margin-top:5mm">in recognition of</p>
      <div class="cert-name" style="height:9mm;margin-top:1mm"></div>
      <p style="font-size:10.5pt;color:#5b6b62;margin-top:3mm">Checked twice, stamped once, and recorded in the Great Book of Good Children
      at the North Pole, this December 2026.</p>
      <div class="seal2"><span>★ OFFICIAL ★</span><b>NICE LIST</b><span>CHRISTMAS 2026</span></div>
      <div class="cert-sigs">
        <div class="sig2"><div class="sline">Santa Claus</div><div class="slabel">Father Christmas</div></div>
        <div class="sig2"><div class="sline"></div><div class="slabel">Head Elf, List Department</div></div>
      </div>
      <div class="sheetfoot" style="bottom:-6.5mm">{FOOTER}</div>
    </div></div></div>'''

SANTA_HTML = SANTA_HTML + nice_list_certificate()

# ---------------------------------------------------------- secret santa questionnaire
SSQ_CSS = """
.ssq-sec { font-family:Georgia,'Noto Serif',serif; font-size:12.5pt; color:#991b1b; margin:5mm 0 2.6mm; }
"""

def secret_santa_questionnaire():
    def row(label, flex=1):
        return f'<div class="ssq-row"><span class="lab">{label}</span><span class="fill"></span></div>'
    def rows(label, n):
        out = f'<div class="ssq-row"><span class="lab">{label}</span><span class="fill"></span></div>'
        for _ in range(n - 1):
            out += '<div class="ssq-row"><span class="lab"></span><span class="fill"></span></div>'
        return out
    body = (
        row("My name is")
        + '<div class="ssq-sec">🎁 Things I love</div>'
        + rows("Three gifts I'd be thrilled with (within budget): 1.", 1)
        + row("&nbsp;&nbsp;2.")
        + row("&nbsp;&nbsp;3.")
        + row("Snacks &amp; treats I can't resist:")
        + row("Drinks I enjoy (tea, coffee, hot chocolate…):")
        + row("Hobbies, interests &amp; favourite things:")
        + row("Favourite colours / style:")
        + '<div class="ssq-sec">📏 The practical bits</div>'
        + '<div class="ssq-row"><span class="lab">Sizes (only if you would like clothes or socks):</span><span style="width:26mm" class="fill"></span><span class="lab">shoes</span><span style="width:26mm" class="fill"></span><span class="lab">shirt / top</span></div>'
        + row("Gift cards I'd genuinely love:")
        + '<div class="ssq-sec">🚫 Please avoid</div>'
        + rows("Dislikes, allergies &amp; “please not this”:", 2)
        + '<div class="ssq-sec">💰 The budget</div>'
        + '<div class="ssq-row"><span class="lab">Our swap budget is:</span><span style="width:40mm" class="fill"></span><span style="font-size:9pt;color:#5b6b62">(the organiser fills this in — everyone sticks to it!)</span></div>'
        + row("Anything else, Santa?:")
    )
    return (f'<div class="page padded"><div class="sheethead"><h1>🎅 Secret Santa Questionnaire</h1>'
            f'<p>Shhh! Fill me in honestly, fold me up, and hand me back to the organiser. Your Secret Santa gets the answers — never your name… well, okay, your name. Not who picked you.</p></div>'
            f'{body}'
            f'<div class="sheetfoot">{FOOTER}</div></div>')

GAMES_HTML = GAMES_HTML + secret_santa_questionnaire()

# ------------------------------------------------------------------ pack cover
COVER_CSS = """
.cover { height:100%; background:linear-gradient(180deg,#04150e,#0b3d2e 55%,#14532d); color:#fff9f0; display:flex; flex-direction:column; align-items:center; text-align:center; padding:20mm 18mm 14mm; position:relative; overflow:hidden; }
.cover > * { position:relative; z-index:1; }
.cover > svg { z-index:0; }
.cover h1 { font-family:Georgia,'Noto Serif',serif; font-size:34pt; color:#f0c75e; line-height:1.15; margin:5mm 0 3mm; }
.cover .sub { font-size:12.5pt; max-width:130mm; line-height:1.6; color:#ffedd5; }
.cover .contents { margin-top:11mm; background:rgba(255,249,240,.07); border:.4mm solid rgba(227,179,65,.55); border-radius:4mm; padding:6mm 10mm; text-align:left; font-size:11.5pt; line-height:2.05; }
.cover .tips { margin-top:9mm; font-size:9.5pt; color:rgba(255,249,240,.82); max-width:135mm; line-height:1.65; }
.cover .cfoot { margin-top:auto; font-size:8pt; letter-spacing:.6px; color:rgba(255,249,240,.65); font-weight:600; }
"""

def cover_page():
    scene = (dots(201, 90, 396, 900, "#ffffff", .8, .8, 2.4)
             + dots(202, 50, 396, 500, "#f0c75e", .8, .8, 2, .5))
    return f'''<div class="page"><div class="cover">
      <svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 396 558" preserveAspectRatio="xMidYMid slice">{scene}</svg>
      <div style="position:relative;font-size:30pt">🎄</div>
      <h1>The MerryHub<br>Printable Pack</h1>
      <p class="sub">Christmas cards, gift tags, a quiz, party games, a letter from Santa and table place cards — print at home, cut, fold and be merry.</p>
      <div class="contents">
        💌 &nbsp;12 printable greeting cards<br>
        🏷️ &nbsp;24 gift tags (2 sheets)<br>
        ❓ &nbsp;The Big Christmas Quiz + answer key<br>
        🎲 &nbsp;The Big Games Bundle — 11 games, 23 sheets (incl. 10 bingo cards)<br>
        🎅 &nbsp;Letters to &amp; from Santa + Nice List certificate<br>
        🧝 &nbsp;The Elf Kit — arrival &amp; goodbye letters, 24 elf notes, report card<br>
        📅 &nbsp;25 Advent activity cards<br>
        🍽️ &nbsp;8 table place cards
      </div>
      <p class="tips">Printing tips: use A4 paper or light card. Cards print one per sheet — fold in half for an A5 card with a blank inside for your own words. Tags, bingo caller pieces and place cards have dashed cut guides. Colour is lovely, but every sheet works in greyscale too.</p>
      <div class="cfoot">{FOOTER}</div>
    </div></div>'''

# -------------------------------------------------------------------- assembly
OUT_DIR = os.path.expanduser("~/workspace/your_files/merryhub-printables")
SRC_DIR = os.path.expanduser("~/workspace/christmas-hub/print-src/html")
PUBLIC_SAMPLE = os.path.expanduser("~/workspace/christmas-hub/public/printables/merryhub-printables-sample.pdf")
CHROME = os.path.expanduser("~/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(SRC_DIR, exist_ok=True)
os.makedirs(os.path.dirname(PUBLIC_SAMPLE), exist_ok=True)

SAMPLE_HTML = card_sheet(CARDS[0]) + tags_sheet(range(0, 12), "Free sample sheet — 12 of the pack's 24 tags")

DOCS = {
    "merryhub-christmas-cards": doc("MerryHub — 12 Printable Christmas Cards", CARDS_HTML, CARD_CSS),
    "merryhub-gift-tags": doc("MerryHub — 24 Printable Gift Tags", TAGS_HTML, TAG_CSS),
    "merryhub-quiz-sheets": doc("MerryHub — The Big Christmas Quiz (printable)", QUIZ_HTML, QUIZ_CSS),
    "merryhub-party-games": doc("MerryHub — The Big Games Bundle (11 games + Secret Santa sheet)", GAMES_HTML, GAMES_CSS + GAMES2_CSS + QUIZ_CSS + EXTRA_CSS + SSQ_CSS),
    "merryhub-santa-letters": doc("MerryHub — Letters to & from Santa + Nice List Certificate", SANTA_HTML, SANTA_CSS + EXTRA_CSS),
    "merryhub-elf-kit": doc("MerryHub — The Elf Kit", ELF_HTML, SANTA_CSS + QUIZ_CSS + EXTRA_CSS),
    "merryhub-advent-activity-cards": doc("MerryHub — 25 Advent Activity Cards", ADVENT_HTML, EXTRA_CSS),
    "merryhub-place-cards": doc("MerryHub — Table Place Cards", PLACE_HTML, PLACE_CSS),
    "merryhub-printables-sample": doc("MerryHub — Free Printable Sample", SAMPLE_HTML, CARD_CSS + TAG_CSS),
    "merryhub-printable-pack-full": doc(
        "The MerryHub Printable Pack",
        cover_page() + CARDS_HTML + TAGS_HTML + QUIZ_HTML + GAMES_HTML + SANTA_HTML + ELF_HTML + ADVENT_HTML + PLACE_HTML,
        CARD_CSS + TAG_CSS + QUIZ_CSS + GAMES_CSS + GAMES2_CSS + SANTA_CSS + PLACE_CSS + COVER_CSS + EXTRA_CSS + SSQ_CSS),
}

def pdf_info(path):
    out = subprocess.run(["pdfinfo", path], capture_output=True, text=True).stdout
    pages = size = None
    for line in out.splitlines():
        if line.startswith("Pages:"):
            pages = int(line.split(":")[1])
        if line.startswith("Page size:"):
            size = line.split(":", 1)[1].strip()
    return pages, size

results = {}
for name, html in DOCS.items():
    html_path = os.path.join(SRC_DIR, name + ".html")
    with open(html_path, "w") as f:
        f.write(html)
    pdf_path = os.path.join(OUT_DIR, name + ".pdf")
    r = subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-sandbox",
                        "--no-pdf-header-footer", f"--print-to-pdf={pdf_path}",
                        "file://" + html_path],
                       capture_output=True, text=True, timeout=240)
    if not os.path.exists(pdf_path):
        print(f"FAILED {name}: {r.stderr[-400:]}")
        sys.exit(1)
    pages, size = pdf_info(pdf_path)
    results[name] = (pages, size, os.path.getsize(pdf_path))
    print(f"{name}: {pages} pages, {size}, {os.path.getsize(pdf_path)/1024:.0f} KB")

import shutil
shutil.copyfile(os.path.join(OUT_DIR, "merryhub-printables-sample.pdf"), PUBLIC_SAMPLE)
print("sample copied to public/printables/")
print(json.dumps({k: {"pages": v[0], "size": v[1], "bytes": v[2]} for k, v in results.items()}, indent=1))
