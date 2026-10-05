---
name: learning-loop
description: How this project gets smarter over time — the lessons ledger, when to write to it, and how findings become skills instead of being rediscovered. Use at the start of substantial SEO/AEO/marketing work, after any experiment or measurement that produced a surprise, and whenever a belief the project acted on turns out to be wrong.
---

# The Learning Loop

The point is not to accumulate notes. It is that a session six weeks from now
does not re-run an experiment that already has an answer, and does not act on a
belief that has already been falsified.

Two artifacts and one rule.

## `marketing/aeo/LESSONS.md` — the ledger

Findings that cost something to learn. **Read it before planning SEO/AEO work.**
It is short by design; if it stops being readable in one sitting, it has been
padded with things that do not change decisions.

```bash
python3 marketing/aeo/log_lesson.py \
    --title "Short heading" \
    --claim "What is now believed, stated so it could be wrong" \
    --evidence "How it was established, specific enough to re-check" \
    --changes "What to do differently"
```

Every entry carries all three parts, and the script **rejects an entry whose
`--changes` is empty or trivial**. That is the whole discipline: a finding that
changes no decision is trivia, and trivia crowds out what matters.

**Superseding, not deleting.** When a lesson stops being true, use
`--supersede "<substring of the old heading>"`. The old entry stays, marked. A
record of what the project believed and dropped is worth more than a clean file
— it stops the abandoned idea being rediscovered as if new.

## What earns an entry

- **A measurement that contradicted an assumption.** The strongest kind. The
  keyword-volume finding reframed the whole SEO plan.
- **A trap that produced confident-looking wrong data.** JSON-only output
  silently disabling web grounding; an unstable homepage making a phantom page
  look real. These recur and cost hours each time.
- **A cost or limit discovered the expensive way.** Ahrefs billing per row with
  a default of 100.
- **A tool behaviour that reads as a bug but is not.** Kimi returning empty
  content when it starves mid-reasoning.

## What does not

- Anything already in a skill. Put it in the skill.
- A restatement of the plan.
- A result that confirmed what was already believed and changed nothing.
- Anything unverified. A lesson is a claim the project will act on; sourcing it
  to "a model said so" is how a hallucination becomes policy.

## The rule: a lesson that recurs becomes a skill

The ledger is for findings. When a finding turns into *a way of working* — when
it would change how a future task is approached, not just what is known — it
graduates into a skill and the ledger entry stays as the evidence trail.

Concretely: three related lessons about the same area mean the area needs a
skill, or an existing skill needs a section. `search-intelligence` exists
because the billing trap, the zero-volume finding and the
which-analyses-work-at-zero-traffic question were all the same subject.

## Where the outside models fit

`model-council` (width) and `model-gauntlet` (depth) both run **Kimi K3,
Grok 4.6, Gemini 3.7 and Qwen 3.8 Max** — all four verified answering as of
2026-08-29. They widen the option set and stress-test a plan.

They do not produce lessons on their own. **A model's opinion is not evidence**
— these four share training data and are confidently wrong together routinely.
A gauntlet output earns a ledger entry only once something in it has been
checked against a primary source or a measurement. The gauntlet's own synthesis
is instructed to flag claims needing verification; those flags are work items.

The genuine exception is when a model catches something checkable that nobody
had considered — Kimi flagging TikTok's cannabis-content restriction, or that
shipping bot-played footage is a sunk-cost trap. Verify, then log.

## Reading the ledger honestly

The entries are dated and several are about a fast-moving surface. AI citation
mixes, model behaviour and API pricing all change. **An old lesson is a
hypothesis, not a fact** — when one is load-bearing for a decision and more than
a couple of months old, re-check it rather than inheriting it. Re-checking is
usually cheap; the keyword volumes cost under a dollar.
