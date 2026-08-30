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

## Theme and counters — resolved 2026-08-30

Captured footage of build `2026-08-26d` showed a pink mushroom fantasy forest
rather than the Wild West setting the site describes, which raised a genuine
mismatch. The owner confirmed:

- **The Wild West framing is correct.** The mushroom forest is an introductory
  area, thematically justified because Lil Blunt is himself a weed leaf.
- **The HUD counters are score counters**, still in progress — not holdings.

So wild-west keyword targeting and store copy stand. Two consequences that
still bind:

- **Choose Wild West screenshots over intro-forest ones.** The first image a
  player sees should match the promise the copy makes, or the page creates its
  own bounce.
- **Nothing in store copy may imply the counters accrue.** The description in
  `page-content.md` ends with the line stating scores are not on-chain and
  playing awards no tokens; keep it, and keep it in the description rather than
  buried in a FAQ.

## Uploading a build

`butler` is not installed here. When it is needed:

```bash
butler push <dir> youngstunners88/lil-blunt-adventure:html5
```

That pushes files only. It cannot set any page field, so it never removes the
need for the paste pass above.
