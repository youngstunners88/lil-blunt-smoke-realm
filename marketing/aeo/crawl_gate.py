#!/usr/bin/env python3
"""
Check that the live site serves real HTML, before trusting any other signal.

This is the gate every other measurement depends on. The site is a
client-rendered React app, so the failure mode is not "ranks badly" but
"a crawler sees an empty div". Those look identical from a browser and have
completely different fixes, and no amount of content or structured data helps
while the second one is true.

Two things are checked:

  claims    Do the load-bearing sentences survive with JavaScript stripped?
            That is what a non-executing crawler reads and what an answer
            engine can quote.
  distinct  Does each extra URL return different HTML from the homepage?
            An SPA fallback serves the same shell for every path, so a route
            that looks like a page can be the homepage wearing a hat. Body
            hashes settle it.

    python3 marketing/aeo/crawl_gate.py
    python3 marketing/aeo/crawl_gate.py --base http://127.0.0.1:8000

Exit status is 0 only if every required claim is present on the homepage, so
this can gate a deploy or a cron chain.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = "https://www.smokegame.win"
PATHS = ["/", "/about/", "/how-to-play/", "/docs/", "/troubleshooting/",
         "/llms.txt", "/robots.txt", "/sitemap.xml"]

UA = ("Mozilla/5.0 (compatible; SmokeRealmCrawlGate/1.0; "
      "+https://www.smokegame.win/)")

# A real browser string. The host has been observed serving a completely
# different document depending on the user agent, so measuring only one of
# them reports a state that no one actually experiences. See check_ua_split.
BROWSER_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")


def fetch(url: str, timeout: int, ua: str = UA) -> tuple[int, str, str]:
    """Return (status, final_url, body). Redirects are followed."""
    req = urllib.request.Request(url, headers={"User-Agent": ua})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.geturl(), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, url, ""
    except Exception as e:  # noqa: BLE001 - a loop or DNS failure is the finding
        return 0, url, f"__ERROR__ {type(e).__name__}: {str(e)[:160]}"


def visible_text(html: str) -> str:
    """What remains once JavaScript is stripped — the crawler's view."""
    html = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", html,
                  flags=re.S | re.I)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default=BASE)
    ap.add_argument("--timeout", type=int, default=30)
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    claims_file = HERE / "claims.json"
    if not claims_file.exists():
        print(f"Missing {claims_file}", file=sys.stderr)
        return 2
    claims = json.loads(claims_file.read_text())

    # Fetch a path that cannot exist. Whatever comes back is this host's
    # not-found behaviour, and any real URL matching it is an SPA fallback.
    # Comparing against the homepage instead is unreliable: the boundary node
    # serves the homepage at different sizes between requests, so a single
    # homepage fetch is not a stable reference to diff against.
    _, _, sentinel_body = fetch(
        args.base + "/__crawl_gate_sentinel_does_not_exist__/", args.timeout)
    sentinel = (hashlib.sha256(sentinel_body.encode()).hexdigest()[:12]
                if sentinel_body and not sentinel_body.startswith("__ERROR__")
                else None)

    status, final, body = fetch(args.base + "/", args.timeout)
    if body.startswith("__ERROR__"):
        print(f"\n  FAIL  homepage unreachable: {body[10:]}")
        print("\n  Nothing downstream of this is measurable. Fix reachability "
              "first;\n  see the dns-apex-fix skill for the redirect-loop "
              "case.\n")
        return 1

    home_text = visible_text(body)
    home_hash = hashlib.sha256(body.encode()).hexdigest()[:12]

    print(f"\n  Crawl gate — {args.base}")
    print(f"  homepage: HTTP {status}, {len(body)} bytes, "
          f"{len(home_text)} chars visible without JS\n")

    # Everything below measures the crawler's view. If the host answers a
    # browser with a different document, that view is only half the story —
    # and the half a human never sees. Checking claims against one variant
    # while the other is the one Google indexes reports a state that is not
    # true of either. This check exists because exactly that happened.
    _, _, browser_body = fetch(args.base + "/", args.timeout, ua=BROWSER_UA)
    ua_split = (not browser_body.startswith("__ERROR__")
                and browser_body != body)
    if ua_split:
        b_title = re.search(r"<title>(.*?)</title>", browser_body,
                            re.I | re.S)
        c_title = re.search(r"<title>(.*?)</title>", body, re.I | re.S)
        print("  !! USER-AGENT SPLIT — the host serves two different pages\n")
        print(f"     crawler view : {len(body):>7} bytes  "
              f"{(c_title.group(1).strip()[:52] if c_title else '(no title)')}")
        print(f"     browser view : {len(browser_body):>7} bytes  "
              f"{(b_title.group(1).strip()[:52] if b_title else '(no title)')}")
        print("\n     Search engines index the crawler view. Content that "
              "only exists in\n     the browser view is invisible to them, "
              "and two variants that differ\n     on title or canonical are "
              "a cloaking risk, not just a bug.\n")

    # An empty body behind a 3xx is a redirect problem, not a rendering one.
    # Reporting it as "a shell" would send someone to rewrite HTML that is
    # fine and never reachable, so the two are separated here.
    if status in (301, 302, 307, 308) or (status == 0 and not body):
        print(f"  FAIL  homepage answered HTTP {status} with no body — the "
              f"request never\n        reached a page. This is a redirect "
              f"problem, not a content one:\n        urllib follows "
              f"redirects, so an empty result means a loop.\n"
              f"        Check `curl -sI {args.base}` and see dns-apex-fix.\n")
        return 1
    if len(home_text) < 400:
        print(f"  FAIL  only {len(home_text)} chars survive JS removal — this "
              f"is a shell.\n        A crawler that does not execute "
              f"JavaScript sees nothing here.\n")

    browser_text = ("" if browser_body.startswith("__ERROR__")
                    else visible_text(browser_body))
    hdr = f"  {'claim':<14}{'crawler':>9}"
    if ua_split:
        hdr += f"{'browser':>9}"
    print(hdr + "   text")
    print("  " + "-" * 66)
    missing = []
    for key, sentence in claims.items():
        # Compare on collapsed whitespace: the source wraps these across lines.
        needle = re.sub(r"\s+", " ", sentence).lower()
        ok = needle in home_text.lower()
        # A claim that is only readable in the browser variant is still
        # missing from the document search engines index, so it stays a
        # failure — but showing both columns says *why* it looks present.
        if not ok:
            missing.append(key)
        row = f"  {key:<14}{'yes' if ok else 'NO':>9}"
        if ua_split:
            b_ok = needle in browser_text.lower()
            row += f"{'yes' if b_ok else 'NO':>9}"
        print(row + f"   {sentence[:44]}")

    print(f"\n  {'path':<22}{'status':>7}{'bytes':>8}  real page?")
    print("  " + "-" * 66)
    if sentinel is None:
        print("  (could not fetch the sentinel path; phantom-page detection off)")
    phantom = []
    for p in PATHS:
        st, _, b = fetch(args.base + p, args.timeout)
        if b.startswith("__ERROR__"):
            print(f"  {p:<22}{'ERR':>7}{'':>8}  {b[10:60]}")
            continue
        h = hashlib.sha256(b.encode()).hexdigest()[:12]
        if p == "/":
            note = "—"
        elif sentinel and h == sentinel:
            note = "NO — SPA fallback, not a real page"
            phantom.append(p)
        else:
            note = "yes"
        print(f"  {p:<22}{st:>7}{len(b):>8}  {note}")

    if phantom:
        print(f"\n  {len(phantom)} path(s) return the app shell rather than a "
              f"document:\n        {', '.join(phantom)}")
        print("        These answer 200 and look fine in a browser, but a "
              "crawler sees\n        a duplicate of the homepage. They are not "
              "indexable as pages.")

    if missing:
        print(f"\n  FAIL  {len(missing)} claim(s) missing from crawlable HTML: "
              f"{', '.join(missing)}")
        print("        Fix these before probing answer engines. A sentence a "
              "crawler\n        cannot read is a sentence no model can quote.\n")
        return 1

    print("\n  PASS  every claim is readable without JavaScript.\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
