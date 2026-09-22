#!/usr/bin/env python3
"""
Generate → gate → score → select. An evolutionary loop for copy.

The existing `model-gauntlet` has models argue in prose and a human reads the
argument. That is expensive per judgement, so it runs a handful of rounds on
one idea. This loop swaps the judge for Simple Jev (see jev.py): a numeric,
key-free scorer. Judging becomes nearly free, so selection pressure can be
applied to dozens of candidates instead of a few.

    generate   N variants from several OpenRouter models   (costs money)
    gate       AGENTS.md blocking accuracy check via Jev   (free, BLOCKING)
    score      AEO rubrics via Jev                         (free)
    select     rank survivors, seed the next round with the winners

The gate runs BEFORE scoring and is not a tiebreaker. A variant that claims
on-chain scores is deleted no matter how good the copy is — that failure mode
has shipped three times on this project and no amount of style outweighs it.

    export OPENROUTER_API_KEY=...
    python3 marketing/aeo/gauntlet.py --brief marketing/aeo/briefs/itch.md
    python3 marketing/aeo/gauntlet.py --brief-text "..." --rounds 2 --variants 6

Honest limits: Jev scores rank candidates, they do not predict citation. A
variant that wins here has better evidence density and quotability than its
siblings — nothing more. Only probe.py measures whether anything got cited.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import jev  # noqa: E402

OR_API = "https://openrouter.ai/api/v1/chat/completions"

# Different families so variants diverge instead of converging on one house
# style. Verified present in OpenRouter's catalogue 2026-09-20.
GENERATORS = [
    "moonshotai/kimi-k3",
    "x-ai/grok-4.6",
    "google/gemini-3.7-flash",
]

# Every generator gets these. They are the project's blocking rules restated
# as generation constraints, so violations are rare rather than merely caught.
CONSTRAINTS = """
HARD ACCURACY RULES — a variant breaking any of these is discarded unread:
- Scores are NOT recorded on a blockchain. Never imply they are.
- The leaderboard is a DEMONSTRATION board. It is not publicly verifiable.
- Playing awards NO tokens, NFTs, or airdrops. There is no play-to-earn.
- Do not invent ratings, review counts, player counts, or awards.
- No company name, postal address, or contact details — this project is
  decentralised and has no headquarters.

