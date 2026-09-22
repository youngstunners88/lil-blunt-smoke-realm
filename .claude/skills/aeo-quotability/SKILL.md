---
name: aeo-quotability
description: Measure which specific passage on a page an answer engine would actually quote, using calibrated per-passage scoring — quotability, self-containment, question-fit and evidence density. Use when a page needs to be more citable by ChatGPT/Claude/Perplexity/Gemini, when deciding which paragraph to rewrite, before shipping AEO content, or when asked why a page is not being cited despite being good. Not for whether citation actually happened (aeo-measurement) or for site-wide crawlability and llms.txt (aeo-ai-discoverability).
---

# AEO — which passage gets lifted

```bash
python3 marketing/aeo/passage.py --page <file> --battery aeo
```

**Selection happens at passage level, not page level.** This is the reason a
page can be genuinely good and still never get cited: an assistant does not
quote a page, it quotes a paragraph. Every other scorer here grades whole
pages and averages that distinction away.

## The four rubrics and why each is there

| Rubric | The failure it catches |
|---|---|
| `quotable` | Prose that needs rewriting before it can be used as an answer |
| `self_contained` | A paragraph that dissolves when lifted out of its page |
| `answers_question` | Product description where a question-answer was needed |
| `evidence_density` | Vague marketing where concrete specifics were needed |

`evidence_density` is the one to weight hardest. The independent study in
`docs/gemini-aeo-research-2026-09-09.md` (602 prompts, 21,143 citations) found
Q&A *packaging* alone scored **−5.74%** while evidence types scored strongly
positive — **code +77%, statistics +62%, definitions +57%, comparisons +55%**.
Wrapping thin content in an FAQ accordion makes it worse. Adding a number, a
version string, or a named constraint makes it better.

## Measured baseline — `/how-to-play/`, 2026-09-20

```
page mean 1.97 / 3.00
  quotable            2.17
  self_contained      2.06
  answers_question    2.34
  evidence_density    1.31   <-- weakest, and the highest-value rubric
```

The pattern to expect on this project: **question-fit is fine, evidence is
thin.** The pages answer real questions but answer them with adjectives. The
fix is never "add more FAQ" — it is replacing a vague clause with a specific
one.

Concrete example of the move, from `/faq/not-the-artist/`, which scored 0.0035
on the gzip quality gate until this rewrite took it to 0.0653:

> before: the controls are simple and responsive
> after:  Left and Right arrow keys move, Spacebar jumps, Enter throws axes,
>         Shift sprints, and K performs a burst dash. WASD is not bound, which
>         is the most common reason a first-time player reports the character
>         will not move.

Same claim. One is quotable; the other is not.

## How to use the output

1. **Read `evidence_density` first.** Below ~1.5 means the page is describing
   rather than documenting.
2. **The STRONGEST passage is a template, not a trophy.** It shows what this
   page's voice sounds like when it works. Rewrite the weak ones toward it.
3. **The WEAKEST list names its own two worst rubrics per passage** — fix the
   named dimension, not the whole paragraph.
4. **Re-score after rewriting.** The point is a moved number, not a vibe.
5. **Nav, footers and boilerplate will score low and that is correct.** Ignore
   a 1.01 on "Home · About · X · Telegram". Only score real prose.

## The honest limit

A high score does not predict citation. It says this passage is more liftable
than its neighbours. **Only `probe.py` measures whether anything was actually
cited**, and the current baseline is 0 of 14. Ship the rewrite, then measure —
and remember the research finding that for a zero-authority domain, on-site
work has no *observed* path to citation on its own. This skill makes a page
worth quoting once someone arrives at it; it does not make them arrive.

## When this hands off

| Situation | Go to |
|---|---|
| Did anything get cited? | `aeo-measurement` |
| Crawlability, llms.txt, robots, schema | `aeo-ai-discoverability` |
| Is the entity even described correctly | `geo-representation` |
| Query intent and SERP position | `seo-intent-match` |
| Choosing between written variants | `jev-gauntlet` |
| Why on-site work may not be enough | `docs/gemini-aeo-research-2026-09-09.md` |
