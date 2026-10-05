---
name: query-expansion
description: Widen the set of queries a page can match — modifier and synonym coverage measured now, plus the Search-Console harvest loop for when impression data exists. Use when asked how to rank for more keywords, why a page ranks for few terms, what words to add to a page, how to grow traffic from an existing ranking page, or when evaluating a "short page, huge traffic" case study. Not for whether the site is indexable (seo-smokegame-ship) or for AI citation (aeo-quotability).
---

# Query expansion — the right words, and the honest order

```bash
python3 marketing/aeo/modifiers.py --page <file>          # runnable today
python3 marketing/aeo/modifiers.py --page <file> --quick  # grep only, free
```

## The claim this skill exists to handle

A widely-shared case study: **AudioToText.com — 130k clicks/month, 3,150
keywords, 438 visible words, DR 18.** Conclusion drawn from it: *"you don't need
many words, you need the right words; you don't need domain authority, you need
the right backlinks."*

The mechanic described is real, and the loop at the end is worth running:

```
publish → earn backlinks and social mentions that describe the thing in
varied ways → Search Console → Performance → toggle average position →
filter position > 3 → add those phrases to the page → repeat
```

That is legitimate. You are finding queries the engine **already** associates
with your page and making the page actually answer them. It is the opposite of
guessing at keywords.

## But the case study inverts cause and effect

Read the transcript's own words: the page *"was shared all over social media. It
got a lot of backlinks."* Only then did it start ranking for terms it did not
contain — "mp3", "tool", "free".

**The backlinks were the cause. The low word count was incidental.** A short
page did not produce 130k clicks; a genuinely useful free utility that people
linked to produced 130k clicks, and the page happened to be short. Framing it
as "short pages win" reads the residue instead of the mechanism.

Three further cautions:

- **One case study cannot establish a mechanism.** The thousands of 120-word
  tool pages that earned nothing are not in the sample. Survivorship.
- **DR 18 is not the rebuttal it sounds like.** Domain Rating is a lagging
  aggregate. A page can hold strong, topically relevant links while the domain
  average stays low. "You just need the right backlinks" is true *and* is the
  expensive part — it is the whole job, not a shortcut past it.
- **The loop's input is impressions.** It reads queries you already rank 4–20
  for. On a page with no impressions there is nothing to read.

## Why the loop is blocked here, specifically

Both prerequisites are measured absent:

| Prerequisite | State |
|---|---|
| Search Console property | **None connected.** The Advanced GSC server reports no property; Searchata needs an OAuth flow that cannot complete in a headless session. |
| Backlinks to seed the expansion | **Zero.** CrawlConsole: `found: false`, `referringDomains: null`, `rows: []` — smokegame.win is absent from Common Crawl's web graph entirely. |

Plus search volume of roughly **0–70/month** for the realistic query set, and a
2026-09-27 probe in which 30 non-brand paraphrases returned zero mentions.

**So do not run the harvest loop yet and do not report it as a plan.** Step one
of the strategy — earn links and mentions — has not happened. Running the
harvest on zero impressions returns an empty list, and adding speculative
keywords to pages with no traffic is the "optimizing a prize nobody measured"
failure `blind-spots` names.

## What IS runnable today

`modifiers.py` does the half that needs no traffic data. For each modifier a
real person might type, two columns:

```
PRESENT     does the literal string appear?          grep, deterministic
SATISFIED   would the page actually answer that      Jev, judgement
            searcher if they landed here?
```

The second column is what keeps this from being keyword stuffing. "unblocked"
is not a word to sprinkle — it means *works on a school or office network*. The
cross of the two gives four verdicts, and they are different repairs:

| Verdict | Meaning | Fix |
|---|---|---|
| **SILENT WIN** | delivers it, never says the word | **Cheapest possible win.** Add the word. |
| **WORD ONLY** | says it, does not deliver | Fix the page, or drop the claim. Worst case. |
| **GAP** | neither | Add only if the intent is genuinely relevant and true. |
| **DONE** | both | Leave alone. |

### Measured on `/about/`, 2026-09-28

```
SILENT WINS (11)  no install · online · play now · no signup · on chromebook ·
                  in browser · side-scroller · score attack · western ·
                  cowboy · browser game
WORD ONLY (1)     mining
GAPS (7)          instant · unblocked · at school · works offline · retro ·
                  pixel art · webgl
```

Two findings worth keeping:

- **"western" scores 0.85 satisfied and appears zero times.** The page says
  "wild west" twelve times. Those are different strings a searcher types. Same
  for "cowboy" and "browser game". This is the single clearest instance of the
  transcript's actual mechanic that we can act on without any traffic data.
- **"mining" appears twice and scores 0.28.** The page names the Dustrock Mines,
  but the game is a platformer — there is no mining mechanic. The word is
  writing a cheque the game does not cash. Fix the wording rather than add more.

**And one gap to deliberately leave open: `works offline` is false.** The game
needs a network connection. A coverage grid is not a licence to add words that
are not true — the accuracy gate (`jev.py --gate`) still binds.

## Order of operations for this project

1. **Ship the pages that do not exist.** Five are phantoms (`assess.py`). A
   modifier grid on a page serving the homepage is worthless.
2. **Take the silent wins** — eleven words the page already earns. Free, honest,
   no new claims.
3. **Earn the first links.** This is the actual bottleneck and the transcript
   agrees: nothing in the loop starts without it. See `backlink-building`,
   `game-distribution`.
4. **Connect Search Console.** A founder task; `docs/seo-gsc-checklist.md`.
5. **Only then run the harvest loop** — and at 0–70 searches/month expect
   presence and accuracy, not a traffic graph.

## The strategic point the case study actually makes

AudioToText earned links because it was **a free single-purpose utility** — put
audio in, get text out. People bookmark and link to tools that save them work.
A game page is a different object: people play it and leave.

If the goal is the link profile that makes everything else work, the closest
analogue is not better game copy — it is **shipping a small free tool** adjacent
to the audience. That is a product decision, not an SEO tactic, and it belongs
in a conversation with `revenue-paths` and `build-principles` rather than being
smuggled in as a keyword exercise.

## When this hands off

| Situation | Go to |
|---|---|
| The page does not exist on production | `rapid-assessment` |
| Earning the links this depends on | `backlink-building`, `game-distribution` |
| Connecting Search Console | `docs/seo-gsc-checklist.md`, `searchata-seo` |
| Whether a page satisfies intent at all | `seo-intent-match` |
| Being quoted by AI rather than ranked | `aeo-quotability` |
| Checking a new word is not a false claim | `jev-gauntlet` |
