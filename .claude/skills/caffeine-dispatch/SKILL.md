---
name: caffeine-dispatch
description: Send changes to the live site through Caffeine safely — what its chat agent can and cannot do, how to word a draft-only round, how to read its replies, how to verify a draft, and what must wait for the founder's Go live. Use before ANY message to a Caffeine project, when a dispatch "did nothing", when Caffeine reports failed tests, or when asked to push a site change to production.
---

# Dispatching to Caffeine

Project id for Lil Blunt Smoke Realm: `01a01482-6280-76be-b1ce-57c143787685` (`caffeine_list_projects`).
Production is built from **Caffeine's own copy** of the source, not this repo. Committing here changes nothing live.

## What the chat agent can and cannot do (verified 2026-10-01)

| Can | Cannot |
|---|---|
| Apply text and link edits you paste in full | Read files, diffs, test logs or the repo (index 505: "no file access") |
| Build a draft and report a version number | Verify its own deployed output; its "verified" means source only |
| Answer from docs it has | Explain why a build "did not pass"; it only relays the notice |

So: **paste the full text** of anything it must write, never "see marketing/x.md". Ask questions it cannot answer and it will say so.
Do not trust a reply that describes file contents; trust the live site after publish.

## Rules for every round

1. First line: `ROUND N — build ONE new draft and DO NOT go live. The founder will publish.` End with the same reminder. A chat message once auto-promoted a draft (v40), so assume any send could publish and say so to the founder.
2. List exactly what may change, then the protected items: no packages, routes, SSR/SSG, styling, SmokeBackground or video, CrawlConsole tracker, www URLs (see `keep-the-video`).
3. Ask for "every file you changed and what you could not verify". It often omits this; do not accept silence as success.
4. State standing rules in the message: llms.txt is never visible on the site (no link or text anywhere); itch URL is `https://youngstunners88.itch.io/smokerealm`.
5. Gate the text first: `python3 marketing/aeo/jev.py --gate FILE` and the checks in `fix-gauntlet`.
6. **Drafts stack.** A new round builds on the latest draft. Do not send a second round on an unverified draft unless the founder wants one publish at the end.
7. Read replies with `caffeine_chat_list` and a `fromIndex` (the full history is ~500k characters; never list from 0).

## Verifying

- Version ids: `caffeine_show_project` gives `liveDraftId` and `lastDeployedDraftId`. Never call a draft live.
- The draft URL is behind a login token. Do not print or reuse the token; headless Chromium here rejects the sandbox proxy certificate and TLS must not be bypassed.
- The CLI route (`caffeine_local_setup`, `@caffeineai/cli`) installs but cannot log in here: it needs an OS keychain ("No matching entry found in secure storage"). Needs the founder's own machine.
- Therefore verify after the founder presses Go live, in this order, and report each with its view:
  `python3 marketing/aeo/verify_publish.py`, `python3 marketing/aeo/tech_audit.py`, `python3 marketing/aeo/surface_audit.py`.
- The prerender cache can serve a stale crawler snapshot after a publish (max-age about 14 days, no purge). Query-string requests bypass it, so a cache-busted pass proves the app, not the crawler view.

## Facts proved by use (2026-10-02)

- Files in `public/` are copied to production unchanged (`llms-full.txt` came through byte for byte).
- **`/llms.txt` is platform-owned**: Caffeine serves its own boilerplate there even when `public/llms.txt` is ours. Our brief lives at `/llms-full.txt`. Do not spend another round fixing `/llms.txt`; ask Caffeine support if it matters.
- After Go live the app view is current at once; the **crawler view lagged by minutes** after Version 48 (plain URL still old, then current about 10 to 20 minutes later). Earlier publishes were slower, so never assume: compare the plain URL (Googlebot UA) with the same URL plus a random `?cb=` (browser UA), report both, and re-check before calling crawlers fixed.
- Caffeine's source grep (read-only message) is the only way to see what a draft contains; ask for exact grep results with file and line.
- A draft preview can expire; ask for a fresh draft before the founder tries to publish.

## Stop and ask the founder when

A reply says tests failed and you cannot see why; a change touches the homepage layout or video; a round needs a secret; the founder has not said Go live was acceptable for the content.
