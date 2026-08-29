---
name: aeo-measurement
description: Measure whether answer engines actually recommend this game, and track it over time — entity fan-out probes, share of voice, citation mining, and the gzip quality gate for content before it ships. Use when asked whether AI search knows about the site, to track AI visibility, to find what pages get cited, or to check content quality before publishing.
---

# Measuring AI Visibility

Two scripts. `marketing/aeo/probe.py` records whether grounded answer engines
recommend the game. `marketing/aeo/quality_gate.py` checks a draft page reads
as documentation rather than filler before it goes live.

```bash
python3 marketing/aeo/probe.py --run --report      # probe, append, trend
python3 marketing/aeo/probe.py --report            # trend what is recorded
python3 marketing/aeo/quality_gate.py draft.md     # gate one page
python3 marketing/aeo/quality_gate.py --all src/   # gate a tree
```

## The method, and why it is shaped this way

Adapted from Dan Petrovic's approach. Three design choices carry the weight:

**Prompt volume does not exist.** Two people never type the same prompt, and
most sessions are multi-turn. Any tool selling "prompt search volume" is
selling a fiction. So nothing here estimates volume. What is real: whether the
brand appears in an answer, where in the list, and how often across runs.

**Grounding stays ON.** Probes use OpenRouter's `:online` models. Ungrounded, a
model answers from frozen pre-training and the series measures nothing but its
training snapshot. The whole point is to watch the live index move underneath
a frozen model.

**Questions are entity fan-outs, not brand queries.** `questions.json` asks
what a player would ask — "free browser platformer", "Wild West game". A
direct brand query is included as a control, and it is the only one that hits
today; that gap is the actual measurement.

## What is recorded, and what each number is worth

| Metric | Meaning |
|---|---|
| `ordinal` | Position in the returned list. 1 is best, absent is worst. |
| `rate` | Fraction of probes mentioning us at all. |
| `cite%` | Our URLs as a share of everything the model leaned on. |
| `SoV` | Blend of position-weighted mention share and citation share. |

**Early on, `rate` is the only number that matters.** While it sits near zero,
ordinal and SoV are statistics over an empty set. Do not report them as
progress.

**Never call a win on one run.** These are small samples against
non-deterministic models. A shift counts when it holds for **three consecutive
runs**. This is the same discipline as `ad-hook-testing`, for the same reason.

## Two traps already hit — do not re-introduce them

**Forcing JSON-only output silently disables the web search.** Asking a model
to reply with nothing but a JSON object makes it skip grounding and answer from
training. Annotations come back empty, every probe still "succeeds", and the
whole series quietly measures the training snapshot. The prompt now asks for a
normal grounded answer *followed by* a fenced JSON block, and the parser reads
the last fence. If citations ever read zero across every probe, suspect this
first.

**Gemini hides its citation domains.** Its annotations point at
`vertexaisearch.cloud.google.com/grounding-api-redirect/...` URLs. Matching a
domain against the URL fails; the real domain is in the annotation `title`.
`cited_urls()` keeps both fields for that reason. Grok returns real URLs.

## Citation mining is the most actionable output

The report's competitor list is not trivia. Those are the pages already
selected as grounding sources for our target entities — the exact set worth
studying, and worth asking to be listed on. That is the fastest documented
route into the grounding pool: get added to a page that is already being cited,
rather than waiting for a new page to earn its own way in.

## Cost, and therefore cadence

Measured, not estimated: **Gemini ~$0.115/probe, Grok ~$0.395/probe.** Seven
questions on Gemini alone is ~$0.80 a run. At a $10-scale budget that means
**weekly, on Gemini**, not daily on three models. Add a second model only when
investigating a specific discrepancy.

## The quality gate

`quality_gate.py` classifies text by gzip compression distance against a
known-good and a known-filler corpus — Shannon's idea, no model involved. If a
candidate comes from the same distribution as the reference, appending it
compresses better.

This matters because the content plan is to publish documentation-style pages,
which is what answer engines now cite. Pages that read as generated filler are
exactly what indexes discard, and no amount of schema markup rescues them.
Gate before publishing, not after.

Verdicts are `documentation`, `filler`, `ambiguous`, `too-short`. **Treat
`ambiguous` as a fail** — a narrow gap means the text has neither the
specificity of real documentation nor the tells of filler, which is its own
kind of forgettable. Exit code is non-zero on any fail, so it can gate a
publish step.

The corpora in `marketing/aeo/corpus/` are seeded by hand to encode what *this
project* means by documentation-grade: specific, verifiable, procedural. It
sharpens as real samples are added — drop cited competitor pages into `good/`
and content-farm pages into `spam/`. Below ~2000 bytes per corpus the script
refuses to classify rather than return a confident coin-flip.

## Honest limits

- This measures *a* grounded model's answer, not ChatGPT's or Claude's product
  surface. Those have their own retrieval stacks, system prompts and
  personalization. Directionally useful, not a substitute for checking by hand
  in the real products occasionally.
- Personalization and multi-turn context are not simulated.
- The classifier detects *register*, not truth. A confidently wrong page
  written in documentation style passes. The `AGENTS.md` accuracy rules are
  what catch that, and they are not optional.
