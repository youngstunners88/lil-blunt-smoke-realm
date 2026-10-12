#!/usr/bin/env python3
"""
Structured scoring via Jev — typed, calibrated decisions instead of prose.

Jev (TypeSafe AI) is not an LLM. You send a state plus typed questions with
predefined answer spaces; it returns typed answers with probabilities and
confidence. Nothing is generated, so there is no prose to parse and no JSON to
repair. Every question in a battery is evaluated in parallel and in isolation,
so adding questions barely moves latency and there is no context rot.

Two backends, same interface:

  openrouter (DEFAULT)  ~typesafe/jev-latest via the OpenRouter key we already
                        have. The real Jev: RLCD-trained, which means the
                        probabilities are optimised against real outcomes
                        rather than human preference, so higher confidence
                        genuinely means higher accuracy in aggregate.
                        32K context, ~$0.000015 per battery.

  demo                  simple-jev's free public endpoint. NOT Jev. It reads
                        next-token logits off generic open models to imitate
                        the interface. Same response shape, but NOT calibrated
                        and only ~2K context. A fallback, not an equal.

The difference matters: this module's thresholds are tuned against calibrated
output. Falling back to `demo` keeps the pipeline alive but degrades the
guarantee — which is exactly what FALLBACK LADDER below is about.

    python3 marketing/aeo/jev.py --self-test
    python3 marketing/aeo/jev.py --gate src/frontend/index.html
    python3 marketing/aeo/jev.py --score marketing/devlog/godot-html5-on-icp.md
    python3 marketing/aeo/jev.py --gate FILE --backend demo    # no key needed

DESIGN RULES (from TypeSafe's own methodology, and they are load-bearing):

  Atomic questions, composed in code. A question needing reasoning across
  several factors gets decomposed; ask each factor separately and combine with
  your own weights. When priorities change you edit a coefficient, not a prompt.

  Thresholds live here, not in the model. One threshold per action, scaled to
  what being wrong costs — not one global number for the whole system. See
  GATE_THRESHOLDS.

  Pin and log the model version. Confidence gates are calibrated to one model;
  a silent upgrade with unpinned thresholds breaks the system quietly. Every
  response records the resolved version.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

# Real Jev, through the OpenRouter key this project already uses. Both
# /api/v1/systemone and /api/alpha/decisions work and take the same schema;
# the alpha path is the one OpenRouter's own error message points to.
OR_URL = "https://openrouter.ai/api/alpha/decisions"
OR_MODEL = "~typesafe/jev-latest"

# simple-jev's free demo. Imitates the interface on open models. Not calibrated.
DEMO_URL = "https://simple-jev-demo-api.featherless.ai/v1/classifier"
DEMO_MODELS_URL = "https://simple-jev-demo-api.featherless.ai/v1/models"
DEMO_MODEL = "featherless-ai/Qwen3.8-27B-classifier"

# Jev carries 32K context, so a whole page is one call and one battery. The
# demo documents 2K. Chunking only exists for the demo path now.
MAX_CHARS_OR = 100000
MAX_CHARS_DEMO = 6000
MIN_INTERVAL_DEMO = 0.55   # demo documents 2 RPS; Jev needs no self-throttle

# Cloudflare fronts the demo and 403s the default Python-urllib User-Agent.
# curl works, urllib does not, which reads as an outage but is a UA block.
UA = "lil-blunt-aeo/1.0 (+https://www.smokegame.win)"

# Set by the last call; the version-pinning rule above requires surfacing it.
LAST_MODEL_VERSION = [None]

_rate_lock = threading.Lock()
_last_call = [0.0]


def _throttle() -> None:
    with _rate_lock:
        wait = MIN_INTERVAL_DEMO - (time.monotonic() - _last_call[0])
        if wait > 0:
            time.sleep(wait)
        _last_call[0] = time.monotonic()


def classify(state: str, questions: dict, backend: str = "openrouter",
             model: str | None = None, timeout: int = 90) -> dict:
    """One battery. Every question is evaluated in parallel and in isolation."""
    if backend == "openrouter":
        key = os.environ.get("OPENROUTER_API_KEY")
        if not key:
            return {"error": "OPENROUTER_API_KEY is not set"}
        url, hdrs = OR_URL, {"Content-Type": "application/json",
                             "Authorization": f"Bearer {key}"}
        body = {"model": model or OR_MODEL, "state": state, "questions": questions}
    else:
        _throttle()
        url, hdrs = DEMO_URL, {"Content-Type": "application/json", "User-Agent": UA}
        body = {"model": model or DEMO_MODEL, "state": state, "questions": questions}

    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers=hdrs, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            out = json.load(r)
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}: {e.read().decode(errors='replace')[:200]}"}
    except Exception as e:  # noqa: BLE001
        return {"error": f"{type(e).__name__}: {str(e)[:200]}"}
    # Pin-and-log rule: the resolved version, not the alias we asked for.
    if out.get("model"):
        LAST_MODEL_VERSION[0] = out["model"]
    return out


def chunks(text: str, size: int = MAX_CHARS_DEMO) -> list[str]:
    """Split on paragraph boundaries so a claim is never cut in half.

    A claim split across two chunks could score low in both and slip the gate,
    so paragraphs are kept whole and only an oversized single paragraph is
    hard-cut.
    """
    paras, out, cur = re.split(r"\n\s*\n", text), [], ""
    for p in paras:
        if len(p) > size:
            if cur:
                out.append(cur)
                cur = ""
            out.extend(p[i:i + size] for i in range(0, len(p), size))
            continue
        if len(cur) + len(p) + 2 > size:
            out.append(cur)
            cur = p
        else:
            cur = f"{cur}\n\n{p}" if cur else p
    if cur:
        out.append(cur)
    return out or [""]


def visible_text(raw: str) -> str:
    """Strip tags/CSS/JS so the gate reads what a person or crawler reads.

    JSON-LD is deliberately KEPT: the on-chain claim this project shipped three
    times lived inside a <script type="application/ld+json"> block, which is
    exactly the kind of place a human reviewer skims past.
    """
    ld = " ".join(re.findall(
        r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', raw, re.S | re.I))
    body = re.sub(r"<script(?![^>]*ld\+json).*?</script>", " ", raw, flags=re.S | re.I)
    body = re.sub(r"<style.*?</style>", " ", body, flags=re.S | re.I)
    body = re.sub(r"<[^>]+>", " ", body)
    return re.sub(r"\s+", " ", f"{body} {ld}").strip()


# Each question maps to a line in AGENTS.md "Public Claims Accuracy (blocking)".
# Wording is deliberately concrete — "permanently recorded on a blockchain"
# separates far better than a vague "is this accurate?".
GATE_QUESTIONS = {
    "onchain_scores": {
        "type": "noul",
        "instructions": "Does this text claim that player scores or player "
                        "progress are permanently recorded on a blockchain?",
    },
    "verifiable_leaderboard": {
        "type": "noul",
        "instructions": "Does this text claim the leaderboard is publicly "
                        "verifiable or cryptographically provable on-chain?",
    },
    "rewards": {
        "type": "noul",
        "instructions": "Does this text promise that players will earn or own "
                        "tokens, NFTs, airdrops, or tradeable on-chain assets?",
    },
    "play_to_earn": {
        "type": "noul",
        "instructions": "Does this text imply a play-to-earn mechanic where "
                        "playing the game produces financial value?",
    },
}

# One threshold per question, scaled to what being wrong costs — not one
# global number. All four are blocking-false per AGENTS.md, but they differ in
# how expensive a miss is and how sharply Jev separates them:
#
#   onchain_scores / rewards   The two claims this project has actually shipped
#                              and had to walk back. A miss republishes a lie.
#                              Tightest thresholds.
#   verifiable_leaderboard     Same severity, slightly softer because honest
#                              copy legitimately discusses the demo board.
#   play_to_earn               Inferential rather than literal, so honest copy
#                              mentioning "free to play" scores a little higher.
#                              Loosest, to keep false positives tolerable.
#
# Every one of these is still far below the ~0.93-0.99 that real violations
# score, and far above the ~0.01-0.03 that honest copy scores. Re-run
# --self-test after any model change; the gap is the whole guarantee.
GATE_THRESHOLDS = {
    "onchain_scores": 0.25,
    "verifiable_leaderboard": 0.30,
    "rewards": 0.25,
    "play_to_earn": 0.40,
}

# What to do when Jev cannot answer. Borrowed from the trading-loop discipline:
# a system without an explicit degraded mode is "autonomous until the first
# network partition". For a copy gate the safe direction is always to BLOCK —
# a missed violation ships, a false block just asks a human to look.
FALLBACK_LADDER = """
  Jev healthy                 -> gate decides, thresholds apply
  Jev errors, demo available  -> retry on demo; gate decides but flag DEGRADED
                                 (demo is not calibrated; treat as advisory)
  both unavailable            -> BLOCK and require human review. Never pass
                                 text because the scorer was down.
