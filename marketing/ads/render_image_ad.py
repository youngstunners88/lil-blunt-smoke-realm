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
    """Fade the bottom of the frame to near-black so text stays legible.

    The ramp reaches full strength partway down the band and holds there,
    rather than easing all the way to the bottom edge. A pure ease meant the
    middle of the band — exactly where the headline sits — was still only
    ~a third opaque, so bright artwork showed straight through the type. The
    hero image is brightest and busiest at the bottom, which is where this
    matters most.
    """
    w, h = img.size
    band = int(h * height_frac)
    # Fraction of the band over which the scrim ramps in; solid below it.
    ramp = 0.42
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for i in range(band):
        t = i / band
        alpha = int(strength * min(1.0, (t / ramp) ** 1.5))
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


def paste_logo(canvas: Image.Image, logo_path: str, base: int) -> None:
    """Drop the circular mascot badge top-centre.

    Game ads live or die on character recognition, so the badge earns its
    place even though the scrim already carries the brand name. The source
    logo is an opaque JPEG with square black corners, so it is masked to a
    circle before compositing.
    """
    logo = Image.open(logo_path).convert("RGB")
    d = max(64, int(base * 0.20))
    logo = logo.resize((d, d), Image.LANCZOS)

    mask = Image.new("L", (d * 4, d * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, d * 4 - 1, d * 4 - 1), fill=255)
    mask = mask.resize((d, d), Image.LANCZOS)   # supersampled = clean edge

    x = (canvas.width - d) // 2
    y = int(base * 0.075)
    canvas.paste(logo, (x, y), mask)


def draw_left(draw, text, font, y, x, fill, line_gap=8):
    """Draw possibly-multiline text left-aligned at x, returning the new y."""
    for line in text.split("\n"):
        bbox = draw.textbbox((0, 0), line, font=font)
        draw.text((x - bbox[0], y - bbox[1]), line, font=font, fill=fill)
        y += (bbox[3] - bbox[1]) + line_gap
    return y


def render_split(src: Image.Image, tw: int, th: int, copy: dict) -> Image.Image:
    """Side-by-side layout for wide targets: art right, copy on a solid panel left.

    Letterboxing portrait art into a 1200x628 card leaves most of the frame as
    blurred filler and still forces the text back on top of the artwork. A
    split spends the width instead of wasting it: the art keeps its own crop,
    and the copy gets a clean ground it never has to fight.
    """
    art_w = int(tw * 0.52)
    canvas = Image.new("RGB", (tw, th), (10, 12, 16))

    art = fit_cover(src, art_w, th, focus_y=0.30)
    canvas.paste(art, (tw - art_w, 0))

    # Feather the art's inner edge into the panel so the seam is not a hard line.
    feather = int(tw * 0.06)
    overlay = Image.new("RGBA", (feather, th), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for i in range(feather):
        od.line([(i, 0), (i, th)], fill=(10, 12, 16, int(255 * (1 - i / feather))))
    region = canvas.crop((tw - art_w, 0, tw - art_w + feather, th)).convert("RGBA")
    canvas.paste(Image.alpha_composite(region, overlay).convert("RGB"), (tw - art_w, 0))

    draw = ImageDraw.Draw(canvas)
    base = th
    f_kicker = load_font(FONT_BOLD, max(13, int(base * 0.035)))
    f_head = load_font(FONT_BOLD, max(26, int(base * 0.088)))
    f_sub = load_font(FONT_REG, max(14, int(base * 0.036)))
    f_cta = load_font(FONT_BOLD, max(18, int(base * 0.052)))

    x = int(tw * 0.055)
    head_lines = copy["headline"].count("\n") + 1
    block_h = (
        f_kicker.size * 1.7
        + f_head.size * 1.22 * head_lines
        + f_sub.size * 2.1
        + f_cta.size * 2.0
    )
    y = int((th - block_h) / 2)

    y = draw_left(draw, copy["kicker"], f_kicker, y, x, GOLD,
                  line_gap=int(f_kicker.size * 0.7))
    y += int(f_kicker.size * 0.55)
    y = draw_left(draw, copy["headline"], f_head, y, x, WHITE,
                  line_gap=int(f_head.size * 0.24))
    y += int(f_head.size * 0.34)
    y = draw_left(draw, copy["sub"], f_sub, y, x, MUTED,
                  line_gap=int(f_sub.size * 0.4))
    y += int(f_sub.size * 0.9)

    cta = copy["cta"]
    bbox = draw.textbbox((0, 0), cta, font=f_cta)
    cw, ch = bbox[2] - bbox[0], bbox[3] - bbox[1]
    px, py = int(f_cta.size * 0.8), int(f_cta.size * 0.45)
    bw, bh = cw + px * 2, ch + py * 2
    draw.rounded_rectangle([x, y, x + bw, y + bh], radius=bh / 2, fill=GREEN)
    draw.text((x + px - bbox[0], y + py - bbox[1]), cta, font=f_cta, fill=(10, 14, 8))

    return canvas


def render(src: Image.Image, size_name: str, tw: int, th: int, copy: dict,
           logo_path: str | None = None) -> Image.Image:
    src_ratio = src.width / src.height
    tgt_ratio = tw / th
    # A landscape target from portrait art loses too much to a crop, and
    # letterboxing wastes the width — split the frame instead.
    if tgt_ratio > src_ratio * 1.15:
        return render_split(src, tw, th, copy)
    else:
        canvas = fit_cover(src, tw, th)
        scrim_frac = 0.46 if th >= tw else 0.52

    canvas = add_scrim(canvas, scrim_frac)

    base_for_logo = min(tw, th)
    if logo_path:
        paste_logo(canvas, logo_path, base_for_logo)

    draw = ImageDraw.Draw(canvas)

    # Type scale keyed off the short edge so every size reads the same.
    base = min(tw, th)
    f_kicker = load_font(FONT_BOLD, max(14, int(base * 0.028)))
    f_head = load_font(FONT_BOLD, max(28, int(base * 0.072)))
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
    ap.add_argument("--logo", default=None,
                    help="Optional mascot badge composited top-centre")
    args = ap.parse_args()

    src = Image.open(args.source).convert("RGB")
    print(f"source: {args.source}  {src.width}x{src.height}")

    variants = VARIANTS if args.variant == "all" else {args.variant: VARIANTS[args.variant]}

    for vname, copy in variants.items():
        vdir = Path(args.outdir) / vname
        vdir.mkdir(parents=True, exist_ok=True)
        for size_name, (tw, th) in SIZES.items():
            img = render(src, size_name, tw, th, copy, logo_path=args.logo)
            out = vdir / f"lilblunt-{vname}-{size_name}.jpg"
            img.save(out, "JPEG", quality=90, optimize=True, progressive=True)
            print(f"  wrote {out}  ({os.path.getsize(out)//1024} KB)")


if __name__ == "__main__":
    main()
