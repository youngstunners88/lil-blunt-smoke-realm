# Tripo prompts — Prospector Trail badge NFTs

Copy-paste prompts for the four badges. Each is a 1:1 square medallion NFT card.
Generate **GM Pioneer first**, review against `design/art_direction_reference.md`
(GM-GAME), then do the rest.

Setup (once per shell):

```sh
export TRIPO_API_KEY="$TRIPO_API"
curl -s -H "Authorization: Bearer $TRIPO_API_KEY" \
  https://api.tripo3d.ai/v2/openapi/user/balance   # need data.balance > 0
cd /tmp/tripo-cli && mkdir -p out
```

Shared negative prompt (keeps it clean and on-brand):

```
TRIPO_NEG="text, watermark, blurry, photorealistic, human face, gore, realistic drugs, cigarette, low quality, extra limbs, distorted"
```

---

## 1. GM Pioneer (SMOKE) — generate this one first

```sh
TRIPO_MODEL=gpt_image_2 TRIPO_NEG="$TRIPO_NEG" ./tripo-image.sh \
"Square achievement badge medallion NFT, chunky bevel pixel-art game style. A round green weed-nugget mascot character with a spiky serrated leaf fringe silhouette, huge googly eyes with cream and red-dotted rims, wide toothy grin, a small lit blunt at the mouth corner with curling purple-white smoke. He wears a brown cowboy hat with a green leaf badge, a red bandana, and a tan fringe vest with gold star studs. Deep purple night sky background, neon green glow, glowing spotted mushrooms, an Ethereum crystal inside a glowing green ring on the coin rim. Gold beveled circular coin frame, warm gold accents, centered emblem composition, clean, high contrast." \
out/gm-pioneer.png
```

## 2. Diamond Hands (DIAMONDS)

```sh
TRIPO_MODEL=gpt_image_2 TRIPO_NEG="$TRIPO_NEG" ./tripo-image.sh \
"Square achievement badge medallion NFT, chunky bevel pixel-art game style. A round green weed-nugget mascot with a spiky leaf fringe, huge googly eyes with cream and red-dotted rims, toothy grin, small lit blunt with curling purple-white smoke. He wears a miner helmet with a lamp and translucent blue crystal-armor shoulder plates. Near-black deep-blue crystal cavern background dense with faceted cyan and blue crystals, a large glowing faceted diamond as the centerpiece, ethereal blue rim-light. Silver-blue beveled circular coin frame, centered emblem composition, clean, high contrast." \
out/diamond-hands.png
```

## 3. Fort Knox Claim (GOLD)

```sh
TRIPO_MODEL=gpt_image_2 TRIPO_NEG="$TRIPO_NEG" ./tripo-image.sh \
"Square achievement badge medallion NFT, chunky bevel pixel-art game style. A round green weed-nugget mascot with a spiky leaf fringe, huge googly eyes with cream and red-dotted rims, toothy grin, small lit blunt with curling purple-white smoke. He wears a brown cowboy hat, red bandana, and tan fringe vest with gold star studs. Orange-sepia Wild West sunset canyon background, a Fort Knox stone castle silhouette on a hill, scattered gold nuggets, a large gold coin nugget as the centerpiece, warm golden rim-light. Gold beveled circular coin frame, centered emblem composition, clean, high contrast." \
out/fort-knox-claim.png
```

## 4. Realm Sovereign (capstone, rare)

```sh
TRIPO_MODEL=gpt_image_2 TRIPO_NEG="$TRIPO_NEG" ./tripo-image.sh \
"Square premium rare achievement badge medallion NFT, chunky bevel pixel-art game style. A round green weed-nugget mascot hero with a spiky leaf fringe, huge googly eyes with cream and red-dotted rims, confident grin, small lit blunt with curling purple-white smoke. Fused three-realm regalia: green body, translucent blue crystal shoulder accents, a radiant gold aura. Three protocol sigils orbit him — a green leaf inside a ring, a faceted blue diamond, and a gold bar. Dark dramatic background with rich multi-color rim-light (green, blue, gold). Ornate premium gold-and-crystal beveled circular frame, centered heroic composition, clean, high contrast, legendary feel." \
out/realm-sovereign.png
```

---

## After generating

- Review each against `design/art_direction_reference.md` (character anatomy,
  per-realm palette). Regenerate a single badge by re-running its block; each
  run is a fresh spend (~5–10 credits), so change the prompt before re-firing,
  not just re-roll.
- Slim/resize for on-chain metadata as needed (badges want small square PNGs).
- These are the *token images*. The mint contract + metadata JSON are a separate
  step gated on `DEFI_REVIEW.md` (see SKILL.md → Wiring).
