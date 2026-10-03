---
name: link-change
description: Change a URL, slug, domain, handle or product name everywhere without missing a place or overstating progress — registry first, sweep every location, route each one, verify LIVE, and report in STAGED, DRAFT and LIVE words. Use whenever any canonical link changes (itch slug, www host, X handle, domain), when a founder says "update it everywhere" or "why is the old link still there", and before telling anyone a link is updated.
---

# Changing a link everywhere

Incident, 2026-10-01 and 02: the itch slug changed to `smokerealm`. The repo was updated and Caffeine drafts were built,
and the founder was told so. The live site still carried the old link in 12 places (homepage JSON-LD and footer, About,
How to Play including its FAQ answer, and both Play buttons in the script) because nothing is live until the founder
presses Go live, nothing had swept every location, and "updated" was said about a repo and a draft. The old slug only
worked because itch redirects it.

## The rule

**"Updated" means the sweep is clean in the LIVE rows. Anything else is STAGED or DRAFT, and you say that word.**

| Word | Meaning | Who can make it true |
|---|---|---|
| STAGED | changed in this repo, committed | you |
| DRAFT | built as a Caffeine draft version, not published | you, via `caffeine-dispatch` |
| LIVE | served at www.smokegame.win, crawler and app view | **the founder presses Go live** |

## Steps

1. **Registry first.** Edit `marketing/aeo/canonical_links.json`: the new canonical URL, the old forms as `forbidden_regex`, and a note. Add paths that legitimately explain the old form to `allow_paths` (history, lessons).
2. **Sweep.** `python3 marketing/aeo/link_sweep.py`. It lists every hit by location: repo, each live page (crawler view), live homepage and JS bundle (app view), owned sites, itch. Read the whole list; the surprises are the point.
3. **Fix the repo** hits (STAGED). Fix wrong guidance too: a skill that tells the next session the old URL will recreate the bug.
4. **Caffeine.** Production is built from Caffeine's copy. Send a draft-only round that **names every file from the sweep** (`caffeine-dispatch`). Never write "everywhere". Then ask for a read-only source grep of the old form; its reply is the only proof of what the draft contains.
5. **Founder-only places.** Itch page body, DIAMONDS and other owned repos (you may edit those if approved), LinkedIn, X, Facebook, Search Console, NameSilo. Put paste-ready text in `docs/decisions-<date>.md`. These are UNCHECKED in the sweep until the founder pastes the text.
6. **Tell the founder, leading with the live count.** Format: `LIVE still shows the old link in N places. Version X is a DRAFT with the fix. Press Go live on version X.` Never open with what you changed.
7. **After Go live:** `link_sweep.py` and `verify_publish.py` must show 0 LIVE hits. The prerender cache can serve an old crawler snapshot (about 14 days, no purge): if the app view is clean but the crawler view is not, say so with the response age; do not call it fixed.
8. **Log it** (`log_lesson.py`) if the sweep found a place you did not expect.

## Never

- Say "updated", "done" or "fixed" for something not LIVE.
- Rely on a redirect. The old URL working is not a reason to leave it.
- Treat a link inside JSON-LD, a visible link text, a test file or the JS bundle as separate from "the link".
- Skip the sweep because the change "is just one string".
