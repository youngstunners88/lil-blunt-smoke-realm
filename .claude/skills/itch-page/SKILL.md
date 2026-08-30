---
name: itch-page
description: Audit and fill out the itch.io store page — what the read-only API can and cannot do, the fields that actually drive visibility there, and the paste-ready content pack. Use when asked to update, fix, optimize or automate the itch.io page, upload a build, or improve discoverability on itch.
---

# The itch.io Page

## What can and cannot be automated — read this before promising anything

**The itch.io server-side API is read-only for page metadata.** The whole
server-side surface is six endpoints:

```
/credentials/info   /profile   /profile/games
/games/ID/download_keys   /games/ID/purchases   /wharf/latest
```

Zero `PATCH`, zero `PUT`, no endpoint that edits a title, description, tagline,
tags, cover image or screenshots. **No MCP server can change this**, because
there is no endpoint behind it — an MCP server is a wrapper around an API, not
a substitute for one.

The only write path itch offers is **butler**, which uploads *build files*, not
page fields. Browser automation against the web form is the other theoretical
route, and it does not work from this sandbox: the browser cannot reach the
public internet (see `project-playbook` tooling notes).

So the honest division of labour is: **this side audits and writes; a human
pastes.** `marketing/itch/page-content.md` exists to make that paste-only.

```bash
python3 marketing/itch/audit.py        # read live state, exit 1 on blocking gaps
python3 marketing/itch/make_cover.py   # generate the 630x500 cover
```

`ITCH_API_KEY` and `BUTLER_API_KEY` are both in the environment.

## What actually drives visibility on itch

Ranked by how much each moves discovery *within itch's own store*, which has
its own browse and search independent of Google:

1. **Cover image (630x500).** Every browse listing, search result, embed card
   and collection tile is a thumbnail. With no cover the game is visually
   absent from the store regardless of page quality. `audit.py` treats a
   missing cover as blocking for this reason.
2. **Tagline (`short_text`).** The line under the title everywhere, and what
   social cards and search snippets lift.
3. **Tags.** itch runs its own internal search over tags and body text. Up to
   10; accurate ones only. Never `nft`, `play-to-earn` or `crypto` here —
   inaccurate, and they attract the audience most likely to leave disappointed.
4. **A short gameplay GIF.** itch autoplays it in the page header. It moves
   click-through more than any amount of description.
5. **Screenshots showing motion and threat.** A static frame of scenery reads
   as a screensaver.

## State as of 2026-08-29

`audit.py` against the live account returned:

- **No cover image** — blocking
- **No tagline** — blocking
- Title `Lil Blunt Adventure` vs the site's `Lil Blunt: The Smoke Realm`
- Embed fullscreen **disabled** at 1280x720 — a real limit for a platformer
- No traits set
- 273 views, 0 downloads

**Do not change the URL slug.** Renaming the page title is free; changing the
slug breaks every existing link, and the views already accumulated are not
worth resetting.

## The blocker on writing the description

Recorded gameplay of build `2026-08-26d` shows a **pink mushroom fantasy
forest**, not the "1800s Wild West mining town" the website describes, and the
HUD shows `GOLD · DIAMONDS · TITANX · wBTC · XAUT · BLAZE DIAMONDS · VESTING 0%`
against a site that states plainly that playing awards no tokens.

Two questions must be answered by the owner before store copy can be written
honestly, and both are recorded in `marketing/aeo/LESSONS.md`:

1. Is the mushroom forest one area of a broadly Wild West game, or is the
   Wild West framing describing a different product than the one that ships?
2. Are the token counters cosmetic score names, or do they represent something
   accruing?

**Do not write around this.** A store description is the page a disappointed
player compares the game against, and the keyword targeting downstream of it
(`search-ranking-strategy`) currently aims at wild-west terms. If the theme
does not match, that traffic bounces and the bounce is deserved.

## Uploading a build

`butler` is not installed here. When it is needed:

```bash
butler push <dir> youngstunners88/lil-blunt-adventure:html5
```

That pushes files only. It cannot set any page field, so it never removes the
need for the paste pass above.
