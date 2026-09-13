---
name: night-shift
description: The autonomous overnight routine playbook. Fires unattended, does the next task from marketing/nightshift/queue.md, validates it, commits it, and updates the morning report. Use when a scheduled Routine wakes the session to do overnight work, or when setting up or editing that routine. Enforces the hard rule that nothing unattended ships, posts, or spends.
---

# Night shift — autonomous overnight work

Runs with no human watching. That single fact sets every rule below. The goal
is **reviewable progress by morning**, not shipped change — because the only
things that ship here need the human (the Caffeine "Go live" click, an itch
paste, a portal submission). An overnight run that pretends otherwise produces
motion, not progress.

## What each firing does

1. **Preflight.** Run `bash marketing/nightshift/preflight.sh`. If it exits
   non-zero, stop and write why to the morning report. Do not force past it.
2. **Pick one task.** Open `marketing/nightshift/queue.md`, find the first
   `[ ]` task, mark it `[~]`, commit that mark. One task per firing — never
   batch, so a failure never poisons more than one unit of work.
3. **Do exactly that task**, to its written acceptance check. Nothing else. Do
   not "improve" adjacent things; scope creep unattended is how a clean tree
   becomes an un-reviewable one.
4. **Validate before committing.** Run the task's acceptance check. For any
   frontend change: `cd src/frontend && pnpm fix && pnpm build && pnpm test
   --run`, then `git checkout -- src/frontend/dist/` (never commit `dist/`).
   For any content page: `python3 marketing/aeo/quality_gate.py <file>` must
   return documentation-grade. If validation fails, revert the attempt, mark
   the task `[ ]` again, and record the failure in the report. Do not commit
   broken work.
5. **Commit** to the designated branch only (`claude/caffeine-ai-website-aks8ds`),
   mark the task `[x]`, and append to `docs/morning-report.md`: date, task id,
   what changed, the short SHA, and anything needing the human.
6. **Stop.** Do not start the next task in the same firing. The next firing
   takes it. If every task is `[x]`, append "queue empty — nothing to do" to
   the report and stop.

## Hard rules — never, unattended

These are not preferences. Breaking one unattended is worse than doing nothing.

- **Never dispatch Caffeine, never click "Go live", never publish an Artifact.**
  Nothing reaches production without the human.
- **Never post anything externally** — no itch edit, no social post, no PR to
  another repo, no portal submission, no email, no outreach.
- **Never spend money** — no ads, no paid API beyond the cheap local scripts,
  no contract deploy.
- **Never make a claim the accuracy rules forbid** (`AGENTS.md`): no
  play-to-earn, no token rewards, no NFT minting, no "scores are on-chain
  today". Leaderboard figures are demo data. A content page that needs such a
  claim to work is a page that does not get written.
- **Never commit `src/frontend/dist/`**, never touch `package.json` dependencies
  (that risks the separate Caffeine build), never rewrite git history.
- **Never delete or refactor working code** to hit a task. Additive only.
- **When blocked or uncertain on anything irreversible, stop and write it to the
  report.** Guessing unattended is the failure this whole design exists to
  prevent.

## Why it is a queue, not a loop

A fixed, checkable queue is bounded: when it is done, firings no-op instead of
inventing work. An open "keep improving" loop unattended drifts into
low-value output and token burn. Every task in the queue carries its own
acceptance check, so "done" is verifiable, not vibes. Add tasks only in that
form.

## The morning report is the deliverable

`docs/morning-report.md` is what the human reads first. It must let them, in two
minutes, know exactly what changed and what to do. Its last line is always a
ranked "do first when you wake" list — and the top of that list is almost always
the same thing: **the Caffeine "Go live" click**, because that is the one action
that converts a week of committed drafts into a live site, and only the human
can take it.
