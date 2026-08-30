# Lessons

Findings that cost something to learn and would otherwise be re-learned. Each
entry is a claim, how it was established, and what it changes. Append; do not
tidy. A lesson that stops being true gets a **SUPERSEDED** line, not a deletion
— knowing a belief was held and dropped is worth more than a clean file.

Read this before planning SEO/AEO work. `log_lesson.py` appends entries.

---

## 2026-08-29 — The keyword niche has no search volume

**Claim.** Category search terms for this game are not a traffic source. Not
"hard to rank for" — there is close to nothing there to win.

**Evidence.** Ahrefs via Monid, US, `marketing/aeo/market/keywords.json`:

| term | volume/mo | KD |
|---|---|---|
| wild west browser game | 0 | — |
| western platformer | 0 | — |
| godot browser game | 0 | — |
| 2d platformer online free | 0 | — |
| gold rush game online | 70 | 15 |
| cowboy game online free | 10 | 5 |
| free games no download browser | no data | — |
| outlaw game browser | no data | — |

Control: "free online games" returns 176,000/mo at KD 93, so the endpoint
works and the zeros are real readings, not failures.

**What it changes.** Ranking #1 for the best term found is roughly 20 visits a
month. Category SEO cannot be the growth mechanism here, so the effort belongs
in the three channels that do not depend on category search volume:

1. **Brand search** — zero volume today by definition; it only exists after
   people meet the name elsewhere. It converts best and is uncontested apart
   from the musician collision.
2. **Recommendation surfaces (AEO)** — being named when someone asks an
   assistant for a free browser game. No search volume required; the
   requirement is being in the consideration set.
3. **Distribution** — itch.io, portals, communities. Traffic that never touches
   a search box.

**Do not** respond to a zero-volume term by writing more content for it.

---

## 2026-08-29 — Ahrefs endpoints bill per row and default to 100

**Claim.** A default `monid run` against an Ahrefs site-explorer endpoint can
spend most of a $10 balance in one call.

**Evidence.** `monid inspect` on `/site-explorer/organic-keywords`: price is
`PER_RESULT` at $0.072/row, `limit` defaults to 100. That is $7.20 for one
unattended call. `/keywords-explorer/overview` is $0.126/row.

**What it changes.** Never call these directly; use `marketing/aeo/market.py`,
which prints worst-case cost and refuses to exceed `--max-spend`. Empty results
are free, which makes "does this term have any volume" a cheap question when
the answer is no.

---

## 2026-08-29 — Requesting JSON-only output silently disables web grounding

**Claim.** Telling a model to answer with nothing but JSON makes it skip its web
search and answer from pre-training, while still returning a well-formed result.

**Evidence.** Probes with a JSON-only instruction returned zero annotations
across every question. The same prompts asking for a normal answer followed by
a fenced JSON block returned citations.

**What it changes.** Every probe measures the live index only if grounding
actually ran. If citation counts read zero across a whole run, suspect this
before concluding anything about visibility.

---

## 2026-08-29 — A single homepage fetch is not a stable reference

**Claim.** On this ICP host the same URL returns very different response sizes
between requests, so diffing other paths against one homepage fetch gives false
results.

**Evidence.** `/` measured 128857 bytes on one fetch and 6292 on the next
minutes later. The first version of `crawl_gate.py` compared against `/` and
cleared `/troubleshooting/` as a real page when it was an SPA fallback.

**What it changes.** Phantom-page detection uses a sentinel path that cannot
exist, and treats whatever comes back as the not-found signature.

---

## 2026-08-29 — Kimi K3 starves on long tasks before answering

**Claim.** With a project brief attached and a multi-part question, Kimi spends
its whole token budget reasoning and returns empty content, which reads as a
failed call rather than a truncated one.

**Evidence.** At 6000 tokens in a gauntlet draft stage it returned no content;
the run silently proceeded with two models instead of three.

**What it changes.** `MIN_TOKENS_BRIEF` is 16000 in `gauntlet.py`. Reasoning
length scales with how many sub-questions a prompt contains, so budget by task
shape rather than by a fixed number.

---

## 2026-08-30 — Reddit is a player channel, not a citation channel

**Claim.** Reddit and review sites no longer function as AI citation sources, having gone from roughly 15% and 7% of ChatGPT citations to zero, while help-centre and documentation content rose to 32%.

**Evidence.** Promptwatch measurement, reported by its co-founder and repeated in the Aug 2026 Ahrefs podcast with Dan Petrovic; Reddit is rejected from grounding over 90% of the time even when retrieved.

**What it changes.** Keep posting to Reddit to reach players, but stop counting it toward AI visibility. Own-site documentation is the format that gets cited, which is why the troubleshooting page exists.

---

## 2026-08-30 — Recorded gameplay does not match the site's Wild West copy

**Claim.** Gameplay footage of build 2026-08-26d shows a pink mushroom fantasy forest, not the 1800s Wild West mining town the site describes, and the HUD displays token counters (GOLD, DIAMONDS, TITANX, wBTC, XAUT, BLAZE DIAMONDS) plus a VESTING percentage.

**Evidence.** Frames extracted at t=30s and t=46s from /tmp/xvfb-demo2.mp4, the Xvfb capture of the itch build. Both show the same mushroom-forest area with that HUD. Unverified whether other levels are Wild West themed.

**What it changes.** Do not target wild-west, cowboy or western keywords until the theme is confirmed against the current build — traffic arriving on that promise would bounce. Also reconcile the on-screen token and VESTING counters against the site's 'playing does not award tokens' claim before writing any store copy.
