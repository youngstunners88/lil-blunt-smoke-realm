# Benchmark research — 2026-09-30

Fetch: Firecrawl **unavailable (HTTP 401 (key rejected))**; pages fetched via ['plain-http'].

Benchmarks show what a WINNING page looks like, not what caused the win. Copy structure, never claims.

## Deterministic facts

| page | words | h2 | meta desc | schema types | FAQ | rating markup |
|---|---:|---:|---:|---|:-:|:-:|
| www.crazygames.com/game/gunblood | 225 | 0 | 146 | AggregateRating, Brand, BreadcrumbList, ContactPoint, EntryPoint | no | **yes** |
| poki.com/en/g/gunblood | 1091 | 6 | 183 | Answer, BreadcrumbList, CollectionPage, DefinedTerm, FAQPage | yes | no |
| itch.io/games/html5/tag-wild-west | 1168 | 2 | 0 | — | yes | no |
| **ours (about + how-to-play + controls)** | 1626 | 14 | 232 | Answer, FAQPage, Question | yes | no |

> **Do not copy rating markup.** Benchmarks carry aggregateRating; we have no real ratings, and fabricating them is a blocking accuracy violation and a manual-action risk.

## Jev scores (mean across passages, 0–3)

| rubric | ours | best benchmark | gap |
|---|---:|---:|---:|
| geo.category_anchored | 1.19 | 1.84 | +0.65 |
| geo.entity_clarity | 2.27 | 2.83 | +0.55 |
| aeo.evidence_density | 1.31 | 1.68 | +0.36 |
| geo.disambiguates_artist | 2.43 | 2.76 | +0.33 |
| geo.list_ready | 1.03 | 1.08 | +0.06 |
| aeo.self_contained | 2.31 | 2.22 | -0.10 |
| aeo.quotable | 2.40 | 1.81 | -0.59 |
| aeo.answers_question | 2.14 | 1.24 | -0.91 |

Weakest vs benchmark: **geo.category_anchored, geo.entity_clarity, aeo.evidence_density**.

## Fact-check of our CURRENT canonical entry

Names NOT found anywhere in the GM-GAME source: **Tax Man, Wild West Dustrock Mines**

### Strongest passage — www.crazygames.com/game/gunblood

> This town isn’t big enough for the two of us, so draw! If you have ever wanted to be a part of a western duel, then look no further than Gunblood! Choose from one of ten wild west characters and attempt to outshoot your opponents! Nine rounds of intense, reaction based duels await you in this visceral game! After every successful duel, you are met with another, more challenging opponent and your odds of survival greatly decrease! Can you win every duel and prove that you are the best shot in town?

### Strongest passage — poki.com/en/g/gunblood

> Many shooter games on Poki can be played with friends as split-screen 2 player games . For harder matches, you can play online matches where players fight each other.

## Gauntlet proposals (NOT applied)

8 candidates; 0 blocked by the accuracy gate.

**#1 — 2.62/3.00**  ✓ every proper noun found in the game source

> Lil Blunt: The Smoke Realm launches instantly as a free 2D side-scrolling platformer and arcade score-chaser in any web browser on desktop or mobile with no purchase required. The Godot 4 HTML5 Wild West game stars mascot Lil Blunt amid mine carts and Tax Collector enemies. Three stages named Smoke Realm, Crystal Caverns and Gold Rush each conclude with a boss.

**#2 — 2.59/3.00**  ✓ every proper noun found in the game source

> Offering zero in-game purchases, Lil Blunt: The Smoke Realm is a free HTML5 2D side-scrolling platformer and arcade score-chaser built in Godot 4 for mobile and desktop web browsers. Set in a Wild West world, the game follows green protagonist Lil Blunt across three action-packed zones: Smoke Realm, Crystal Caverns, and Gold Rush. Surviving the score run requires dodging Tax Collector enemies, steering mine carts, and conquering three climactic boss battles.

**#3 — 2.58/3.00**  ✓ every proper noun found in the game source

> Lil Blunt: The Smoke Realm is a free 2D side-scrolling platformer and arcade score-chaser built in Godot 4 HTML5 for desktop and mobile web browsers with nothing to buy. Players guide the green mascot Lil Blunt through a Wild West setting across three distinct stages: Smoke Realm, Crystal Caverns, and Gold Rush. The run challenges you to throw axes at Tax Collector enemies, ride mine carts, and defeat three tough stage bosses.

**#4 — 2.56/3.00**  ✓ every proper noun found in the game source

> Lil Blunt: The Smoke Realm is a completely free 2D side-scrolling platformer and arcade score-chaser running directly in HTML5 web browsers on mobile and desktop. Developed in Godot 4, this Wild West video game puts players in control of green mascot Lil Blunt as he battles Tax Collector patrols across Smoke Realm, Crystal Caverns, and Gold Rush. High scores depend on navigating fast mine carts and mastering axe throws against three powerful stage bosses.

**#5 — 2.54/3.00**  ✓ every proper noun found in the game source

> Built in Godot 4, Lil Blunt: The Smoke Realm is a free Wild West 2D side-scrolling platformer and arcade score-chaser playable instantly in desktop and mobile web browsers without any purchases. Players navigate the green character Lil Blunt across Smoke Realm, Crystal Caverns, and Gold Rush. The action hook centers on sprinting, dashing, riding mine carts, and hurling axes to clear out Tax Collector foes before facing each level's final boss.

