#!/usr/bin/env python3
"""
Measure whether answer engines recommend this game, and record it over time.

The method follows Dan Petrovic's: prompt volume is not a real quantity, so
nothing here tries to estimate it. What is real and repeatable is asking a
grounded model the kind of question a player would ask, in a structured form,
and recording where the brand lands in the answer — then watching that series
move as the site changes.

Four things are recorded per probe, because any one alone misleads:

  ordinal       position in the returned list; 1 is best, absent is worst
  frequency     how often the brand appears at all across runs
  citation share our URLs as a fraction of every URL the model leaned on
  mention share  our brand as a fraction of every brand named

Share of voice blends mention and citation share into one number to trend.

Web grounding is left ON deliberately. Ungrounded, a model answers from frozen
pre-training and the series measures nothing but its training snapshot; the
point is to observe the index moving underneath it.

    export OPENROUTER_API_KEY=...
    python3 marketing/aeo/probe.py --run          # probe and append to history
    python3 marketing/aeo/probe.py --report       # trend the recorded history
    python3 marketing/aeo/probe.py --run --models gemini,kimi
"""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import json
import os
import re
import statistics
import sys
import urllib.error
import urllib.request
from pathlib import Path

API = "https://openrouter.ai/api/v1/chat/completions"
HERE = Path(__file__).resolve().parent

# The :online suffix attaches OpenRouter's web plugin, which is what puts a
# real search index underneath the answer. Without it this measures nothing.
MODELS = {
    "gemini": "google/gemini-3.7-flash:online",
    "kimi": "moonshotai/kimi-k3:online",
    "grok": "x-ai/grok-4.6:online",
}

# Substrings that mean "this recommendation is us". Case-insensitive. The bare
# artist name "lil blunt" is deliberately absent — it collides with a musician,
# so counting it would inflate every reading.
OURS = ["smokegame.win", "smoke realm", "lil blunt: the smoke realm",
        "lil blunt adventure", "youngstunners88.itch.io"]

# Structure is requested AFTER a normal answer, not instead of one. Demanding
# JSON-only output makes the model skip its web search and answer from frozen
# pre-training — annotations come back empty and the probe silently measures
# the training snapshot instead of the live index.
ASK = (
    "{question}\n\n"
    "Search the web, then answer normally with your recommendations.\n\n"
    "After your answer, on a new line, append a machine-readable summary "
    "of the SAME recommendations in the SAME order, fenced exactly like this:\n"
    "```json\n"
    '{{"recommendations": [{{"name": "...", "url": "..."}}]}}\n'
    "```\n"
    "Order best-first, 3 to 10 entries."
)


def load(name: str, default):
    p = HERE / name
    return json.loads(p.read_text()) if p.exists() else default


def call(model: str, prompt: str, timeout: int) -> dict:
    body = {
        "model": model,
        "max_tokens": 2000,
        "messages": [{"role": "user", "content": prompt}],
    }
    req = urllib.request.Request(
        API, data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
                 "Content-Type": "application/json"},
        method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}: {e.read().decode(errors='replace')[:200]}"}
    except Exception as e:  # noqa: BLE001
        return {"error": f"{type(e).__name__}: {str(e)[:200]}"}


def extract_json(text: str) -> dict | None:
    """Pull the JSON object out of a reply that may be fenced or padded."""
    # The JSON now trails a prose answer, so prefer the last fenced block.
    fences = re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.S)
    if fences:
        text = fences[-1]
    else:
        text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.M).strip()
    # Scan for a balanced {...} so trailing commentary cannot break it.
    start = text.find("{")
    if start < 0:
        return None
    depth, in_str, esc = 0, False, False
    for i, ch in enumerate(text[start:], start):
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i + 1])
                except json.JSONDecodeError:
                    return None
    return None


def is_ours(rec: dict) -> bool:
    blob = f"{rec.get('name', '')} {rec.get('url', '')}".lower()
    return any(o in blob for o in OURS)


def cited_urls(resp: dict) -> list[str]:
    """Sources the model leaned on, from web-plugin annotations.

    Gemini returns its citations as opaque vertexaisearch redirect links, so
    the real domain never appears in the URL. It does appear in the title, so
    both fields are kept and matched against.
    """
    out = []
    for c in resp.get("choices", []):
        for a in (c.get("message", {}).get("annotations") or []):
            uc = a.get("url_citation") or {}
            u, t = uc.get("url") or a.get("url") or "", uc.get("title") or ""
            if u or t:
                out.append(f"{t} {u}".strip())
    return out


def probe_one(alias: str, model: str, q: dict, timeout: int) -> dict:
    resp = call(model, ASK.format(question=q["question"]), timeout)
    row = {
        "ts": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "model": alias, "entity": q["entity"], "question": q["question"],
    }
    if "error" in resp:
        return {**row, "error": resp["error"]}

    content = (resp["choices"][0]["message"].get("content") or "").strip()
    data = extract_json(content)
    if not data or "recommendations" not in data:
        return {**row, "error": "unparseable", "raw": content[:300]}

    recs = [r for r in data["recommendations"] if isinstance(r, dict)]
    ordinal = next((i + 1 for i, r in enumerate(recs) if is_ours(r)), None)
    urls = cited_urls(resp)

    return {
        **row,
        "n_recs": len(recs),
        "ordinal": ordinal,                        # None = not mentioned
        "brands": [r.get("name", "")[:60] for r in recs],
        "n_cited": len(urls),
        "n_cited_ours": sum(1 for u in urls
                            if any(o in u.lower() for o in OURS)),
        "cost": (resp.get("usage") or {}).get("cost", 0.0),
    }