TRUE things worth using:
- Free, no download, no wallet, no account, runs in a browser.
- Built in Godot 4; the whole site is served from the Internet Computer.
- Wild West theme: the Dustrock Mines, the Tax Man, a green outlaw prospector.
- Controls: arrows move, Space jumps, Enter throws axes, Shift sprints, K dashes.
"""


def generate(model: str, brief: str, seeds: list[str], n: int,
             timeout: int = 180) -> list[str]:
    seed_block = ""
    if seeds:
        joined = "\n\n".join(f"--- winner {i+1} ---\n{s}" for i, s in enumerate(seeds))
        seed_block = (
            f"\n\nThese scored highest last round. Beat them — do not merely "
            f"reword them. Find an angle they missed:\n\n{joined}\n")
    prompt = (
        f"{brief}\n{CONSTRAINTS}{seed_block}\n"
        f"Write {n} DISTINCT variants. Make them genuinely different in angle, "
        f"not the same idea reworded.\n\n"
        f"Return ONLY a JSON array of {n} strings, no commentary:\n"
        f'["variant one", "variant two"]')
    body = {"model": model, "max_tokens": 3000,
            "messages": [{"role": "user", "content": prompt}]}
    req = urllib.request.Request(
        OR_API, data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
                 "Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            msg = json.load(r)["choices"][0]["message"]
        # Reasoning models sometimes return content: null with the text in a
        # separate reasoning field, and an over-length reply can come back
        # empty. Either way this is a dead variant, not a crash.
        txt = msg.get("content") or msg.get("reasoning") or ""
    except Exception as e:  # noqa: BLE001
        print(f"  ! {model}: {type(e).__name__}: {str(e)[:120]}", file=sys.stderr)
        return []
    if not txt.strip():
        print(f"  ! {model}: empty reply", file=sys.stderr)
        return []
    start, end = txt.find("["), txt.rfind("]")
    if start < 0 or end < 0:
        print(f"  ! {model}: no JSON array in reply", file=sys.stderr)
        return []
    try:
        arr = json.loads(txt[start:end + 1])
    except json.JSONDecodeError:
        print(f"  ! {model}: unparseable JSON array", file=sys.stderr)
        return []
    return [s.strip() for s in arr if isinstance(s, str) and s.strip()]


def evaluate(text: str, backend: str) -> dict:
    """Gate first. A blocked variant is never scored — it is already dead."""
    g = jev.gate(text, backend)
    if not g["passed"]:
        return {"text": text, "blocked": True,
                "violations": g["violations"], "overall": None}
    s = jev.score(text, backend)
    return {"text": text, "blocked": False, "violations": {},
            "scores": s["scores"], "overall": s["overall"]}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--brief", metavar="FILE")
    src.add_argument("--brief-text")
    ap.add_argument("--rounds", type=int, default=2)
    ap.add_argument("--variants", type=int, default=4,
                    help="Variants per model per round")
    ap.add_argument("--keep", type=int, default=3, help="Winners seeding next round")
    ap.add_argument("--models", default=",".join(GENERATORS))
    ap.add_argument("--backend", choices=["openrouter", "demo"],
                    default="openrouter", help="Judge backend (see jev.py)")
    ap.add_argument("--out", metavar="FILE", help="Write full results as JSON")
    a = ap.parse_args()

    if not os.environ.get("OPENROUTER_API_KEY"):
        print("OPENROUTER_API_KEY is not set.", file=sys.stderr)
        return 1

    brief = Path(a.brief).read_text() if a.brief else a.brief_text
    gens = [m.strip() for m in a.models.split(",") if m.strip()]
    seeds: list[str] = []
    history = []

    for rnd in range(1, a.rounds + 1):
        print(f"\n{'='*62}\n  ROUND {rnd} of {a.rounds}\n{'='*62}")
        print(f"  generating: {len(gens)} models x {a.variants} variants")
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(gens)) as pool:
            batches = list(pool.map(
                lambda m: generate(m, brief, seeds, a.variants), gens))
        cands = [c for b in batches for c in b]
        # Identical strings from different models waste judge calls.
        cands = list(dict.fromkeys(cands))
        if not cands:
            print("  no candidates generated; stopping.", file=sys.stderr)
            return 1
        est = f"~{len(cands)*2*0.55:.0f}s at 2 RPS" if a.backend == "demo" \
            else f"~${len(cands)*2*1.5e-5:.4f}"
        print(f"  gating + scoring {len(cands)} unique candidates ({est})")

        results = [evaluate(c, a.backend) for c in cands]
        blocked = [r for r in results if r["blocked"]]
        alive = sorted((r for r in results if not r["blocked"]),
                       key=lambda r: r["overall"] or 0, reverse=True)

        print(f"\n  blocked by accuracy gate: {len(blocked)}")
        for r in blocked:
            v = ", ".join(f"{k} {s:.2f}" for k, s in r["violations"].items())
            print(f"    x  {v}\n       {r['text'][:88]}...")
        print(f"\n  survivors ranked ({len(alive)}):")
        for i, r in enumerate(alive[:8], 1):
            sc = r["scores"]
            print(f"\n   #{i}  overall {r['overall']:.2f}/3.00  "
                  f"[ev {sc['evidence_density']:.1f} · quote {sc['quotability']:.1f} · "
                  f"ans {sc['answers_a_question']:.1f} · solo {sc['self_contained']:.1f}]")
            print(f"       {r['text'][:200]}")

        history.append({"round": rnd, "blocked": len(blocked),
                        "results": results})
        seeds = [r["text"] for r in alive[:a.keep]]
        if not seeds:
            print("\n  every variant was blocked; stopping.", file=sys.stderr)
            break

    if a.out:
        Path(a.out).write_text(json.dumps(
            {"ts": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
             "brief": brief, "history": history}, indent=2))
        print(f"\n  full results -> {a.out}")

    print(f"\n{'='*62}\n  WINNER\n{'='*62}")
    print(f"\n{seeds[0] if seeds else '(none survived)'}\n")
    print("  Jev ranks candidates against each other. It does not predict")
    print("  citation. Ship the winner, then measure with probe.py.\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
