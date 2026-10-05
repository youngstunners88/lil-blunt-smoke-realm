---
name: blind-spots
description: Catch the failure modes this project keeps repeating — building on unverified premises, optimizing a prize nobody measured, mistaking output for progress, and adopting plans that assume tools we do not have. Run before starting substantial work and when a plan feels obviously right. Use when asked what is being missed, what the blind spots are, whether the direction is correct, or for a pre-mortem.
---

# Blind Spots

Not general advice. These are the specific ways *this* project has actually
gone wrong, each one caught at least once, written as a check that would have
caught it earlier.

Run this before substantial work, and especially when a plan feels obviously
right — that feeling is the condition under which the checks below get skipped.

## The five checks

### 1. Is the prize measured, or assumed?

The most expensive error made here. Weeks of SEO strategy targeted category
keywords before anyone checked search volume. When checked, it was **zero** for
most terms and 70/month for the best. Ranking first would have won ~20 visits a
month.

**Ask: what does winning pay, and how do I know?** If the answer is a feeling,
measure it before building. A sub-dollar Ahrefs query would have redirected a
month of work.

Generalised: *optimising something nobody has valued* is the default failure of
competent execution.

### 2. Does the destination exist yet?

Repeatedly, effort has gone into driving attention toward things that were
broken or absent: SEO work while the site returned an infinite redirect loop; a
troubleshooting page committed but never deployed; a plan to pitch 50 blogs
toward an itch page with no cover image.

**Ask: if this succeeds and someone shows up, what do they find?** Fetch it.
Do not assume. `crawl_gate.py` exists because a browser showing a cached page
is not evidence the page is live.

First impressions are non-renewable — you get one per publication, per
reviewer, per player.

### 3. Am I confusing output with progress?

Skills written, scripts built and pages committed all feel like progress and
are trivially countable. None of them is a player, a link, or an index entry.

**Ask: which of this week's artifacts changed a number outside this repo?**
If none, that is not automatically wrong — foundations are real — but it must
be a deliberate choice rather than something noticed a month later.

Watch specifically for the sunk-cost shape: the gameplay recorder was genuinely
impressive and its output still should not be shipped as the hero ad. *Having
built it* is not a reason to use it.

### 4. Does this plan assume tools or data we have?

Adopted plans routinely assume credentials, installed software or API
capabilities that turn out to be absent. Kimi's backlink plan needed five tools
— **zero** were available — and one of its API calls does not exist at all
(Search Console has no backlink API).

**Ask: check the environment and the API docs before adopting the plan.** One
`env | grep` and one docs fetch. A plan built on an absent tool fails at step
one, after the work of building around it.

This applies hardest to plans from outside models, which will confidently
describe endpoints that do not exist.

### 5. What would make this the wrong call?

Before committing, state the condition under which the plan is wrong, and how
you would notice.

If no such condition can be named, the plan is unfalsifiable and cannot be
learned from — it will absorb any result as confirmation. If the condition
exists but has no detector, build the detector first or accept explicitly that
the plan cannot be evaluated.

## Structural blind spots specific to this project

Standing conditions, not one-off mistakes:

- **The repo is not the deployment path.** Committing feels like shipping and
  is not. Every user-facing change needs a Caffeine dispatch, and a dispatch
  referencing a repo file silently does nothing — Caffeine cannot read it.
- **The product is free, so every funnel ends at $0.** Traffic work is real,
  but it converts to nothing today. `revenue-paths` is the reality check;
  re-read it before optimising a funnel.
- **Verification here is unusually cheap and unusually often skipped.** Almost
  every finding in `LESSONS.md` came from a check costing under a dollar or
  under a minute. The pattern is not that verification is hard; it is that it
  does not occur to anyone to do it.
- **A model's confidence is not evidence.** Four frontier models are on tap and
  they are wrong together routinely. `model-gauntlet` hardens a plan; it does
  not validate a fact.

## The pre-mortem, when a decision is expensive

Assume it is three months on and this failed. Write the sentence explaining
why — then check whether that sentence is already true today.

That last clause is the whole technique. "It failed because nobody was
searching for those terms" was true on day one and knowable for $0.76.

For genuinely expensive decisions, run `model-gauntlet` — its ATTACK round is a
mechanised version of this, and its DISCARDED table records what was rejected
so it is not re-proposed.

## How to deliver a blind-spot finding

Lead with the concrete instance, not the category. "Your backlink plan needs
five tools and none are installed" lands; "consider tooling assumptions" does
not.

Then say what it changes. A blind spot with no consequence attached is trivia —
the same bar `log_lesson.py` enforces on the ledger.
