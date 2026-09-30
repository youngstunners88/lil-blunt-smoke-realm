#!/usr/bin/env python3
"""
One-command check of what a Caffeine publish was supposed to deliver.

Caffeine's builder cannot fetch its own password-protected preview, so its
"verified" means "checked in source". Only the live site can confirm a publish,
and only after the publish. This encodes the expected end state for Draft 43 so
that check is one command instead of six curls.

    python3 marketing/aeo/verify_publish.py

Exit code is the number of failed expectations. Run it before publishing for a
baseline (expect failures) and again after (expect zero).

Each check compares against the HOMEPAGE, not a keyword: a phantom page is the
homepage served in place of the page, so it cannot carry another page's <h1>.
"""
import re
import sys
import urllib.request

SITE = "https://www.smokegame.win"
UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"


def get(path: str) -> str:
    sep = "&" if "?" in path else "?"
    req = urllib.request.Request(f"{SITE}/{path}{sep}cb={abs(hash(path)) % 10**8}",
                                 headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read().decode(errors="replace")
    except Exception:  # noqa: BLE001
        return ""


def h1(body: str) -> str:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S | re.I)
    return re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else ""


def text(body: str) -> str:
    body = re.sub(r"<(script|style).*?</\1>", " ", body, flags=re.S | re.I)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body))


results: list[tuple[bool, str]] = []
def check(ok: bool, label: str) -> None:
    results.append((ok, label))


home = get("")
home_h1 = h1(home)
check(bool(home), "homepage reachable")
check(home.count("analytics.crawlconsole.com") == 1, "tracker present exactly once")
check('"applicationCategory": "GameApplication"' in home, "applicationCategory is GameApplication")
check("signed on the Internet Computer" not in home, "on-chain claim absent from homepage")

# Five pages that must each serve their own document, not the homepage.
for p in ["accessibility", "terms", "faq/controls", "faq/wallet", "faq/not-the-artist"]:
    served = h1(get(f"{p}/"))
    check(bool(served) and served != home_h1, f"/{p}/ serves its own page (h1: {served[:40]!r})")

prv = text(get("privacy/"))
check(len(re.findall(r"\bAnalytics\b", prv)) >= 1, "/privacy/ has an Analytics section")
raw_prv = get("privacy/")
heads = re.findall(r"<h[1-6][^>]*>\s*Analytics\s*</h[1-6]>", raw_prv, re.I)
check(len(heads) == 1, f"/privacy/ has exactly ONE Analytics heading (found {len(heads)})")
check("does not set cookies" in prv, "/privacy/ keeps the CrawlConsole cookie sentence")
check("Crawl Console Inc" in prv, "/privacy/ names Crawl Console Inc")
check("crawlconsole.com/privacy" in prv, "/privacy/ links the CrawlConsole policy")

ts = h1(get("troubleshooting/"))
check(bool(ts) and ts != home_h1, "/troubleshooting/ unchanged and still its own page")

fails = 0
print(f"\n  PUBLISH CHECK — {SITE}\n")
for ok, label in results:
    print(f"  [{'pass' if ok else 'FAIL'}] {label}")
    fails += 0 if ok else 1
print(f"\n  {len(results) - fails}/{len(results)} passed\n")
sys.exit(fails)
