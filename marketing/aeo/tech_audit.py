#!/usr/bin/env python3
"""Live technical audit of smokegame.win. Dependency-free, read-only, no spend.

  python3 marketing/aeo/tech_audit.py [--json]

Every row names the view it was measured in (crawler UA on the plain URL, or a
browser UA). Exit code = number of FAIL rows. WARN rows are judgement calls.
"""
import http.client
import json
import random
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

SITE = "https://www.smokegame.win"
CRAWLER = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
BROWSER = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"

rows = []


def row(level, area, msg):
    rows.append((level, area, msg))


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def req(url, ua=CRAWLER, follow=True, method="GET"):
    r = urllib.request.Request(url, headers={"User-Agent": ua, "Accept-Encoding": "identity"}, method=method)
    opener = urllib.request.build_opener() if follow else urllib.request.build_opener(NoRedirect)
    try:
        with opener.open(r, timeout=30) as resp:
            return resp.status, dict((k.lower(), v) for k, v in resp.headers.items()), resp.read().decode(errors="replace"), resp.geturl()
    except urllib.error.HTTPError as e:
        return e.code, dict((k.lower(), v) for k, v in e.headers.items()), "", url
    except Exception as e:  # noqa: BLE001
        return 0, {}, str(e), url


def text(html):
    html = re.sub(r"<(script|style|noscript).*?</\1>", " ", html, flags=re.S | re.I)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def tag(html, pat):
    m = re.search(pat, html, re.S | re.I)
    return m.group(1).strip() if m else ""


# ---- 0. DNS: www must be the ICP CNAME, never NameSilo's forwarder addresses (loop) ----------
FORWARDER_IPS = {"207.246.78.75", "45.77.75.133", "45.77.92.157"}


def dns(name, rtype):
    try:
        with urllib.request.urlopen(f"https://dns.google/resolve?name={name}&type={rtype}", timeout=20) as r:
            return [a["data"].rstrip(".") for a in json.load(r).get("Answer", [])]
    except Exception:  # noqa: BLE001
        return None


www_a = dns("www.smokegame.win", "A") or []
www_cname = dns("www.smokegame.win", "CNAME") or []
if FORWARDER_IPS & set(www_a):
    row("FAIL", "dns", f"www points at NameSilo forwarder IPs {sorted(FORWARDER_IPS & set(www_a))}: the site redirects to itself in a loop. Delete those www A records and restore CNAME www -> www.smokegame.win.icp1.io")
elif any("icp1.io" in c for c in www_cname + www_a):
    row("PASS", "dns", "www resolves through the ICP CNAME (www.smokegame.win.icp1.io)")
else:
    row("WARN", "dns", f"www records unexpected: A={www_a} CNAME={www_cname}")

# ---- 1. host and protocol redirects ----------------------------------------------------
for start in ["http://smokegame.win/", "https://smokegame.win/", "http://www.smokegame.win/"]:
    s, h, _, final = req(start, follow=False)
    hop = h.get("location", "")
    if s == 0:
        row("FAIL", "redirect", f"{start} does not answer (DNS has no A/AAAA for the bare domain, or the connection failed)")
        continue
    ok = s in (301, 308) and hop.startswith(SITE)
    row("PASS" if ok else ("WARN" if s in (302, 307) and hop.startswith(SITE) else "FAIL"),
        "redirect", f"{start} -> {s} {hop or '(none)'}" + ("" if ok else "  (want a permanent 301/308 to https://www)"))
s, h, body, final = req(SITE + "/")
row("PASS" if s == 200 else "FAIL", "redirect", f"https://www.smokegame.win/ -> {s}")

# ---- 2. soft-404 -----------------------------------------------------------------------
bogus = f"{SITE}/definitely-not-a-page-{random.randrange(10**9)}/"
for label, ua in (("crawler", CRAWLER), ("browser", BROWSER)):
    s, h, body, _ = req(bogus, ua)
    row("PASS" if s == 404 else "WARN", "soft-404",
        f"nonexistent URL -> HTTP {s} [{label} view]" + ("" if s == 404 else "  (platform serves the app shell for unknown paths; mitigated only by canonical)"))