def cmd_run(args) -> int:
    questions = load("questions.json", None)
    if not questions:
        print(f"No questions file at {HERE / 'questions.json'}", file=sys.stderr)
        return 1

    aliases = [a.strip() for a in args.models.split(",") if a.strip()]
    jobs = [(a, MODELS[a], q) for a in aliases for q in questions]
    print(f"probing {len(jobs)} (model x question) pairs...", file=sys.stderr)

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        rows = list(pool.map(
            lambda j: probe_one(j[0], j[1], j[2], args.timeout), jobs))

    hist = Path(args.history)
    hist.parent.mkdir(parents=True, exist_ok=True)
    with hist.open("a") as f:
        for r in rows:
            f.write(json.dumps(r) + "\n")

    ok = [r for r in rows if "error" not in r]
    seen = [r for r in ok if r["ordinal"]]
    cost = sum(r.get("cost") or 0 for r in ok)
    for r in rows:
        if "error" in r:
            print(f"  ! {r['model']:<7} {r['entity'][:34]:<34} {r['error'][:60]}",
                  file=sys.stderr)
    print(f"\n  probes ok      {len(ok)}/{len(rows)}")
    tail = (f" (mean ordinal {statistics.mean(r['ordinal'] for r in seen):.1f})"
            if seen else "")
    print(f"  mentioned      {len(seen)}/{len(ok)}{tail}")
    print(f"  appended       {hist}")
    print(f"  cost           ${cost:.4f}")
    return 0


def cmd_report(args) -> int:
    hist = Path(args.history)
    if not hist.exists():
        print(f"No history at {hist}. Run --run first.", file=sys.stderr)
        return 1
    rows = [json.loads(l) for l in hist.read_text().splitlines() if l.strip()]
    ok = [r for r in rows if "error" not in r]
    if not ok:
        print("History has no successful probes.", file=sys.stderr)
        return 1

    # Group by calendar day so a trend is readable at a glance.
    days: dict[str, list] = {}
    for r in ok:
        days.setdefault(r["ts"][:10], []).append(r)

    print(f"\n  AEO share of voice — {len(ok)} probes over {len(days)} day(s)\n")
    print(f"  {'date':<12}{'probes':>7}{'seen':>6}{'rate':>7}"
          f"{'ord':>6}{'cite%':>7}{'SoV':>7}")
    print("  " + "-" * 52)
    for day in sorted(days):
        rs = days[day]
        seen = [r for r in rs if r["ordinal"]]
        rate = len(seen) / len(rs)
        ordm = statistics.mean(r["ordinal"] for r in seen) if seen else 0
        tot_c = sum(r.get("n_cited", 0) for r in rs)
        our_c = sum(r.get("n_cited_ours", 0) for r in rs)
        cite = our_c / tot_c if tot_c else 0.0
        # Mention share weights position: rank 1 counts full, rank 5 a fifth.
        ment = sum(1 / r["ordinal"] for r in seen) / len(rs)
        sov = (ment + cite) / 2
        print(f"  {day:<12}{len(rs):>7}{len(seen):>6}{rate:>6.0%}"
              f"{ordm:>6.1f}{cite:>6.0%}{sov:>7.2f}")

    # Which competitors keep showing up is the most actionable output here:
    # those pages are the ones already selected as citation sources.
    rivals: dict[str, int] = {}
    for r in ok:
        for b in r.get("brands", []):
            if b and not any(o in b.lower() for o in OURS):
                rivals[b] = rivals.get(b, 0) + 1
    if rivals:
        print("\n  Most-recommended competitors (citation-mining targets):")
        for b, n in sorted(rivals.items(), key=lambda x: -x[1])[:12]:
            print(f"    {n:>3}x  {b}")

    print("\n  Reading it: 'seen' is the only number that matters early. Until")
    print("  the rate leaves zero, ordinal and SoV are noise on an empty set.")
    print("  Do not call a change a win on one day's movement — these are small")
    print("  samples and models are non-deterministic. Look for a shift that")
    print("  holds for three consecutive runs.\n")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run", action="store_true", help="Probe and append")
    ap.add_argument("--report", action="store_true", help="Trend the history")
    ap.add_argument("--models", default="gemini,kimi,grok")
    ap.add_argument("--history", default="marketing/aeo/history.jsonl")
    ap.add_argument("--timeout", type=int, default=240)
    ap.add_argument("--workers", type=int, default=6)
    args = ap.parse_args()

    if args.run and not os.environ.get("OPENROUTER_API_KEY"):
        print("OPENROUTER_API_KEY is not set.", file=sys.stderr)
        return 1
    for a in [x.strip() for x in args.models.split(",") if x.strip()]:
        if a not in MODELS:
            print(f"Unknown alias {a!r}. Known: {', '.join(MODELS)}", file=sys.stderr)
            return 1

    if args.run:
        rc = cmd_run(args)
        return cmd_report(args) if (rc == 0 and args.report) else rc
    if args.report:
        return cmd_report(args)
    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
