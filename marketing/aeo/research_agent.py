#!/usr/bin/env python3
"""
Research agent: benchmark pages that already win, measure the gap, propose fixes.

What it does, in order:

  1. FETCH   each benchmark URL. Firecrawl when FIRECRAWL_API_KEY is valid (it
             gets past bot walls such as Cloudflare challenges); plain HTTP when
             it is not. The key is probed once and the result is reported, so a
             dead key is never silently mistaken for "Firecrawl found nothing".
  2. MEASURE deterministic facts in code (word count, h1, schema types, FAQ,
             rating markup) and judgement with Jev, per PASSAGE, on the aeo and
             geo batteries. Code owns what grep can answer; Jev owns the rest.
  3. COMPARE the same numbers for our own pages, rubric by rubric.
  4. GAUNTLET on the weakest rubric: generate variants of our list entry
             (OpenRouter), accuracy-gate them (Jev, blocking), score survivors,
             and keep the best. Variants are PROPOSALS written to the report —
             nothing is applied to a page automatically.

    python3 marketing/aeo/research_agent.py \
        --urls https://www.crazygames.com/game/gunblood https://poki.com/en/g/gunblood
    python3 marketing/aeo/research_agent.py --urls ... --no-gauntlet   # measure only

Honest limits, stated up front because they change how to read the output:

  * A benchmark that scores higher than us tells you what a WINNING page looks
    like. It does not show that those features caused the win. Aggregators rank
    on authority we do not have, and brand-owned pages are ~8% of AI-engine
    sources (docs/gemini-aeo-research-2026-09-09.md). Copy their STRUCTURE, never
    their claims.
  * Some things on benchmarks we must not copy at all: rating markup with no
    real ratings behind it, player counts, awards. The report flags these.
  * Jev ranks passages against each other; it does not predict citation.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
import gauntlet  # noqa: E402
import jev  # noqa: E402
import passage  # noqa: E402

BROWSER_UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
BATTERIES = ("aeo", "geo")
MAX_PASSAGES = 30          # per page; keeps cost and time bounded


# --------------------------------------------------------------------- fetch
_FC_STATE: dict = {}


def firecrawl_ok() -> tuple[bool, str]:
    """Probe the key once. Report the reason, never just a boolean."""
    if "v" in _FC_STATE:
        return _FC_STATE["v"]
    key = os.environ.get("FIRECRAWL_API_KEY")
    if not key:
        res = (False, "FIRECRAWL_API_KEY not set")
    else:
        req = urllib.request.Request(
            "https://api.firecrawl.dev/v1/scrape",
            data=json.dumps({"url": "https://example.com", "formats": ["markdown"]}).encode(),
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                res = (True, "ok") if json.load(r).get("success") else (False, "no success flag")
        except urllib.error.HTTPError as e:
            res = (False, f"HTTP {e.code} (key rejected)" if e.code in (401, 403)
                   else f"HTTP {e.code}")
        except Exception as e:  # noqa: BLE001
            res = (False, f"{type(e).__name__}")
    _FC_STATE["v"] = res
    return res


def fetch(url: str) -> dict:
    ok, why = firecrawl_ok()
    if ok:
        req = urllib.request.Request(
            "https://api.firecrawl.dev/v1/scrape",
            data=json.dumps({"url": url, "formats": ["html"]}).encode(),
            headers={"Authorization": f"Bearer {os.environ['FIRECRAWL_API_KEY']}",
                     "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                d = json.load(r)
            html = (d.get("data") or {}).get("html") or ""
            if html:
                return {"url": url, "html": html, "via": "firecrawl"}
        except Exception:  # noqa: BLE001
            pass  # fall through to plain HTTP
    req = urllib.request.Request(url, headers={"User-Agent": BROWSER_UA})
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return {"url": url, "html": r.read().decode(errors="replace"),
                    "via": "plain-http"}
    except urllib.error.HTTPError as e:
        return {"url": url, "error": f"HTTP {e.code}", "via": "plain-http"}
    except Exception as e:  # noqa: BLE001
        return {"url": url, "error": type(e).__name__, "via": "plain-http"}


# ------------------------------------------------------------------- measure
def facts(html: str) -> dict:
    """Deterministic facts. Nothing here needs a model."""
    text = jev.visible_text(re.sub(r"<script[^>]*ld\+json.*?</script>", " ", html,
                                   flags=re.S | re.I))
    types = sorted(set(re.findall(r'"@type"\s*:\s*"([A-Za-z]+)"', html)))
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S | re.I)
    desc = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)', html, re.I)
    return {
        "words": len(text.split()),
        "h1": re.sub(r"<[^>]+>", "", h1.group(1)).strip()[:80] if h1 else "",
        "h2_count": len(re.findall(r"<h2[\s>]", html, re.I)),
        "meta_desc_len": len(desc.group(1)) if desc else 0,
        "schema_types": types,
        "has_faq": "FAQPage" in types or bool(re.search(r"frequently asked|\bFAQ\b", text, re.I)),
        "rating_markup": "aggregateRating" in html or "AggregateRating" in types,
        "has_howto": bool(re.search(r"how to play|controls", text, re.I)),
    }


def score_page(html: str) -> dict:
    ps = passage.passages(html)[:MAX_PASSAGES]
    rows = []

    def one(p):
        out = {}
        for b in BATTERIES:
            sc = passage.score_passage(p, b, "openrouter")
            if sc and "error" not in sc:
                out.update({f"{b}.{k}": v for k, v in sc.items()})
        return {"text": p, "scores": out}

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        rows = [r for r in pool.map(one, ps) if r["scores"]]
    if not rows:
        return {"n": 0}
    keys = sorted({k for r in rows for k in r["scores"]})
    means = {k: sum(r["scores"].get(k, 0) for r in rows if k in r["scores"])
             / max(1, sum(1 for r in rows if k in r["scores"])) for k in keys}
    best = {k: max((r for r in rows if k in r["scores"]), key=lambda r: r["scores"][k]) for k in keys}
    top = max(rows, key=lambda r: sum(r["scores"].values()) / len(r["scores"]))
    return {"n": len(rows), "means": means, "best_passage": top["text"],
            "best_by_rubric": {k: best[k]["scores"][k] for k in keys}}


# ----------------------------------------------------------------- our pages
OURS = ["src/frontend/public/about/index.html",
        "src/frontend/public/how-to-play/index.html",
        "src/frontend/public/faq/controls/index.html"]


def ours() -> dict:
    merged = "\n".join((ROOT / p).read_text(errors="replace") for p in OURS)
    return {"facts": facts(merged), "score": score_page(merged)}


# ---------------------------------------------------------------- fact-check
GAME_REPO = Path(os.environ.get("GM_GAME_DIR", "/home/user/youngstunners88/gm-game"))
_CORPUS: dict = {}

# Capitalised words that are not proper nouns of the game.
_COMMON = {"the", "a", "an", "it", "no", "on", "in", "and", "for", "this",
           "free", "built", "players", "player", "wild", "west", "video", "game",
           "web", "html5", "godot", "lil", "blunt", "smoke", "realm", "desktop",
           "mobile", "nothing", "arrow", "space", "enter", "shift", "score"}


def game_corpus() -> str:
    """One lowercase text blob of the game's source, docs and data."""
    if "t" in _CORPUS:
        return _CORPUS["t"]
    parts = []
    if GAME_REPO.exists():
        for ext in ("*.gd", "*.json", "*.md", "*.tscn", "*.txt"):
            for f in GAME_REPO.rglob(ext):
                if "node_modules" in f.parts or ".git" in f.parts:
                    continue
                try:
                    if f.stat().st_size < 2_000_000:
                        parts.append(f.read_text(errors="replace").lower())
                except OSError:
                    pass
    _CORPUS["t"] = "\n".join(parts)
    return _CORPUS["t"]


