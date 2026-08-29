#!/usr/bin/env python3
"""
Classify a draft page as documentation-grade or spam-grade, using compression.

From Dan Petrovic on the Ahrefs podcast: you can separate good writing from
blog-network filler with no model and no training, using gzip alone. The idea
is Shannon's. If a candidate text is drawn from the same distribution as a
reference corpus, appending it to that corpus compresses better than appending
it to an unrelated one — the compressor has already seen the patterns.

Why it matters here: the plan is to publish documentation-style pages because
those are what answer engines now cite. Pages that read as generated filler are
exactly what the index filters out, and no amount of schema markup rescues
them. This is the cheap gate to run before publishing, not after.

    python3 marketing/aeo/quality_gate.py --init          # build corpora
    python3 marketing/aeo/quality_gate.py draft.md
    python3 marketing/aeo/quality_gate.py --all content/

Normalized compression distance (NCD), per Cilibrasi & Vitanyi:

    NCD(x,y) = (C(xy) - min(C(x),C(y))) / max(C(x),C(y))

Lower means closer. The verdict is the corpus with the lower NCD, and the gap
between the two is the confidence. A narrow gap means the text is genuinely
ambiguous — treat that as a fail, not a pass.
"""

from __future__ import annotations

import argparse
import gzip
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CORPUS = HERE / "corpus"

# A gap this small means the two references pull about equally, which in
# practice means the text has neither the specificity of real documentation
# nor the tells of filler. Not good enough to publish.
AMBIGUOUS = 0.02


def C(b: bytes) -> int:
    """Compressed size. mtime=0 keeps the result reproducible across runs."""
    return len(gzip.compress(b, compresslevel=9, mtime=0))


def ncd(x: bytes, y: bytes) -> float:
    cx, cy = C(x), C(y)
    return (C(x + y) - min(cx, cy)) / max(cx, cy)


