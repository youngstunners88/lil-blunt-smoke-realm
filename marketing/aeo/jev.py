#!/usr/bin/env python3
"""
Structured scoring via Simple Jev — a numeric judge that needs no API key.

Simple Jev (github.com/featherless-ai/simple-jev) does NOT generate text. It
reads a model's next-token logits for predefined answer labels and constructs
the JSON itself. That matters here for three reasons:

  1. There is no output to parse, so there is no parse failure. Every call
     either returns a well-formed score or an HTTP error.
  2. It returns a probability distribution and a confidence, so "how sure"
     is a number rather than a tone of voice.
  3. The public demo endpoint needs no key, so a gauntlet can afford to run
     hundreds of judgements instead of a handful.

What it is NOT: calibrated. The upstream README says plainly that the
distributions "are not calibrated probabilities of correctness" and that "a
valid response structure does not guarantee a correct decision." Treat a score
as a ranking signal, never as proof. The accuracy gate below is the one place
this is leaned on hard, and it earns that by measured separation, not by faith
(see ACCURACY_SEPARATION).

Measured on this project's own text, 2026-09-20:

    honest copy      on-chain 0.024   reward 0.023
    violating copy   on-chain 0.988   reward 0.987   p2e 0.927

A ~40x gap. That is what makes the gate usable; re-run --self-test if the
endpoint or model changes, because the gate is worthless if that gap closes.

    python3 marketing/aeo/jev.py --self-test
    python3 marketing/aeo/jev.py --gate src/frontend/index.html
    python3 marketing/aeo/jev.py --score marketing/devlog/godot-html5-on-icp.md
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://simple-jev-demo-api.featherless.ai/v1/classifier"
MODELS_URL = "https://simple-jev-demo-api.featherless.ai/v1/models"

# Verified present 2026-09-20 via GET /v1/models. The upstream README still
# advertises a gemma id that the demo does not serve — do not trust the README
# for model ids, list the endpoint.
DEFAULT_MODEL = "featherless-ai/Qwen3.8-27B-classifier"
FAST_MODEL = "featherless-ai/RWKV-small-classifier"

# The demo documents a 2k-token context and 2 RPS. Both were observed to be
# softer than documented (3047 tokens accepted; 5 concurrent all returned 200),
# but undocumented leniency is not a contract. Self-throttle to the documented
# figures so this keeps working if they start enforcing them.
MAX_CHARS = 6000          # ~1.8k tokens, under the documented 2k
MIN_INTERVAL = 0.55       # ~2 RPS

# Cloudflare fronts this endpoint and returns 403 "error code: 1010" to the
# default Python-urllib User-Agent. curl works, urllib does not, which makes
# this look like an outage when it is a UA block. Send a real one.
UA = "lil-blunt-aeo/1.0 (+https://www.smokegame.win)"

_rate_lock = threading.Lock()
_last_call = [0.0]


def _throttle() -> None:
    with _rate_lock:
        wait = MIN_INTERVAL - (time.monotonic() - _last_call[0])
        if wait > 0:
            time.sleep(wait)
        _last_call[0] = time.monotonic()


def classify(state: str, questions: dict, model: str = DEFAULT_MODEL,
             timeout: int = 90) -> dict:
    """One scoring call. Returns {"answers": {...}} or {"error": "..."}."""
    _throttle()
    body = {"model": model, "state": state, "questions": questions}
    req = urllib.request.Request(
        API, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "User-Agent": UA},
        method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}: {e.read().decode(errors='replace')[:200]}"}
    except Exception as e:  # noqa: BLE001
        return {"error": f"{type(e).__name__}: {str(e)[:200]}"}


def chunks(text: str, size: int = MAX_CHARS) -> list[str]:
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

# Bias toward catching. A false positive costs a re-read; a false negative
# ships a false claim, which this project has done three times.
GATE_THRESHOLD = 0.35

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


def gate(text: str, model: str = DEFAULT_MODEL) -> dict:
    """Blocking accuracy check. Worst chunk wins — a claim anywhere is a claim."""
    body = visible_text(text) if "<" in text[:2000] else text
    worst: dict[str, float] = {k: 0.0 for k in GATE_QUESTIONS}
    errors = []
    for ch in chunks(body):
        if not ch.strip():
            continue
        r = classify(ch, GATE_QUESTIONS, model)
        if "error" in r:
            errors.append(r["error"])
            continue
        for k, v in r.get("answers", {}).items():
            worst[k] = max(worst[k], float(v.get("noul", 0.0)))
    violations = {k: v for k, v in worst.items() if v >= GATE_THRESHOLD}
    return {"scores": worst, "violations": violations,
            "passed": not violations and not errors, "errors": errors}


def score(text: str, model: str = DEFAULT_MODEL) -> dict:
    """AEO content rubrics. Mean across chunks, plus per-chunk detail."""
    body = visible_text(text) if "<" in text[:2000] else text
    acc: dict[str, list[float]] = {k: [] for k in SCORE_QUESTIONS}
    errors = []
    for ch in chunks(body):
        if not ch.strip():
            continue
        r = classify(ch, SCORE_QUESTIONS, model)
        if "error" in r:
            errors.append(r["error"])
            continue
        for k, v in r.get("answers", {}).items():
            if "score" in v:
                acc[k].append(float(v["score"]))
    means = {k: (sum(v) / len(v) if v else None) for k, v in acc.items()}
    vals = [v for v in means.values() if v is not None]
    return {"scores": means, "n_chunks": len(acc["evidence_density"]),
            "overall": (sum(vals) / len(vals) if vals else None), "errors": errors}


HONEST = ("Lil Blunt: The Smoke Realm is a free Wild West platformer that runs "
          "in your browser. No download, no wallet, no account. Built in Godot 4 "
          "and served from the Internet Computer. Scores are shown on a "
          "demonstration board and are not recorded on a blockchain. Playing "
          "does not award tokens, NFTs, or airdrops.")
VIOLATING = ("Lil Blunt: The Smoke Realm. Chase a high score signed on the "
             "Internet Computer. Own your progress on-chain. Collect on-chain "
             "Blunts and own your character upgrades. Earn proof-of-play badges "
             "as you climb the verifiable leaderboard.")


def self_test(model: str) -> int:
    """The gate is only as good as its separation. Prove it, don't assume it."""
    print(f"  model: {model}\n")
    h, v = gate(HONEST, model), gate(VIOLATING, model)
    if h["errors"] or v["errors"]:
        print(f"  ENDPOINT ERROR: {h['errors'] + v['errors']}", file=sys.stderr)
        return 2
    print(f"  {'question':<24}{'honest':>9}{'violating':>11}{'gap':>8}")
    print("  " + "-" * 52)
    gaps = []
    for k in GATE_QUESTIONS:
        hs, vs = h["scores"][k], v["scores"][k]
        gaps.append(vs - hs)
        print(f"  {k:<24}{hs:>9.3f}{vs:>11.3f}{vs - hs:>8.3f}")
    worst_gap = min(gaps)
    print(f"\n  honest passes gate:     {h['passed']}")
    print(f"  violating is caught:    {not v['passed']}")
    print(f"  narrowest gap:          {worst_gap:.3f}")
    ok = h["passed"] and not v["passed"] and worst_gap > 0.4
    print(f"\n  {'PASS — gate is usable' if ok else 'FAIL — do not trust the gate'}\n")
    if not ok:
        print("  The gate depends on separation between honest and violating "
              "text.\n  If this fails, the endpoint or model changed. Fix it "
              "before relying\n  on --gate in any workflow.\n", file=sys.stderr)
    return 0 if ok else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--gate", metavar="FILE", help="Blocking accuracy check")
    ap.add_argument("--score", metavar="FILE", help="AEO content rubrics")
    ap.add_argument("--text", help="Score/gate this literal string instead of a file")
    ap.add_argument("--self-test", action="store_true",
                    help="Prove the gate still separates honest from violating")
    ap.add_argument("--models", action="store_true", help="List demo models")
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--json", action="store_true", help="Machine-readable output")
    a = ap.parse_args()

    if a.models:
        mreq = urllib.request.Request(MODELS_URL, headers={"User-Agent": UA})
        with urllib.request.urlopen(mreq, timeout=30) as r:
            for m in json.load(r).get("data", []):
                print(f"  {m['id']}")
        return 0

    if a.self_test:
        return self_test(a.model)

    target = a.gate or a.score
    if not target and not a.text:
        ap.print_help()
        return 1
    text = a.text if a.text else Path(target).read_text(errors="replace")

    if a.gate or (a.text and not a.score):
        r = gate(text, a.model)
        if a.json:
            print(json.dumps(r, indent=2))
            return 0 if r["passed"] else 1
        print(f"\n  Accuracy gate — {a.gate or 'inline text'}\n")
        for k, v in r["scores"].items():
            flag = "  <-- VIOLATION" if v >= GATE_THRESHOLD else ""
            print(f"    {k:<24}{v:>7.3f}{flag}")
        if r["errors"]:
            print(f"\n  errors: {r['errors']}", file=sys.stderr)
        print(f"\n  {'PASS' if r['passed'] else 'BLOCKED'} "
              f"(threshold {GATE_THRESHOLD})\n")
        return 0 if r["passed"] else 1

    r = score(text, a.model)
    if a.json:
        print(json.dumps(r, indent=2))
        return 0
    print(f"\n  Content score — {a.score} ({r['n_chunks']} chunk(s))\n")
    for k, v in r["scores"].items():
        print(f"    {k:<24}{'n/a' if v is None else f'{v:>6.2f} / 3.00'}")
    if r["overall"] is not None:
        print(f"\n    {'OVERALL':<24}{r['overall']:>6.2f} / 3.00")
    if r["errors"]:
        print(f"\n  errors: {r['errors']}", file=sys.stderr)
    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
