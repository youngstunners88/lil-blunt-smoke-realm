# Multi-model security council — 6 manual checks

Run 2026-09-02 via OpenRouter. Prompted with the real architecture of both
codebases and asked to judge applicability, name the top vulnerability the 6
checks would miss, and challenge the triage. Qwen 3.8 and DeepSeek V4 returned
empty content (reasoning-field models); Kimi K3, Grok 4.6 and Gemini 3.7
returned substantive reviews.



======================================================================
## qwen/qwen3.8-2.4t-a95b  (20s tok=2215)
======================================================================

None


======================================================================
## deepseek/deepseek-v4-pro-0813  (31s tok=2228)
======================================================================

None


======================================================================
## moonshotai/kimi-k3  (212s tok=7609)
======================================================================

**AUTH003 — Default-deny on new routes**
- A: NEEDS-EVIDENCE. The live canister's method set can't be verified from this repo since Caffeine ships its own copy. Evidence: Candid interface of the deployed canister; confirm every update method is caller-checked or read-only.
- B: NEEDS-EVIDENCE. Route list is known; fallthrough behavior isn't. Evidence: Worker default branch returning 404/405, and rate limiting wrapping the dispatcher (not per-route opt-in) so future routes inherit it.

**API002 — Bearer auth on write routes**
- A: NOT-APPLICABLE. No first-party write API; PostHog's public ingest key is unauthenticated by design (spam-only impact). Evidence: candid above showing no unauthenticated update methods.
- B: APPLIES — failing by design. /score and /track are unauthenticated writes; "accepted risk" doesn't fix leaderboard spoofing. Close with wallet-signed submissions (you already integrate window.ethereum) or written risk-acceptance.

**INFRA003 — Backups**
- A: NOT-APPLICABLE. No DB; ICP provides orthogonal persistence; localStorage is client-owned. Evidence: none.
- B: NEEDS-EVIDENCE. KV is your database; replication ≠ backup against buggy writes or namespace deletion. Evidence: cron Worker exporting KV→R2, or a documented "leaderboard rebuildable, lore in git" decision.

**PLAT001 — Privileged platform interfaces**
- A: APPLIES. Caffeine is itself the privileged interface: an unreviewed update mechanism / remote command channel holding a separate code copy. Evidence: live canister module hash vs. reproducible repo build; documented Caffeine account access controls.
- B: NOT-APPLICABLE for the shipping browser build; flips to APPLIES the moment the Android export is distributed anywhere, including test builds. Evidence: none now; gate Android on a full PLAT pass.

**PLAT005 — Hidden persistence**
- A: NEEDS-EVIDENCE. Declared localStorage ID is fine; must confirm no service worker/IndexedDB respawn. Evidence: grep for `serviceWorker.register`; Application tab on the live site.
- B: NEEDS-EVIDENCE. Godot HTML5 persists `user://` to IndexedDB, and PWA mode installs a service worker. Evidence: export preset `progressive_web_app/enabled`, live IndexedDB inspection.

**PLAT007 — No debug in release**
- A: NEEDS-EVIDENCE. Caffeine controls the build, not you. Evidence: fetch the deployed bundle — no sourcemaps, no React dev build, no HMR client.
- B: NEEDS-EVIDENCE. Confirm the itch.io build is a release export (Tools off, console output off — debug exports ship verbose logging); Worker has no debug routes/vars and a separate prod KV namespace. Evidence: export presets, wrangler.toml, boot the shipped build.

**Top vulnerability these checks miss:** /oracle is an unauthenticated proxy to paid LLM APIs. Attack: rotate source IPs (free proxy lists, IPv6 /64s) past the per-IP fixed-window limit, send max-token prompts to burn your Mistral/OpenRouter credit, and prompt-inject to exfiltrate the system prompt and tooling. If any LLM output or leaderboard string is ever rendered via innerHTML on smokegame.win, this escalates to stored content injection. Fix: global daily budget circuit-breaker, wallet-signature or proof-of-play gating, treat model output as untrusted.

**Triage challenges:**
- Supabase RLS: agree.
- SQL/NoSQL injection: agree for A; for B, swap it for a KV key-construction check — user input concatenated into KV keys enables cross-player record overwrite. Injection by another name.
- npm rate-limit checks: wrong for B. Your hand-rolled limiter on eventually-consistent KV admits read-modify-write races; concurrent bursts pass. Agree for A (Motoko).
- PLAT001–007 broadly: wrong. Browser analogues exist (service workers, PWA mode, Godot debug exports), and your biggest single exposure — Caffeine deploying code that isn't this repo — is a PLAT001-class finding you were about to skip.


