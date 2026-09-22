#!/usr/bin/env python3
"""
Search-market intelligence via Monid's Ahrefs and Semrush endpoints.

Monid resells Ahrefs and Semrush per call, which puts data that normally costs
$129+/month within reach of a $10 budget. The catch is the billing model, and
it is the reason this wrapper exists rather than raw `monid run`:

  **Ahrefs endpoints bill PER RETURNED ROW, and `limit` defaults to 100.**

At $0.072/row for organic-keywords, one accidental default call is $7.20. On a
$10 balance that is most of the budget, spent silently, on a query nobody read.
Every command here passes an explicit small limit and prints the worst-case
cost before spending anything.

An empty result is free, which makes probing cheap: asking whether a keyword
has any volume at all costs nothing when the answer is no.

    python3 marketing/aeo/market.py keywords "free wild west game" "browser platformer"
    python3 marketing/aeo/market.py competitors --limit 5
    python3 marketing/aeo/market.py their-keywords crazygames.com --limit 10
    python3 marketing/aeo/market.py ours

Add --yes to skip the confirmation prompt (for cron); it still refuses to
exceed --max-spend.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

OUT = Path("marketing/aeo/market")

# Per-row prices verified against `monid inspect` on 2026-08-29. Re-check before
# trusting these: Monid can reprice, and a stale number here means a call costs
# more than the guard predicted.
PRICES = {
    "keywords": ("ahrefs", "/keywords-explorer/overview", 0.126),
    "their-keywords": ("ahrefs", "/site-explorer/organic-keywords", 0.072),
    "competitors": ("ahrefs", "/site-explorer/organic-competitors", 0.042),
    "pages": ("ahrefs", "/site-explorer/pages-by-traffic", 0.168),
    "history": ("ahrefs", "/site-explorer/metrics-history", 0.063),
    "refdomains": ("ahrefs", "/site-explorer/refdomains", 0.018),
    "authority": ("ahrefs", "/site-explorer/domain-rating", 0.006),
}

SITE = "smokegame.win"


def run_monid(provider: str, endpoint: str, query: dict) -> dict:
    cmd = ["monid", "run", "-e", endpoint, "-p", provider, "-j",
           "--query", json.dumps(query)]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if p.returncode != 0:
        print(p.stderr[-400:] or p.stdout[-400:], file=sys.stderr)
        raise SystemExit(1)
    try:
        return json.loads(p.stdout)
    except json.JSONDecodeError:
        print(p.stdout[-600:], file=sys.stderr)
        raise SystemExit(1)


def confirm(worst_case: float, max_spend: float, auto: bool) -> None:
    print(f"  worst case: ${worst_case:.3f}  (an empty result is free)")
    if worst_case > max_spend:
        print(f"  REFUSED — exceeds --max-spend ${max_spend:.2f}. Lower "
              f"--limit or raise the cap deliberately.", file=sys.stderr)
        raise SystemExit(1)
    if not auto:
        # stdin may not be a terminal under cron; treat that as a refusal
        # rather than silently spending.
        if not sys.stdin.isatty():
            print("  Not a terminal and --yes not given; refusing to spend.",
                  file=sys.stderr)
            raise SystemExit(1)
        if input("  proceed? [y/N] ").strip().lower() != "y":
            raise SystemExit(0)


def rows_of(d: dict) -> list:
    out = d.get("output") or {}
    if isinstance(out, dict):
        for v in out.values():
            if isinstance(v, list):
                return v
    return out if isinstance(out, list) else []


def spent(d: dict) -> float:
    return (d.get("billing", {}).get("reportedCost", {}).get("value", 0)) / 1e6


def save(name: str, payload) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / f"{name}.json"
    p.write_text(json.dumps(payload, indent=2))
    print(f"\n  saved {p}")


def cmd_keywords(args) -> int:
    """Volume and difficulty for specific terms — the winnability question."""
    kws = args.terms[:args.limit]
    provider, endpoint, unit = PRICES["keywords"]
    print(f"\n  {len(kws)} keyword(s) x ${unit}/row")
    confirm(len(kws) * unit, args.max_spend, args.yes)

    d = run_monid(provider, endpoint,
                  {"country": args.country, "keywords": kws})
    rows = rows_of(d)
    print(f"\n  {'keyword':<38}{'volume':>9}{'KD':>5}{'intent':>14}")
    print("  " + "-" * 66)
    found = {r.get("keyword") for r in rows}
    for r in rows:
        intents = [k for k, v in (r.get("intents") or {}).items() if v]
        print(f"  {str(r.get('keyword'))[:37]:<38}{str(r.get('volume')):>9}"
              f"{str(r.get('difficulty')):>5}{(intents[0] if intents else '-'):>14}")
    for k in kws:
        if k not in found:
            print(f"  {k[:37]:<38}{'no data':>9}{'-':>5}{'-':>14}")

    print(f"\n  billed ${spent(d):.3f}")
    if len(found) < len(kws):
        print("\n  'no data' means Ahrefs has no volume record — the term is "
              "searched\n  too rarely to measure. That is not a ranking "
              "problem to solve with\n  content; it means the query is not a "
              "traffic source at all. Judge\n  such terms by whether a person "
              "who already knows the brand would\n  type them, not by SEO "
              "potential.")
    save("keywords", rows)
    return 0


def cmd_competitors(args) -> int:
    """Who ranks for what we want to rank for — the citation-mining target."""
    provider, endpoint, unit = PRICES["competitors"]
    print(f"\n  up to {args.limit} competitors x ${unit}/row")
    confirm(args.limit * unit, args.max_spend, args.yes)

    d = run_monid(provider, endpoint,
                  {"target": args.target, "date": args.date,
                   "country": args.country, "limit": args.limit})
    rows = rows_of(d)
    if not rows:
        print("\n  No competitors returned. With no rankings of our own there "
              "is no\n  overlap to compute — run this against a competitor's "
              "domain instead\n  to see who *they* compete with.")
    for r in rows:
        print(f"  {str(r.get('competitor_domain') or r.get('domain'))[:44]:<46}"
              f"{str(r.get('keywords_common') or r.get('common_keywords')):>8}")
    print(f"\n  billed ${spent(d):.3f}")
    save("competitors", rows)
    return 0


def cmd_their_keywords(args) -> int:
    """What a competitor ranks for — the gap list, and it works at zero traffic."""
    provider, endpoint, unit = PRICES["their-keywords"]
    print(f"\n  up to {args.limit} rows x ${unit}/row  target={args.target}")
    confirm(args.limit * unit, args.max_spend, args.yes)

    d = run_monid(provider, endpoint,
                  {"target": args.target, "date": args.date,
                   "country": args.country, "limit": args.limit,
                   "mode": "subdomains"})
    rows = rows_of(d)
    print(f"\n  {'keyword':<40}{'pos':>5}{'volume':>9}")
    print("  " + "-" * 56)
    for r in rows:
        print(f"  {str(r.get('keyword'))[:39]:<40}"
              f"{str(r.get('best_position')):>5}{str(r.get('volume')):>9}")
    print(f"\n  billed ${spent(d):.3f}")
    save(f"their-keywords-{args.target.replace('/', '_')}", rows)
    return 0


def cmd_ours(args) -> int:
    """Our own footprint. Cheap, and at zero rankings it returns nothing."""
    d = run_monid("semrush", "/domain_rank",
                  {"domain": SITE, "database": args.country})
    rows = rows_of(d)
    print(f"\n  {SITE}: {len(rows)} row(s), billed ${spent(d):.3f}")
    if not rows:
        print("\n  No Semrush record. The domain ranks for nothing measurable "
              "yet,\n  which is the expected reading before indexation. This "
              "call is free\n  while that is true, so it is safe to repeat as "
              "a check.")
    else:
        print(json.dumps(rows, indent=2)[:800])
    save("ours", rows)
    return 0


def cmd_refdomains(args) -> int:
    """Who links to a target. Against a competitor this is the prospect list.

    Worth being clear about what a link is for here. Ranking in this niche was
    measured at roughly 20 visits/month for the best available term
    (LESSONS.md), so links chased for ranking are optimising a prize that is
    nearly worthless. Links are still worth having for two other reasons:
    referral clicks from people who actually read the page, and being present
    on pages that answer engines retrieve. Both favour a small relevant blog
    over a high-authority page nobody reads, which is the opposite of how
    link-building is usually scored.
    """
    provider, endpoint, unit = PRICES["refdomains"]
    print(f"\n  up to {args.limit} referring domains x ${unit}/row  "
          f"target={args.target}")
    confirm(args.limit * unit, args.max_spend, args.yes)

    # refdomains takes no date parameter, unlike the other site-explorer
    # endpoints; passing one is rejected outright.
    d = run_monid(provider, endpoint,
                  {"target": args.target, "limit": args.limit,
                   "mode": "subdomains"})
    rows = rows_of(d)
    if not rows:
        print("\n  No referring domains returned. For our own domain that is "
              "the\n  expected reading — nothing links to it yet.")
    print(f"\n  {'referring domain':<40}{'DR':>5}{'links':>7}")
    print("  " + "-" * 54)
    for r in rows:
        print(f"  {str(r.get('domain') or r.get('refdomain'))[:39]:<40}"
              f"{str(r.get('domain_rating', '-')):>5}"
              f"{str(r.get('links_to_target') or r.get('backlinks', '-')):>7}")
    print(f"\n  billed ${spent(d):.3f}")
    save(f"refdomains-{args.target.replace('/', '_')}", rows)
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    def common(p):
        p.add_argument("--country", default="us")
        p.add_argument("--date", default="2026-08-29",
                       help="Ahrefs report date (YYYY-MM-DD)")
        p.add_argument("--max-spend", type=float, default=1.00,
                       help="Refuse any call whose worst case exceeds this")
        p.add_argument("--yes", action="store_true", help="Skip confirmation")

    k = sub.add_parser("keywords", help="Volume/difficulty for terms")
    k.add_argument("terms", nargs="+")
    k.add_argument("--limit", type=int, default=8)
    common(k)

    c = sub.add_parser("competitors", help="Who competes with a target")
    c.add_argument("--target", default=SITE)
    c.add_argument("--limit", type=int, default=5)
    common(c)

    t = sub.add_parser("their-keywords", help="What a competitor ranks for")
    t.add_argument("target")
    t.add_argument("--limit", type=int, default=10)
    common(t)

    o = sub.add_parser("ours", help="Our own domain footprint (cheap)")
    common(o)

    r = sub.add_parser("refdomains", help="Who links to a target")
    r.add_argument("--target", default=SITE)
    r.add_argument("--limit", type=int, default=15)
    common(r)

    args = ap.parse_args()
    return {
        "keywords": cmd_keywords,
        "competitors": cmd_competitors,
        "their-keywords": cmd_their_keywords,
        "ours": cmd_ours,
        "refdomains": cmd_refdomains,
    }[args.cmd](args)


if __name__ == "__main__":
    raise SystemExit(main())
