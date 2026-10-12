#!/usr/bin/env python3
"""Sweep every location a canonical link lives, for forbidden (old) forms. Read-only, dependency-free.

  python3 marketing/aeo/link_sweep.py

Locations: tracked repo files, every live page in the CRAWLER view (Googlebot UA, plain URL, what
search and AI crawlers see), the live homepage in the APP view plus its JS bundle (browser UA,
random cache-buster), owned sites on disk, and the live itch page. The Caffeine draft source and
founder-only surfaces cannot be read here; they are printed as UNCHECKED, never as clean.
Exit code = number of hits. LIVE hits are the ones that matter to visitors.
"""
import json
import random
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CFG = json.loads((Path(__file__).parent / "canonical_links.json").read_text())
SITE = "https://www.smokegame.win"
CRAWLER = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
BROWSER = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
PATTERNS = [(l["id"], re.compile(p)) for l in CFG["links"] for p in l["forbidden_regex"]]


def get(url, ua):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": ua}), timeout=40) as r:
            return r.read().decode(errors="replace")
    except Exception:  # noqa: BLE001
        return None


def hits_in(text):
    out = []
    for lid, rx in PATTERNS:
        for m in rx.finditer(text):
            line = text.count("\n", 0, m.start()) + 1
            out.append((lid, line, text[max(0, m.start() - 30): m.end() + 20].replace("\n", " ")))
    return out


report = []  # (area, where, [hits] or None)


def record(area, where, text):
    report.append((area, where, None if text is None else hits_in(text)))


# 1. repo
allow = tuple(CFG["allow_paths"])
tracked = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True, text=True).stdout.split("\n")
for f in tracked:
    if not f or f.startswith(("src/frontend/dist/", "frontend/", "node_modules/")) or f.startswith(allow):
        continue
    p = ROOT / f
    if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".mp4", ".webm", ".mp3", ".wasm", ".ico", ".pdf", ".woff", ".woff2", ".lock"}:
        continue
    try:
        record("repo", f, p.read_text(errors="replace"))
    except OSError:
        pass

# 2. live, crawler view
for path in CFG["live_pages"]:
    record("LIVE crawler view", f"/{path}", get(f"{SITE}/{path}", CRAWLER))

# 3. live, app view: homepage + bundle
home = get(f"{SITE}/?cb={random.randrange(10**9)}", BROWSER)
record("LIVE app view", "/ (browser UA)", home)
m = re.search(r'src="(/assets/index-[^"]+\.js)"', home or "")
record("LIVE app view", m.group(1) if m else "JS bundle (not found)", get(SITE + m.group(1), BROWSER) if m else None)

# 4. owned sites and itch
for f in CFG["owned_files"]:
    record("owned site", f, Path(f).read_text(errors="replace") if Path(f).exists() else None)
itch = next(l["canonical"] for l in CFG["links"] if l["id"] == "itch")
record("third party", itch + " (itch page, browser UA)", get(itch, BROWSER))

# report
total = 0
live = 0
print("\n  LINK SWEEP\n")
for area, where, hits in report:
    if hits is None:
        print(f"  UNCHECKED  {area:<18} {where}")
    elif hits:
        total += len(hits)
        live += len(hits) if area.startswith("LIVE") else 0
        for lid, line, ctx in hits[:3]:
            print(f"  HIT        {area:<18} {where}:{line}  [{lid}] ...{ctx}...")
by = {}
for area, _, hits in report:
    by.setdefault(area, [0, 0])[0] += 1
    by[area][1] += len(hits or [])
print()
for a, (n, h) in by.items():
    print(f"  {a:<18} {n} locations, {h} hits")
print("  Caffeine draft source   UNCHECKED  (ask Caffeine for a read-only grep; see caffeine-dispatch)")
print("  LinkedIn / X / Facebook UNCHECKED  (login-walled; founder pastes text)")
print(f"\n  {total} hits total, {live} of them LIVE (visible to visitors and crawlers right now)\n")
sys.exit(total)
