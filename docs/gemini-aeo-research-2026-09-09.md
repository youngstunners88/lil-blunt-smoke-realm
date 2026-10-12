# Gemini AEO research — 2026-09-09

Four specialist lanes, source-graded A–D per `.claude/skills/gemini-aeo-research/SKILL.md`.
All four complete: mechanism, empirical citation patterns, verifiable levers,
games-niche observation.

**Baseline this was aimed at:** `marketing/aeo/history.jsonl`, 2026-08-29 —
Gemini recommended this game **0 of 14 probes**, zero citations of our URLs.

---

## The finding that reframes everything

**Two lanes, using completely different methods, independently concluded that
earned third-party presence beats on-site optimisation — and for a
zero-authority site, on-site work has no observed path to citation at all.**

- **Lane 4 (direct observation, Tier A).** Across 8 live player queries run
  2026-09-09, **not one individual indie game's own domain was cited** for any
  generic query. Every citation went to an aggregator (itch.io, Poki,
  CrazyGames), a database (IGDB, RAWG), or a listicle. Individual game *titles*
  do get named — **inside** answers, because they are rows on a cited browse
  page.
- **Lane 2 (controlled experiments, Tier B).** University of Toronto,
  1,000 consumer ranking prompts × 10 categories × 2 countries: on AI engines,
  brand-owned pages were **7.9%** of sources vs **92.1% earned**, against
  32.9%/51.7% on the classic Google SERP.

Convergence from observation and from experiment is the strongest signal in
this report. **The mechanism for a small title is being a row on the right
list, not building authority on its own domain.**

---

## Immediate, concrete: the itch.io page is the bottleneck

Verified on the live page 2026-09-09:

| Check | Live state |
|---|---|
| "wild west" / "western" / "cowboy" | **0 mentions** |
| "mushroom" | 1 |
| **"Web3"** | **3** |
| **"NFT"** | **1** |
| Descriptive tags | none — only Free, Platformer, HTML5, Godot |

Two distinct problems on the most-distributed page the project owns:

1. **It still carries the Web3/NFT claim** that `AGENTS.md` marks
   blocking-false. This is an accuracy violation, not just a marketing miss.
2. **It is not tagged as a Wild West game**, so it is structurally absent from
   `itch.io/games/html5/tag-wild-west` — a page that **is cited by AI answers
   today** and lists only **~36 games**. The game qualifies on every axis
   except the tag nobody added.

**`marketing/itch/page-content.md` (T4, written 2026-09-02, never pasted)
already contains the exact fix** — the tag set and a description with the
false claim removed. The research independently converged on it a week later.

---

## Our own measurement is under-powered (Lane 2, Tier B/C)

Two critiques of the 0/14 baseline. One survives, one does not:

- **Does not apply.** The concern that we only probed brand queries is wrong —
  6 of our 7 questions in `questions.json` are informational recommendation
  queries, which is the correct fan-out shape. Only one is branded.
- **Applies, and matters.** Toronto measured Google's **cross-paraphrase domain
  overlap at ≈0.1** — rewording the same question changes ~90% of surfaced
  domains. With 7 intents × 2 runs and **no paraphrase variants**, 14 probes
  cannot distinguish "never cited" from "cited ~10% of the time and we sampled
  the wrong phrasings."

**Change to make:** ≥5 paraphrase variants per intent; log surface
*activation* separately from *citation*; report a rate with an interval, never
a binary. Costs no content work and makes every future result interpretable.

---

## The stop-doing list (Tier A, Google's own words)

Google's AI optimization guide (updated 2026-07-10) states verbatim:

> "You don't need to create new machine readable files, AI text files, markup,
> or Markdown to appear in Google Search." · "There's no requirement to break
> your content into tiny pieces." · "Structured data isn't required for
> generative AI search, and there's no special schema.org markup you need to
> add."

Consequences for this project:

- **`llms.txt` is not a Gemini lever.** Keep it — it is cheap, and Perplexity /
  ChatGPT / Claude are separate undocumented systems — but stop counting it
  toward Google.
- **FAQ blocks are worse than neutral in isolation.** An independent study
  (602 prompts, 21,143 citations) found Q&A packaging alone at **−5.74%**,
  while evidence density scored strongly positive: code +77%, statistics +62%,
  definitions +57%, comparisons +55%.
- **Skip the freshness treadmill.** Ahrefs' own platform-level split shows
  **AI Overviews cite content at 1,432 days vs 1,416 for organic — older than
  organic.** The famous "AI cites 25.7% fresher content" aggregate is driven
  by ChatGPT; the "13-week rule" is unsupported for Google surfaces.

