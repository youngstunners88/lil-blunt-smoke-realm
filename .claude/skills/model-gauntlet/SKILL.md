---
name: model-gauntlet
description: Harden a plan or strategy by running it through an adversarial multi-model loop — draft, cross-examine, revise, synthesize — using Kimi K3, Grok 4.6 and Gemini on OpenRouter. Use when a decision is expensive to get wrong, when a plan needs stress-testing before execution, or when asked to have models debate, attack, or pressure-test an idea.
---

# Model Gauntlet

`marketing/gauntlet.py` is `council.py` with the missing step added. The
council asks several models the same question in parallel — good for variety,
but every model's blind spots survive into its own answer untouched. The
gauntlet makes each draft get attacked by the models that did not write it.

```bash
python3 marketing/gauntlet.py --brief "Design the mechanism for X"
python3 marketing/gauntlet.py --file task.md --brief --judge grok \
    --out marketing/out/plan.md
```

## The four stages

1. **DRAFT** — each model answers independently, told that its work will be
   attacked. That framing alone reduces padding.
2. **ATTACK** — each model receives the others' drafts labelled `PROPOSAL A/B/C`
   with authorship hidden, and must find the flaw that would make each one
   fail. Anonymity matters: a model told "this is Gemini's plan" argues with
   the reputation instead of the text.
3. **REVISE** — each author sees the critiques of its own draft and either
   fixes the step or defends it in one line. It is explicitly told not to
   concede merely because it was challenged.
4. **SYNTHESIZE** — the judge merges what survived, ordered by leverage, and
   must emit a **DISCARDED** section listing rejected ideas with reasons.

That last section is the most reusable output. It stops the same bad idea being
re-proposed three weeks later, which is otherwise guaranteed.

## When to use this instead of the council

| Situation | Tool |
|---|---|
| Want five hook variants | `council.py` |
| Quick second opinion | `council.py` |
| About to spend money or weeks on a plan | `gauntlet.py` |
| A plan whose failure mode is expensive | `gauntlet.py` |
| Need the reasons ideas were rejected, recorded | `gauntlet.py` |

The gauntlet costs roughly 6–10x a council run (four stages, long contexts) and
takes 10–20 minutes wall-clock. Do not reach for it to pick a headline.

## Roster

| Alias | Model |
|---|---|
| `kimi` | `moonshotai/kimi-k3` |
| `grok` | `x-ai/grok-4.6` |
| `gemini` | `google/gemini-3.7-flash` |
| `qwen` | `qwen/qwen3.8-max` |

Default is `kimi,grok,gemini`. Three is the useful minimum — with two, the
attack round becomes a duel and neither model has a tiebreaker.

## Operational notes

- **Always pass `--brief`.** Same reason as the council: without the project
  context pack these models do not know the accuracy rules and will propose
  play-to-earn copy and $500/month budgets. The token floor rises to 6000
  automatically under `--brief` because reasoning runs much longer with a
  context pack attached.
- **Run it in the background** and do other work. A three-model single-round
  gauntlet is 12 model calls at up to 6000 tokens each.
- **`--rounds 2`** re-attacks the revisions. Worth it only for genuinely
  consequential decisions; the second round usually produces refinement rather
  than new objections.
- **The transcript is the artifact**, not just the synthesis. `--out` writes
  every stage. When the synthesis says something surprising, the attack round
  shows whether it was argued for or merely asserted.

## Reading the output honestly

The gauntlet produces *consensus under adversarial pressure*, which is stronger
than plain agreement but is still not evidence. These models share training
data and can be confidently wrong together — and their attacks are as
susceptible to that as their drafts. Anything checkable still gets checked
against a primary source, and the synthesis is instructed to flag claims that
need verification. Treat those flags as work items, not as decoration.

The project's blocking accuracy rules in `AGENTS.md` outrank anything the
gauntlet concludes.
