---
name: env-doctor
description: Verify what the Claude Code environment actually contains — env vars, MCP servers, installed deps, setup-script effects — by probing a FRESH container rather than guessing from the current session. Use when a connector or API key "isn't working", when an environment setting was just changed, when a routine fires and does nothing, or before blaming the user's configuration for anything.
---

# Environment doctor

## The mistake this exists to prevent

**A running session cannot see environment changes made after it started.**
Settings changes — setup script, environment variables, MCP servers — are
baked into a container at boot. Edit them and the *current* session is
instantly stale; only containers started afterwards have the new state.

This has burned this project repeatedly:

- The broken setup script was diagnosed as "one bad URL line" from a single
  screenshot, when the whole field was invalid. Three fire-and-fail cycles
  followed before anyone read the actual content.
- A CrawlConsole connector and its API key were reported missing based on
  `claude mcp list` **in a session that predated them being added**. The user
  had configured both correctly. The session was simply blind to it.
- A routine that ran and committed nothing was attributed to missing
  `node_modules` — a guess, never measured, and wrong.

**Rule: never state that an environment setting is missing, empty, or broken
based only on the current session. Probe a fresh container, or say you don't
know.** "I can't see it from here" and "it isn't there" are different claims,
and only one of them is honest.

## How to probe

`probe.sh` in this skill directory prints ground truth about whatever
container it runs in: whether deps installed (setup-script effects), which
env var *names* exist, which MCP servers are registered, and a build-capable
verdict. It prints **names only, never values** — safe to run and safe to
paste.

### Probing a fresh container (the only meaningful check)

The current session is stale by definition. Get a fresh one:

1. Fire a routine whose prompt is *only*: run
   `bash .claude/skills/env-doctor/probe.sh`, append the output to
   `docs/env-probe.md`, commit and push, stop.
2. Wait, pull, read `docs/env-probe.md`. That is ground truth.

A routine-fired session is a brand-new container, so it reflects every
setting saved before it fired. This is the only way, from inside a
long-running session, to see what the environment currently holds.

### Interpreting results

| Probe shows | Means |
|---|---|
| `node_modules: ABSENT` | Setup script isn't installing deps — build/test tasks will fail |
| Expected env var name missing | Not saved, saved to the wrong environment, or saved after the probe fired |
| MCP server absent | Not configured for this environment, or needs auth |
| `build-capable: NO` | Any task with a `pnpm build`/`test` acceptance check will fail |

If a probe contradicts what the user told you, **the probe is evidence about
one container at one moment, not proof the user is wrong.** Report what it
shows, name the timing gap, and ask — don't accuse.

## Hard rules

- Never print env var **values**. Names only. `probe.sh` enforces this.
- Never claim a user's configuration is wrong without a fresh-container probe
  backing it.
- When a routine fires and produces nothing, probe **before** theorising about
  why.
- Distinguish "not visible in this session" from "not configured" in every
  report. They are not the same finding.
