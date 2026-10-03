---
name: fix-gauntlet
description: The loop for turning audit findings into verified fixes — propose, gate with deterministic checks and Jev, attack with an independent reviewer, ship by the right route, verify live, log. Use whenever fixing a vulnerability, bug or inaccurate copy found by an audit, and before declaring any fix done.
---

# Fix gauntlet

Generator, judge and verifier are different components. Never grade your own fix.

## The loop (per finding, highest severity first)

1. **Reproduce.** Write the failing check first (a fixture, a test, a grep with a known-bad input). If you cannot make it fail, you do not understand the bug.
2. **Propose the smallest change.** CLAUDE.md section 3: every changed line traces to the finding. No dependency changes here (Caffeine installs separately); those are founder or Caffeine decisions.
3. **Gate (deterministic).** From `src/frontend`: `pnpm fix && pnpm typecheck && pnpm test --run && pnpm build`, then revert `dist/`. Copy: `jev.py --gate` plus `research_agent.unverified_names` plus `facts_lint.py` plus `surface_audit.py --text-file`.
4. **Attack (independent).** Hand the diff and the original finding to a fresh reviewer agent whose only job is to find how the fix is wrong or incomplete (regression list in the v3 program, section A4, is the checklist). Fix what it finds, then re-gate. Two failed attempts on one finding: stop and report.
5. **Route.** Repo-only (scripts, docs, tests, skills) commit and push. Site change: `caffeine-dispatch` round, draft only. Founder-only surface (itch, DNS, NameSilo, X, LinkedIn, Search Console): paste-ready text in the decisions sheet.
6. **Verify live.** After the founder publishes: `site-audit` toolkit; the original failing check must now pass in the same view that failed.
7. **Log.** `log_lesson.py` with claim, evidence, changes; update the decisions sheet; scorecard line in `docs/morning-report.md`.

## Rules

- Protected: `SmokeBackground` and the video (`keep-the-video`); game code; Episode 2.
- Blocking claims (AGENTS.md): no on-chain scores, verifiable leaderboard, token/NFT rewards or play-to-earn. Roadmap wording is allowed; present tense is not. llms.txt text is never visible on the site.
- Do not weaken or delete a test to get green.
- Reviewers' high-severity findings are hypotheses until you reproduce them.
- Stop and ask when a gate blocks a fact you believe true, a fix needs a secret, or a draft goes live without the founder.
