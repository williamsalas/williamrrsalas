#!/usr/bin/env python3
# make_favicons_sfmono_bold.py
# Monogram PNGs/ICO with SF Mono Bold (or Menlo Bold) + micro-stroke for crisp 16 px

# run this script via:
# python3 make_favicons_sfmono_bold.py --text "WS" --bg "#000000" --fg "#FFFFFF" --out .

import argparse, os, glob
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BG_DEFAULT = "#000000"
FG_DEFAULT = "#FFFFFF"

def find_font_paths():
    # Try SF Mono Bold first (various macOS locations), then Menlo Bold in the TTC
    candidates = []
    # SF Mono Bold OTFs
    candidates += glob.glob("/System/Library/Fonts/*SFMono*Bold*.otf")
    candidates += glob.glob("/System/Library/Fonts/*SF-Mono*Bold*.otf")
    candidates += glob.glob("/Library/Fonts/*SF*Mono*Bold*.otf")
    candidates += glob.glob("/System/Library/Fonts/*SFNSMono*Bold*.otf")
    # Menlo (TTC); bold is usually face index 2, but try a few
    menlo_ttc = [p for p in ["/System/Library/Fonts/Menlo.ttc", "/Library/Fonts/Menlo.ttc"] if os.path.exists(p)]
    return candidates, menlo_ttc

def load_bold_font(size_px: int) -> ImageFont.FreeTypeFont:
    sf_bold_paths, menlo_ttc = find_font_paths()
    # Prefer SF Mono Bold OTF
    for p in sf_bold_paths:
        try:
            return ImageFont.truetype(p, size=size_px)
        except Exception:
            pass
    # Try Menlo TTC with bold indices
    for p in menlo_ttc:
        for idx in (2, 3, 1, 0):  # common order: 0=Regular, 1=Italic, 2=Bold, 3=Bold Italic
            try:
                return ImageFont.truetype(p, size=size_px, index=idx)
            except Exception:
                continue
    # Fallback to a generic monospace (DejaVu Mono)
    try:
        return ImageFont.truetype("DejaVuSansMono.ttf", size=size_px)
    except Exception:
        return ImageFont.load_default()

def draw_monogram(text: str, size_px: int, bg: str, fg: str) -> Image.Image:
    img = Image.new("RGBA", (size_px, size_px), bg)
    d = ImageDraw.Draw(img)

    # Target ~83% of width so the letters read at 16 px
    target_w = int(size_px * 0.83)
    font_sz = int(size_px * 0.66)

    # Fit iteratively
    for _ in range(25):
        f = load_bold_font(font_sz)
        bbox = d.textbbox((0,0), text, font=f, anchor="lt")
        w = bbox[2] - bbox[0]
        if w > target_w: font_sz -= max(1, font_sz//18)
        else:            font_sz += max(1, font_sz//40)
        if abs(w - target_w) <= max(2, size_px//60): break
    f = load_bold_font(font_sz)

    # Final bbox + optical centering
    bbox = d.textbbox((0,0), text, font=f, anchor="lt")
    w, h = bbox[2]-bbox[0], bbox[3]-bbox[1]
    x = (size_px - w)//2 - bbox[0]
    y = (size_px - h)//2 - bbox[1]  # anchor to visual middle

    # Micro-stroke to fatten stems (same color as glyphs)
    stroke = max(1, size_px // 64)       # ~8 px at 512, scales to ~0.25 px at 16
    d.text((x, y), text, font=f, fill=fg, stroke_width=stroke, stroke_fill=fg)

    return img

def save_ico_from_pngs(png_paths, ico_path):
    base = Image.open(png_paths[-1]).convert("RGBA")
    base.save(ico_path, format="ICO", sizes=[(16,16),(32,32),(48,48)])

def write_safari_pinned_tab_svg(text: str, out_path: Path):
    """
    Create a mask-style SVG for Safari pinned tabs.
    Black fill becomes the visible area; color is set by the
    <link rel="mask-icon" color="#xxxxxx"> tag in HTML.
    """
    view = 512
    # Target ~83% of width, like PNGs; use textLength/lengthAdjust to fit without font metrics.
    target_w = int(view * 0.83)
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view} {view}">
  <title>Safari Pinned Tab</title>
  <text x="{view//2}" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="SF Mono, Menlo, monospace" font-weight="700"
        font-size="400" lengthAdjust="spacingAndGlyphs" textLength="{target_w}"
        fill="#000">{text}</text>
</svg>"""
    out_path.write_text(svg, encoding="utf-8")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", default="WS")
    ap.add_argument("--bg", default=BG_DEFAULT)
    ap.add_argument("--fg", default=FG_DEFAULT)
    ap.add_argument("--out", default=".")
    args = ap.parse_args()

    out = Path(args.out); out.mkdir(parents=True, exist_ok=True)

    # Apple touch (render big then downsample to 180)
    big = draw_monogram(args.text, 512, args.bg, args.fg).resize((180,180), Image.LANCZOS)
    big.save(out / "apple-touch-icon.png")

    # Safari pinned tab (mask SVG)
    safari_svg = out / "safari-pinned-tab.svg"
    write_safari_pinned_tab_svg(args.text, safari_svg)

    # Favicons
    pngs = []
    for s in (16, 32, 48):
        img = draw_monogram(args.text, 512, args.bg, args.fg).resize((s, s), Image.LANCZOS)
        p = out / f"favicon-{s}.png"; img.save(p); pngs.append(p)

    save_ico_from_pngs([str(p) for p in pngs], out / "favicon.ico")
    print("Wrote:", out/"apple-touch-icon.png", safari_svg, *pngs, out/"favicon.ico")

if __name__ == "__main__":
    main()

