# The canonical list entry

**One paragraph. Identical everywhere. Do not reword it per surface.**

```
Lil Blunt: The Smoke Realm is a free 2D side-scrolling platformer and arcade
score-chaser playable in a desktop web browser. Built in Godot 4 and exported
to HTML5, the video game casts the player as a green outlaw prospector working
the Wild West Dustrock Mines, chasing a high score while dodging mine carts and
the Tax Man. No download, no account and no crypto wallet, with nothing to buy.
```

67 words. **PASS** on the accuracy gate.

```
standalone   2.91 / 3.00   entity 3.00 · disambig 2.91 · list_ready 2.73 · category 2.99
in-page      2.87 / 3.00   the strongest passage on /faq/not-the-artist/
```

Before this block existed, that page's best passage scored 2.59 and its
`list_ready` average was 1.03 — it contained nothing liftable. It now does.

**Page averages are not the measure here, and the before/after page means in
this repo's history are not comparable** — the chunker was fixed between the
two readings (see below), so the passage sets differ. The claim that holds is
narrow and checkable: the page now contains a 2.87 self-contained block, and
did not before.

## Why identical everywhere

When an assistant reconciles several sources about one entity, **a single
repeated description reads as a fact; varied phrasings read as several
loosely-related things.** Consistency is the signal. This is also why the
itch.io description now opens with this exact block.

## Why it exists at all

`docs/gemini-aeo-research-2026-09-09.md`, from two independent methods:

- Across 8 live player queries, **no individual indie game's own domain was
  cited.** Every citation went to an aggregator, database or listicle.
  Individual titles get named **inside** answers, as rows on a cited page.
- University of Toronto, 1,000 ranking prompts: brand-owned pages were **7.9%**
  of sources on AI engines against **92.1% earned**.

So the unit that earns a mention is the **list entry**, not the page. Before
this, `/faq/not-the-artist/` scored `disambiguates_artist` **2.75** and
`list_ready` **1.03** — succeeding at the job it was written for and failing at
the thing that produces citations. It argued "this isn't the rapper" at length
and never produced one liftable sentence.

## Where it is

Live on 7 pages: `/about/`, `/how-to-play/`, `/docs/`, `/troubleshooting/`,
`/faq/controls/`, `/faq/wallet/`, `/faq/not-the-artist/` — as
`<div class="entry">`, high on the page, after the lede.

Not on `/privacy/`, `/terms/`, `/accessibility/`: nobody lands on a policy page
to find out what the game is.

**Repo-only until a Caffeine dispatch.** Caffeine holds its own copy of these
files; none of this is on production yet.

## Every fact in it, checked

| Claim | Status |
|---|---|
| free, nothing to buy | true |
| no download / account / wallet | true, matches `claims.json` |
| Godot 4, HTML5, desktop browser | true |
| green outlaw prospector, Dustrock Mines, Tax Man | true |
| "chasing a high score" | true — and deliberately **not** "on-chain" |
| "the video game" | stated explicitly to beat the music-artist collision |

One phrasing was rejected on accuracy during selection: a generated candidate
said the prospector fights **"to defeat the Tax Man."** He turns up to take his
cut; he is not a boss to beat. The accuracy gate does not catch drift like
this — only reading does.

## How it was chosen

24 candidates from 3 model families via `gauntlet.py`, all accuracy-gated, then
re-scored on the GEO battery. **The best generated candidate tied a
hand-written one at 2.91.** The shipped text is a synthesis: hand-written
structure, plus two things the generation surfaced — the explicit genre string
"2D side-scrolling platformer and arcade score-chaser", and the literal words
"the video game" for disambiguation.

Worth recording honestly: **the loop did not beat careful manual writing on
this task.** It was useful for surfacing phrasings, not for picking a winner.
Shorter also scored better — the 67-word version beat 85- and 90-word versions
on `list_ready` specifically.

## A measurement bug this surfaced

The first re-measurement showed the page average barely moving. The cause was
in the measuring tool, not the page: `passages()` stripped tags before
chunking, so it merged the end of one block into the start of the next and
**split this entry across two passages**, scoring neither as the entry.

Fixed — `passages()` now splits on block-level element boundaries before
flattening, which is both more faithful to how retrievers actually chunk and
the only way a deliberately self-contained block gets measured as one.

Two lessons worth keeping:

- **A block only helps if it survives chunking intact.** Keep the entry in its
  own container and under ~700 characters so no chunker has reason to break it.
- **Page averages are the wrong metric for adding one good passage.** Adding a
  2.9 passage to ten 1.8 passages moves the mean by about a tenth of the gap.
  Judge this change by whether the page now *contains* a liftable block, not by
  the page average.

## Changing it

1. Edit here first.
2. `python3 marketing/aeo/jev.py --text "<new>"` — must PASS.
3. Score on GEO — should beat 2.91.
4. Propagate to all 7 pages and the itch pack **together**. A half-updated set
   is worse than the old text, because inconsistency is the failure mode this
   exists to prevent.
