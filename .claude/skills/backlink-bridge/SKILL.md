---
name: backlink-bridge
description: Track, pack, submit-hand-off and verify directory backlinks through the local backlink-bridge MCP server. Use when asked to submit the game to directories, build backlinks, check whether a listing is live, or work the founder's 30-site "Backlinks SEO" doc.
---

# Backlink bridge

Server: `marketing/backlinks/bridge/server.py` (registered in `.mcp.json`, dependency-free).
Registry: `marketing/backlinks/directories.json` (the 30 sites from the founder's doc, tiered).
Ledger: `marketing/backlinks/ledger.jsonl` (append-only).

**Tiers.** A = a player might click (hashnode devlog, startupfa.me, linkcentre, viesearch, sideprojectors). B = generic launch sites, weak fit. C = do not submit (AI-tool, B2B software review, local-business directories). Never file the game as an "AI tool" to fit a form: that is a false claim.

**Flow.** `bl_targets` → `bl_probe(id)` (is the form live, captcha, login) → `bl_pack(id)` (gated copy) → founder submits → `bl_record(id, submitted)` → `bl_verify(id, listing_url)`.

**Rules.**
- The bridge never submits forms, makes accounts or solves captchas. Submitting is the founder's act (backlink-building: one first impression per site).
- A link is **LIVE** only when `bl_verify` fetched the listing and found an anchor to smokegame.win or the itch page. `bl_record` cannot set live. Report `rel=nofollow` honestly.
- Report as: `N LIVE verified of 30 researched; M submitted, unverified`.
- Copy comes from `marketing/itch/page-content.md` and `claims.json`; the itch slug is `smokerealm`. Run `bl_gate` on any hand-written text.
- Follow claims ("do-follow") are the site's own words, not verified.
