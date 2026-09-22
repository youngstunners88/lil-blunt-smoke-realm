#!/usr/bin/env python3
"""
Verify Jev's calibration ON OUR OWN CONTENT, rather than trusting the vendor.

Jev is trained with RLCD, which optimises probabilities against real outcomes,
so higher confidence should mean higher accuracy. But that calibration is
against TypeSafe's distribution, not ours. The question that matters here is
narrower: when the gate says P(violation) = 0.74 on a page of OUR marketing
copy, is it right about 74% of the time?

This answers it with a labelled set of this project's own text and three
standard measures:

    Brier score   mean squared error of the probability. Lower is better.
                  0.0 perfect, 0.25 = always guessing 0.5, 1.0 worst possible.
    Log loss      punishes confident wrongness far harder than Brier.
    ECE           Expected Calibration Error: bin predictions, compare mean
                  predicted probability against observed frequency in each bin.
                  This is the one that says "0.8 really means 0.8".

Also prints a reliability curve. If it bends consistently, apply a correction
in the policy layer (Platt scaling) rather than editing question wording.

    python3 marketing/aeo/calibrate.py
    python3 marketing/aeo/calibrate.py --backend demo   # compare the two

Why this exists: the first version of the gate skill documented "Jev is not
calibrated, treat scores as ranking only" as a permanent limitation. It is not
permanent — it is measurable. This measures it.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import jev  # noqa: E402

# Labelled set. label=1 means the text genuinely violates the rule named.
# These are real strings from this project's history — the ones that actually
# shipped and had to be walked back — plus honest counterparts. Grow this file
# whenever a new violation is found or a new page is written; the measurement
# is only as good as the labels.
CASES: list[tuple[str, str, int]] = [
    # --- genuine violations, all previously live on this project ---
    ("chase a high score signed on the Internet Computer",
     "onchain_scores", 1),
    ("Explore the Smoke Realm and own your progress on-chain - no wallet "
     "required to start.", "onchain_scores", 1),
    ("Web3-ready: Collect on-chain Blunts and own your character upgrades.",
     "rewards", 1),
    ("Earn proof-of-play badges as you climb the leaderboard and mint your "
     "achievements.", "rewards", 1),
    ("Every score is cryptographically verifiable on the public ledger.",
     "verifiable_leaderboard", 1),
    ("Play to earn: every run pays out in tokens.", "play_to_earn", 1),

    # --- honest copy that must NOT trip the gate ---
    ("Scores are shown on a demonstration board styled as an old-west wanted "
     "poster. They are not recorded on a blockchain.", "onchain_scores", 0),
    ("Free, and there is nothing to buy. No download, no wallet, no account.",
     "rewards", 0),
    ("The whole site is served from the Internet Computer, a public "
     "blockchain that hosts complete web applications.", "onchain_scores", 0),
    ("Built in Godot 4. Arrows move, Space jumps, Enter throws axes.",
     "rewards", 0),
    ("Proof of Play is an achievement layer. No token rewards and no NFT "
     "minting.", "rewards", 0),
    ("A Wild West 2D platformer. Dig the Dustrock Mines and dodge the Tax "
     "Man. Free to play in the browser.", "play_to_earn", 0),
    ("Internet Identity sign-in works and is free. No wallet is required.",
     "verifiable_leaderboard", 0),
    ("The leaderboard shown on the site is demo data and carries a DEMO "
     "LEADERBOARD label.", "verifiable_leaderboard", 0),
]


def ece(pairs: list[tuple[float, int]], bins: int = 5) -> tuple[float, list]:
    """Expected Calibration Error + the reliability curve rows."""
    rows, total, n = [], 0.0, len(pairs)
    for b in range(bins):
        lo, hi = b / bins, (b + 1) / bins
        sel = [(p, y) for p, y in pairs
               if (p >= lo and p < hi) or (b == bins - 1 and p == 1.0)]
        if not sel:
            rows.append((lo, hi, 0, None, None, 0.0))
            continue
        conf = sum(p for p, _ in sel) / len(sel)
        acc = sum(y for _, y in sel) / len(sel)
        gap = abs(conf - acc)
        total += (len(sel) / n) * gap
        rows.append((lo, hi, len(sel), conf, acc, gap))
    return total, rows


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--backend", choices=["openrouter", "demo"], default="openrouter")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    print(f"\n  Calibration check — {len(CASES)} labelled cases, "
          f"backend {a.backend}\n")

    pairs: list[tuple[float, int]] = []
    per_q: dict[str, list[tuple[float, int]]] = {}
    for text, qid, label in CASES:
        r = jev.classify(text, {qid: jev.GATE_QUESTIONS[qid]}, a.backend)
        if "error" in r:
            print(f"  ! {r['error'][:90]}", file=sys.stderr)
            continue
        p = float(r["answers"][qid].get("noul", 0.0))
        pairs.append((p, label))
        per_q.setdefault(qid, []).append((p, label))

    if not pairs:
        print("  no readings; cannot measure.", file=sys.stderr)
        return 2

    brier = sum((p - y) ** 2 for p, y in pairs) / len(pairs)
    eps = 1e-9
    logloss = -sum(y * math.log(max(p, eps)) + (1 - y) * math.log(max(1 - p, eps))
                   for p, y in pairs) / len(pairs)
    e, rows = ece(pairs)

    print(f"  {'bin':<14}{'n':>4}{'predicted':>11}{'observed':>10}{'gap':>8}")
    print("  " + "-" * 47)
    for lo, hi, n, conf, acc, gap in rows:
        if not n:
            print(f"  {f'{lo:.1f}-{hi:.1f}':<14}{0:>4}{'—':>11}{'—':>10}{'—':>8}")
            continue
        print(f"  {f'{lo:.1f}-{hi:.1f}':<14}{n:>4}{conf:>11.3f}{acc:>10.3f}{gap:>8.3f}")

    print(f"\n  Brier score   {brier:.4f}   (0 perfect, 0.25 = coin flip)")
    print(f"  Log loss      {logloss:.4f}")
    print(f"  ECE           {e:.4f}   (0 = predicted matches observed)")
    print(f"  model         {jev.LAST_MODEL_VERSION[0]}")

    print("\n  Per-question separation:")
    for qid, ps in sorted(per_q.items()):
        pos = [p for p, y in ps if y == 1]
        neg = [p for p, y in ps if y == 0]
        if pos and neg:
            print(f"    {qid:<24}violating {sum(pos)/len(pos):.3f}  "
                  f"honest {sum(neg)/len(neg):.3f}  "
                  f"thresh {jev.GATE_THRESHOLDS[qid]:.2f}")

    verdict = ("WELL CALIBRATED — thresholds can be read as probabilities"
               if e < 0.10 and brier < 0.10 else
               "USABLE FOR RANKING — separation holds, but do not read a score "
               "as a literal probability" if brier < 0.20 else
               "POORLY CALIBRATED — do not gate on these numbers")
    print(f"\n  {verdict}\n")

    if a.json:
        print(json.dumps({"brier": brier, "logloss": logloss, "ece": e,
                          "n": len(pairs), "model": jev.LAST_MODEL_VERSION[0]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