def normalize(text: str) -> bytes:
    """Strip markup and collapse whitespace so structure does not dominate.

    Without this the classifier mostly measures how much HTML or markdown
    punctuation a file contains, which has nothing to do with writing quality.
    """
    # Drop style and script bodies first. Tag-stripping alone leaves inline CSS
    # and JS as text, and on a page with a large <style> block the classifier
    # ends up compressing stylesheet rules instead of prose.
    text = re.sub(r"<(style|script)\b[^>]*>.*?</\1>", " ", text,
                  flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[#*`_>\[\]()|-]+", " ", text)
    return re.sub(r"\s+", " ", text).strip().lower().encode()


def classify(text: str, good: bytes, spam: bytes) -> dict:
    x = normalize(text)
    if len(x) < 200:
        return {"verdict": "too-short", "note": "under 200 chars after cleaning"}
    d_good, d_spam = ncd(x, good), ncd(x, spam)
    gap = abs(d_good - d_spam)
    if gap < AMBIGUOUS:
        verdict = "ambiguous"
    else:
        verdict = "documentation" if d_good < d_spam else "filler"
    return {"verdict": verdict, "ncd_good": d_good, "ncd_spam": d_spam, "gap": gap}


def load_corpus(name: str) -> bytes:
    d = CORPUS / name
    if not d.exists():
        print(f"Missing corpus {d}. Run --init first.", file=sys.stderr)
        raise SystemExit(1)
    blob = b" ".join(normalize(p.read_text(errors="replace"))
                     for p in sorted(d.glob("*.txt")))
    if len(blob) < 2000:
        print(f"Corpus {name} is only {len(blob)} bytes — too small to "
              f"classify against. Add more samples.", file=sys.stderr)
        raise SystemExit(1)
    return blob


def cmd_init() -> int:
    """Seed both corpora with samples that characterise each class.

    These are deliberately written by hand rather than scraped: the point is to
    encode what *this project* means by documentation-grade — specific,
    verifiable, procedural — versus the promotional filler that answer engines
    now discard.
    """
    good = {
        "controls.txt": (
            "Movement is bound to A and D. W or Space jumps. J attacks and K "
            "dashes. Arrow keys are not bound; pressing them does nothing, "
            "which is the most common reason a first-time player reports that "
            "the character will not move. The dash has a cooldown of roughly "
            "one second and cannot be chained. Attacking while airborne is "
            "permitted and does not cancel jump momentum. There is no remap "
            "screen in the current build."),
        "requirements.txt": (
            "The game is a Godot 4.3 project exported to HTML5 and requires "
            "WebGL2 and SharedArrayBuffer. The page must be served with "
            "Cross-Origin-Opener-Policy same-origin and "
            "Cross-Origin-Embedder-Policy require-corp, or the engine will "
            "fail to start and the canvas stays black. Desktop Chrome, "
            "Firefox and Safari all satisfy this. No wallet, extension, "
            "account or download is required to play."),
        "scoring.txt": (
            "Score accrues from collected pickups and defeated enemies. "
            "Diamonds are worth more than coins. A combo multiplier builds "
            "while hits land without an intervening miss and resets when the "
            "player takes damage. Blaze Mode charges as a percentage shown in "
            "the HUD and becomes available at one hundred percent. Scores are "
            "kept in the browser session and are not written to a chain or to "
            "a public leaderboard."),
        "troubleshooting.txt": (
            "If the canvas stays black, check the browser console for a "
            "SharedArrayBuffer error, which indicates the required headers are "
            "missing. If audio does not start, most browsers block autoplay "
            "until the page receives a user gesture; clicking anywhere starts "
            "it. If the frame rate is low, a software renderer is likely in "
            "use because hardware acceleration is disabled in browser "
            "settings. Reloading with a hard refresh clears a partially "
            "cached build."),
    }
    spam = {
        "hype1.txt": (
            "Are you ready to experience the ultimate gaming revolution? Look "
            "no further! This incredible game is taking the world by storm and "
            "you absolutely will not believe what happens next. Join millions "
            "of players today and discover why everyone is talking about this "
            "amazing must-play title. Do not miss out on the hottest new "
            "experience of the year. Click now to unlock unlimited fun and "
            "endless excitement!"),
        "hype2.txt": (
            "In today's fast-paced digital world, gaming has become more "
            "important than ever before. Whether you are a casual player or a "
            "hardcore enthusiast, there is something here for everyone. Our "
            "team has worked tirelessly to bring you the very best experience "
            "possible. We believe that gaming should be accessible, "
            "enjoyable, and rewarding for all. That is why we are proud to "
            "present this groundbreaking new title to players everywhere."),
        "seospam.txt": (
            "Best free online games. Play free online games now. Free browser "
            "games no download. Top free games online browser. Looking for "
            "free online games? We have the best free online games available "
            "right now. Our free online games collection features the top "
            "free browser games. Play the best free online browser games with "
            "no download required. Free games online browser play now."),
        "generic.txt": (
            "Welcome to our website. We are passionate about delivering "
            "quality experiences to our valued users. Our mission is to "
            "provide innovative solutions that meet the evolving needs of our "
            "community. With years of dedication and a commitment to "
            "excellence, we strive to exceed expectations at every turn. "
            "Thank you for visiting and we look forward to serving you."),
    }
    for name, files in (("good", good), ("spam", spam)):
        d = CORPUS / name
        d.mkdir(parents=True, exist_ok=True)
        for fn, body in files.items():
            (d / fn).write_text(body + "\n")
        print(f"  seeded {d} with {len(files)} samples")
    print("\nThese seeds are a starting point. The classifier sharpens as you\n"
          "add real samples — drop cited competitor pages into corpus/good/\n"
          "and content-farm pages into corpus/spam/ as .txt files.")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("path", nargs="?", help="File to classify")
    ap.add_argument("--init", action="store_true", help="Seed the corpora")
    ap.add_argument("--all", help="Classify every .md/.txt/.html under a dir")
    args = ap.parse_args()

    if args.init:
        return cmd_init()
    if not args.path and not args.all:
        ap.print_help()
        return 1

    good, spam = load_corpus("good"), load_corpus("spam")

    targets = []
    if args.all:
        for ext in ("*.md", "*.txt", "*.html"):
            targets += sorted(Path(args.all).rglob(ext))
    else:
        targets = [Path(args.path)]

    worst = 0
    print(f"\n  {'verdict':<15}{'NCD good':>10}{'NCD spam':>10}{'gap':>8}  file")
    print("  " + "-" * 62)
    for t in targets:
        r = classify(t.read_text(errors="replace"), good, spam)
        if r["verdict"] in ("filler", "ambiguous"):
            worst = 1
        if "ncd_good" in r:
            print(f"  {r['verdict']:<15}{r['ncd_good']:>10.4f}"
                  f"{r['ncd_spam']:>10.4f}{r['gap']:>8.4f}  {t}")
        else:
            print(f"  {r['verdict']:<15}{'':>28}  {t}  ({r['note']})")
    print()
    # Non-zero exit so this can gate a publish step in a script.
    return worst


if __name__ == "__main__":
    raise SystemExit(main())
