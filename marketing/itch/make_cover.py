#!/usr/bin/env python3
"""
Build the itch.io cover image (630x500) from the hero art.

itch.io shows this thumbnail in every browse listing, search result, embed card
and collection. Without one the game is visually absent from the store, which
is why `audit.py` treats it as blocking rather than cosmetic.

630x500 is itch's stated size. The hero art is a tall portrait (1122x1402), so
it cannot simply be scaled — it is cropped to the upper-middle where the
character sits, then the title is laid over a scrim so it stays readable at the
small sizes the thumbnail actually renders at.

    python3 marketing/itch/make_cover.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SRC = Path("marketing/ads/source/hero.png")
OUT = Path("marketing/itch/out/cover-630x500.png")

W, H = 630, 500
GREEN = (182, 255, 107)
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

TITLE = "LIL BLUNT"
SUB = "THE SMOKE REALM"
TAG = "FREE  ·  NO DOWNLOAD"


def cover_crop(im: Image.Image, w: int, h: int) -> Image.Image:
    """Fill w x h, biased upward so the character's head is not cut off."""
    scale = max(w / im.width, h / im.height)
    new = im.resize((round(im.width * scale), round(im.height * scale)),
                    Image.LANCZOS)
    left = (new.width - w) // 2
    # 18% down rather than centred: centring a tall portrait crops the face.
    top = min(max(0, int(new.height * 0.18)), new.height - h)
    return new.crop((left, top, left + w, top + h))


def main() -> int:
    if not SRC.exists():
        print(f"missing {SRC}")
        return 1
    img = cover_crop(Image.open(SRC).convert("RGB"), W, H)

    # Bottom scrim so the title reads regardless of what the art does there.
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(scrim)
    band = int(H * 0.46)
    for i in range(band):
        y = H - band + i
        # Ease in, then hold solid, so text never sits on a bright patch.
        a = int(235 * min(1.0, (i / band) / 0.55) ** 1.6)
        d.line([(0, y), (W, y)], fill=(8, 10, 14, a))
    img = Image.alpha_composite(img.convert("RGBA"), scrim).convert("RGB")

    d = ImageDraw.Draw(img)
    f_title = ImageFont.truetype(FONT_BOLD, 62)
    f_sub = ImageFont.truetype(FONT_BOLD, 34)
    f_tag = ImageFont.truetype(FONT_BOLD, 21)

    def centred(text, font, y, fill):
        w = d.textbbox((0, 0), text, font=font)[2]
        d.text(((W - w) / 2, y), text, font=font, fill=fill)

    centred(TITLE, f_title, H - 178, (255, 255, 255))
    centred(SUB, f_sub, H - 112, (255, 255, 255))
    centred(TAG, f_tag, H - 58, GREEN)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    kb = OUT.stat().st_size // 1024
    print(f"wrote {OUT}  {img.size[0]}x{img.size[1]}  {kb} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
