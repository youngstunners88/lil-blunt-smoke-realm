#!/usr/bin/env python3
"""
Ask several frontier models the same question in parallel, via OpenRouter.

Useful when one opinion is not enough: generating creative variants that do
not all share one model's tics, stress-testing a plan, or getting a second
read before spending money. Each model answers independently — no model sees
another's answer — so agreement is genuine signal and disagreement is the
interesting part.

    export OPENROUTER_API_KEY=...
    python3 marketing/council.py "Critique this ad hook: 'They tried to tax the vibe'"
    python3 marketing/council.py --file brief.md --models kimi,grok
    python3 marketing/council.py "..." --system "You are a direct-response copywriter."

Verified working August 2026: kimi-k3, grok-4.6, gemini-3.7-flash,
qwen3.8-max.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import sys
import textwrap
import urllib.error
import urllib.request

API = "https://openrouter.ai/api/v1/chat/completions"

# Short aliases so callers do not have to remember provider prefixes.
MODELS = {
    "kimi": "moonshotai/kimi-k3",
    "qwen": "qwen/qwen3.8-max",
    "grok": "x-ai/grok-4.6",
    "gemini": "google/gemini-3.7-flash",
}

# Kimi and Qwen are reasoning models: they emit a `reasoning` block before any
# `content`. With a small max_tokens they burn the whole budget thinking and
# return content=null, which looks like a broken model but is just starvation.
# This floor is high enough that reasoning finishes and an answer follows.
MIN_TOKENS = 1500

# A context pack pushes reasoning much longer, so the floor rises with --brief.
# At 1500 with a brief attached, Kimi reliably starves before answering.
MIN_TOKENS_BRIEF = 5000


def ask(alias: str, model: str, prompt: str, system: str | None,
        max_tokens: int, timeout: int, min_floor: int = MIN_TOKENS) -> dict:
    body = {
        "model": model,
        "max_tokens": max(max_tokens, min_floor),
        "messages": (
            ([{"role": "system", "content": system}] if system else [])
            + [{"role": "user", "content": prompt}]
        ),
    }
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
        return {"alias": alias, "model": model, "error":
                f"HTTP {e.code}: {e.read().decode(errors='replace')[:200]}"}
    except Exception as e:  # noqa: BLE001 - report any transport failure verbatim
        return {"alias": alias, "model": model, "error": str(e)[:200]}

    if "error" in d:
        return {"alias": alias, "model": model, "error": str(d["error"])[:200]}

    msg = d["choices"][0]["message"]
    content = msg.get("content")
    if not content:
        # Ran out of budget mid-reasoning; surface that rather than an empty box.
        reasoning = (msg.get("reasoning") or "").strip()
        content = (f"[no answer — budget exhausted during reasoning; "
                   f"raise --max-tokens]\n{reasoning[:400]}"
                   if reasoning else "[empty response]")
    return {
        "alias": alias,
        "model": model,
        "content": content.strip(),
        "cost": d.get("usage", {}).get("cost", 0.0),
        "finish": d["choices"][0].get("finish_reason"),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt", nargs="?", help="The question (or use --file)")
    ap.add_argument("--file", help="Read the prompt from a file")
    ap.add_argument("--models", default="kimi,grok,gemini",
                    help="Comma-separated aliases: " + ",".join(MODELS))
    ap.add_argument("--system", help="Optional system prompt")
    # A plain flag, not an optional-value option: with nargs="?" a bare
    # `--brief "the question"` silently consumes the prompt as the filename.
    ap.add_argument("--brief", action="store_true",
                    help="Prepend the project context pack as the system "
                         "prompt. Without it these models do not know the "
                         "accuracy rules and will suggest play-to-earn copy.")
    ap.add_argument("--brief-file", default="marketing/kimi-brief.md",
                    help="Which context pack --brief loads")
    ap.add_argument("--max-tokens", type=int, default=2000)
    ap.add_argument("--timeout", type=int, default=300)
    ap.add_argument("--json", action="store_true", help="Emit raw JSON")
    args = ap.parse_args()

    if not os.environ.get("OPENROUTER_API_KEY"):
        print("OPENROUTER_API_KEY is not set.", file=sys.stderr)
        return 1

    prompt = args.prompt
    if args.file:
        prompt = open(args.file).read()
    if not prompt:
        print("Give a prompt argument or --file.", file=sys.stderr)
        return 1

    system = args.system
    min_floor = MIN_TOKENS
    if args.brief:
        min_floor = MIN_TOKENS_BRIEF
        brief = open(args.brief_file).read()
        system = f"{brief}\n\n{system}" if system else brief

    chosen = []
    for a in [x.strip() for x in args.models.split(",") if x.strip()]:
        if a not in MODELS:
            print(f"Unknown model alias {a!r}. Known: {', '.join(MODELS)}",
                  file=sys.stderr)
            return 1
        chosen.append(a)

    # Parallel: these are slow reasoning models and serialising them turns a
    # 60-second council into three minutes.
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(chosen)) as pool:
        futures = [
            pool.submit(ask, a, MODELS[a], prompt, system,
                        args.max_tokens, args.timeout, min_floor)
            for a in chosen
        ]
        results = [f.result() for f in futures]

    results.sort(key=lambda r: chosen.index(r["alias"]))

    if args.json:
        print(json.dumps(results, indent=2))
        return 0

    total = 0.0
    for r in results:
        print("\n" + "=" * 74)
        print(f"  {r['alias'].upper()}  ({r['model']})")
        print("=" * 74)
        if "error" in r:
            print(f"  ERROR: {r['error']}")
            continue
        total += r.get("cost") or 0.0
        for para in r["content"].split("\n"):
            print(textwrap.fill(para, width=72, initial_indent="  ",
                                subsequent_indent="  ") if para.strip() else "")
        if r.get("finish") == "length":
            print("\n  [truncated — raise --max-tokens]")

    print("\n" + "-" * 74)
    print(f"  total cost: ${total:.4f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
