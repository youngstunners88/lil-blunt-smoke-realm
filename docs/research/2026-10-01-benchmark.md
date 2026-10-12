# Benchmark research — 2026-10-01

Fetch: Firecrawl **unavailable (HTTP 401 (key rejected))**; pages fetched via ['plain-http'].

Benchmarks show what a WINNING page looks like, not what caused the win. Copy structure, never claims.

## Deterministic facts

| page | words | h2 | meta desc | schema types | FAQ | rating markup |
|---|---:|---:|---:|---|:-:|:-:|
| www.crazygames.com/game/gunblood | 225 | 0 | 146 | AggregateRating, Brand, BreadcrumbList, ContactPoint, EntryPoint | no | **yes** |
| poki.com/en/g/gunblood | 1095 | 6 | 183 | Answer, BreadcrumbList, CollectionPage, DefinedTerm, FAQPage | yes | no |
| itch.io/games/html5/tag-wild-west | 1144 | 2 | 201 | — | yes | no |
| **ours (about + how-to-play + controls)** | 1630 | 14 | 232 | Answer, FAQPage, Question | yes | no |

> **Do not copy rating markup.** Benchmarks carry aggregateRating; we have no real ratings, and fabricating them is a blocking accuracy violation and a manual-action risk.

## Jev scores (mean across passages, 0–3)

| rubric | ours | best benchmark | gap |
|---|---:|---:|---:|
| geo.category_anchored | 1.19 | 1.81 | +0.63 |
| geo.entity_clarity | 2.25 | 2.79 | +0.54 |
| aeo.evidence_density | 1.33 | 1.68 | +0.35 |
| geo.disambiguates_artist | 2.43 | 2.75 | +0.31 |
| geo.list_ready | 0.99 | 1.08 | +0.09 |
| aeo.self_contained | 2.33 | 2.20 | -0.13 |
| aeo.quotable | 2.41 | 1.77 | -0.64 |
| aeo.answers_question | 2.13 | 1.23 | -0.91 |

Weakest vs benchmark: **geo.category_anchored, geo.entity_clarity, aeo.evidence_density**.

## Fact-check of our CURRENT canonical entry

Every proper noun is found in the GM-GAME source.

### Strongest passage — www.crazygames.com/game/gunblood

> This town isn’t big enough for the two of us, so draw! If you have ever wanted to be a part of a western duel, then look no further than Gunblood! Choose from one of ten wild west characters and attempt to outshoot your opponents! Nine rounds of intense, reaction based duels await you in this visceral game! After every successful duel, you are met with another, more challenging opponent and your odds of survival greatly decrease! Can you win every duel and prove that you are the best shot in town?

### Strongest passage — poki.com/en/g/gunblood

> Many shooter games on Poki can be played with friends as split-screen 2 player games . For harder matches, you can play online matches where players fight each other.

