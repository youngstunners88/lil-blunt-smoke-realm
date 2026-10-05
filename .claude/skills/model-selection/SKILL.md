---
name: model-selection
description: Which model to use for the next piece of work on this project, and when an OpenRouter model beats the one running the session. Use when asked which model to pick, whether to use OpenRouter, how to close out a session, or what to run next time.
---

# Choosing the Model for the Next Build

## The split that matters

The session model **does the work**: reads the repo, runs commands, verifies
output, holds the accumulated context. OpenRouter models **advise**: they see
only what is pasted into a prompt, cannot run anything, and cannot check a
claim.

That difference decides almost every case. A task requiring verification —
which is most real work here — belongs to the session model regardless of how
capable an outside model sounds.

## Session model, by task shape

| Task | Model | Why |
|---|---|---|
| Multi-step build touching several files, needing verification | **Opus** | Holds a long chain and notices its own errors. Most work here. |
| Debugging something whose cause is unknown | **Opus** | The value is in the hypotheses tried and discarded. |
| Applying a written plan, mechanical edits, doc updates | **Sonnet** | Plenty for execution once the thinking is done, and faster. |
| Bulk mechanical transforms, formatting, renames | **Haiku** | Cheapest thing that does the job. |

**The tell for Opus:** you cannot list the steps in advance. If the plan is
already written down, a smaller model executes it fine.

Fast mode is Opus with faster output — not a downgrade — so it costs nothing
to leave on for interactive work.

## When OpenRouter earns its cost

Only three cases, all advisory:

1. **Creative width.** One model's five options share its tics.
   `model-council` gives four independent sets. Good raw material for
   `ad-hook-testing`.
2. **Adversarial review before an expensive commitment.** `model-gauntlet`.
   Kimi has twice caught things nothing else did — TikTok's cannabis-content
   restriction, and that shipping bot-played footage is a sunk-cost trap. Both
   correct, neither surfaced otherwise.
3. **A tiebreak** when two approaches look equal and the choice is costly.

**When not to:** anything checkable. These four share training data and are
confidently wrong together. Kimi's backlink plan named five tools we do not
have and an API endpoint that does not exist. That is not unusual, it is the
normal failure mode of a model reasoning without access.

Cost, measured: a council run is $0.01–0.03. A gauntlet is 6–10x that and
10–20 minutes wall-clock. Neither is a budget concern; the constraint is that
their output still needs verifying, and verification is the expensive part.

## The roster

| Alias | Model | Best at |
|---|---|---|
| `kimi` | `moonshotai/kimi-k3` | Sharp adversarial objections. Ask it bluntly what is wrong. |
| `grok` | `x-ai/grok-4.6` | Concrete, structured plans. Good gauntlet judge. |
| `gemini` | `google/gemini-3.7-flash` | Fast, cheap, good at grounded lookups. |
| `qwen` | `qwen/qwen3.8-max` | A fourth independent read. |

All four verified answering 2026-08-30. Kimi needs a high token floor with a
brief attached (16000 in `gauntlet.py`) or it starves mid-reasoning and returns
nothing — which reads as a broken call rather than a truncated one.

## Closing a session

End substantial sessions with a short recommendation covering:

1. **What the next task actually is**, in one line.
2. **Which model**, by the table above, and the reason.
3. **Whether outside models help**, which is usually *no* — the default is that
   the next task needs verification, and verification is not what they do.
4. **What to verify first**, since most sessions here have opened by
   discovering that something believed to be true was not.

Keep it to a few lines. The purpose is to start the next session pointed at the
right thing, not to summarise this one.
