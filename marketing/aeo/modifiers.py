#!/usr/bin/env python3
"""
Modifier coverage: which query variants a page could plausibly match, and
which it would actually satisfy.

The mechanic this implements is real and well-documented in practice: a page
starts ranking for terms it does not contain, because links and mentions teach
the engine that "audio" also means "mp3", that the thing is "free", that it is
a "tool". The operator then reads those emerging queries and adds them.

This is the half of that loop that needs no traffic data. It asks, for a list
of modifiers a real person would type:

  PRESENT    does the literal string appear?            (grep — deterministic)
  SATISFIED  would this page actually answer that        (Jev — judgement)
             person's query if they landed here?

The second column is the one that matters, and it is why this is not keyword
stuffing. "unblocked" is not a word to sprinkle — it means "works on a school
or office network". A page can contain the word and not satisfy the intent, or
satisfy the intent and never use the word. Both gaps are actionable and they
are different repairs:

  present, not satisfied   the word is decoration; the page makes a promise
                           it does not keep. Worst case — fix or remove.
  satisfied, not present   the page answers it but never says the word a
                           searcher types. Cheapest possible win.
  neither                  a genuine content gap, if the intent is relevant.
  both                     done.

    python3 marketing/aeo/modifiers.py --page src/frontend/public/about/index.html
    python3 marketing/aeo/modifiers.py --page FILE --quick    # grep only, no cost

Honest limit: this measures whether a page COULD match a query. It does not
measure whether anyone searches it, or whether we rank. Search volume here is
0-70/month and the site has zero referring domains, so treat a filled-in grid
as necessary-not-sufficient. See the query-expansion skill for the part that
needs Search Console and is currently blocked.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import jev  # noqa: E402

# What a real person types looking for a game like this. Grouped so a gap in
# one group reads as a theme rather than a stray word.
MODIFIERS: dict[str, list[str]] = {
    "access": ["free", "no download", "no install", "online", "instant",
               "play now", "no signup", "no account", "no wallet"],
    "context": ["unblocked", "at school", "on chromebook", "in browser",
                "works offline"],
    "genre": ["platformer", "side-scroller", "arcade", "2d", "retro",
              "pixel art", "score attack"],
    "theme": ["wild west", "western", "cowboy", "mining", "frontier"],
    "tech": ["html5", "godot", "webgl", "browser game"],
}

# Phrased as the searcher's need, not as a keyword. This is what separates the
# check from keyword stuffing — it asks whether the page delivers.
INTENT = {
    "free": "someone who wants a game that costs nothing, ever",
    "no download": "someone who refuses to download or install anything",
    "no install": "someone who cannot install software on their machine",
    "online": "someone who wants to play in a browser over the internet",
    "instant": "someone who wants to be playing within seconds of clicking",
    "play now": "someone who wants to start immediately with no steps first",
    "no signup": "someone who will not create an account or give an email",
    "no account": "someone who will not register or log in",
    "no wallet": "someone who does not want a crypto wallet or extension",
    "unblocked": "someone on a restricted school or office network that "
                 "blocks most game sites",
    "at school": "a student wanting something playable on school equipment",
    "on chromebook": "someone using a Chromebook, which cannot run native games",
    "in browser": "someone who wants it to run inside a web browser tab",
    "works offline": "someone with no reliable internet connection",
    "platformer": "someone looking specifically for a run-and-jump game",
    "side-scroller": "someone looking for a game that scrolls horizontally",
    "arcade": "someone wanting short, replayable arcade-style sessions",
    "2d": "someone who wants 2D rather than 3D graphics",
    "retro": "someone who wants an old-school look and feel",
    "pixel art": "someone who specifically likes pixel-art visuals",
    "score attack": "someone who wants to chase a high score",
    "wild west": "someone who wants a Wild West setting",
    "western": "someone who wants a western-genre setting",
    "cowboy": "someone who wants to play as a cowboy or outlaw",
    "mining": "someone interested in digging or mining as a mechanic",
    "frontier": "someone who wants a frontier or pioneer setting",
    "html5": "a developer or player who cares that it is HTML5",
    "godot": "someone interested in games built with the Godot engine",
    "webgl": "someone who cares that it renders through WebGL",
    "browser game": "someone searching the browser-game category generally",
}


def audit(path: Path, quick: bool, backend: str) -> dict:
    raw = path.read_text(errors="replace")
    text = jev.visible_text(raw) if "<" in raw[:2000] else raw
    low = text.lower()

    rows = []
    for group, mods in MODIFIERS.items():
        for m in mods:
            rows.append({"group": group, "modifier": m,
                         "present": len(re.findall(re.escape(m), low))})

    if not quick:
        # One battery per group keeps each request small and the questions
        # related, which is how Jev is meant to be used.
        for group, mods in MODIFIERS.items():
            qs = {
                m.replace(" ", "_").replace("-", "_"): {
                    "type": "noul",
                    "instructions": f"Would this page satisfy {INTENT[m]}? "
                                    f"Judge whether the page actually delivers "
                                    f"that, not whether it uses the word.",
                }
                for m in mods if m in INTENT
            }
            r = jev.classify(text[:60000], qs, backend)
            if "error" in r:
                print(f"  ! {group}: {r['error'][:90]}", file=sys.stderr)
                continue
            for k, v in r.get("answers", {}).items():
                key = k.replace("_", " ")
                for row in rows:
                    if row["modifier"].replace("-", " ") == key:
                        row["satisfied"] = float(v.get("noul", 0.0))
    return {"page": str(path), "rows": rows,
            "model": jev.LAST_MODEL_VERSION[0]}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--page", required=True)
    ap.add_argument("--quick", action="store_true", help="grep only, no Jev calls")
    ap.add_argument("--backend", choices=["openrouter", "demo"], default="openrouter")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    res = audit(Path(a.page), a.quick, a.backend)
    if a.json:
        print(json.dumps(res, indent=2))
        return 0

    print(f"\n  {res['page']}")
    if not a.quick:
        print(f"  model {res['model']}")
    print(f"\n  {'modifier':<16}{'says it':>9}{'delivers':>10}   verdict")
    print("  " + "-" * 58)

    buckets = {"word only": [], "silent win": [], "gap": [], "done": []}
    last = None
    for r in res["rows"]:
        if r["group"] != last:
            print(f"\n  [{r['group']}]")
            last = r["group"]
        p = r["present"]
        s = r.get("satisfied")
        if s is None:
            print(f"  {r['modifier']:<16}{p:>9}{'—':>10}")
            continue
        if p and s >= 0.5:
            v, b = "done", "done"
        elif p and s < 0.5:
            v, b = "WORD ONLY — page promises it, may not deliver", "word only"
        elif not p and s >= 0.5:
            v, b = "SILENT WIN — delivers, never says it", "silent win"
        else:
            v, b = "gap", "gap"
        buckets[b].append(r["modifier"])
        print(f"  {r['modifier']:<16}{p:>9}{s:>10.2f}   {v}")

    if not a.quick:
        print("\n  " + "=" * 58)
        print(f"\n  SILENT WINS ({len(buckets['silent win'])}) — cheapest fixes, "
              f"the page already earns these:\n    {buckets['silent win']}")
        print(f"\n  WORD ONLY ({len(buckets['word only'])}) — says it without "
              f"delivering; fix the page or drop the claim:\n    {buckets['word only']}")
        print(f"\n  GAPS ({len(buckets['gap'])}) — absent and unearned; only worth "
              f"adding if the intent is real:\n    {buckets['gap']}")
        print(f"\n  DONE ({len(buckets['done'])})\n    {buckets['done']}")
    print("\n  Coverage is necessary, not sufficient. Zero referring domains and")
    print("  0-70 searches/month mean a full grid still earns no traffic on its")
    print("  own. See the query-expansion skill for what actually drives this.\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