s, h, body, _ = req(bogus)
if s == 200:
    robots_meta = tag(body, r'<meta[^>]+name="robots"[^>]+content="([^"]*)"')
    soft_can = tag(body, r'rel="canonical" href="([^"]+)"')
    row("WARN", "soft-404", f"soft-404 page meta robots = {robots_meta!r}; canonical = {soft_can!r}")

# ---- 3. robots + sitemap ---------------------------------------------------------------
s, h, robots, _ = req(SITE + "/robots.txt")
row("PASS" if s == 200 and "Sitemap:" in robots else "FAIL", "robots", f"robots.txt {s}, declares sitemap: {'Sitemap:' in robots}")
blocked = [ln for ln in robots.splitlines() if re.match(r"\s*Disallow:\s*/\s*$", ln)]
row("PASS" if not blocked else "FAIL", "robots", "no blanket Disallow: /" if not blocked else f"blanket disallow found: {blocked}")
agents = sorted(set(re.findall(r"User-agent:\s*(\S+)", robots)))
for want in ("GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"):
    row("PASS" if want in agents or "*" in agents else "WARN", "robots", f"{want} addressed (explicitly: {want in agents})")

s, h, sm, _ = req(SITE + "/sitemap.xml")
urls = []
try:
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    root = ET.fromstring(sm)
    urls = [(u.findtext("s:loc", namespaces=ns), u.findtext("s:lastmod", namespaces=ns)) for u in root.findall("s:url", ns)]
    row("PASS", "sitemap", f"sitemap.xml parses, {len(urls)} URLs")
except Exception as e:  # noqa: BLE001
    row("FAIL", "sitemap", f"sitemap.xml does not parse: {e}")
nonwww = [u for u, _ in urls if not u.startswith(SITE)]
row("PASS" if not nonwww else "FAIL", "sitemap", "all sitemap URLs use https://www" if not nonwww else f"non-www sitemap URLs: {nonwww}")
row("PASS" if not any("llms" in (u or "") for u, _ in urls) else "FAIL", "sitemap", "sitemap does not list llms.txt (founder rule)")

# ---- 4. every page: status, canonical, title, description, h1, JSON-LD, og -------------
home_h1 = ""
for loc, lastmod in urls:
    s, h, body, final = req(loc)
    if s != 200:
        row("FAIL", "page", f"{loc} -> {s}")
        continue
    can = tag(body, r'<link[^>]+rel="canonical"[^>]+href="([^"]+)"') or tag(body, r'<link[^>]+href="([^"]+)"[^>]+rel="canonical"')
    title = tag(body, r"<title>(.*?)</title>")
    desc = tag(body, r'<meta[^>]+name="description"[^>]+content="([^"]*)"')
    h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", body, re.S | re.I)
    ldj = re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', body, re.S | re.I)
    bad, soft = [], []
    if can.rstrip("/") != loc.rstrip("/"):
        bad.append(f"canonical {can!r} != URL")
    if not (15 <= len(title) <= 65):
        soft.append(f"title {len(title)}c (SERP shows ~60)")
    if not (70 <= len(desc) <= 165):
        soft.append(f"description {len(desc)}c (SERP shows ~155-160)")
    if loc != SITE + "/" and len(h1s) != 1:
        bad.append(f"{len(h1s)} h1 tags")
    if "noindex" in (tag(body, r'<meta[^>]+name="robots"[^>]+content="([^"]*)"') + h.get("x-robots-tag", "")).lower():
        bad.append("NOINDEX")
    for blob in ldj:
        try:
            json.loads(blob)
        except Exception:  # noqa: BLE001
            bad.append("JSON-LD does not parse")
    if lastmod and not re.match(r"\d{4}-\d{2}-\d{2}", lastmod):
        bad.append(f"lastmod {lastmod!r}")
    if "x-pre-rendered" in h:
        pass
    lvl = "FAIL" if bad else ("WARN" if soft else "PASS")
    row(lvl, "page", f"{loc.replace(SITE, '') or '/'}  title={len(title)}c desc={len(desc)}c jsonld={len(ldj)} " + "; ".join(bad + soft))

# ---- 5. homepage head: structured data and social card ---------------------------------
s, h, home, _ = req(SITE + "/")
types = []
for blob in re.findall(r'application/ld\+json[^>]*>(.*?)</script>', home, re.S | re.I):
    try:
        j = json.loads(blob)
        for node in (j if isinstance(j, list) else j.get("@graph", [j])):
            types.append(node.get("@type"))
    except Exception:  # noqa: BLE001
        pass
