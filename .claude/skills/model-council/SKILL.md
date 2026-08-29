---
name: model-council
description: Get independent second opinions from Kimi K3, Qwen 3.8 Max and Grok 4.6 in parallel via OpenRouter — for creative variants, stress-testing a plan, or a cross-check before spending money. Use when asked for other models' input, a second opinion, more creative options, or to have several models weigh in.
---

# Model Council

`marketing/council.py` asks several frontier models the same question at once
through OpenRouter and prints the answers side by side. No model sees another's
answer, so agreement is real signal and disagreement is the interesting part.

```bash
python3 marketing/council.py "Critique this hook: 'They tried to tax the vibe'"
python3 marketing/council.py --file brief.md --models kimi,grok
python3 marketing/council.py "..." --system "You are a direct-response copywriter."
```

## The roster

| Alias | Model | Verified |
|---|---|---|
| `kimi` | `moonshotai/kimi-k3` | Aug 2026 |
| `qwen` | `qwen/qwen3.8-max` | Aug 2026 |
| `grok` | `x-ai/grok-4.6` | Aug 2026 |

Costs land around **$0.01–0.03 for all three** on a short prompt. Cheap enough
to use freely; still worth a glance at the total the script prints.

## The gotcha that looks like a broken model

**Kimi and Qwen are reasoning models.** They emit a `reasoning` block before
any `content`. With a small `max_tokens` they spend the entire budget thinking
and return `content: null` — which looks exactly like a failed call. The script
floors the budget at 1500 tokens and, if content still comes back empty, says
so and shows the truncated reasoning rather than printing an empty box.

If a model returns nothing, raise `--max-tokens` before suspecting anything
else.

## What it is actually good for

- **Creative variety.** Three models produce hooks with different instincts;
  one model's five options tend to share its tics. Good raw material for the
  variant testing in `ad-hook-testing`.
- **Adversarial review.** "What is wrong with this plan?" against all three
  surfaces objections a single perspective misses. On its first real run, Kimi
  independently flagged that **TikTok restricts cannabis-referencing content
  even as game theme**, which is a live ad-review risk for this project that
  had not otherwise come up.
- **Cross-checking a factual claim** before it goes in public copy.

## What it is not for

- **Not a substitute for verification.** Three models agreeing is not evidence;
  they share training data and can be confidently wrong together. Anything
  checkable still gets checked against a primary source.
- **Not a decision-maker.** Use it to widen the option set and stress-test,
  then decide. Do not average the answers into mush.
- **Not for anything with the project's blocking rules at stake.** These models
  do not know the `doNotBuild` accuracy constraints, so their copy suggestions
  routinely imply things that are not true here. Every line they produce still
  passes the `AGENTS.md` check before use — the first run already returned
  hooks referencing "reefer riches" and "green gold" that need that filter.
