#!/usr/bin/env python3
"""
Score a prompt on the dimensions that actually change output quality.

Not a "make it sound professional" rewriter. Adding politeness, role-play
preambles ("you are a world-class expert") or emphatic capitals does not
measurably improve output. What does: saying what the deliverable is, what
would make it wrong, what not to do, and which assumptions are load-bearing.

Eight rubrics, each scored 0-3 by Jev, each tied to a specific failure:

  deliverable      "help me with X" -> the model guesses the artifact
  success_test     no way to tell a good answer from a plausible one
  context_supplied the model cannot see what you can see
  constraints      what must NOT happen; the expensive omission
  assumptions      a premise smuggled in as a given, so it never gets checked
  single_task      several unrelated asks in one prompt, so all get shallow work
  format           shape of the answer left to chance
  scope_bounds     no upper bound, so the model over- or under-builds

The assumptions rubric matters most and is the least intuitive. A prompt that
says "do X because Y" where Y is unverified gets Y-shaped work back, and nobody
checks Y. Prompts that separate the goal from the proposed method get the method
questioned when it is wrong.

    python3 marketing/aeo/promptfix.py --prompt "make the site better"
    python3 marketing/aeo/promptfix.py --file draft-prompt.txt
    python3 marketing/aeo/promptfix.py --prompt "..." --json

Honest limit: this scores a prompt's STRUCTURE. It cannot know whether your
goal is the right goal, and a 3.00 on every rubric will not rescue a request
built on a false premise. It flags the premise; judging it is still yours.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import jev  # noqa: E402

RUBRICS = {
    "deliverable": {
        "type": "score",
        "instructions": "How clearly does this request name the concrete thing "
                        "to be produced — a file, a document, a code change, a "
                        "decision, an answer?",
        "criteria": ["No deliverable named", "Vaguely implied",
                     "Mostly clear", "Named precisely"],
    },
    "success_test": {
        "type": "score",
        "instructions": "Could someone reading this tell the difference between "
                        "a correct result and a merely plausible-sounding one? "
                        "Does it state how the work will be checked?",
        "criteria": ["No way to tell", "Vague quality words only",
                     "Partial criteria", "Explicit verifiable test"],
    },
    "context_supplied": {
        "type": "score",
        "instructions": "Does this supply the background the reader could not "
                        "otherwise know — prior state, constraints of the "
                        "environment, what was already tried?",
        "criteria": ["No context", "A little", "Most of it", "Fully grounded"],
    },
    "constraints": {
        "type": "score",
        "instructions": "Does this say what must NOT happen, what to leave "
                        "alone, or which approaches are off-limits?",
        "criteria": ["No limits stated", "One vague limit",
                     "Some clear limits", "Explicit do-not list"],
    },
    "assumptions": {
        "type": "score",
        "instructions": "Does this separate the GOAL from the PROPOSED METHOD, "
                        "so the method can be questioned if it is wrong? A "
                        "request that asserts its own solution as a given "
                        "scores low.",
        "criteria": ["Method asserted as fact", "Method stated, not flagged",
                     "Goal and method mostly separate",
                     "Goal stated, method offered for challenge"],
    },
    "single_task": {
        "type": "score",
        "instructions": "How focused is this on one task? Several unrelated "
                        "asks bundled together scores low, because each gets "
                        "shallower work than it would alone.",
        "criteria": ["Many unrelated asks", "Two or three bundled",
                     "Mostly one task", "One clear task"],
    },
    "format": {
        "type": "score",
        "instructions": "Does this specify the shape of the answer — length, "
                        "structure, file type, level of detail?",
        "criteria": ["Unspecified", "Loosely implied",
                     "Mostly specified", "Explicit"],
    },
    "scope_bounds": {
        "type": "score",
        "instructions": "Does this bound the effort — how far to go, when to "
                        "stop, what is out of scope for now?",
        "criteria": ["Unbounded", "Weak hint", "Roughly bounded",
                     "Clearly bounded"],
    },
}

# Ordered by how much lift a fix typically gives, worst first.
PRIORITY = ["assumptions", "success_test", "constraints", "deliverable",
            "single_task", "scope_bounds", "context_supplied", "format"]

REPAIR = {
    "deliverable": "Name the artifact. 'A committed script at path X', not 'help with X'.",
    "success_test": "Add the check. 'Verified by running Y and seeing Z' — a command, a measurement, a number.",
    "context_supplied": "Supply what only you know: prior attempts, environment limits, what already failed.",
    "constraints": "Add a do-not list. The single highest-value line in most prompts.",
    "assumptions": "Split goal from method: 'I want OUTCOME. I think METHOD would work — check that before building it.'",
    "single_task": "Split it. Unrelated asks in one prompt each get a fraction of the attention.",
    "format": "Say the shape: length, structure, whether you want prose or a table or a file.",
    "scope_bounds": "Bound it: 'smallest version that proves it', or 'production-ready, no shortcuts'.",
}


def score(text: str, backend: str = "openrouter") -> dict:
    r = jev.classify(text[:60000], RUBRICS, backend)
    if "error" in r:
        return {"error": r["error"]}
    out, conf = {}, {}
    for k, v in r.get("answers", {}).items():
        if "score" in v:
            out[k] = float(v["score"])
            conf[k] = float(v.get("confidence", 0))
    return {"scores": out, "confidence": conf,
            "overall": sum(out.values()) / len(out) if out else None,
            "model": jev.LAST_MODEL_VERSION[0]}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--prompt")
    g.add_argument("--file")
    ap.add_argument("--backend", choices=["openrouter", "demo"], default="openrouter")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    text = a.prompt if a.prompt else Path(a.file).read_text(errors="replace")
    r = score(text, a.backend)
    if "error" in r:
        print(f"  error: {r['error']}", file=sys.stderr)
        return 2
    if a.json:
        print(json.dumps(r, indent=2))
        return 0

    print(f"\n  PROMPT DIAGNOSTIC — {len(text)} chars · model {r['model']}\n")
    print(f"  {'rubric':<18}{'score':>7}  {'':<26}")
    print("  " + "-" * 56)
    for k in PRIORITY:
        v = r["scores"].get(k)
        if v is None:
            continue
        bar = "#" * int(round(v / 3 * 20))
        print(f"  {k:<18}{v:>7.2f}  {bar}")
    print(f"\n  {'OVERALL':<18}{r['overall']:>7.2f} / 3.00")

    weak = [k for k in PRIORITY if r["scores"].get(k, 3) < 1.8]
    if weak:
        print(f"\n  FIX THESE FIRST ({len(weak)}), highest lift first:\n")
        for k in weak:
            print(f"    {k} ({r['scores'][k]:.2f})")
            print(f"      {REPAIR[k]}\n")
    else:
        print("\n  No rubric below 1.8. Structurally sound.\n")
    print("  This scores STRUCTURE. A well-formed prompt built on a false")
    print("  premise still produces confident wrong work — the assumptions")
    print("  rubric flags the premise; judging it is yours.\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