---

## Two vendor consensus claims that fail against independent data

1. **"Reddit dominates AI citations."** Pew (900 US adults, 68,879 queries,
   real browser tracking) measured Wikipedia + YouTube + Reddit at **15% of
   links combined**; the WashU audit measured all UGC at **14.2%** — *under*-
   represented versus the organic results shown beside it. Lane 4 separately
   observed **zero Reddit results across 8 queries**. The 40% figure is a
   ChatGPT/Perplexity finding generalised to Google without warrant.
2. **"Top-10 overlap is X%."** Reported values: 20% (Semrush), 32%
   (seoClarity), 37.9% (Ahrefs 2026), 41.4% (WashU), 54% (BrightEdge), 76%
   (Ahrefs 2025). **The same vendor's figure halved in twelve months.** No
   point estimate is usable; only the *trend* — divergence increasing — is
   defensible, and it mildly favours a site that cannot rank.

**One conflict-of-interest catch worth recording.** The most structure-specific
"academic" paper on AI citation (arXiv 2509.10762, GEO-16) is authored by the
co-founder/CTO and CEO of Wrodium, which sells AI-citation infrastructure and
markets GEO-16 as its proprietary framework. **No commercial-interest
disclosure.** Its headline correlations are 2–3× anything in the independent
literature, and its top-ranked driver is the exact product the company sells.
It is being cited across the SEO press as independent evidence. Tier C.

---

## Expectation reset

Pew, March 2025: clicks on a link *inside* an AI Overview occurred in **~1% of
visits**. A won citation is worth pursuing as **presence and accuracy** — being
described correctly when someone asks about free browser platformers — **not as
a traffic channel.** Do not attach traffic projections to probe results.

---

## Technical eligibility — verified clean

Checked against production 2026-09-09:

| Gate | Result |
|---|---|
| `max-snippet:-1` | ✓ unlimited (permissive) |
| `noindex` / `nosnippet` | ✓ absent |
| `X-Robots-Tag` | ✓ none |
| `Google-Extended: Allow: /` | ✓ — this gates **Gemini grounding** specifically |

Google documents eligibility as binary and minimal: **indexed + snippet-
eligible**. The site passes. The zero is not a self-inflicted blocking problem.

**One founder check outstanding — with two corrections from lane 3.** Google's
Search Console gen-AI control **defaults to "Include"** (I earlier framed this
as something that might be switched off by default; it is not). What is real is
**inheritance**: the switch has an inherit-from-parent mode, and this project
has an apex/www split, so a setting on one property can govern the other. It
also **rolled out 2026-08-31 — two days after our 2026-08-29 probe**, so it
cannot explain the 0/14 baseline at all. Still worth two minutes to confirm
both properties read "Include"; it is not a candidate root cause.

---

## Ranked actions

1. **Paste `marketing/itch/page-content.md` into itch.io.** Fixes a live
   accuracy violation *and* enters a ~36-game pool already being cited. Five
   minutes, no deploy, highest ratio in the study.
2. **Fix the sitemap phantoms** (`/accessibility/`, `/troubleshooting/` serve
   homepage content — see morning report 2026-09-09). Next Caffeine dispatch.
3. **Upgrade the probe**: paraphrase variants, activation logged separately,
   rates not binaries.
4. **Check Search Console → gen-AI setting reads "Include" on *both* the apex
   and www properties** (inheritance, not the default, is the risk). Two
   minutes; rules it out rather than explaining the zero.
5. **Earned listings**: IGDB, free HTML5 directories. No paid links.
6. **YouTube** is the #1 host Google AI Overviews cite — a gameplay video is
   better-evidenced for this surface than a Reddit post.
7. **On-page, if/when we get to it**: evidence density and question-language
   fit — concrete numbers, a clean definition sentence, a comparison table.
   **Not** an FAQ accordion — and note FAQPage rich results no longer exist.
8. **Schema correctness, next `index.html` dispatch**: ship the on-chain-claim
   fix made in this commit, and `applicationCategory` →
   `"GameApplication"`. Do **not** add `aggregateRating`.
9. **Decide what we actually measure.** Either add an AI-Overviews/AI-Mode
   probe, or stop reading the Gemini-app probe as a verdict on on-site work.
   Today it grades a surface with exactly one lever, already pulled.

---

## Lane 3 — verifiable levers (Tier A, Google's own docs and live behaviour)

The lane that checked what Google actually *documents* as a lever, rather than
what practitioners believe. It produced the single most strategically important
finding in the report, plus three concrete corrections to things this project
currently ships.

