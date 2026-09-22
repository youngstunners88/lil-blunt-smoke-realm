---
name: jev-gauntlet
description: Score and select SEO/AEO/GEO content using Jev, a calibrated typed-decision model reachable through our OpenRouter key, and run an evolutionary generate-gate-score-select loop over copy. Use when writing or choosing marketing copy, FAQ/AEO page text, outreach pitches, itch.io descriptions, or taglines; when public-facing text needs an accuracy check against the AGENTS.md blocking rules before it ships; or when asked to generate many variants and pick the best. Not for measuring whether anything got cited (aeo-measurement / probe.py) or for prose debate between models (model-gauntlet).
---

# Jev gauntlet — calibrated judging for copy

Three tools in `marketing/aeo/`:

| | What it does |
|---|---|
| `jev.py` | Accuracy gate + content rubrics |
| `calibrate.py` | Proves the gate's numbers mean what they say |
| `gauntlet.py` | generate → gate → score → select loop |

## Reaching Jev

```python
POST https://openrouter.ai/api/alpha/decisions
{"model": "~typesafe/jev-latest", "state": "...", "questions": {...}}
```

**The leading `~` is required** and the endpoint is not `chat/completions`.
Posting to `chat/completions` returns *"`~typesafe/jev-latest` is a decisions
model and cannot be used with the chat/completions endpoint"* — which is
OpenRouter telling you the model exists, not that it doesn't. It also does not
appear in `GET /v1/models`, so **a catalogue search will tell you it is absent
and the catalogue search is wrong.** Verify a model by calling it.

`/api/v1/systemone` works identically. Both resolve to a pinned version
(`typesafe/jev-1.13-20260917` as of 2026-09-20) which `jev.py` logs on every
response — confidence gates are calibrated to one model and a silent upgrade
breaks them quietly.

Schema note: `score` questions take `criteria` as an **array**; the TypeSafe
SDK's `legend={...}` form is rejected here.

### Two backends

| Backend | What it is |
|---|---|
| `openrouter` (default) | **Real Jev.** RLCD-trained, so probabilities are optimised against real outcomes. 32K context — a whole page is one call. ~$0.000015 per battery. |
| `demo` | `simple-jev`'s free keyless endpoint. **Not Jev** — it reads next-token logits off generic open models to imitate the interface. Same response shape, *not* calibrated, ~2K context. A fallback, not an equal. |

The demo needs a real `User-Agent`; Cloudflare 403s `Python-urllib` with
"error code: 1010", which reads as an outage but is a UA block.

## The accuracy gate

```bash
python3 marketing/aeo/jev.py --gate src/frontend/index.html   # exit 0/1
python3 marketing/aeo/jev.py --self-test                      # prove separation
python3 marketing/aeo/calibrate.py                            # prove the numbers
```

Scores text against the four blocking rules in `AGENTS.md` § Public Claims
Accuracy. **This project has shipped a false on-chain claim three times** — the
`/how-to-play/` FAQ schema, the homepage JSON-LD, and the itch.io page. Each
was caught by a human, twice only weeks later. The gate catches all three in
one call. It reads JSON-LD deliberately: two of the three hid in a `ld+json`
block where a human skims past.

### These numbers are measured, not asserted

`calibrate.py` runs 14 labelled cases — the real strings that shipped and were
walked back, plus honest counterparts — and reports:

```
Brier score   0.0146   (0 perfect, 0.25 = coin flip)
ECE           0.0757   (0 = predicted matches observed)

onchain_scores          violating 0.745  honest 0.030  thresh 0.25
verifiable_leaderboard  violating 0.970  honest 0.020  thresh 0.30
rewards                 violating 0.865  honest 0.027  thresh 0.25
play_to_earn            violating 0.970  honest 0.040  thresh 0.40
```

**Verdict: well calibrated on our own content** — a 0.74 can be read as roughly
a 74% chance the claim is really there, not merely "higher than 0.3". RLCD
calibrates against TypeSafe's distribution, not ours, so this re-measures on
ours. Grow `CASES` in `calibrate.py` whenever a new violation is found; the
measurement is only as good as the labels.

### Thresholds are per-question, and live in code

One number for the whole system is wrong — each threshold is scaled to what
being wrong costs. `onchain_scores` and `rewards` sit tightest (0.25) because
those two are the claims actually shipped and retracted. `play_to_earn` is
loosest (0.40) because it is inferential, so honest "free to play" copy scores
slightly higher. Thresholds belong in `GATE_THRESHOLDS`, never in the prompt:
when priorities change you edit a coefficient, not a question.

### The fallback ladder

```
Jev healthy                -> gate decides, thresholds apply
Jev errors, demo available -> retry on demo, flag DEGRADED (advisory only)
both unavailable           -> BLOCK and require human review
```

**Never pass text because the scorer was down.** A missed violation ships; a
false block just asks a human to look. `--ladder` prints this.

## Design rules that make the gate work

From TypeSafe's own methodology, and they are load-bearing:

- **Atomic questions, composed in code.** A question needing reasoning across
  several factors gets decomposed — ask each factor separately, combine with
  your own weights. "Is this copy accurate?" is unanswerable; four specific
  claim-detectors are trivially answerable.
- **Deterministic facts in code, model for fuzzy judgment.** Never spend a Jev
  call on something `grep` can answer. Keyword counts, byte sizes, tag presence
  — all code. Jev only interprets.
- **The battery is the unit, not the question.** Every question is evaluated in
  parallel and in isolation, so six cost about what one costs and there is no
  context rot between them. One question is a demo.

## The gauntlet loop

```bash
python3 marketing/aeo/gauntlet.py \
  --brief-text "Write an itch.io tagline under 120 chars..." \
  --rounds 2 --variants 4 --out /tmp/results.json
```

```
generate   N variants x 3 OpenRouter model families   (costs money)
gate       blocking accuracy check                    (runs FIRST)
score      4 AEO rubrics                              (~$0.00003/candidate)
select     rank; winners seed the next round
```

The gate is **not a tiebreaker** — a variant claiming on-chain scores is
deleted regardless of how good the copy is. The blocking rules are also
injected into the generation prompt, so violations are prevented as well as
caught; a run showing `blocked: 0` is the system working, not the gate being
untested. Use `--self-test` to test the gate.

### vs `model-gauntlet`

`model-gauntlet` has models argue in prose and a human reads it — high quality
per judgement, expensive, so it runs on one idea a few times. This runs cheap
calibrated judging over dozens of candidates. **Deciding *what to do* →
`model-gauntlet`. Deciding *which wording ships* → here.**

## Honest limits

- **A win here does not predict citation.** Nothing in this loop measures AI
  visibility. Only `probe.py` does. Ship the winner, then measure.
- **Rubrics are tuned for prose, not short-form.** Taglines score 0.84–1.65 /
  3.00 because a 120-character line cannot be "self-contained" or
  "evidence-dense". Compare variants against each other; ignore the absolute.
- **Calibration is ours, not universal.** Brier 0.0146 is on 14 cases of *this
  project's* copy. It says nothing about unrelated text.
- **Jev cannot chain dependent judgements in one call.** Questions are isolated
  by design; a judgement that depends on another answer is a second request.

## When this hands off

| Situation | Go to |
|---|---|
| Did anything actually get cited? | `aeo-measurement` (`probe.py`) |
| A strategic decision, not copy selection | `model-gauntlet` |
| Authoring the page around the copy | `aeo-ai-discoverability` |
| Is the live site even crawlable | `seo-smokegame-ship` |
| Outreach targets for the copy | `backlink-building` |
