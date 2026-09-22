#!/usr/bin/env python3
"""
Append a finding to LESSONS.md in the shape that makes it reusable.

The failure mode this exists to prevent is not forgetting a fact — it is
recording a fact without recording what it changes, which produces a file
nobody acts on. Every entry is forced to carry three parts:

  claim     what is now believed, stated so it could be wrong
  evidence  how it was established, specific enough to re-check
  changes   what someone should do differently because of it

An entry missing the third part is rejected. A lesson that does not change a
decision is trivia, and trivia crowds out the entries that matter.

    python3 marketing/aeo/log_lesson.py \\
        --claim "Reddit citations collapsed to near zero" \\
        --evidence "Promptwatch, cited in the Aug 2026 Ahrefs podcast" \\
        --changes "Post to Reddit for players, not for AI citation"

    python3 marketing/aeo/log_lesson.py --supersede "keyword niche" \\
        --claim "..." --evidence "..." --changes "..."
"""

from __future__ import annotations

import argparse
import datetime
import re
import sys
from pathlib import Path

LESSONS = Path(__file__).resolve().parent / "LESSONS.md"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--claim", required=True,
                    help="What is now believed, stated so it could be wrong")
    ap.add_argument("--evidence", required=True,
                    help="How it was established, specific enough to re-check")
    ap.add_argument("--changes", required=True,
                    help="What to do differently. Not optional.")
    ap.add_argument("--title", help="Short heading (defaults to the claim)")
    ap.add_argument("--supersede",
                    help="Substring of an existing heading this replaces")
    args = ap.parse_args()

    for field in ("claim", "evidence", "changes"):
        if len(getattr(args, field).strip()) < 15:
            print(f"--{field} is too thin to be useful. Write the real "
                  f"sentence.", file=sys.stderr)
            return 1

    body = LESSONS.read_text() if LESSONS.exists() else "# Lessons\n"
    today = datetime.date.today().isoformat()
    title = (args.title or args.claim)[:80]

    if args.supersede:
        # Mark the old entry rather than removing it: knowing a belief was
        # held and dropped is part of the record.
        pat = re.compile(r"^(## .*" + re.escape(args.supersede) + r".*)$",
                         re.M | re.I)
        m = pat.search(body)
        if not m:
            print(f"No heading matching {args.supersede!r}.", file=sys.stderr)
            return 1
        body = pat.sub(
            m.group(1) + f"\n\n**SUPERSEDED {today}** — see \"{title}\" below.",
            body, count=1)

    entry = (f"\n---\n\n## {today} — {title}\n\n"
             f"**Claim.** {args.claim.strip()}\n\n"
             f"**Evidence.** {args.evidence.strip()}\n\n"
             f"**What it changes.** {args.changes.strip()}\n")

    LESSONS.write_text(body.rstrip() + "\n" + entry)
    print(f"appended to {LESSONS}: {title}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
