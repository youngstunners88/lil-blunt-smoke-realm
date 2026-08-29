---
name: ad-learning-loop
description: The testing methodology for learning advertising on Lil Blunt as practice for selling paid products later — what to test in what order, how to read a result honestly, and how the free-game funnel maps onto a paid one. Use when running creative tests, reading campaign results, deciding what to test next, or planning how to transfer these skills to a product with a price.
---

# The Ad Learning Loop

The stated goal is not plays. It is **becoming someone who can advertise a
product profitably.** Lil Blunt is the training ground; the skills are the
deliverable. Optimize every decision for what transfers.

## Why a free game is the right place to learn

Counter-intuitively, free is an advantage. Paid advertising is one machine
with four moving parts:

```
impression → click → landing page → action → (purchase)
```

A free product lets you run the first four parts for real, at a cost per
action low enough to actually get data on a tiny budget. When you later
advertise something with a price, you bolt **one** new part onto a machine you
already know how to operate. People who start on a paid product are debugging
all five at once, with each lesson costing a customer acquisition.

So: do not treat this as a rehearsal with fake stakes. Every number here is
real. Only the last box is missing.

## What transfers, ranked

1. **Measurement.** Wired up already (`src/frontend/src/lib/analytics.ts` →
   `marketing/report.py`). Nothing else on this list is learnable without it.
   The instinct to instrument *before* spending is the single most valuable
   habit to build.
2. **Reading a funnel.** Where people drop tells you what to fix, and each
   drop-off has a different owner:
   - Low click-through → the **creative** is wrong (hook, image, promise).
   - Clicks but low scroll → the **landing page** broke the ad's promise.
   - Scroll but no action → the **offer or CTA** is unconvincing.
   Diagnosing which of the three is failing is most of the job, and it is
   identical whether the action is "play" or "buy".
3. **Creative testing discipline.** One variable at a time; two variants
   minimum; never declare a winner the sample cannot support.
4. **Hook writing.** On modern platforms creative beats targeting by a wide
   margin — the algorithm finds the audience if the creative earns attention.
   Time spent on hooks outperforms time spent on audience settings.
5. **Unit economics.** Cost per play now; cost per purchase later. Same
   arithmetic, and the discipline of knowing the number before scaling is what
   separates profitable advertisers from people who "boosted a post".

## The loop

```
hypothesis → one variable → run to sample → read → write the next test
```

**Hypothesis.** Name what you believe and what would disprove it. "Story
hooks beat plain-value hooks for this audience" is testable. "Better creative
performs better" is not.

**One variable.** If variant A and B differ in image *and* headline *and*
audience, a result teaches nothing — you cannot attribute it. Change one thing.

**Run to sample.** Roughly 100 visitors per variant before reading anything.
Below that, the difference is noise; `report.py` will refuse to call it.

**Read.** `python3 marketing/report.py --days 3`. Judge on **play rate**
(action ÷ visitors), not clicks. High clicks with a low play rate means the ad
bought the wrong people — a genuinely bad outcome that looks like a good one
inside the ad platform.

**Write the next test.** The winner becomes the new control. Test the next
variable against it. Compounding beats any single clever ad.

## Test order (highest leverage first)

Do not reorder this. Each step is worth more than everything below it:

1. **Hook / headline** — the biggest swing available.
2. **Visual** — image vs. video, character vs. gameplay.
3. **Format** — static vs. motion, aspect ratio.
4. **Audience** — only after creative is settled; the algorithm mostly handles
   this and it is the most commonly over-tuned knob.
5. **Landing page** — once traffic is good enough that the page is the limit.

## Reading results honestly

The discipline that matters most, and the easiest to abandon when you want a
result:

- **Under ~100 visitors per variant, there is no result.** Two clicks versus
  one is not a 100% lift.
- **Within 30%, call it a tie** and pick on brand judgment. Say "the data
  didn't decide" out loud rather than inventing a story.
- **Never compare across time periods** with different spend, platform, or
  season. Run variants simultaneously or not at all.
- **Vanity metrics** — impressions, reach, likes — do not appear in the
  decision. Only play rate and cost per play.

## When the product has a price

The move that makes all of this pay off:

- The funnel gains one box (`action → purchase`). Everything upstream is the
  machine you already know.
- `trackPlayClick` becomes `trackPurchase`, with a `value` property. Same
  module, same attribution.
- The decision metric becomes **cost per purchase vs. margin**. Below margin,
  scale; above it, fix the funnel — do not spend more.
- Every hook that worked for a free game must be re-tested. Free removes
  purchase friction, so "no wallet, no download" style angles lose their power
  the moment there is a price. Expect the winning angle to change; the
  *method* for finding it does not.

## Budget honesty

Sub-$50 buys a creative signal, not growth (see `paid-campaign-launch` for
platform minimums and what $10 returns). At this level, organic posting is the
higher-yield teacher: post 4–5 hooks organically for free, see which earns
engagement, then put money behind the proven winner. That is the same
hypothesis-test-read loop, run at zero cost — and it is how to get many reps
before spending real budget.