row("PASS" if types else "FAIL", "schema", f"homepage JSON-LD types: {types}")
n_h1 = len(re.findall(r"<h1[\s>]", home, re.I))
row("PASS" if n_h1 == 1 else "WARN", "schema", f"homepage has {n_h1} <h1> tags in the crawler view (one is the static fallback, one is the app hero)")
for p in ("og:title", "og:description", "og:image", "og:url", "twitter:card", "twitter:image"):
    v = tag(home, rf'<meta[^>]+(?:property|name)="{p}"[^>]+content="([^"]*)"')
    row("PASS" if v else "FAIL", "social", f"{p} present")
img = tag(home, r'<meta[^>]+property="og:image"[^>]+content="([^"]*)"')
if img:
    s, h, _, _ = req(img, method="HEAD")
    row("PASS" if s == 200 and h.get("content-type", "").startswith("image/") else "FAIL", "social", f"og:image {s} {h.get('content-type')} {h.get('content-length', '?')}B")
for href in sorted(set(re.findall(r'<link[^>]+rel="(?:shortcut )?(?:icon|apple-touch-icon)"[^>]+href="([^"]+)"', home))):
    u = urllib.parse.urljoin(SITE + "/", href)
    s, h, _, _ = req(u, method="HEAD")
    row("PASS" if s == 200 and "html" not in h.get("content-type", "") else "FAIL", "icons", f"head icon {href} -> {s} {h.get('content-type')}")

# ---- 6. response headers on / -----------------------------------------------------------
s, h, _, _ = req(SITE + "/", BROWSER)
for name, level in (("strict-transport-security", "WARN"), ("content-security-policy", "WARN"),
                    ("x-content-type-options", "WARN"), ("x-frame-options", "WARN"),
                    ("referrer-policy", "WARN"), ("permissions-policy", "WARN")):
    row("PASS" if name in h else level, "headers", f"{name}: {h.get(name, 'MISSING')[:90]}")
row("INFO", "headers", f"cache-control: {h.get('cache-control')}; content-encoding: {h.get('content-encoding')}; server: {h.get('server')}")
acao = h.get("access-control-allow-origin")
row("WARN" if acao == "*" else "PASS", "headers", f"access-control-allow-origin: {acao}")

# ---- 7. crawler/browser parity on static pages (cloaking check) --------------------------
for p in ("/about/", "/how-to-play/", "/faq/controls/"):
    a = text(req(SITE + p, CRAWLER)[2])
    b = text(req(f"{SITE}{p}?cb={random.randrange(10**9)}", BROWSER)[2])
    wa, wb = set(a.lower().split()), set(b.lower().split())
    overlap = len(wa & wb) / max(1, len(wa | wb))
    row("PASS" if overlap > 0.85 else "WARN", "parity", f"{p} crawler vs browser word overlap {overlap:.0%} (crawler {len(wa)}w, browser {len(wb)}w)")

# ---- 8. third-party destination ---------------------------------------------------------
s, h, _, final = req("https://youngstunners88.itch.io/smokerealm", BROWSER)
row("PASS" if s == 200 else "FAIL", "itch", f"itch page {s} (browser UA)")
s, h, _, _ = req("https://youngstunners88.itch.io/lil-blunt-adventure", BROWSER, follow=False)
row("PASS" if s in (301, 302) and "smokerealm" in h.get("location", "") else "WARN", "itch", f"old slug -> {s} {h.get('location')}")

# ---- report -----------------------------------------------------------------------------
order = {"FAIL": 0, "WARN": 1, "INFO": 2, "PASS": 3}
if "--json" in sys.argv:
    print(json.dumps(rows, indent=1))
else:
    print(f"\n  TECH AUDIT — {SITE}\n")
    for lvl, area, msg in sorted(rows, key=lambda r: order[r[0]]):
        print(f"  [{lvl:<4}] {area:<9} {msg}")
    c = {k: sum(1 for r in rows if r[0] == k) for k in order}
    print(f"\n  {c['PASS']} pass, {c['WARN']} warn, {c['FAIL']} fail, {c['INFO']} info\n")
sys.exit(sum(1 for r in rows if r[0] == "FAIL"))
