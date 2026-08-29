#!/usr/bin/env python3
"""
Run a proposal through an adversarial multi-model gauntlet on OpenRouter.

council.py asks several models the same question in parallel and prints the
answers side by side. That surfaces variety, but nothing gets stress-tested:
each model's blind spots survive into its own answer untouched.

The gauntlet adds the missing step. Every draft is attacked by the models that
did not write it, each author then answers its attackers, and one model merges
what survived. Weak ideas are cheap to produce and expensive to keep, so the
value is in the attack round — a claim that three models cannot break is worth
more than three claims nobody examined.

    export OPENROUTER_API_KEY=...
    python3 marketing/gauntlet.py --brief "Design an SEO mechanism for ..."
    python3 marketing/gauntlet.py --file prompt.md --out marketing/out/plan.md

Stages: DRAFT (parallel, independent) -> ATTACK (cross-examination, blind to
authorship) -> REVISE (each author answers its attackers) -> SYNTHESIZE.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://openrouter.ai/api/v1/chat/completions"

MODELS = {
    "kimi": "moonshotai/kimi-k3",
    "grok": "x-ai/grok-4.6",
    "gemini": "google/gemini-3.7-flash",
    "qwen": "qwen/qwen3.8-max",
}

# Kimi and Gemini emit a reasoning block before any content. Starved of budget
# they spend it all thinking and return content=null, which reads as a broken
# model rather than a truncated one. These floors are what actually produced
# answers in testing; the brief pushes reasoning much longer, hence the split.
MIN_TOKENS = 3000
MIN_TOKENS_BRIEF = 6000

# Anonymous labels: an attacker that knows which model wrote a draft tends to
# argue with the model's reputation instead of the text in front of it.
LABELS = "ABCDEFGH"


def call(model: str, messages: list[dict], max_tokens: int, timeout: int) -> str:
    body = {"model": model, "max_tokens": max_tokens, "messages": messages}
    req = urllib.request.Request(
        API,
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            d = json.load(r)
    except urllib.error.HTTPError as e:
        return f"[ERROR HTTP {e.code}: {e.read().decode(errors='replace')[:200]}]"
    except Exception as e:  # noqa: BLE001 - report any transport failure verbatim
        return f"[ERROR {type(e).__name__}: {str(e)[:200]}]"

    if "error" in d:
        return f"[ERROR {str(d['error'])[:200]}]"

    msg = d["choices"][0]["message"]
    content = (msg.get("content") or "").strip()
    if not content:
        reasoning = (msg.get("reasoning") or "").strip()
        return (f"[no answer — budget exhausted during reasoning]\n{reasoning[:300]}"
                if reasoning else "[empty response]")
    return content


def fanout(jobs: list[tuple], timeout: int) -> list[str]:
    """Run (model, messages, max_tokens) jobs concurrently, preserving order."""
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(jobs)) as pool:
        futures = [pool.submit(call, m, msgs, mt, timeout) for m, msgs, mt in jobs]
        return [f.result() for f in futures]


def sys_msg(system: str | None) -> list[dict]:
    return [{"role": "system", "content": system}] if system else []


def stage_draft(aliases, prompt, system, budget, timeout):
    ask = (f"{prompt}\n\n"
           "Write your proposal. Be concrete and specific — name the actual "
           "steps, files, metrics and thresholds. Another model will attack "
           "this, so do not pad it with hedging or generic advice; every "
           "sentence you cannot defend is a liability.")
    jobs = [(MODELS[a], sys_msg(system) + [{"role": "user", "content": ask}],
             budget) for a in aliases]
    return dict(zip(aliases, fanout(jobs, timeout)))


def stage_attack(aliases, drafts, prompt, system, budget, timeout):
    """Each model attacks every draft except its own, blind to authorship."""
    label_of = {a: LABELS[i] for i, a in enumerate(aliases)}
    jobs = []
    for a in aliases:
        others = "\n\n".join(
            f"### PROPOSAL {label_of[o]}\n{drafts[o]}"
            for o in aliases if o != a
        )
        ask = (f"Original task:\n{prompt}\n\n"
               f"Below are proposals from other analysts.\n\n{others}\n\n"
               "For EACH proposal, find its most serious flaw — something that "
               "would make it fail, waste money, or produce a false reading. "
               "Be blunt and specific: name the step that breaks and why. If a "
               "proposal rests on an unverified factual claim, say so. If a "
               "part is genuinely strong, say that too in one line — but lead "
               "with what is wrong. Format as 'PROPOSAL X: ...' per proposal.")
        jobs.append((MODELS[a], sys_msg(system) + [{"role": "user", "content": ask}],
                     budget))
    return dict(zip(aliases, fanout(jobs, timeout)))


def stage_revise(aliases, drafts, attacks, prompt, system, budget, timeout):
    """Each author sees the attacks aimed at its own draft and answers them."""
    label_of = {a: LABELS[i] for i, a in enumerate(aliases)}
    jobs = []
    for a in aliases:
        mine = label_of[a]
        # Only the critiques of this author's own proposal, still anonymous.
        incoming = "\n\n".join(
            f"### CRITIC {i + 1}\n{attacks[o]}"
            for i, o in enumerate(x for x in aliases if x != a)
        )
        ask = (f"Original task:\n{prompt}\n\n"
               f"Your proposal was labelled PROPOSAL {mine}:\n\n{drafts[a]}\n\n"
               f"Critics reviewed it (read only the parts addressing "
               f"PROPOSAL {mine}):\n\n{incoming}\n\n"
               "Produce a revised proposal. Where a criticism is correct, fix "
               "it and say what changed. Where it is wrong, keep your position "
               "and say why in one line. Do not concede a point merely because "
               "it was challenged — but do not defend a broken step out of "
               "pride either. Output the revised proposal in full.")
        jobs.append((MODELS[a], sys_msg(system) + [{"role": "user", "content": ask}],
                     budget))
    return dict(zip(aliases, fanout(jobs, timeout)))


def stage_synthesize(aliases, revised, prompt, system, judge, budget, timeout):
    body = "\n\n".join(f"### REVISED PROPOSAL {LABELS[i]}\n{revised[a]}"
                       for i, a in enumerate(aliases))
    ask = (f"Original task:\n{prompt}\n\n"
           f"Three analysts drafted proposals, attacked each other's work, and "
           f"revised. Here are the survivors:\n\n{body}\n\n"
           "Merge these into ONE implementation plan. Rules:\n"
           "- Keep only what survived cross-examination. If two proposals "
           "contradict, pick one and say why in a line.\n"
           "- Order by leverage: what to do first, what can wait.\n"
           "- Every step must be concrete enough to execute without asking a "
           "follow-up question — name files, commands, metrics, thresholds.\n"
           "- Add a short 'DISCARDED' section listing ideas that were "
           "proposed and rejected, with the reason. That section prevents the "
           "same bad idea being re-proposed later.\n"
           "- Flag any claim that needs verification against a primary source "
           "before it is acted on.")
    return call(MODELS[judge], sys_msg(system) + [{"role": "user", "content": ask}],
                budget * 2, timeout)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt", nargs="?", help="The task (or use --file)")
    ap.add_argument("--file", help="Read the task from a file")
    ap.add_argument("--models", default="kimi,grok,gemini",
                    help="Comma-separated aliases: " + ",".join(MODELS))
    ap.add_argument("--judge", help="Which model synthesises (default: first)")
    ap.add_argument("--brief", action="store_true",
                    help="Prepend the project context pack as the system prompt")
    ap.add_argument("--brief-file", default="marketing/kimi-brief.md")
    ap.add_argument("--system", help="Extra system prompt")
    ap.add_argument("--max-tokens", type=int, default=4000)
    ap.add_argument("--timeout", type=int, default=600)
    ap.add_argument("--out", help="Write the full transcript here (markdown)")
    ap.add_argument("--rounds", type=int, default=1,
                    help="Attack/revise cycles. >1 re-attacks the revisions.")
    args = ap.parse_args()

    if not os.environ.get("OPENROUTER_API_KEY"):
        print("OPENROUTER_API_KEY is not set.", file=sys.stderr)
        return 1

    prompt = open(args.file).read() if args.file else args.prompt
    if not prompt:
        print("Give a prompt argument or --file.", file=sys.stderr)
        return 1

    system, budget = args.system, max(args.max_tokens, MIN_TOKENS)
    if args.brief:
        budget = max(args.max_tokens, MIN_TOKENS_BRIEF)
        brief = open(args.brief_file).read()
        system = f"{brief}\n\n{system}" if system else brief

    aliases = [x.strip() for x in args.models.split(",") if x.strip()]
    for a in aliases:
        if a not in MODELS:
            print(f"Unknown alias {a!r}. Known: {', '.join(MODELS)}", file=sys.stderr)
            return 1
    if len(aliases) < 2:
        print("A gauntlet needs at least two models.", file=sys.stderr)
        return 1
    judge = args.judge or aliases[0]

    t0 = time.time()
    log = [f"# Gauntlet\n\n**Models:** {', '.join(MODELS[a] for a in aliases)}  ",
           f"**Judge:** {MODELS[judge]}  ",
           f"**Rounds:** {args.rounds}\n\n## Task\n\n{prompt}\n"]

    def note(s):
        print(f"[{time.time() - t0:6.1f}s] {s}", file=sys.stderr)

    note(f"DRAFT  ({len(aliases)} models)")
    drafts = stage_draft(aliases, prompt, system, budget, args.timeout)
    log.append("\n## Stage 1 — Drafts\n")
    for i, a in enumerate(aliases):
        log.append(f"\n### {LABELS[i]} · {a} ({MODELS[a]})\n\n{drafts[a]}\n")

    for rnd in range(1, args.rounds + 1):
        note(f"ATTACK round {rnd}")
        attacks = stage_attack(aliases, drafts, prompt, system, budget, args.timeout)
        log.append(f"\n## Stage 2.{rnd} — Cross-examination\n")
        for a in aliases:
            log.append(f"\n### {a} attacks\n\n{attacks[a]}\n")

        note(f"REVISE round {rnd}")
        drafts = stage_revise(aliases, drafts, attacks, prompt, system,
                              budget, args.timeout)
        log.append(f"\n## Stage 3.{rnd} — Revisions\n")
        for i, a in enumerate(aliases):
            log.append(f"\n### {LABELS[i]} · {a} (revised)\n\n{drafts[a]}\n")

    note(f"SYNTHESIZE (judge={judge})")
    final = stage_synthesize(aliases, drafts, prompt, system, judge,
                             budget, args.timeout)
    log.append(f"\n## Stage 4 — Synthesis (by {judge})\n\n{final}\n")

    if args.out:
        p = Path(args.out)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text("\n".join(log))
        note(f"transcript -> {p}")

    print("\n" + "=" * 74)
    print(f"  SYNTHESIS  (judge: {MODELS[judge]})")
    print("=" * 74 + "\n")
    print(final)
    note(f"done in {time.time() - t0:.0f}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
