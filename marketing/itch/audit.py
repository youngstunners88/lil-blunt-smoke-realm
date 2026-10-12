#!/usr/bin/env python3
"""
Audit the itch.io page against what the store actually shows browsers.

The itch.io server-side API is **read-only** — six endpoints, no PATCH or PUT,
and nothing that edits page metadata. So this reports; it cannot fix. The fix
is a human filling the form, and `marketing/itch/page-content.md` exists to
make that a copy-paste job rather than a writing job.

What it checks is chosen by what itch.io's own browse and search surfaces
display. A game with no cover image is effectively invisible there no matter
how good the page body is, because every listing is a thumbnail.

    ITCH_API_KEY=... python3 marketing/itch/audit.py

Exit status is non-zero if any blocking field is missing, so it can gate a
launch checklist.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

API = "https://api.itch.io/profile/games"

# The website's brand. The itch title should match it: a second name for the
# same game splits the entity across search and AI recommendation, so both
# names accumulate half the recognition.
BRAND = "Lil Blunt: The Smoke Realm"


def fetch(key: str) -> dict:
    req = urllib.request.Request(
        API, headers={"Authorization": f"Bearer {key}"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode(errors='replace')[:200]}",
              file=sys.stderr)
        raise SystemExit(2)
    except Exception as e:  # noqa: BLE001
        print(f"{type(e).__name__}: {str(e)[:200]}", file=sys.stderr)
        raise SystemExit(2)


def main() -> int:
    key = os.environ.get("ITCH_API_KEY")
    if not key:
        print("ITCH_API_KEY is not set.", file=sys.stderr)
        return 2

    games = fetch(key).get("games", [])
    if not games:
        print("No games on this account.", file=sys.stderr)
        return 2

    rc = 0
    for g in games:
        print(f"\n  {g.get('title')}  —  {g.get('url')}")
        print(f"  {g.get('views_count', 0)} views · "
              f"{g.get('downloads_count', 0)} downloads · "
              f"published={g.get('published')}\n")

        blocking, warn = [], []

        # Cover image: shown in every browse listing, search result and
        # embed card. Its absence is the single biggest visibility problem
        # an itch page can have.
        if not g.get("cover_url"):
            blocking.append(
                "No cover image. Every itch.io browse and search listing is a "
                "thumbnail, so\n     the game does not visually exist in the "
                "store without one. 630x500.")

        # short_text is the one line under the title everywhere on itch.
        if not (g.get("short_text") or "").strip():
            blocking.append(
                "No tagline (short_text). This is the line under the title in "
                "every\n     listing and the description search engines and "
                "social cards pick up.")

        if g.get("title") != BRAND:
            warn.append(
                f"Title is {g.get('title')!r} but the site brands it "
                f"{BRAND!r}.\n     Two names for one game splits recognition "
                f"across both.")

        embed = g.get("embed") or {}
        if g.get("type") == "html" and not embed.get("fullscreen"):
            warn.append(
                "Embed has fullscreen disabled. For a platformer this is a "
                "real\n     playability limit at the default 1280x720 frame.")

        if not g.get("traits"):
            warn.append("No traits set (platforms, input methods). These feed "
                        "itch's own filters.")

        for label, items, mark in (("BLOCKING", blocking, "!"),
                                   ("WORTH FIXING", warn, "-")):
            if items:
                print(f"  {label}")
                for i in items:
                    print(f"   {mark} {i}")
                print()

        if blocking:
            rc = 1

    if rc:
        print("  These cannot be fixed through the API — itch.io has no write\n"
              "  endpoint for page metadata. Use marketing/itch/page-content.md,\n"
              "  which has every field written out to paste into the form.\n")
    else:
        print("  No blocking gaps.\n")
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
