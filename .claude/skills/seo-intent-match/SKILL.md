---
name: seo-intent-match
description: Measure whether a page actually satisfies the intent behind the query it targets — intent match, beyond-generic specificity, and scannability, scored per passage. Use when deciding what to write or rewrite for organic search, when a page ranks but does not convert, when choosing between topic ideas, or when auditing whether a page earns its place in a ranked list. Not for technical indexability and canonicals (seo-optimization, seo-smokegame-ship) or for AI citation (aeo-quotability).
---

# SEO — does the page satisfy the intent

```bash
python3 marketing/aeo/passage.py --page <file> --battery seo
```

Three rubrics, all about whether a human who clicked got what they came for:

| Rubric | The failure it catches |
|---|---|
| `intent_match` | A page about the topic that does not serve the need behind the search |
| `beyond_generic` | Text a hundred other browser-game pages could have written |
| `scannable` | A wall a skimmer bounces off before finding the fact |

## Read this before spending effort here

**Ranking pays very little on this project, and that is measured, not
pessimism.** `search-ranking-strategy` records search volume at roughly
**0–70/month** for the realistic query set. `docs/gemini-aeo-research-...` adds
that clicks on a link inside an AI Overview happen in about **1% of visits**.

So the honest use of this skill is **not** "climb the SERP". It is:

- **Quality control on pages written for other reasons.** Most pages here exist
  for AEO/GEO. `beyond_generic` still catches filler, and filler is the thing
  that makes a page worthless on every surface at once.
- **Choosing between topics before writing.** Score two drafts, write the one
  that is specific.
- **Catching pages that describe instead of answer.**

If a task is framed as "rank #1 on Google", read `search-ranking-strategy`
first and say plainly what the ceiling is. Do not let this skill imply that a
high score buys traffic that the volume data says does not exist.

## `beyond_generic` is the rubric with real teeth

The other two are hygiene. This one predicts whether a page deserves to exist.
The project's own evidence: `/faq/free/` was **dropped** rather than shipped —
it duplicated an answer already in `/how-to-play/` and stayed borderline by the
gzip gate. A page that says what every other page says is a liability on every
surface.

The lever is the same one AEO rewards, which is why this is cheap to do
together: replace a general clause with a specific one.

> generic:  runs smoothly in modern browsers
> specific: exported from Godot 4.3 to HTML5 and drawn through WebGL2, so it
>           needs a desktop browser from roughly 2020 onward

## Working the output

1. **Score before writing, not after.** The cheapest fix is choosing a
   different angle.
2. **`intent_match` below ~1.5 means the page is aimed wrong** — that is a
   restructure, not an edit.
3. **`beyond_generic` below ~1.5 is a delete-or-merge candidate.** Ask whether
   the page should exist before improving it.
4. **Low `scannable` on a long explanatory passage is often fine.** Judge it on
   pages a hurried player lands on, not on documentation.
5. **Run the `aeo` battery on the same page.** The rewrites overlap almost
   entirely; doing them separately wastes the work.

## Technical SEO is a different job and it is already clean

This skill scores **text**. It says nothing about indexability. Verified clean
on production as of 2026-09-09: `max-snippet:-1`, no `noindex`/`nosnippet`, no
`X-Robots-Tag`, `Google-Extended: Allow: /`. If the question is canonicals,
sitemaps, crawler parity or whether anything reached production at all, this is
the wrong skill — go to `seo-smokegame-ship`.

## When this hands off

| Situation | Go to |
|---|---|
| Canonicals, sitemap, robots, crawler parity | `seo-smokegame-ship` |
| Titles, meta, JSON-LD implementation | `seo-optimization` |
| What is realistically winnable, and volume | `search-ranking-strategy` |
| Real query data, once volume exists | `searchata-seo` |
| Making the same page quotable by AI | `aeo-quotability` |
| Whether the entity is described right | `geo-representation` |
