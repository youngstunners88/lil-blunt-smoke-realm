# Backlink targets — verified list and readiness gate

Companion to the `backlink-building` skill, which sets the scoring rule this
list obeys: rank by **"would a person on this page click through and play?"**,
not by Domain Authority. Measured category volume is ~0–70 searches/month, so
ranking is not the prize. Referral clicks and answer-engine grounding are.

Reachability verified 2026-09-02.

## Readiness gate — clear these before submitting anywhere

The skill's hard rule: *you get one first impression per publication, and it is
non-renewable.* A reviewer who clicks through today lands on copy that
contradicts itself. Submitting now spends that impression badly.

| Blocker | State | Why it blocks submission |
|---|---|---|
| itch tagline claims "own your progress on-chain" | **Open** | Portals quote the itch tagline. Submitting propagates a claim `AGENTS.md` records as untrue into every listing at once. |
| itch tags empty | **Open** | Portal reviewers and itch's own browse both key off tags. |
| Crawler snapshot carries 0/5 claims | **Open** | A curator checking the hub sees a page that does not describe the game. Snapshot refresh takes up to 15 days after a deploy. |
| Cover image | **Done** | Verified: `og:image` resolves. |
| 5 screenshots | **Done** | Verified present. |
| Hub link from itch | **Done** | Two links to smokegame.win in the page body. |

Nothing below should go out until the first three are closed. That is roughly
one dispatch plus one paste job, not a project.

## Tier 1 — submission is a form, and the audience is exactly ours

These exist to list browser games. No pitch, no relationship, no first-impression
cost beyond the page itself.

| Target | Verified | Notes |
|---|---|---|
| **CrazyGames** — `developer.crazygames.com` | HTTP 200 | Highest value on this list and the only one that also pays. `revenue-paths` has the confirmed terms: no fee, no exclusivity, keeps the itch listing. QA review, then Basic Launch. Retention gates the paid tier, so this rewards the game being good more than any marketing. |
| **GameJolt** — `gamejolt.com` | HTTP 200 | Indie-native, HTML5 friendly, real browse traffic. Free listing. |
| **GameDistribution** — `gamedistribution.com` | HTTP 200 | Syndicates to many portals from one submission. Check the licensing terms before agreeing — syndication is the product. |
| **Poki** — `developers.poki.com` | HTTP 200 | Curated and stricter; expect rejection without polish. Worth one attempt after CrazyGames feedback. |
| **Newgrounds** | 403 to automated request | Bot-blocked, not down — verify by hand. Long-standing browser-game audience. |

## Tier 2 — genuinely on-topic communities

Covered in depth by `game-distribution`; listed here only for ordering. These
are where a real click actually comes from, but they punish anything that reads
as promotion.

- r/WebGames, r/playmygame — post the game, not the chain.
- Godot community channels — the HTML5 export angle is on-topic.
- ICP ecosystem listing — `internetcomputer.org` ecosystem pages resolve; the
  site being *served* from a canister is the genuinely unusual fact and is true.

## Tier 3 — awesome lists

`awesome-godot` (403 to an automated request; verify by hand) and ICP awesome
lists. PRs, long-lived, but only accept things that fit their inclusion rules —
read those before opening a PR.

## The accuracy constraint, restated because it is easy to lose here

`game-distribution` already flags this and it is the single easiest way to
damage the project on these platforms:

**Web3 directories (PlayToEarn, ChainPlay, Web3Games) will happily list this
game — as a play-to-earn game, which it is not.** Submitting it into that
category is a misrepresentation that gets corrected publicly, and the
correction outlives the listing. Proof of Play is still being engineered and
nothing is minted today.

If a Web3 directory is used at all, the accurate framing is: *the entire front
end is hosted on-chain, not merely a token contract.* That is unusual, true,
and needs no reward claim to be interesting.

## What is deliberately not here

- **Cold outreach to gaming blogs.** Last in the skill's order, deliberately,
  and gated on everything above.
- **Paid links and DA-chasing.** Wrong scoring function, and at this budget the
  money buys links on the kind of domain already spamming the profile.
- **Disavowing the eight SEO-spam referrers.** They are nofollow and pass
  nothing; Google ignores the pattern. The disavow tool is easy to misuse.

## Verification rule

Never record a link as earned without fetching the page and confirming the
anchor is present. `python3 marketing/aeo/market.py refdomains` reads the
current profile; note it costs Ahrefs rows via Monid, so run it on a cadence,
not per submission.