def unverified_names(text: str) -> list[str]:
    """Proper nouns in `text` that never appear anywhere in the game source.

    Deterministic on purpose. Jev's accuracy gate judges claims about tokens and
    rewards; it cannot know that a place called 'Dustrock Mines' does not exist
    in the game. A name either occurs in the source or it does not.
    """
    corpus = game_corpus()
    if not corpus:
        return ["(game source not found — cannot verify names)"]
    names = set(re.findall(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b", text))
    names |= {m for m in re.findall(r"\bthe\s+([A-Z][a-z]+)\b", text)}
    out = []
    for n in sorted(names):
        words = [w for w in n.split() if w.lower() not in _COMMON]
        if not words:
            continue
        if n.lower() not in corpus:
            out.append(n)
    return out


# ------------------------------------------------------------------ gauntlet
def run_gauntlet(weak: list[str], bench_best: str, n: int = 4) -> list[dict]:
    brief = (
        "Write a DROP-IN LIST ENTRY for Lil Blunt: The Smoke Realm: 2 to 4 "
        "sentences, under 90 words, third person, self-contained, unmistakably a "
        "VIDEO GAME (not the music artist of the same name).\n\n"
        "It must carry: the name, genre (2D side-scrolling platformer and arcade "
        "score-chaser), theme (Wild West: a green outlaw prospector, the Dustrock "
        "Mines, the Tax Man), platform (web browser on desktop or mobile, built in "
        "Godot 4, HTML5), price (free, nothing to buy), and ONE concrete hook.\n\n"
        "USE ONLY NAMES THAT EXIST IN THE GAME. Verified in the game source: three "
        "stages (Smoke Realm, Crystal Caverns, Gold Rush) each ending in a boss; "
        "Tax Collector enemies; mine carts; the mascot Lil Blunt. Do NOT use "
        "'Dustrock Mines', 'Tax Man' or 'outlaw prospector' — those appear in "
        "website copy but NOT in the game. Do NOT invent mechanics, hazards, "
        "obstacles or features that are not listed here.\n\n"
        f"Our weakest measured rubrics are: {', '.join(weak)}. Improve those.\n\n"
        "For STRUCTURE only, here is the strongest passage from a page that "
        f"already wins in this niche. Do NOT copy its facts or claims:\n---\n{bench_best[:600]}\n---")
    cands: list[str] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for batch in pool.map(lambda m: gauntlet.generate(m, brief, [], n), gauntlet.GENERATORS):
            cands += batch
    cands = list(dict.fromkeys(cands))
    results = []
    for c in cands:
        g = jev.gate(c)
        if not g["passed"]:
            results.append({"text": c, "blocked": list(g["violations"])})
            continue
        sc = {}
        for b in BATTERIES:
            s = passage.score_passage(c, b, "openrouter") or {}
            sc.update({f"{b}.{k}": v for k, v in s.items() if k != "error"})
        results.append({"text": c, "scores": sc, "unverified": unverified_names(c),
                        "mean": sum(sc.values()) / len(sc) if sc else 0})
    return sorted(results, key=lambda r: r.get("mean", -1), reverse=True)


# -------------------------------------------------------------------- report
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--urls", nargs="+", required=True)
    ap.add_argument("--no-gauntlet", action="store_true")
    ap.add_argument("--out", help="report path (default docs/research/<date>.md)")
    a = ap.parse_args()

    ok, why = firecrawl_ok()
    print(f"\n  Firecrawl: {'ACTIVE' if ok else 'unavailable — ' + why}; "
          f"{'using it' if ok else 'falling back to plain HTTP'}", file=sys.stderr)

    pages = []
    for u in a.urls:
        f = fetch(u)
        if "error" in f:
            print(f"  ! {u}: {f['error']} ({f['via']})", file=sys.stderr)
            pages.append({"url": u, "error": f["error"], "via": f["via"]})
            continue
        print(f"  fetched {u} via {f['via']} ({len(f['html'])//1024} KB)", file=sys.stderr)
        pages.append({"url": u, "via": f["via"], "facts": facts(f["html"]),
                      "score": score_page(f["html"])})

    print("  scoring our pages...", file=sys.stderr)
    us = ours()
    good = [p for p in pages if "score" in p and p["score"].get("n")]

    # Gap: for each rubric, best benchmark mean minus ours.
    gaps = {}
    for k, ours_v in us["score"].get("means", {}).items():
        bench = [p["score"]["means"][k] for p in good if k in p["score"]["means"]]
        if bench:
            gaps[k] = (max(bench) - ours_v, max(bench), ours_v)
    weak = [k for k, _ in sorted(gaps.items(), key=lambda kv: -kv[1][0])[:3]]

    proposals = []
    if not a.no_gauntlet and good and os.environ.get("OPENROUTER_API_KEY"):
        print(f"  gauntlet on weakest rubrics: {weak}", file=sys.stderr)
        bench_best = max(good, key=lambda p: sum(p["score"]["best_by_rubric"].values()))["score"]["best_passage"]
        proposals = run_gauntlet(weak, bench_best)

    today = dt.date.today().isoformat()
    path = Path(a.out) if a.out else ROOT / "docs/research" / f"{today}-benchmark.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    L = [f"# Benchmark research — {today}", "",
         f"Fetch: Firecrawl **{'active' if ok else 'unavailable (' + why + ')'}**; "
         f"pages fetched via {sorted({p['via'] for p in pages})}.", "",
         "Benchmarks show what a WINNING page looks like, not what caused the win. "
         "Copy structure, never claims.", "",
         "## Deterministic facts", "",
         "| page | words | h2 | meta desc | schema types | FAQ | rating markup |",
         "|---|---:|---:|---:|---|:-:|:-:|"]
    for p in pages:
        if "facts" in p:
            f = p["facts"]
            L.append(f"| {p['url'].split('//')[1][:44]} | {f['words']} | {f['h2_count']} | "
                     f"{f['meta_desc_len']} | {', '.join(f['schema_types'][:5]) or '—'} | "
                     f"{'yes' if f['has_faq'] else 'no'} | "
                     f"{'**yes**' if f['rating_markup'] else 'no'} |")
        else:
            L.append(f"| {p['url'].split('//')[1][:44]} | fetch failed: {p['error']} | | | | | |")
    f = us["facts"]
    L.append(f"| **ours (about + how-to-play + controls)** | {f['words']} | {f['h2_count']} | "
             f"{f['meta_desc_len']} | {', '.join(f['schema_types'][:5]) or '—'} | "
             f"{'yes' if f['has_faq'] else 'no'} | no |")
    if any(p.get("facts", {}).get("rating_markup") for p in pages):
        L += ["", "> **Do not copy rating markup.** Benchmarks carry aggregateRating; "
              "we have no real ratings, and fabricating them is a blocking accuracy "
              "violation and a manual-action risk."]
    L += ["", "## Jev scores (mean across passages, 0–3)", "",
          "| rubric | ours | best benchmark | gap |", "|---|---:|---:|---:|"]
    for k, (gap, b, o) in sorted(gaps.items(), key=lambda kv: -kv[1][0]):
        L.append(f"| {k} | {o:.2f} | {b:.2f} | {gap:+.2f} |")
    L += ["", f"Weakest vs benchmark: **{', '.join(weak) or 'n/a'}**.", ""]
    ent = (ROOT / "marketing/CANONICAL-ENTRY.md").read_text()
    m = re.search(r"```\n(Lil Blunt: The Smoke Realm is.*?)```", ent, re.S)
    if m:
        bad = unverified_names(m.group(1))
        L += ["## Fact-check of our CURRENT canonical entry", "",
              ("Names NOT found anywhere in the GM-GAME source: **" + ", ".join(bad) + "**"
               if bad else "Every proper noun is found in the GM-GAME source."), ""]
    for p in good:
        L += [f"### Strongest passage — {p['url'].split('//')[1][:50]}", "",
              f"> {p['score']['best_passage'][:520]}", ""]
    if proposals:
        L += ["## Gauntlet proposals (NOT applied)", ""]
        blocked = [r for r in proposals if "blocked" in r]
        alive = [r for r in proposals if "blocked" not in r]
        L.append(f"{len(proposals)} candidates; {len(blocked)} blocked by the accuracy gate.\n")
        for i, r in enumerate(alive[:5], 1):
            flag = (f"  ⚠ names not found in the game source: {', '.join(r['unverified'])}"
                    if r.get("unverified") else "  ✓ every proper noun found in the game source")
            L += [f"**#{i} — {r['mean']:.2f}/3.00**{flag}", "", f"> {r['text']}", ""]
    path.write_text("\n".join(L) + "\n")
    print(f"\n  report -> {path}", file=sys.stderr)
    print("\n".join(L[:40]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
