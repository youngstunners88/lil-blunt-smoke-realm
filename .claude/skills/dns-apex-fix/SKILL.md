---
name: dns-apex-fix
description: Fix smokegame.win DNS — the apex-to-www redirect and the www-to-itself infinite redirect loop that NameSilo URL forwarding causes by clobbering the www CNAME. Use when the site is unreachable, shows a redirect error, loops, or when checking whether DNS is actually serving the game.
---

# smokegame.win Apex DNS Fix

## Current state (verified 2026-08-29)

| Record | Type | Value | Status |
|---|---|---|---|
| `www` | CNAME | `www.smokegame.win.icp1.io` | working |
| `_canister-id.www` | TXT | `d4krc-cyaaa-aaaad-agw6a-cai` | working |
| `@` (apex) | — | none | error page |

Nameservers: ns1/ns2/ns3.dnsowl.com (NameSilo)
ICP boundary node IPs (verified 2026-08-29): 209.34.235.18, 38.96.31.203

## Fix A — Full ICP at apex (no redirect, both hostnames serve the site)

1. NameSilo dashboard -> Domain Manager -> smokegame.win -> DNS Records
2. Add A: Host=@, Value=209.34.235.18, TTL=3600
3. Add A: Host=@, Value=38.96.31.203, TTL=3600
4. Add TXT: Host=_canister-id, Value=d4krc-cyaaa-aaaad-agw6a-cai, TTL=3600
5. Add CNAME: Host=_acme-challenge, Value=_acme-challenge.smokegame.win.icp2.io, TTL=3600

ICP auto-provisions TLS for the apex once it sees the _canister-id TXT.

### Via API (requires write-enabled key — current key is read-only)

Enable write access: NameSilo -> Account -> API Manager -> edit key -> enable Modify DNS.

```bash
BASE="https://www.namesilo.com/api/dnsAddRecord?version=1&type=xml&key=${NAMESILO_API_KEY}&domain=smokegame.win"
curl -s "$BASE&rrtype=A&rrhost=@&rrvalue=209.34.235.18&rrttl=3600"
curl -s "$BASE&rrtype=A&rrhost=@&rrvalue=38.96.31.203&rrttl=3600"
curl -s "$BASE&rrtype=TXT&rrhost=_canister-id&rrvalue=d4krc-cyaaa-aaaad-agw6a-cai&rrttl=3600"
curl -s "$BASE&rrtype=CNAME&rrhost=_acme-challenge&rrvalue=_acme-challenge.smokegame.win.icp2.io&rrttl=3600"
```

## Fix B — 301 redirect at apex -> www (faster, no ICP cert wait)

NameSilo dashboard -> smokegame.win -> URL Forwarding
Add: Source=smokegame.win, Destination=https://www.smokegame.win/, Type=301 Permanent

No A record needed. NameSilo handles the redirect server-side. Propagates in minutes.

## Verification

```bash
curl -sI https://smokegame.win | head -5
# Fix A: HTTP/2 200
# Fix B: HTTP/2 301 Location: https://www.smokegame.win/
```

## Gotcha: URL forwarding clobbers the www CNAME (redirect loop)

Observed 2026-08-29. Enabling NameSilo **URL Forwarding** to redirect the apex
replaced the working `www` CNAME with A records pointing at NameSilo's HTTP
forwarding servers (207.246.78.75, 45.77.75.133, 45.77.92.157), and applied the
forward to `www` as well as `@`. Result: `www.smokegame.win` 301-redirects to
`https://www.smokegame.win/` — an **infinite loop**, and the game becomes
unreachable (worse than the original apex-only error).

There is **no nginx/Caddy/app redirect** in this stack — ICP serves the asset
canister directly and does no host-based redirect. Any self-redirect on `www`
is DNS: the `www` record is pointing at a forwarder instead of ICP.

Fix:
1. Delete the three `www` A records (the NameSilo forwarder IPs).
2. Re-add `www` as CNAME -> `www.smokegame.win.icp1.io`.
3. Scope the URL forward to `smokegame.win` (apex) ONLY.

Then apex forwards to www, and www serves the game via ICP. Verify:
```bash
curl -sI https://www.smokegame.win | grep -i '^HTTP'   # want 200, not 301
curl -sI https://smokegame.win | grep -iE '^HTTP|^location'  # want 301 -> www
```

If choosing Fix A (full ICP at apex) instead, skip forwarding entirely so this
cannot recur — but apex-on-ICP needs the domain registered with the boundary
node, not just DNS records.

## Verifying the loop is actually gone (do not take a browser at its word)

A browser will show a cached copy of the site long after DNS has broken, so
"it looks fine to me" is not evidence. Check the authoritative record and a
public resolver, not a page render:

```bash
# What NameSilo actually holds
curl -s "https://www.namesilo.com/api/dnsListRecords?version=1&type=xml&key=${NAMESILO_API_KEY}&domain=smokegame.win"

# What the world resolves — should be a CNAME to ICP, NOT the forwarder IPs
curl -s "https://dns.google/resolve?name=www.smokegame.win&type=A"

# The loop test: www must answer 200, never 301 to itself
curl -sI https://www.smokegame.win | grep -iE '^HTTP/2|^location'
```

**The forwarder IPs are `207.246.78.75`, `45.77.75.133`, `45.77.92.157`.** If
`www` resolves to any of those, the CNAME to ICP is still missing and the loop
is live regardless of what a browser shows.

Checked 2026-08-29 after the forwarding was set up: `www` still resolved to all
three forwarder IPs on both Google and Cloudflare public DNS, and
`https://www.smokegame.win` still returned `301 → https://www.smokegame.win/`.
`curl -L` gives up with exit 47, too many redirects.

**Why this outranks every other task when it is true.** A crawler that meets an
infinite redirect loop does not index the page — it drops the URL. Search
Console will report a redirect error rather than a ranking problem. So while
this is broken, every hour spent on content, structured data or AI visibility
banks nothing: there is no reachable page for any of it to attach to. Fix the
loop first, then resume.
