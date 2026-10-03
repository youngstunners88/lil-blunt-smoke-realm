#!/usr/bin/env python3
"""Audit every game-description surface. Dependency-free.

  python3 marketing/aeo/surface_audit.py
  python3 marketing/aeo/surface_audit.py --text-file FILE   # audit a fixture/snapshot
Exit code = number of surfaces that fail or could not be checked.
A surface that cannot be fetched is UNCHECKED, never passing. If fetch is blocked
(itch sits behind Cloudflare) paste its text into surface_text/<id>.txt.
"""
import json, re, sys, urllib.request
from pathlib import Path

HERE = Path(__file__).parent
CANON = "Lil Blunt: The Smoke Realm"
OLD_NAMES = ["Lil Blunt Adventure"]
BANNED_NAMES = ["Dustrock", "Tax Man", "outlaw prospector"]
# Present-tense claims that are blocking-false (AGENTS.md). Roadmap wording is not matched.
BANNED_CLAIMS = ["WASD is not bound", "not WASD", "no on-screen touch controls",
    "cannot play the game properly", "signed on the Internet Computer",
    "collect on-chain blunts", "own your character upgrades", "your progress is truly yours",
    "on-chain saves", "nft collectibles", "play-to-earn", "earn tokens", "airdrop",
    "own your progress on-chain", "connect your wallet", "trade rare items",
    "web3 version", "collect blunts"]
# Denials the NEGATION filter would wrongly excuse: these are FALSE statements even though they contain "not"/"no".
# A real artist exists (Memphis duo Indo G & Lil' Blunt); saying there is none is a factual error.
FALSE_DENIALS = ["not a real-world recording artist", "not a real recording artist",
    "real recording artist? no", "recording artist? no", "similarity in name or style to a real person is coincidental"]
NEGATION = re.compile(r"\b(no|not|never|nor|without|isn't|aren't|doesn't|does not|don't|cannot|zero)\b", re.I)
CATEGORY = ["free", "browser", "platformer"]
UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
BROWSER_UA = "Mozilla/5.0 (X11; Linux x86_64) Chrome/124 Safari/537.36"

def fetch(url, ua=UA):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": ua}), timeout=30) as r:
            return r.read().decode(errors="replace")
    except Exception:
        return ""

def blocked(html):
    return not html or ("Attention Required" in html[:600] and "Cloudflare" in html[:600])

def plain(html):
    html = re.sub(r"<(script|style).*?</\1>", " ", html, flags=re.S | re.I)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()

def affirmed(text, phrase):
    """True if phrase appears in a sentence that does not negate it."""
    for sent in re.split(r"(?<=[.!?])\s+", text):
        if sent.rstrip().endswith("?"):
            continue
        if phrase.lower() in sent.lower() and not NEGATION.search(sent):
            return True
    return False

def checks(text, describes):
    out = []
    out += [f"banned claim: '{c}'" for c in BANNED_CLAIMS if affirmed(text, c)]
    out += [f"banned name: '{n}'" for n in BANNED_NAMES if n in text]
    out += [f"false denial: '{d}'" for d in FALSE_DENIALS if d in text.lower()]
    if describes:
        if CANON not in text:
            out.append("canonical name missing")
        out += [f"old name used: '{n}'" for n in OLD_NAMES if n in text]
        out += [f"category phrase missing: '{c}'" for c in CATEGORY if c not in text.lower()]
    return out

def audit(s):
    snap = HERE / "surface_text" / f"{s['id']}.txt"
    html, src = ("", "")
    if s.get("file") and Path(s["file"]).exists():
        html, src = Path(s["file"]).read_text(errors="replace"), "repo file"
    elif s.get("fetch_method") != "unfetchable":
        html = fetch(s["url"]); src = "live"
        if blocked(html):  # itch's Cloudflare rejects crawler UAs; a browser UA reads the same public page
            html = fetch(s["url"], BROWSER_UA); src = "live (browser UA)"
            if blocked(html):
                html = ""
    if not html and snap.exists():
        html, src = snap.read_text(), "manual snapshot"
    if not html:
        return {"id": s["id"], "status": "UNCHECKED", "issues": ["could not fetch; no snapshot"]}
    issues = checks(plain(html), s.get("describes_game", False))
    return {"id": s["id"], "status": "FAIL" if issues else "pass", "issues": issues, "src": src}

def main():
    if "--text-file" in sys.argv:
        t = Path(sys.argv[sys.argv.index("--text-file") + 1]).read_text()
        issues = checks(plain(t), True)
        print("\n".join(issues) or "pass"); sys.exit(len(issues) > 0)
    surfaces = json.load(open(HERE / "surfaces.json"))["surfaces"]
    rows = [audit(s) for s in surfaces]
    print("\n  SURFACE AUDIT\n")
    for r in rows:
        print(f"  {r['status']:<10}{r['id']:<22}{r.get('src',''):<16}{'; '.join(r['issues'][:3])}")
    bad = [r for r in rows if r["status"] != "pass"]
    print(f"\n  {len(rows)-len(bad)}/{len(rows)} pass, {sum(r['status']=='UNCHECKED' for r in rows)} unchecked\n")
    sys.exit(len(bad))

if __name__ == "__main__":
    main()
