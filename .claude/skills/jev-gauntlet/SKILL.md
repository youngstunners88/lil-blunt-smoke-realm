---
name: jev-gauntlet
description: Score and select SEO/AEO/GEO content using Simple Jev, a free key-less numeric judge, and run an evolutionary generate-gate-score-select loop over copy. Use when writing or choosing marketing copy, FAQ/AEO page text, outreach pitches, itch.io descriptions, or taglines; when a piece of public-facing text needs an accuracy check against the AGENTS.md blocking rules before it ships; or when asked to generate many variants and pick the best. Not for measuring whether anything got cited (aeo-measurement / probe.py) or for prose debate between models (model-gauntlet).
---

# Jev gauntlet — numeric judging for copy

Two tools, both dependency-free, both in `marketing/aeo/`:

| | What it does | Cost |
|---|---|---|
| `jev.py` | Accuracy gate + content rubrics | **Free, no API key** |
| `gauntlet.py` | generate → gate → score → select loop | OpenRouter tokens for generation only |

## Start here: the accuracy gate

This is the highest-value part and it costs nothing.

```bash
python3 marketing/aeo/jev.py --gate src/frontend/index.html
python3 marketing/aeo/jev.py --text "some copy you are about to ship"
```

It scores text against the four blocking rules in `AGENTS.md` § Public Claims
Accuracy and exits non-zero on a violation, so it drops into a pre-commit hook
or a night-shift validation step.

**This project has shipped a false on-chain claim three times** — the
`/how-to-play/` FAQ schema, the homepage JSON-LD, and the itch.io page. Each
was caught by a human reading carefully, twice only weeks later. The gate
catches all three in about a second.

### Why the gate is trustworthy (and how to re-verify)

It is trustworthy because the separation was **measured**, not assumed:

```
                        honest    violating    gap
  onchain_scores         0.013       0.983    0.970
  verifiable_leaderboard 0.012       0.976    0.964
  rewards                0.016       0.931    0.916
  play_to_earn           0.012       0.699    0.686
```

Run `python3 marketing/aeo/jev.py --self-test` before trusting it in any new
workflow. It re-measures that gap and **fails loudly if it has closed** — the
gate is worthless without separation, and the endpoint is a free demo that can
change its models underneath us. Threshold is 0.35, biased toward catching:
a false positive costs a re-read, a false negative ships a lie.

It reads JSON-LD deliberately. Two of the three historical violations lived
inside `<script type="application/ld+json">`, exactly where a human skims past.

## What Simple Jev actually is

Not a chat model. It sends your context plus a set of questions, reads the
model's **next-token logits** for the allowed answer labels, and **constructs
the JSON server-side**. Nothing is generated.

Consequences that matter:

- **No parse failures.** There is no model output to parse. Compare `probe.py`,
  which needs a balanced-brace scanner because models wrap JSON in prose.
- **Numeric confidence**, not a tone of voice. You get a distribution.
- **Cheap enough to run hundreds of times**, which is what makes a selection
  loop possible at all.

Three question types: `choice` (pick one + distribution), `score` (rubric
index, fractional, e.g. 2.89/3), `noul` (truth judgement 0.01–0.99).

### Verified facts (2026-09-20 — re-check before relying on these)

- Endpoint `https://simple-jev-demo-api.featherless.ai/v1/classifier`, **no auth**.
- Models: list them with `--models`. The **upstream README is stale** — it
  advertises a `gemma-4-26B` id the demo does not serve. Default here is
  `featherless-ai/Qwen3.8-27B-classifier`.
- **Cloudflare 403 "error code: 1010" on the default `Python-urllib` UA.**
  curl works, urllib does not. `jev.py` sends a real User-Agent. If you write a
  fresh client and it 403s, this is why — it is not an outage.
- Documented limits are 2k context / 2 RPS. Both were observed softer (3047
  tokens accepted, 5 concurrent all 200). `jev.py` self-throttles to the
  documented figures anyway; undocumented leniency is not a contract.

## The gauntlet loop

```bash
python3 marketing/aeo/gauntlet.py \
  --brief-text "Write an itch.io tagline under 120 chars..." \
  --rounds 2 --variants 4 --out /tmp/results.json
```

```
generate   N variants x 3 OpenRouter model families   (costs money)
gate       blocking accuracy check                    (free, runs FIRST)
score      4 AEO rubrics                              (free)
select     rank; winners seed the next round
```

The gate is **not a tiebreaker**. A variant claiming on-chain scores is deleted
regardless of how good the copy is. The blocking rules are also injected into
the generation prompt, so violations are prevented as well as caught — which
means a clean run showing `blocked: 0` is the system working, not the gate
being untested. Use `--self-test` to test the gate.

### How this differs from `model-gauntlet`

`model-gauntlet` has models argue in prose and a human reads the argument —
high quality per judgement, expensive, so it runs on one idea a few times. This
runs cheap numeric judging over dozens of candidates. **They are for different
jobs:** use `model-gauntlet` for a strategic decision that is expensive to get
wrong; use this for choosing among many pieces of copy.

## Honest limits — read before quoting a score

- **Jev is explicitly not calibrated.** Upstream says the distributions "are
  not calibrated probabilities of correctness" and "a valid response structure
  does not guarantee a correct decision." A score ranks candidates against each
  other. It is not a probability of anything.
- **A win here does not predict citation.** Nothing in this loop measures AI
  visibility. Only `probe.py` does. Ship the winner, then measure.
- **The rubrics are tuned for prose passages, not short-form copy.** Measured:
  taglines score 0.84–1.65 / 3.00 because a 120-character line cannot be
  "self-contained" or "evidence-dense." For taglines, compare variants against
  each other and ignore the absolute number; do not conclude the copy is bad.
- **It is a free demo endpoint.** It can change or vanish. The self-test is the
  canary. To de-risk permanently, `hf-server/` in the upstream repo runs the
  same API locally.

## Where the three sources actually landed

| Source | Verdict |
|---|---|
| `featherless-ai/simple-jev` | **Adopted.** Demo API works with no key; the technique is what `jev.py` wraps. |
| `browser-use/jev-ultrafast` | **Not adopted — needs a key we do not have.** A browser agent using TypeSafe's hosted Jev (`TYPESAFE_API_KEY`) for decisions plus an OpenRouter model for text. Genuinely fast (Zürich→London flight search in 7.1s). Revisit if a TypeSafe key is ever bought; the useful idea is its indexed action space, not its SEO relevance. |
| `connector.get-ryze.ai/mcp` | **Blocked.** OAuth `authorization_code` + `refresh_token` only — **no device-code grant**, so it cannot be authorised headlessly. Same wall as Searchata (see `connector-onboarding`). Needs the user to connect it in claude.ai connector settings or an interactive session. |

**"Jev on OpenRouter" does not exist.** Checked the full catalogue: 446 models,
zero matching `jev`, zero matching `featherless`. In `jev-ultrafast` the
OpenRouter key fills the `TEXT_MODEL_API_KEY` slot — the *small text writer* —
while Jev itself is a separate TypeSafe API. Our OpenRouter key is a generator
here, never the judge.

## When this hands off

| Situation | Go to |
|---|---|
| Did anything actually get cited? | `aeo-measurement` (`probe.py`) |
| A strategic decision, not copy selection | `model-gauntlet` |
| Authoring the page around the copy | `aeo-ai-discoverability` |
| Is the live site even crawlable | `seo-smokegame-ship` |
| Outreach targets for the copy | `backlink-building` |
| Connecting Ryze once OAuth is sorted | `connector-onboarding` |
