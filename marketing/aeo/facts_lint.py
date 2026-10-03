#!/usr/bin/env python3
"""
Lint: every page must include required facts and contradict none of the forbidden ones.

Usage:
  python3 marketing/aeo/facts_lint.py              # check current repo
  python3 marketing/aeo/facts_lint.py --test-broken  # check deliberately broken copy

Exit code = number of pages with violations.
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

# Load the facts registry
FACTS_FILE = Path(__file__).parent / "claims.json"
with open(FACTS_FILE) as f:
    FACTS_DATA = json.load(f)
    FACTS = {f["id"]: f for f in FACTS_DATA.get("facts", [])}

# Pages to check (repo-relative paths, converted to URLs)
SITE = "https://www.smokegame.win"
PAGES_TO_CHECK = {
    "/": ("home", []),
    "/about/": ("about", ["canonical_entry", "no_wallet", "enemies", "mascot", "no_onchain_scores", "no_tokens_nft", "internet_computer"]),
    "/how-to-play/": ("how_to_play", ["canonical_entry", "no_wallet", "stages", "mascot"]),
    "/faq/controls/": ("faq_controls", ["controls"]),
    "/faq/wallet/": ("faq_wallet", []),
    "/faq/not-the-artist/": ("faq_not_artist", ["not_music_artist", "canonical_entry"]),
    "/docs/": ("docs", ["canonical_entry"]),
    "/troubleshooting/": ("troubleshooting", ["canonical_entry"]),
}

def fetch_page(path: str) -> str:
    """Fetch a page from the live site."""
    ua = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
    req = urllib.request.Request(f"{SITE}{path}", headers={"User-Agent": ua})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read().decode(errors="replace")
    except Exception as e:
        return f"ERROR: {e}"

def text_only(html: str) -> str:
    """Extract plain text from HTML."""
    html = re.sub(r"<(script|style).*?</\1>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", text).strip()

def check_page(path: str, required_facts: list[str], test_broken: bool = False) -> dict:
    """Check a single page for fact compliance."""
    html = fetch_page(path)
    if html.startswith("ERROR"):
        return {"path": path, "reachable": False, "error": html}

    text = text_only(html)

    if test_broken:
        # Inject a broken control sentence for testing
        text += " Controls are WASD only and there are no on-screen touch controls."

    violations = []

    # Check required facts
    for fact_id in required_facts:
        if fact_id not in FACTS:
            violations.append(f"(fact '{fact_id}' not in registry)")
            continue

        fact = FACTS[fact_id]
        fact_text = fact.get("text", "")

        # Loose check: does the key phrase appear?
        key_phrases = fact_text.split(" and ") if " and " in fact_text else [fact_text]
        found = False
        for phrase in key_phrases:
            if phrase.lower() in text.lower():
                found = True
                break

        if not found:
            violations.append(f"missing required fact: {fact_id}")

    # Check forbidden contradictions
    for fact_id, fact in FACTS.items():
        forbidden = fact.get("forbidden_contradictions", [])
        for forbidden_phrase in forbidden:
            if forbidden_phrase.lower() in text.lower():
                # Heuristic: if the forbidden phrase is preceded by negation or appears after
                # "no", "not", "doesn't", "isn't", "aren't", etc., it's likely allowed.
                # Otherwise, it's a violation.
                negation_pattern = rf"(?:no|not|doesn't|doesn't|does not|don't|do not|can't|cannot|won't|will not|isn't|aren't|isn't not|zero|none|none of|without|except)\s+[^.]*{re.escape(forbidden_phrase)}"
                if not re.search(negation_pattern, text, re.I):
                    violations.append(f"contains forbidden phrase: '{forbidden_phrase}'")

    return {
        "path": path,
        "reachable": True,
        "required_facts": required_facts,
        "violations": violations,
        "passed": len(violations) == 0,
    }

def main():
    test_broken = "--test-broken" in sys.argv

    print("\n  FACTS LINT\n")
    print(f"  {'Page':<30} {'Violations':<50}")
    print("  " + "-" * 85)

    results = []
    for path, (name, required_facts) in PAGES_TO_CHECK.items():
        result = check_page(path, required_facts, test_broken=test_broken)
        results.append(result)

        if not result["reachable"]:
            print(f"  {path:<30} unreachable: {result['error']}")
            continue

        status = "✓ pass" if result["passed"] else "✗ FAIL"
        issues = ", ".join(result["violations"][:2]) if result["violations"] else "none"
        if len(result["violations"]) > 2:
            issues += f" (+{len(result['violations'])-2} more)"

        print(f"  {path:<30} {issues:<50} {status}")

    print("\n  DETAILED FAILURES:\n")
    for result in results:
        if result.get("violations"):
            print(f"  {result['path']}:")
            for v in result["violations"]:
                print(f"    - {v}")
            print()

    passed = sum(1 for r in results if r.get("passed"))
    total = len(results)
    print(f"  {passed}/{total} pages pass\n")

    # Test broken page
    if test_broken:
        print("\n  TEST: deliberately broken /faq/controls/ page")
        broken_result = check_page("/faq/controls/", ["controls"], test_broken=True)
        if broken_result.get("violations"):
            print(f"  ✓ Audit correctly flagged broken page: {broken_result['violations']}")
        else:
            print("  ✗ Audit failed to catch deliberately broken page")
            return 1

    # Exit code = number of failed pages
    failed = total - passed
    sys.exit(failed)

if __name__ == "__main__":
    main()