"""

SCORE_QUESTIONS = {
    "evidence_density": {
        "type": "score",
        "instructions": "How much concrete, specific, verifiable detail does "
                        "this contain (named technologies, exact mechanics, "
                        "numbers, constraints) versus vague marketing language?",
        "criteria": ["Purely vague marketing", "Some specifics",
                     "Mostly concrete", "Dense with verifiable specifics"],
    },
    "quotability": {
        "type": "score",
        "instructions": "If an AI assistant were answering a player's question, "
                        "how directly usable is this text as a citable answer "
                        "passage, without rewriting?",
        "criteria": ["Not usable", "Needs heavy rewriting",
                     "Usable with light editing", "Directly quotable as-is"],
    },
    "answers_a_question": {
        "type": "score",
        "instructions": "How clearly does this text answer a specific question "
                        "someone would actually type, rather than describing "
                        "the product in general?",
        "criteria": ["Answers nothing", "Vaguely on-topic",
                     "Answers a question indirectly", "Directly answers a real question"],
    },
    "self_contained": {
        "type": "score",
        "instructions": "Could this passage be quoted alone, out of context, "
                        "and still make complete sense to a reader?",
        "criteria": ["Meaningless alone", "Needs surrounding context",
                     "Mostly stands alone", "Fully self-contained"],
    },
}


def _prep(text: str, backend: str) -> list[str]:
    body = visible_text(text) if "<" in text[:2000] else text
    if backend == "openrouter":
        # 32K context: a whole page is one battery, no chunking, no seams.
        return [body[:MAX_CHARS_OR]]
    return chunks(body, MAX_CHARS_DEMO)


def gate(text: str, backend: str = "openrouter", model: str | None = None) -> dict:
    """Blocking accuracy check. Worst chunk wins — a claim anywhere is a claim.

    Implements FALLBACK_LADDER: on a Jev failure it retries on the demo and
    marks the result DEGRADED; if both fail it blocks rather than passing.
    """
    degraded = False
    parts = _prep(text, backend)
    worst = {k: 0.0 for k in GATE_QUESTIONS}
    errors: list[str] = []

    for ch in parts:
        if not ch.strip():
            continue
        r = classify(ch, GATE_QUESTIONS, backend, model)
        if "error" in r and backend == "openrouter":
            # Rung 2 of the ladder: keep the pipeline alive, flag the downgrade.
            errors.append(f"jev: {r['error']}")
            degraded = True
            for sub in chunks(ch, MAX_CHARS_DEMO):
                r2 = classify(sub, GATE_QUESTIONS, "demo", None)
                if "error" in r2:
                    errors.append(f"demo: {r2['error']}")
                    continue
                for k, v in r2.get("answers", {}).items():
                    worst[k] = max(worst[k], float(v.get("noul", 0.0)))
            continue
        if "error" in r:
            errors.append(r["error"])
            continue
        for k, v in r.get("answers", {}).items():
            worst[k] = max(worst[k], float(v.get("noul", 0.0)))

    violations = {k: v for k, v in worst.items() if v >= GATE_THRESHOLDS[k]}
    # Rung 3: no usable reading at all means block, never pass.
    no_reading = all(v == 0.0 for v in worst.values()) and errors
    return {"scores": worst, "violations": violations,
            "passed": not violations and not no_reading,
            "degraded": degraded, "no_reading": bool(no_reading),
            "errors": errors, "model_version": LAST_MODEL_VERSION[0]}


def score(text: str, backend: str = "openrouter",
          model: str | None = None) -> dict:
    """AEO content rubrics. Mean across parts, with confidence carried through."""
    parts = _prep(text, backend)
    acc = {k: [] for k in SCORE_QUESTIONS}
    conf = {k: [] for k in SCORE_QUESTIONS}
    errors = []
    for ch in parts:
        if not ch.strip():
            continue
        r = classify(ch, SCORE_QUESTIONS, backend, model)
        if "error" in r:
            errors.append(r["error"])
            continue
        for k, v in r.get("answers", {}).items():
            if "score" in v:
                acc[k].append(float(v["score"]))
                if "confidence" in v:
                    conf[k].append(float(v["confidence"]))
    means = {k: (sum(v) / len(v) if v else None) for k, v in acc.items()}
    confs = {k: (sum(v) / len(v) if v else None) for k, v in conf.items()}
    vals = [v for v in means.values() if v is not None]
    return {"scores": means, "confidence": confs,
            "n_parts": len(acc["evidence_density"]),
            "overall": (sum(vals) / len(vals) if vals else None),
            "errors": errors, "model_version": LAST_MODEL_VERSION[0]}


HONEST = ("Lil Blunt: The Smoke Realm is a free Wild West platformer that runs "
          "in your browser. No download, no wallet, no account. Built in Godot 4 "
          "and served from the Internet Computer. Scores are shown on a "
          "demonstration board and are not recorded on a blockchain. Playing "
          "does not award tokens, NFTs, or airdrops.")
VIOLATING = ("Lil Blunt: The Smoke Realm. Chase a high score signed on the "
             "Internet Computer. Own your progress on-chain. Collect on-chain "
             "Blunts and own your character upgrades. Earn proof-of-play badges "
             "as you climb the verifiable leaderboard.")


def self_test(backend: str, model: str | None) -> int:
    """The gate is only as good as its separation. Prove it, don't assume it."""
    print(f"  backend: {backend}")
    h, v = gate(HONEST, backend, model), gate(VIOLATING, backend, model)
    if h["errors"] or v["errors"]:
        print(f"  ENDPOINT ERROR: {(h['errors'] + v['errors'])[:2]}", file=sys.stderr)
        return 2
    print(f"  model:   {LAST_MODEL_VERSION[0]}\n")
    print(f"  {'question':<24}{'honest':>8}{'violating':>11}{'gap':>8}{'thresh':>8}")
    print("  " + "-" * 59)
    gaps = []
    for k in GATE_QUESTIONS:
        hs, vs = h["scores"][k], v["scores"][k]
        gaps.append(vs - hs)
        print(f"  {k:<24}{hs:>8.3f}{vs:>11.3f}{vs - hs:>8.3f}"
              f"{GATE_THRESHOLDS[k]:>8.2f}")
    worst_gap = min(gaps)
    print(f"\n  honest passes gate:  {h['passed']}")
    print(f"  violating is caught: {not v['passed']}")
    print(f"  narrowest gap:       {worst_gap:.3f}")
    ok = h["passed"] and not v["passed"] and worst_gap > 0.4
    print(f"\n  {'PASS - gate is usable' if ok else 'FAIL - do not trust the gate'}\n")
    if not ok:
        print("  Separation is the entire guarantee. If this fails, the model or\n"
              "  endpoint changed — fix it before relying on --gate anywhere.\n",
              file=sys.stderr)
    return 0 if ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--gate", metavar="FILE", help="Blocking accuracy check")
    ap.add_argument("--score", metavar="FILE", help="AEO content rubrics")
    ap.add_argument("--text", help="Gate/score a literal string instead of a file")
    ap.add_argument("--self-test", action="store_true",
                    help="Prove the gate still separates honest from violating")
    ap.add_argument("--backend", choices=["openrouter", "demo"], default="openrouter",
                    help="openrouter = real calibrated Jev (default); "
                         "demo = free uncalibrated imitation, no key needed")
    ap.add_argument("--model", default=None)
    ap.add_argument("--ladder", action="store_true", help="Print the fallback ladder")
    ap.add_argument("--json", action="store_true", help="Machine-readable output")
    a = ap.parse_args()

    if a.ladder:
        print(FALLBACK_LADDER)
        return 0
    if a.self_test:
        return self_test(a.backend, a.model)

    target = a.gate or a.score
    if not target and not a.text:
        ap.print_help()
        return 1
    text = a.text if a.text else Path(target).read_text(errors="replace")

    if a.gate or (a.text and not a.score):
        r = gate(text, a.backend, a.model)
        if a.json:
            print(json.dumps(r, indent=2))
            return 0 if r["passed"] else 1
        print(f"\n  Accuracy gate — {a.gate or 'inline text'}")
        print(f"  model: {r['model_version']}\n")
        for k, val in r["scores"].items():
            flag = "  <-- VIOLATION" if val >= GATE_THRESHOLDS[k] else ""
            print(f"    {k:<24}{val:>7.3f}  (thresh {GATE_THRESHOLDS[k]:.2f}){flag}")
        if r["degraded"]:
            print("\n  DEGRADED: fell back to the uncalibrated demo backend.")
            print("  Treat this reading as advisory, not authoritative.")
        if r["no_reading"]:
            print("\n  NO READING: every backend failed. Blocking by policy —")
            print("  text is never passed because the scorer was unavailable.")
        if r["errors"]:
            print(f"\n  errors: {r['errors'][:3]}", file=sys.stderr)
        print(f"\n  {'PASS' if r['passed'] else 'BLOCKED'}\n")
        return 0 if r["passed"] else 1

    r = score(text, a.backend, a.model)
    if a.json:
        print(json.dumps(r, indent=2))
        return 0
    print(f"\n  Content score — {a.score} ({r['n_parts']} part(s))")
    print(f"  model: {r['model_version']}\n")
    for k, val in r["scores"].items():
        c = r["confidence"].get(k)
        cs = f"   conf {c:.2f}" if c is not None else ""
        print(f"    {k:<24}{'n/a' if val is None else f'{val:>6.2f} / 3.00'}{cs}")
    if r["overall"] is not None:
        print(f"\n    {'OVERALL':<24}{r['overall']:>6.2f} / 3.00")
    if r["errors"]:
        print(f"\n  errors: {r['errors'][:3]}", file=sys.stderr)
    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
