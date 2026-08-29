---
name: game-distribution
description: Draft the off-site copy that gets Lil Blunt discovered — itch.io page content, directory and showcase submissions, Reddit and forum posts, devlog articles, YouTuber outreach, and social posts. Use when asked to promote the game, write marketing or launch copy, build backlinks, or get listed somewhere.
---

# Distribution and Outreach

On-site SEO/AEO makes the site readable. Being *mentioned elsewhere* is what
actually gets a small game surfaced — by search engines, and especially by AI
assistants, which weight corroboration across independent sources.

Ready-to-paste copy lives in `marketing/press-kit.md`. Start there rather than
writing descriptions from scratch, so the facts stay consistent everywhere.

## Priority order

The ordering matters more than the length of the list. Work top-down.

### 1. itch.io page — fix this before anything else

It is the actual play destination. Every other channel drives traffic *to* it,
so a thin page leaks all of that effort.

The single highest-leverage item is a **3–5 second gameplay GIF** — itch.io
autoplays it in the page header, and it moves click-through more than any
amount of description text. After that: 5–6 screenshots, the long description,
and tags (itch.io has its own internal search that runs on tags and body text).

Full checklist in `marketing/press-kit.md`.

### 2. Internet Computer ecosystem

The most targeted audience that exists for this project, and the easiest wins
because the ICP ecosystem actively catalogs its own dApps.

- The Internet Computer dApp directory / project showcase
- DFINITY forum and developer channels
- ICP community platforms (DSCVR, OpenChat, Distrikt)
- r/dfinity

A genuinely on-chain game is *interesting* to this audience — lead with the
technical fact (whole front end served from a canister, Internet Identity
sign-in, scores on chain), not with marketing.

### 3. Indie game communities

- **Reddit**: r/gamedev (Screenshot Saturday / Feedback Friday), r/IndieGaming,
  r/WebGames, r/godot, r/playmygame
- **Discord**: Godot Engine, ICP developer servers, indie dev communities
- **Forums**: TIGSource devlogs, itch.io community

Read each community's self-promotion rules first — most have a designated
thread or day, and posting outside it gets removed and can earn a ban.

**Post here to reach people, not to reach AI.** Promptwatch measured Reddit
falling from roughly 15% of ChatGPT citations to zero, with a rejection rate
above 90% even when a Reddit thread does make it into the grounding pool; G2,
Capterra and Trustpilot collapsed the same way. Advice to "get on Reddit for AI
visibility" is out of date.

Reddit still earns real players, real feedback, and occasionally a real link,
which is why it stays on this list at this position. Just do not count a
front-page thread as progress toward being recommended by an answer engine —
those are now two different jobs. The citation half is covered by
`aeo-ai-discoverability` and lives on our own documentation pages.

### 4. Technical writing

Higher effort, longest-lived payoff. Dev posts get indexed, cited, and
referenced by AI systems far longer than a social post.

Angles that are genuinely interesting because they are specific:

- Exporting a Godot 4.3 game to HTML5 and hosting it on the Internet Computer
- Using Internet Identity for game auth without a wallet extension
- Writing verifiable high scores to a canister
- What actually broke: e.g. ICP asset canisters and HTTP Range requests
  (see the `web-audio-playback` skill — that debugging story is a real post)

Publish to dev.to, Hashnode, or a devlog, then cross-post.

### 5. Awesome lists and directories

Submit PRs to `awesome-godot`, ICP awesome lists, and HTML5/browser game
directories. Long-lived, high-quality backlinks.

Web3 gaming directories (PlayToEarn, ChainPlay, Web3Games) will list it, but be
accurate: this is **not** a play-to-earn game. Submitting it as one is a
misrepresentation that will get corrected publicly.

### 6. Video and short-form

Small YouTubers (under ~10k subscribers) genuinely do play games sent to them;
large ones do not. Send a short, specific email with the press kit and a direct
play link.

For TikTok/Shorts/Reels: the Tax Man is the memeable asset. "You can't tax the
vibe" is a hook that works without explaining Web3 at all.

## Writing rules for outreach

- **Lead with the game, not the chain.** "A free Wild West platformer where you
  dig for gold" gets played. "A Web3 on-chain gaming experience" gets scrolled
  past. The blockchain is the second sentence.
- **Say "no wallet needed" early and explicitly.** It is the objection every
  reader has, and it is a genuine differentiator here.
- **Never mass-post identical text.** Duplicate copy across subreddits reads as
  spam to both moderators and search engines. Rewrite per venue.
- **Follow each venue's rules.** A ban costs more than the post gained.
- **Disclose that you are the developer.** Undisclosed self-promotion, once
  noticed, damages the project's reputation permanently.

## Do not claim

Accuracy is not just ethics here — inflated claims are what gets listings pulled
and reviewers annoyed, and AI systems penalize sources contradicted elsewhere.

- No token rewards, airdrops, earnings, or play-to-earn framing
- No NFT claims unless minting actually ships
- No invented player counts, ratings, reviews, or press coverage
- Keep 21+/entertainment-only framing on cannabis-adjacent copy
- Do not fabricate a roadmap date

## Measuring

Add analytics before a push, or none of this is assessable. Plausible is the
lighter-weight option; GA4 is free and more detailed. Register the site in
Google Search Console and Bing Webmaster Tools and submit
`https://smokegame.win/sitemap.xml`.

Watch: itch.io page views vs. plays (page problem vs. game problem), referral
sources, and which channels convert rather than which merely deliver clicks.
