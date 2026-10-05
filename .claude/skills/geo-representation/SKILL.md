---
name: geo-representation
description: Measure whether generated text would describe this game CORRECTLY — entity clarity, disambiguation from the music artist of the same name, list-readiness, and category anchoring. Use when AI describes the game wrongly or confuses it with something else, when preparing copy that will live on a third-party site or directory listing, when working the brand-name collision, or when asked about GEO. Not for whether a page gets quoted (aeo-quotability) or whether citation happened (aeo-measurement).
---

# GEO — being described correctly, not just being found

```bash
python3 marketing/aeo/passage.py --page <file> --battery geo
```

SEO competes for a position. AEO competes to be quoted. **GEO is about the
representation itself** — when generated text mentions this game, is it right?

That is not academic here. Two concrete, measured representation failures:

1. **"Lil Blunt" is an established music artist** with releases on Amazon Music
   and YouTube. A 0/14 probe result cannot distinguish "the model doesn't know
   this game" from "the model knows the name and thinks it's a rapper."
2. **The itch.io page has carried Web3/NFT copy** the site itself denies. When
   an assistant reconciles two contradictory sources about one entity, the
   wrong description is the one that propagates.

## The four rubrics

| Rubric | Question |
|---|---|
| `entity_clarity` | After only this passage, is it certain what kind of thing this is? |
| `disambiguates_artist` | Is it clear this is a game, not a musician? (0–3, from a truth judgement) |
| `list_ready` | Could this drop straight in as one row of "best free browser games"? |
| `category_anchored` | Are genre, theme, platform and price legible? |

## `list_ready` is the one that matters most, and here is why

`docs/gemini-aeo-research-2026-09-09.md` found, from two independent methods:

- Across 8 live player queries, **not one individual indie game's own domain
  was cited.** Every citation went to an aggregator, database, or listicle.
  Individual titles get named **inside** answers — because they are rows on a
  cited browse page.
- University of Toronto, 1,000 ranking prompts: on AI engines, brand-owned
  pages were **7.9%** of sources against **92.1% earned**.

**So the unit of GEO for a small title is the list entry, not the page.** The
text that matters is the text about you sitting on somebody else's site.

## Measured baseline — `/faq/not-the-artist/`, 2026-09-20

```
page mean 1.79 / 3.00
  entity_clarity        1.98
  disambiguates_artist  2.75   <-- the page's actual job, done well
  list_ready            1.03   <-- the thing that earns citation, not done
  category_anchored     1.41
```

Read that honestly: **the page succeeds at what it was written for and fails at
the thing the research says produces citations.** It argues "this is not the
rapper" at length and never produces one liftable sentence that a listicle
author or an assistant could paste as the game's description.

That gap is the single most actionable GEO finding on this project.

## The fix pattern: write the list entry explicitly

Every page that describes the game should contain one passage built to be
stolen — name, category, platform, price, hook, in one self-contained run:

> **Lil Blunt: The Smoke Realm** — a free Wild West platformer that runs in the
> browser with no download, wallet, or account. Built in Godot 4, you play a
> green outlaw prospector digging the Dustrock Mines while dodging the Tax Man.

That scores high on all four rubrics at once: named, categorised (genre, theme,
platform, price), unmistakably a game, and drop-in ready. Put one on every page
that introduces the game, and put the best one on the third-party listings.

## Where to spend GEO effort, in order

1. **Third-party listings first** — itch.io, IGDB, free-HTML5 directories. This
   is where the 92.1% lives. `marketing/itch/page-content.md` is written and
   unpasted.
2. **Accuracy before polish.** A listing that contradicts the site actively
   corrupts the representation. Gate every listing:
   `python3 marketing/aeo/jev.py --gate <file>` — the live itch page currently
   **BLOCKS** on three of four rules.
3. **Then on-site list-ready passages**, so anyone writing about the game has
   something correct to copy.

## The honest limit

This measures whether text *would* describe the game correctly. It does not
measure what models currently say — `probe.py` does that, and the brand query
is the one probe that has ever returned a hit. **A GEO score of 3.0 on a page
nobody cites changes nothing.** Pair every rewrite with a listing.

## When this hands off

| Situation | Go to |
|---|---|
| Getting listed on third-party sites | `backlink-building`, `game-distribution` |
| The itch.io page specifically | `itch-page` |
| Whether models currently describe it right | `aeo-measurement` (`probe.py`) |
| Making a passage more quotable | `aeo-quotability` |
| The brand-name collision strategy | `search-ranking-strategy` |
| Accuracy-gating listing copy | `jev-gauntlet` |
