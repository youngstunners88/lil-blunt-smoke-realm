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

## 2026-09-02 — continued manually (routine still blocked by env setup script)

The verification fire failed again (`init_script` error, not recoverable), so
the environment setup script is still broken. Routine re-disabled. Continued the
queue by hand in the live session.

**T2 — devlog draft: done.** `marketing/devlog/godot-html5-on-icp.md`.
Documentation-grade (gap 0.059). A draft to publish to dev.to/Hashnode.

**T3 — measurement delta: NO CHANGE since baseline.** Live crawl re-run:
- Still a user-agent split. Crawler view 128,857 bytes, **0/5 claims**, no
  canonical. Browser view 5,850 bytes, 4/5 claims, canonical on apex.
- `/troubleshooting/` still returns the SPA shell to crawlers.
- `llms.txt` still 637 bytes of Caffeine boilerplate.
- **Conclusion: the pending Caffeine draft is still not live.** None of this
  session's site changes (rendered claims, www canonical, restored llms.txt)
  have reached production. This is the single highest-value blocked item and it
  needs the human's "Go live" click.

**T4 — itch paste-pack: done.** `marketing/itch/page-content.md` now opens with
a field-by-field COPY-PASTE PACK (title, tagline, classification, embed, tags,
description) — fill the itch form without writing anything. The tagline replaces
the live one that falsely claims "own your progress on-chain".

**T5 — held FAQ drafts: resolved.** `wallet` was rewritten to documentation-grade
(passed the gate on merit, gap 0.023) and shipped to `/faq/wallet/`, added to
sitemap, linked from `/about/`. `free` was dropped: it stays borderline-spam by
the gate and duplicates the "is it free" answer already in `/how-to-play/`'s FAQ
schema. Build + 11 tests green.

**Queue complete.** All night-shift tasks (T1–T5) are done or resolved. Shipped
this session: `/faq/controls/`, `/faq/wallet/`, the Godot-on-ICP devlog draft,
the finalised itch paste-pack, plus an accuracy fix to `/how-to-play/`.

## 2026-09-02 — in-session continuation (queue extended: T6–T8)

The original queue (T1–T5) was complete, so per the request to "perform the work
that was supposed to be performed in the routine now in the session," the queue
was extended with three more fully-specified, repo-local tasks (T6–T8) and worked
top to bottom.

**T6 — disambiguation AEO page: done.** `src/frontend/public/faq/not-the-artist/`
answers "Is Lil Blunt the game the same as the music artist?" — maps to the
`not_artist` claim, flagged by the brand-name collision. Passes `quality_gate.py`
documentation-grade (gap 0.0653, after tightening the game-identification prose to
concrete engine/controls/scoring specifics — the first draft read ambiguous at
0.0035). In sitemap; linked from `/about/`; build + 11 tests green; `dist/`
reverted. No production impact until Caffeine goes live.

**T7 — corrected SEO head-package: done.** `docs/seo-head-package.md` — the
masterplan §1.2 homepage `<head>` with its three accuracy violations removed
(no on-chain proof-of-play, no Organization author with a URL, no
aggregateRating), canonical on www, VideoGame JSON-LD accuracy-checked in a
table. **Draft only — not dispatched to Caffeine.** It is ready to paste when
you decide to ship the head, and should go live in the same Caffeine dispatch
as the rest of the pending SEO work.

**T8 — GSC founder checklist: done.** `docs/seo-gsc-checklist.md` — a
non-technical, click-by-click guide to verify the property (DNS TXT, with an
HTML-tag fallback), submit the sitemap, and request indexing of the six live
pages, closing with the honest rule not to claim "indexed" until Search Console
shows it. A founder task; nothing here is automatable from this repo.

**In-session queue (T6–T8) complete.** Everything remains repo-local and
reviewable; nothing shipped to production, posted anywhere, or spent money. The
blockers below are unchanged and all still need the human.

## 2026-09-04 — Caffeine dispatch #1 verified: 1 of 3 changes landed

Composer reported the build finished but its own automated test could not
verify it. Re-measured independently against production
(`www.smokegame.win`), per `docs/caffeine-dispatch-01.md`'s own verification
steps:

**Landed — confirmed:**
- `python3 marketing/aeo/crawl_gate.py` now reports **5/5 claims pass** to
  the crawler UA, and the earlier UA-split banner is gone entirely. The head
  metadata fix (part 3 of the dispatch, `docs/seo-head-package.md`) reached
  production. Canonical is now `https://www.smokegame.win/`, matching the
  masterplan's chosen host.
- This is the single biggest win of the project so far: every AEO page
  shipped this session was invisible to crawlers until this landed.

**Did not land — confirmed absent:**
- **CrawlConsole tracker script** (dispatch part 1): `curl` against the live
  homepage (crawler UA, cache-busted) finds no
  `analytics.crawlconsole.com` reference anywhere in the served HTML.
- **Privacy page disclosure** (dispatch part 2): `/privacy/` returns HTTP 200
  at the same byte size as before (5820 bytes); no mention of "analytics,"
  "processor," "crawlconsole," or "third-party" anywhere in the page.

**Also still stale, unrelated to this dispatch:**
- Production `sitemap.xml` has only **4 URLs** (`/`, `/about/`,
  `/how-to-play/`, `/docs/`) — the repo's copy has 13, including every
  `/faq/` page and `/accessibility/`. Caffeine's copy has not synced these.
  None of the shipped FAQ/accessibility pages are discoverable via sitemap on
  production yet, even though they now pass the crawler-claims check
  individually if fetched directly.
- `llms.txt` is unchanged: still 637 bytes of Caffeine boilerplate, not the
  authored file.

**Conclusion: the composer's "build finished" report was correct about the
build succeeding, but wrong about which of the three requested changes
actually shipped.** This is exactly why the dispatch doc's own rule says
never report a Caffeine change as done without independent re-measurement —
confirmed necessary here, not theoretical.

## Do first when you wake (ranked)

1. **Go back to Caffeine with the specific gap.** Not "did it work" — tell
   the composer explicitly: the tracker script and the privacy disclosure did
   not land; only the head/metadata change did. Re-dispatch just those two.
2. **Get the production sitemap synced** to the repo's 13-URL version (or
   resubmit once synced) — otherwise the FAQ and accessibility pages stay
   undiscoverable even though they'd now pass the crawler check individually.
3. **Submit the sitemap in Google Search Console**
   (`docs/seo-gsc-checklist.md`) — worth doing now that the head/canonical
   fix is confirmed live; this was low-value while the crawler variant showed
   0/5 claims, not anymore.
4. **Fix the night-shift routine's empty `sources`/`outcomes`** so it can
   actually commit — two fired sessions have burned tokens and pushed
   nothing because of this (see `env-doctor` skill). T9–T15 are queued and
   waiting.
5. **Publish the devlog** (`marketing/devlog/godot-html5-on-icp.md`) to
   dev.to / Hashnode — the backlink profile is at zero per CrawlConsole
   (`docs/crawlconsole-integration.md`), and this is the strongest asset for
   starting it.