======================================================================
## x-ai/grok-4.6  (54s tok=3655)
======================================================================

**AUTH003 (default-deny new routes)**
- (A) **NEEDS-EVIDENCE** — Motoko has no router; every new `public shared` func is world-callable. Evidence: full `.mo` interface + explicit caller guards / no stray `public`.
- (B) **APPLIES** — Worker pathname switch is an allow-list only if unmatched paths 404 and new arms are review-gated. Evidence: worker source showing default 404 and no wildcard proxy.

**API002 (Bearer on writes)**
- (A) **NOT-APPLICABLE** — Writes are ICP calls authenticated by II principal, not Bearer. Evidence: update methods reject `anonymous` / non-allowlisted callers.
- (B) **APPLIES** — `/score`,`/oracle`,`/lore`,`/track` are mutating and score is explicitly unauthenticated (no Bearer). Evidence: authn on writes or a written exception covering each route.

**INFRA003 (DB backups)**
- (A) **NOT-APPLICABLE** — No operator DB; canister state is IC-replicated. Evidence: no off-canister store; optional: snapshot/restore runbook.
- (B) **NEEDS-EVIDENCE** — KV is the datastore. CF replication ≠ backups/export. Evidence: KV export/versioning or documented accept of loss.

**PLAT001 (privileged platform interfaces)**
- (A) **NOT-APPLICABLE** — Browser SPA + static pages; no a11y-services/device-admin/native IPC. Evidence: no SW with extra scopes, no native wrappers.
- (B) **NEEDS-EVIDENCE** — Shipping target is HTML5, but an Android export exists. Evidence: Android export not shipped; no accessibility/overlay/admin/debug-bridge plugins in Godot project.

**PLAT005 (hidden persistence / resurrection)**
- (A) **NOT-APPLICABLE** — `localStorage` for anon analytics id is not process resurrection. Evidence: no service worker / background sync.
- (B) **NEEDS-EVIDENCE** — HTML5: SW/PWA; Android: sticky services. Evidence: no SW; Android export unused; Godot autoload not restarting killed processes.

**PLAT007 (no debug bridges/flags in release)**
- (A) **APPLIES** — Vite/React prod must drop source maps, React DevTools hooks, canister debug prints. Evidence: prod build flags + artifact grep.
- (B) **APPLIES** — Godot HTML5/Android debug, remote inspector, `window.ethereum` test hooks. Evidence: export presets `debug=false`; itch/Vercel artifacts without debug.

**Missed by these 6:** Compromised or drifted **client bundle** (itch.io/Vercel/Caffeine copy ≠ git) rewrites the `eth_sendTransaction` `to`/calldata for `mint()`. User signs it. No `approve` does not stop ETH/NFT drain to an attacker contract. AUTH/API/PLAT checks never inspect tx construction or the real deploy path.

**Triage challenge:** Supabase RLS / SQL injection / Express npm rate-limit checks: **correct N/A** (KV is not query-injected SQL; still don’t concatenate unsanitized KV keys). **PLAT001–007 are not broadly N/A:** PLAT007 applies to both release pipelines; PLAT001/005 apply until the Android export is gone and HTML5 has no SW. AUTH003 still matters for Worker/Motoko public surface. API002 **does** apply to (B) writes — “no Bearer” is a finding, not an exemption.


======================================================================
## google/gemini-3.7-flash  (16s tok=2159)
======================================================================

### 1. Checklist Review

#### AUTH003: Default-deny on new routes
* **Codebase A**: **APPLIES**. Motoko actor functions are public by default unless explicitly scoped.  
  * *Evidence*: Motoko actor source showing caller authentication guards or Candid interface confirming private helper functions.
* **Codebase B**: **APPLIES**. Cloudflare Worker router must explicitly reject unmatched methods/paths.  
  * *Evidence*: Worker routing code showing a default `return new Response("Not Found", { status: 404 })` block.

#### API002: Bearer auth on write API routes
* **Codebase A**: **NOT-APPLICABLE**. ICP relies on cryptographic principal verification (Internet Identity), not HTTP Bearer tokens.  
  * *Evidence*: Candid file verifying callers against `msg.caller` / II principal.
* **Codebase B**: **APPLIES** (Known Fail). `/score` is explicitly unauthenticated.  
  * *Evidence*: Formal risk sign-off document for unauthenticated
