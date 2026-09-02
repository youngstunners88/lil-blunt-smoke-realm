# Morning report

## 2026-09-02 (started manually in a live session, not the routine)

**Why manual:** the scheduled routine could not run. The **environment setup
script** fails with exit code 127 — line 7 executes a bare URL
(`https://docs.mistral.ai/#overview`) as a shell command. That kills every
fresh session in this environment before Claude Code starts, so the fired
session and all four scheduled fires would fail identically. The routine
`trig_01L9QcwkzMwHHHn2XdpYcW1M` was **disabled** to stop overnight failure
notifications. It is otherwise correct and re-enables in one step once the
setup script is fixed (remove or `#`-comment that URL line in the environment
settings).

**T1 — AEO question pages: partial.**
- Shipped: `src/frontend/public/faq/controls/index.html` — "What are the
  controls…", passes `quality_gate.py` as documentation-grade. Added to
  `sitemap.xml`, linked from `/how-to-play/` (not orphaned). Build + 11 tests
  pass; `dist/` reverted.
- Held: `free` and `wallet` FAQ pages moved to
  `marketing/aeo/drafts/faq/`. Accurate, but the gzip quality gate rates them
  ambiguous (gap 0.002–0.004) against a 3-file corpus with no near-neighbour.
  Not shipped, per the night-shift rule that ambiguous = fail. Follow-up is
  queue task T5.
- Fixed in passing: a false claim in the existing `/how-to-play/` FAQ JSON-LD
  ("so your high scores can be recorded on-chain") that contradicted the same
  file and `AGENTS.md`. Now says scores are not written to a blockchain today.

## Do first when you wake (ranked)

1. **Fix the environment setup script** (remove the bare `https://docs.mistral.ai/#overview`
   line). Nothing else about the routine matters until fresh sessions can start.
2. **Click "Go live" in Caffeine** — the pending draft (claims in the rendered
   page, www canonical, restored llms.txt) is still not in production; the
   crawler snapshot still shows 0/5 claims.
3. **Paste the itch.io fixes** (`marketing/itch/page-content.md`) — the live
   tagline still makes a false on-chain claim.
4. Re-enable the routine once step 1 is done, or tell me and I'll continue the
   queue manually in a live session.