### The strategic reframe: we are measuring a surface with one lever

**`probe.py` measures the Gemini app.** Google documents exactly **one** lever
that acts on Gemini-app grounding: the `Google-Extended` user-agent token —
**which we already have set correctly** (`Allow: /`, verified above).

**Every other documented lever — structured data types, Search Console's
gen-AI include switch, indexing prerequisites, snippet controls — acts on AI
Overviews and AI Mode**, which are *Search* surfaces. **We do not measure those
at all.**

This is the contradiction between lanes, and it is the useful kind: lanes 1, 2
and 4 all describe retrieve-and-cite behaviour on Search-side AI surfaces,
while our scoreboard is a different product. Two consequences:

1. **The 0/14 is not evidence that our on-site levers failed** — for the
   surface we measured, we only ever had one lever and it was already pulled.
2. **Either add an AI-Overviews/AI-Mode measurement, or stop reading the Gemini
   probe as a scorecard for on-site work.** Of the two, adding measurement is
   the honest fix; the probe stays useful as a presence-and-accuracy check.

This does not change the ranked actions below it — lane 4's finding that the
path runs through aggregators is surface-independent — but it does mean **no
amount of schema work will move `probe.py`**, and we should stop expecting it
to.

### FAQPage rich results were removed on 2026-05-07

Google's FAQ structured-data documentation now **404s**. FAQPage rich results
were fully retired 2026-05-07 (they had been limited to a short list of
health/government sites since August 2023).

**The site ships five FAQPage blocks that are now inert.** They are not
harmful — invalid-but-ignored markup carries no penalty — but they are dead
weight, and lane 2's independent finding that **Q&A packaging alone scored
−5.74%** on citation means the *page format* they encourage is not worth
defending either. Keep the pages (the prose is genuinely useful and passes the
quality gate); stop treating the FAQ schema as an AEO asset.

### Two real schema defects on the homepage

| Defect | Detail | Fix |
|---|---|---|
| `applicationCategory: "Game"` | Not a valid schema.org value | `"GameApplication"` |
| Standalone `VideoGame` | Gets **no rich result** on its own; the software rich result requires `aggregateRating` | **Do not add one.** We have no real ratings — fabricating them is a blocking accuracy violation and a manual-action risk. Accept no rich result. |

Both are cheap to correct in the same dispatch as anything else touching
`index.html`. Neither is expected to move the probe (see the reframe above);
they are correctness, not strategy.

### Accuracy violation lane 3 caught — now fixed

Lane 3 flagged the homepage `VideoGame` JSON-LD description: **"chase a high
score signed on the Internet Computer."** Checked against `AGENTS.md` § Public
Claims Accuracy (blocking) — *"Not true: scores are recorded on-chain today"* —
**this is the exact claim the project has already been bitten by once**, in the
`/how-to-play/` FAQ schema, fixed 2026-09-02. It had survived in the homepage
head the whole time.

**Fixed in this commit.** The description now ends "and chase a high score.
Free to play in the browser, no wallet and no download." Repo-only until the
next Caffeine dispatch — Caffeine holds its own copy of `index.html`, so **this
is live-wrong on production until dispatched.**

Also flagged and **deliberately not changed**: `genre: ["Platformer",
"Arcade", "Web3 Game"]`. "Web3 Game" is not on `AGENTS.md`'s not-true list, and
the site *is* served from an ICP canister with working Internet Identity. But
combined with the itch.io page's live Web3/NFT copy, it is the kind of label
that invites the reader to infer tokens. Raising it rather than deciding it.

### `llms.txt` — reality check confirmed

Google has never documented consuming `llms.txt`, and lane 1's Tier-A quote
("You don't need to create new machine readable files, AI text files…")
settles it. Lane 3 adds no counter-evidence. **Status unchanged: keep it,
cheap, not a Google lever.**

### Lane 3's own honest limits

- Could **not fetch smokegame.win live** (proxy 502 throughout), so every
  claim about site state is read from the repo, not from production. Given
  Caffeine's separate copy, repo state and production state are known to
  diverge — the schema defects above should be re-verified against the live
  page before dispatching.

---

## Honest limits

- No study found samples this project's query class (0–70/mo, gaming,
  navigational). Every quantitative figure here transfers by inference.
- Lane 4's observations came from a grounded AI answer engine that is **not**
  Google AI Overviews — a good proxy for retrieve-and-cite behaviour, but
  source ranking may differ.
- Google has documented **nothing** about what makes a passage quotable. Every
  "answer in 40–60 words" / "optimal chunk length" rule is Tier C/D folklore.
