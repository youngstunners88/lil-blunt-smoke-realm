#!/usr/bin/env python3
"""Audit all game-description surfaces for consistency and accuracy."""
import json
import re
import sys
import urllib.request
from pathlib import Path

CANONICAL_NAME = "Lil Blunt: The Smoke Realm"
CANONICAL_NAMES = {
    CANONICAL_NAME,
    "Lil Blunt Adventure",  # alternateName on site, itch's current name
    "Lil Blunt",  # nickname
}

CATEGORY_PHRASES = {
    "2D side-scrolling platformer",
    "arcade score-chaser",
    "free",
    "browser",
    "web browser",
    "Wild West",
}

# Banned claims from verify_publish.py and AGENTS.md
# These are phrases that should NOT appear, or are actively false if they do
BANNED_NAMES = {"Dustrock", "Tax Man", "outlaw prospector"}
BANNED_CLAIMS = {
    "WASD is not bound",
    "not WASD",
    "no on-screen touch controls",
    "cannot play the game properly",
    "signed on the Internet Computer",  # removed in v45
    "play-to-earn",
    "collect on-chain blunts",  # from itch page (blocking-false)
    "own your character upgrades",  # from itch page (not in game)
    "on-chain saves",  # blocking-false
    "NFT collectibles",  # blocking-false
    "earn tokens",  # play-to-earn variant
    "airdrop",  # play-to-earn variant
}

def fetch_url(url: str, user_agent: str = None) -> str:
    """Fetch a URL, returning empty string on failure."""
    if user_agent is None:
        user_agent = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
    req = urllib.request.Request(url, headers={"User-Agent": user_agent})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read().decode(errors="replace")
    except Exception:
        return ""

def text_only(html: str) -> str:
    """Extract plain text from HTML."""
    html = re.sub(r"<(script|style).*?</\1>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", text).strip()

def check_banned_claims(text: str) -> list[str]:
    """Find any banned claims in text."""
    failures = []
    text_lower = text.lower()
    for claim in BANNED_CLAIMS:
        if claim.lower() in text_lower:
            failures.append(f"banned claim: '{claim}'")
    return failures

def check_banned_names(text: str) -> list[str]:
    """Find any banned proper nouns in text."""
    failures = []
    for name in BANNED_NAMES:
        if name in text:
            failures.append(f"banned name: '{name}'")
    return failures

def check_canonical_name(text: str) -> list[str]:
    """Check if canonical name appears in text."""
    if CANONICAL_NAME not in text:
        return [f"canonical name '{CANONICAL_NAME}' not found"]
    return []

def check_alternate_name(text: str) -> list[str]:
    """Check for unwanted use of alternate names."""
    found_names = [n for n in CANONICAL_NAMES if n in text]
    if not found_names:
        return ["no recognized game name found"]
    if len(found_names) > 2:
        return [f"too many names: {found_names}"]
    return []

def check_category_phrases(text: str) -> list[str]:
    """Check if key category phrases are present."""
    missing = []
    for phrase in ["free", "browser", "platformer"]:
        if phrase not in text.lower():
            missing.append(f"category phrase '{phrase}' missing")
    return missing

def audit_surface(surface: dict) -> dict:
    """Run all checks on a single surface."""
    surface_id = surface.get("id")
    url = surface.get("url")
    owner = surface.get("owner")
    fetch_method = surface.get("fetch_method")

    result = {
        "id": surface_id,
        "owner": owner,
        "reachable": False,
        "checks": {},
    }

    if fetch_method == "unfetchable":
        result["reachable"] = False
        result["note"] = "unfetchable (requires auth)"
        return result

    # Fetch the content
    if fetch_method == "github":
        html = fetch_url(url)
    else:
        html = fetch_url(url)

    if not html:
        result["reachable"] = False
        return result

    result["reachable"] = True
    text = text_only(html)

    # Run checks
    result["checks"]["banned_claims"] = check_banned_claims(text)
    result["checks"]["banned_names"] = check_banned_names(text)
    result["checks"]["canonical_name"] = check_canonical_name(text)
    result["checks"]["category_phrases"] = check_category_phrases(text)

    return result

def main():
    surfaces_file = Path(__file__).parent / "surfaces.json"
    if not surfaces_file.exists():
        print(f"Error: {surfaces_file} not found")
        sys.exit(1)

    with open(surfaces_file) as f:
        data = json.load(f)

    print("\n  SURFACE AUDIT\n")
    print(f"  {'Surface':<30} {'Owner':<10} {'Issues':<40} {'Reachable'}")
    print("  " + "-" * 95)

    all_results = []
    for surface in data["surfaces"]:
        result = audit_surface(surface)
        all_results.append(result)

        issues = []
        for check_name, failures in result["checks"].items():
            issues.extend(failures)

        status = "✓" if result["reachable"] else "✗"
        issue_str = ", ".join(issues[:2]) if issues else "pass"
        if len(issues) > 2:
            issue_str += f" (+{len(issues)-2} more)"

        print(f"  {result['id']:<30} {result['owner']:<10} {issue_str:<40} {status}")

    print("\n  FAILURES BY SURFACE:\n")
    for result in all_results:
        if not result["reachable"]:
            print(f"  {result['id']}: unreachable")
            continue

        failures = []
        for check_name, check_failures in result["checks"].items():
            failures.extend(check_failures)

        if failures:
            print(f"\n  {result['id']}:")
            for failure in failures:
                print(f"    - {failure}")

    # Return exit code = number of surfaces with issues
    issue_count = sum(1 for r in all_results if not r["reachable"] or any(r["checks"].values()))
    print(f"\n  {len(all_results) - issue_count}/{len(all_results)} surfaces pass\n")
    sys.exit(issue_count)

if __name__ == "__main__":
    main()
