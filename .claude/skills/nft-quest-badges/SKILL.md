---
name: nft-quest-badges
description: The Prospector Trail — free, earned, on-chain achievement badge NFTs that teach players about the SMOKE, DIAMONDS, and GoldMine protocols through in-game quests. Use when designing, building, minting, or generating art for the game's achievement/quest/badge NFT system, deciding which achievement earns which NFT, or wiring quest content to the three protocols.
---

# The Prospector Trail — Quest & Achievement Badge NFTs

The strategic core of the game's NFT layer. Read this before touching quest
content, badge art, mint wiring, or any public copy about the badges.

## Why this exists (the client's actual goal, in his words)

From the founder (Telegram, captured verbatim so future sessions don't rely on
chat that isn't in a repo):

- *"The game is actually a marketing tool for SMOKE, Diamonds, and Gold Mine
  projects. The intent was to bring recognition to all 3 projects... in the
  form of a quest to learn different aspects of the projects."*
- *"Bring a new audience to SMOKE community that wouldn't otherwise know about
  SMOKE... the network effect could be huge."*
- *"I want to remain on chain exclusively. I really don't want to get into the
  real world aspect of things. Keep it crypto related and focused on building a
  real meme brand to compete with the majors."*

**The prize being optimised: new wallets that now know the three protocols
exist.** Every badge minted is one person who engaged with SMOKE / DIAMONDS /
GoldMine content on purpose. The badge is the *receipt* for that engagement —
the quest's Learn beat is the actual product. A top-score cash prize was
considered and deferred (see `blind-spots` + the "What this is NOT" section):
it rewards platformer skill, teaches nobody about the protocols, and drags in
US skill-contest / sweepstakes law the client explicitly wants to avoid.

## The badge set — 3 protocol badges + 1 capstone

Free to earn, gas-only to mint, on Base (extends the existing `SmokeRing
Survivor` ERC-721 pattern already coded in GM-GAME; see **Wiring**). Each is a
1:1 square medallion NFT, art locked to that realm's palette
(`design/art_direction_reference.md` in GM-GAME).

| # | Badge | Protocol | Realm | Tier | Earned by |
|---|-------|----------|-------|------|-----------|
| 1 | **GM Pioneer** | SMOKE / SmokeRing | The Smoke Realm (L1, live) | Common | Complete the SMOKE Prospector Trail |
| 2 | **Diamond Hands** | DIAMONDS | Crystal Caverns (L2) | Common | Complete the DIAMONDS Prospector Trail |
| 3 | **Fort Knox Claim** | GoldMine | Gold Rush (L3) | Common | Complete the GOLD Prospector Trail |
| 4 | **Realm Sovereign** | all three | — | Rare (capstone) | Hold all three above |

Names are meme-forward and on-lore ("GM" is the crypto greeting *and* GM Forest;
"Diamond Hands" is literally one of Lil Blunt's voice lines; "Fort Knox" is the
castle in the Gold Rush key art). The capstone gives the rarity gradient the
client asked about ("qualifying various NFT to various achievements").

**Levels 2 and 3 do not exist yet** — only the Smoke Realm (L1) is built. The
quest design below is therefore *not* gated purely on beating a level; the
Learn + Prove beats make all three badges launchable today, and the Play beat
upgrades from an interim in-L1 objective to the real level when it ships.

## The quest structure — Play → Learn → Prove

Every protocol quest is the same three beats. The **Learn** beat is where the
client's goal is served; the other two wrap it so it feels like a game, not a
lecture.

1. **Play** — a themed in-game objective. Uses what exists now; upgrades later.
   - SMOKE: clear the Smoke Realm level (live today).
   - DIAMONDS: collect the 3 Diamond Shards hidden in L1 today → reach the
     Crystal Caverns portal once L2 ships.
   - GOLD: collect the gold-nugget cache in L1 today → clear the Gold Rush once
     L3 ships.
2. **Learn** — a single card surfaces one *true, non-confidential* fact about
   the protocol and links to its official site. This is the payload. Keep it to
   one fact and one link; a wall of text kills the funnel.
   - SMOKE → `https://lilblunt.win/`
   - DIAMONDS → `https://diamonds1111.win/`
   - GoldMine → `https://mine4gold.app/`
3. **Prove** — a lightweight check that the player engaged, which gates the
   mint. Cheapest honest option: connect wallet (identity) + a one-tap
   acknowledgement from the Learn card. Do **not** build a quiz that can be
   brute-forced or that gates on holding tokens (that excludes the *new*
   audience this is meant to attract — the whole point is people who don't hold
   yet).

On completing all three beats, the badge `mint()` becomes available on the
victory/quest-complete screen. Skippable — the achievement counts without it;
the mint is the opt-in on-chain proof.

## What this is NOT (guardrails — some are blocking)

- **These are not the client's payout NFTs.** He has separate, *paid* NFT
  projects already planned (the 420 NFT requiring SMOKE + Fort Knox stake, the
  Diamonds NFTs, the wrapped Blaze NFTs — see `design/client_protocol_updates.md`
  in GM-GAME, parts of which are 🔒 CONFIDENTIAL). The Prospector Trail badges
  are free achievement proofs and must never be described in a way that implies
  a payout, yield, or that they are one of those products. Keep the two worlds
  visibly separate in every piece of copy.
- **No play-to-earn language.** Badges are cosmetic proof-of-engagement /
  achievements, not financial instruments. "Earn a badge" = earn an
  achievement, never "earn money/tokens."
- **Never leak confidential tokenomics.** `design/client_protocol_updates.md`
  has 🔒 CONFIDENTIAL entries (e.g. the GoldMine genesis buy-and-burn). None of
  it goes into player-facing text, the Learn cards, this repo's `docs/`, or
  marketing. Learn-card facts must be things already public on the protocol
  sites.
- **The website currently claims the opposite — fix both together.** `AGENTS.md`
  carries a *blocking* accuracy note: the site says **no NFT minting** and
  **Internet Identity only, no MetaMask**, and `OnChainPoints.tsx` renders "No
  token rewards and no NFT minting." The moment badges ship, that copy becomes
  false. Any PR that ships the badge mint MUST, in the same change, update
  `AGENTS.md`'s "Public Claims Accuracy" section and the OnChainPoints copy.
  Shipping one without the other re-triggers the exact bug `AGENTS.md` warns
  about (AEO pages once claimed on-chain scoring that didn't exist).
- **On-chain exclusively, no real-world.** Per the client: no shipping, no
  fiat, no real-world redemption. The badge lives and dies on Base.

## Art direction (locked to the realms)

Every badge is a **1:1 square medallion / coin NFT card**, chunky bevel/outline
pixel-art style matching the game's HUD (`art_direction_reference.md`). Lil
Blunt is a round green weed-nugget with a spiky leaf fringe, huge googly eyes
with cream/red-dotted rims, a lit blunt with curly purple-white smoke, wearing
the realm's costume. Per-realm palette and costume:

- **GM Pioneer (SMOKE):** GM Forest cowboy kit — brown cowboy hat with green
  leaf badge, red bandana, tan fringe vest with gold star studs. Deep purple
  night sky, neon greens, glowing mushrooms, curling purple smoke, an
  ETH-crystal-inside-a-glowing-green-ring motif on the coin rim.
- **Diamond Hands (DIAMONDS):** miner helmet with lamp, brown workwear,
  translucent blue crystal-armor accents. Near-black blue cavern, faceted
  cyan/blue/purple crystals, a large central faceted diamond, ethereal blue
  rim-light.
- **Fort Knox Claim (GOLD):** wild-west cowboy kit doubled down, gold star
  studs. Orange-sepia sunset canyon, Fort Knox castle silhouette on the hill,
  gold nuggets, a big gold coin/nugget centre, warm gold rim-light.
- **Realm Sovereign (capstone):** Lil Blunt fused with all three — green body,
  blue crystal shoulder accents, gold aura, the three protocol sigils
  (leaf-in-ring / faceted diamond / gold bar) orbiting; premium "rare" frame,
  richer rim-light, subtle animated-looking glow.

Full copy-paste prompts live in `prompts/tripo-badges.md`.

## Generating the art (Tripo)

The Tripo CLI (`ravanova/tripo-cli`, two shell scripts) drives the generative
API. **Blocker as of this writing: the Tripo account balance is 0 credits** —
the key authenticates (`{"code":0,...}`) but there is nothing to spend and the
scripts refuse to run at zero. Top up at tripo3d.ai, then:

```sh
# The saved key is in $TRIPO_API; the CLI wants $TRIPO_API_KEY — map it:
export TRIPO_API_KEY="$TRIPO_API"

# Confirm there are credits before spending:
curl -s -H "Authorization: Bearer $TRIPO_API_KEY" \
  https://api.tripo3d.ai/v2/openapi/user/balance   # want data.balance > 0

# 2D badge card (right format for an NFT medallion), ~5–10 credits each:
cd /tmp/tripo-cli
TRIPO_MODEL=gpt_image_2 ./tripo-image.sh "<prompt from prompts/tripo-badges.md>" \
  out/gm-pioneer.png
```

Generate **one** badge first (GM Pioneer — its realm is the only live level),
review it against the art direction, and only then spend on the other three.
One good generation beats four rushed ones; this project's recurring lesson is
verify-before-spend.

## Wiring (implementation lives in GM-GAME, not this repo)

The mint path already exists and is inert, wired to a single badge. Extend it:

- `config.json` → `contracts.survivor_badge_erc721` is one slot; the four
  badges need four addresses (or one ERC-1155 with four token IDs — cheaper to
  deploy and audit, recommended). Nothing mints until addresses are filled.
- `src/autoload/web3_bridge.gd::mint_survivor_badge()` and
  `web/web3.js::mintBadge()` are the seam; generalise to take a badge id.
- **Every contract that lands in `config.json` needs the `DEFI_REVIEW.md`
  human sign-off first** — that gate cannot be automated away, and an ERC-1155
  with a public `mint()` is exactly what it exists to check.

## Sequencing (do not boil the ocean)

1. ✅ Lock this design (this file).
2. ⏳ **Top up Tripo credits**, then generate GM Pioneer art, review, iterate.
3. Generate the remaining three once GM Pioneer is approved.
4. Write the three Learn-card facts (public info only) + the quest UI copy.
5. Decide ERC-1155-vs-4×ERC-721 with the client; run `DEFI_REVIEW.md`.
6. Build the mint wiring in GM-GAME; ship it **with** the `AGENTS.md` +
   OnChainPoints copy fix in the same PR.

Steps 4–6 are real engineering + a legal/contract gate; do not start them as a
side effect of generating art. Get the client's yes on the badge set first.
