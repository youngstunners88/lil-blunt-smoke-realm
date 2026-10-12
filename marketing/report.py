#!/usr/bin/env python3
"""
Read the funnel out of PostHog, split by ad creative.

This is the other half of the instrumentation in `src/frontend/src/lib/
analytics.ts`. Ad platforms tell you what happened up to the click; this tells
you what happened after it. Run it a day or two into any campaign.

The numbers it prints are the ones worth learning to read:

  visitors      how many people the creative actually delivered
  reached 50%   did the page hold them (a landing-page signal, not an ad one)
  play clicks   the conversion — they went to open the game
  play rate     play clicks / visitors, the quality of the traffic

A creative with a high click-through but a low play rate bought you the wrong
people, or promised something the page did not deliver. That distinction is
invisible inside the ad platform, and it is most of the skill.

Usage:
    export POSTHOG_PERSONAL_API_KEY=...     # never commit this
    python3 marketing/report.py [--days 7]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

PROJECT_ID = "535802"
HOST = "https://us.posthog.com"

# Split by creative first, then source. utm_content is the variant label, so
# it is the axis a creative test is actually decided on.
FUNNEL_QUERY = """
SELECT
    coalesce(nullIf(properties.utm_content, ''), '(none)')  AS creative,
    coalesce(nullIf(properties.utm_source,  ''), '(direct)') AS source,
    count(DISTINCT person_id)                                AS visitors,
    countIf(event = 'play_click')                            AS play_clicks,
    count(DISTINCT if(event = 'scroll_depth'
        AND toFloat(properties.depth_pct) >= 50,
        person_id, NULL))                                    AS reached_half
FROM events
WHERE timestamp > now() - INTERVAL {days} DAY
GROUP BY creative, source
ORDER BY visitors DESC
LIMIT 40
"""


def query(hogql: str, api_key: str) -> list[list]:
    payload = json.dumps({"query": {"kind": "HogQLQuery", "query": hogql}}).encode()
    req = urllib.request.Request(
        f"{HOST}/api/projects/{PROJECT_ID}/query/",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.load(resp).get("results", [])
    except urllib.error.HTTPError as exc:
        # PostHog puts the useful part (bad function, unknown field) in the
        # body, which the default traceback throws away.
        detail = exc.read().decode(errors="replace")
        try:
            detail = json.loads(detail).get("detail", detail)
        except json.JSONDecodeError:
            pass
        print(f"PostHog query failed (HTTP {exc.code}): {detail}", file=sys.stderr)
        raise SystemExit(1) from None


def bar(pct: float, width: int = 18) -> str:
    filled = int(round(pct / 100 * width))
    return "█" * filled + "·" * (width - filled)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=7)
    args = ap.parse_args()

    api_key = os.environ.get("POSTHOG_PERSONAL_API_KEY")
    if not api_key:
        print("POSTHOG_PERSONAL_API_KEY is not set.", file=sys.stderr)
        return 1

    rows = query(FUNNEL_QUERY.format(days=args.days), api_key)

    if not rows:
        print(f"\nNo events in the last {args.days} days.")
        print("If a campaign is live, check the ad's URL actually carries "
              "?utm_source=...&utm_content=...\n")
        return 0

    print(f"\n  SMOKE REALM FUNNEL — last {args.days} days")
    print(f"  {'creative':<16}{'source':<12}{'visitors':>9}"
          f"{'half':>7}{'plays':>7}{'play rate':>11}   quality")
    print("  " + "─" * 78)

    tot_v = tot_p = 0
    for creative, source, visitors, plays, half in rows:
        visitors, plays, half = int(visitors), int(plays), int(half)
        tot_v += visitors
        tot_p += plays
        rate = (plays / visitors * 100) if visitors else 0.0
        print(f"  {creative:<16}{source:<12}{visitors:>9}"
              f"{half:>7}{plays:>7}{rate:>10.1f}%   {bar(rate)}")

    print("  " + "─" * 78)
    overall = (tot_p / tot_v * 100) if tot_v else 0.0
    print(f"  {'TOTAL':<28}{tot_v:>9}{'':>7}{tot_p:>7}{overall:>10.1f}%\n")

    # The honest-reading rule. At small samples the temptation is to declare a
    # winner off a couple of clicks; this stops that.
    ranked = sorted(
        ((r[0], int(r[2]), int(r[3])) for r in rows if int(r[2]) > 0),
        key=lambda r: (r[2] / r[1]),
        reverse=True,
    )
    if len(ranked) >= 2:
        (top_n, top_v, top_p), (nd_n, nd_v, nd_p) = ranked[0], ranked[1]
        top_r, nd_r = top_p / top_v, nd_p / nd_v
        if min(top_v, nd_v) < 100:
            print(f"  Too early to call: '{top_n}' leads, but with under 100 "
                  f"visitors per creative\n  the gap is noise. Keep running.\n")
        elif nd_r > 0 and (top_r - nd_r) / nd_r < 0.30:
            print(f"  Call it a tie: '{top_n}' and '{nd_n}' are within 30%. "
                  f"Pick on brand judgment,\n  not on this data.\n")
        else:
            lift = ((top_r - nd_r) / nd_r * 100) if nd_r else float("inf")
            print(f"  Winner: '{top_n}' converts {lift:.0f}% better than "
                  f"'{nd_n}'.\n  Put the next budget behind it and write the "
                  f"following test against it.\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
