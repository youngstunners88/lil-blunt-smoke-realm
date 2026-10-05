---
name: prompt-interpreter
description: Diagnose and rewrite a rough request into one that produces high-quality work — scoring deliverable, success test, constraints, load-bearing assumptions, focus, format and scope bounds, then repairing the weakest. Use when the user asks to improve or optimize a prompt, says they are not a prompt engineer, asks whether a prompt was any good, hands over a vague request and wants it sharpened, or when a request is about to trigger substantial work and is ambiguous enough that different readings give materially different results.
---

# Prompt interpreter — translate a rough ask into a precise one

```bash
python3 marketing/aeo/promptfix.py --prompt "make the site better for SEO"
python3 marketing/aeo/promptfix.py --file draft-prompt.txt
```

## What actually improves output, and what does not

**Does nothing measurable:** politeness, "you are a world-class expert",
EMPHATIC CAPITALS, threats, offers of payment, "think step by step" bolted onto
a request that was already clear. These are folklore. A model that would have
got it wrong still gets it wrong.

**Does work:** removing the need to guess. Every ambiguity is a fork where the
model picks one branch silently and you find out later.

Eight rubrics, each tied to a concrete failure:

| Rubric | The failure |
|---|---|
| `deliverable` | "help me with X" — the model guesses the artifact |
| `success_test` | no way to tell a correct answer from a plausible one |
| `context_supplied` | the model cannot see what you can see |
| `constraints` | what must NOT happen — the expensive omission |
| `assumptions` | a premise smuggled in as a given, so nobody checks it |
| `single_task` | several unrelated asks, so each gets shallow work |
| `format` | shape of the answer left to chance |
| `scope_bounds` | no upper bound, so the model over- or under-builds |

## The one that matters most: assumptions

**A prompt that asserts its own solution gets solution-shaped work back, and
the solution never gets checked.**

```
weak    "Use our other sites to build backlinks — publish the work on them."
strong  "I want backlinks to smokegame.win. I own two related sites and think
         linking them would help. Check whether that's sound before doing it —
         if it's a bad idea, say so and tell me what would work instead."
```

Same goal. The first commissions the work; the second commissions the
*judgement*. When the method is wrong, only the second saves you — and in this
project's own history, that difference has been the difference between weeks of
work that shipped and weeks that were built on something unverified.

`blind-spots` names building on unverified premises as this project's recurring
failure. This rubric is that failure detected at the prompt stage.

## The repair pattern

Rewrite in this order. Stop when the next item adds nothing:

1. **Goal, separated from method.** "I want OUTCOME. I think METHOD might work
   — verify before building."
2. **The deliverable, named.** A file at a path, a committed change, a decision,
   a number.
3. **The success test.** A command to run, a measurement, a threshold. "Verified
   by X showing Y."
4. **The do-not list.** Usually the highest-value line in the whole prompt.
5. **Context only you have.** What was tried, what failed, what the environment
   cannot do.
6. **Scope bound.** "Smallest version that proves it" or "production-ready".
7. **Format**, if it matters.

And **split unrelated asks**. Four requests in one message get a quarter of the
attention each. This is the cheapest single improvement available and the one
most often skipped.

## Reading the score

Scores are 0–3. Below **1.8** on a rubric means fix it; the tool prints the
repair, ordered by lift. A prompt averaging under 1.0 will usually produce work
that looks responsive and misses the point.

Measured examples:

```
"make the site better for SEO"                     0.19 / 3.00
a real multi-part request from this project        0.76 / 3.00
```

Even a detailed, context-rich request scores low when it bundles tasks and
asserts its method — length is not the same as precision.

## How to use this on someone else's behalf

When a request scores low, **do not silently pick a branch.** Either:

- **Ask one question** — the single ambiguity where different readings give
  materially different work. Not a list of five.
- **State the assumption and proceed** — "reading this as X; say so if you
  meant Y" — then do the work. Better than stalling when the cost of being
  wrong is low.

Never answer a low-scoring prompt as though it were precise. That is how
confident irrelevant work gets produced.

## Honest limits

- **This scores structure, not correctness.** A 3.00 on every rubric will not
  rescue a request built on a false premise. The `assumptions` rubric flags
  that a premise is load-bearing; deciding whether it is *true* is human work.
- **A low score is not a criticism of the asker.** Rough prompts are the normal
  way people think out loud. The tool exists to translate, not to grade.
- **Do not over-engineer a simple request.** "What time is it in Tokyo" needs no
  deliverable statement. Use this when the work is substantial enough that a
  wrong reading costs real time.

## When this hands off

| Situation | Go to |
|---|---|
| The premise itself needs testing | `blind-spots` |
| A decision expensive to get wrong | `model-gauntlet` |
| Choosing among written variants | `jev-gauntlet` |
| Which skill the request belongs to | `project-playbook` |
