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

TWO VIEWS, and they differ. A crawler-UA request to a canonical URL is answered
from a PRERENDER CACHE (`x-pre-rendered: 1`, max-age ~14 days). A request with a
query string such as `?cb=123` bypasses that cache and returns the live app.
Checks labelled "app view" use a cache-buster; checks labelled "CRAWLER view" use
the plain canonical URL, which is what a search engine or AI crawler receives.
On 2026-09-30 only testing the first led to the wrong conclusion that a publish
had refreshed the snapshot, when the crawler was still being served the old page
with its false on-chain claim. Publishing does NOT refresh the prerender cache.

Each check compares against the HOMEPAGE, not a keyword: a phantom page is the
homepage served in place of the page, so it cannot carry another page's <h1>.
"""
import random
import re
import sys
import urllib.request

SITE = "https://www.smokegame.win"
UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"


def get(path: str) -> str:
    sep = "&" if "?" in path else "?"
    # Random, never constant: a repeated key gets a prerender snapshot of its own.
    req = urllib.request.Request(f"{SITE}/{path}{sep}cb={random.randrange(10**9)}",
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


def get_canonical(path: str) -> str:
    """Exactly what a crawler requests: the plain URL, no query string."""
    req = urllib.request.Request(f"{SITE}/{path}", headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read().decode(errors="replace")
    except Exception:  # noqa: BLE001
        return ""


results: list[tuple[bool, str]] = []
def check(ok: bool, label: str) -> None:
    results.append((ok, label))


home = get("")
home_h1 = h1(home)
check(bool(home), "homepage reachable")
check(home.count("analytics.crawlconsole.com") == 1, "app view of /: tracker present exactly once")
check('"applicationCategory": "GameApplication"' in home, "app view of /: applicationCategory is GameApplication")
check("signed on the Internet Computer" not in home, "app view of /: on-chain claim absent")

crawl = get_canonical("")
# NOT asserted: the tracker in the crawler view. Prerendered snapshots strip
# <script> tags, so the tracker is structurally absent there and that is not a
# failure. It is asserted in the app view above.
check('"applicationCategory": "GameApplication"' in crawl, "CRAWLER view of /: applicationCategory is GameApplication")
check("signed on the Internet Computer" not in crawl,
      "CRAWLER view of /: false on-chain claim absent (prerender snapshot is not stale)")

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

# ---- Round 2 (2026-09-30): corrections to claims the game contradicts ---------
BROWSER_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"


def get_ua(path: str, ua: str) -> str:
    req = urllib.request.Request(f"{SITE}/{path}", headers={"User-Agent": ua})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read().decode(errors="replace")
    except Exception:  # noqa: BLE001
        return ""


# random cache-buster: a plain request can return a stale page naming the OLD bundle
bm = re.search(r'src="(/assets/index-[^"]+\.js)"', get_ua(f"?cb={random.randrange(10**9)}", BROWSER_UA))
bundle = get_ua(bm.group(1).lstrip("/"), BROWSER_UA) if bm else ""
check(bool(bundle), "app bundle located")

# The video is protected: it must survive every publish.
for marker in ("smoke-realm-background.mp4", "smoke-realm-background.webm",
               "autoPlay", "playsInline"):
    check(marker in bundle, f"VIDEO still in bundle: {marker}")

# About section: was a 40%-opaque panel with muted 14px text over a bright video.
i = bundle.find('"about.section"')
seg = bundle[i:i + 1800] if i >= 0 else ""
check(bool(seg), "About section found in bundle")
check("bg-card/40" not in seg, "About panel no longer the 40%-opaque bg-card/40")
check("text-sm" not in seg.split("About This Game")[-1][:600] if seg else False,
      "About body text no longer text-sm (14px)")
check("signed on the Internet Computer" not in bundle,
      "app bundle: 'your runs are signed on the Internet Computer' (visible homepage tagline) gone")
check("not recorded on a blockchain in the NFT sense" not in bundle,
      "self-contradicting 'tracked on the Internet Computer, but not recorded on a blockchain' gone")

# Names the game does not have, and claims the game contradicts.
pub = " ".join(text(get(p)) for p in
               ["", "about/", "how-to-play/", "troubleshooting/", "docs/",
                "faq/controls/", "faq/wallet/", "faq/not-the-artist/"])
blob = pub + " " + bundle + " " + get("")
for bad in ("Dustrock", "Tax Man", "outlaw prospector"):
    check(bad not in blob, f"no '{bad}' anywhere (not in the game)")
for bad in ("WASD is not bound", "not WASD", "no on-screen touch controls",
            "cannot play the game properly"):
    check(bad not in blob, f"no false claim: '{bad}'")

# ---- llms.txt (2026-10-01): production served Caffeine boilerplate, not our brief ----
llms = get_canonical("llms.txt")
check("Lil Blunt: The Smoke Realm" in llms and "platformer" in llms,
      "CRAWLER view of /llms.txt: names the game and says it is a platformer "
      "(repo brief is richer than what production serves)")
for soft in ("llms-full.txt", ".well-known/llms.txt"):
    check("<html" not in get_canonical(soft)[:400].lower(),
          f"/{soft} is not a soft-404 (HTML app shell served as 200)")

# ---- Founder rule (2026-10-01): llms.txt is never visible on the website ----------
for p in ["", "about/", "how-to-play/", "docs/", "troubleshooting/", "faq/controls/",
          "faq/wallet/", "faq/not-the-artist/", "privacy/", "terms/", "accessibility/"]:
    page = get_canonical(p).lower()
    check("llms" not in page, f"/{p} has no link to or text of llms.txt (founder rule)")
check("llms" not in get_canonical("sitemap.xml").lower(), "sitemap.xml does not list llms.txt")
# Every location, not just the homepage (a link change is not done until all of them are clean).
OLD_SLUG = "lil-blunt-adventure"
for p in ["", "about/", "how-to-play/", "docs/", "troubleshooting/", "faq/controls/", "faq/wallet/",
          "faq/not-the-artist/", "privacy/", "terms/", "accessibility/", "llms.txt"]:
    check(OLD_SLUG not in get_canonical(p), f"CRAWLER view of /{p}: no old itch slug ({OLD_SLUG})")
check(OLD_SLUG not in bundle, f"app bundle: no old itch slug ({OLD_SLUG}) in the Play-button links")

fails = 0
print(f"\n  PUBLISH CHECK — {SITE}\n")
for ok, label in results:
    print(f"  [{'pass' if ok else 'FAIL'}] {label}")
    fails += 0 if ok else 1
print(f"\n  {len(results) - fails}/{len(results)} passed\n")
sys.exit(fails)
