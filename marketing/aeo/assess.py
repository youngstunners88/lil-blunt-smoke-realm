#!/usr/bin/env python3
"""
Rapid assessment: what is ACTUALLY true about this project right now.

Built because the honest answer to "are we better off than last week?" took
twenty minutes of ad-hoc curl and turned up two things nobody knew: a live
page had silently become a phantom, and none of a week's work had reached
production. That should be one command, not an investigation.

The governing fact: **this repo is not the product.** Caffeine builds from its
own copy and ships only on a manual click, so a green repo says nothing about
what users and crawlers see. Every check here runs against production and
compares it to the repo, because the gap between them is where this project
loses time.

    python3 marketing/aeo/assess.py              # everything
    python3 marketing/aeo/assess.py --quick      # skip Jev calls, ~15s
    python3 marketing/aeo/assess.py --json

Exit code is the number of RED findings, so it can gate a routine.

METHOD NOTES, learned the hard way on this host:

  Byte size lies. The ICP boundary node serves wildly different sizes for the
  same document; a 127KB response and a 9KB response can both be real pages.
  Checked this session: a first read called four real pages phantoms on size
  alone.

  <title> lies. Every path returns the homepage title whether or not real
  content is present.

  The ONLY reliable phantom test is grepping a page for its OWN distinctive
  content — a phrase that appears on that page and nowhere else. That is what
  PAGES below encodes, and why each entry carries a hand-picked marker.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = "https://www.smokegame.win"
UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"

# Phantom detection compares each page's <h1> against the HOMEPAGE's <h1>.
#
# Three methods were tried on this host and two failed:
#
#   byte size      Fails. The boundary node serves 9KB and 127KB for equally
#                  real documents.
#   <title>        Fails. Every path returns the homepage title.
#   a keyword      Fails, and fails SILENTLY — the worst kind. The homepage is
#                  a long SPA page that already contains "burst dash", "no
#                  wallet" and "music artist". Grepping a FAQ page for its own
#                  topic therefore matched the homepage being served in its
#                  place, and three phantoms were reported as healthy.
#
# Comparing <h1> to the homepage's <h1> works because a phantom IS the
# homepage: it cannot carry another page's heading. It also needs no
# hand-maintained marker list, which is what produced the bad check.
#
# Note this separates two different problems that look alike:
#   phantom  served h1 == homepage h1        -> the page does not exist
#   drift    served h1 != repo h1            -> exists, but Caffeine's copy is stale
def _repo_pages() -> dict[str, str]:
    pub = ROOT / "src/frontend/public"
    out = {}
    for f in sorted(pub.glob("**/index.html")):
        rel = f.relative_to(pub).parent.as_posix()
        if rel == ".":
            continue
        m = re.search(r"<h1[^>]*>(.*?)</h1>", f.read_text(errors="replace"), re.S | re.I)
        out[f"{rel}/"] = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else ""
    return out


def _h1(body: str) -> str:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S | re.I)
    return re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else ""


# Things a dispatch was supposed to deliver. Each is a (label, path, needle).
SHIPPED = [
    ("canonical entry", "about/", "arcade score-chaser"),
    ("canonical entry", "how-to-play/", "arcade score-chaser"),
    ("CrawlConsole tracker", "", "analytics.crawlconsole.com"),
    ("privacy disclosure", "privacy/", "crawlconsole"),
    ("schema GameApplication", "", "GameApplication"),
]

RED, AMBER, GREEN = "RED", "AMBER", "GREEN"


def fetch(path: str, timeout: int = 25) -> str:
    req = urllib.request.Request(f"{SITE}/{path}", headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode(errors="replace")
    except Exception:  # noqa: BLE001
        return ""


def check_pages() -> list[dict]:
    home = fetch("")
    if not home:
        return [{"level": RED, "area": "reachability", "what": "homepage did not respond"}]
    home_h1 = _h1(home)
    out = []
    for path, repo_h1 in _repo_pages().items():
        body = fetch(path)
        if not body:
            out.append({"level": RED, "area": "reachability",
                        "what": f"/{path} did not respond"})
            continue
        served = _h1(body)
        if served == home_h1 or not served:
            out.append({"level": RED, "area": "phantom",
                        "what": f"/{path} does not exist on production",
                        "detail": "serves the homepage; a sitemap URL that does "
                                  "this is a soft-404 / duplicate-content signal"})
        elif repo_h1 and served != repo_h1:
            out.append({"level": AMBER, "area": "drift",
                        "what": f"/{path} exists but differs from the repo",
                        "detail": f"served {served!r} vs repo {repo_h1!r}"})
    return out


def check_shipped() -> list[dict]:
    out = []
    for label, path, needle in SHIPPED:
        body = fetch(path)
        if body and needle.lower() not in body.lower():
            out.append({"level": AMBER, "area": "not-shipped",
                        "what": f"{label} absent from /{path}",
                        "detail": "in the repo, not on production — needs a Caffeine dispatch"})
    return out


def check_repo_vs_prod() -> list[dict]:
    """Uncommitted work and unpushed commits are both invisible to Caffeine."""
    out = []
    dirty = subprocess.run(["git", "status", "--short"], cwd=ROOT,
                           capture_output=True, text=True).stdout.strip()
    if dirty:
        out.append({"level": AMBER, "area": "repo",
                    "what": f"{len(dirty.splitlines())} uncommitted file(s)"})
    ahead = subprocess.run(["git", "log", "--oneline", "@{u}..HEAD"], cwd=ROOT,
                           capture_output=True, text=True).stdout.strip()
    if ahead:
        out.append({"level": AMBER, "area": "repo",
                    "what": f"{len(ahead.splitlines())} commit(s) not pushed"})
    return out


def check_probe_freshness() -> list[dict]:
    """A measurement instrument nobody runs is not a measurement."""
    import datetime as dt
    h = ROOT / "marketing/aeo/history.jsonl"
    if not h.exists():
        return [{"level": RED, "area": "measurement", "what": "no probe history"}]
    rows = [json.loads(l) for l in h.read_text().splitlines() if l.strip()]
    ok = [r for r in rows if "error" not in r]
    if not ok:
        return [{"level": RED, "area": "measurement", "what": "no successful probes"}]
    last = max(r["ts"][:10] for r in ok)
    age = (dt.date.today() - dt.date.fromisoformat(last)).days
    seen = sum(1 for r in ok if r.get("ordinal"))
    out = []
    if age > 14:
        out.append({"level": RED, "area": "measurement",
                    "what": f"AEO probe last run {age} days ago ({last})",
                    "detail": "the scoreboard is stale; shipped work is unmeasured"})
    elif age > 7:
        out.append({"level": AMBER, "area": "measurement",
                    "what": f"AEO probe {age} days old"})
    out.append({"level": GREEN, "area": "measurement",
                "what": f"baseline: {seen}/{len(ok)} probes cited, {last}"})
    return out


def check_accuracy(quick: bool) -> list[dict]:
    if quick:
        return []
    sys.path.insert(0, str(ROOT / "marketing/aeo"))
    try:
        import jev
    except Exception as e:  # noqa: BLE001
        return [{"level": AMBER, "area": "accuracy", "what": f"jev unavailable: {e}"}]
    out = []
    # The live itch page is the most-distributed text this project owns and the
    # one that has carried a false claim longest.
    try:
        with urllib.request.urlopen(urllib.request.Request(
                "https://youngstunners88.itch.io/lil-blunt-adventure",
                headers={"User-Agent": UA}), timeout=25) as r:
            itch = r.read().decode(errors="replace")
        g = jev.gate(itch)
        if not g["passed"]:
            out.append({"level": RED, "area": "accuracy",
                        "what": "live itch.io page violates AGENTS.md blocking rules",
                        "detail": ", ".join(f"{k} {v:.2f}"
                                            for k, v in g["violations"].items())})
    except Exception as e:  # noqa: BLE001
        out.append({"level": AMBER, "area": "accuracy", "what": f"itch unreachable: {e}"})
    # Homepage as served, not as committed.
    body = fetch("")
    if body:
        g = jev.gate(body)
        if not g["passed"]:
            out.append({"level": RED, "area": "accuracy",
                        "what": "LIVE homepage violates blocking rules",
                        "detail": ", ".join(f"{k} {v:.2f}"
                                            for k, v in g["violations"].items())})
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--quick", action="store_true", help="Skip Jev accuracy calls")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    findings: list[dict] = []
    for fn in (check_pages, check_shipped, check_repo_vs_prod, check_probe_freshness):
        findings += fn()
    findings += check_accuracy(a.quick)

    if a.json:
        print(json.dumps(findings, indent=2))
        return sum(1 for f in findings if f["level"] == RED)

    order = {RED: 0, AMBER: 1, GREEN: 2}
    findings.sort(key=lambda f: order[f["level"]])
    reds = [f for f in findings if f["level"] == RED]
    ambers = [f for f in findings if f["level"] == AMBER]

    print(f"\n  PROJECT ASSESSMENT — {SITE}")
    print(f"  {len(reds)} red · {len(ambers)} amber\n")
    for f in findings:
        tag = {RED: "RED  ", AMBER: "AMBER", GREEN: "ok   "}[f["level"]]
        print(f"  [{tag}] {f['area']:<14} {f['what']}")
        if f.get("detail"):
            print(f"           {'':<14} {f['detail']}")

    print("\n  Repo state is not production state. Caffeine builds from its own")
    print("  copy and ships on a manual click — 'committed' is never 'live'.\n")
    return len(reds)


if __name__ == "__main__":
    raise SystemExit(main())
