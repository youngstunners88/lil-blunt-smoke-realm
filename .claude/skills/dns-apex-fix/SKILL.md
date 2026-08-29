---
name: dns-apex-fix
description: Fix smokegame.win apex domain (no A record, shows error). www resolves fine via ICP; apex needs DNS records. Provides manual NameSilo steps and API commands for when write access is enabled.
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
