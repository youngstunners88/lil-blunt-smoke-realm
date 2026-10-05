---
name: site-audit
description: Run the full audit of smokegame.win without false passes — which script checks what, which user agent and view each needs, the known false-positive traps, and how to fan out independent read-only reviewers for code, backend, static pages and build. Use for a deep-dive audit, before claiming the site is healthy, after any publish, or when a check disagrees with what you expected.
---

# Site audit

## The toolkit (all dependency-free, all read-only, near-zero cost)

| Command | Checks |
|---|---|
| `python3 marketing/aeo/tech_audit.py` | host redirects, soft-404, robots, sitemap, per-page head and JSON-LD, social card, headers, crawler/browser parity, itch redirect |
| `python3 marketing/aeo/verify_publish.py` | what a publish was meant to deliver: crawler view, app bundle, video, llms.txt, no llms link anywhere, itch slug |
| `python3 marketing/aeo/surface_audit.py` | every surface that describes the game (site, itch, DIAMONDS source, llms.txt): banned claims, false denials, name, category |
| `python3 marketing/aeo/assess.py` | repo versus production drift, live itch gate |
| `python3 marketing/aeo/facts_lint.py` | pages versus `claims.json` facts |
| `python3 marketing/aeo/jev.py --gate FILE` | blocking accuracy questions (on-chain scores, leaderboard, rewards, play-to-earn) |
| `python3 marketing/aeo/passage.py --page FILE --battery geo` | which passages are quotable; page means mislead |

Dependency and bundle: `cd src/frontend && pnpm audit --prod`, then build and grep the bundle for each flagged package; **revert `dist/` afterwards**.

## Traps already hit

- **User agent.** Crawler UA on the plain URL = what Google sees (prerender snapshot). Browser UA with a random `?cb=` = the live app. itch.io rejects crawler UAs with a Cloudflare 403 but serves browsers. Label every result with its view.
- **Unfetchable is not passing.** Report UNCHECKED, never pass. Try the other UA first.
- **Negation.** "There is no play-to-earn mechanic" is a correct denial, not a violation; the audit skips negated sentences and questions. But false denials ("Is Lil Blunt a real recording artist? No.") need their own list because they contain "no".
- **Keyword greps false-pass** against pages that repeat the keyword. Compare against the homepage, not a word.
- **Facts come from the game.** Controls and names: read `/home/user/youngstunners88/gm-game/project.godot` (`gm-game-sync`). A/D, W, J, E and touch are real; WASD is not false.
- **Repo is not production.** Caffeine's copy differs and is sometimes worse. Compare live to repo before trusting either.
- **Unverified tools.** PageSpeed quota, CrUX (locked), Search Console (no property here), Chromium (proxy certificate): say "could not verify", do not infer.

## Fan-out for a deep dive

Spawn four read-only reviewers in parallel with self-contained briefs (no file edits, evidence as file:line + quote, severity, smallest fix, confidence, CONFIRMED vs SUSPECTED, under 700 words): backend Motoko, frontend logic, static pages and head, build and supply chain. Verify every high-severity finding yourself before it enters a report; reviewers are wrong sometimes.

Output goes to `docs/audit-<date>-*.md`; open decisions go to `docs/decisions-<date>.md`; surprises go to `LESSONS.md` via `log_lesson.py`.
