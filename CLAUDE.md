# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes.

Adapted from [andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills),
derived from Andrej Karpathy's observations on where LLM coding goes wrong.

**This file is about *how* to work.** Project facts, verified commands, and the
blocking accuracy rules live in [AGENTS.md](./AGENTS.md) — read that too.
Domain playbooks live in `.claude/skills/`; see `project-playbook` for which
one applies when.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial
tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it
work") require constant clarification.

## 5. Ship it properly (project-specific)

Added for this repo, where the deploy path has bitten before:

- `pnpm fix && pnpm build && pnpm test --run` from `src/frontend/` before any
  commit that touches the frontend.
- **Revert `src/frontend/dist/` rather than committing it.** It is tracked from
  an old export; only 11 static brand files are versioned, so a rebuilt
  `dist/index.html` references JS bundles that are not in the repo.
- The Caffeine project is a **separate codebase** from this repo. Pushing here
  does not deploy. Adding an npm dependency here can break the Caffeine build,
  which installs independently — prefer dependency-free solutions for anything
  that must run in the deployed site.

## 6. Search semantically before searching broadly

Before broad Grep/Glob on `src/`, run: `jg "<your question>" .`
(e.g. `jg "how do we dominate SEO, AEO, GEO?" .`)

Exact symbol search still uses Grep. `jg` retrieves by meaning, so it is for
"where does X happen"; Grep is for "where is this exact identifier".

Note the game code is **not in this repo** — no `.gd`/`.tscn` files — so `jg`
cannot answer questions about stages, portals, or episodes here. That is the
separate GM-GAME repo, not a `jg` failure.

## 7. The background video is protected

Never remove, replace, disable or restyle the background video (`SmokeBackground`)
unless the founder explicitly says to, in words. Redesigns, performance work,
readability fixes and cleanups are **not** permission. If a task seems to need
touching it, stop and ask. `SmokeBackground.test.tsx` guards it; do not delete
or weaken that test. See `.claude/skills/keep-the-video`.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer
rewrites due to overcomplication, and clarifying questions come before
implementation rather than after mistakes.
