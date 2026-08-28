#!/usr/bin/env python3
"""
Render platform-sized image ads for Lil Blunt: The Smoke Realm.

Takes one rich hero image and produces every ad size a campaign needs, with a
readable text lockup burned in. The hero art is busy and detailed, so text
never floats directly on it: each variant gets a bottom scrim that fades from
transparent into near-black, and the copy sits inside that band.

Portrait sources cropped to landscape would decapitate the character, so
landscape targets instead letterbox the full image over a blurred, darkened
copy of itself — nothing is lost and the frame still fills.

Usage:
    python3 render_image_ad.py --source path/to/hero.png [--variant a|b|c|all]

Outputs into marketing/ads/out/<variant>/.
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# Brand palette — pulled from the site's own tokens so ads match the product.
GREEN = (182, 255, 107)      # --realm-smoke, the CTA accent
GOLD = (240, 199, 94)        # --realm-gold, used for the price/luxury note
WHITE = (255, 255, 255)
MUTED = (222, 222, 222)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# Ad sizes that matter for a $10 test. Reddit and X take the landscape link
# card; Pinterest is natively 2:3; 4:5 and 1:1 cover feed placements.
SIZES = {
    "feed-4x5": (1080, 1350),
    "square-1x1": (1080, 1080),
    "link-1200x628": (1200, 628),
    "pinterest-2x3": (1000, 1500),
    "story-9x16": (1080, 1920),
}

# Three copy angles to test against each other. Every line is accuracy-safe:
# the game is genuinely free, genuinely needs no wallet or download, and none
# of these promise tokens, airdrops, or earnings.
VARIANTS = {
    "a": {
        "kicker": "FREE BROWSER GAME",
        "headline": "THEY TRIED TO\nTAX THE VIBE",
        "sub": "No wallet. No download. Just play.",
        "cta": "smokegame.win",
    },
    "b": {
        "kicker": "PLAY FREE IN YOUR BROWSER",
        "headline": "OUTRUN THE\nTAX MAN",
        "sub": "Wild West platformer. No wallet needed.",
        "cta": "smokegame.win",
    },
    "c": {
        "kicker": "NO WALLET. NO DOWNLOAD.",
        "headline": "THE SMOKE\nREALM IS OPEN",
        "sub": "Free 2D Wild West platformer.",
        "cta": "smokegame.win",
    },
}


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def fit_cover(img: Image.Image, tw: int, th: int, focus_y: float = 0.42) -> Image.Image:
    """Scale to cover the target box and crop, biased toward `focus_y`.

    The character's face and the two product bags sit in the upper-middle of
    the hero art, so a centred crop shaves the interesting part off the top.
    focus_y < 0.5 keeps that region in frame.
    """
    sw, sh = img.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(round(sw * scale)), int(round(sh * scale))
    resized = img.resize((nw, nh), Image.LANCZOS)

    left = (nw - tw) // 2
    top = int((nh - th) * focus_y)
    top = max(0, min(top, nh - th))
    return resized.crop((left, top, left + tw, top + th))


def fit_contain_blur(img: Image.Image, tw: int, th: int) -> Image.Image:
    """Letterbox over a blurred fill, for targets wider than the source."""
    bg = fit_cover(img, tw, th, focus_y=0.5)
    bg = bg.filter(ImageFilter.GaussianBlur(28))
    bg = Image.blend(bg, Image.new("RGB", (tw, th), (8, 10, 14)), 0.45)

    sw, sh = img.size
    scale = min(tw / sw, th / sh)
    nw, nh = int(round(sw * scale)), int(round(sh * scale))
    fg = img.resize((nw, nh), Image.LANCZOS)
    bg.paste(fg, ((tw - nw) // 2, (th - nh) // 2))
    return bg


def add_scrim(img: Image.Image, height_frac: float, strength: int = 250) -> Image.Image:
    """Fade the bottom of the frame to near-black so text stays legible."""
    w, h = img.size
    band = int(h * height_frac)
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for i in range(band):
        # Ease-in so the top of the scrim melts into the art instead of
        # showing a hard edge.
        t = i / band
        alpha = int(strength * (t ** 1.6))
        draw.line([(0, h - band + i), (w, h - band + i)], fill=(4, 6, 10, alpha))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def draw_centered(draw, text, font, y, w, fill, line_gap=8):
    """Draw possibly-multiline text centred on x, returning the new y."""
    for line in text.split("\n"):
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text(
            ((w - tw) / 2 - bbox[0], y - bbox[1]),
            line,
            font=font,
            fill=fill,
        )
        y += th + line_gap
    return y


def render(src: Image.Image, size_name: str, tw: int, th: int, copy: dict) -> Image.Image:
    src_ratio = src.width / src.height
    tgt_ratio = tw / th
    # A landscape target from portrait art loses too much to a crop.
    if tgt_ratio > src_ratio * 1.15:
        canvas = fit_contain_blur(src, tw, th)
        scrim_frac = 0.46
    else:
        canvas = fit_cover(src, tw, th)
        scrim_frac = 0.40 if th >= tw else 0.50

    canvas = add_scrim(canvas, scrim_frac)
    draw = ImageDraw.Draw(canvas)

    # Type scale keyed off the short edge so every size reads the same.
    base = min(tw, th)
    f_kicker = load_font(FONT_BOLD, max(14, int(base * 0.028)))
    f_head = load_font(FONT_BOLD, max(30, int(base * 0.082)))
    f_sub = load_font(FONT_REG, max(15, int(base * 0.031)))
    f_cta = load_font(FONT_BOLD, max(20, int(base * 0.046)))

    # Lay the block out from the bottom up so the CTA always clears the edge.
    pad = int(base * 0.055)
    head_lines = copy["headline"].count("\n") + 1
    block_h = (
        f_kicker.size * 1.5
        + f_head.size * 1.20 * head_lines
        + f_sub.size * 1.9
        + f_cta.size * 1.9
    )
    y = th - pad - block_h

    y = draw_centered(draw, copy["kicker"], f_kicker, y, tw, GOLD,
                      line_gap=int(f_kicker.size * 0.75))
    y += int(f_kicker.size * 0.5)
    y = draw_centered(draw, copy["headline"], f_head, y, tw, WHITE,
                      line_gap=int(f_head.size * 0.22))
    y += int(f_head.size * 0.30)
    y = draw_centered(draw, copy["sub"], f_sub, y, tw, MUTED,
                      line_gap=int(f_sub.size * 0.4))
    y += int(f_sub.size * 0.85)

    # CTA gets a filled pill — the one element allowed to look like a button.
    cta = copy["cta"]
    bbox = draw.textbbox((0, 0), cta, font=f_cta)
    cw, ch = bbox[2] - bbox[0], bbox[3] - bbox[1]
    px, py = int(f_cta.size * 0.85), int(f_cta.size * 0.48)
    bw, bh = cw + px * 2, ch + py * 2
    bx, by = (tw - bw) / 2, y
    radius = bh / 2
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=radius, fill=GREEN)
    draw.text((bx + px - bbox[0], by + py - bbox[1]), cta, font=f_cta, fill=(10, 14, 8))

    return canvas


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True, help="Path to the hero image")
    ap.add_argument("--variant", default="all", choices=["a", "b", "c", "all"])
    ap.add_argument("--outdir", default=str(Path(__file__).parent / "out"))
    args = ap.parse_args()

    src = Image.open(args.source).convert("RGB")
    print(f"source: {args.source}  {src.width}x{src.height}")

    variants = VARIANTS if args.variant == "all" else {args.variant: VARIANTS[args.variant]}

    for vname, copy in variants.items():
        vdir = Path(args.outdir) / vname
        vdir.mkdir(parents=True, exist_ok=True)
        for size_name, (tw, th) in SIZES.items():
            img = render(src, size_name, tw, th, copy)
            out = vdir / f"lilblunt-{vname}-{size_name}.jpg"
            img.save(out, "JPEG", quality=90, optimize=True, progressive=True)
            print(f"  wrote {out}  ({os.path.getsize(out)//1024} KB)")


if __name__ == "__main__":
    main()
